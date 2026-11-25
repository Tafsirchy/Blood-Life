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
  union?: string;
  address?: string;
  avatarUrl?: string;
  role: UserRole;
  status: "Active" | "Blocked";
  isAvailable: boolean;
  lastDonationDate?: Date;
  cooldownUntil?: Date;
  totalDonations: number;
  verifiedDonations?: number;
  trustRating?: number;
  isFraudFlagged?: boolean;
  privacy: DonorPrivacySettings;
  isEmailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  emailNotifications?: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  tokenVersion?: number;
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
  recipientVerification?: {
    isVerified: boolean;
    verifiedDonorId?: string;
    verifiedDonorName?: string;
    verifiedAt?: Date | string;
    rating?: number;
    feedback?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type ScamCategory =
  | "advance_cash_scam" // demanded money via bKash/Nagad/Rocket
  | "fake_donor_noshow" // promised to donate, didn't show up, phone off during surgery
  | "blood_broker" // commercial blood broker / selling blood
  | "false_screening" // forged medical test report
  | "harassment" // demanding excess money or threatening
  | "other";

export type FraudStatus = "pending_review" | "investigating" | "confirmed_fraud" | "dismissed";

export interface IFraudReport {
  _id: string;
  reportedPhone: string;
  reportedName?: string;
  scamCategory: ScamCategory;
  hospitalName?: string;
  district?: string;
  description: string;
  evidenceDetails?: string;
  reporterName: string;
  reporterPhone: string;
  reporterUserId?: string;
  status: FraudStatus;
  adminNotes?: string;
  incidentDate?: Date | string;
  bannedAt?: Date | string;
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
  district?: string;
  units?: number;
  completedAt: Date;
  certificateId: string;
  verifiedByVolunteerId?: string;
  recipientVerified?: boolean;
  rating?: number;
  recipientFeedback?: string;
}

export type AuditAction =
  | "CONTACT_REVEAL"
  | "ROLE_CHANGE"
  | "REQUEST_VERIFIED"
  | "REQUEST_DELETED"
  | "STATUS_UPDATE"
  | "DONATION_VERIFIED"
  | "DONATION_DELETED"
  | "FRAUD_REPORTED"
  | "FRAUD_REVIEWED"
  | "USER_CREATED"
  | "USER_DELETED"
  | "ACCOUNT_DELETED"
  | "DONOR_DELETED"
  | "INVENTORY_UPDATED";

export interface IAuditLog {
  _id: string;
  action: AuditAction;
  performedBy: string;
  targetId: string;
  targetType: "DONOR" | "REQUEST" | "USER" | "FRAUD" | "INVENTORY" | "DONATION";
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
