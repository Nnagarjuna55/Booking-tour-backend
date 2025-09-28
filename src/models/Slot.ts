import mongoose, { Document, Schema } from "mongoose";

export interface ISlot extends Document {
  placeId: mongoose.Types.ObjectId;
  startAt: Date;
  endAt: Date;
  capacity: number;
  bookedCount: number;
  status: "ACTIVE" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
}

const SlotSchema: Schema = new Schema<ISlot>(
  {
    placeId: { type: Schema.Types.ObjectId, ref: "Place", required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    capacity: { type: Number, required: true },
    bookedCount: { type: Number, default: 0 },
    status: { type: String, enum: ["ACTIVE", "CANCELLED"], default: "ACTIVE" },
  },
  { timestamps: true }
);

SlotSchema.index({ placeId: 1, startAt: 1, endAt: 1 }, { unique: true });

export default mongoose.model<ISlot>("Slot", SlotSchema);
