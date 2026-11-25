import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FraudReport } from "@/models/FraudReport";
import { User } from "@/models/User";
import { AuditLog } from "@/models/AuditLog";
import { getValidatedSession } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/security/validators";
import { sanitizeText } from "@/lib/security/sanitize";
import { z } from "zod";

const fraudReviewSchema = z.object({
  status: z.enum(["pending_review", "investigating", "confirmed_fraud", "dismissed"]).optional(),
  adminNotes: z.string().max(500).optional(),
  reportedName: z.string().max(100).optional(),
  scamCategory: z
    .enum([
      "advance_cash_scam",
      "fake_donor_noshow",
      "blood_broker",
      "false_screening",
      "harassment",
      "other",
    ])
    .optional(),
  hospitalName: z.string().max(150).optional(),
  district: z.string().max(60).optional(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getValidatedSession();
    if (!session || (session.role !== "Admin" && session.role !== "Volunteer")) {
      return NextResponse.json(
        { error: "Unauthorized. Admin or Volunteer privileges required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid fraud report ID format" }, { status: 400 });
    }

    const body = await req.json();
    const validated = fraudReviewSchema.parse(body);

    await connectDB();
    const report = await FraudReport.findById(id);
    if (!report) {
      return NextResponse.json({ error: "Fraud report not found" }, { status: 404 });
    }

    if (validated.reportedName !== undefined) report.reportedName = sanitizeText(validated.reportedName, 100);
    if (validated.scamCategory) report.scamCategory = validated.scamCategory;
    if (validated.hospitalName !== undefined) report.hospitalName = sanitizeText(validated.hospitalName, 150);
    if (validated.district !== undefined) report.district = sanitizeText(validated.district, 60);
    if (validated.adminNotes !== undefined) report.adminNotes = sanitizeText(validated.adminNotes, 500);

    if (validated.status) {
      report.status = validated.status;
      if (validated.status === "confirmed_fraud") {
        report.bannedAt = new Date();

        // Automatically flag and block matching user account if present
        const cleanDigits = report.reportedPhone.replace(/[^0-9]/g, "");
        if (cleanDigits.length >= 8) {
          await User.updateMany(
            { phone: { $regex: cleanDigits.slice(-10), $options: "i" } },
            {
              $set: {
                isFraudFlagged: true,
                status: "Blocked",
                isAvailable: false,
              },
            }
          );
        }
      }
    }

    await report.save();

    await AuditLog.create({
      action: "FRAUD_REVIEWED",
      performedBy: session.userId,
      targetId: id,
      targetType: "FRAUD",
      metadata: {
        newStatus: report.status,
        reportedPhone: report.reportedPhone,
        adminNotes: report.adminNotes,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `অভিযোগের স্ট্যাটাস "${report.status}" হিসেবে হালনাগাদ করা হয়েছে।`,
      report,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to review fraud report" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getValidatedSession();
    if (!session || (session.role !== "Admin" && session.role !== "Volunteer")) {
      return NextResponse.json(
        { error: "Unauthorized. Admin or Volunteer privileges required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid fraud report ID format" }, { status: 400 });
    }

    await connectDB();
    const deleted = await FraudReport.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Fraud report not found" }, { status: 404 });
    }

    await AuditLog.create({
      action: "FRAUD_REVIEWED",
      performedBy: session.userId,
      targetId: id,
      targetType: "FRAUD",
      metadata: {
        deletedReportPhone: deleted.reportedPhone,
        previousStatus: deleted.status,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "অভিযোগের রেকর্ডটি স্থায়ীভাবে মুছে ফেলা হয়েছে।",
    });
  } catch {
    return NextResponse.json({ error: "Failed to delete fraud report" }, { status: 500 });
  }
}
