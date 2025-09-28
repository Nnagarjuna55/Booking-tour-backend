import mongoose, { Document, Schema } from "mongoose";

export interface IAdmin extends Document {
  email: string;
  password: string;
  role: "SUPER_ADMIN" | "STAFF";
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema: Schema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["SUPER_ADMIN", "STAFF"], default: "STAFF" },
  },
  { timestamps: true }
);

export default mongoose.model<IAdmin>("Admin", AdminSchema);
