import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { sendTransactionalEmail } from "@/lib/notifications/email";
import { buildPasswordResetEmailTemplate } from "@/lib/notifications/emailTemplates";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import crypto from "crypto";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    
    // Anti-Email-Bombing Rate Limit: 3 requests per 15 minutes per IP
    const rateLimit = await checkRateLimit(`forgot-ip:${ip}`, 3, 900);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many password reset requests. Please wait 15 minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    // Timing-Safe / Enumeration-Resistant response:
    // Even if user does not exist, return identical generic response
    if (user && user.status !== "Blocked") {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
      const tokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

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

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, a password reset link has been dispatched.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to process password reset request" }, { status: 500 });
  }
}
