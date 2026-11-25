import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { HospitalInventory } from "@/models/HospitalInventory";
import { AuditLog } from "@/models/AuditLog";
import { getValidatedSession } from "@/lib/auth/session";
import { sanitizeText, escapeRegex } from "@/lib/security/sanitize";
import { z } from "zod";

const inventoryCreateSchema = z.object({
  hospitalName: z.string().min(3, "Hospital name is required"),
  division: z.string().min(1, "Division is required"),
  district: z.string().min(1, "District is required"),
  contactNumber: z.string().min(6, "Valid contact number is required"),
  inventory: z.object({
    "A+": z.number().min(0).default(0),
    "A-": z.number().min(0).default(0),
    "B+": z.number().min(0).default(0),
    "B-": z.number().min(0).default(0),
    "AB+": z.number().min(0).default(0),
    "AB-": z.number().min(0).default(0),
    "O+": z.number().min(0).default(0),
    "O-": z.number().min(0).default(0),
  }),
});

const INITIAL_HOSPITAL_STOCK = [
  {
    hospitalName: "Dhaka Medical College Hospital (DMCH) Blood Bank",
    division: "Dhaka",
    district: "Dhaka",
    contactNumber: "01711-000101",
    inventory: { "A+": 14, "A-": 2, "B+": 18, "B-": 3, "AB+": 7, "AB-": 1, "O+": 16, "O-": 2 },
  },
  {
    hospitalName: "Bangabandhu Sheikh Mujib Medical University (BSMMU)",
    division: "Dhaka",
    district: "Dhaka",
    contactNumber: "01711-000102",
    inventory: { "A+": 9, "A-": 3, "B+": 11, "B-": 2, "AB+": 5, "AB-": 2, "O+": 12, "O-": 1 },
  },
  {
    hospitalName: "Chittagong Medical College Hospital (CMCH)",
    division: "Chittagong",
    district: "Chittagong",
    contactNumber: "01819-000201",
    inventory: { "A+": 10, "A-": 1, "B+": 15, "B-": 2, "AB+": 4, "AB-": 0, "O+": 11, "O-": 1 },
  },
  {
    hospitalName: "Rajshahi Medical College Hospital (RMCH)",
    division: "Rajshahi",
    district: "Rajshahi",
    contactNumber: "01712-000301",
    inventory: { "A+": 6, "A-": 1, "B+": 9, "B-": 1, "AB+": 3, "AB-": 1, "O+": 8, "O-": 0 },
  },
  {
    hospitalName: "Sylhet MAG Osmani Medical College Hospital",
    division: "Sylhet",
    district: "Sylhet",
    contactNumber: "01713-000401",
    inventory: { "A+": 7, "A-": 2, "B+": 8, "B-": 1, "AB+": 2, "AB-": 1, "O+": 10, "O-": 2 },
  },
];

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const district = searchParams.get("district");
    const division = searchParams.get("division");
    const hospitalName = searchParams.get("hospitalName");

    const filter: Record<string, unknown> = {};
    if (district && district !== "all") {
      filter.district = { $regex: new RegExp(`^${escapeRegex(district)}$`, "i") };
    }
    if (division && division !== "all") {
      filter.division = { $regex: new RegExp(`^${escapeRegex(division)}$`, "i") };
    }
    if (hospitalName && hospitalName.trim()) {
      filter.hospitalName = { $regex: escapeRegex(hospitalName.trim()), $options: "i" };
    }

    let inventories = await HospitalInventory.find(filter)
      .sort({ lastReportedAt: -1 })
      .limit(100)
      .lean();

    if (inventories.length === 0 && !district && !division && !hospitalName) {
      const existingCount = await HospitalInventory.countDocuments({});
      if (existingCount === 0) {
        await HospitalInventory.insertMany(INITIAL_HOSPITAL_STOCK).catch(() => {});
        inventories = await HospitalInventory.find({}).sort({ lastReportedAt: -1 }).limit(100).lean();
      }
    }

    return NextResponse.json({
      success: true,
      count: inventories.length,
      inventories,
    });
  } catch (error) {
    console.error("Hospital inventory fetch error:", error);
    return NextResponse.json({ error: "Failed to load hospital blood inventories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getValidatedSession();
    if (!session || (session.role !== "Admin" && session.role !== "Volunteer")) {
      return NextResponse.json(
        { error: "Unauthorized. Admin or Volunteer privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = inventoryCreateSchema.parse(body);

    await connectDB();
    const created = await HospitalInventory.create({
      hospitalName: sanitizeText(validated.hospitalName, 160),
      division: sanitizeText(validated.division, 50),
      district: sanitizeText(validated.district, 50),
      contactNumber: sanitizeText(validated.contactNumber, 30),
      inventory: validated.inventory,
      lastReportedAt: new Date(),
    });

    await AuditLog.create({
      action: "INVENTORY_UPDATED",
      performedBy: session.userId,
      targetId: String(created._id),
      targetType: "INVENTORY",
      metadata: {
        hospitalName: created.hospitalName,
        district: created.district,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "হাসপাতালের ব্লাড ব্যাংক ইনভেন্টরি সফলভাবে যুক্ত হয়েছে।",
      inventory: created,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid inventory payload" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create hospital inventory" }, { status: 500 });
  }
}
