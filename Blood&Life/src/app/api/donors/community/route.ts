import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CommunityDonorSubmission } from "@/models/CommunityDonorSubmission";
import { getValidatedSession } from "@/lib/auth/session";
import { sanitizeText } from "@/lib/security/sanitize";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getValidatedSession();
    const { searchParams } = new URL(req.url);

    const division = searchParams.get("division");
    const district = searchParams.get("district");
    const upazila = searchParams.get("upazila");
    const thana = searchParams.get("thana");
    const bloodGroup = searchParams.get("bloodGroup");
    const requestedStatus = searchParams.get("status");

    const isStaff = session && (session.role === "Admin" || session.role === "Volunteer");

    const filter: Record<string, unknown> = {};

    // Only staff can view pending or rejected review triage queues
    if (requestedStatus && isStaff) {
      if (requestedStatus !== "all") {
        filter.status = requestedStatus;
      }
    } else {
      filter.status = "approved";
    }

    if (division && division !== "all") {
      filter.division = { $regex: new RegExp(`^${division}$`, "i") };
    }
    if (district && district !== "all") {
      filter.district = { $regex: new RegExp(`^${district}$`, "i") };
    }
    if (upazila && upazila !== "all") {
      filter.upazila = { $regex: new RegExp(`^${upazila}$`, "i") };
    }
    if (thana && thana !== "all") {
      filter.thana = { $regex: thana, $options: "i" };
    }
    if (bloodGroup && bloodGroup !== "all") {
      filter.bloodGroup = bloodGroup.replace(" ", "+");
    }

    const submissions = await CommunityDonorSubmission.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Mask phone numbers for guests / public view
    const safeSubmissions = submissions.map((s: any) => {
      const phone = s.donorPhone || "";
      const isPublicMasked = !isStaff && !session;
      const maskedPhone =
        isPublicMasked && phone.length >= 11
          ? phone.slice(0, 5) + "•••" + phone.slice(-3)
          : phone;

      return {
        id: s._id,
        donorName: s.donorName,
        donorPhone: maskedPhone,
        bloodGroup: s.bloodGroup,
        division: s.division,
        district: s.district,
        upazila: s.upazila,
        thana: s.thana,
        age: s.age,
        gender: s.gender,
        lastDonationDate: s.lastDonationDate,
        status: s.status,
        submitterName: isStaff ? s.submitterName : undefined,
        submitterPhone: isStaff ? s.submitterPhone : undefined,
        submitterRelationship: s.submitterRelationship,
        adminNotes: s.adminNotes,
        createdAt: s.createdAt,
      };
    });

    const pendingCount = isStaff
      ? await CommunityDonorSubmission.countDocuments({ status: "pending_review" })
      : 0;

    return NextResponse.json({
      success: true,
      count: safeSubmissions.length,
      pendingCount,
      donors: safeSubmissions,
    });
  } catch (error) {
    console.error("Error fetching community donors:", error);
    return NextResponse.json(
      { error: "Failed to load community donor directory." },
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
      donorName,
      donorPhone,
      bloodGroup,
      division,
      district,
      upazila,
      thana,
      age,
      gender,
      lastDonationDate,
      submitterName,
      submitterPhone,
      submitterRelationship,
    } = body;

    // Validation
    if (
      !donorName ||
      !donorPhone ||
      !bloodGroup ||
      !division ||
      !district ||
      !upazila ||
      !submitterName ||
      !submitterPhone
    ) {
      return NextResponse.json(
        {
          error:
            "অনুগ্রহ করে রক্তদাতার নাম, ফোন নম্বর, রক্তের গ্রুপ, বিভাগ, জেলা, উপজেলা এবং সুপারিশকারীর তথ্য পূরণ করুন।",
        },
        { status: 400 }
      );
    }

    const cleanDonorPhone = donorPhone.replace(/[^0-9+]/g, "").trim();
    const cleanSubmitterPhone = submitterPhone.replace(/[^0-9+]/g, "").trim();

    if (cleanDonorPhone.length < 8) {
      return NextResponse.json(
        { error: "রক্তদাতার ফোন নম্বরটি সঠিক নয়।" },
        { status: 400 }
      );
    }

    const normalizedGender = gender
      ? gender.toLowerCase() === "female"
        ? "female"
        : gender.toLowerCase() === "other"
        ? "other"
        : "male"
      : "male";

    const newSubmission = await CommunityDonorSubmission.create({
      donorName: sanitizeText(donorName, 100),
      donorPhone: cleanDonorPhone,
      bloodGroup,
      division: sanitizeText(division, 50),
      district: sanitizeText(district, 50),
      upazila: sanitizeText(upazila, 50),
      thana: sanitizeText(thana || upazila, 50),
      age: age ? Number(age) : undefined,
      gender: normalizedGender,
      lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : undefined,
      submitterName: sanitizeText(submitterName, 100),
      submitterPhone: cleanSubmitterPhone,
      submitterRelationship: sanitizeText(submitterRelationship || "স্বেচ্ছাসেবী", 50),
      status: "pending_review",
      createdUserId: session?.userId ? String(session.userId) : undefined,
    });

    return NextResponse.json({
      success: true,
      message:
        "রক্তদাতার তথ্য সফলভাবে জমা হয়েছে! আমাদের ভলান্টিয়ার টিম যাচাই-বাছাই করে অনুমোদন করলে তা পাবলিক ডিরেক্টরিতে প্রদর্শিত হবে।",
      submissionId: newSubmission._id,
    });
  } catch (error) {
    console.error("Error creating community donor submission:", error);
    return NextResponse.json(
      { error: "তথ্য জমা নিতে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
