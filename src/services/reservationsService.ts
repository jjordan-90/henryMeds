import { IAppointment } from "../interfaces/IAppointment";
import { IReservation, ReservationStatus } from "../interfaces/IReservation";
import { IAppointmentsService } from "./appointmentsService";
import { v4 as uuid } from "uuid";
import schedule from "node-schedule";
import { IReservationsRepository } from "../interfaces/storage/IReservationsRepository";
import { CreateReservationResponseDTO } from "../interfaces/dtos/CreateReservationResponseDTO";
import { ConfirmReservationResponseDTO } from "../interfaces/dtos/ConfirmReservationResponseDTO";
import {
  getReservationExpiryMinutes,
  getMinAdvanceBookingHours,
} from "../config/environment";

export interface IReservationsService {
  createReservation(
    clientId: string,
    appointmentId: string,
  ): CreateReservationResponseDTO;
  confirmReservation(
    clientId: string,
    reservationId: string,
  ): ConfirmReservationResponseDTO;
}

export class ReservationsService implements IReservationsService {
  constructor(
    private _appointmentService: IAppointmentsService,
    private _reservationRepository: IReservationsRepository,
  ) {}

  public createReservation(
    clientId: string,
    appointmentId: string,
  ): CreateReservationResponseDTO {
    // Lookup the appointment slot to reserve
    const appointment = this._appointmentService.getAppointment(appointmentId);
    // These would be custom errors
    if (!appointment || appointment?.reservedBy) {
      throw new Error("Appointment slot unavailable.");
    }
    if (!this.isAppointmentTimeValid(appointment)) {
      throw new Error("Reservations must be made 24 hours in advance.");
    }
    // Create a new reservation record
    const currentTime = new Date();
    const reservation: IReservation = {
      id: uuid(),
      appointmentId,
      clientId,
      status: ReservationStatus.PENDING,
      createdAt: currentTime,
      updatedAt: currentTime,
    };

    // This would be all done in a transaction to handle concurrent access
    this._reservationRepository.add(reservation);

    // Update the appointment slot to reflect the reservation
    appointment.reservedAt = currentTime;
    appointment.reservedBy = clientId;

    // Write the updated appointment to the db
    this._appointmentService.updateAppointment(appointment);

    // Schedule the expiration to take place if unconfirmed
    this.scheduleExpiration(reservation);

    // Return the reservation for confirmation to client
    return this.reservationToDTO(reservation);
  }

  public confirmReservation(
    clientId: string,
    reservationId: string,
  ): ConfirmReservationResponseDTO {
    // Again we are assuming that the clientId is exposed to us
    // We want to validate that the clientId making the confirmation matches the clientId on the reservation
    const reservation = this._reservationRepository.getById(reservationId);
    // if the reservation has been canceled because of the time elapsed we would use a different exception
    if (!reservation) {
      throw new Error("Reservation not found.");
    }
    if (reservation.status === ReservationStatus.EXPIRED) {
      throw new Error("Reservation expired.");
    }
    // We only need to modify the reservation if the status is still pending
    if (reservation.status === ReservationStatus.PENDING) {
      // Update the status of the reservation
      reservation.status = ReservationStatus.CONFIRMED;
      // Update the time
      reservation.updatedAt = new Date();
      // Write the update to the db
      this._reservationRepository.update(reservation);
    }
    // return the reservation for confirmation
    return { reservation };
  }

  /**
   * This is a simple util to determine if the appointment start time is far enough in the future to book
   * @param appointment
   * @returns true if appointment start time >= 24 hrs from current time
   */
  private isAppointmentTimeValid(appointment: IAppointment): boolean {
    const currentTime = Date.now();
    const appointmentStartTime = appointment.start.getTime();
    const minAdvanceHours = getMinAdvanceBookingHours();
    const advanceHoursInMilli = minAdvanceHours * 60 * 60 * 1000;
    return appointmentStartTime - currentTime >= advanceHoursInMilli;
  }

  /**
   * This is a util to schedule a job to expire the reservation
   * It uses node-schedule https://www.npmjs.com/package/node-schedule
   * @param reservation
   */
  private scheduleExpiration(reservation: IReservation): void {
    // get config expiry time amount and convert to milliseconds
    const expiryTimeInMilli = getReservationExpiryMinutes() * 60 * 1000;
    // use the reservation createdAt time + expiry time
    const expirationTime = new Date(
      reservation.createdAt?.getTime() + expiryTimeInMilli,
    );
    schedule.scheduleJob(reservation.id, expirationTime, () => {
      if (reservation.status === ReservationStatus.PENDING) {
        // update the reservation
        reservation.status = ReservationStatus.EXPIRED;
        reservation.updatedAt = new Date();
        this._reservationRepository.update(reservation);
        // update the appointment slot
        const appointment = this._appointmentService.getAppointment(
          reservation.appointmentId,
        );
        delete appointment?.reservedBy;
        delete appointment?.reservedAt;
        this._appointmentService.updateAppointment(appointment as IAppointment);
      }
    });
  }

  private reservationToDTO(
    reservation: IReservation,
  ): CreateReservationResponseDTO {
    return {
      id: reservation.id,
      appointmentId: reservation.appointmentId,
      clientId: reservation.clientId,
      createdAt: reservation.createdAt,
      status: reservation.status,
    };
  }
}
