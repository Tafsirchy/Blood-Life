import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DonationRequest } from "@/models/DonationRequest";
import { getServerSession } from "@/lib/auth/session";

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
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Please sign in" }, { status: 401 });
    }

    const { id } = await params;
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
      request.status = body.status; // e.g. "canceled" | "done"
    }

    if (body.message) {
      request.message = body.message;
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
