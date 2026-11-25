import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DonorRegistration } from "@/models/DonorRegistration";
import { getValidatedSession } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/security/validators";
import { sanitizeText } from "@/lib/security/sanitize";
import { z } from "zod";

const updateScreeningSchema = z.object({
  eligibilityStatus: z.enum(["eligible", "temporary_deferral", "permanent_deferral"]).optional(),
  eligibilityNotes: z.string().optional(),
  presentAddress: z.string().min(3).optional(),
  division: z.string().min(1).optional(),
  district: z.string().min(1).optional(),
  upazila: z.string().min(1).optional(),
  phone: z.string().min(11).optional(),
  lastDonationDate: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getValidatedSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid registration ID format" }, { status: 400 });
    }

    await connectDB();
    const record = await DonorRegistration.findById(id).lean();
    if (!record) {
      return NextResponse.json({ error: "Screening record not found" }, { status: 404 });
    }

    const isStaff = session.role === "Admin" || session.role === "Volunteer";
    if (!isStaff && record.email.toLowerCase() !== session.email.toLowerCase()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, registration: record });
  } catch {
    return NextResponse.json({ error: "Failed to load screening record" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getValidatedSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid registration ID format" }, { status: 400 });
    }

    const body = await req.json();
    const validated = updateScreeningSchema.parse(body);

    await connectDB();
    const record = await DonorRegistration.findById(id);
    if (!record) {
      return NextResponse.json({ error: "Screening record not found" }, { status: 404 });
    }

    const isStaff = session.role === "Admin" || session.role === "Volunteer";
    if (!isStaff && record.email.toLowerCase() !== session.email.toLowerCase()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (validated.eligibilityStatus && isStaff) {
      record.eligibilityStatus = validated.eligibilityStatus;
    }
    if (validated.eligibilityNotes !== undefined && isStaff) {
      record.eligibilityNotes = sanitizeText(validated.eligibilityNotes, 500);
    }
    if (validated.presentAddress !== undefined) record.presentAddress = sanitizeText(validated.presentAddress, 250);
    if (validated.division !== undefined) record.division = sanitizeText(validated.division, 50);
    if (validated.district !== undefined) record.district = sanitizeText(validated.district, 50);
    if (validated.upazila !== undefined) record.upazila = sanitizeText(validated.upazila, 50);
    if (validated.phone !== undefined) record.phone = validated.phone.trim();
    if (validated.lastDonationDate !== undefined) record.lastDonationDate = validated.lastDonationDate;

    await record.save();

    return NextResponse.json({ success: true, registration: record });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid payload" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update screening record" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getValidatedSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid registration ID format" }, { status: 400 });
    }

    await connectDB();
    const record = await DonorRegistration.findById(id);
    if (!record) {
      return NextResponse.json({ error: "Screening record not found" }, { status: 404 });
    }

    const isStaff = session.role === "Admin" || session.role === "Volunteer";
    if (!isStaff && record.email.toLowerCase() !== session.email.toLowerCase()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await DonorRegistration.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Clinical screening record deleted.",
    });
  } catch {
    return NextResponse.json({ error: "Failed to delete screening record" }, { status: 500 });
  }
}
