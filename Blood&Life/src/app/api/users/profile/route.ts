import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { AuditLog } from "@/models/AuditLog";
import { getValidatedSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { sanitizeText } from "@/lib/security/sanitize";
import bcrypt from "bcryptjs";
import { z } from "zod";

const profileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(11).max(20).optional(),
  division: z.string().optional(),
  district: z.string().optional(),
  upazila: z.string().optional(),
  union: z.string().optional(),
  address: z.string().optional(),
  hidePhoneNumber: z.boolean().optional(),
  notifyOnProfileView: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await getValidatedSession();
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
    const session = await getValidatedSession();
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

    if (validated.name) user.name = sanitizeText(validated.name, 100);
    if (validated.phone) user.phone = validated.phone.replace(/[^0-9+]/g, "").trim();
    if (validated.division) user.division = sanitizeText(validated.division, 50);
    if (validated.district) user.district = sanitizeText(validated.district, 50);
    if (validated.upazila) user.upazila = sanitizeText(validated.upazila, 50);
    if (validated.union !== undefined) user.union = sanitizeText(validated.union, 60);
    if (validated.address !== undefined) user.address = sanitizeText(validated.address, 250);
    if (validated.isAvailable !== undefined) user.isAvailable = validated.isAvailable;
    if (validated.emailNotifications !== undefined) user.emailNotifications = validated.emailNotifications;

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
        phone: user.phone,
        division: user.division,
        district: user.district,
        upazila: user.upazila,
        address: user.address,
        privacy: user.privacy,
        isAvailable: user.isAvailable,
        emailNotifications: user.emailNotifications,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update profile settings" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getValidatedSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const password = typeof body.password === "string" ? body.password : "";

    await connectDB();
    const user = await User.findById(session.userId).select("+password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.password) {
      if (!password) {
        return NextResponse.json(
          { error: "Please enter your current password to confirm account deletion." },
          { status: 400 }
        );
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: "Incorrect password." }, { status: 403 });
      }
    }

    if (user.role === "Admin") {
      const adminCount = await User.countDocuments({ role: "Admin", status: "Active" });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the last remaining active Admin account." },
          { status: 400 }
        );
      }
    }

    await User.findByIdAndDelete(session.userId);

    await AuditLog.create({
      action: "ACCOUNT_DELETED",
      performedBy: session.userId,
      targetId: session.userId,
      targetType: "USER",
      metadata: {
        email: user.email,
        role: user.role,
      },
    }).catch(() => {});

    const response = NextResponse.json({
      success: true,
      message: "Your account has been permanently deleted.",
    });
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  } catch {
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
