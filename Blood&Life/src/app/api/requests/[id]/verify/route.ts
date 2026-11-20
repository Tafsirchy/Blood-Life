import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { DonationRequest } from "@/models/DonationRequest";
import { getSession } from "@/lib/auth/session";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { action, rejectReason } = body; // action: 'VERIFY' | 'REJECT'

    const session = await getSession();
    if (!session || (session.role !== "Volunteer" && session.role !== "Admin")) {
      return NextResponse.json(
        { error: "Unauthorized. Volunteer or Admin role required." },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const request = await DonationRequest.findById(id);

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (action === "VERIFY") {
      request.isVerifiedGenuine = true;
      request.verifiedBy = session.name || session.email;
      await request.save();

      return NextResponse.json({
        success: true,
        message: "Request marked as Verified Genuine.",
        request,
      });
    } else if (action === "REJECT") {
      request.status = "canceled";
      request.message = `${request.message || ""} [Rejected by Volunteer: ${rejectReason || "Invalid prescription"}]`;
      await request.save();

      return NextResponse.json({
        success: true,
        message: "Request rejected and canceled.",
        request,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Internal verification failure" },
      { status: 500 }
    );
  }
}
