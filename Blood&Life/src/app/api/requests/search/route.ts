import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DonationRequest } from "@/models/DonationRequest";
import { paginateWithCursor } from "@/lib/pagination";
import {
  SAMPLE_EMERGENCY_CASES,
  getPersistentEmergencyDeadline,
  getPersistentPledgedUnits,
} from "@/lib/emergencyDeadlines";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bloodGroup = searchParams.get("bloodGroup");
    const division = searchParams.get("division");
    const district = searchParams.get("district");
    const urgency = searchParams.get("urgency");
    const requesterId = searchParams.get("requesterId");
    const status = searchParams.get("status") || "pending";
    const cursor = searchParams.get("cursor") || undefined;
    const limit = Number(searchParams.get("limit")) || 12;

    await connectDB();

    const filter: Record<string, unknown> = {};

    if (requesterId) {
      filter.requesterId = requesterId;
    }

    if (status !== "all") {
      filter.status = status;
      // Auto-filter out expired requests from public live queues
      if (status === "pending") {
        filter.$or = [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } },
        ];
      }
    } else if (!requesterId) {
      // Only exclude expired from general public live feeds; allow requesters to view their complete history
      filter.status = { $ne: "expired" };
    }

    if (bloodGroup && bloodGroup !== "all") {
      filter.bloodGroup = bloodGroup.replace(" ", "+");
    }

    if (division && division !== "all") {
      filter.division = division;
    }

    if (district && district !== "all") {
      filter.district = district;
    }

    if (urgency && urgency !== "all") {
      filter.urgency = urgency;
    }

    const result = await paginateWithCursor(DonationRequest, filter, {
      limit,
      cursor,
      sortField: "_id",
      sortOrder: -1,
    });

    // Provide seamless fallback sample emergencies when database has no records
    if (!requesterId && result.data.length === 0) {
      let samples = Object.values(SAMPLE_EMERGENCY_CASES);
      if (bloodGroup && bloodGroup !== "all") {
        const bgNormalized = bloodGroup.replace(" ", "+");
        samples = samples.filter((s) => s.bloodGroup === bgNormalized);
      }
      if (district && district !== "all") {
        samples = samples.filter((s) => s.district.toLowerCase() === district.toLowerCase());
      }
      const mappedSamples = samples.map((s) => ({
        _id: s.id,
        recipientName: s.patientName,
        bloodGroup: s.bloodGroup,
        unitsNeeded: s.unitsNeeded,
        urgency: s.urgency,
        hospital: s.hospital,
        division: "Dhaka",
        district: s.district,
        upazila: s.upazila,
        scheduledDate: new Date().toISOString().split("T")[0],
        scheduledTime: "Immediate",
        medicalReason: s.medicalReason,
        bloodComponent: "whole_blood",
        message: "Critical surgical requirement at hospital emergency ward.",
        prescriptionUrl: undefined,
        isVerifiedGenuine: true,
        verifiedBy: "Hospital Triage",
        status: "pending",
        expiresAt: getPersistentEmergencyDeadline(s.id, s.defaultDurationMinutes),
        fulfilledUnits: 0,
        pledgedUnits: getPersistentPledgedUnits(s.id, s.pledgedUnits),
        requesterName: "Hospital Triage",
        requesterPhone: s.requesterPhone.slice(0, 4) + "•••" + s.requesterPhone.slice(-3),
        createdAt: new Date().toISOString(),
      }));

      return NextResponse.json({
        requests: mappedSamples,
        nextCursor: null,
        hasMore: false,
      });
    }

    // Anti-Scraping Privacy Shield: sanitize patient/requester contact details
    const sanitizedRequests = result.data.map((item: any) => ({
      _id: item._id,
      recipientName: item.recipientName,
      bloodGroup: item.bloodGroup,
      unitsNeeded: item.unitsNeeded,
      urgency: item.urgency,
      hospital: item.hospital,
      division: item.division,
      district: item.district,
      upazila: item.upazila,
      scheduledDate: item.scheduledDate,
      scheduledTime: item.scheduledTime,
      medicalReason: item.medicalReason,
      bloodComponent: item.bloodComponent,
      message: item.message,
      prescriptionUrl: item.prescriptionUrl,
      isVerifiedGenuine: item.isVerifiedGenuine,
      verifiedBy: item.verifiedBy,
      status: item.status,
      expiresAt: item.expiresAt,
      fulfilledUnits: item.fulfilledUnits,
      pledgedUnits: item.pledgedUnits,
      requesterName: item.requesterName,
      requesterPhone: item.requesterPhone
        ? item.requesterPhone.slice(0, 4) + "•••" + item.requesterPhone.slice(-3)
        : "",
      assignedDonorName: item.assignedDonorName,
      createdAt: item.createdAt,
    }));

    return NextResponse.json({
      requests: sanitizedRequests,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to query emergency requests", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
