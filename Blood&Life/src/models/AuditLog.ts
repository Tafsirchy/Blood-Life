import mongoose, { Schema, Document, Model } from "mongoose";
import { IAuditLog } from "@/types";

export interface AuditLogDocument extends Omit<IAuditLog, "_id">, Document {}

const AuditLogSchema = new Schema<AuditLogDocument>(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "CONTACT_REVEAL",
        "ROLE_CHANGE",
        "REQUEST_VERIFIED",
        "REQUEST_DELETED",
        "STATUS_UPDATE",
        "DONATION_VERIFIED",
        "DONATION_DELETED",
        "FRAUD_REPORTED",
        "FRAUD_REVIEWED",
        "USER_CREATED",
        "USER_DELETED",
        "ACCOUNT_DELETED",
        "DONOR_DELETED",
        "INVENTORY_UPDATED",
      ],
    },
    performedBy: { type: String, required: true, index: true },
    targetId: { type: String, required: true, index: true },
    targetType: {
      type: String,
      required: true,
      enum: ["DONOR", "REQUEST", "USER", "FRAUD", "INVENTORY", "DONATION"],
    },
    ipAddress: { type: String },
    userAgent: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ targetId: 1, createdAt: -1 });

export const AuditLog: Model<AuditLogDocument> =
  mongoose.models.AuditLog ||
  mongoose.model<AuditLogDocument>("AuditLog", AuditLogSchema);

export default AuditLog;
