import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { signSessionJWT } from "@/lib/auth/jwt";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    
    // Strict Brute-Force Rate Limiting (10 failed attempts per 15 min per IP)
    const rateLimit = await checkRateLimit(`login-ip:${ip}`, 10, 900);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait 15 minutes before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    // Account-Level Brute-Force Rate Limiting (5 attempts per 15 min per email)
    const accountRateLimit = await checkRateLimit(`login-acc:${email.toLowerCase()}`, 5, 900);
    if (!accountRateLimit.success) {
      return NextResponse.json(
        { error: "Too many failed attempts for this account. Please wait 15 minutes or reset your password." },
        { status: 429 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password +tokenVersion");
    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid email or credentials" },
        { status: 401 }
      );
    }

    if (user.status === "Blocked") {
      return NextResponse.json(
        { error: "Your account has been suspended. Contact support." },
        { status: 403 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or credentials" },
        { status: 401 }
      );
    }

    if (user.isEmailVerified === false) {
      return NextResponse.json(
        {
          error: "Please verify your email address before signing in. Check your inbox for the verification link.",
          requiresEmailVerification: true,
          email: user.email,
        },
        { status: 403 }
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

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodGroup: user.bloodGroup,
        district: user.district,
      },
    });

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
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
