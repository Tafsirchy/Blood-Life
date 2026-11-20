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

    return NextResponse.json({
      authenticated: true,
      user: userDoc || session,
    });
  } catch {
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
