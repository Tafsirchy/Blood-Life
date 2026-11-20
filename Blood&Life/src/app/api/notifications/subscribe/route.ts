import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { PushSubscription } from "@/models/PushSubscription";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint, keys, bloodGroup, district } = body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return NextResponse.json(
        { error: "Invalid subscription payload" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const session = await getSession();

    await PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        endpoint,
        keys,
        userId: session?.userId,
        bloodGroup: bloodGroup || session?.bloodGroup,
        district: district || session?.district,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Push notification subscription registered successfully",
    });
  } catch (error: any) {
    console.error("Push subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to register push subscription" },
      { status: 500 }
    );
  }
}
