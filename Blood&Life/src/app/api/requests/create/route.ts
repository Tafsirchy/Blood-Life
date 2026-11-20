import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DonationRequest } from "@/models/DonationRequest";
import { getServerSession } from "@/lib/auth/session";
import { dispatchEmergencyRequestAlerts } from "@/lib/notifications/dispatcher";
import { z } from "zod";

const requestCreateSchema = z.object({
  recipientName: z.string().min(2, "Patient name is required"),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  unitsNeeded: z.number().min(1).default(1),
  urgency: z.enum(["critical", "urgent", "standard"]).default("urgent"),
  hospital: z.string().min(3, "Hospital name and location required"),
  division: z.string().min(1, "Division required"),
  district: z.string().min(1, "District required"),
  upazila: z.string().min(1, "Upazila required"),
  scheduledDate: z.string().min(1, "Date required"),
  scheduledTime: z.string().min(1, "Time required"),
  medicalReason: z.string().optional(),
  bloodComponent: z.enum(["whole_blood", "prbc", "platelets", "plasma"]).default("whole_blood"),
  message: z.string().optional(),
  prescriptionUrl: z.string().optional(),
  requesterPhone: z.string().min(11, "Valid phone number required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Please log in to submit an emergency request" }, { status: 401 });
    }

    const body = await req.json();
    const validated = requestCreateSchema.parse(body);

    await connectDB();

    // Compute exact expiration deadline based on scheduled surgery date & time or urgency tier
    let expiresAt: Date;
    try {
      const scheduledDateTime = new Date(`${validated.scheduledDate}T${validated.scheduledTime}:00`);
      if (!isNaN(scheduledDateTime.getTime()) && scheduledDateTime.getTime() > Date.now()) {
        expiresAt = scheduledDateTime;
      } else {
        // Fallback or relative duration: critical = 2h, urgent = 6h, standard = 24h
        const defaultHours = validated.urgency === "critical" ? 2 : validated.urgency === "urgent" ? 6 : 24;
        expiresAt = new Date(Date.now() + defaultHours * 60 * 60 * 1000);
      }
    } catch {
      const defaultHours = validated.urgency === "critical" ? 2 : validated.urgency === "urgent" ? 6 : 24;
      expiresAt = new Date(Date.now() + defaultHours * 60 * 60 * 1000);
    }

    const newRequest = await DonationRequest.create({
      recipientName: validated.recipientName,
      bloodGroup: validated.bloodGroup,
      unitsNeeded: validated.unitsNeeded,
      urgency: validated.urgency,
      hospital: validated.hospital,
      division: validated.division,
      district: validated.district,
      upazila: validated.upazila,
      scheduledDate: validated.scheduledDate,
      scheduledTime: validated.scheduledTime,
      expiresAt,
      fulfilledUnits: 0,
      pledgedUnits: 0,
      pledges: [],
      medicalReason: validated.medicalReason,
      bloodComponent: validated.bloodComponent,
      message: validated.message,
      prescriptionUrl: validated.prescriptionUrl,
      isVerifiedGenuine: false,
      status: "pending",
      requesterId: session.userId,
      requesterName: session.name,
      requesterEmail: session.email,
      requesterPhone: validated.requesterPhone,
    });

    // Fire non-blocking multi-channel alert dispatch (In-App, Push, Telegram)
    dispatchEmergencyRequestAlerts({
      requestId: String(newRequest._id),
      recipientName: newRequest.recipientName,
      bloodGroup: newRequest.bloodGroup,
      unitsNeeded: newRequest.unitsNeeded,
      hospital: newRequest.hospital,
      district: newRequest.district,
      urgency: newRequest.urgency,
      requesterId: session.userId,
    }).catch((e) => console.error("Async emergency alert error:", e));

    return NextResponse.json({
      success: true,
      request: newRequest,
      broadcastTriggered: true,
      message: "Emergency request posted to live national feed.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid request payload" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}
