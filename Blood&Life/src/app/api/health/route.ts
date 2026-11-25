import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { DonationRequest } from "@/models/DonationRequest";

export async function GET() {
  try {
    const startTime = Date.now();
    await connectDB();
    const dbLatency = Date.now() - startTime;

    // Fast indexed counts for telemetry
    const [donorCount, activeRequestCount] = await Promise.all([
      User.countDocuments({ status: "Active" }),
      DonationRequest.countDocuments({ status: "pending" }),
    ]);

    return NextResponse.json({
      status: "operational",
      platform: "BLOOD&LIFE (ব্লাড অ্যান্ড লাইফ)",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      database: {
        status: "connected",
        latencyMs: dbLatency,
      },
      telemetry: {
        activeDonors: donorCount,
        pendingEmergencyRequests: activeRequestCount,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "degraded",
        error: process.env.NODE_ENV !== "production" && error instanceof Error
          ? error.message
          : "Database connection failed",
      },
      { status: 500 }
    );
  }
}
