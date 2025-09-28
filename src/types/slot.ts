export interface SlotDTO {
  _id?: string;
  placeId: string;
  startAt: Date;
  endAt: Date;
  capacity: number;
  bookedCount?: number;
  status?: "ACTIVE" | "CANCELLED";
  createdAt?: Date;
  updatedAt?: Date;
}
