export interface IAppointment {
  id: string;
  providerId: string;
  start: Date;
  end: Date;
  reservedBy?: string;
  reservedAt?: Date;
}
