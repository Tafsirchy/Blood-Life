import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { getServerSession } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/security/validators";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    await connectDB();

    const notifications = await Notification.find({ recipientId: session.userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = await Notification.countDocuments({
      recipientId: session.userId,
      isRead: false,
    });

    return NextResponse.json({
      notifications: notifications.map((n: any) => ({
        id: String(n._id),
        category: n.category,
        titleEn: n.titleEn,
        titleBn: n.titleBn,
        messageEn: n.messageEn,
        messageBn: n.messageBn,
        link: n.link || "/dashboard",
        isRead: n.isRead,
        createdAt: n.createdAt,
      })),
      unreadCount,
    });
  } catch (error: any) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json({ error: "Failed to retrieve notifications" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, id } = body;

    await connectDB();

    if (action === "markAllRead") {
      await Notification.updateMany(
        { recipientId: session.userId, isRead: false },
        { $set: { isRead: true } }
      );
      return NextResponse.json({ success: true, message: "All notifications marked as read." });
    }

    if (id) {
      if (!isValidObjectId(id)) {
        return NextResponse.json({ error: "Invalid notification ID format" }, { status: 400 });
      }
      const updated = await Notification.findOneAndUpdate(
        { _id: id, recipientId: session.userId },
        { $set: { isRead: true } },
        { new: true }
      );
      return NextResponse.json({ success: true, notification: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Notification update error:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
