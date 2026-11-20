import mongoose, { Schema, Document, Model } from "mongoose";
import { IDonationRequest } from "@/types";

export interface DonationRequestDocument extends Omit<IDonationRequest, "_id">, Document {}

const DonationRequestSchema = new Schema<DonationRequestDocument>(
  {
    recipientName: { type: String, required: true, trim: true },
    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    unitsNeeded: { type: Number, default: 1, min: 1 },
    urgency: {
      type: String,
      enum: ["critical", "urgent", "standard"],
      default: "urgent",
    },
    hospital: { type: String, required: true, trim: true },
    division: { type: String, required: true },
    district: { type: String, required: true },
    upazila: { type: String, required: true },
    scheduledDate: { type: String, required: true },
    scheduledTime: { type: String, required: true },
    medicalReason: { type: String, trim: true },
    bloodComponent: {
      type: String,
      enum: ["whole_blood", "prbc", "platelets", "plasma"],
      default: "whole_blood",
    },
    message: { type: String, trim: true },
    prescriptionUrl: { type: String },
    isVerifiedGenuine: { type: Boolean, default: false },
    verifiedBy: { type: String },
    status: {
      type: String,
      enum: ["pending", "inprogress", "done", "canceled", "expired"],
      default: "pending",
    },
    expiresAt: { type: Date },
    fulfilledUnits: { type: Number, default: 0 },
    pledgedUnits: { type: Number, default: 0 },
    pledges: [
      {
        donorId: { type: String, required: true },
        donorName: { type: String, required: true },
        donorPhone: { type: String },
        units: { type: Number, default: 1 },
        status: { type: String, enum: ["pledged", "donated", "canceled"], default: "pledged" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    requesterId: { type: String, required: true },
    requesterName: { type: String, required: true },
    requesterEmail: { type: String, required: true },
    requesterPhone: { type: String, required: true },
    assignedDonorId: { type: String },
    assignedDonorName: { type: String },
  },
  {
    timestamps: true,
  }
);

// Compound Indices for Live Emergency Queue and Regional Dispatches
DonationRequestSchema.index({ status: 1, urgency: 1, createdAt: -1 });
DonationRequestSchema.index({ status: 1, expiresAt: 1 });
DonationRequestSchema.index({ expiresAt: 1, status: 1, urgency: 1 });
DonationRequestSchema.index({ status: 1, bloodGroup: 1, district: 1 });
DonationRequestSchema.index({ requesterEmail: 1, createdAt: -1 });
DonationRequestSchema.index({ isVerifiedGenuine: 1, createdAt: -1 });

export const DonationRequest: Model<DonationRequestDocument> =
  mongoose.models.DonationRequest ||
  mongoose.model<DonationRequestDocument>("DonationRequest", DonationRequestSchema);

export default DonationRequest;
