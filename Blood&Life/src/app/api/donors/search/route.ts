import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { paginateWithCursor } from "@/lib/pagination";
import { maskPhoneNumber } from "@/lib/security/privacyShield";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bloodGroup = searchParams.get("bloodGroup");
    const division = searchParams.get("division");
    const district = searchParams.get("district");
    const cursor = searchParams.get("cursor") || undefined;
    const limit = Number(searchParams.get("limit")) || 12;

    await connectDB();

    const filter: Record<string, unknown> = {
      status: "Active",
      isAvailable: true,
    };

    if (bloodGroup && bloodGroup !== "all") {
      filter.bloodGroup = bloodGroup.replace(" ", "+");
    }

    if (division && division !== "all") {
      filter.division = division;
    }

    if (district && district !== "all") {
      filter.district = district;
    }

    const result = await paginateWithCursor(User, filter, {
      limit,
      cursor,
      sortField: "_id",
      sortOrder: -1,
    });

    // Mask phone numbers in public search feed for Privacy Shield
    const sanitizedDonors = result.data.map((donor) => ({
      _id: donor._id,
      name: donor.name,
      bloodGroup: donor.bloodGroup,
      division: donor.division,
      district: donor.district,
      upazila: donor.upazila,
      avatarUrl: donor.avatarUrl,
      maskedPhone: maskPhoneNumber(donor.phone),
      totalDonations: donor.totalDonations,
      lastDonationDate: donor.lastDonationDate,
      isAvailable: donor.isAvailable,
    }));

    return NextResponse.json({
      donors: sanitizedDonors,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to query donors", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
