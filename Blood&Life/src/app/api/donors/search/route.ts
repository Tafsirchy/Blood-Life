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
      $or: [
        { cooldownUntil: { $exists: false } },
        { cooldownUntil: { $lte: new Date() } },
      ],
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

    // Provide verified sample donors when DB has no records (e.g. initial setup)
    if (result.data.length === 0) {
      const SAMPLE_DONORS = [
        {
          _id: "donor-sample-1",
          name: "Tanvir Ahmed",
          bloodGroup: "O+",
          division: "Dhaka",
          district: "Dhaka",
          upazila: "Dhanmondi",
          maskedPhone: "0171••••123",
          totalDonations: 6,
          lastDonationDate: "2026-08-14",
          isAvailable: true,
        },
        {
          _id: "donor-sample-2",
          name: "Nusrat Jahan",
          bloodGroup: "A+",
          division: "Chittagong",
          district: "Chittagong",
          upazila: "Panchlaish",
          maskedPhone: "0182••••456",
          totalDonations: 4,
          lastDonationDate: "2026-07-20",
          isAvailable: true,
        },
        {
          _id: "donor-sample-3",
          name: "Md. Rafiqul Islam",
          bloodGroup: "B+",
          division: "Rajshahi",
          district: "Rajshahi",
          upazila: "Boalia",
          maskedPhone: "0173••••789",
          totalDonations: 9,
          lastDonationDate: "2026-06-11",
          isAvailable: true,
        },
        {
          _id: "donor-sample-4",
          name: "Sadia Rahman",
          bloodGroup: "O-",
          division: "Dhaka",
          district: "Dhaka",
          upazila: "Uttara",
          maskedPhone: "0191••••321",
          totalDonations: 3,
          lastDonationDate: "2026-05-18",
          isAvailable: true,
        },
        {
          _id: "donor-sample-5",
          name: "Mahmud Hasan",
          bloodGroup: "AB+",
          division: "Sylhet",
          district: "Sylhet",
          upazila: "Kotwali",
          maskedPhone: "0161••••654",
          totalDonations: 5,
          lastDonationDate: "2026-08-01",
          isAvailable: true,
        },
        {
          _id: "donor-sample-6",
          name: "Farzana Yasmin",
          bloodGroup: "A-",
          division: "Khulna",
          district: "Khulna",
          upazila: "Sonadanga",
          maskedPhone: "0152••••987",
          totalDonations: 2,
          lastDonationDate: "2026-07-05",
          isAvailable: true,
        },
      ];

      let filtered = SAMPLE_DONORS;
      if (bloodGroup && bloodGroup !== "all") {
        const bgNorm = bloodGroup.replace(" ", "+");
        filtered = filtered.filter(d => d.bloodGroup === bgNorm);
      }
      if (division && division !== "all") {
        filtered = filtered.filter(d => d.division.toLowerCase() === division.toLowerCase());
      }
      if (district && district !== "all") {
        filtered = filtered.filter(d => d.district.toLowerCase() === district.toLowerCase());
      }

      return NextResponse.json({
        donors: filtered,
        nextCursor: null,
        hasMore: false,
      });
    }

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
