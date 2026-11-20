import mongoose, { Schema, Document, Model } from "mongoose";

export interface PushSubscriptionDocument extends Document {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId?: string;
  bloodGroup?: string;
  district?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PushSubscriptionSchema = new Schema<PushSubscriptionDocument>(
  {
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userId: { type: String },
    bloodGroup: { type: String },
    district: { type: String },
  },
  {
    timestamps: true,
  }
);

PushSubscriptionSchema.index({ district: 1, bloodGroup: 1 });

export const PushSubscription: Model<PushSubscriptionDocument> =
  mongoose.models.PushSubscription ||
  mongoose.model<PushSubscriptionDocument>("PushSubscription", PushSubscriptionSchema);

export default PushSubscription;
