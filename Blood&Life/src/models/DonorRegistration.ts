import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDonorRegistrationDocument extends Document {
  fullName: string;
  gender: "male" | "female" | "other";
  dateOfBirth: string;
  age: number;
  occupation: string;
  presentAddress: string;
  permanentAddress: string;
  division: string;
  district: string;
  upazila: string;
  phone: string;
  email: string;
  bloodGroup: string;
  // Section 2: Donation History
  hasDonatedBefore: boolean;
  lastDonationDate?: string;
  hadAdverseReaction: boolean;
  adverseReactionDetails?: string;
  // Section 3: Medical & Lifestyle Questionnaire
  medicalHistory: {
    hasRecentIllness: boolean;
    recentIllnessDetails?: string;
    hasChronicDisease: boolean;
    chronicDiseaseDetails?: string;
    hasInfectiousDisease: boolean;
    takingMedications: boolean;
    medicationDetails?: string;
    hadRecentSurgeryOrTattoo: boolean;
    // Female Specific
    isPregnant: boolean;
    isLactating: boolean;
    isMenstruating: boolean;
  };
  // Section 4: Physical Examination (Self-reported / Clinic verified)
  physicalExam: {
    weightKg: number;
    bloodPressure?: string;
    pulseBpm?: number;
    hemoglobinLevel?: number;
    temperatureNormal: boolean;
  };
  // Section 5: Consent & Legal Declaration
  consent: {
    voluntaryAgreement: boolean;
    truthfulDeclaration: boolean;
    emergencyContactConsent: boolean;
    digitalSignature: string;
    signedAt: Date;
  };
  eligibilityStatus: "eligible" | "temporary_deferral" | "permanent_deferral";
  eligibilityNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DonorRegistrationSchema = new Schema<IDonorRegistrationDocument>(
  {
    fullName: { type: String, required: true, trim: true },
    gender: { type: String, required: true, enum: ["male", "female", "other"] },
    dateOfBirth: { type: String, required: true },
    age: { type: Number, required: true, min: 18, max: 65 },
    occupation: { type: String, trim: true },
    presentAddress: { type: String, required: true, trim: true },
    permanentAddress: { type: String, trim: true },
    division: { type: String, required: true },
    district: { type: String, required: true },
    upazila: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"],
    },
    hasDonatedBefore: { type: Boolean, default: false },
    lastDonationDate: { type: String },
    hadAdverseReaction: { type: Boolean, default: false },
    adverseReactionDetails: { type: String, trim: true },
    medicalHistory: {
      hasRecentIllness: { type: Boolean, default: false },
      recentIllnessDetails: { type: String },
      hasChronicDisease: { type: Boolean, default: false },
      chronicDiseaseDetails: { type: String },
      hasInfectiousDisease: { type: Boolean, default: false },
      takingMedications: { type: Boolean, default: false },
      medicationDetails: { type: String },
      hadRecentSurgeryOrTattoo: { type: Boolean, default: false },
      isPregnant: { type: Boolean, default: false },
      isLactating: { type: Boolean, default: false },
      isMenstruating: { type: Boolean, default: false },
    },
    physicalExam: {
      weightKg: { type: Number, required: true, min: 40 },
      bloodPressure: { type: String },
      pulseBpm: { type: Number },
      hemoglobinLevel: { type: Number },
      temperatureNormal: { type: Boolean, default: true },
    },
    consent: {
      voluntaryAgreement: { type: Boolean, required: true },
      truthfulDeclaration: { type: Boolean, required: true },
      emergencyContactConsent: { type: Boolean, required: true },
      digitalSignature: { type: String, required: true },
      signedAt: { type: Date, default: Date.now },
    },
    eligibilityStatus: {
      type: String,
      enum: ["eligible", "temporary_deferral", "permanent_deferral"],
      default: "eligible",
    },
    eligibilityNotes: { type: String },
  },
  {
    timestamps: true,
  }
);

DonorRegistrationSchema.index({ phone: 1 });
DonorRegistrationSchema.index({ email: 1 });
DonorRegistrationSchema.index({ bloodGroup: 1, district: 1, eligibilityStatus: 1 });

export const DonorRegistration: Model<IDonorRegistrationDocument> =
  mongoose.models.DonorRegistration ||
  mongoose.model<IDonorRegistrationDocument>("DonorRegistration", DonorRegistrationSchema);

export default DonorRegistration;