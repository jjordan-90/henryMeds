import { IAppointment } from "../interfaces/IAppointment";
import { IAppointmentsRepository } from "../interfaces/storage/IAppointmentsRepository";

class AppointmentsRepository implements IAppointmentsRepository {
  private _appointments: Map<string, IAppointment> = new Map();

  add(appointment: IAppointment): void {
    this._appointments.set(appointment.id, appointment);
  }

  getById(id: string): IAppointment | null {
    return this._appointments.get(id) || null;
  }

  getByProvider(
    providerId: string,
    page: number,
    limit: number,
  ): IAppointment[] {
    // We are simulating a db query here with pagination
    const offset = (page - 1) * limit;
    const paginatedAppointments = Array.from(this._appointments.values())
      .filter((app) => app.providerId === providerId)
      .slice(offset, offset + limit);
    return paginatedAppointments;
  }

  getTotalCount(providerId: string, start?: Date, end?: Date): number {
    // Simulate a total count query (including date filters if provided)
    let filteredAppointments = Array.from(this._appointments.values()).filter(
      (app) => app.providerId === providerId,
    );
    if (start) {
      filteredAppointments = filteredAppointments.filter(
        (appointment) => new Date(appointment.start) >= start,
      );
    }
    if (end) {
      filteredAppointments = filteredAppointments.filter(
        (appointment) => new Date(appointment.end) <= end,
      );
    }
    return filteredAppointments.length;
  }

  update(appointment: IAppointment): void {
    if (!this._appointments.has(appointment.id)) {
      throw new Error("Appointment not found.");
    }
    this._appointments.set(appointment.id, appointment);
  }
}

export const appDB = new AppointmentsRepository();
