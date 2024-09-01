export interface IReservation {
  id: string;
  appointmentId: string;
  clientId: string;
  status: ReservationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum ReservationStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELED = "canceled",
  EXPIRED = "expired",
}
