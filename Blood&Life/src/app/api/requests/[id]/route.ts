import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DonationRequest } from "@/models/DonationRequest";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const request = await DonationRequest.findById(id).lean();
    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({ request });
  } catch {
    return NextResponse.json({ error: "Failed to fetch request details" }, { status: 500 });
  }
}
