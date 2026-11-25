import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getServerSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function POST() {
  try {
    const session = await getServerSession();
    if (session?.userId) {
      await connectDB();
      // Server-side revocation: invalidate this and any duplicate JWTs via tokenVersion
      await User.findByIdAndUpdate(session.userId, { $inc: { tokenVersion: 1 } }).catch(() => {});
    }
  } catch {
    // Always clear client cookie even if DB revocation encounters a transient error
  }

  const response = NextResponse.json(
    { success: true, message: "Logged out" },
    { headers: { "Cache-Control": "no-store, private" } }
  );
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });
  return response;
}
