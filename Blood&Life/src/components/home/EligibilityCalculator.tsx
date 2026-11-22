"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { Calculator, Calendar, Heart, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";

export function EligibilityCalculator() {
  const { language } = useLanguage();
  const [lastDonationDate, setLastDonationDate] = useState<string>("");
  const [weightKg, setWeightKg] = useState<number>(62);
  const [ageYears, setAgeYears] = useState<number>(24);
  const [hasTattooOrSurgery, setHasTattooOrSurgery] = useState<boolean>(false);

  // Calculation logic
  const calculateEligibility = () => {
    const minWeight = 48; // WHO / Red Crescent standard for Bangladesh
    const minAge = 18;
    const maxAge = 65;

    let eligible = true;
    const reasons: string[] = [];
    let nextEligibleDateString = "";

    if (ageYears < minAge || ageYears > maxAge) {
      eligible = false;
      reasons.push(
        language === "bn"
          ? `বয়স ১৮ থেকে ৬৫ বছরের মধ্যে হতে হবে (বর্তমান: ${ageYears})`
          : `Age must be between 18 and 65 (current: ${ageYears})`
      );
    }

    if (weightKg < minWeight) {
      eligible = false;
      reasons.push(
        language === "bn"
          ? `ওজন কমপক্ষে ৪৮ কেজি হতে হবে (বর্তমান: ${weightKg} কেজি)`
          : `Weight must be at least 48 kg (current: ${weightKg} kg)`
      );
    }

    if (hasTattooOrSurgery) {
      eligible = false;
      reasons.push(
        language === "bn"
          ? "গত ৬ মাসের মধ্যে ট্যাটু বা বড় কোনো সার্জারি থাকলে রক্তদান করা যাবে না"
          : "Tattoo, piercing, or major surgery within the last 6 months is a temporary deferral"
      );
    }

    if (lastDonationDate) {
      const last = new Date(lastDonationDate);
      const today = new Date();
      const diffTime = today.getTime() - last.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const cooldownDays = 90;

      if (diffDays < cooldownDays) {
        eligible = false;
        const daysRemaining = cooldownDays - diffDays;
        const nextDate = new Date(last);
        nextDate.setDate(nextDate.getDate() + cooldownDays);
        nextEligibleDateString = nextDate.toLocaleDateString(
          language === "bn" ? "bn-BD" : "en-US",
          { year: "numeric", month: "short", day: "numeric" }
        );
        reasons.push(
          language === "bn"
            ? `রক্তদানের মধ্যে ৯০ দিনের বিরতি আবশ্যক। আরও ${daysRemaining} দিন পর (${nextEligibleDateString}) রক্তদান করতে পারবেন।`
            : `A 90-day cooldown between donations is required. You can donate in ${daysRemaining} days (${nextEligibleDateString}).`
        );
      }
    }

    return { eligible, reasons, nextEligibleDateString };
  };

  const result = calculateEligibility();

  return (
    <section className="py-12 sm:py-16 border-b border-[var(--border-subtle)] bg-gradient-to-b from-white via-zinc-50/50 to-white dark:from-zinc-900/60 dark:via-zinc-950 dark:to-zinc-900/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Context & Guidelines */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold uppercase tracking-wider shadow-2xs">
              <ShieldCheck size={13} className="text-emerald-500" />
              <span>{language === "bn" ? "নিরাপদ রক্তদান গাইড" : "SAFETY & ELIGIBILITY"}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
              {language === "bn" ? "আপনি কি আজ রক্তদান করতে প্রস্তুত?" : "Are You Eligible to Donate Blood Today?"}
            </h2>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {language === "bn"
                ? "রক্তদাতার শারীরিক সুস্থতা আমাদের সর্বোচ্চ অগ্রাধিকার। রক্তদানের ৯০ দিনের বৈজ্ঞানিক বিরতি এবং মানসম্মত স্বাস্থ্য সূচক যাচাই করে নিন।"
                : "Donor health and patient safety are our top priorities. Check your biological readiness and 90-day safe cooldown instantly."}
            </p>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span>{language === "bn" ? "আন্তর্জাতিক রক্তদান মানদণ্ড:" : "Standard WHO Guidelines:"}</span>
              </div>
              <ul className="space-y-1.5 text-[var(--text-secondary)] pl-5 list-disc font-medium">
                <li>{language === "bn" ? "পুরুষ ও নারী উভয়ের ক্ষেত্রে ৯০ দিনের বিরতি" : "90-day interval between donations"}</li>
                <li>{language === "bn" ? "হিমোগ্লোবিন লেভেল ন্যূনতম ১২.৫ g/dL" : "Minimum hemoglobin 12.5 g/dL"}</li>
                <li>{language === "bn" ? "শরীরের ওজন ন্যূনতম ৪৮ কেজি" : "Minimum weight of 48 kg"}</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Interactive Calculator Box */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/90 dark:border-zinc-800 shadow-md space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Age Input */}
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    {language === "bn" ? "আপনার বয়স (বছর)" : "Your Age (Years)"}
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={80}
                    value={ageYears}
                    onChange={(e) => setAgeYears(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm font-bold focus:border-red-500 outline-none"
                  />
                </div>

                {/* Weight Input */}
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    {language === "bn" ? "শারীরিক ওজন (কেজি)" : "Body Weight (kg)"}
                  </label>
                  <input
                    type="number"
                    min={35}
                    max={150}
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm font-bold focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              {/* Last Donation Date */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  {language === "bn" ? "সর্বশেষ রক্তদানের তারিখ (যদি পূর্বে দিয়ে থাকেন)" : "Last Donation Date (if applicable)"}
                </label>
                <input
                  type="date"
                  value={lastDonationDate}
                  onChange={(e) => setLastDonationDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm font-bold focus:border-red-500 outline-none"
                />
              </div>

              {/* Tattoo / Surgery Toggle */}
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)]">
                <input
                  type="checkbox"
                  checked={hasTattooOrSurgery}
                  onChange={(e) => setHasTattooOrSurgery(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-gray-300"
                />
                <span className="text-xs text-[var(--text-secondary)] font-medium">
                  {language === "bn"
                    ? "গত ৬ মাসে কি কোনো ট্যাটু, পাইয়ার্সিং বা বড় ধরনের অপারেশন করিয়েছেন?"
                    : "Have you had a tattoo, piercing, or major surgical operation in the last 6 months?"}
                </span>
              </label>

              {/* Live Eligibility Result Display */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                  result.eligible
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                }`}
              >
                {result.eligible ? (
                  <CheckCircle2 size={20} className="shrink-0 text-emerald-500 mt-0.5" />
                ) : (
                  <AlertCircle size={20} className="shrink-0 text-amber-500 mt-0.5" />
                )}

                <div className="space-y-1">
                  <h4 className="text-sm font-black">
                    {result.eligible
                      ? language === "bn"
                        ? "অভিনন্দন! আপনি রক্তদানের জন্য সম্পূর্ণ উপযুক্ত।"
                        : "Ready to Donate! You meet all health criteria."
                      : language === "bn"
                      ? "সাময়িক বিরতি বা পর্যবেক্ষণ প্রয়োজন"
                      : "Temporary Deferral or Attention Needed"}
                  </h4>

                  {result.eligible ? (
                    <p className="text-xs font-medium">
                      {language === "bn"
                        ? "আপনার এক ব্যাগ রক্ত ৩ জন মুমূর্ষু রোগীর জীবন বাঁচাতে পারে। এখুনি রক্তদাতা হিসেবে যুক্ত হন।"
                        : "One unit of your blood can save up to three lives. Search for urgent cases or register as a hero."}
                    </p>
                  ) : (
                    <ul className="text-xs list-disc pl-4 space-y-1 font-medium">
                      {result.reasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
