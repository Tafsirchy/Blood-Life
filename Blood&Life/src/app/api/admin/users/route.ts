import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { AuditLog } from "@/models/AuditLog";
import { getValidatedSession } from "@/lib/auth/session";
import { isValidObjectId, strongPasswordSchema } from "@/lib/security/validators";
import { sanitizeText, escapeRegex } from "@/lib/security/sanitize";
import bcrypt from "bcryptjs";
import { z } from "zod";

const adminCreateUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(11).max(20),
  password: strongPasswordSchema,
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  division: z.string().min(1),
  district: z.string().min(1),
  upazila: z.string().min(1),
  role: z.enum(["Donor", "Requester", "Volunteer", "Admin"]).default("Donor"),
});

const adminPatchUserSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["Donor", "Requester", "Volunteer", "Admin"]).optional(),
  status: z.enum(["Active", "Blocked"]).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getValidatedSession();
    if (!session || session.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const role = searchParams.get("role") || "all";
    const status = searchParams.get("status") || "all";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));

    const filter: Record<string, unknown> = {};
    if (role !== "all") filter.role = role;
    if (status !== "all") filter.status = status;
    if (search) {
      const safe = escapeRegex(search);
      filter.$or = [
        { name: { $regex: safe, $options: "i" } },
        { email: { $regex: safe, $options: "i" } },
        { district: { $regex: safe, $options: "i" } },
        { phone: { $regex: safe, $options: "i" } },
      ];
    }

    const [users, total, volunteerCount] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
      User.countDocuments({ role: "Volunteer" }),
    ]);

    return NextResponse.json({
      users,
      total,
      volunteerCount,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error: any) {
    console.error("Admin users list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getValidatedSession();
    if (!session || session.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    const body = await req.json();
    const validated = adminCreateUserSchema.parse(body);

    await connectDB();
    const existing = await User.findOne({ email: validated.email.toLowerCase() }).lean();
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12);
    const createdUser = await User.create({
      name: sanitizeText(validated.name, 100),
      email: validated.email.toLowerCase(),
      phone: validated.phone.replace(/[^0-9+]/g, "").trim(),
      password: hashedPassword,
      bloodGroup: validated.bloodGroup,
      division: sanitizeText(validated.division, 50),
      district: sanitizeText(validated.district, 50),
      upazila: sanitizeText(validated.upazila, 50),
      role: validated.role,
      status: "Active",
      isAvailable: true,
      isEmailVerified: true,
    });

    await AuditLog.create({
      action: "USER_CREATED",
      performedBy: session.userId,
      targetId: String(createdUser._id),
      targetType: "USER",
      metadata: {
        email: createdUser.email,
        role: createdUser.role,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      user: {
        _id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        phone: createdUser.phone,
        bloodGroup: createdUser.bloodGroup,
        district: createdUser.district,
        role: createdUser.role,
        status: createdUser.status,
        totalDonations: createdUser.totalDonations || 0,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getValidatedSession();
    if (!session || session.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role, status } = adminPatchUserSchema.parse(body);

    if (!isValidObjectId(userId)) {
      return NextResponse.json({ error: "A valid userId ObjectId is required" }, { status: 400 });
    }

    if (userId === session.userId && (status === "Blocked" || (role && role !== "Admin"))) {
      return NextResponse.json(
        { error: "Admins cannot block or demote their own active account." },
        { status: 400 }
      );
    }

    await connectDB();
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(role && { role }),
        ...(status && { status }),
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    if (role) {
      await AuditLog.create({
        action: "ROLE_CHANGE",
        performedBy: session.userId,
        targetId: userId,
        targetType: "USER",
        ipAddress: clientIp,
        userAgent,
        metadata: {
          newRole: role,
          targetEmail: updatedUser.email,
          targetName: updatedUser.name,
        },
      });
    }

    if (status) {
      await AuditLog.create({
        action: "STATUS_UPDATE",
        performedBy: session.userId,
        targetId: userId,
        targetType: "USER",
        ipAddress: clientIp,
        userAgent,
        metadata: {
          newStatus: status,
          targetEmail: updatedUser.email,
          targetName: updatedUser.name,
        },
      });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }
    console.error("Admin user update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
