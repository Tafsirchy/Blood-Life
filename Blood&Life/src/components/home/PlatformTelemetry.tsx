"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n/context";
import {
  HeartPulse,
  Users,
  Clock,
  ShieldCheck,
  Activity,
  CheckCircle2,
} from "lucide-react";

export function PlatformTelemetry() {
  const { language } = useLanguage();

  const metrics = [
    {
      icon: HeartPulse,
      value: "42,850+",
      labelEn: "Verified Transfusions Completed",
      labelBn: "সফল রক্তদান ও জীবন রক্ষা",
      descEn: "100% voluntary & free",
      descBn: "সম্পূর্ণ বিনামূল্যে সরাসরি হাসপাতালে",
      badgeEn: "Hospital Verified",
      badgeBn: "হাসপাতাল ভেরিফাইড",
      accentBorder: "border-t-red-600",
      iconBg: "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200/60 dark:border-red-900/50",
    },
    {
      icon: Users,
      value: "38,400+",
      labelEn: "Active Registered Donors",
      labelBn: "নিবন্ধিত স্বেচ্ছাসেবী রক্তদাতা",
      descEn: "Across all 64 districts",
      descBn: "৮টি বিভাগ ও ৬৪টি জেলায় প্রস্তুত",
      badgeEn: "Ready to Dispatch",
      badgeBn: "সারাদেশে প্রস্তুত",
      accentBorder: "border-t-blue-600",
      iconBg: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-900/50",
    },
    {
      icon: Clock,
      value: "18 mins",
      labelEn: "Median Emergency Match Time",
      labelBn: "গড় জরুরী ম্যাচিং সময়",
      descEn: "Geo-targeted push routing",
      descBn: "নিকটবর্তী ডোনারদের দ্রুত নোটিফিকেশন",
      badgeEn: "Sub-20m Response",
      badgeBn: "২০ মিনিটের মধ্যে সাড়া",
      accentBorder: "border-t-amber-600",
      iconBg: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-900/50",
    },
    {
      icon: ShieldCheck,
      value: "100%",
      labelEn: "Volunteer Prescription Auditing",
      labelBn: "প্রেসক্রিপশন ও বেড-টিকিট যাচাই",
      descEn: "Strict zero-broker protocol",
      descBn: "দালালমুক্ত ও নিরাপদ সেবা নিশ্চয়তা",
      badgeEn: "100% Doctor Audited",
      badgeBn: "ডাক্তার কর্তৃক অনুমোদিত",
      accentBorder: "border-t-emerald-600",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/50",
    },
  ];

  return (
    <section className="py-8 sm:py-12 border-b border-[var(--border-subtle)] bg-[var(--bg-main)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[11px] font-bold uppercase tracking-wider mb-2.5">
            <Activity size={12} className="text-red-600 dark:text-red-400 animate-pulse" />
            <span>{language === "bn" ? "লাইভ প্ল্যাটফর্ম টেলিমেট্রি" : "REAL-TIME IMPACT TELEMETRY"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            {language === "bn" ? "স্বচ্ছতা ও জীবন বাঁচানোর বাস্তব চিত্র" : "Transparent National Life-Saving Metrics"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
            {language === "bn"
              ? "প্রতিটি সংখ্যা একটি অমূল্য মানবজীবন রক্ষা এবং স্বেচ্ছাসেবী রক্তদাতাদের নিঃস্বার্থ সহমর্মিতার বাস্তব প্রতীক।"
              : "Every single metric represents a human life preserved and selfless voluntary solidarity across Bangladesh."}
          </p>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className={`bg-white dark:bg-zinc-900/90 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden group border-t-4 ${m.accentBorder}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${m.iconBg}`}
                    >
                      <Icon size={20} />
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{language === "bn" ? m.badgeBn : m.badgeEn}</span>
                    </span>
                  </div>

                  <div className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mb-1">
                    {m.value}
                  </div>
                  <h3 className="text-xs sm:text-[13px] font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    {language === "bn" ? m.labelBn : m.labelEn}
                  </h3>
                </div>

                <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>{language === "bn" ? m.descBn : m.descEn}</span>
                  <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Public Audit Assurance Ribbon */}
        <div className="mt-6 rounded-xl bg-white dark:bg-zinc-900/70 border border-zinc-200/90 dark:border-zinc-800 p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-400 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {language === "bn"
                ? "সার্বজনীন স্বচ্ছতা অডিট: ডেটা প্রতি ঘণ্টায় হাসপাতাল সমন্বয় ডেস্ক ও ভেরিফিকেশন লগ থেকে আপডেট হয়।"
                : "Public Transparency Audit: Metrics updated in real-time from hospital verification desks and transfusion logs."}
            </span>
          </div>
          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 shrink-0">
            {language === "bn" ? "১০০% দালালমুক্ত মানবিক উদ্যোগ" : "100% Free Humanitarian Network"}
          </span>
        </div>
      </div>
    </section>
  );
}

