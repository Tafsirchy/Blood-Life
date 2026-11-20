import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AuditLog } from "@/models/AuditLog";
import { getServerSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || session.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    await connectDB();
    const logs = await AuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error("Admin audit logs query error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
