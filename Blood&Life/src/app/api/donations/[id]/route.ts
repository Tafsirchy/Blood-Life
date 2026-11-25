import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { TransfusionLog } from "@/models/TransfusionLog";
import { User } from "@/models/User";
import { AuditLog } from "@/models/AuditLog";
import { getValidatedSession } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/security/validators";
import { sanitizeText } from "@/lib/security/sanitize";
import { z } from "zod";

const updateDonationSchema = z.object({
  recipientName: z.string().min(2).max(100).optional(),
  hospital: z.string().min(2).max(150).optional(),
  district: z.string().max(60).optional(),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  completedAt: z.string().optional(),
});

async function recalculateDonorCooldown(donorId: string) {
  const user = await User.findById(donorId);
  if (!user) return null;

  const latestLog = await TransfusionLog.findOne({ donorId })
    .sort({ completedAt: -1 })
    .lean();

  if (latestLog?.completedAt) {
    const lastDate = new Date(latestLog.completedAt);
    const cooldownDate = new Date(lastDate.getTime() + 90 * 24 * 60 * 60 * 1000);
    user.lastDonationDate = lastDate;
    user.cooldownUntil = cooldownDate > new Date() ? cooldownDate : undefined;
    user.isAvailable = !user.cooldownUntil;
  } else {
    user.lastDonationDate = undefined;
    user.cooldownUntil = undefined;
    user.isAvailable = true;
  }

  await user.save();
  return user;
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
      return NextResponse.json({ error: "Invalid donation log ID format" }, { status: 400 });
    }

    const body = await req.json();
    const validated = updateDonationSchema.parse(body);

    await connectDB();
    const log = await TransfusionLog.findById(id);
    if (!log) {
      return NextResponse.json({ error: "Donation record not found" }, { status: 404 });
    }

    const isOwner = log.donorId === session.userId;
    const isAdmin = session.role === "Admin";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!isAdmin && log.recipientVerified) {
      return NextResponse.json(
        { error: "Recipient-verified transfusion records cannot be modified." },
        { status: 403 }
      );
    }

    if (validated.recipientName) log.recipientName = sanitizeText(validated.recipientName, 100);
    if (validated.hospital) log.hospital = sanitizeText(validated.hospital, 150);
    if (validated.district !== undefined) log.district = sanitizeText(validated.district, 60);
    if (validated.bloodGroup) log.bloodGroup = validated.bloodGroup;
    if (validated.completedAt) {
      const parsedDate = new Date(validated.completedAt);
      if (isNaN(parsedDate.getTime()) || parsedDate.getTime() > Date.now() + 24 * 60 * 60 * 1000) {
        return NextResponse.json({ error: "Invalid completion date" }, { status: 400 });
      }
      log.completedAt = parsedDate;
    }

    await log.save();
    await recalculateDonorCooldown(log.donorId);

    return NextResponse.json({ success: true, log });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update donation record" }, { status: 500 });
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
      return NextResponse.json({ error: "Invalid donation log ID format" }, { status: 400 });
    }

    await connectDB();
    const log = await TransfusionLog.findById(id);
    if (!log) {
      return NextResponse.json({ error: "Donation record not found" }, { status: 404 });
    }

    const isOwner = log.donorId === session.userId;
    const isAdmin = session.role === "Admin";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!isAdmin && log.recipientVerified) {
      return NextResponse.json(
        { error: "Recipient-verified transfusion records cannot be deleted." },
        { status: 403 }
      );
    }

    await TransfusionLog.findByIdAndDelete(id);

    const user = await User.findById(log.donorId);
    if (user) {
      const decUnits = log.units || 1;
      user.totalDonations = Math.max(0, (user.totalDonations || 0) - decUnits);
      if (log.recipientVerified) {
        user.verifiedDonations = Math.max(0, (user.verifiedDonations || 0) - 1);
      }
      await user.save();
    }

    const updatedUser = await recalculateDonorCooldown(log.donorId);

    await AuditLog.create({
      action: "DONATION_DELETED",
      performedBy: session.userId,
      targetId: id,
      targetType: "DONATION",
      metadata: {
        donorId: log.donorId,
        certificateId: log.certificateId,
        hospital: log.hospital,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Donation record deleted and donor cooldown recalculated.",
      totalDonations: updatedUser?.totalDonations ?? 0,
    });
  } catch {
    return NextResponse.json({ error: "Failed to delete donation record" }, { status: 500 });
  }
}
