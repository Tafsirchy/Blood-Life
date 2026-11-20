import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { AuditLog } from "@/models/AuditLog";
import { getServerSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || session.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    await connectDB();
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Admin users list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role, status } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
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

    if (updatedUser) {
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
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
