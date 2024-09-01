import { IAppointment } from "../../interfaces/IAppointment";
import { IReservation, ReservationStatus } from "../../interfaces/IReservation";
import { IReservationsRepository } from "../../interfaces/storage/IReservationsRepository";
import { IAppointmentsService } from "../appointmentsService";
import { ReservationsService } from "../reservationsService";
import { Mock, It, Times } from "moq.ts";

describe("ReservationService", () => {
  describe("createReservation", () => {
    it("should create a reservation if the appointment is available and valid", () => {
      const appointmentId = "appointment-123";
      const appointment = {
        id: appointmentId,
        start: new Date(Date.now() + 48 * 60 * 60 * 1000),
      } as any;
      const mockAppService = new Mock<IAppointmentsService>()
        .setup((s) => s.getAppointment(It.IsAny() as string))
        .returns(appointment)
        .setup((s) => s.updateAppointment(It.IsAny() as IAppointment))
        .returns(undefined);

      const mockResRepository = new Mock<IReservationsRepository>()
        .setup((s) => s.add(It.IsAny() as IReservation))
        .returns(undefined);

      const reservationService = new ReservationsService(
        mockAppService.object(),
        mockResRepository.object(),
      );
      const clientId = "client-123";

      const result = reservationService.createReservation(
        clientId,
        appointmentId,
      );

      expect(result).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          appointmentId,
          clientId,
          status: ReservationStatus.PENDING,
        }),
      );

      mockAppService.verify((i) => i.getAppointment, Times.Once());
      mockResRepository.verify((i) => i.add, Times.Once());
    });
    it("should throw an error if the appointment is already reserved", () => {
      const appointmentId = "appointment-123";
      const appointment: IAppointment = {
        id: appointmentId,
        start: new Date(Date.now() + 48 * 60 * 60 * 1000),
        reservedBy: "new-client",
      } as any;
      const mockAppService = new Mock<IAppointmentsService>()
        .setup((s) => s.getAppointment(It.IsAny() as string))
        .returns(appointment);

      const mockResRepository = new Mock<IReservationsRepository>();

      const reservationService = new ReservationsService(
        mockAppService.object(),
        mockResRepository.object(),
      );
      const clientId = "client-123";

      try {
        reservationService.createReservation(clientId, appointmentId);
      } catch (error) {
        expect(error).toBeDefined();
      }

      mockAppService.verify((i) => i.getAppointment, Times.Once());
      mockResRepository.verify((i) => i.add, Times.Never());
    });
    it("should throw an error if the reservation is attempted less than 24 hours in advance", () => {
      const appointmentId = "appointment-123";
      const appointment: IAppointment = {
        id: appointmentId,
        start: new Date(Date.now() + 1 * 60 * 60 * 1000),
      } as any;
      const mockAppService = new Mock<IAppointmentsService>()
        .setup((s) => s.getAppointment(It.IsAny() as string))
        .returns(appointment);

      const mockResRepository = new Mock<IReservationsRepository>();

      const reservationService = new ReservationsService(
        mockAppService.object(),
        mockResRepository.object(),
      );
      const clientId = "client-123";

      try {
        reservationService.createReservation(clientId, appointmentId);
      } catch (error) {
        expect(error).toBeDefined();
      }

      mockAppService.verify((i) => i.getAppointment, Times.Once());
      mockResRepository.verify((i) => i.add, Times.Never());
    });
  });
  describe("Confirm Reservation", () => {
    it("should confirm a reservation if it is pending", () => {
      const reservationId = "reservation-123";
      const reservation: IReservation = {
        id: reservationId,
        status: ReservationStatus.PENDING,
      } as any;
      const mockAppService = new Mock<IAppointmentsService>();
      const mockResRepository = new Mock<IReservationsRepository>()
        .setup((s) => s.getById(It.IsAny() as string))
        .returns(reservation)
        .setup((s) => s.update(It.IsAny() as IReservation))
        .returns(undefined);

      const reservationService = new ReservationsService(
        mockAppService.object(),
        mockResRepository.object(),
      );
      const clientId = "client-123";

      const result = reservationService.confirmReservation(
        clientId,
        reservationId,
      );

      expect(result.reservation.status).toStrictEqual(
        ReservationStatus.CONFIRMED,
      );
      mockResRepository.verify((i) => i.getById, Times.Once());
      mockResRepository.verify((i) => i.update, Times.Once());
    });
    it("should throw an error if the reservation doesn't exist", () => {
      const reservationId = "reservation-123";
      const mockAppService = new Mock<IAppointmentsService>();
      const mockResRepository = new Mock<IReservationsRepository>()
        .setup((s) => s.getById(It.IsAny() as string))
        .returns(null);

      const reservationService = new ReservationsService(
        mockAppService.object(),
        mockResRepository.object(),
      );
      const clientId = "client-123";

      try {
        reservationService.confirmReservation(clientId, reservationId);
      } catch (error) {
        expect(error).toBeDefined();
      }
      mockResRepository.verify((i) => i.getById, Times.Once());
      mockResRepository.verify((i) => i.update, Times.Never());
    });
    it("should throw an error if the reservation is expired", () => {
      const reservationId = "reservation-123";
      const reservation: IReservation = {
        id: reservationId,
        status: ReservationStatus.EXPIRED,
      } as any;
      const mockAppService = new Mock<IAppointmentsService>();
      const mockResRepository = new Mock<IReservationsRepository>()
        .setup((s) => s.getById(It.IsAny() as string))
        .returns(reservation)
        .setup((s) => s.update(It.IsAny() as IReservation))
        .returns(undefined);

      const reservationService = new ReservationsService(
        mockAppService.object(),
        mockResRepository.object(),
      );
      const clientId = "client-123";

      try {
        reservationService.confirmReservation(clientId, reservationId);
      } catch (error) {
        expect(error).toBeDefined();
      }
      mockResRepository.verify((i) => i.getById, Times.Once());
      mockResRepository.verify((i) => i.update, Times.Never());
    });
  });
});
