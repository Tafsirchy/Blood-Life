import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DonationRequest } from "@/models/DonationRequest";
import { User } from "@/models/User";
import { getServerSession } from "@/lib/auth/session";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Please log in to pledge a donation" }, { status: 401 });
    }

    const { id: requestId } = await params;
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

    // Multi-unit pledge tracking
    const currentPledged = (donationCase.pledgedUnits || 0) + 1;
    donationCase.pledgedUnits = currentPledged;
    
    // Add to pledges audit list
    donationCase.pledges = donationCase.pledges || [];
    donationCase.pledges.push({
      donorId: session.userId,
      donorName: donor.name,
      donorPhone: donor.phone,
      units: 1,
      status: "pledged",
      timestamp: new Date(),
    });

    // If all required bags are secured, transition status to inprogress
    if (currentPledged >= donationCase.unitsNeeded) {
      donationCase.status = "inprogress";
    }
    donationCase.assignedDonorId = session.userId;
    donationCase.assignedDonorName = donor.name;
    await donationCase.save();

    return NextResponse.json({
      success: true,
      message: currentPledged >= donationCase.unitsNeeded
        ? "Thank you! All required blood bags have been pledged. Proceeding to hospital coordination."
        : `Thank you! 1 unit pledged (${currentPledged} of ${donationCase.unitsNeeded} secured). Request remains active for remaining units.`,
      pledgedUnits: currentPledged,
      unitsNeeded: donationCase.unitsNeeded,
      assignedDonor: {
        id: donor._id,
        name: donor.name,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to process donation pledge" }, { status: 500 });
  }
}
