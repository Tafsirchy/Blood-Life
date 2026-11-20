import mongoose, { Schema, Document, Model } from "mongoose";

export type NotificationCategory =
  | "MATCH"
  | "VERIFIED"
  | "PLEDGE"
  | "COOLDOWN"
  | "SECURITY"
  | "SYSTEM";

export interface INotification extends Document {
  recipientId: string;
  category: NotificationCategory;
  titleEn: string;
  titleBn: string;
  messageEn: string;
  messageBn: string;
  link?: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: ["MATCH", "VERIFIED", "PLEDGE", "COOLDOWN", "SECURITY", "SYSTEM"],
      required: true,
      default: "SYSTEM",
    },
    titleEn: { type: String, required: true, trim: true },
    titleBn: { type: String, required: true, trim: true },
    messageEn: { type: String, required: true, trim: true },
    messageBn: { type: String, required: true, trim: true },
    link: { type: String, trim: true },
    isRead: { type: Boolean, default: false, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

// High-Performance compound index for quick bell queries
NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
