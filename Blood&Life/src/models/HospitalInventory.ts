import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHospitalInventory {
  _id: string;
  hospitalName: string;
  division: string;
  district: string;
  contactNumber: string;
  inventory: {
    "A+"?: number;
    "A-"?: number;
    "B+"?: number;
    "B-"?: number;
    "AB+"?: number;
    "AB-"?: number;
    "O+"?: number;
    "O-"?: number;
  };
  lastReportedAt: Date;
}

export interface HospitalInventoryDocument extends Omit<IHospitalInventory, "_id">, Document {}

const HospitalInventorySchema = new Schema<HospitalInventoryDocument>(
  {
    hospitalName: { type: String, required: true, trim: true },
    division: { type: String, required: true },
    district: { type: String, required: true, index: true },
    contactNumber: { type: String, required: true },
    inventory: {
      "A+": { type: Number, default: 0 },
      "A-": { type: Number, default: 0 },
      "B+": { type: Number, default: 0 },
      "B-": { type: Number, default: 0 },
      "AB+": { type: Number, default: 0 },
      "AB-": { type: Number, default: 0 },
      "O+": { type: Number, default: 0 },
      "O-": { type: Number, default: 0 },
    },
    lastReportedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const HospitalInventory: Model<HospitalInventoryDocument> =
  mongoose.models.HospitalInventory ||
  mongoose.model<HospitalInventoryDocument>("HospitalInventory", HospitalInventorySchema);

export default HospitalInventory;
