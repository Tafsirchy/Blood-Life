import mongoose from "mongoose";

/**
 * Validates that an input is a valid 24-character hexadecimal MongoDB ObjectId
 * Prevents Mongoose CastError exceptions and BSON injection attacks
 */
export function isValidObjectId(id: unknown): id is string {
  if (typeof id !== "string") return false;
  return /^[0-9a-fA-F]{24}$/.test(id) && mongoose.Types.ObjectId.isValid(id);
}
