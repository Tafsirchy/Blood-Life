import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { sendTransactionalEmail } from "@/lib/notifications/email";
import { buildVerificationEmailTemplate } from "@/lib/notifications/emailTemplates";
import { generateVerificationCode, hashVerificationCode, getOtpExpiryDate } from "@/lib/security/otp";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import { z } from "zod";

const resendSchema = z.object({
  email: z.string().email("Invalid email format").max(254),
});

const NO_STORE = { "Cache-Control": "no-store, private" };

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    const ipRateLimit = await checkRateLimit(`resend-verif-ip:${ip}`, 5, 3600);
    if (!ipRateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait an hour before requesting another verification email." },
        { status: 429, headers: NO_STORE }
      );
    }

    const body = await req.json();
    const { email } = resendSchema.parse(body);

    const emailCooldown = await checkRateLimit(`resend-verif-email:${email.toLowerCase()}`, 1, 60);
    if (!emailCooldown.success) {
      return NextResponse.json(
        { error: "Please wait 60 seconds before requesting another verification code." },
        { status: 429, headers: NO_STORE }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && !user.isEmailVerified && user.status !== "Blocked") {
      const code = generateVerificationCode();
      const hashedToken = hashVerificationCode(code);
      const tokenExpires = getOtpExpiryDate(15);

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

      await sendTransactionalEmail({
        to: user.email,
        subject: `✉️ নতুন ভেরিফিকেশন কোড: ${code} (New Verification Code) — BLOOD&LIFE`,
        html: emailContent.html,
        text: emailContent.text,
      });

      if (process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY) {
        console.info(`[Dev Resend OTP Mock] ${user.email} => Code: ${code}`);
      }
    }

    // Identical shape regardless of account existence or verification status to prevent enumeration
    return NextResponse.json(
      {
        success: true,
        message: "If an unverified account with this email exists, a new 6-digit verification code has been dispatched.",
      },
      { headers: NO_STORE }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid payload" },
        { status: 400, headers: NO_STORE }
      );
    }
    return NextResponse.json({ error: "Failed to process request" }, { status: 500, headers: NO_STORE });
  }
}
