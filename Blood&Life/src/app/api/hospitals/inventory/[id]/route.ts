import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { HospitalInventory } from "@/models/HospitalInventory";
import { AuditLog } from "@/models/AuditLog";
import { getValidatedSession } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/security/validators";
import { sanitizeText } from "@/lib/security/sanitize";
import { z } from "zod";

const inventoryUpdateSchema = z.object({
  hospitalName: z.string().min(3).optional(),
  division: z.string().min(1).optional(),
  district: z.string().min(1).optional(),
  contactNumber: z.string().min(6).optional(),
  inventory: z
    .object({
      "A+": z.number().min(0).optional(),
      "A-": z.number().min(0).optional(),
      "B+": z.number().min(0).optional(),
      "B-": z.number().min(0).optional(),
      "AB+": z.number().min(0).optional(),
      "AB-": z.number().min(0).optional(),
      "O+": z.number().min(0).optional(),
      "O-": z.number().min(0).optional(),
    })
    .optional(),
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
      return NextResponse.json({ error: "Invalid hospital inventory ID" }, { status: 400 });
    }

    const body = await req.json();
    const validated = inventoryUpdateSchema.parse(body);

    await connectDB();
    const record = await HospitalInventory.findById(id);
    if (!record) {
      return NextResponse.json({ error: "Hospital inventory record not found" }, { status: 404 });
    }

    if (validated.hospitalName) record.hospitalName = sanitizeText(validated.hospitalName, 160);
    if (validated.division) record.division = sanitizeText(validated.division, 50);
    if (validated.district) record.district = sanitizeText(validated.district, 50);
    if (validated.contactNumber) record.contactNumber = sanitizeText(validated.contactNumber, 30);
    if (validated.inventory) {
      record.inventory = {
        ...record.inventory,
        ...validated.inventory,
      };
    }
    record.lastReportedAt = new Date();
    await record.save();

    await AuditLog.create({
      action: "INVENTORY_UPDATED",
      performedBy: session.userId,
      targetId: id,
      targetType: "INVENTORY",
      metadata: {
        hospitalName: record.hospitalName,
        inventory: record.inventory,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "ব্লাড ব্যাংক স্টক সফলভাবে হালনাগাদ করা হয়েছে।",
      inventory: record,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid update payload" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update hospital inventory" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getValidatedSession();
    if (!session || session.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    const { id } = await context.params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid hospital inventory ID" }, { status: 400 });
    }

    await connectDB();
    const deleted = await HospitalInventory.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Hospital inventory record not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Hospital inventory entry deleted.",
    });
  } catch {
    return NextResponse.json({ error: "Failed to delete hospital inventory" }, { status: 500 });
  }
}
