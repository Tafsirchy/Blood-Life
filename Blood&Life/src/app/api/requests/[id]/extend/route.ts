import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DonationRequest } from "@/models/DonationRequest";
import { getValidatedSession } from "@/lib/auth/session";
import { isValidObjectId } from "@/lib/security/validators";

/**
 * Patient Requisition Deadline Extension
 * Allows patient/requester to extend transfusion time (e.g. if operation was rescheduled).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getValidatedSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication with an active account required" }, { status: 401 });
    }

    const { id: requestId } = await params;
    if (!isValidObjectId(requestId)) {
      return NextResponse.json({ error: "Invalid request ID format" }, { status: 400 });
    }

    const body = await req.json();
    const additionalHours = Number(body.additionalHours) || 2; // Default 2 hours

    if (additionalHours < 1 || additionalHours > 24) {
      return NextResponse.json(
        { error: "Extension window must be between 1 and 24 hours" },
        { status: 400 }
      );
    }

    await connectDB();
    const request = await DonationRequest.findById(requestId);

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Only original requester or volunteer/admin can extend
    if (request.requesterId !== session.userId && session.role !== "Volunteer" && session.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized to extend this request" }, { status: 403 });
    }

    // Calculate new expiration time
    const baseTime = request.expiresAt && new Date(request.expiresAt) > new Date()
      ? new Date(request.expiresAt).getTime()
      : Date.now();

    const newExpiresAt = new Date(baseTime + additionalHours * 60 * 60 * 1000);

    request.expiresAt = newExpiresAt;
    // If it was expired, reactivate to pending
    if (request.status === "expired") {
      request.status = "pending";
    }

    await request.save();

    return NextResponse.json({
      success: true,
      newExpiresAt: newExpiresAt.toISOString(),
      status: request.status,
      message: `Request successfully extended by ${additionalHours} hour(s).`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to extend request deadline",
        ...(process.env.NODE_ENV !== "production" && {
          details: error instanceof Error ? error.message : "Unknown error",
        }),
      },
      { status: 500 }
    );
  }
}
