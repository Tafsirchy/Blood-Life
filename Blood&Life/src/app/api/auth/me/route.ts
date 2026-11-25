import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

const NO_STORE = { "Cache-Control": "no-store, private" };

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { headers: NO_STORE });
    }

    await connectDB();
    const userDoc = await User.findById(session.userId).select("-password -__v").lean();

    if (!userDoc || userDoc.status === "Blocked") {
      return NextResponse.json(
        { authenticated: false, user: null, reason: "Account suspended or not found" },
        { headers: NO_STORE }
      );
    }

    if (
      session.tokenVersion !== undefined &&
      userDoc.tokenVersion !== undefined &&
      session.tokenVersion !== userDoc.tokenVersion
    ) {
      return NextResponse.json(
        { authenticated: false, user: null, reason: "Session revoked" },
        { headers: NO_STORE }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: userDoc,
      },
      { headers: NO_STORE }
    );
  } catch {
    return NextResponse.json({ authenticated: false, user: null }, { status: 500, headers: NO_STORE });
  }
}
