import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { signSessionJWT } from "@/lib/auth/jwt";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(11, "Phone number must be at least 11 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  division: z.string().min(1, "Division is required"),
  district: z.string().min(1, "District is required"),
  upazila: z.string().min(1, "Upazila is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    await connectDB();

    const existingUser = await User.findOne({ email: validated.email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12);

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
    });

    // Create session JWT
    const token = await signSessionJWT({
      userId: String(newUser._id),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      bloodGroup: newUser.bloodGroup,
      district: newUser.district,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        bloodGroup: newUser.bloodGroup,
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Registration failed. Please check inputs and try again." },
      { status: 500 }
    );
  }
}
