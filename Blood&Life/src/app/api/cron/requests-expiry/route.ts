import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DonationRequest } from "@/models/DonationRequest";

/**
 * Background Cron Job: Auto-Expiration & De-listing
 * Marks all pending or in-progress requests whose surgical deadline has elapsed as 'expired'.
 */
export async function GET(req: NextRequest) {
  try {
    // Fail-Closed Cron Authorization
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing cron secret" },
        { status: 401 }
      );
    }
    await connectDB();

    const now = new Date();

    // Find and update all expired requests
    const result = await DonationRequest.updateMany(
      {
        status: { $in: ["pending", "inprogress"] },
        expiresAt: { $lt: now },
      },
      {
        $set: { status: "expired" },
      }
    );

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      expiredCount: result.modifiedCount,
      message: `Successfully processed auto-expiration for ${result.modifiedCount} requests.`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to execute auto-expiration cron",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
