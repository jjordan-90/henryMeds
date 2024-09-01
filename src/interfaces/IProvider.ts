export interface Provider {
  id: string;
  name: string;
  availableSlots: ISlot[];
}

export interface ISlot {
  start: Date;
  end: Date;
}
