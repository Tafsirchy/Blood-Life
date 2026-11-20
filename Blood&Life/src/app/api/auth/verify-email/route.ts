import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { sendTransactionalEmail } from "@/lib/notifications/email";
import { buildWelcomeEmailTemplate } from "@/lib/notifications/emailTemplates";
import crypto from "crypto";
import { z } from "zod";

const verifySchema = z.object({
  token: z.string().min(1, "Verification token is required"),
  email: z.string().email("Invalid email format"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, email } = verifySchema.parse(body);

    await connectDB();

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email: email.toLowerCase(),
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    }).select("+emailVerificationToken +emailVerificationExpires");

    if (!user) {
      return NextResponse.json(
        { error: "Invalid, expired, or previously used verification link." },
        { status: 400 }
      );
    }

    // Mark verified and single-use invalidate token
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

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You may now access all features.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid payload" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to verify email" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!token || !email) {
    return NextResponse.redirect(`${appUrl}/auth/verify-email?error=missing_params`);
  }

  return NextResponse.redirect(
    `${appUrl}/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
  );
}
