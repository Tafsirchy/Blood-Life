import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DonationRequest } from "@/models/DonationRequest";
import { User } from "@/models/User";
import { getValidatedSession } from "@/lib/auth/session";
import { dispatchPledgeAlerts } from "@/lib/notifications/dispatcher";
import { checkRateLimit } from "@/lib/security/rateLimiter";
import { isValidObjectId } from "@/lib/security/validators";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getValidatedSession();
    if (!session) {
      return NextResponse.json(
        { error: "Please log in with an active account to pledge a donation" },
        { status: 401 }
      );
    }

    // Rate Limiting: 8 pledges per 5 minutes per donor
    const pledgeLimit = await checkRateLimit(`pledge-donor:${session.userId}`, 8, 300);
    if (!pledgeLimit.success) {
      return NextResponse.json(
        { error: "Too many pledge attempts. Please wait a few moments before trying again." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.max(1, Math.ceil(pledgeLimit.resetMs / 1000))) },
        }
      );
    }

    const { id: requestId } = await params;
    if (!isValidObjectId(requestId)) {
      return NextResponse.json({ error: "Invalid request ID format" }, { status: 400 });
    }

    await connectDB();

    const [donationCase, donor] = await Promise.all([
      DonationRequest.findById(requestId),
      User.findById(session.userId),
    ]);

    if (!donationCase) {
      return NextResponse.json({ error: "Case record not found" }, { status: 404 });
    }

    if (!donor) {
      return NextResponse.json({ error: "Donor profile not found" }, { status: 404 });
    }

    if (donationCase.requesterId === session.userId) {
      return NextResponse.json({ error: "You cannot pledge blood to your own request" }, { status: 400 });
    }

    if (donationCase.status !== "pending") {
      return NextResponse.json({ error: "This request has already been assigned, completed, or expired" }, { status: 400 });
    }

    // Check if request deadline has already passed
    if (donationCase.expiresAt && new Date(donationCase.expiresAt) <= new Date()) {
      donationCase.status = "expired";
      await donationCase.save();
      return NextResponse.json(
        { error: "The surgical transfusion deadline for this emergency request has expired." },
        { status: 400 }
      );
    }

    // 90-Day Cooldown Validation
    if (donor.cooldownUntil && new Date(donor.cooldownUntil) > new Date()) {
      const daysRemaining = Math.ceil(
        (new Date(donor.cooldownUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return NextResponse.json(
        {
          error: `You are currently in a 90-day medical cooldown. You will be eligible to donate again in ${daysRemaining} day(s).`,
        },
        { status: 400 }
      );
    }

    // Multi-unit pledge tracking with atomic concurrency control
    const newPledge = {
      donorId: session.userId,
      donorName: donor.name,
      donorPhone: donor.phone,
      units: 1,
      status: "pledged",
      timestamp: new Date(),
    };

    // Atomic conditional increment: ensures concurrent clicks cannot oversaturate unitsNeeded
    const updatedCase = await DonationRequest.findOneAndUpdate(
      {
        _id: requestId,
        status: "pending",
        $expr: { $lt: [{ $ifNull: ["$pledgedUnits", 0] }, "$unitsNeeded"] },
      },
      {
        $inc: { pledgedUnits: 1 },
        $push: { pledges: newPledge },
        $set: {
          assignedDonorId: session.userId,
          assignedDonorName: donor.name,
        },
      },
      { new: true }
    );

    if (!updatedCase) {
      return NextResponse.json(
        { error: "This emergency request has already been fully pledged by other donors." },
        { status: 409 }
      );
    }

    const currentPledged = updatedCase.pledgedUnits || 0;

    // If all required bags are secured, transition status to inprogress
    if (currentPledged >= updatedCase.unitsNeeded && updatedCase.status === "pending") {
      updatedCase.status = "inprogress";
      await updatedCase.save();
    }

    // Notify patient relative / requester that a donor pledged blood
    dispatchPledgeAlerts({
      requestId: String(updatedCase._id),
      recipientName: updatedCase.recipientName,
      requesterId: updatedCase.requesterId,
      donorName: donor.name,
      donorBloodGroup: donor.bloodGroup,
      hospital: updatedCase.hospital,
    }).catch((e) => console.error("Async pledge notification error:", e));

    return NextResponse.json({
      success: true,
      message: currentPledged >= updatedCase.unitsNeeded
        ? "Thank you! All required blood bags have been pledged. Proceeding to hospital coordination."
        : `Thank you! 1 unit pledged (${currentPledged} of ${updatedCase.unitsNeeded} secured). Request remains active for remaining units.`,
      pledgedUnits: currentPledged,
      unitsNeeded: updatedCase.unitsNeeded,
      assignedDonor: {
        id: donor._id,
        name: donor.name,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to process donation pledge" }, { status: 500 });
  }
}
