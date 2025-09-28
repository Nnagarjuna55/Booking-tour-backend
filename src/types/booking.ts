export interface BookingDTO {
  _id?: string;
  clientId: string;
  placeId: string;
  slotId: string;
  quantity: number;
  status?:
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED"
    | "RESCHEDULED"
    | "COMPLETED";
  confirmationCode?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
