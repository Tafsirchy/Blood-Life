import { cookies } from "next/headers";
import { verifySessionJWT, SessionPayload } from "./jwt";
import { UserRole } from "@/types";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export const SESSION_COOKIE_NAME = "blood_lagbe_session";

/**
 * Fast stateless session verification from JWT cookie (no DB roundtrip)
 */
export async function getServerSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  return verifySessionJWT(token);
}

/**
 * Stateful session validation against MongoDB
 * Ensures user is not blocked, exists, and tokenVersion matches (immediate revocation check)
 */
export async function getValidatedSession(): Promise<SessionPayload | null> {
  const session = await getServerSession();
  if (!session) return null;

  try {
    await connectDB();
    const userDoc = await User.findById(session.userId)
      .select("role status tokenVersion isEmailVerified name bloodGroup district")
      .lean();

    if (!userDoc || userDoc.status === "Blocked") {
      return null;
    }

    if (
      session.tokenVersion !== undefined &&
      userDoc.tokenVersion !== undefined &&
      session.tokenVersion !== userDoc.tokenVersion
    ) {
      return null;
    }

    return {
      ...session,
      name: userDoc.name || session.name,
      role: userDoc.role as UserRole,
      bloodGroup: userDoc.bloodGroup || session.bloodGroup,
      district: userDoc.district || session.district,
      isEmailVerified: userDoc.isEmailVerified,
      tokenVersion: userDoc.tokenVersion,
    };
  } catch (err) {
    // Fail closed: never trust an unvalidated JWT when session verification against DB fails
    console.error("Session DB validation error (fail-closed):", err instanceof Error ? err.message : "unknown");
    return null;
  }
}

export const getSession = getServerSession;

export async function requireAuth(options?: { validateDb?: boolean }): Promise<SessionPayload> {
  const session = options?.validateDb ? await getValidatedSession() : await getServerSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireRole(
  allowedRoles: UserRole[],
  options?: { validateDb?: boolean }
): Promise<SessionPayload> {
  const session = await requireAuth(options);
  if (!allowedRoles.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}
