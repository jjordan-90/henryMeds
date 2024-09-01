import { IReservation } from "../IReservation";

export interface IReservationsRepository {
  add(reservation: IReservation): void;
  getById(id: string): IReservation | null;
  update(reservation: IReservation): void;
}
