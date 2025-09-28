import mongoose, { Document, Schema } from "mongoose";

export interface IClient extends Document {
  fullName: string;
  email: string;
  phone: string;
  groupSize: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema = new Schema<IClient>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    groupSize: { type: Number, default: 1 },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IClient>("Client", ClientSchema);
