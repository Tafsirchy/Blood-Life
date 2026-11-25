import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { TransfusionLog } from "@/models/TransfusionLog";
import { DonationRequest } from "@/models/DonationRequest";
import { User } from "@/models/User";
import { getValidatedSession } from "@/lib/auth/session";
import { sanitizeText } from "@/lib/security/sanitize";

export async function GET(req: NextRequest) {
  try {
    const session = await getValidatedSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userId = session.userId;

    // Fetch transfusion logs completed by this donor
    const logs = await TransfusionLog.find({ donorId: userId })
      .sort({ completedAt: -1 })
      .lean();

    // Fetch emergency cases this donor has pledged to help
    const pledgedRequests = await DonationRequest.find({
      "pledges.donorId": userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    const user = await User.findById(userId)
      .select("totalDonations verifiedDonations lastDonationDate cooldownUntil bloodGroup")
      .lean();

    return NextResponse.json({
      transfusionLogs: logs || [],
      pledgedRequests: pledgedRequests || [],
      totalDonations: user?.totalDonations || logs.length || 0,
      verifiedDonations: user?.verifiedDonations || 0,
      lastDonationDate: user?.lastDonationDate || (logs[0]?.completedAt ?? null),
      cooldownUntil: user?.cooldownUntil || null,
      bloodGroup: user?.bloodGroup || "O+",
    });
  } catch (err: any) {
    console.error("Error in GET /api/donations:", err);
    return NextResponse.json({ error: "Failed to fetch donation records" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getValidatedSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      recipientName,
      hospital,
      district,
      units = 1,
      completedAt = new Date().toISOString(),
      bloodGroup,
    } = body;

    if (!recipientName || !hospital) {
      return NextResponse.json(
        { error: "Recipient name and hospital are required." },
        { status: 400 }
      );
    }

    const parsedUnits = Math.min(3, Math.max(1, Number(units) || 1));
    const donationDate = new Date(completedAt);
    if (isNaN(donationDate.getTime()) || donationDate.getTime() > Date.now() + 24 * 60 * 60 * 1000) {
      return NextResponse.json({ error: "Invalid donation completion date." }, { status: 400 });
    }

    await connectDB();
    const userId = session.userId;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const certificateId = `BL-CERT-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newLog = await TransfusionLog.create({
      requestId: body.requestId || `manual-${Date.now()}`,
      donorId: userId,
      recipientName: sanitizeText(recipientName, 100),
      bloodGroup: bloodGroup || user.bloodGroup || "O+",
      hospital: sanitizeText(hospital, 150),
      district: district ? sanitizeText(district, 60) : user.district,
      units: parsedUnits,
      completedAt: donationDate,
      certificateId,
      recipientVerified: false,
    });

    // Update user stats and recalculate 90-day cooldown if this is the most recent donation
    user.totalDonations = (user.totalDonations || 0) + parsedUnits;
    if (!user.lastDonationDate || donationDate.getTime() >= new Date(user.lastDonationDate).getTime()) {
      user.lastDonationDate = donationDate;
      const cooldownDate = new Date(donationDate.getTime() + 90 * 24 * 60 * 60 * 1000);
      const inCooldown = cooldownDate > new Date();
      user.cooldownUntil = inCooldown ? cooldownDate : undefined;
      user.isAvailable = !inCooldown;
    }
    await user.save();

    return NextResponse.json({
      success: true,
      log: newLog,
      totalDonations: user.totalDonations,
      lastDonationDate: user.lastDonationDate,
      cooldownUntil: user.cooldownUntil,
    });
  } catch (err: any) {
    console.error("Error in POST /api/donations:", err);
    return NextResponse.json({ error: "Failed to log donation" }, { status: 500 });
  }
}
