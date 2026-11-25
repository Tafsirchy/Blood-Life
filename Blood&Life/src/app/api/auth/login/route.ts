import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { signSessionJWT } from "@/lib/auth/jwt";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1, "Password is required").max(128, "Password too long"),
});

// Precomputed valid bcrypt cost-12 hash for constant-time comparison when user is missing
const DUMMY_BCRYPT_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEeO7e.Y6Q0/3e0J2F1h9vR7mT8U5L7yP9W";
const NO_STORE = { "Cache-Control": "no-store, private" };

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // Strict Brute-Force Rate Limiting (10 attempts per 15 min per IP)
    const rateLimit = await checkRateLimit(`login-ip:${ip}`, 10, 900);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait 15 minutes before trying again." },
        { status: 429, headers: NO_STORE }
      );
    }

    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    // Account-Level Brute-Force Rate Limiting (5 attempts per 15 min per email)
    const accountRateLimit = await checkRateLimit(`login-acc:${email.toLowerCase()}`, 5, 900);
    if (!accountRateLimit.success) {
      return NextResponse.json(
        { error: "Too many failed attempts for this account. Please wait 15 minutes or reset your password." },
        { status: 429, headers: NO_STORE }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password +tokenVersion");

    // Constant-time password verification BEFORE checking account status to prevent user/status enumeration
    const hashToCompare = user?.password || DUMMY_BCRYPT_HASH;
    const isPasswordValid = await bcrypt.compare(password, hashToCompare);

    if (!user || !user.password || !isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or credentials" },
        { status: 401, headers: NO_STORE }
      );
    }

    if (user.status === "Blocked") {
      return NextResponse.json(
        { error: "Your account has been suspended. Contact support." },
        { status: 403, headers: NO_STORE }
      );
    }

    if (user.isEmailVerified === false) {
      return NextResponse.json(
        {
          error: "Please verify your email address before signing in. Check your inbox for the verification link.",
          requiresEmailVerification: true,
          email: user.email,
        },
        { status: 403, headers: NO_STORE }
      );
    }

    const token = await signSessionJWT({
      userId: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
      bloodGroup: user.bloodGroup,
      district: user.district,
      isEmailVerified: user.isEmailVerified ?? true,
      tokenVersion: user.tokenVersion || 0,
    });

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          name: user.name,
          role: user.role,
          bloodGroup: user.bloodGroup,
          district: user.district,
        },
      },
      { headers: NO_STORE }
    );

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid input" },
        { status: 400, headers: NO_STORE }
      );
    }
    return NextResponse.json({ error: "Authentication failed" }, { status: 500, headers: NO_STORE });
  }
}
