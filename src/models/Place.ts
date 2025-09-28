import mongoose, { Document, Schema } from "mongoose";

export interface IPlace extends Document {
  name: string;
  location: string;
  description: string;
  images: string[];
  email?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlaceSchema: Schema = new Schema<IPlace>(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String },
    images: [{ type: String }],
  email: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPlace>("Place", PlaceSchema);
