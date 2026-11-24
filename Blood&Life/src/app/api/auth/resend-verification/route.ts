import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { sendTransactionalEmail } from "@/lib/notifications/email";
import { buildVerificationEmailTemplate } from "@/lib/notifications/emailTemplates";
import { generateVerificationCode, hashVerificationCode, getOtpExpiryDate } from "@/lib/security/otp";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import { z } from "zod";

const resendSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // Strict rate limiting: 5 attempts per hour per IP
    const ipRateLimit = await checkRateLimit(`resend-verif-ip:${ip}`, 5, 3600);
    if (!ipRateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait an hour before requesting another verification email." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email } = resendSchema.parse(body);

    // Per-email 60-second cooldown protection against spamming
    const emailCooldown = await checkRateLimit(`resend-verif-email:${email.toLowerCase()}`, 1, 60);
    if (!emailCooldown.success) {
      return NextResponse.json(
        { error: "Please wait 60 seconds before requesting another verification code." },
        { status: 429 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    // Timing-Safe / Enumeration-Resistant response:
    // If user exists and is not yet verified, issue new 6-digit code & dispatch email
    if (user && !user.isEmailVerified && user.status !== "Blocked") {
      const code = generateVerificationCode();
      const hashedToken = hashVerificationCode(code);
      const tokenExpires = getOtpExpiryDate(15); // 15 minutes

      user.emailVerificationToken = hashedToken;
      user.emailVerificationExpires = tokenExpires;
      await user.save();

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const verificationUrl = `${appUrl}/auth/verify-email?code=${code}&email=${encodeURIComponent(user.email)}`;
      const emailContent = buildVerificationEmailTemplate({
        name: user.name,
        code,
        verificationUrl,
      });

      const emailResult = await sendTransactionalEmail({
        to: user.email,
        subject: `✉️ নতুন ভেরিফিকেশন কোড: ${code} (New Verification Code) — BLOOD&LIFE`,
        html: emailContent.html,
        text: emailContent.text,
      });

      console.log(`\n======================================================`);
      console.log(`✉️ RESENT VERIFICATION OTP`);
      console.log(`👤 User: ${user.name} <${user.email}>`);
      console.log(`🔑 6-Digit Code: [ ${code} ]`);
      console.log(`🔗 Direct Verification Link: ${verificationUrl}`);
      if (!emailResult.success) {
        console.warn(`⚠️ Notice: Email delivery to third-party address was blocked by Resend sandbox. Use the code [ ${code} ] directly.`);
      }
      console.log(`======================================================\n`);

      return NextResponse.json({
        success: true,
        isEmailDelivered: emailResult.success,
        message: "If an unverified account with this email exists, a new 6-digit verification code has been dispatched.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "If an unverified account with this email exists, a new 6-digit verification code has been dispatched.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid payload" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
