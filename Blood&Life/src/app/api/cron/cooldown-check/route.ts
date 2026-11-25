import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";
import { sendTransactionalEmail } from "@/lib/notifications/email";

export async function GET(req: NextRequest) {
  try {
    // Fail-Closed Cron Authorization
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing cron secret" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const now = new Date();
    // Find donors whose 90-day cooldown has ended and who are currently marked unavailable
    const eligibleDonors = await User.find({
      cooldownUntil: { $lte: now },
      isAvailable: false,
    }).limit(100);

    let updatedCount = 0;

    for (const donor of eligibleDonors) {
      donor.isAvailable = true;
      donor.cooldownUntil = undefined;
      await donor.save();
      updatedCount++;

      // Trigger email celebration
      await sendTransactionalEmail({
        to: donor.email,
        subject: "🎉 আপনার রক্তদানের ৯০ দিনের বিরতি সম্পন্ন হয়েছে — BLOOD&LIFE",
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>অভিনন্দন ${donor.name}!</h2>
            <p>আপনার রক্তদানের ৯০ দিনের বৈজ্ঞানিক বিরতি সফলভাবে সম্পন্ন হয়েছে।</p>
            <p>আজ থেকে আপনার প্রোফাইল পুনরায় রক্তদানের জন্য প্রস্তুত ও সক্রিয় করা হয়েছে। রক্তদানের মাধ্যমে জীবন বাঁচাতে প্রস্তুত থাকুন।</p>
            <p style="color: #64748b; font-size: 12px;">BLOOD&LIFE (ব্লাড অ্যান্ড লাইফ) লাইফ সেভিং নেটওয়ার্ক</p>
          </div>
        `,
      });

      // Trigger In-App Notification
      Notification.create({
        recipientId: String(donor._id),
        category: "COOLDOWN",
        titleEn: "🎉 90-Day Medical Cooldown Complete!",
        titleBn: "🎉 ৯০ দিনের স্বাস্থ্য বিরতি সম্পন্ন হয়েছে!",
        messageEn: "Your 90-day medical interval has concluded. Your profile is active and eligible for donation.",
        messageBn: "আপনার ৯০ দিনের স্বাস্থ্য বিরতি সম্পন্ন হয়েছে। রক্তদানে অংশ নিতে আপনার প্রোফাইল সক্রিয় করা হয়েছে।",
        link: "/dashboard",
        isRead: false,
      }).catch((e) => console.error("Cooldown in-app error:", e));
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    console.error("Cooldown cron error:", error);
    return NextResponse.json(
      { error: process.env.NODE_ENV !== "production" ? error.message : "Cron execution failed" },
      { status: 500 }
    );
  }
}
