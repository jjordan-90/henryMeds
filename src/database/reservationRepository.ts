import { IReservation } from "../interfaces/IReservation";
import { IReservationsRepository } from "../interfaces/storage/IReservationsRepository";

class ReservationsRepository implements IReservationsRepository {
  private _reservations: Map<string, IReservation> = new Map();

  add(reservation: IReservation): void {
    this._reservations.set(reservation.id, reservation);
  }

  getById(id: string): IReservation | null {
    const reservation = this._reservations.get(id);
    return reservation || null;
  }

  update(reservation: IReservation): void {
    this._reservations.set(reservation.id, reservation);
  }
}

export const resDB = new ReservationsRepository();
