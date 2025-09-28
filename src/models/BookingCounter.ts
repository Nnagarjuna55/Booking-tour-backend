import mongoose, { Document, Schema } from "mongoose";

export interface IBookingCounter extends Document {
  date: string; // YYYY-MM-DD
  count: number;
}

const BookingCounterSchema: Schema = new Schema<IBookingCounter>(
  {
    date: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BookingCounterSchema.index({ date: 1 }, { unique: true });

export default mongoose.model<IBookingCounter>("BookingCounter", BookingCounterSchema);
