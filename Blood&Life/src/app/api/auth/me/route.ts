import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    await connectDB();
    const userDoc = await User.findById(session.userId).select("-password -__v").lean();

    if (!userDoc || userDoc.status === "Blocked") {
      return NextResponse.json({ authenticated: false, user: null, reason: "Account suspended or not found" });
    }

    // Verify token version for immediate revocation on password change or remote logout
    if (
      session.tokenVersion !== undefined &&
      userDoc.tokenVersion !== undefined &&
      session.tokenVersion !== userDoc.tokenVersion
    ) {
      return NextResponse.json({ authenticated: false, user: null, reason: "Session revoked" });
    }

    return NextResponse.json({
      authenticated: true,
      user: userDoc || session,
    });
  } catch {
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
