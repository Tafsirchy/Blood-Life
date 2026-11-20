import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DonationRequest } from "@/models/DonationRequest";
import { getServerSession, getValidatedSession } from "@/lib/auth/session";
import { sanitizeText } from "@/lib/security/sanitize";
import { isValidObjectId } from "@/lib/security/validators";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid request ID format" }, { status: 400 });
    }

    await connectDB();

    const request = await DonationRequest.findById(id).lean();
    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const session = await getServerSession();
    const isAuthorized =
      session &&
      (session.role === "Admin" ||
        session.role === "Volunteer" ||
        session.userId === request.requesterId ||
        session.userId === request.assignedDonorId);

    // If not authenticated or not an authorized stakeholder, mask sensitive contact numbers
    if (!isAuthorized) {
      const sanitized = {
        ...request,
        requesterPhone: request.requesterPhone
          ? request.requesterPhone.slice(0, 4) + "•••" + request.requesterPhone.slice(-3)
          : "",
        requesterEmail: undefined,
        pledges: request.pledges?.map((p: any) => ({
          donorId: p.donorId,
          donorName: p.donorName,
          units: p.units,
          status: p.status,
          timestamp: p.timestamp,
        })),
      };
      return NextResponse.json({ request: sanitized });
    }

    return NextResponse.json({ request });
  } catch {
    return NextResponse.json({ error: "Failed to fetch request details" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getValidatedSession();
    if (!session) {
      return NextResponse.json({ error: "Please sign in with an active account" }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid request ID format" }, { status: 400 });
    }

    const body = await req.json();
    await connectDB();

    const request = await DonationRequest.findById(id);
    if (!request) {
      return NextResponse.json({ error: "Emergency request not found" }, { status: 404 });
    }

    // Only owner of the request or Volunteer/Admin can update/cancel
    const isOwner = request.requesterId === session.userId;
    const isStaff = session.role === "Volunteer" || session.role === "Admin";

    if (!isOwner && !isStaff) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to update this request" },
        { status: 403 }
      );
    }

    if (body.status) {
      const ALLOWED_STATUSES = ["pending", "inprogress", "done", "canceled", "expired"];
      if (!ALLOWED_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
      }
      // Requesters can only cancel their own cases; staff can change any status
      if (!isStaff && body.status !== "canceled") {
        return NextResponse.json(
          { error: "Forbidden: Requesters are only permitted to cancel active requests." },
          { status: 403 }
        );
      }
      request.status = body.status;
    }

    if (body.message !== undefined) {
      request.message = sanitizeText(body.message, 1000);
    }

    await request.save();

    return NextResponse.json({
      success: true,
      message: `Request marked as ${request.status}.`,
      request,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update emergency case" }, { status: 500 });
  }
}
