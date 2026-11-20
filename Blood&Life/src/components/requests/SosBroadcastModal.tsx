"use client";

import React, { useState } from "react";
import { BloodGroup, UrgencyLevel } from "@/types";
import { useLanguage } from "@/lib/i18n/context";
import { ShieldAlert, X, AlertTriangle, ArrowRight, CheckCircle2, Droplet, Sparkles } from "lucide-react";

interface SosBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SosBroadcastModal({ isOpen, onClose, onSuccess }: SosBroadcastModalProps) {
  const { language } = useLanguage();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [recipientName, setRecipientName] = useState("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("O+");
  const [bloodComponent, setBloodComponent] = useState<"whole_blood" | "prbc" | "platelets" | "plasma">("whole_blood");
  const [unitsNeeded, setUnitsNeeded] = useState<number>(1);
  const [urgency, setUrgency] = useState<UrgencyLevel>("urgent");
  const [medicalReason, setMedicalReason] = useState("Postpartum Hemorrhage / C-Section");
  const [customMedicalReason, setCustomMedicalReason] = useState("");
  const [hospital, setHospital] = useState("");
  const [division, setDivision] = useState("Dhaka");
  const [district, setDistrict] = useState("Dhaka");
  const [upazila, setUpazila] = useState("Dhanmondi");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [requesterPhone, setRequesterPhone] = useState("");
  const [message, setMessage] = useState("");
  const [prescriptionUrl, setPrescriptionUrl] = useState("");

  if (!isOpen) return null;

  const bloodGroups: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Clinical Categories aligned with WHO, NHS, and Bangladesh Blood Banking Standards
  const clinicalCategories = [
    {
      groupEn: "1. Maternity & Childbirth (প্রসবকালীন জটিলতা)",
      groupBn: "১. গর্ভাবস্থা ও প্রসবকালীন জটিলতা",
      items: [
        {
          value: "Postpartum Hemorrhage / C-Section",
          labelEn: "Postpartum Hemorrhage / Emergency C-Section",
          labelBn: "প্রসবকালীন অতিরিক্ত রক্তক্ষরণ / জরুরি সিজারিয়ান",
          suggestedComponent: "whole_blood",
        },
      ],
    },
    {
      groupEn: "2. Trauma & Major Surgery (দুর্ঘটনা ও অপারেশন)",
      groupBn: "২. দুর্ঘটনা ও বড় অপারেশন",
      items: [
        {
          value: "Road Accident / Severe Trauma",
          labelEn: "Road Accident / Severe Trauma Recovery",
          labelBn: "সড়ক দুর্ঘটনা বা মারাত্মক রক্তক্ষরণ / ট্রমা",
          suggestedComponent: "whole_blood",
        },
        {
          value: "Major Surgery / Heart OT / Transplant",
          labelEn: "Major Surgery / Open Heart / Organ Transplant",
          labelBn: "বড় অপারেশন / হার্ট সার্জারি / অঙ্গ প্রতিস্থাপন",
          suggestedComponent: "prbc",
        },
        {
          value: "Severe Burns (Plasma Loss)",
          labelEn: "Severe Burns (Critical Plasma Loss)",
          labelBn: "মারাত্মক অগ্নিদগ্ধ রোগী (প্লাজমা সংকট)",
          suggestedComponent: "plasma",
        },
      ],
    },
    {
      groupEn: "3. Blood Disorders (রক্তের জন্মগত ও জটিল রোগ)",
      groupBn: "৩. রক্তের জন্মগত ও জটিল রোগ",
      items: [
        {
          value: "Thalassemia Transfusion",
          labelEn: "Thalassemia (Routine Monthly Transfusion)",
          labelBn: "থ্যালাসেমিয়া (মাসিক নিয়মিত রক্ত পরিসঞ্চালন)",
          suggestedComponent: "prbc",
        },
        {
          value: "Severe / Aplastic Anemia",
          labelEn: "Severe / Aplastic Anemia (Critical Hb Drop)",
          labelBn: "তীব্র রক্তশূন্যতা / অ্যাপ্লাস্টিক অ্যানিমিয়া",
          suggestedComponent: "prbc",
        },
        {
          value: "Hemophilia (Clotting Deficit)",
          labelEn: "Hemophilia (Plasma / Clotting Factor Deficit)",
          labelBn: "হিমোফিলিয়া (প্লাজমা বা ক্লটিং ফ্যাক্টর ঘাটতি)",
          suggestedComponent: "plasma",
        },
      ],
    },
    {
      groupEn: "4. Cancer & Chronic Organ Illness (ক্যান্সার ও জটিল রোগ)",
      groupBn: "৪. ক্যান্সার ও জটিল রোগ",
      items: [
        {
          value: "Blood Cancer / Leukemia / Lymphoma",
          labelEn: "Blood Cancer (Leukemia, Lymphoma, Myeloma)",
          labelBn: "ব্লাড ক্যান্সার (লিউকেমিয়া, লিম্ফোমা, মায়োলোমা)",
          suggestedComponent: "platelets",
        },
        {
          value: "Chemo / Radiotherapy Recovery",
          labelEn: "Chemotherapy & Radiotherapy Recovery",
          labelBn: "কেমোথেরাপি ও রেডিওথেরাপি পার্শ্বপ্রতিক্রিয়া",
          suggestedComponent: "platelets",
        },
        {
          value: "Kidney Dialysis / Liver Cirrhosis",
          labelEn: "Chronic Kidney Dialysis / Liver Cirrhosis",
          labelBn: "কিডনি ফেইলিউর ডায়ালাইসিস বা লিভার সিরোসিস",
          suggestedComponent: "prbc",
        },
      ],
    },
    {
      groupEn: "5. Infection & Dengue (সংক্রমণ ও ডেঙ্গু জ্বর)",
      groupBn: "৫. সংক্রমণ ও ডেঙ্গু জ্বর",
      items: [
        {
          value: "Dengue Hemorrhagic Fever / Platelets",
          labelEn: "Dengue Hemorrhagic Fever (Platelet Deficit)",
          labelBn: "ডেঙ্গু হেমোরেজিক জ্বর (প্লাটিলেট মারাত্মক সংকট)",
          suggestedComponent: "platelets",
        },
      ],
    },
    {
      groupEn: "6. Other Medical Emergency (অন্যান্য জরুরি অবস্থা)",
      groupBn: "৬. অন্যান্য জরুরি অবস্থা",
      items: [
        {
          value: "Other Medical Emergency",
          labelEn: "Other Medical Condition (Specify Below)",
          labelBn: "অন্যান্য জরুরি অবস্থা (নিচে বিবরণ লিখুন)",
          suggestedComponent: "whole_blood",
        },
      ],
    },
  ];

  const handleConditionSelect = (val: string) => {
    setMedicalReason(val);
    // Auto-suggest matching blood component for medical condition
    for (const cat of clinicalCategories) {
      const match = cat.items.find((i) => i.value === val);
      if (match && match.suggestedComponent) {
        setBloodComponent(match.suggestedComponent as any);
        break;
      }
    }
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!recipientName || !hospital || !scheduledDate || !scheduledTime || !requesterPhone) {
        setError(language === "bn" ? "অনুগ্রহ করে সব তথ্য পূরণ করুন।" : "Please fill in all clinical required fields.");
        return;
      }
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    const resolvedReason = medicalReason === "Other Medical Emergency" && customMedicalReason.trim()
      ? customMedicalReason.trim()
      : medicalReason;

    try {
      const res = await fetch("/api/requests/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName,
          bloodGroup,
          bloodComponent,
          unitsNeeded: Number(unitsNeeded),
          urgency,
          medicalReason: resolvedReason,
          hospital,
          division,
          district,
          upazila,
          scheduledDate,
          scheduledTime,
          requesterPhone,
          message: message ? `${resolvedReason} | ${message}` : resolvedReason,
          prescriptionUrl: prescriptionUrl || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit emergency broadcast");
      }

      setStep(3);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Reduced border radius to rounded-2xl for clean clinical sharpness */}
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden p-5 sm:p-6 transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-200/80 dark:border-zinc-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200/70 dark:border-red-900/50 flex items-center justify-center shadow-2xs">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                {language === "bn" ? "জরুরি রক্তের আবেদন (SOS)" : "Emergency SOS Broadcast"}
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                {step === 1 && (language === "bn" ? "ধাপ ১: রোগীর তথ্য ও সমস্যার ধরন" : "Step 1: Patient & Medical Details")}
                {step === 2 && (language === "bn" ? "ধাপ ২: প্রেসক্রিপশন ও বার্তা" : "Step 2: Prescription & Context")}
                {step === 3 && (language === "bn" ? "ধাপ ৩: সফল সম্প্রচার" : "Step 3: Broadcast Active")}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close modal"
          >
            <X size={17} />
          </button>
        </div>

        {error && (
          <div className="mb-3.5 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle size={14} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Clinical Details & Categorized Medical Reason */}
        {step === 1 && (
          <div className="space-y-3.5">
            {/* Row 1: Patient Name & Blood Group */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                  {language === "bn" ? "রোগীর নাম *" : "Patient Name *"}
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Rahima Begum"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-semibold outline-none focus:border-red-500 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                  {language === "bn" ? "রক্তের গ্রুপ *" : "Blood Group *"}
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 outline-none focus:border-red-500 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
                >
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Categorized Medical Reason (Blood Disorders, Cancer, Surgery, Trauma, Maternity) */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1 flex items-center justify-between">
                <span>{language === "bn" ? "রোগীর সমস্যা / রক্তদানের কারণ *" : "Patient Medical Issue / Reason *"}</span>
                <span className="text-[10px] text-red-600 font-semibold normal-case">
                  {language === "bn" ? "চিকিৎসাবিজ্ঞানভিত্তিক শ্রেণিবিভাগ" : "WHO / Clinical Categories"}
                </span>
              </label>
              <select
                value={medicalReason}
                onChange={(e) => handleConditionSelect(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-red-500 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
              >
                {clinicalCategories.map((cat, idx) => (
                  <optgroup key={idx} label={language === "bn" ? cat.groupBn : cat.groupEn}>
                    {cat.items.map((item) => (
                      <option key={item.value} value={item.value}>
                        {language === "bn" ? item.labelBn : item.labelEn}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              {/* Custom Input if "Other Medical Emergency" is selected */}
              {medicalReason === "Other Medical Emergency" && (
                <input
                  type="text"
                  value={customMedicalReason}
                  onChange={(e) => setCustomMedicalReason(e.target.value)}
                  placeholder={language === "bn" ? "নির্দিষ্ট রোগের নাম বা সমস্যা লিখুন" : "Describe specific condition"}
                  className="w-full mt-2 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/20 text-xs font-medium outline-none focus:border-red-500"
                />
              )}
            </div>

            {/* Row 3: Blood Component & Units Needed */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                  {language === "bn" ? "রক্তের উপাদান *" : "Blood Component *"}
                </label>
                <select
                  value={bloodComponent}
                  onChange={(e) => setBloodComponent(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-red-500"
                >
                  <option value="whole_blood">Whole Blood (সম্পূর্ণ রক্ত)</option>
                  <option value="prbc">PRBC (লোহিত রক্তকণিকা)</option>
                  <option value="platelets">Platelets (প্লাটিলেট)</option>
                  <option value="plasma">Plasma / FFP (প্লাজমা)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                  {language === "bn" ? "ব্যাগ সংখ্যা ও জরুরি মাত্রা *" : "Units & Urgency *"}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={unitsNeeded}
                    onChange={(e) => setUnitsNeeded(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-semibold outline-none focus:border-red-500 text-center"
                    placeholder="Bags"
                  />
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                    className="w-full px-2 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-[11px] font-bold outline-none focus:border-red-500"
                  >
                    <option value="critical">2h Left</option>
                    <option value="urgent">6h Left</option>
                    <option value="standard">24h</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 4: Hospital Name & Location */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                {language === "bn" ? "হাসপাতালের নাম ও ঠিকানা *" : "Hospital Name & Location *"}
              </label>
              <input
                type="text"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                placeholder="e.g. Dhaka Medical College Hospital, Ward 5"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-semibold outline-none focus:border-red-500 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
              />
            </div>

            {/* Row 5: Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                  {language === "bn" ? "রক্তদানের তারিখ *" : "Date *"}
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-semibold outline-none focus:border-red-500 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                  {language === "bn" ? "সময় *" : "Time *"}
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-semibold outline-none focus:border-red-500 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
                />
              </div>
            </div>

            {/* Row 6: Emergency Contact Phone */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                {language === "bn" ? "জরুরি যোগাযোগের নম্বর *" : "Emergency Contact Phone *"}
              </label>
              <input
                type="tel"
                value={requesterPhone}
                onChange={(e) => setRequesterPhone(e.target.value)}
                placeholder="01712345678"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-semibold outline-none focus:border-red-500 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
              />
            </div>

            {/* Next Button with reduced border-radius */}
            <button
              type="button"
              onClick={handleNext}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <span>{language === "bn" ? "পরবর্তী ধাপ (প্রেসক্রিপশন ও যাচাই)" : "Next Step (Verification Slip)"}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Step 2: Verification Slip */}
        {step === 2 && (
          <div className="space-y-3.5">
            <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 text-xs text-zinc-600 dark:text-zinc-300 space-y-1">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                {language === "bn" ? "দ্রুত রক্তদাতা পেতে প্রেসক্রিপশন যুক্ত করুন:" : "Add Doctor Requisition to accelerate matches:"}
              </span>
              <p className="text-[11px] leading-relaxed">
                {language === "bn"
                  ? "হাসপাতালের বেড টিকিট বা রক্তের চাহিদাপত্র যুক্ত করলে আমাদের ভলান্টিয়ার টিম দ্রুত যাচাই করে কেসটিকে 'ভেরিফাইড' ব্যাজ দেবে।"
                  : "Verified requests receive 4x faster donor commitments across the national network."}
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                {language === "bn" ? "প্রেসক্রিপশন / বেড টিকিট ছবি লিংক" : "Prescription / Bed Ticket URL"}
              </label>
              <input
                type="url"
                value={prescriptionUrl}
                onChange={(e) => setPrescriptionUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/... or image link"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-semibold outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                {language === "bn" ? "বিশেষ বার্তা (ঐচ্ছিক)" : "Additional Notes (Optional)"}
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Delivery surgery tomorrow morning, please come fasting."
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-xs sm:text-sm font-semibold outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-2/3 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs disabled:opacity-50 transition-all"
              >
                {loading ? "Broadcasting..." : "Broadcast Emergency SOS"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success Confirmation */}
        {step === 3 && (
          <div className="py-5 text-center space-y-3.5">
            <div className="w-14 h-14 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 size={30} />
            </div>

            <div>
              <h4 className="text-lg font-black text-zinc-900 dark:text-zinc-50">
                {language === "bn" ? "আবেদন সফলভাবে প্রচারিত হয়েছে!" : "Emergency SOS Broadcast Active!"}
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                {language === "bn"
                  ? `${hospital} এলাকায় থাকা ${bloodGroup} রক্তদাতাদের কাছে পুশ অ্যালার্ট পাঠানো হচ্ছে।`
                  : `Alerts dispatched to matching ${bloodGroup} donors around ${hospital}.`}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="py-2 px-5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}