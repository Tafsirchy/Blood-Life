export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export type UserRole = "Donor" | "Requester" | "Volunteer" | "Admin";

export type RequestStatus = "pending" | "inprogress" | "done" | "canceled" | "expired";

export type UrgencyLevel = "critical" | "urgent" | "standard";

export interface GeoLocation {
  division: string;
  district: string;
  upazila: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface DonorPrivacySettings {
  hidePhoneNumber: boolean;
  requireApprovalBeforeReveal: boolean;
  notifyOnProfileView: boolean;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  bloodGroup: BloodGroup;
  division: string;
  district: string;
  upazila: string;
  avatarUrl?: string;
  role: UserRole;
  status: "Active" | "Blocked";
  isAvailable: boolean;
  lastDonationDate?: Date;
  cooldownUntil?: Date;
  totalDonations: number;
  privacy: DonorPrivacySettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDonationRequest {
  _id: string;
  recipientName: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  urgency: UrgencyLevel;
  hospital: string;
  division: string;
  district: string;
  upazila: string;
  scheduledDate: string;
  scheduledTime: string;
  medicalReason?: string;
  bloodComponent?: "whole_blood" | "prbc" | "platelets" | "plasma";
  message?: string;
  prescriptionUrl?: string;
  isVerifiedGenuine: boolean;
  verifiedBy?: string;
  status: RequestStatus;
  expiresAt?: Date | string;
  fulfilledUnits?: number;
  pledgedUnits?: number;
  pledges?: Array<{
    donorId: string;
    donorName: string;
    donorPhone?: string;
    units: number;
    status: "pledged" | "donated" | "canceled";
    timestamp: Date | string;
  }>;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  assignedDonorId?: string;
  assignedDonorName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransfusionLog {
  _id: string;
  requestId: string;
  donorId: string;
  recipientName: string;
  bloodGroup: BloodGroup;
  hospital: string;
  completedAt: Date;
  certificateId: string;
  verifiedByVolunteerId?: string;
}

export interface IAuditLog {
  _id: string;
  action: "CONTACT_REVEAL" | "ROLE_CHANGE" | "REQUEST_VERIFIED" | "STATUS_UPDATE";
  performedBy: string;
  targetId: string;
  targetType: "DONOR" | "REQUEST" | "USER";
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
