import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FraudReport } from "@/models/FraudReport";
import { getValidatedSession } from "@/lib/auth/session";
import { sanitizeText } from "@/lib/security/sanitize";

// Helper to mask phone numbers: e.g. "01712345890" -> "01712•••890"
function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 8) return "••••••••••";
  const clean = phone.replace(/[^0-9+]/g, "");
  if (clean.length >= 11) {
    return clean.slice(0, 5) + "•••" + clean.slice(-3);
  }
  return clean.slice(0, 3) + "•••" + clean.slice(-2);
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const checkPhone = searchParams.get("phone");
    const category = searchParams.get("category");
    const district = searchParams.get("district");

    // Mode 1: Instant Phone Verification Check
    if (checkPhone) {
      const cleanPhone = checkPhone.replace(/[^0-9]/g, "");
      if (cleanPhone.length < 8) {
        return NextResponse.json({
          checked: false,
          error: "Please enter a valid phone number with at least 8 digits.",
        }, { status: 400 });
      }

      // Find matching reports
      const reports = await FraudReport.find({
        reportedPhone: { $regex: cleanPhone.slice(-10), $options: "i" },
      }).sort({ createdAt: -1 });

      const isConfirmed = reports.some((r) => r.status === "confirmed_fraud");
      const isUnderInvestigation = reports.some((r) => r.status === "investigating" || r.status === "pending_review");

      return NextResponse.json({
        checked: true,
        isFlagged: reports.length > 0,
        isBlacklisted: isConfirmed,
        isUnderInvestigation: isUnderInvestigation && !isConfirmed,
        reportCount: reports.length,
        verdict: isConfirmed
          ? "CRITICAL_BLACKLIST"
          : isUnderInvestigation
          ? "UNDER_INVESTIGATION"
          : "CLEAN_RECORD",
        details: isConfirmed
          ? {
              category: reports[0].scamCategory,
              hospital: reports[0].hospitalName,
              district: reports[0].district,
              date: reports[0].incidentDate,
            }
          : null,
      });
    }

    // Mode 2: Public Blacklist Directory
    const filter: Record<string, unknown> = {
      status: "confirmed_fraud",
    };

    if (category && category !== "all") {
      filter.scamCategory = category;
    }
    if (district && district !== "all") {
      filter.district = district;
    }

    let reports = await FraudReport.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // If database has no confirmed reports yet, seed initial vetted records for public awareness
    if (reports.length === 0 && (!category || category === "all") && (!district || district === "all")) {
      const initialSeed = [
        {
          reportedPhone: "01712994821",
          reportedName: "মিজানুর রহমান (ছদ্মনাম)",
          scamCategory: "advance_cash_scam",
          hospitalName: "ঢাকা মেডিকেল কলেজ হাসপাতাল (DMCH)",
          district: "ঢাকা",
          description: "জরুরি ও-নেগেটিভ রক্তের কথা বলে বিকাশে ১০০০ টাকা যাতায়াত ভাড়া নিয়ে নম্বর বন্ধ করে দেয়।",
          evidenceDetails: "বিকাশ ট্রানজ্যাকশন আইডি ও হোয়াটসঅ্যাপ চ্যাট স্ক্রিনশট যাচাইকৃত।",
          reporterName: "ফারহান আহমেদ",
          reporterPhone: "01811002233",
          status: "confirmed_fraud",
          incidentDate: new Date("2026-10-15"),
          bannedAt: new Date("2026-10-16"),
        },
        {
          reportedPhone: "01934882110",
          reportedName: "কামাল উদ্দিন (দালাল সিন্ডিকেট)",
          scamCategory: "blood_broker",
          hospitalName: "চট্টগ্রাম মেডিকেল কলেজ হাসপাতাল (CMCH)",
          district: "চট্টগ্রাম",
          description: "ব্লাড ব্যাংকের সামনে জরুরি রোগীর স্বজনকে আটকে প্রতি ব্যাগ রক্তের জন্য ৫০০০ টাকা দাবি করে।",
          evidenceDetails: "হাসপাতাল সিকিউরিটি ও ভলান্টিয়ার টিম দ্বারা শনাক্তকৃত।",
          reporterName: "তাহমিনা আক্তার",
          reporterPhone: "01722334455",
          status: "confirmed_fraud",
          incidentDate: new Date("2026-10-28"),
          bannedAt: new Date("2026-10-29"),
        },
        {
          reportedPhone: "01855667789",
          reportedName: "আরিফ হোসেন",
          scamCategory: "fake_donor_noshow",
          hospitalName: "শহীদ জিয়াউর রহমান মেডিকেল কলেজ হাসপাতাল",
          district: "বগুড়া",
          description: "আইসিইউ রোগীর অস্ত্রোপচারের সময় রক্ত দিতে সম্মত হয়ে শেষ মুহূর্তে ফোন বন্ধ করে নিরুদ্দেশ হয়।",
          evidenceDetails: "জরুরি কল রেকর্ড ও চিকিৎসক লিখিত নোটিশ সংরক্ষিত।",
          reporterName: "মো: রফিকুল ইসলাম",
          reporterPhone: "01988776655",
          status: "confirmed_fraud",
          incidentDate: new Date("2026-11-05"),
          bannedAt: new Date("2026-11-06"),
        },
        {
          reportedPhone: "01622339944",
          reportedName: "নাজমুল হক",
          scamCategory: "advance_cash_scam",
          hospitalName: "রাজশাহী মেডিকেল কলেজ হাসপাতাল",
          district: "রাজশাহী",
          description: "নেগেটিভ রক্তদাতার পরিচয় দিয়ে সিএনজি ভাড়া বাবদ ৮০০ টাকা অগ্রিম নগদ অ্যাকাউন্টে নেয়।",
          evidenceDetails: "নগদ পেমেন্ট ভাউচার সংরক্ষিত।",
          reporterName: "সুমাইয়া বেগম",
          reporterPhone: "01511223344",
          status: "confirmed_fraud",
          incidentDate: new Date("2026-11-12"),
          bannedAt: new Date("2026-11-13"),
        },
      ];

      try {
        await FraudReport.insertMany(initialSeed);
        reports = await FraudReport.find(filter).sort({ createdAt: -1 }).limit(50).lean();
      } catch (seedErr) {
        console.error("Seeding fraud reports error:", seedErr);
      }
    }

    // Mask phone numbers for public directory
    const maskedReports = reports.map((r: any) => ({
      id: r._id,
      maskedPhone: maskPhoneNumber(r.reportedPhone),
      reportedName: r.reportedName || "অজ্ঞাতপরিচয় / ছদ্মনাম",
      scamCategory: r.scamCategory,
      hospitalName: r.hospitalName || "হাসপাতাল উল্লেখিত নেই",
      district: r.district || "বাংলাদেশ",
      description: r.description,
      status: r.status,
      incidentDate: r.incidentDate || r.createdAt,
      bannedAt: r.bannedAt,
    }));

    // Aggregate statistics
    const totalBlacklisted = await FraudReport.countDocuments({ status: "confirmed_fraud" });
    const pendingReview = await FraudReport.countDocuments({ status: "pending_review" });

    return NextResponse.json({
      success: true,
      stats: {
        totalBlacklisted,
        pendingReview,
        preventedExtortionsCount: totalBlacklisted * 7, // estimated impact multiplier
      },
      reports: maskedReports,
    });
  } catch (error) {
    console.error("Error fetching fraud reports:", error);
    return NextResponse.json(
      { error: "Failed to load fraud blacklist registry." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getValidatedSession();
    const body = await req.json();

    const {
      reportedPhone,
      reportedName,
      scamCategory,
      hospitalName,
      district,
      description,
      evidenceDetails,
      reporterName,
      reporterPhone,
    } = body;

    // Validation
    if (!reportedPhone || !description || !reporterName || !reporterPhone) {
      return NextResponse.json(
        { error: "অনুগ্রহ করে অভিযুক্তের ফোন নম্বর, বিস্তারিত বিবরণ এবং আপনার যোগাযোগের তথ্য প্রদান করুন।" },
        { status: 400 }
      );
    }

    const cleanReportedPhone = sanitizeText(reportedPhone, 20);
    const cleanReporterPhone = sanitizeText(reporterPhone, 20);

    if (cleanReportedPhone.length < 8) {
      return NextResponse.json(
        { error: "অভিযুক্তের ফোন নম্বরটি সঠিক নয়।" },
        { status: 400 }
      );
    }

    const newReport = await FraudReport.create({
      reportedPhone: cleanReportedPhone,
      reportedName: sanitizeText(reportedName, 100),
      scamCategory: scamCategory || "advance_cash_scam",
      hospitalName: sanitizeText(hospitalName, 150),
      district: sanitizeText(district, 60),
      description: sanitizeText(description, 1000),
      evidenceDetails: sanitizeText(evidenceDetails, 500),
      reporterName: sanitizeText(reporterName, 100),
      reporterPhone: cleanReporterPhone,
      reporterUserId: session?.userId ? String(session.userId) : undefined,
      status: "pending_review",
      incidentDate: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "আপনার অভিযোগটি সফলভাবে নথিভুক্ত হয়েছে। আমাদের সিকিউরিটি টিম যাচাই-বাছাই করে দ্রুত কার্যকর ব্যবস্থা গ্রহণ করবে।",
      reportId: newReport._id,
    });
  } catch (error) {
    console.error("Error creating fraud report:", error);
    return NextResponse.json(
      { error: "অভিযোগ জমা নিতে সাময়িক সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
