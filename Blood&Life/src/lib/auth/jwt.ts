import { SignJWT, jwtVerify } from "jose";
import { UserRole } from "@/types";

declare global {
  // eslint-disable-next-line no-var
  var __ephemeralDevJwtSecret: string | undefined;
}

function getJwtSecretKey(): Uint8Array {
  const secretString = process.env.AUTH_SECRET || process.env.JWT_SECRET;

  if (process.env.NODE_ENV === "production") {
    if (!secretString || secretString.length < 32) {
      throw new Error(
        "FATAL: AUTH_SECRET (min 32 chars) must be set in production environment."
      );
    }
    return new TextEncoder().encode(secretString);
  }

  if (secretString && secretString.length >= 16) {
    return new TextEncoder().encode(secretString);
  }

  // Runtime-generated ephemeral key for local dev when no env secret is configured (never a hardcoded static literal)
  if (!global.__ephemeralDevJwtSecret) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    global.__ephemeralDevJwtSecret = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }

  return new TextEncoder().encode(global.__ephemeralDevJwtSecret);
}

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  bloodGroup: string;
  district: string;
  isEmailVerified?: boolean;
  tokenVersion?: number;
}

export async function signSessionJWT(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecretKey());
}

export async function verifySessionJWT(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
