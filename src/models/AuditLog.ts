import mongoose, { Document, Schema } from "mongoose";

export interface IAuditLog extends Document {
  actorId: mongoose.Types.ObjectId;
  action: string;
  entityType: string;
  entityId: string;
  changed: Record<string, any>;
  ip: string;
  userAgent: string;
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "Admin" },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    changed: { type: Object },
    ip: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export default mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
