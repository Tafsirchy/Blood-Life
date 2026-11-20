import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser } from "@/types";

export interface UserDocument extends Omit<IUser, "_id">, Document {}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    phone: { type: String, required: true, trim: true },
    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    division: { type: String, required: true },
    district: { type: String, required: true },
    upazila: { type: String, required: true },
    avatarUrl: { type: String },
    role: {
      type: String,
      enum: ["Donor", "Requester", "Volunteer", "Admin"],
      default: "Donor",
    },
    status: {
      type: String,
      enum: ["Active", "Blocked"],
      default: "Active",
    },
    isAvailable: { type: Boolean, default: true },
    lastDonationDate: { type: Date },
    cooldownUntil: { type: Date },
    totalDonations: { type: Number, default: 0 },
    privacy: {
      hidePhoneNumber: { type: Boolean, default: true },
      requireApprovalBeforeReveal: { type: Boolean, default: false },
      notifyOnProfileView: { type: Boolean, default: true },
    },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    tokenVersion: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// High-Performance Compound Indices for $O(\log N)$ Geo and Donor Searches
UserSchema.index({ status: 1, isAvailable: 1, bloodGroup: 1, district: 1 });
UserSchema.index({ district: 1, upazila: 1 });
UserSchema.index({ cooldownUntil: 1 });
UserSchema.index({ role: 1 });

export const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);

export default User;
