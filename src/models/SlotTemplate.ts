import mongoose, { Document, Schema } from "mongoose";

export interface ISlotTemplate extends Document {
  placeId: mongoose.Types.ObjectId;
  // store times as ISO time strings or Date with today's date ignored
  startTime: string; // e.g. "10:00"
  endTime: string; // e.g. "12:00"
  capacity: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SlotTemplateSchema: Schema = new Schema<ISlotTemplate>(
  {
    placeId: { type: Schema.Types.ObjectId, ref: "Place", required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    capacity: { type: Number, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISlotTemplate>("SlotTemplate", SlotTemplateSchema);
