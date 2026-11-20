import { cookies } from "next/headers";
import { verifySessionJWT, SessionPayload } from "./jwt";
import { UserRole } from "@/types";

export const SESSION_COOKIE_NAME = "blood_lagbe_session";

export async function getServerSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  return verifySessionJWT(token);
}

export const getSession = getServerSession;

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getServerSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<SessionPayload> {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}
