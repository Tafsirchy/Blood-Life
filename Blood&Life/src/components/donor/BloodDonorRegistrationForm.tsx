"use client";

import React, { useState, useId } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { DIVISIONS, DISTRICTS } from "@/lib/geo/bangladeshData";
import { BloodGroup } from "@/types";
import {
  User,
  Heart,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Activity,
  ArrowRight,
  ArrowLeft,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export function BloodDonorRegistrationForm() {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any>(null);

  // Section 1: Personal & Contact
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [age, setAge] = useState<number>(24);
  const [occupation, setOccupation] = useState("");
  const [presentAddress, setPresentAddress] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [division, setDivision] = useState("Dhaka");
  const [district, setDistrict] = useState("Dhaka");
  const [upazila, setUpazila] = useState("Dhanmondi");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | "Unknown">("O+");

  // Section 2: Donation History
  const [hasDonatedBefore, setHasDonatedBefore] = useState<boolean>(false);
  const [lastDonationDate, setLastDonationDate] = useState("");
  const [hadAdverseReaction, setHadAdverseReaction] = useState(false);
  const [adverseReactionDetails, setAdverseReactionDetails] = useState("");

  // Section 3: Medical & Lifestyle Questionnaire
  const [hasRecentIllness, setHasRecentIllness] = useState(false);
  const [recentIllnessDetails, setRecentIllnessDetails] = useState("");
  const [hasChronicDisease, setHasChronicDisease] = useState(false);
  const [chronicDiseaseDetails, setChronicDiseaseDetails] = useState("");
  const [hasInfectiousDisease, setHasInfectiousDisease] = useState(false);
  const [takingMedications, setTakingMedications] = useState(false);
  const [medicationDetails, setMedicationDetails] = useState("");
  const [hadRecentSurgeryOrTattoo, setHadRecentSurgeryOrTattoo] = useState(false);
  // Female specific
  const [isPregnant, setIsPregnant] = useState(false);
  const [isLactating, setIsLactating] = useState(false);
  const [isMenstruating, setIsMenstruating] = useState(false);

  // Section 4: Physical Examination
  const [weightKg, setWeightKg] = useState<number>(62);
  const [bloodPressure, setBloodPressure] = useState("120/80");
  const [pulseBpm, setPulseBpm] = useState<number>(76);
  const [hemoglobinLevel, setHemoglobinLevel] = useState<number>(13.5);
  const [temperatureNormal, setTemperatureNormal] = useState(true);

  // Section 5: Consent & Declaration
  const [voluntaryAgreement, setVoluntaryAgreement] = useState(false);
  const [truthfulDeclaration, setTruthfulDeclaration] = useState(false);
  const [emergencyContactConsent, setEmergencyContactConsent] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState("");

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

  // Filter districts based on selected division
  const districtsInDivision = DISTRICTS.filter(
    (d) => d.division.toLowerCase() === division.toLowerCase()
  );

  // Step 1 Validation
  const validateStep1 = () => {
    if (!fullName || !phone || !email || !presentAddress) {
      setError(language === "bn" ? "অনুগ্রহ করে সব তারকা চিহ্নিত (*) তথ্য পূরণ করুন।" : "Please fill in all required (*) personal fields.");
      return false;
    }
    if (age < 18 || age > 65) {
      setError(language === "bn" ? "রক্তদাতার বয়স ১৮ থেকে ৬৫ বছরের মধ্যে হতে হবে।" : "Donor must be between 18 and 65 years old.");
      return false;
    }
    return true;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (hasDonatedBefore && !lastDonationDate) {
      setError(language === "bn" ? "পূর্বে রক্ত দিয়ে থাকলে সর্বশেষ রক্তদানের আনুমানিক তারিখ দিন।" : "Please enter the approximate date of your last donation.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep((prev) => Math.min(prev + 1, 5) as any);
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1) as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!voluntaryAgreement || !truthfulDeclaration || !emergencyContactConsent || !digitalSignature) {
      setError(language === "bn" ? "সম্মতিপত্রের সবগুলো শর্তে টিক দিন এবং আপনার পূর্ণ নাম লিখে ডিজিটাল স্বাক্ষর করুন।" : "Please agree to all consent terms and provide your digital signature.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName,
        gender,
        dateOfBirth: dateOfBirth || "2000-01-01",
        age: Number(age),
        occupation,
        presentAddress,
        permanentAddress,
        division,
        district,
        upazila,
        phone,
        email,
        bloodGroup,
        hasDonatedBefore,
        lastDonationDate: hasDonatedBefore ? lastDonationDate : undefined,
        hadAdverseReaction,
        adverseReactionDetails,
        medicalHistory: {
          hasRecentIllness,
          recentIllnessDetails,
          hasChronicDisease,
          chronicDiseaseDetails,
          hasInfectiousDisease,
          takingMedications,
          medicationDetails,
          hadRecentSurgeryOrTattoo,
          isPregnant: gender === "female" ? isPregnant : false,
          isLactating: gender === "female" ? isLactating : false,
          isMenstruating: gender === "female" ? isMenstruating : false,
        },
        physicalExam: {
          weightKg: Number(weightKg),
          bloodPressure,
          pulseBpm: Number(pulseBpm),
          hemoglobinLevel: Number(hemoglobinLevel),
          temperatureNormal,
        },
        consent: {
          voluntaryAgreement,
          truthfulDeclaration,
          emergencyContactConsent,
          digitalSignature,
        },
      };

      const res = await fetch("/api/donors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      setSuccessResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Cooldown calculation helper
  const calculateDaysSinceLastDonation = () => {
    if (!lastDonationDate) return null;
    const diffTime = Math.abs(new Date().getTime() - new Date(lastDonationDate).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const daysSince = calculateDaysSinceLastDonation();

  if (successResult) {
    const isEligible = successResult.eligibilityStatus === "eligible";
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-6 sm:p-10 shadow-xs text-center max-w-2xl mx-auto space-y-5">
        <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto shadow-xs ${
          isEligible
            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200/80"
            : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200/80"
        }`}>
          {isEligible ? <CheckCircle2 size={36} /> : <Clock size={36} />}
        </div>

        <div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
            isEligible
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}>
            {isEligible
              ? (language === "bn" ? "রক্তদানে সম্পূর্ণ উপযুক্ত" : "Clinically Eligible")
              : (language === "bn" ? "সাময়িক বিরতির সুপারিশ" : "Temporary Deferral")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            {language === "bn" ? "রক্তদাতা ফর্ম সফলভাবে নিবন্ধিত হয়েছে!" : "Blood Donor Registration Successful!"}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
            {successResult.message}
          </p>
        </div>

        {successResult.eligibilityNotes && (
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-left text-xs text-zinc-600 dark:text-zinc-300">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
              {language === "bn" ? "ক্লিনিক্যাল মূল্যায়ন নোট:" : "Clinical Assessment Note:"}
            </span>
            <p>{successResult.eligibilityNotes}</p>
          </div>
        )}

        <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all"
          >
            {language === "bn" ? "আমার ড্যাশবোর্ড দেখুন" : "Go to Donor Cockpit"}
          </Link>
          <Link
            href="/search"
            className="px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {language === "bn" ? "জরুরি আবেদনসমূহ দেখুন" : "View Urgent Requests"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs overflow-hidden transition-all max-w-4xl mx-auto">
      {/* Form Top Header with Quantum / Sandhani / Red Crescent Clinical Standard Badge */}
      <div className="p-5 sm:p-7 border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200/80 dark:border-red-900/60 flex items-center justify-center shadow-2xs">
              <Heart size={20} className="fill-red-600/20" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                {language === "bn" ? "জাতীয় স্বেচ্ছায় রক্তদাতা নিবন্ধন ফর্ম" : "National Voluntary Blood Donor Registration"}
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {language === "bn"
                  ? "কোয়ান্টাম, সন্ধানী ও রেড ক্রিসেন্ট স্ট্যান্ডার্ড অনুযায়ী প্রস্তুতকৃত অফিসিয়াল ফর্ম"
                  : "Standardized clinical questionnaire compliant with national blood banking protocols"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200/70 dark:border-emerald-900/40">
            <ShieldCheck size={13} />
            <span>{language === "bn" ? "আইনি সুরক্ষা ও গোপনীয়তা সংরক্ষিত" : "100% Privacy Protected"}</span>
          </div>
        </div>

        {/* Step Progression Stepper */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-2">
          {[
            { num: 1, titleBn: "১. ব্যক্তিগত", titleEn: "1. Personal" },
            { num: 2, titleBn: "২. ইতিহাস", titleEn: "2. History" },
            { num: 3, titleBn: "৩. স্বাস্থ্য", titleEn: "3. Medical" },
            { num: 4, titleBn: "৪. পরীক্ষা", titleEn: "4. Exam" },
            { num: 5, titleBn: "৫. সম্মতি", titleEn: "5. Consent" },
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => {
                if (s.num < currentStep) setCurrentStep(s.num as any);
              }}
              className={`p-2 rounded-lg text-center border transition-all cursor-pointer ${
                currentStep === s.num
                  ? "bg-red-600 text-white border-red-600 shadow-2xs"
                  : currentStep > s.num
                  ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/40 font-semibold"
                  : "bg-white dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700"
              }`}
            >
              <span className="text-[11px] sm:text-xs font-bold block truncate">
                {language === "bn" ? s.titleBn : s.titleEn}
              </span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="m-5 sm:m-7 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* The Multi-Section Form */}
      <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6">
        {/* ========================================================================= */}
        {/* SECTION 1: ব্যক্তিগত ও যোগাযোগের তথ্য (Personal & Contact Info) */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <User size={15} className="text-red-600" />
                <span>{language === "bn" ? "১. ব্যক্তিগত ও যোগাযোগের তথ্য (Personal & Contact)" : "1. Personal & Contact Information"}</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                  {language === "bn" ? "দাতার পূর্ণ নাম *" : "Full Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed Chowdhury"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-medium outline-none focus:border-red-500 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                  {language === "bn" ? "লিঙ্গ *" : "Gender *"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "male", bn: "পুরুষ", en: "Male" },
                    { id: "female", bn: "নারী", en: "Female" },
                    { id: "other", bn: "অন্যান্য", en: "Other" },
                  ].map((g) => (
                    <label
                      key={g.id}
                      className={`py-2 px-3 rounded-lg border text-center text-xs font-bold cursor-pointer transition-colors ${
                        gender === g.id
                          ? "bg-red-50 dark:bg-red-950/40 text-red-600 border-red-300 dark:border-red-800"
                          : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={g.id}
                        checked={gender === g.id}
                        onChange={() => setGender(g.id as any)}
                        className="sr-only"
                      />
                      <span>{language === "bn" ? g.bn : g.en}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                  {language === "bn" ? "জন্মতারিখ *" : "Date of Birth *"}
                </label>
                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => {
                    setDateOfBirth(e.target.value);
                    if (e.target.value) {
                      const calculatedAge = Math.floor(
                        (new Date().getTime() - new Date(e.target.value).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
                      );
                      if (!isNaN(calculatedAge) && calculatedAge > 0) setAge(calculatedAge);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-medium outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                  {language === "bn" ? "বয়স (১৮-৬৫ বছর) *" : "Age (18-65) *"}
                </label>
                <input
                  type="number"
                  min={18}
                  max={65}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-semibold outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                  {language === "bn" ? "রক্তের গ্রুপ *" : "Blood Group *"}
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 outline-none focus:border-red-500"
                >
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg === "Unknown" ? (language === "bn" ? "অজানা / নিশ্চিত নয়" : "Unknown / Need Test") : bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                  {language === "bn" ? "ফোন নম্বর (জরুরি যোগাযোগের জন্য) *" : "Phone Number (Emergency Contact) *"}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01712345678"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-medium outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                  {language === "bn" ? "ইমেইল ঠিকানা *" : "Email Address *"}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="donor@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-medium outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                  {language === "bn" ? "বিভাগ *" : "Division *"}
                </label>
                <select
                  value={division}
                  onChange={(e) => {
                    setDivision(e.target.value);
                    const firstDistrict = DISTRICTS.find(
                      (d) => d.division.toLowerCase() === e.target.value.toLowerCase()
                    );
                    if (firstDistrict) setDistrict(firstDistrict.nameEn);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-medium outline-none"
                >
                  {DIVISIONS.map((d) => (
                    <option key={d.id} value={d.nameEn}>
                      {language === "bn" ? d.nameBn : d.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                  {language === "bn" ? "জেলা *" : "District *"}
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-medium outline-none"
                >
                  {districtsInDivision.map((dist) => (
                    <option key={dist.id} value={dist.nameEn}>
                      {language === "bn" ? dist.nameBn : dist.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                  {language === "bn" ? "উপজেলা / থানা *" : "Upazila / Thana *"}
                </label>
                <input
                  type="text"
                  required
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  placeholder="e.g. Dhanmondi, Mirpur"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-medium outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                  {language === "bn" ? "বর্তমান ঠিকানা *" : "Present Address *"}
                </label>
                <input
                  type="text"
                  required
                  value={presentAddress}
                  onChange={(e) => setPresentAddress(e.target.value)}
                  placeholder="House 12, Road 4, Dhanmondi, Dhaka"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                  {language === "bn" ? "পেশা (ঐচ্ছিক)" : "Occupation (Optional)"}
                </label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="e.g. Student, Software Engineer, Teacher"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-medium outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: রক্তদানের পূর্ববর্তী ইতিহাস (Donation History) */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <Clock size={15} className="text-red-600" />
                <span>{language === "bn" ? "২. রক্তদানের পূর্ববর্তী ইতিহাস (Donation History)" : "2. Prior Donation History"}</span>
              </h2>
            </div>

            {/* Previously Donated Toggle */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 space-y-3">
              <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                {language === "bn" ? "আপনি কি পূর্বে কখনো রক্ত দিয়েছেন?" : "Have you donated blood before?"}
              </label>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasDonated"
                    checked={hasDonatedBefore}
                    onChange={() => setHasDonatedBefore(true)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {language === "bn" ? "হ্যাঁ (Yes)" : "Yes"}
                  </span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasDonated"
                    checked={!hasDonatedBefore}
                    onChange={() => setHasDonatedBefore(false)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {language === "bn" ? "না, এই প্রথম (First Time Donor)" : "No, First Time"}
                  </span>
                </label>
              </div>

              {hasDonatedBefore && (
                <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-700 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                      {language === "bn" ? "সর্বশেষ রক্তদানের তারিখ *" : "Last Donation Date *"}
                    </label>
                    <input
                      type="date"
                      value={lastDonationDate}
                      onChange={(e) => setLastDonationDate(e.target.value)}
                      className="w-full sm:w-1/2 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs sm:text-sm font-semibold outline-none focus:border-red-500"
                    />
                  </div>

                  {daysSince !== null && (
                    <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                      daysSince >= 90
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}>
                      <Activity size={15} className="shrink-0" />
                      <span>
                        {daysSince >= 90
                          ? (language === "bn"
                              ? `শেষ রক্তদানের পর ${daysSince} দিন অতিক্রান্ত হয়েছে। আপনি রক্তদানের জন্য শারীরিকভাবে প্রস্তুত!`
                              : `${daysSince} days since last donation. You have completed the 90-day cooldown!`)
                          : (language === "bn"
                              ? `শেষ রক্তদানের পর মাত্র ${daysSince} দিন হয়েছে। ৯০ দিনের বিরতি সম্পন্ন হতে আরো ${90 - daysSince} দিন বাকি।`
                              : `Only ${daysSince} days elapsed. Cooldown requires ${90 - daysSince} more days for safe donation.`)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Adverse Reaction Checkbox */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hadAdverseReaction}
                  onChange={(e) => setHadAdverseReaction(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                    {language === "bn"
                      ? "পূর্বে রক্তদানের সময় বা পরে কোনো সমস্যা হয়েছিল কি? (যেমন: মাথা ঘোরা, বমি বা অজ্ঞান হয়ে যাওয়া)"
                      : "Did you ever experience adverse symptoms during/after donation? (Dizziness, nausea, fainting)"}
                  </span>
                  <span className="text-[11px] text-zinc-500 block">
                    {language === "bn" ? "যদি হয়ে থাকে, টিক দিন এবং নিচে সংক্ষেপে জানান।" : "If yes, please check this box and describe below."}
                  </span>
                </div>
              </label>

              {hadAdverseReaction && (
                <input
                  type="text"
                  value={adverseReactionDetails}
                  onChange={(e) => setAdverseReactionDetails(e.target.value)}
                  placeholder={language === "bn" ? "যেমন: রক্ত দেওয়ার পর সাময়িক মাথা ঘুরেছিল" : "Describe reaction (e.g. Mild dizziness for 5 mins)"}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium outline-none focus:border-red-500"
                />
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3: স্বাস্থ্যগত ও জীবনযাপন সংক্রান্ত প্রশ্নাবলি (Medical Questionnaire) */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <Activity size={15} className="text-red-600" />
                <span>{language === "bn" ? "৩. স্বাস্থ্যগত প্রশ্নাবলি (Medical & Lifestyle Questionnaire)" : "3. Medical & Health Questionnaire"}</span>
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {language === "bn"
                  ? "প্রযোজ্য ক্ষেত্রগুলোতে টিক (Checkbox) দিন। কোনোটি প্রযোজ্য না হলে খালি রাখুন।"
                  : "Check all that apply. If none apply, leave unchecked."}
              </p>
            </div>

            <div className="space-y-3">
              {/* Question 1: Recent Illness */}
              <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasRecentIllness}
                    onChange={(e) => setHasRecentIllness(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                      {language === "bn" ? "সাম্প্রতিক অসুস্থতা (Recent Illness)" : "Recent Illness / Infection"}
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      {language === "bn"
                        ? "গত ২-৪ সপ্তাহের মধ্যে জ্বর, সর্দি-কাশি, ডায়রিয়া বা কোনো ইনফেকশন হয়েছে কি না।"
                        : "Fever, cold, cough, diarrhea, or acute infection in the last 2-4 weeks."}
                    </span>
                  </div>
                </label>
                {hasRecentIllness && (
                  <input
                    type="text"
                    value={recentIllnessDetails}
                    onChange={(e) => setRecentIllnessDetails(e.target.value)}
                    placeholder={language === "bn" ? "অসুস্থতার ধরন লিখুন (যেমন: ৩ দিন আগে সাধারণ সর্দি)" : "Details of illness (e.g. Mild flu 10 days ago)"}
                    className="mt-2 w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium outline-none focus:border-red-500"
                  />
                )}
              </div>

              {/* Question 2: Chronic Diseases */}
              <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasChronicDisease}
                    onChange={(e) => setHasChronicDisease(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                      {language === "bn" ? "দীর্ঘমেয়াদী রোগ (Chronic Illnesses)" : "Chronic Medical Conditions"}
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      {language === "bn"
                        ? "ডায়াবেটিস, অনিয়ন্ত্রিত উচ্চ রক্তচাপ, হৃদরোগ, হাঁপানি (Asthma), মৃগীরোগ বা ক্যানসার।"
                        : "Diabetes, uncontrolled hypertension, heart condition, asthma, epilepsy, or cancer."}
                    </span>
                  </div>
                </label>
                {hasChronicDisease && (
                  <input
                    type="text"
                    value={chronicDiseaseDetails}
                    onChange={(e) => setChronicDiseaseDetails(e.target.value)}
                    placeholder={language === "bn" ? "রোগের নাম লিখুন" : "Name condition"}
                    className="mt-2 w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium outline-none focus:border-red-500"
                  />
                )}
              </div>

              {/* Question 3: Infectious Diseases */}
              <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasInfectiousDisease}
                    onChange={(e) => setHasInfectiousDisease(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                      {language === "bn" ? "সংক্রামক রোগ (Infectious Diseases)" : "Infectious Diseases History"}
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      {language === "bn"
                        ? "হেপাটাইটিস বি বা সি (জন্ডিস), এইচআইভি (HIV), সিফিলিস, ম্যালেরিয়া বা যক্ষ্মার ইতিহাস আছে কি না।"
                        : "History of Hepatitis B/C, HIV/AIDS, Syphilis, Malaria, or Tuberculosis."}
                    </span>
                  </div>
                </label>
              </div>

              {/* Question 4: Medications & Vaccines */}
              <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={takingMedications}
                    onChange={(e) => setTakingMedications(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                      {language === "bn" ? "ওষুধ ও টিকা (Medications & Vaccines)" : "Medications & Recent Vaccines"}
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      {language === "bn"
                        ? "বর্তমানে কোনো অ্যান্টিবায়োটিক বা নিয়মিত ওষুধ খাচ্ছেন কি না অথবা গত ৪ সপ্তাহে ভ্যাকসিন নিয়েছেন কি না।"
                        : "Currently taking antibiotics or routine medication, or received a vaccine in the past 4 weeks."}
                    </span>
                  </div>
                </label>
                {takingMedications && (
                  <input
                    type="text"
                    value={medicationDetails}
                    onChange={(e) => setMedicationDetails(e.target.value)}
                    placeholder={language === "bn" ? "ওষুধের নাম লিখুন" : "Medication name"}
                    className="mt-2 w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium outline-none focus:border-red-500"
                  />
                )}
              </div>

              {/* Question 5: Recent Surgery or Tattoo */}
              <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hadRecentSurgeryOrTattoo}
                    onChange={(e) => setHadRecentSurgeryOrTattoo(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                      {language === "bn" ? "অস্ত্রোপচার, দাঁত তোলা বা ট্যাটু (Surgery, Dental or Tattoo)" : "Recent Surgery, Dental Work or Tattoo"}
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      {language === "bn"
                        ? "গত ৬ থেকে ১২ মাসের মধ্যে কোনো বড় অপারেশন, দাঁত তোলা, ট্যাটু বা পিয়ার্সিং করিয়েছেন কি না।"
                        : "Major surgery, dental extraction, tattoo, or body piercing within the last 6-12 months."}
                    </span>
                  </div>
                </label>
              </div>

              {/* Female-Specific Questions */}
              {gender === "female" && (
                <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-2.5">
                  <span className="text-xs font-bold text-rose-800 dark:text-rose-300 block">
                    {language === "bn" ? "নারীদের জন্য বিশেষ স্বাস্থ্য তথ্য:" : "Female Health Assessment:"}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPregnant}
                        onChange={(e) => setIsPregnant(e.target.checked)}
                        className="w-4 h-4 rounded text-red-600"
                      />
                      <span>{language === "bn" ? "গর্ভবতী (Pregnant)" : "Pregnant"}</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isLactating}
                        onChange={(e) => setIsLactating(e.target.checked)}
                        className="w-4 h-4 rounded text-red-600"
                      />
                      <span>{language === "bn" ? "বুকের দুধ খাওয়াচ্ছেন" : "Breastfeeding"}</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isMenstruating}
                        onChange={(e) => setIsMenstruating(e.target.checked)}
                        className="w-4 h-4 rounded text-red-600"
                      />
                      <span>{language === "bn" ? "মাসিক চলছে" : "Menstruating"}</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 4: তাৎক্ষণিক শারীরিক পরীক্ষা (Physical Examination) */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <ShieldCheck size={15} className="text-red-600" />
                <span>{language === "bn" ? "৪. প্রাথমিক শারীরিক পরীক্ষা (Physical Examination Metrics)" : "4. Physical Health Metrics"}</span>
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {language === "bn"
                  ? "রক্তদানের আগে প্রাথমিক শারীরিক প্যারামিটারসমূহ উল্লেখ করুন (বা ব্লাড ব্যাংক পরিদর্শনকালে পূরণযোগ্য)।"
                  : "Self-report your current physical metrics or leave for verification at the blood bank."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                  {language === "bn" ? "ওজন (কেজি) * [কমপক্ষে ৪৫ কেজি]" : "Weight (kg) * [Min 45 kg]"}
                </label>
                <input
                  type="number"
                  min={40}
                  max={160}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-semibold outline-none focus:border-red-500"
                />
                {weightKg < 45 && (
                  <span className="text-[10px] text-amber-600 font-bold block mt-1">
                    {language === "bn" ? "সতর্কতা: নিরাপদ রক্তদানে ওজন ন্যূনতম ৪৫ কেজি হওয়া প্রয়োজন।" : "Warning: Minimum 45kg required for safe donation."}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                  {language === "bn" ? "রক্তচাপ (Blood Pressure)" : "Blood Pressure (BP)"}
                </label>
                <input
                  type="text"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  placeholder="120/80"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-medium outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                  {language === "bn" ? "নাড়ির গতি (Pulse bpm)" : "Pulse Rate (bpm)"}
                </label>
                <input
                  type="number"
                  min={50}
                  max={120}
                  value={pulseBpm}
                  onChange={(e) => setPulseBpm(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-medium outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                  {language === "bn" ? "হিমোগ্লোবিন লেভেল (gm/dL)" : "Hemoglobin Level (gm/dL)"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={8}
                  max={18}
                  value={hemoglobinLevel}
                  onChange={(e) => setHemoglobinLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-medium outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={temperatureNormal}
                  onChange={(e) => setTemperatureNormal(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                />
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {language === "bn" ? "শরীরের তাপমাত্রা স্বাভাবিক রয়েছে (৯৮.৪° ফারেনহাইটের নিচে)" : "Body temperature is normal (below 98.4°F, no fever)"}
                </span>
              </label>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 5: সম্মতিপত্র ও ডিজিটাল ঘোষণা (Consent & Declaration) */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <FileText size={15} className="text-red-600" />
                <span>{language === "bn" ? "৫. দাতার সম্মতিপত্র ও অঙ্গীকার (Consent & Legal Declaration)" : "5. Consent & Legal Declaration"}</span>
              </h2>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-800/60 text-xs text-zinc-700 dark:text-zinc-300 space-y-3 leading-relaxed">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={voluntaryAgreement}
                  onChange={(e) => setVoluntaryAgreement(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500"
                />
                <span>
                  {language === "bn"
                    ? "আমি স্বেচ্ছায়, সজ্ঞানে এবং কোনো প্রকার আর্থিক বা বৈষয়িক পারিশ্রমিক ছাড়া মুমূর্ষু রোগীর জীবন রক্ষার্থে রক্তদানে সম্মত হচ্ছি।"
                    : "I agree to donate blood voluntarily and without any financial or material compensation to save a critically ill patient."}
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={truthfulDeclaration}
                  onChange={(e) => setTruthfulDeclaration(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500"
                />
                <span>
                  {language === "bn"
                    ? "আমি ঘোষণা করছি যে এই ফর্মে আমার দেওয়া সমস্ত তথ্য সম্পূর্ণ সত্য ও সঠিক। কোনো তথ্য গোপন করে রক্তগ্রহীতার ক্ষতি করব না।"
                    : "I declare that all information provided in this form is true and accurate to the best of my knowledge."}
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={emergencyContactConsent}
                  onChange={(e) => setEmergencyContactConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500"
                />
                <span>
                  {language === "bn"
                    ? "জরুরি প্রয়োজনে হাসপাতাল বা রোগীর স্বজনদের সাথে সমন্বয়ের উদ্দেশ্যে ব্লাড অ্যান্ড লাইফ (BLOOD&LIFE) নেটওয়ার্ককে আমার সাথে যোগাযোগের অনুমতি দিচ্ছি।"
                    : "I authorize the BLOOD&LIFE emergency network to contact me for verified hospital requirements."}
                </span>
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                {language === "bn" ? "দাতার ডিজিটাল স্বাক্ষর (আপনার পূর্ণ নাম টাইপ করুন) *" : "Digital Signature (Type Full Legal Name) *"}
              </label>
              <input
                type="text"
                required
                value={digitalSignature}
                onChange={(e) => setDigitalSignature(e.target.value)}
                placeholder="e.g. Tanvir Ahmed Chowdhury"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-semibold outline-none focus:border-red-500"
              />
              <span className="text-[11px] text-zinc-400 block mt-1">
                {language === "bn"
                  ? `তারিখ: ${new Date().toLocaleDateString("bn-BD")} | ডিজিটাল আইপি টাইমস্ট্যাম্প রেকর্ড করা হবে`
                  : `Signed Date: ${new Date().toLocaleDateString()} | Timestamped securely`}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="py-2.5 px-4 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>{language === "bn" ? "পূর্ববর্তী ধাপ" : "Back"}</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="py-2.5 px-5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-xs transition-all active:scale-95"
            >
              <span>{language === "bn" ? "পরবর্তী ধাপ" : "Next Step"}</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span>{language === "bn" ? "নিবন্ধন সম্পন্ন হচ্ছে..." : "Registering..."}</span>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>{language === "bn" ? "নিবন্ধন সম্পন্ন করুন (Submit Form)" : "Complete Registration"}</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}