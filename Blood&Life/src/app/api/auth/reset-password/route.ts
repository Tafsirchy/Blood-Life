import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { sendTransactionalEmail } from "@/lib/notifications/email";
import { buildPasswordChangeAlertEmailTemplate } from "@/lib/notifications/emailTemplates";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import { strongPasswordSchema } from "@/lib/security/validators";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required").max(256),
  email: z.string().email("Invalid email format").max(254),
  password: strongPasswordSchema,
});

const NO_STORE = { "Cache-Control": "no-store, private" };

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const ipRateLimit = await checkRateLimit(`reset-ip:${ip}`, 10, 900);
    if (!ipRateLimit.success) {
      return NextResponse.json(
        { error: "Too many reset attempts. Please wait 15 minutes." },
        { status: 429, headers: NO_STORE }
      );
    }

    const body = await req.json();
    const { token, email, password } = resetPasswordSchema.parse(body);

    const emailRateLimit = await checkRateLimit(`reset-email:${email.toLowerCase()}`, 5, 900);
    if (!emailRateLimit.success) {
      return NextResponse.json(
        { error: "Too many reset attempts for this email. Please wait 15 minutes." },
        { status: 429, headers: NO_STORE }
      );
    }

    await connectDB();

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+password +resetPasswordToken +resetPasswordExpires +tokenVersion");

    if (!user) {
      return NextResponse.json(
        { error: "Invalid, expired, or previously used password reset link." },
        { status: 400, headers: NO_STORE }
      );
    }

    if (user.status === "Blocked") {
      return NextResponse.json(
        { error: "Account suspended. Please contact administrator." },
        { status: 403, headers: NO_STORE }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.tokenVersion = (user.tokenVersion || 0) + 1;

    await user.save();

    const alertContent = buildPasswordChangeAlertEmailTemplate({
      name: user.name,
      timestamp: new Date().toUTCString(),
      ip,
    });

    await sendTransactionalEmail({
      to: user.email,
      subject: "🚨 নিরাপত্তা সতর্কতা: পাসওয়ার্ড পরিবর্তিত হয়েছে (Security Alert: Password Changed)",
      html: alertContent.html,
      text: alertContent.text,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Password successfully updated! All previous sessions have been invalidated. Please sign in.",
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
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500, headers: NO_STORE });
  }
}
