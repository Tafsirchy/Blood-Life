import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import { sendTransactionalEmail } from "@/lib/notifications/email";
import { buildVerificationEmailTemplate } from "@/lib/notifications/emailTemplates";
import { generateVerificationCode, hashVerificationCode, getOtpExpiryDate } from "@/lib/security/otp";
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
  union: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(["Donor", "Requester"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
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

    const existingUser = await User.findOne({ email: validated.email.toLowerCase() }).select("+password");
    if (existingUser && existingUser.password) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12);

    // Cryptographic 6-digit Numeric Verification Code (15-min expiry)
    const verificationCode = generateVerificationCode();
    const hashedVerificationToken = hashVerificationCode(verificationCode);
    const verificationExpires = getOtpExpiryDate(15);

    let userDoc;
    if (existingUser) {
      // Securely claim pre-existing intake record created without a password:
      // Bind credentials & OTP token, but do not overwrite profile fields until email ownership is verified!
      existingUser.password = hashedPassword;
      existingUser.isEmailVerified = false;
      existingUser.emailVerificationToken = hashedVerificationToken;
      existingUser.emailVerificationExpires = verificationExpires;
      await existingUser.save();
      userDoc = existingUser;
    } else {
      userDoc = await User.create({
        name: validated.name,
        email: validated.email.toLowerCase(),
        password: hashedPassword,
        phone: validated.phone,
        bloodGroup: validated.bloodGroup,
        division: validated.division,
        district: validated.district,
        upazila: validated.upazila,
        union: validated.union || "",
        address: validated.address || "",
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

    console.log(`\n======================================================`);
    console.log(`✉️ REGISTRATION VERIFICATION OTP DISPATCHED`);
    console.log(`👤 User: ${userDoc.name} <${userDoc.email}>`);
    console.log(`🔑 6-Digit Code: [ ${verificationCode} ]`);
    console.log(`🔗 Direct Verification Link: ${verificationUrl}`);
    if (!emailResult.success) {
      console.warn(`⚠️ Notice: Email delivery to third-party address was blocked by Resend sandbox. Use the code [ ${verificationCode} ] directly.`);
    }
    console.log(`======================================================\n`);

    // Session cookie is NOT issued here.
    // The user MUST verify email ownership via /api/auth/verify-email before receiving an active session.
    return NextResponse.json({
      success: true,
      requiresVerification: true,
      isEmailDelivered: emailResult.success,
      message: "Account created! A verification code has been dispatched to your email. Please verify to sign in.",
      user: {
        id: userDoc._id,
        name: userDoc.name,
        email: userDoc.email,
        role: userDoc.role,
        bloodGroup: userDoc.bloodGroup,
        isEmailVerified: false,
      },
    });
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
