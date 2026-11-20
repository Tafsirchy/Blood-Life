import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { sendTransactionalEmail } from "@/lib/notifications/email";
import { buildVerificationEmailTemplate } from "@/lib/notifications/emailTemplates";
import { checkRateLimit } from "@/lib/security/rateLimiter";
import crypto from "crypto";
import { z } from "zod";

const resendSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown-ip";

    // Strict rate limiting: 3 attempts per hour per IP
    const rateLimit = await checkRateLimit(`resend-verif-ip:${ip}`, 3, 3600);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait an hour before requesting another verification email." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email } = resendSchema.parse(body);

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    // Timing-Safe / Enumeration-Resistant response:
    // If user exists and is not yet verified, issue new token & dispatch email
    if (user && !user.isEmailVerified && user.status !== "Blocked") {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      user.emailVerificationToken = hashedToken;
      user.emailVerificationExpires = tokenExpires;
      await user.save();

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const verificationUrl = `${appUrl}/auth/verify-email?token=${rawToken}&email=${encodeURIComponent(user.email)}`;
      const emailContent = buildVerificationEmailTemplate({
        name: user.name,
        verificationUrl,
      });

      await sendTransactionalEmail({
        to: user.email,
        subject: "✉️ নতুন ভেরিফিকেশন লিঙ্ক (New Verification Link) — BLOOD&LIFE",
        html: emailContent.html,
        text: emailContent.text,
      });
    }

    return NextResponse.json({
      success: true,
      message: "If an unverified account with this email exists, a new verification link has been dispatched.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid payload" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
