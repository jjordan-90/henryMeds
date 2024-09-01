import { AddAppointmentsResponseDTO } from "../interfaces/dtos/AddAppointmentResponseDTO";
import { GetAppointmentsResponsDTO } from "../interfaces/dtos/GetAppointmentsResponseDTO";
import { IAppointmentsRepository } from "../interfaces/storage/IAppointmentsRepository";
import { IAppointment } from "../interfaces/IAppointment";
import { IProvidersService } from "./providersService";
import { v4 as uuid } from "uuid";
import { getSlotDurationMinutes } from "../config/environment";

export interface IAppointmentsService {
  getAvailableAppointments(
    providerId: string,
    page: number,
    limit: number,
    start?: Date,
    end?: Date,
  ): GetAppointmentsResponsDTO;
  addAppointmentSlot(
    providerId: string,
    start: Date,
    end: Date,
  ): AddAppointmentsResponseDTO;
  getAppointment(appointmentId: string): IAppointment | null;
  updateAppointment(appointment: IAppointment): void;
}

export class AppointmentsService implements IAppointmentsService {
  constructor(
    private providersService: IProvidersService,
    private appointmentsRepository: IAppointmentsRepository,
  ) {}

  public getAvailableAppointments(
    providerId: string,
    page: number,
    limit: number,
    start?: Date,
    end?: Date,
  ): GetAppointmentsResponsDTO {
    let filteredAppointments = this.appointmentsRepository.getByProvider(
      providerId,
      page,
      limit,
    );
    if (start) {
      filteredAppointments = filteredAppointments.filter(
        (app) => app.start.getTime() === start.getTime(),
      );
    }
    if (end) {
      filteredAppointments = filteredAppointments.filter(
        (app) => app.end.getTime() === end.getTime(),
      );
    }
    const totalCount = this.appointmentsRepository.getTotalCount(
      providerId,
      start,
      end,
    );
    return {
      appointments: filteredAppointments,
      pagination: { page, limit, totalCount },
    };
  }

  public addAppointmentSlot(
    providerId: string,
    start: Date,
    end: Date,
  ): AddAppointmentsResponseDTO {
    const provider = this.providersService.getProvider(providerId);
    if (!provider) {
      throw new Error("Provider not found.");
    }

    // Validate time range and slot duration
    this.validateTimeSlot(start, end);

    // Generate slots from provided range
    const slots = this.generateAppointmentSlots(providerId, start, end);

    // There would need to be some validation here
    // We don't want the slots to overlap
    // We also want to make sure there aren't any duplicates
    provider.availableSlots.push(...slots);

    // Save slots to database
    // This would really be a bulk update
    slots.forEach((slot) => {
      this.appointmentsRepository.add(slot);
    });

    // We are returning slots to enable client to confirm correctness
    return { appointments: slots };
  }

  getAppointment(appointmentId: string): IAppointment | null {
    return this.appointmentsRepository.getById(appointmentId);
  }

  updateAppointment(appointment: IAppointment): void {
    this.appointmentsRepository.update(appointment);
  }

  /**
   * This is a util to validate the submitted time range
   * A time range is valid if the start comes before the end
   * And if the duration is evenly divisible by the config SLOT_DURATION_MINUTES
   * @param start
   * @param end
   */
  private validateTimeSlot(start: Date, end: Date): void {
    if (start >= end) {
      throw new Error("Start time must be before end time.");
    }
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    if (durationMinutes % getSlotDurationMinutes() !== 0) {
      throw new Error("Time range must be divisible by slot duration.");
    }
  }

  /**
   * This is a util to create individual appointment slots from the range provided
   * The slot duration is configurable, would be an env var etc
   * @param providerId
   * @param start
   * @param end
   * @returns
   */
  private generateAppointmentSlots(
    providerId: string,
    start: Date,
    end: Date,
  ): IAppointment[] {
    const appointmentSlots: IAppointment[] = [];
    // I am using the Date object but we would really use a library like date-fns
    // This is a choice based on time to delivery
    let currentStart = new Date(start);
    while (currentStart < end) {
      const currentEnd = new Date(
        currentStart.getTime() + getSlotDurationMinutes() * 60 * 1000,
      );
      if (currentEnd > end) {
        break;
      }
      const slot: IAppointment = {
        id: uuid(),
        providerId,
        start: new Date(currentStart),
        end: new Date(currentEnd),
      };
      appointmentSlots.push(slot);
      currentStart = currentEnd;
    }
    return appointmentSlots;
  }
}
