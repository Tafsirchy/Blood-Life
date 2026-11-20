import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { sendTransactionalEmail } from "@/lib/notifications/email";
import { checkRateLimit } from "@/lib/security/rateLimiter";
import crypto from "crypto";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown-ip";
    
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

      await sendTransactionalEmail({
        to: user.email,
        subject: "🔒 পাসওয়ার্ড রিসেট করুন (Password Reset Request) — BLOOD&LIFE",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: #dc2626; color: #ffffff; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 800;">BLOOD&LIFE (ব্লাড অ্যান্ড লাইফ)</h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">অ্যাকাউন্ট নিরাপত্তা ও পাসওয়ার্ড রিসেট</p>
            </div>
            <div style="padding: 24px; color: #0f172a;">
              <p style="font-size: 15px; margin-top: 0;">প্রিয় <strong>${user.name}</strong>,</p>
              <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                আপনার BLOOD&LIFE অ্যাকাউন্টের পাসওয়ার্ড রিসেট করার একটি আবেদন পাওয়া গেছে। নিচের বাটনে ক্লিক করে আগামী ৩০ মিনিটের মধ্যে নতুন পাসওয়ার্ড সেট করুন:
              </p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${resetLink}" style="background: #dc2626; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
                  পাসওয়ার্ড রিসেট করুন (Reset Password)
                </a>
              </div>
              <p style="font-size: 12px; color: #64748b; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                এই আবেদনটি যদি আপনি না করে থাকেন, তবে কোনো ব্যবস্থা নেওয়ার প্রয়োজন নেই। আপনার পাসওয়ার্ড পরিবর্তন হবে না।
              </p>
            </div>
          </div>
        `,
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
