import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { sendTransactionalEmail } from "@/lib/notifications/email";
import { buildPasswordResetEmailTemplate } from "@/lib/notifications/emailTemplates";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import crypto from "crypto";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please provide a valid email address").max(254),
});

const NO_STORE = { "Cache-Control": "no-store, private" };

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    const ipRateLimit = await checkRateLimit(`forgot-ip:${ip}`, 5, 900);
    if (!ipRateLimit.success) {
      return NextResponse.json(
        { error: "Too many password reset requests. Please wait 15 minutes." },
        { status: 429, headers: NO_STORE }
      );
    }

    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);
    const normalizedEmail = email.toLowerCase();

    // Per-email anti-bombing limit across rotating IPs
    const emailRateLimit = await checkRateLimit(`forgot-email:${normalizedEmail}`, 3, 900);
    if (!emailRateLimit.success) {
      return NextResponse.json(
        { error: "Too many password reset requests for this account. Please wait 15 minutes." },
        { status: 429, headers: NO_STORE }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: normalizedEmail });

    if (user && user.status !== "Blocked") {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
      const tokenExpires = new Date(Date.now() + 30 * 60 * 1000);

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = tokenExpires;
      await user.save();

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetLink = `${appUrl}/auth/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

      const emailContent = buildPasswordResetEmailTemplate({
        name: user.name,
        resetUrl: resetLink,
      });

      await sendTransactionalEmail({
        to: user.email,
        subject: "🔒 পাসওয়ার্ড রিসেট করুন (Password Reset Request) — BLOOD&LIFE",
        html: emailContent.html,
        text: emailContent.text,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "If an account with that email exists, a password reset link has been dispatched.",
      },
      { headers: NO_STORE }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid input" },
        { status: 400, headers: NO_STORE }
      );
    }
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500, headers: NO_STORE }
    );
  }
}
