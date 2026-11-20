import { SignJWT, jwtVerify } from "jose";
import { UserRole } from "@/types";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "development_secret_key_change_in_production_32char"
);

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  bloodGroup: string;
  district: string;
  tokenVersion?: number;
}

export async function signSessionJWT(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionJWT(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
