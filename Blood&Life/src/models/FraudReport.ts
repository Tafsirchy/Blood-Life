import mongoose, { Schema, Document, Model } from "mongoose";
import { IFraudReport } from "@/types";

export interface FraudReportDocument extends Omit<IFraudReport, "_id">, Document {}

const FraudReportSchema = new Schema<FraudReportDocument>(
  {
    reportedPhone: { type: String, required: true, trim: true, index: true },
    reportedName: { type: String, trim: true },
    scamCategory: {
      type: String,
      required: true,
      enum: [
        "advance_cash_scam",
        "fake_donor_noshow",
        "blood_broker",
        "false_screening",
        "harassment",
        "other",
      ],
      default: "advance_cash_scam",
    },
    hospitalName: { type: String, trim: true },
    district: { type: String, trim: true },
    description: { type: String, required: true, trim: true },
    evidenceDetails: { type: String, trim: true },
    reporterName: { type: String, required: true, trim: true },
    reporterPhone: { type: String, required: true, trim: true },
    reporterUserId: { type: String },
    status: {
      type: String,
      enum: ["pending_review", "investigating", "confirmed_fraud", "dismissed"],
      default: "pending_review",
      index: true,
    },
    adminNotes: { type: String, trim: true },
    incidentDate: { type: Date, default: Date.now },
    bannedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// High-speed indices for phone verification and category filtering
FraudReportSchema.index({ reportedPhone: 1, status: 1 });
FraudReportSchema.index({ status: 1, createdAt: -1 });

export const FraudReport: Model<FraudReportDocument> =
  mongoose.models.FraudReport ||
  mongoose.model<FraudReportDocument>("FraudReport", FraudReportSchema);
