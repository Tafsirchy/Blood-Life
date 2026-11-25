import mongoose from "mongoose";
import { z } from "zod";

/**
 * Validates that an input is a valid 24-character hexadecimal MongoDB ObjectId.
 * Prevents Mongoose CastError exceptions and BSON operator injection.
 */
export function isValidObjectId(id: unknown): id is string {
  if (typeof id !== "string") return false;
  return /^[0-9a-fA-F]{24}$/.test(id) && mongoose.Types.ObjectId.isValid(id);
}

const COMMON_WEAK_PASSWORDS = new Set([
  "password1",
  "password123",
  "12345678",
  "123456789",
  "12345678a",
  "qwerty123",
  "admin123",
  "letmein1",
  "welcome1",
  "blood123",
  "bloodlife1",
  "iloveyou1",
  "abc12345",
  "passw0rd",
]);

/**
 * Password schema capped at 72 characters (bcrypt limit, prevents CPU DoS)
 * and rejects commonly breached/trivial passwords.
 */
export const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must not exceed 72 characters")
  .regex(/[a-zA-Z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .refine(
    (pwd) => !COMMON_WEAK_PASSWORDS.has(pwd.toLowerCase()),
    "This password is too common and easily guessed. Please choose a stronger password."
  );

/**
 * Prevents open redirects via protocol-relative URLs (//evil.com, /\evil.com)
 * or external schemes on login redirect parameters.
 */
export function sanitizeRedirectPath(input: string | null | undefined, fallback = "/dashboard"): string {
  if (!input || typeof input !== "string") return fallback;
  const trimmed = input.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return fallback;
  }
  return trimmed;
}
