import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/authentication";
import { appDB } from "../database/appointmentRepository";
import {
  IAppointmentsService,
  AppointmentsService,
} from "../services/appointmentsService";
import { ProvidersService } from "../services/providersService";

export const getAvailableAppointments = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  void controller.getAvailableAppointments(req, res, next);
};

export const addAppointmentSlot = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  void controller.addAppointmentSlot(req, res, next);
};

class AppointmentController {
  constructor(private appointmentService: IAppointmentsService) {
    const providerService = new ProvidersService();
    this.appointmentService = new AppointmentsService(providerService, appDB);
  }

  async getAvailableAppointments(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { providerId } = req.params;

      const page = parseInt(req.query.page as string);
      const limit = parseInt(req.query.limit as string);
      const startDate = req.query.start as string | undefined;
      const endDate = req.query.end as string | undefined;

      // Validate that page and limit are provided and are positive integers
      if (isNaN(page) || page < 1) {
        return res
          .status(400)
          .json({ error: "Page must be a positive integer." });
      }

      if (isNaN(limit) || limit < 1) {
        return res
          .status(400)
          .json({ error: "Limit must be a positive integer." });
      }

      // Parse date-time filters, if provided
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;

      // Validate date-time filters, if provided
      if (start && isNaN(start.getTime())) {
        return res.status(400).json({ error: "Invalid start date format" });
      }

      if (end && isNaN(end.getTime())) {
        return res.status(400).json({ error: "Invalid end date format" });
      }

      const appointments = this.appointmentService.getAvailableAppointments(
        providerId,
        page,
        limit,
        start,
        end,
      );
      res.status(200).json(appointments);
    } catch (error) {
      next(error);
    }
  }

  async addAppointmentSlot(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const providerId = req.body.providerId;
      // This should be a redundant check
      if (!providerId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const startTime = req.body.start as string;
      const endTime = req.body.end as string;

      // This would need to be more robust validation
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      const appointmentSlot = this.appointmentService.addAppointmentSlot(
        providerId,
        start,
        end,
      );
      res.status(201).json(appointmentSlot);
    } catch (error) {
      next(error);
    }
  }
}

const controller = new AppointmentController(
  new AppointmentsService(new ProvidersService(), appDB),
);
