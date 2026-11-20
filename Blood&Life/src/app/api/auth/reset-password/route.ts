import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { sendTransactionalEmail } from "@/lib/notifications/email";
import { buildPasswordChangeAlertEmailTemplate } from "@/lib/notifications/emailTemplates";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, email, password } = resetPasswordSchema.parse(body);

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
        { status: 400 }
      );
    }

    if (user.status === "Blocked") {
      return NextResponse.json(
        { error: "Account suspended. Please contact administrator." },
        { status: 403 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;

    // Single-use invalidation
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Global session revocation: increment tokenVersion to invalidate all existing tokens
    user.tokenVersion = (user.tokenVersion || 0) + 1;

    await user.save();

    // Security Alert Email Notification
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
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

    return NextResponse.json({
      success: true,
      message: "Password successfully updated! All previous sessions have been invalidated. Please sign in.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid payload" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
