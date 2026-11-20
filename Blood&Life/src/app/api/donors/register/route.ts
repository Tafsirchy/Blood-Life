import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DonorRegistration } from "@/models/DonorRegistration";
import { User } from "@/models/User";
import { z } from "zod";

const donorRegistrationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  gender: z.enum(["male", "female", "other"]),
  dateOfBirth: z.string().min(4, "Date of birth required"),
  age: z.number().min(18, "Donor must be at least 18 years old").max(65, "Maximum donor age is 65"),
  occupation: z.string().optional(),
  presentAddress: z.string().min(3, "Present address required"),
  permanentAddress: z.string().optional(),
  division: z.string().min(1, "Division required"),
  district: z.string().min(1, "District required"),
  upazila: z.string().min(1, "Upazila required"),
  phone: z.string().min(11, "Valid phone number required"),
  email: z.string().email("Valid email required"),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"]),
  // Donation History
  hasDonatedBefore: z.boolean(),
  lastDonationDate: z.string().optional(),
  hadAdverseReaction: z.boolean().default(false),
  adverseReactionDetails: z.string().optional(),
  // Medical History
  medicalHistory: z.object({
    hasRecentIllness: z.boolean().default(false),
    recentIllnessDetails: z.string().optional(),
    hasChronicDisease: z.boolean().default(false),
    chronicDiseaseDetails: z.string().optional(),
    hasInfectiousDisease: z.boolean().default(false),
    takingMedications: z.boolean().default(false),
    medicationDetails: z.string().optional(),
    hadRecentSurgeryOrTattoo: z.boolean().default(false),
    isPregnant: z.boolean().default(false),
    isLactating: z.boolean().default(false),
    isMenstruating: z.boolean().default(false),
  }),
  // Physical Exam
  physicalExam: z.object({
    weightKg: z.number().min(40, "Minimum weight is 40kg"),
    bloodPressure: z.string().optional(),
    pulseBpm: z.number().optional(),
    hemoglobinLevel: z.number().optional(),
    temperatureNormal: z.boolean().default(true),
  }),
  // Consent
  consent: z.object({
    voluntaryAgreement: z.boolean().refine((val) => val === true, "Must agree to voluntary donation"),
    truthfulDeclaration: z.boolean().refine((val) => val === true, "Must declare information is truthful"),
    emergencyContactConsent: z.boolean().refine((val) => val === true, "Must consent to emergency contact"),
    digitalSignature: z.string().min(2, "Digital signature required"),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = donorRegistrationSchema.parse(body);

    await connectDB();

    // Clinical Eligibility Calculation
    let eligibilityStatus: "eligible" | "temporary_deferral" | "permanent_deferral" = "eligible";
    const deferralReasons: string[] = [];
    let cooldownDate: Date | null = null;

    if (validated.physicalExam.weightKg < 45) {
      eligibilityStatus = "temporary_deferral";
      deferralReasons.push("Weight below safe threshold (Minimum 45kg required / ওজন কমপক্ষে ৪৫ কেজি হতে হবে)");
    }

    if (validated.medicalHistory.hasInfectiousDisease) {
      eligibilityStatus = "permanent_deferral";
      deferralReasons.push("History of infectious condition (হেপাটাইটিস, এইচআইভি বা সংক্রামক ব্যাধির ইতিহাস)");
    }

    if (validated.medicalHistory.hadRecentSurgeryOrTattoo) {
      if (eligibilityStatus !== "permanent_deferral") eligibilityStatus = "temporary_deferral";
      deferralReasons.push("Recent surgery, dental extraction, or tattoo within 6-12 months (সাম্প্রতিক অস্ত্রোপচার বা ট্যাটু)");
    }

    if (validated.medicalHistory.hasRecentIllness) {
      if (eligibilityStatus !== "permanent_deferral") eligibilityStatus = "temporary_deferral";
      deferralReasons.push("Recent fever, infection or antibiotic course (সাম্প্রতিক অসুস্থতা বা অ্যান্টিবায়োটিক)");
    }

    if (validated.medicalHistory.isPregnant || validated.medicalHistory.isLactating) {
      if (eligibilityStatus !== "permanent_deferral") eligibilityStatus = "temporary_deferral";
      deferralReasons.push("Pregnancy or lactation deferral (গর্ভকালীন বা স্তন্যদানকালীন সময়ে রক্তদান স্থগিত)");
    }

    // 90-day Cooldown Check
    if (validated.hasDonatedBefore && validated.lastDonationDate) {
      const lastDate = new Date(validated.lastDonationDate);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 90) {
        if (eligibilityStatus !== "permanent_deferral") eligibilityStatus = "temporary_deferral";
        const daysRemaining = 90 - diffDays;
        cooldownDate = new Date(lastDate.getTime() + 90 * 24 * 60 * 60 * 1000);
        deferralReasons.push(`Last donation was ${diffDays} days ago. Mandatory 90-day rest period active (${daysRemaining} days remaining / শেষ রক্তদানের পর ৯০ দিন পূর্ণ হয়নি)`);
      }
    }

    const eligibilityNotes = deferralReasons.length > 0 ? deferralReasons.join("; ") : "Clinically approved for voluntary donation.";

    // Save full clinical registration
    const registration = await DonorRegistration.create({
      ...validated,
      eligibilityStatus,
      eligibilityNotes,
    });

    // Also upsert/update User record so they appear in donor searches if blood group is known
    if (validated.bloodGroup !== "Unknown") {
      await User.findOneAndUpdate(
        { email: validated.email },
        {
          name: validated.fullName,
          email: validated.email,
          phone: validated.phone,
          bloodGroup: validated.bloodGroup,
          division: validated.division,
          district: validated.district,
          upazila: validated.upazila,
          role: "Donor",
          isAvailable: eligibilityStatus === "eligible",
          cooldownUntil: cooldownDate || undefined,
          lastDonationDate: validated.lastDonationDate ? new Date(validated.lastDonationDate) : undefined,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      registrationId: registration._id,
      eligibilityStatus,
      eligibilityNotes,
      message:
        eligibilityStatus === "eligible"
          ? "অভিনন্দন! আপনি রক্তদানে সম্পূর্ণ উপযুক্ত এবং আমাদের জাতীয় ডোনার নেটওয়ার্কে যুক্ত হয়েছেন।"
          : "আপনার ফর্মটি সংরক্ষিত হয়েছে। স্বাস্থ্যগত সতর্কতা অনুযায়ী সাময়িক বিরতির সুপারিশ করা হয়েছে।",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid donor form data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to process donor registration" }, { status: 500 });
  }
}