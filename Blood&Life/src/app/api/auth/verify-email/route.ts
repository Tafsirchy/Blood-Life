import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { signSessionJWT } from "@/lib/auth/jwt";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { sendTransactionalEmail } from "@/lib/notifications/email";
import { buildWelcomeEmailTemplate } from "@/lib/notifications/emailTemplates";
import { hashVerificationCode } from "@/lib/security/otp";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import { z } from "zod";

const verifySchema = z.object({
  code: z.string().optional(),
  token: z.string().optional(),
  email: z.string().email("Invalid email format"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const ipRateLimit = await checkRateLimit(`verify-ip:${ip}`, 20, 900);
    if (!ipRateLimit.success) {
      return NextResponse.json(
        { error: "Too many verification requests from this network. Please wait 15 minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { code, token, email } = verifySchema.parse(body);

    const inputCode = (code || token || "").trim();
    if (!inputCode) {
      return NextResponse.json(
        { error: "Verification code is required." },
        { status: 400 }
      );
    }

    // Anti-Brute-Force Protection: max 5 failed attempts per 15 minutes per email
    const failRateLimit = await checkRateLimit(`verify-fail:${email.toLowerCase()}`, 5, 900);
    if (!failRateLimit.success) {
      return NextResponse.json(
        { error: "Too many incorrect verification attempts. Please wait 15 minutes or request a new code." },
        { status: 429 }
      );
    }

    await connectDB();

    const hashedToken = hashVerificationCode(inputCode);

    const user = await User.findOne({
      email: email.toLowerCase(),
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    }).select("+emailVerificationToken +emailVerificationExpires");

    if (!user) {
      return NextResponse.json(
        { error: "Invalid, expired, or previously used verification code." },
        { status: 400 }
      );
    }

    // Mark verified and invalidate verification token
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Trigger Welcome Email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const welcomeContent = buildWelcomeEmailTemplate({
      name: user.name,
      bloodGroup: user.bloodGroup,
      dashboardUrl: `${appUrl}/dashboard`,
    });

    await sendTransactionalEmail({
      to: user.email,
      subject: "🩸 স্বাগতম BLOOD&LIFE লাইফ সেভিং নেটওয়ার্কে (Welcome to BLOOD&LIFE)",
      html: welcomeContent.html,
      text: welcomeContent.text,
    });

    // Generate authenticated session JWT for immediate seamless sign-in
    const sessionToken = await signSessionJWT({
      userId: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
      bloodGroup: user.bloodGroup,
      district: user.district,
      isEmailVerified: true,
      tokenVersion: user.tokenVersion || 0,
    });

    const response = NextResponse.json({
      success: true,
      message: "Email verified successfully! You are now securely signed in.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodGroup: user.bloodGroup,
        district: user.district,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Verification error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid payload" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to verify email" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code") || searchParams.get("token");
  const email = searchParams.get("email");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!code || !email) {
    return NextResponse.redirect(`${appUrl}/auth/verify-email?error=missing_params`);
  }

  return NextResponse.redirect(
    `${appUrl}/auth/verify-email?code=${encodeURIComponent(code)}&email=${encodeURIComponent(email)}`
  );
}
