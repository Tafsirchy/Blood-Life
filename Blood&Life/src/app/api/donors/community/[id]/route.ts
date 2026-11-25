import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CommunityDonorSubmission } from "@/models/CommunityDonorSubmission";
import { User } from "@/models/User";
import { AuditLog } from "@/models/AuditLog";
import { getValidatedSession } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/security/validators";
import { sanitizeText } from "@/lib/security/sanitize";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid submission ID format." }, { status: 400 });
    }

    const session = await getValidatedSession();
    if (!session || (session.role !== "Admin" && session.role !== "Volunteer")) {
      return NextResponse.json(
        { error: "Unauthorized. Admin or Volunteer privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      action,
      adminNotes,
      donorName,
      donorPhone,
      bloodGroup,
      division,
      district,
      upazila,
      thana,
      age,
      gender,
    } = body; // action: 'APPROVE' | 'REJECT' | 'EDIT'

    if (action !== "APPROVE" && action !== "REJECT" && action !== "EDIT") {
      return NextResponse.json(
        { error: "Invalid action. Must be APPROVE, REJECT, or EDIT." },
        { status: 400 }
      );
    }

    await connectDB();
    const submission = await CommunityDonorSubmission.findById(id);

    if (!submission) {
      return NextResponse.json({ error: "Community donor submission not found." }, { status: 404 });
    }

    // Apply optional field edits if provided
    if (donorName) submission.donorName = sanitizeText(donorName, 100);
    if (donorPhone) submission.donorPhone = donorPhone.replace(/[^0-9+]/g, "").trim();
    if (bloodGroup) submission.bloodGroup = bloodGroup;
    if (division) submission.division = sanitizeText(division, 50);
    if (district) submission.district = sanitizeText(district, 50);
    if (upazila) submission.upazila = sanitizeText(upazila, 50);
    if (thana) submission.thana = sanitizeText(thana, 50);
    if (age !== undefined) submission.age = Number(age);
    if (gender) submission.gender = gender;
    if (adminNotes !== undefined) submission.adminNotes = sanitizeText(adminNotes, 300);

    const reviewerName = session.name || session.email || "Verified Volunteer";

    if (action === "EDIT") {
      await submission.save();
      return NextResponse.json({
        success: true,
        message: "কমিউনিটি রক্তদাতার তথ্য সফলভাবে হালনাগাদ করা হয়েছে!",
        submission,
      });
    }

    if (action === "APPROVE") {
      submission.status = "approved";
      submission.reviewedBy = reviewerName;
      submission.reviewedAt = new Date();
      await submission.save();

      // Check if user already exists in User collection with this phone
      const cleanPhone = submission.donorPhone.replace(/[^0-9]/g, "");
      let existingUser = await User.findOne({
        phone: { $regex: cleanPhone.slice(-10), $options: "i" },
      });

      if (!existingUser) {
        const dummyEmail = `donor_${cleanPhone.slice(-8)}@bloodlife.local`;
        existingUser = await User.create({
          name: submission.donorName,
          email: dummyEmail,
          phone: submission.donorPhone,
          bloodGroup: submission.bloodGroup,
          division: submission.division,
          district: submission.district,
          upazila: submission.upazila,
          role: "Donor",
          status: "Active",
          isAvailable: true,
          totalDonations: 1,
          lastDonationDate: submission.lastDonationDate || new Date(),
          isEmailVerified: true,
        });
      } else {
        existingUser.isAvailable = true;
        if (existingUser.status === "Blocked") {
          existingUser.status = "Active";
        }
        await existingUser.save();
      }

      await AuditLog.create({
        action: "STATUS_UPDATE",
        performedBy: reviewerName,
        targetId: String(submission._id),
        targetType: "DONOR",
        metadata: {
          approvedDonorName: submission.donorName,
          phone: submission.donorPhone,
          bloodGroup: submission.bloodGroup,
        },
      });

      return NextResponse.json({
        success: true,
        message: "রক্তদাতার তথ্য সফলভাবে অনুমোদন করা হয়েছে এবং পাবলিক ডিরেক্টরিতে যুক্ত হয়েছে!",
        submission,
      });
    } else {
      submission.status = "rejected";
      submission.reviewedBy = reviewerName;
      submission.reviewedAt = new Date();
      submission.adminNotes = adminNotes
        ? sanitizeText(adminNotes, 300)
        : "ভলান্টিয়ার টিম কর্তৃক যাচাইকৃত হয়নি।";
      await submission.save();

      return NextResponse.json({
        success: true,
        message: "রক্তদাতার আবেদনটি বাতিল করা হয়েছে।",
        submission,
      });
    }
  } catch (error) {
    console.error("Error reviewing community donor:", error);
    return NextResponse.json(
      { error: "রিভিউ প্রক্রিয়া সম্পন্ন করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid submission ID format." }, { status: 400 });
    }

    const session = await getValidatedSession();
    if (!session || (session.role !== "Admin" && session.role !== "Volunteer")) {
      return NextResponse.json(
        { error: "Unauthorized. Admin or Volunteer privileges required." },
        { status: 403 }
      );
    }

    await connectDB();
    const submission = await CommunityDonorSubmission.findByIdAndDelete(id);
    if (!submission) {
      return NextResponse.json({ error: "Community donor submission not found." }, { status: 404 });
    }

    await AuditLog.create({
      action: "DONOR_DELETED",
      performedBy: session.userId,
      targetId: id,
      targetType: "DONOR",
      metadata: {
        donorName: submission.donorName,
        bloodGroup: submission.bloodGroup,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "কমিউনিটি রক্তদাতার এন্ট্রিটি মুছে ফেলা হয়েছে।",
    });
  } catch (error) {
    console.error("Error deleting community donor:", error);
    return NextResponse.json({ error: "ডিলিট করতে সমস্যা হয়েছে।" }, { status: 500 });
  }
}
