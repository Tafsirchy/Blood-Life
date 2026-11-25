import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DonationRequest } from "@/models/DonationRequest";
import { User } from "@/models/User";
import { TransfusionLog } from "@/models/TransfusionLog";
import { getValidatedSession } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/security/validators";
import { sanitizeText } from "@/lib/security/sanitize";
import { dispatchDonationVerifiedAlerts } from "@/lib/notifications/dispatcher";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid request ID format" }, { status: 400 });
    }

    const session = await getValidatedSession();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required to verify donation." },
        { status: 401 }
      );
    }

    await connectDB();
    const request = await DonationRequest.findById(id);

    if (!request) {
      return NextResponse.json({ error: "Transfusion request not found" }, { status: 404 });
    }

    // Verify ownership: must be the requester or admin/volunteer
    const isOwner =
      String(request.requesterId) === String(session.userId) ||
      request.requesterEmail?.toLowerCase() === session.email?.toLowerCase();
    const isStaff = session.role === "Admin" || session.role === "Volunteer";

    if (!isOwner && !isStaff) {
      return NextResponse.json(
        { error: "Only the patient requester or clinical supervisor can verify this donation." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { donorId, donorName, donorPhone, rating = 5, feedback } = body;

    // Resolve donor identity from body, assigned donor, or first pledge
    const matchedPledge = request.pledges?.find(
      (p) => (donorId && p.donorId === donorId) || (donorPhone && p.donorPhone === donorPhone)
    ) || request.pledges?.[0];

    let targetDonorId = donorId || request.assignedDonorId || matchedPledge?.donorId;
    let targetDonorName = donorName || request.assignedDonorName || matchedPledge?.donorName || "স্বেচ্ছাসেবী রক্তদাতা";
    const targetDonorPhone = donorPhone || matchedPledge?.donorPhone;

    // Resolve donor user in database (by ObjectId or Phone)
    let donorUser = null;
    if (targetDonorId && isValidObjectId(targetDonorId)) {
      donorUser = await User.findById(targetDonorId);
    }
    if (!donorUser && targetDonorPhone) {
      const cleanPhone = targetDonorPhone.replace(/[^0-9]/g, "");
      if (cleanPhone.length >= 8) {
        donorUser = await User.findOne({
          phone: { $regex: cleanPhone.slice(-10), $options: "i" },
        });
      }
    }

    if (donorUser) {
      targetDonorId = String(donorUser._id);
      targetDonorName = donorUser.name || targetDonorName;
    }

    const numericRating = Math.min(5, Math.max(1, Number(rating) || 5));
    const cleanFeedback = feedback ? sanitizeText(feedback, 500) : "স্বেচ্ছায় রক্তদান সফলভাবে সম্পন্ন হয়েছে।";

    // Update request state
    request.recipientVerification = {
      isVerified: true,
      verifiedDonorId: targetDonorId,
      verifiedDonorName: targetDonorName,
      verifiedAt: new Date(),
      rating: numericRating,
      feedback: cleanFeedback,
    };
    request.status = "done";
    await request.save();

    // Reward verified donor if their user profile exists
    if (donorUser) {
      donorUser.verifiedDonations = (donorUser.verifiedDonations || 0) + 1;
      donorUser.totalDonations = Math.max(donorUser.totalDonations || 0, donorUser.verifiedDonations);
      donorUser.lastDonationDate = new Date();

      // Calculate 90-day cooldown until next safe whole blood donation
      const cooldown = new Date();
      cooldown.setDate(cooldown.getDate() + 90);
      donorUser.cooldownUntil = cooldown;
      donorUser.isAvailable = false;

      // Recalculate 5-star trust rating
      const currentRating = donorUser.trustRating || 5.0;
      const totalReviews = donorUser.verifiedDonations;
      const newRating = ((currentRating * (totalReviews - 1)) + numericRating) / totalReviews;
      donorUser.trustRating = Number(newRating.toFixed(1));

      await donorUser.save();
    }

    // Create or update permanent TransfusionLog ledger
    let transfusionLog = await TransfusionLog.findOne({
      requestId: String(request._id),
    });

    if (!transfusionLog) {
      const certificateId = `BL-CERT-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      transfusionLog = await TransfusionLog.create({
        requestId: String(request._id),
        donorId: targetDonorId || "unregistered-donor",
        recipientName: request.recipientName,
        bloodGroup: request.bloodGroup,
        hospital: request.hospital,
        completedAt: new Date(),
        certificateId,
        recipientVerified: true,
        rating: numericRating,
        recipientFeedback: cleanFeedback,
      });
    } else {
      transfusionLog.recipientVerified = true;
      transfusionLog.rating = numericRating;
      transfusionLog.recipientFeedback = cleanFeedback;
      if (targetDonorId) transfusionLog.donorId = targetDonorId;
      await transfusionLog.save();
    }

    if (donorUser) {
      dispatchDonationVerifiedAlerts({
        donorId: String(donorUser._id),
        donorName: donorUser.name,
        donorEmail: donorUser.email,
        patientName: request.recipientName,
        hospital: request.hospital,
        bloodGroup: request.bloodGroup,
        rating: numericRating,
        certificateId: transfusionLog.certificateId,
      }).catch((e) => console.error("Donation verified dispatch error:", e));
    }

    return NextResponse.json({
      success: true,
      message: "রক্তদান ও রক্তদাতার অবদান সফলভাবে ভেরিফাই করা হয়েছে! রক্তদাতার প্রোফাইলে ভেরিফাইড ট্রাস্ট স্টার যুক্ত হয়েছে।",
      verification: request.recipientVerification,
      certificateId: transfusionLog.certificateId,
    });
  } catch (error) {
    console.error("Error in recipient-verify:", error);
    return NextResponse.json(
      { error: "Failed to process recipient donation verification." },
      { status: 500 }
    );
  }
}
