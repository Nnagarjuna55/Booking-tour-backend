import mongoose, { Document, Schema } from "mongoose";

export interface IBooking extends Document {
  clientId: mongoose.Types.ObjectId;
  placeId: mongoose.Types.ObjectId;
  slotId: mongoose.Types.ObjectId;
  quantity: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "RESCHEDULED" | "COMPLETED";
  confirmationCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema<IBooking>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    placeId: { type: Schema.Types.ObjectId, ref: "Place", required: true },
    slotId: { type: Schema.Types.ObjectId, ref: "Slot", required: true },
    quantity: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "RESCHEDULED", "COMPLETED"],
      default: "PENDING",
    },
    confirmationCode: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

BookingSchema.index({ slotId: 1, clientId: 1 });

export default mongoose.model<IBooking>("Booking", BookingSchema);
