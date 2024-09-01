import { IAppointment } from "../IAppointment";

export interface IAppointmentsRepository {
  add(appointment: IAppointment): void;
  getById(id: string): IAppointment | null;
  getByProvider(
    providerId: string,
    page: number,
    limit: number,
  ): IAppointment[];
  getTotalCount(providerId: string, start?: Date, end?: Date): number;
  update(appointment: IAppointment): void;
}
