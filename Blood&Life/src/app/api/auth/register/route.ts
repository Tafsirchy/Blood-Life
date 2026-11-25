import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import { strongPasswordSchema } from "@/lib/security/validators";
import { sanitizeText } from "@/lib/security/sanitize";
import { sendTransactionalEmail } from "@/lib/notifications/email";
import { buildVerificationEmailTemplate } from "@/lib/notifications/emailTemplates";
import { generateVerificationCode, hashVerificationCode, getOtpExpiryDate } from "@/lib/security/otp";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format").max(254),
  phone: z.string().min(11, "Phone number must be at least 11 digits").max(20),
  password: strongPasswordSchema,
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  division: z.string().min(1, "Division is required").max(50),
  district: z.string().min(1, "District is required").max(50),
  upazila: z.string().min(1, "Upazila is required").max(50),
  union: z.string().max(60).optional(),
  address: z.string().max(250).optional(),
  role: z.enum(["Donor", "Requester"]).optional(),
});

const NO_STORE = { "Cache-Control": "no-store, private" };

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateLimit = await checkRateLimit(`register-ip:${ip}`, 5, 3600);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429, headers: NO_STORE }
      );
    }

    const body = await req.json();
    const validated = registerSchema.parse(body);
    const normalizedEmail = validated.email.trim().toLowerCase();

    if (normalizedEmail.endsWith("@bloodlife.local")) {
      return NextResponse.json(
        { error: "Please register with a valid personal email address." },
        { status: 400, headers: NO_STORE }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email: normalizedEmail }).select("+password");
    if (existingUser && existingUser.status === "Blocked") {
      return NextResponse.json(
        { error: "This account is suspended. Please contact support." },
        { status: 403, headers: NO_STORE }
      );
    }
    if (existingUser && existingUser.password) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409, headers: NO_STORE }
      );
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12);

    // Cryptographic 6-digit Numeric Verification Code (15-min expiry)
    const verificationCode = generateVerificationCode();
    const hashedVerificationToken = hashVerificationCode(verificationCode);
    const verificationExpires = getOtpExpiryDate(15);

    let userDoc;
    if (existingUser) {
      existingUser.password = hashedPassword;
      existingUser.isEmailVerified = false;
      existingUser.emailVerificationToken = hashedVerificationToken;
      existingUser.emailVerificationExpires = verificationExpires;
      await existingUser.save();
      userDoc = existingUser;
    } else {
      userDoc = await User.create({
        name: sanitizeText(validated.name, 100),
        email: normalizedEmail,
        password: hashedPassword,
        phone: validated.phone.replace(/[^0-9+]/g, "").trim(),
        bloodGroup: validated.bloodGroup,
        division: sanitizeText(validated.division, 50),
        district: sanitizeText(validated.district, 50),
        upazila: sanitizeText(validated.upazila, 50),
        union: sanitizeText(validated.union || "", 60),
        address: sanitizeText(validated.address || "", 250),
        role: validated.role || "Donor",
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
    }

    // Dispatch Verification Email with 6-digit Code & Direct Link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${appUrl}/auth/verify-email?code=${verificationCode}&email=${encodeURIComponent(userDoc.email)}`;
    const emailContent = buildVerificationEmailTemplate({
      name: userDoc.name,
      code: verificationCode,
      verificationUrl,
    });

    const emailResult = await sendTransactionalEmail({
      to: userDoc.email,
      subject: `✉️ আপনার ভেরিফিকেশন কোড: ${verificationCode} (Verification Code) — BLOOD&LIFE`,
      html: emailContent.html,
      text: emailContent.text,
    });

    // Only log OTP locally in non-production when no real email API key is configured
    if (process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY) {
      console.info(`[Dev OTP Mock] ${userDoc.email} => Code: ${verificationCode}`);
    }

    return NextResponse.json(
      {
        success: true,
        requiresVerification: true,
        isEmailDelivered: emailResult.success,
        message: "Account created! A verification code has been dispatched to your email. Please verify to sign in.",
        user: {
          id: userDoc._id,
          name: userDoc.name,
          role: userDoc.role,
          bloodGroup: userDoc.bloodGroup,
          isEmailVerified: false,
        },
      },
      { headers: NO_STORE }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation failed" },
        { status: 400, headers: NO_STORE }
      );
    }
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409, headers: NO_STORE }
      );
    }
    return NextResponse.json(
      { error: "Registration failed. Please check inputs and try again." },
      { status: 500, headers: NO_STORE }
    );
  }
}
