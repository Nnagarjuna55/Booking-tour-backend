import mongoose, { Document, Schema } from "mongoose";

export interface ISlot extends Document {
  placeId: mongoose.Types.ObjectId;
  startAt: Date;
  endAt: Date;
  capacity: number;
  bookedCount: number;
  status: "ACTIVE" | "CANCELLED";
  // Backwards-compatible fields: some deployments previously used `date` and `startTime` fields
  // and created a unique index on (placeId, date, startTime). Populate these from startAt
  // to avoid duplicate-null unique index errors.
  date?: string;
  startTime?: string;
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
    // Backwards-compatible fields
    date: { type: String },
    startTime: { type: String },
  },
  { timestamps: true }
);

// Preserve original uniqueness on startAt/endAt (if present) and also provide a
// backwards-compatible unique index (placeId, date, startTime) because older
// deployments may have created that index. Populating date/startTime prevents
// duplicate-null index errors.
SlotSchema.index({ placeId: 1, startAt: 1, endAt: 1 }, { unique: true });
SlotSchema.index({ placeId: 1, date: 1, startTime: 1 }, { unique: true });

// Pre-validate hook: populate `date` and `startTime` from `startAt` when available.
SlotSchema.pre("validate", function (next) {
  try {
    // `this` may be a plain object or a Document; coerce to any
    const doc: any = this;
    if (doc.startAt) {
      const d = new Date(doc.startAt);
      if (!isNaN(d.getTime())) {
        // ISO date (YYYY-MM-DD)
        doc.date = d.toISOString().slice(0, 10);
        // ISO time (HH:MM:SS) - using UTC to match previous stored values
        doc.startTime = d.toISOString().slice(11, 19);
      }
    }
  } catch (_e) {
    // ignore
  }
  next();
});

export default mongoose.model<ISlot>("Slot", SlotSchema);
