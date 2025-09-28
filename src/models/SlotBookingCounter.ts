import mongoose, { Document, Schema } from "mongoose";

export interface ISlotBookingCounter extends Document {
  date: string; // YYYY-MM-DD
  slotId: mongoose.Types.ObjectId;
  count: number;
}

const SlotBookingCounterSchema: Schema = new Schema<ISlotBookingCounter>(
  {
    date: { type: String, required: true },
    slotId: { type: Schema.Types.ObjectId, ref: "Slot", required: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SlotBookingCounterSchema.index({ date: 1, slotId: 1 }, { unique: true });

export default mongoose.model<ISlotBookingCounter>("SlotBookingCounter", SlotBookingCounterSchema);
