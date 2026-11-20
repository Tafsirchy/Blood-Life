import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { signSessionJWT } from "@/lib/auth/jwt";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/security/rateLimiter";
import { sendTransactionalEmail } from "@/lib/notifications/email";
import { buildVerificationEmailTemplate } from "@/lib/notifications/emailTemplates";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(11, "Phone number must be at least 11 digits"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  division: z.string().min(1, "Division is required"),
  district: z.string().min(1, "District is required"),
  upazila: z.string().min(1, "Upazila is required"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown-ip";
    const rateLimit = await checkRateLimit(`register-ip:${ip}`, 5, 3600);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validated = registerSchema.parse(body);

    await connectDB();

    const existingUser = await User.findOne({ email: validated.email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12);

    // Cryptographic 32-byte Verification Token
    const rawVerificationToken = crypto.randomBytes(32).toString("hex");
    const hashedVerificationToken = crypto.createHash("sha256").update(rawVerificationToken).digest("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newUser = await User.create({
      name: validated.name,
      email: validated.email.toLowerCase(),
      password: hashedPassword,
      phone: validated.phone,
      bloodGroup: validated.bloodGroup,
      division: validated.division,
      district: validated.district,
      upazila: validated.upazila,
      role: "Donor",
      status: "Active",
      isAvailable: true,
      totalDonations: 0,
      privacy: {
        hidePhoneNumber: true,
        requireApprovalBeforeReveal: false,
        notifyOnProfileView: true,
      },
      isEmailVerified: false,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpires: verificationExpires,
      emailNotifications: true,
      tokenVersion: 0,
    });

    // Dispatch Verification Email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${appUrl}/auth/verify-email?token=${rawVerificationToken}&email=${encodeURIComponent(newUser.email)}`;
    const emailContent = buildVerificationEmailTemplate({
      name: newUser.name,
      verificationUrl,
    });

    await sendTransactionalEmail({
      to: newUser.email,
      subject: "✉️ আপনার ইমেইল ভেরিফাই করুন (Verify Your Email) — BLOOD&LIFE",
      html: emailContent.html,
      text: emailContent.text,
    });

    // Create session JWT
    const token = await signSessionJWT({
      userId: String(newUser._id),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      bloodGroup: newUser.bloodGroup,
      district: newUser.district,
      isEmailVerified: false,
      tokenVersion: 0,
    });

    const response = NextResponse.json({
      success: true,
      requiresVerification: true,
      message: "Account created! A verification link has been sent to your email.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        bloodGroup: newUser.bloodGroup,
        isEmailVerified: false,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    if (error?.code === 11000) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Registration failed. Please check inputs and try again." },
      { status: 500 }
    );
  }
}
