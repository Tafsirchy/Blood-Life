import { NextRequest, NextResponse } from "next/server";
import { getValidatedSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";
import { revealDonorContact, maskPhoneNumber } from "@/lib/security/privacyShield";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: donorId } = await params;
    await connectDB();

    const donor = await User.findById(donorId).lean();
    if (!donor) {
      return NextResponse.json({ error: "Donor record not found" }, { status: 404 });
    }

    const session = await getValidatedSession();

    // If unauthenticated or suspended, return masked phone without revealing
    if (!session) {
      return NextResponse.json({
        donorId,
        maskedPhone: maskPhoneNumber(donor.phone),
        requiresLogin: true,
        message: "Sign in to access verified emergency contact.",
      });
    }

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Enforce Privacy Shield rate limiting and audit logging
    const result = await revealDonorContact({
      donorId,
      donorPhone: donor.phone,
      requester: session,
      ipAddress,
      userAgent,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          maskedPhone: maskPhoneNumber(donor.phone),
        },
        { status: 429 }
      );
    }

    if (donor.privacy?.notifyOnProfileView) {
      Notification.create({
        recipientId: String(donor._id),
        category: "SECURITY",
        titleEn: "Contact Number Accessed 🛡️",
        titleBn: "ফোন নম্বর দেখা হয়েছে 🛡️",
        messageEn: `A verified user (${session.name || "Requester"}) viewed your contact number for an emergency transfusion inquiry.`,
        messageBn: `একজন নিবন্ধিত ব্যবহারকারী (${session.name || "রোগীর স্বজন"}) জরুরী রক্তের প্রয়োজনে আপনার ফোন নম্বর সংগ্রহ করেছেন।`,
        link: "/dashboard/settings",
        isRead: false,
      }).catch((e) => console.error("Donor view notif error:", e));
    }

    return NextResponse.json({
      donorId,
      phone: result.phone,
      remainingViews: result.remainingViews,
      accessedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Failed to resolve contact" }, { status: 500 });
  }
}
