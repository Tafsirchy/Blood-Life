import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PushSubscription } from "@/models/PushSubscription";
import { getValidatedSession } from "@/lib/auth/session";

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

    await connectDB();
    const session = await getValidatedSession();

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

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);
    const endpoint = body.endpoint || searchParams.get("endpoint");

    await connectDB();
    const session = await getValidatedSession();

    if (endpoint) {
      await PushSubscription.deleteOne({ endpoint });
      return NextResponse.json({ success: true, message: "Push subscription removed." });
    }

    if (session) {
      await PushSubscription.deleteMany({ userId: session.userId });
      return NextResponse.json({ success: true, message: "All device push subscriptions removed." });
    }

    return NextResponse.json({ error: "Endpoint or authenticated session required" }, { status: 400 });
  } catch (error: any) {
    console.error("Push unsubscribe error:", error);
    return NextResponse.json({ error: "Failed to unsubscribe push notifications" }, { status: 500 });
  }
}
