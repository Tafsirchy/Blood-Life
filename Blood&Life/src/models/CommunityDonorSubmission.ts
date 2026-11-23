import mongoose, { Schema, Document, Model } from "mongoose";
import { BloodGroup } from "@/types";

export interface ICommunityDonorSubmission {
  donorName: string;
  donorPhone: string;
  bloodGroup: BloodGroup;
  division: string;
  district: string;
  upazila: string;
  thana: string;
  age?: number;
  gender?: "male" | "female" | "other";
  lastDonationDate?: Date;
  submitterName: string;
  submitterPhone: string;
  submitterRelationship: string;
  status: "pending_review" | "approved" | "rejected";
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityDonorSubmissionDocument
  extends ICommunityDonorSubmission,
    Document {}

const CommunityDonorSubmissionSchema = new Schema<CommunityDonorSubmissionDocument>(
  {
    donorName: { type: String, required: true, trim: true },
    donorPhone: { type: String, required: true, trim: true, index: true },
    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    division: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true, index: true },
    upazila: { type: String, required: true, trim: true, index: true },
    thana: { type: String, required: true, trim: true },
    age: { type: Number, min: 18, max: 65 },
    gender: { type: String, enum: ["male", "female", "other"], default: "male" },
    lastDonationDate: { type: Date },
    submitterName: { type: String, required: true, trim: true },
    submitterPhone: { type: String, required: true, trim: true },
    submitterRelationship: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending_review", "approved", "rejected"],
      default: "pending_review",
      index: true,
    },
    adminNotes: { type: String, trim: true },
    reviewedBy: { type: String, trim: true },
    reviewedAt: { type: Date },
    createdUserId: { type: String },
  },
  {
    timestamps: true,
  }
);

// High-performance compound indices for 4-tier geo-search and review triage
CommunityDonorSubmissionSchema.index({ status: 1, bloodGroup: 1, district: 1 });
CommunityDonorSubmissionSchema.index({ status: 1, division: 1, district: 1, upazila: 1 });

export const CommunityDonorSubmission: Model<CommunityDonorSubmissionDocument> =
  mongoose.models.CommunityDonorSubmission ||
  mongoose.model<CommunityDonorSubmissionDocument>(
    "CommunityDonorSubmission",
    CommunityDonorSubmissionSchema
  );
