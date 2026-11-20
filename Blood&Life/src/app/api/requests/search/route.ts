import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DonationRequest } from "@/models/DonationRequest";
import { paginateWithCursor } from "@/lib/pagination";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bloodGroup = searchParams.get("bloodGroup");
    const division = searchParams.get("division");
    const district = searchParams.get("district");
    const urgency = searchParams.get("urgency");
    const status = searchParams.get("status") || "pending";
    const cursor = searchParams.get("cursor") || undefined;
    const limit = Number(searchParams.get("limit")) || 12;

    await connectDB();

    const filter: Record<string, unknown> = {};

    if (status !== "all") {
      filter.status = status;
      // Auto-filter out expired requests from public live queues
      if (status === "pending") {
        filter.$or = [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } },
        ];
      }
    } else {
      // Exclude expired by default from general live queries
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

    return NextResponse.json({
      requests: result.data,
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
