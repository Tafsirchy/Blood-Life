"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n/context";
import { Radio, ShieldCheck, HeartHandshake, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

export function LifeSavingLifecycle() {
  const { language } = useLanguage();

  const steps = [
    {
      num: "01",
      stepTag: language === "bn" ? "ধাপ ০১ • সম্প্রচার" : "STEP 01 • DISPATCH",
      icon: Radio,
      titleEn: "Instant Emergency Broadcast",
      titleBn: "তাৎক্ষণিক জরুরী ব্রডকাস্ট",
      descEn: "Hospital patient or attendant posts an emergency request with hospital ward location and prescription verification.",
      descBn: "রোগী বা স্বজন মাত্র ৬০ সেকেন্ডে হাসপাতালের ঠিকানা ও প্রেসক্রিপশন দিয়ে জরুরী রক্তের আবেদন সাবমিট করেন।",
      highlightEn: "Sub-minute dispatch",
      highlightBn: "৬০ সেকেন্ডে সম্প্রচার",
      badgeColor: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      accentGrad: "from-red-500 to-rose-600",
    },
    {
      num: "02",
      stepTag: language === "bn" ? "ধাপ ০২ • যাচাই ও ম্যাচিং" : "STEP 02 • TRIAGE",
      icon: ShieldCheck,
      titleEn: "Volunteer Triage & Geo-Match",
      titleBn: "ভলান্টিয়ার যাচাই ও নিকটস্থ রক্তদাতা ম্যাচিং",
      descEn: "Our medical verification team validates the bed ticket while our algorithm alerts available donors within a 5-10km radius.",
      descBn: "ভলান্টিয়াররা প্রেসক্রিপশন যাচাই করেন এবং অ্যালগরিদম হাসপাতালের ৫-১০ কিমি ব্যাসার্ধের রক্তদাতাদের নোটিফিকেশন পাঠায়।",
      highlightEn: "Zero spam guarantee",
      highlightBn: "শতভাগ দালালমুক্ত ও নিরাপদ",
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      accentGrad: "from-amber-500 to-orange-600",
    },
    {
      num: "03",
      stepTag: language === "bn" ? "ধাপ ০৩ • রক্তদান ও সুরক্ষা" : "STEP 03 • TRANSFUSION",
      icon: HeartHandshake,
      titleEn: "Direct Transfusion & Cooldown",
      titleBn: "সরাসরি রক্তদান ও ৯০ দিনের বিরতি",
      descEn: "The voluntary donor arrives at the hospital, donates directly to the patient, and enters a protected 90-day biological cooldown.",
      descBn: "স্বেচ্ছাসেবী রক্তদাতা সরাসরি হাসপাতালে গিয়ে রক্তদান করেন এবং তাঁর অ্যাকাউন্টে স্বয়ংক্রিয় ৯০ দিনের বিশ্রাম চালু হয়।",
      highlightEn: "100% Free & Transparent",
      highlightBn: "১০০% বিনামূল্যে সেবা",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      accentGrad: "from-emerald-500 to-teal-600",
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-zinc-50/80 via-white to-zinc-50/50 dark:from-zinc-950 dark:via-zinc-900/60 dark:to-zinc-950 border-b border-[var(--border-subtle)] relative overflow-hidden">
      {/* Subtle ambient background glow */}
      <div className="pointer-events-none absolute top-1/2 -left-32 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -right-32 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header with Fresh Visual Accent */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold uppercase tracking-wider mb-2.5 shadow-2xs">
            <Sparkles size={12} className="text-emerald-500" />
            <span>{language === "bn" ? "জীবন রক্ষার ৩টি বৈজ্ঞানিক ধাপ" : "THE LIFESAVING PROTOCOL"}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            {language === "bn" ? "কীভাবে কাজ করে ব্লাড অ্যান্ড লাইফ?" : "How BLOOD&LIFE Saves Lives in Minutes"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
            {language === "bn"
              ? "রোগী থেকে রক্তদাতা — দালালমুক্ত, নিরাপদ ও আধুনিক ডিজিটাল সংযোগ প্রক্রিয়া।"
              : "From hospital ICU to direct voluntary donor: a streamlined, transparent medical pipeline."}
          </p>
        </div>

        {/* Interactive Interconnected Roadmap */}
        <div className="relative">
          {/* Connecting Desktop Flow Line */}
          <div className="hidden md:block absolute top-14 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 opacity-30 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="group relative bg-white dark:bg-zinc-900/90 rounded-3xl p-6 sm:p-7 border border-zinc-200/90 dark:border-zinc-800 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Top Step Beacon & Node Icon */}
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${step.badgeColor}`}>
                        {step.stepTag}
                      </span>
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.accentGrad} text-white flex items-center justify-center shadow-md shadow-zinc-900/10 group-hover:scale-110 transition-transform`}>
                        <Icon size={22} />
                      </div>
                    </div>

                    <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {language === "bn" ? step.titleBn : step.titleEn}
                    </h3>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                      {language === "bn" ? step.descBn : step.descEn}
                    </p>
                  </div>

                  {/* Bottom Highlight Pill */}
                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 size={14} className="shrink-0" />
                      <span>{language === "bn" ? step.highlightBn : step.highlightEn}</span>
                    </div>
                    {idx < steps.length - 1 && (
                      <span className="hidden md:inline-flex text-zinc-400 dark:text-zinc-600 group-hover:translate-x-1 transition-transform">
                        <ArrowRight size={14} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
