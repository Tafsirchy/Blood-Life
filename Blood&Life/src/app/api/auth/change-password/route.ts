import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getValidatedSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { signSessionJWT } from "@/lib/auth/jwt";
import { sendTransactionalEmail } from "@/lib/notifications/email";
import { buildPasswordChangeAlertEmailTemplate } from "@/lib/notifications/emailTemplates";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import { strongPasswordSchema } from "@/lib/security/validators";
import bcrypt from "bcryptjs";
import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required").max(128),
  newPassword: strongPasswordSchema,
});

const NO_STORE = { "Cache-Control": "no-store, private" };

export async function POST(req: NextRequest) {
  try {
    const session = await getValidatedSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
    }

    const rateLimit = await checkRateLimit(`change-pwd:${session.userId}`, 5, 900);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many password change attempts. Please wait 15 minutes." },
        { status: 429, headers: NO_STORE }
      );
    }

    const body = await req.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    await connectDB();
    const user = await User.findById(session.userId).select("+password +tokenVersion");
    if (!user || !user.password) {
      return NextResponse.json({ error: "User password record not found" }, { status: 404, headers: NO_STORE });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 403, headers: NO_STORE });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    const alertContent = buildPasswordChangeAlertEmailTemplate({
      name: user.name,
      timestamp: new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" }),
      ip: getClientIp(req),
    });
    sendTransactionalEmail({
      to: user.email,
      subject: "🚨 নিরাপত্তা সতর্কতা: পাসওয়ার্ড পরিবর্তিত হয়েছে — BLOOD&LIFE",
      html: alertContent.html,
      text: alertContent.text,
    }).catch((e) => console.error("Password change alert email error:", e));

    // Re-issue active session token with incremented tokenVersion so this device stays signed in
    const freshToken = await signSessionJWT({
      userId: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
      bloodGroup: user.bloodGroup,
      district: user.district,
      isEmailVerified: user.isEmailVerified ?? true,
      tokenVersion: user.tokenVersion,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!",
      },
      { headers: NO_STORE }
    );

    response.cookies.set(SESSION_COOKIE_NAME, freshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid input" },
        { status: 400, headers: NO_STORE }
      );
    }
    return NextResponse.json({ error: "Failed to change password" }, { status: 500, headers: NO_STORE });
  }
}
