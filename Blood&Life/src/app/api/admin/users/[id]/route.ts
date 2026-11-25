import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { AuditLog } from "@/models/AuditLog";
import { getValidatedSession } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/security/validators";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getValidatedSession();
    if (!session || session.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    const { id } = await context.params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
    }

    if (id === session.userId) {
      return NextResponse.json(
        { error: "Admins cannot delete their own account from the user table." },
        { status: 400 }
      );
    }

    await connectDB();
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await AuditLog.create({
      action: "USER_DELETED",
      performedBy: session.userId,
      targetId: id,
      targetType: "USER",
      metadata: {
        email: deleted.email,
        name: deleted.name,
        role: deleted.role,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "User account permanently deleted.",
    });
  } catch {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
