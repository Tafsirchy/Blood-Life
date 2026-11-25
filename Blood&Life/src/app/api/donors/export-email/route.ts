import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { CommunityDonorSubmission } from "@/models/CommunityDonorSubmission";
import { AuditLog } from "@/models/AuditLog";
import { sendTransactionalEmail } from "@/lib/notifications/email";
import { sanitizeText } from "@/lib/security/sanitize";

// In-memory rate limiting map for email exports (max 3 exports per hour per email/IP)
const exportRateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function checkExportRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = exportRateLimitMap.get(key);

  if (!entry || now > entry.expiresAt) {
    exportRateLimitMap.set(key, { count: 1, expiresAt: now + 60 * 60 * 1000 });
    return true;
  }

  if (entry.count >= 3) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      recipientEmail,
      patientName,
      hospital,
      bloodGroup,
      division,
      district,
      upazila,
      thana,
    } = body;

    if (!recipientEmail || !district) {
      return NextResponse.json(
        { error: "অনুগ্রহ করে আপনার ইমেইল ও জেলা নির্বাচন করুন।" },
        { status: 400 }
      );
    }

    const cleanEmail = sanitizeText(recipientEmail, 100).toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: "সঠিক ইমেইল এড্রেস প্রদান করুন।" }, { status: 400 });
    }

    // Check rate limit per recipient email
    if (!checkExportRateLimit(cleanEmail)) {
      return NextResponse.json(
        { error: "নিরাপত্তার স্বার্থে প্রতি ঘণ্টায় সর্বোচ্চ ৩ বার ডোনার লিস্ট ইমেইল করা যায়। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।" },
        { status: 429 }
      );
    }

    await connectDB();

    // Query active registered donors
    const userFilter: Record<string, unknown> = {
      role: "Donor",
      status: "Active",
      isAvailable: true,
      district: { $regex: new RegExp(`^${district}$`, "i") },
    };
    if (bloodGroup && bloodGroup !== "all") {
      userFilter.bloodGroup = bloodGroup.replace(" ", "+");
    }
    if (upazila && upazila !== "all") {
      userFilter.upazila = { $regex: new RegExp(`^${upazila}$`, "i") };
    }

    const registeredDonors = await User.find(userFilter)
      .select("name phone bloodGroup division district upazila totalDonations lastDonationDate")
      .limit(10)
      .lean();

    // Query approved community donors
    const communityFilter: Record<string, unknown> = {
      status: "approved",
      district: { $regex: new RegExp(`^${district}$`, "i") },
    };
    if (bloodGroup && bloodGroup !== "all") {
      communityFilter.bloodGroup = bloodGroup.replace(" ", "+");
    }
    if (upazila && upazila !== "all") {
      communityFilter.upazila = { $regex: new RegExp(`^${upazila}$`, "i") };
    }

    const communityDonors = await CommunityDonorSubmission.find(communityFilter)
      .select("donorName donorPhone bloodGroup division district upazila thana")
      .limit(5)
      .lean();

    // Merge and deduplicate
    const combinedDonors = [
      ...registeredDonors.map((d: any) => ({
        name: d.name,
        phone: d.phone,
        bloodGroup: d.bloodGroup,
        location: `${d.upazila}, ${d.district}`,
        type: "ভেরিফাইড ডোনার",
      })),
      ...communityDonors.map((c: any) => ({
        name: c.donorName,
        phone: c.donorPhone,
        bloodGroup: c.bloodGroup,
        location: `${c.thana || c.upazila}, ${c.district}`,
        type: "কমিউনিটি সুপারিশকৃত ডোনার",
      })),
    ].slice(0, 15);

    if (combinedDonors.length === 0) {
      return NextResponse.json({
        success: false,
        message: "আপনার নির্বাচিত এলাকায় বর্তমানে কোনো সক্রিয় রক্তদাতার তথ্য পাওয়া যায়নি। অনুগ্রহ করে পাশের উপজেলা বা জেলা নির্বাচন করুন।",
      });
    }

    // Format Clinical HTML Email Template
    const donorRowsHtml = combinedDonors
      .map(
        (d, idx) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-weight: bold; color: #1e293b;">${idx + 1}. ${d.name}</td>
          <td style="padding: 10px; color: #dc2626; font-weight: 900;">${d.bloodGroup}</td>
          <td style="padding: 10px; color: #0284c7; font-weight: bold; font-family: monospace;">${d.phone}</td>
          <td style="padding: 10px; color: #475569;">${d.location}</td>
          <td style="padding: 10px; color: #16a34a; font-size: 11px;">${d.type}</td>
        </tr>`
      )
      .join("");

    const emailSubject = `[BLOOD&LIFE] জরুরি ${bloodGroup} রক্তদাতা তালিকা — ${district}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="text-align: center; border-bottom: 2px solid #dc2626; padding-bottom: 15px; margin-bottom: 20px;">
          <h1 style="color: #dc2626; margin: 0; font-size: 24px;">BLOOD&LIFE (ব্লাড অ্যান্ড লাইফ)</h1>
          <p style="color: #64748b; font-size: 12px; margin-top: 5px;">জাতীয় জরুরি রক্তদান ও ট্রান্সফিউশন নেটওয়ার্ক</p>
        </div>

        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 12px; margin-bottom: 20px; border-radius: 4px;">
          <h3 style="color: #991b1b; margin: 0 0 5px 0; font-size: 14px;">জরুরি সতর্কতা (Zero Advance Cash Policy)</h3>
          <p style="color: #7f1d1d; font-size: 12px; margin: 0; line-height: 1.5;">
            স্বেচ্ছাসেবী রক্তদাতারা কখনোই বিকাশ বা নগদে অগ্রিম টাকা নেন না। হাসপাতালে সরাসরি ব্লাড ব্যাংকে সাক্ষাতের পর রক্ত সংগ্রহ নিশ্চিত করুন।
          </p>
        </div>

        <p style="color: #334155; font-size: 13px;">
          <strong>রোগীর নাম:</strong> ${sanitizeText(patientName, 50) || "জরুরি রোগী"}<br/>
          <strong>হাসপাতাল:</strong> ${sanitizeText(hospital, 100) || "হাসপাতাল উল্লেখিত নেই"}<br/>
          <strong>অনুরোধকৃত রক্তের গ্রুপ:</strong> <span style="color: #dc2626; font-weight: bold;">${bloodGroup}</span> (${district})
        </p>

        <h4 style="color: #1e293b; margin-top: 20px; margin-bottom: 10px;">সংযুক্ত রক্তদাতাবৃন্দের তালিকা (${combinedDonors.length} জন):</h4>
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px;">
          <thead>
            <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 10px; color: #475569;">নাম</th>
              <th style="padding: 10px; color: #475569;">গ্রুপ</th>
              <th style="padding: 10px; color: #475569;">ফোন নম্বর</th>
              <th style="padding: 10px; color: #475569;">এলাকা</th>
              <th style="padding: 10px; color: #475569;">স্ট্যাটাস</th>
            </tr>
          </thead>
          <tbody>
            ${donorRowsHtml}
          </tbody>
        </table>

        <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
          <p>এই তালিকাটি রোগীর জরুরি চিকিৎসার সুবিধার্থে প্রেরিত হয়েছে। বাণিজ্যিক বা অননুমোদিত ব্যবহারের জন্য এটি প্রযোজ্য নয়।</p>
          <p>© 2026 BLOOD&LIFE Network. All Rights Reserved.</p>
        </div>
      </div>
    `;

    const emailResult = await sendTransactionalEmail({
      to: cleanEmail,
      subject: emailSubject,
      html: emailHtml,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: emailResult.isSandboxRestricted
            ? "ইমেইল স্যান্ডবক্স সীমাবদ্ধতার কারণে বর্তমানে এই ঠিকানায় ইমেইল পাঠানো যাচ্ছে না। অনুগ্রহ করে অ্যাডমিন ডোমেইন ভেরিফাই করুন।"
            : "ইমেইল সার্ভারে সংযোগ ত্রুটির কারণে তালিকা পাঠানো সম্ভব হয়নি।",
        },
        { status: 502 }
      );
    }

    // Record Audit Log
    await AuditLog.create({
      action: "CONTACT_REVEAL",
      performedBy: cleanEmail,
      targetId: district,
      targetType: "DONOR",
      metadata: {
        exportedCount: combinedDonors.length,
        bloodGroup,
        district,
      },
    });

    return NextResponse.json({
      success: true,
      message: `সফল হয়েছে! ${combinedDonors.length} জন রক্তদাতার তালিকা আপনার ইমেইলে (${cleanEmail}) সফলভাবে প্রেরণ করা হয়েছে। ইনবক্স অথবা স্প্যাম ফোল্ডার চেক করুন।`,
      donorCount: combinedDonors.length,
    });
  } catch (error) {
    console.error("Error exporting donor list via email:", error);
    return NextResponse.json(
      { error: "ইমেইল পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
