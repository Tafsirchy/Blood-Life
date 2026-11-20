import mongoose, { Schema, Document, Model } from "mongoose";
import { ITransfusionLog } from "@/types";

export interface TransfusionLogDocument extends Omit<ITransfusionLog, "_id">, Document {}

const TransfusionLogSchema = new Schema<TransfusionLogDocument>(
  {
    requestId: { type: String, required: true, index: true },
    donorId: { type: String, required: true, index: true },
    recipientName: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    hospital: { type: String, required: true },
    completedAt: { type: Date, default: Date.now },
    certificateId: { type: String, required: true, unique: true },
    verifiedByVolunteerId: { type: String },
  },
  {
    timestamps: true,
  }
);

TransfusionLogSchema.index({ donorId: 1, completedAt: -1 });

export const TransfusionLog: Model<TransfusionLogDocument> =
  mongoose.models.TransfusionLog ||
  mongoose.model<TransfusionLogDocument>("TransfusionLog", TransfusionLogSchema);

export default TransfusionLog;
