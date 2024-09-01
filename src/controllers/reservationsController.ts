import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/authentication";
import { AppointmentsService } from "../services/appointmentsService";
import { ProvidersService } from "../services/providersService";
import {
  IReservationsService,
  ReservationsService,
} from "../services/reservationsService";
import { appDB } from "../database/appointmentRepository";
import { resDB } from "../database/reservationRepository";

export const createReservation = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  void controller.createReservation(req, res, next);
};

export const confirmReservation = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  void controller.confirmReservation(req, res, next);
};

class ReservationController {
  constructor(private reservationService: IReservationsService) {
    const providerService = new ProvidersService();
    const appointmentService = new AppointmentsService(providerService, appDB);
    this.reservationService = new ReservationsService(
      appointmentService,
      resDB,
    );
  }

  async createReservation(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    const { appointmentId } = req.params;
    const clientId = req.user?.clientId;
    // this should be a redundant check
    if (!clientId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const reservation = this.reservationService.createReservation(
        clientId,
        appointmentId,
      );
      res.status(201).json(reservation);
    } catch (error) {
      next(error);
    }
  }

  async confirmReservation(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { reservationId } = req.params;
      const clientId = req.user?.clientId;
      if (!clientId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const reservation = this.reservationService.confirmReservation(
        clientId,
        reservationId,
      );
      res.status(200).json(reservation);
    } catch (error) {
      next(error);
    }
  }
}

const controller = new ReservationController(
  new ReservationsService(
    new AppointmentsService(new ProvidersService(), appDB),
    resDB,
  ),
);
