import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DonationRequest } from "@/models/DonationRequest";
import { AuditLog } from "@/models/AuditLog";
import { getValidatedSession } from "@/lib/auth/session";
import { sanitizeText } from "@/lib/security/sanitize";
import { isValidObjectId } from "@/lib/security/validators";
import { SAMPLE_EMERGENCY_CASES } from "@/lib/emergencyDeadlines";
import { z } from "zod";

const requestUpdateSchema = z.object({
  status: z.enum(["pending", "inprogress", "done", "canceled", "expired"]).optional(),
  recipientName: z.string().min(2).optional(),
  unitsNeeded: z.number().min(1).max(20).optional(),
  urgency: z.enum(["critical", "urgent", "standard"]).optional(),
  hospital: z.string().min(3).optional(),
  division: z.string().min(1).optional(),
  district: z.string().min(1).optional(),
  upazila: z.string().min(1).optional(),
  scheduledDate: z.string().min(1).optional(),
  scheduledTime: z.string().min(1).optional(),
  medicalReason: z.string().optional(),
  bloodComponent: z.enum(["whole_blood", "prbc", "platelets", "plasma"]).optional(),
  message: z.string().optional(),
  prescriptionUrl: z
    .string()
    .url("Invalid URL format")
    .refine(
      (url) => url.startsWith("https://") || url.startsWith("http://localhost"),
      "Prescription URL must be secure (HTTPS)"
    )
    .optional()
    .or(z.literal("")),
  requesterPhone: z.string().min(11).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (id.startsWith("case-")) {
      const sample = SAMPLE_EMERGENCY_CASES[id];
      if (sample) {
        const session = await getValidatedSession();
        const phone = session
          ? sample.requesterPhone
          : sample.requesterPhone.slice(0, 4) + "•••" + sample.requesterPhone.slice(-3);

        return NextResponse.json({
          request: {
            _id: sample.id,
            recipientName: sample.patientName,
            bloodGroup: sample.bloodGroup,
            unitsNeeded: sample.unitsNeeded,
            pledgedUnits: sample.pledgedUnits,
            hospital: sample.hospital,
            district: sample.district,
            upazila: sample.upazila,
            urgency: sample.urgency,
            scheduledDate: new Date().toISOString().split("T")[0],
            scheduledTime: "Emergency Immediate",
            medicalReason: sample.medicalReason,
            message: "Emergency surgical blood requirement at hospital ICU/ward.",
            requesterPhone: phone,
            requesterId: "system-emergency-triage",
            status: "pending",
            createdAt: new Date().toISOString(),
          },
        });
      }
    }

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid request ID format" }, { status: 400 });
    }

    await connectDB();

    const request = await DonationRequest.findById(id).lean();
    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const session = await getValidatedSession();
    const isAuthorized =
      session &&
      (session.role === "Admin" ||
        session.role === "Volunteer" ||
        session.userId === request.requesterId ||
        session.userId === request.assignedDonorId);

    // If not authenticated or not an authorized stakeholder, mask sensitive contact numbers
    if (!isAuthorized) {
      const sanitized = {
        ...request,
        requesterPhone: request.requesterPhone
          ? request.requesterPhone.slice(0, 4) + "•••" + request.requesterPhone.slice(-3)
          : "",
        requesterEmail: undefined,
        pledges: request.pledges?.map((p: any) => ({
          donorId: p.donorId,
          donorName: p.donorName,
          units: p.units,
          status: p.status,
          timestamp: p.timestamp,
        })),
      };
      return NextResponse.json({ request: sanitized });
    }

    return NextResponse.json({ request });
  } catch {
    return NextResponse.json({ error: "Failed to fetch request details" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getValidatedSession();
    if (!session) {
      return NextResponse.json({ error: "Please sign in with an active account" }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid request ID format" }, { status: 400 });
    }

    const body = await req.json();
    const validated = requestUpdateSchema.parse(body);

    await connectDB();

    const request = await DonationRequest.findById(id);
    if (!request) {
      return NextResponse.json({ error: "Emergency request not found" }, { status: 404 });
    }

    // Only owner of the request or Volunteer/Admin can update
    const isOwner = request.requesterId === session.userId;
    const isStaff = session.role === "Volunteer" || session.role === "Admin";

    if (!isOwner && !isStaff) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to update this request" },
        { status: 403 }
      );
    }

    if (validated.status) {
      // Requesters can cancel or mark completed their own cases; staff can change any status
      if (!isStaff && validated.status !== "canceled" && validated.status !== "done") {
        return NextResponse.json(
          { error: "Forbidden: Requesters can only cancel or mark active requests as completed." },
          { status: 403 }
        );
      }
      request.status = validated.status;
    }

    // Edit core details (allowed on active requests or by staff)
    const canEditDetails = isStaff || request.status === "pending" || request.status === "inprogress";
    if (canEditDetails) {
      if (validated.recipientName !== undefined) request.recipientName = sanitizeText(validated.recipientName, 100);
      if (validated.unitsNeeded !== undefined) request.unitsNeeded = Math.max(request.pledgedUnits || 1, validated.unitsNeeded);
      if (validated.urgency !== undefined) request.urgency = validated.urgency;
      if (validated.hospital !== undefined) request.hospital = sanitizeText(validated.hospital, 200);
      if (validated.division !== undefined) request.division = sanitizeText(validated.division, 50);
      if (validated.district !== undefined) request.district = sanitizeText(validated.district, 50);
      if (validated.upazila !== undefined) request.upazila = sanitizeText(validated.upazila, 50);
      if (validated.scheduledDate !== undefined) request.scheduledDate = validated.scheduledDate;
      if (validated.scheduledTime !== undefined) request.scheduledTime = validated.scheduledTime;
      if (validated.medicalReason !== undefined) request.medicalReason = sanitizeText(validated.medicalReason, 500);
      if (validated.bloodComponent !== undefined) request.bloodComponent = validated.bloodComponent;
      if (validated.prescriptionUrl !== undefined) request.prescriptionUrl = validated.prescriptionUrl || undefined;
      if (validated.requesterPhone !== undefined) request.requesterPhone = validated.requesterPhone.trim();
    }

    if (validated.message !== undefined) {
      request.message = sanitizeText(validated.message, 1000);
    }

    await request.save();

    return NextResponse.json({
      success: true,
      message: `Request updated successfully (${request.status}).`,
      request,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid update payload" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update emergency case" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getValidatedSession();
    if (!session) {
      return NextResponse.json({ error: "Please sign in with an active account" }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid request ID format" }, { status: 400 });
    }

    await connectDB();

    const request = await DonationRequest.findById(id);
    if (!request) {
      return NextResponse.json({ error: "Emergency request not found" }, { status: 404 });
    }

    const isOwner = request.requesterId === session.userId;
    const isStaff = session.role === "Volunteer" || session.role === "Admin";

    if (!isOwner && !isStaff) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to delete this request" },
        { status: 403 }
      );
    }

    // Requesters cannot delete a completed & verified medical record (preserve audit integrity)
    if (!isStaff && request.status === "done" && request.recipientVerification?.isVerified) {
      return NextResponse.json(
        { error: "Verified transfusion records cannot be deleted by requesters." },
        { status: 403 }
      );
    }

    await DonationRequest.findByIdAndDelete(id);

    await AuditLog.create({
      action: "REQUEST_DELETED",
      performedBy: session.userId,
      targetId: id,
      targetType: "REQUEST",
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
      metadata: {
        recipientName: request.recipientName,
        hospital: request.hospital,
        previousStatus: request.status,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Emergency request permanently deleted.",
    });
  } catch {
    return NextResponse.json({ error: "Failed to delete emergency request" }, { status: 500 });
  }
}
