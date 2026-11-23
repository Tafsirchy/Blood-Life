import crypto from "crypto";

export const OTP_EXPIRY_MINUTES = 15;

/**
 * Generates a cryptographically secure 6-digit numeric verification code (100000 - 999999)
 */
export function generateVerificationCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Produces a SHA-256 hash of the verification code for secure database storage
 */
export function hashVerificationCode(code: string): string {
  return crypto.createHash("sha256").update(code.trim()).digest("hex");
}

/**
 * Calculates expiration Date for OTP code (default 15 minutes)
 */
export function getOtpExpiryDate(minutes = OTP_EXPIRY_MINUTES): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}
