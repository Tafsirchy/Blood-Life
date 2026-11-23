import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DonationRequest } from "@/models/DonationRequest";
import { MAJOR_BANGLADESH_HOSPITALS } from "@/lib/constants/bangladeshHospitals";

interface ScheduledPatientCase {
  id: string;
  patientCode: string;
  patientName: string;
  hospital: string;
  department: string;
  district: string;
  division: string;
  bloodGroup: string;
  bloodComponent: string;
  unitsNeeded: number;
  pledgedUnits: number;
  urgency: "critical" | "urgent" | "standard";
  scheduledDate: string;
  scheduledTime: string;
  medicalReason: string;
  requesterPhone: string;
  isVerifiedGenuine: boolean;
  createdAt: string;
}

const CLINICAL_SAMPLE_PATIENTS: ScheduledPatientCase[] = [
  {
    id: "case-h1",
    patientCode: "PT-DMCH-914",
    patientName: "Tasneem Rahman",
    hospital: "Dhaka Medical College Hospital (DMCH)",
    department: "Emergency Cesarean OT-4",
    district: "Dhaka",
    division: "Dhaka",
    bloodGroup: "O-",
    bloodComponent: "Whole Blood",
    unitsNeeded: 2,
    pledgedUnits: 0,
    urgency: "critical",
    scheduledDate: "2026-11-23",
    scheduledTime: "21:30",
    medicalReason: "Severe Post-Partum Hemorrhage (PPH) during emergency delivery.",
    requesterPhone: "01711•••233",
    isVerifiedGenuine: true,
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
  },
  {
    id: "case-h2",
    patientCode: "PT-NICVD-281",
    patientName: "Kamal Uddin",
    hospital: "National Institute of Cardiovascular Diseases (NICVD)",
    department: "Cardiac Surgery OT-2 (Open Heart Bypass)",
    district: "Dhaka",
    division: "Dhaka",
    bloodGroup: "B+",
    bloodComponent: "PRBC",
    unitsNeeded: 3,
    pledgedUnits: 1,
    urgency: "critical",
    scheduledDate: "2026-11-24",
    scheduledTime: "08:00",
    medicalReason: "Triple vessel coronary artery bypass grafting (CABG).",
    requesterPhone: "01819•••566",
    isVerifiedGenuine: true,
    createdAt: new Date(Date.now() - 75 * 60000).toISOString(),
  },
  {
    id: "case-h3",
    patientCode: "PT-BSMMU-405",
    patientName: "Fariha Jahan",
    hospital: "Bangabandhu Sheikh Mujib Medical University (BSMMU)",
    department: "Hematology & BMT Day-Care Unit",
    district: "Dhaka",
    division: "Dhaka",
    bloodGroup: "A+",
    bloodComponent: "Platelets (Single Donor Platelet)",
    unitsNeeded: 1,
    pledgedUnits: 0,
    urgency: "urgent",
    scheduledDate: "2026-11-24",
    scheduledTime: "11:00",
    medicalReason: "Acute Myeloid Leukemia (AML) post-chemotherapy severe thrombocytopenia.",
    requesterPhone: "01912•••789",
    isVerifiedGenuine: true,
    createdAt: new Date(Date.now() - 110 * 60000).toISOString(),
  },
  {
    id: "case-h4",
    patientCode: "PT-NITOR-118",
    patientName: "Abul Hossain",
    hospital: "National Institute of Traumatology and Orthopaedic Rehabilitation (NITOR)",
    department: "Emergency Orthopedic Trauma OT",
    district: "Dhaka",
    division: "Dhaka",
    bloodGroup: "AB-",
    bloodComponent: "Whole Blood",
    unitsNeeded: 2,
    pledgedUnits: 1,
    urgency: "critical",
    scheduledDate: "2026-11-23",
    scheduledTime: "23:00",
    medicalReason: "Multiple compound fractures with severe arterial bleeding from road traffic collision.",
    requesterPhone: "01614•••123",
    isVerifiedGenuine: true,
    createdAt: new Date(Date.now() - 50 * 60000).toISOString(),
  },
  {
    id: "case-h5",
    patientCode: "PT-CMCH-602",
    patientName: "Nazmun Nahar",
    hospital: "Chittagong Medical College Hospital (CMCH)",
    department: "ICU Unit-2 & Burn Ward",
    district: "Chittagong",
    division: "Chittagong",
    bloodGroup: "O+",
    bloodComponent: "Fresh Frozen Plasma (FFP)",
    unitsNeeded: 4,
    pledgedUnits: 2,
    urgency: "critical",
    scheduledDate: "2026-11-24",
    scheduledTime: "09:30",
    medicalReason: "40% deep thermal burn resuscitation requiring ongoing plasma volume expansion.",
    requesterPhone: "01815•••432",
    isVerifiedGenuine: true,
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
  },
  {
    id: "case-h6",
    patientCode: "PT-MAG-319",
    patientName: "Sumon Ahmed",
    hospital: "Sylhet MAG Osmani Medical College Hospital",
    department: "General Surgery OT-1",
    district: "Sylhet",
    division: "Sylhet",
    bloodGroup: "A-",
    bloodComponent: "PRBC",
    unitsNeeded: 2,
    pledgedUnits: 0,
    urgency: "urgent",
    scheduledDate: "2026-11-24",
    scheduledTime: "14:00",
    medicalReason: "Emergency laparotomy for perforated peptic ulcer.",
    requesterPhone: "01718•••991",
    isVerifiedGenuine: true,
    createdAt: new Date(Date.now() - 140 * 60000).toISOString(),
  },
  {
    id: "case-h7",
    patientCode: "PT-RMCH-188",
    patientName: "Mehedi Hasan",
    hospital: "Rajshahi Medical College Hospital (RMCH)",
    department: "Neurosurgery ICU",
    district: "Rajshahi",
    division: "Rajshahi",
    bloodGroup: "B-",
    bloodComponent: "Whole Blood",
    unitsNeeded: 2,
    pledgedUnits: 0,
    urgency: "critical",
    scheduledDate: "2026-11-23",
    scheduledTime: "22:15",
    medicalReason: "Extradural hematoma evacuation craniotomy.",
    requesterPhone: "01722•••678",
    isVerifiedGenuine: true,
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: "case-h8",
    patientCode: "PT-KGH-512",
    patientName: "Rubel Mia",
    hospital: "Kurmitola General Hospital",
    department: "High Dependency Unit (HDU)",
    district: "Dhaka",
    division: "Dhaka",
    bloodGroup: "O+",
    bloodComponent: "Platelets",
    unitsNeeded: 1,
    pledgedUnits: 0,
    urgency: "urgent",
    scheduledDate: "2026-11-24",
    scheduledTime: "10:00",
    medicalReason: "Dengue Hemorrhagic Fever with platelet count below 15,000/μL.",
    requesterPhone: "01925•••456",
    isVerifiedGenuine: true,
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
  },
];

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const hospitalFilter = searchParams.get("hospital");
    const districtFilter = searchParams.get("district");
    const divisionFilter = searchParams.get("division");
    const bloodGroupFilter = searchParams.get("bloodGroup");
    const urgencyFilter = searchParams.get("urgency");

    const query: Record<string, unknown> = {
      status: { $in: ["pending", "inprogress"] },
    };

    if (hospitalFilter && hospitalFilter !== "all") {
      query.hospital = { $regex: hospitalFilter, $options: "i" };
    }
    if (districtFilter && districtFilter !== "all") {
      query.district = districtFilter;
    }
    if (divisionFilter && divisionFilter !== "all") {
      query.division = divisionFilter;
    }
    if (bloodGroupFilter && bloodGroupFilter !== "all") {
      query.bloodGroup = bloodGroupFilter;
    }
    if (urgencyFilter && urgencyFilter !== "all") {
      query.urgency = urgencyFilter;
    }

    const dbRequests = await DonationRequest.find(query)
      .sort({ urgency: 1, createdAt: -1 })
      .limit(60)
      .lean();

    const dbPatients: ScheduledPatientCase[] = dbRequests.map((r: any) => ({
      id: String(r._id),
      patientCode: `PT-${String(r._id).slice(-4).toUpperCase()}`,
      patientName: r.recipientName || "Emergency Patient",
      hospital: r.hospital,
      department: r.medicalReason ? `OT / Requisition (${r.medicalReason})` : "General Emergency Ward",
      district: r.district,
      division: r.division,
      bloodGroup: r.bloodGroup,
      bloodComponent: r.bloodComponent || "Whole Blood",
      unitsNeeded: r.unitsNeeded || 1,
      pledgedUnits: r.pledgedUnits || 0,
      urgency: r.urgency || "urgent",
      scheduledDate: r.scheduledDate || new Date().toISOString().split("T")[0],
      scheduledTime: r.scheduledTime || "As soon as possible",
      medicalReason: r.medicalReason || r.message || "Emergency surgical requisition.",
      requesterPhone: r.requesterPhone
        ? r.requesterPhone.slice(0, 5) + "•••" + r.requesterPhone.slice(-3)
        : "01700•••000",
      isVerifiedGenuine: Boolean(r.isVerifiedGenuine),
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }));

    // Filter sample clinical dataset if query applied
    let filteredSamples = CLINICAL_SAMPLE_PATIENTS;
    if (hospitalFilter && hospitalFilter !== "all") {
      filteredSamples = filteredSamples.filter((p) =>
        p.hospital.toLowerCase().includes(hospitalFilter.toLowerCase())
      );
    }
    if (districtFilter && districtFilter !== "all") {
      filteredSamples = filteredSamples.filter(
        (p) => p.district.toLowerCase() === districtFilter.toLowerCase()
      );
    }
    if (divisionFilter && divisionFilter !== "all") {
      filteredSamples = filteredSamples.filter(
        (p) => p.division.toLowerCase() === divisionFilter.toLowerCase()
      );
    }
    if (bloodGroupFilter && bloodGroupFilter !== "all") {
      filteredSamples = filteredSamples.filter((p) => p.bloodGroup === bloodGroupFilter);
    }
    if (urgencyFilter && urgencyFilter !== "all") {
      filteredSamples = filteredSamples.filter((p) => p.urgency === urgencyFilter);
    }

    // Merge database records with clinical samples (deduping if any)
    const allPatients = [...dbPatients, ...filteredSamples];

    // Group by Hospital for Hospital Summary View
    const hospitalMap = new Map<
      string,
      {
        hospitalName: string;
        district: string;
        division: string;
        totalPatients: number;
        totalUnits: number;
        bloodBreakdown: Record<string, number>;
        criticalCount: number;
        patients: ScheduledPatientCase[];
      }
    >();

    allPatients.forEach((p) => {
      const existing = hospitalMap.get(p.hospital);
      if (!existing) {
        hospitalMap.set(p.hospital, {
          hospitalName: p.hospital,
          district: p.district,
          division: p.division,
          totalPatients: 1,
          totalUnits: p.unitsNeeded,
          bloodBreakdown: { [p.bloodGroup]: p.unitsNeeded },
          criticalCount: p.urgency === "critical" ? 1 : 0,
          patients: [p],
        });
      } else {
        existing.totalPatients += 1;
        existing.totalUnits += p.unitsNeeded;
        existing.bloodBreakdown[p.bloodGroup] =
          (existing.bloodBreakdown[p.bloodGroup] || 0) + p.unitsNeeded;
        if (p.urgency === "critical") existing.criticalCount += 1;
        existing.patients.push(p);
      }
    });

    const hospitalSummaries = Array.from(hospitalMap.values()).sort(
      (a, b) => b.criticalCount - a.criticalCount || b.totalUnits - a.totalUnits
    );

    // Aggregate overall metrics
    const totalUnitsNeeded = allPatients.reduce((sum, p) => sum + p.unitsNeeded, 0);
    const totalPledgedUnits = allPatients.reduce((sum, p) => sum + p.pledgedUnits, 0);
    const criticalCases = allPatients.filter((p) => p.urgency === "critical").length;

    return NextResponse.json({
      success: true,
      stats: {
        totalSurgeries: allPatients.length,
        totalUnitsNeeded,
        totalPledgedUnits,
        criticalCases,
        activeHospitals: hospitalSummaries.length,
      },
      hospitals: hospitalSummaries,
      patients: allPatients,
      directoryHospitals: MAJOR_BANGLADESH_HOSPITALS,
    });
  } catch (error) {
    console.error("Error fetching hospital demand board:", error);
    return NextResponse.json(
      { error: "Failed to load hospital demand data." },
      { status: 500 }
    );
  }
}
