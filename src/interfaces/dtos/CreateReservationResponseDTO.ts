import { ReservationStatus } from "../IReservation";

export interface CreateReservationResponseDTO {
  id: string;
  appointmentId: string;
  clientId: string;
  status: ReservationStatus;
  createdAt: Date;
}
