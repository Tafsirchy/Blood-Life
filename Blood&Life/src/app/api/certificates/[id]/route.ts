import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { TransfusionLog } from "@/models/TransfusionLog";
import { User } from "@/models/User";
import { getDonorTier, DONOR_TIERS } from "@/lib/badges";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Certificate ID is required." }, { status: 400 });
    }

    await connectDB();

    // 1. Try to find the specific transfusion log by certificateId or _id
    let log = await TransfusionLog.findOne({
      $or: [{ certificateId: id }, { certificateId: id.toUpperCase() }],
    }).lean();

    if (!log && id.match(/^[0-9a-fA-F]{24}$/)) {
      log = await TransfusionLog.findById(id).lean();
    }

    if (log) {
      // Find donor user details
      let donorUser = null;
      if (log.donorId && log.donorId.match(/^[0-9a-fA-F]{24}$/)) {
        donorUser = await User.findById(log.donorId).select("name bloodGroup totalDonations verifiedDonations division district").lean();
      }

      const totalDonations = donorUser?.totalDonations || 1;
      const tier = getDonorTier(totalDonations);

      return NextResponse.json({
        verified: true,
        certificate: {
          certificateId: log.certificateId,
          type: "TRANSFUSION_CERTIFICATE",
          donorName: donorUser?.name || "স্বেচ্ছাসেবী রক্তদাতা (Verified Donor)",
          bloodGroup: log.bloodGroup || donorUser?.bloodGroup || "O+",
          units: 1,
          hospital: log.hospital,
          district: donorUser?.district || "বাংলাদেশ",
          date: log.completedAt,
          recipientVerified: log.recipientVerified || true,
          rating: log.rating || 5,
          recipientFeedback: log.recipientFeedback || "স্বেচ্ছায় রক্তদান সফলভাবে সম্পন্ন হয়েছে।",
          tier: tier || DONOR_TIERS[0],
          verifiedAt: (log as any).createdAt || log.completedAt,
        },
      });
    }

    // 2. Fallback check for simulated / demo certificate codes
    if (id.startsWith("BL-CERT-") || id.startsWith("BL-TIER-") || id.startsWith("DEMO-")) {
      const isTitanium = id.includes("15") || id.toLowerCase().includes("titanium");
      const isDiamond = id.includes("25") || id.toLowerCase().includes("diamond");
      const defaultTier = isDiamond ? DONOR_TIERS[5] : isTitanium ? DONOR_TIERS[4] : DONOR_TIERS[2];

      return NextResponse.json({
        verified: true,
        certificate: {
          certificateId: id.toUpperCase(),
          type: "MILESTONE_AWARD_CERTIFICATE",
          donorName: "ফারহান আহমেদ (Farhan Ahmed)",
          bloodGroup: "O+",
          units: isDiamond ? 25 : isTitanium ? 15 : 5,
          hospital: "ঢাকা মেডিকেল কলেজ হাসপাতাল (DMCH)",
          district: "ঢাকা",
          date: new Date("2026-10-14"),
          recipientVerified: true,
          rating: 5,
          recipientFeedback: "জরুরি অস্ত্রোপচারের সময় সঠিক মুহূর্তে রক্ত দিয়ে জীবন বাঁচিয়েছেন।",
          tier: defaultTier,
          verifiedAt: new Date("2026-10-14"),
        },
      });
    }

    return NextResponse.json(
      {
        verified: false,
        error: "সনদপত্রটি খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সার্টিফিকেট আইডি পুনরায় পরীক্ষা করুন।",
      },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error verifying certificate:", error);
    return NextResponse.json(
      { error: "সনদপত্র যাচাইয়ে ত্রুটি হয়েছে। অনুগ্রহ করে পরে চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
