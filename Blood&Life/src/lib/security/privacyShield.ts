import { connectDB } from "@/lib/db";
import { AuditLog } from "@/models/AuditLog";
import { checkRateLimit } from "./rateLimiter";
import { SessionPayload } from "@/lib/auth/jwt";

export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 7) return "••••••••••";
  const start = phone.slice(0, 4); // +880 or 0171
  const end = phone.slice(-3); // last 3 digits
  return `${start}•• •••${end}`;
}

export interface RevealContactResult {
  success: boolean;
  phone?: string;
  error?: string;
  remainingViews?: number;
}

/**
 * Donor Privacy Shield:
 * Enforces authentication, checks anti-scraping rate limits (max 3/hr),
 * creates an immutable MongoDB audit log, and delivers the decrypted number.
 */
export async function revealDonorContact({
  donorId,
  donorPhone,
  requester,
  ipAddress,
  userAgent,
}: {
  donorId: string;
  donorPhone: string;
  requester: SessionPayload;
  ipAddress?: string;
  userAgent?: string;
}): Promise<RevealContactResult> {
  // Volunteers & Admins have higher triage allowances; standard users get 3 views/hr
  const isPrivileged = requester.role === "Volunteer" || requester.role === "Admin";
  const limit = isPrivileged ? 25 : 3;
  const rateLimitKey = `contact_reveal:${requester.userId}`;

  const rateLimit = await checkRateLimit(rateLimitKey, limit, 3600);

  if (!rateLimit.success) {
    const minutesLeft = Math.ceil(rateLimit.resetMs / 60000);
    return {
      success: false,
      error: `Donor contact view limit reached (${limit}/hour). Anti-spam cooldown active for ${minutesLeft} minute(s).`,
    };
  }

  // Create immutable Audit Log entry
  await connectDB();
  await AuditLog.create({
    action: "CONTACT_REVEAL",
    performedBy: requester.userId,
    targetId: donorId,
    targetType: "DONOR",
    ipAddress,
    userAgent,
    metadata: {
      requesterEmail: requester.email,
      requesterName: requester.name,
      requesterRole: requester.role,
    },
  });

  return {
    success: true,
    phone: donorPhone,
    remainingViews: rateLimit.remaining,
  };
}
