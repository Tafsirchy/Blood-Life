import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getServerSession } from "@/lib/auth/session";
import { z } from "zod";

const profileUpdateSchema = z.object({
  division: z.string().optional(),
  district: z.string().optional(),
  upazila: z.string().optional(),
  hidePhoneNumber: z.boolean().optional(),
  notifyOnProfileView: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.userId).select("-password -__v").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = profileUpdateSchema.parse(body);

    await connectDB();

    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (validated.division) user.division = validated.division;
    if (validated.district) user.district = validated.district;
    if (validated.upazila) user.upazila = validated.upazila;
    if (validated.isAvailable !== undefined) user.isAvailable = validated.isAvailable;

    if (validated.hidePhoneNumber !== undefined || validated.notifyOnProfileView !== undefined) {
      user.privacy = {
        ...user.privacy,
        ...(validated.hidePhoneNumber !== undefined && { hidePhoneNumber: validated.hidePhoneNumber }),
        ...(validated.notifyOnProfileView !== undefined && { notifyOnProfileView: validated.notifyOnProfileView }),
      };
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Settings successfully updated.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        division: user.division,
        district: user.district,
        privacy: user.privacy,
        isAvailable: user.isAvailable,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update profile settings" }, { status: 500 });
  }
}
