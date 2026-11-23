import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DonationRequest } from "@/models/DonationRequest";
import { User } from "@/models/User";
import { getValidatedSession } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/security/validators";
import { sanitizeText } from "@/lib/security/sanitize";

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
    const { donorId, donorName, rating = 5, feedback } = body;

    // Resolve donor identity
    const targetDonorId =
      donorId ||
      request.assignedDonorId ||
      (request.pledges && request.pledges.length > 0 ? request.pledges[0].donorId : undefined);

    const targetDonorName =
      donorName ||
      request.assignedDonorName ||
      (request.pledges && request.pledges.length > 0 ? request.pledges[0].donorName : "Honored Voluntary Donor");

    // Update request
    request.recipientVerification = {
      isVerified: true,
      verifiedDonorId: targetDonorId,
      verifiedDonorName: targetDonorName,
      verifiedAt: new Date(),
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      feedback: feedback ? sanitizeText(feedback, 500) : "স্বেচ্ছায় রক্তদান সফলভাবে সম্পন্ন হয়েছে।",
    };
    request.status = "done";
    await request.save();

    // Reward verified donor if their user profile exists
    if (targetDonorId && isValidObjectId(targetDonorId)) {
      const donorUser = await User.findById(targetDonorId);
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
        const newRating = ((currentRating * (totalReviews - 1)) + Number(rating)) / totalReviews;
        donorUser.trustRating = Number(newRating.toFixed(1));

        await donorUser.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: "রক্তদান ও রক্তদাতার অবদান সফলভাবে ভেরিফাই করা হয়েছে! রক্তদাতার প্রোফাইলে ভেরিফাইড ট্রাস্ট স্টার যুক্ত হয়েছে।",
      verification: request.recipientVerification,
    });
  } catch (error) {
    console.error("Error in recipient-verify:", error);
    return NextResponse.json(
      { error: "Failed to process recipient donation verification." },
      { status: 500 }
    );
  }
}
