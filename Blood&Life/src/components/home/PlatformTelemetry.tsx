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
  Radio,
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
      descBn: "সরাসরি হাসপাতালে সম্পূর্ণ বিনামূল্যে",
      badgeEn: "Hospital Audited",
      badgeBn: "হাসপাতাল ভেরিফাইড",
      glowColor: "from-rose-500/20 to-red-500/5",
      accentTextColor: "text-rose-400",
      accentBorder: "border-rose-500/30",
    },
    {
      icon: Users,
      value: "38,400+",
      labelEn: "Active Registered Donors",
      labelBn: "নিবন্ধিত স্বেচ্ছাসেবী রক্তদাতা",
      descEn: "Across all 64 districts",
      descBn: "৮টি বিভাগ ও ৬৪টি জেলায় প্রস্তুত",
      badgeEn: "Live on Standby",
      badgeBn: "সারাদেশে প্রস্তুত",
      glowColor: "from-blue-500/20 to-cyan-500/5",
      accentTextColor: "text-cyan-400",
      accentBorder: "border-cyan-500/30",
    },
    {
      icon: Clock,
      value: "18 mins",
      labelEn: "Median Emergency Match Time",
      labelBn: "গড় জরুরী ম্যাচিং সময়",
      descEn: "Sub-20m rapid dispatch",
      descBn: "নিকটবর্তী ডোনারদের দ্রুত নোটিফিকেশন",
      badgeEn: "Fast Triage",
      badgeBn: "২০ মিনিটের মধ্যে সাড়া",
      glowColor: "from-amber-500/20 to-orange-500/5",
      accentTextColor: "text-amber-400",
      accentBorder: "border-amber-500/30",
    },
    {
      icon: ShieldCheck,
      value: "100%",
      labelEn: "Prescription Audited Safety",
      labelBn: "প্রেসক্রিপশন ও বেড-টিকিট যাচাই",
      descEn: "Zero-broker clinical protocol",
      descBn: "দালালমুক্ত ও শতভাগ নিরাপদ নিশ্চয়তা",
      badgeEn: "Doctor Verified",
      badgeBn: "ডাক্তার কর্তৃক অনুমোদিত",
      glowColor: "from-emerald-500/20 to-teal-500/5",
      accentTextColor: "text-emerald-400",
      accentBorder: "border-emerald-500/30",
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-zinc-950 text-white relative overflow-hidden border-y border-zinc-800">
      {/* Background Architectural Mesh & Subtle Radial Lighting */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-900/60 via-zinc-950 to-zinc-950" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-red-600/10 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-10 w-[500px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header: Command Center Beacon */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16 pb-8 border-b border-zinc-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[11px] font-black uppercase tracking-wider mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span>{language === "bn" ? "লাইভ জাতীয় টেলিমেট্রি" : "NATIONAL SYSTEM TELEMETRY"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {language === "bn" ? "স্বচ্ছতা ও জীবন বাঁচানোর বাস্তব চিত্র" : "Transparent National Life-Saving Metrics"}
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-md leading-relaxed">
            {language === "bn"
              ? "প্রতিটি সংখ্যা একটি অমূল্য মানবজীবন রক্ষা এবং বাংলাদেশের ৬৪ জেলার স্বেচ্ছাসেবী রক্তদাতাদের নিঃস্বার্থ সহমর্মিতার বাস্তব প্রতীক।"
              : "Every single metric represents a human life preserved and verified voluntary donor solidarity across Bangladesh."}
          </p>
        </div>

        {/* 4 Command-Center Live Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className={`relative rounded-3xl bg-zinc-900/70 backdrop-blur-md border ${m.accentBorder} p-6 sm:p-7 shadow-xl hover:shadow-2xl hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between group overflow-hidden`}
              >
                {/* Internal Glow Accent */}
                <div className={`pointer-events-none absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${m.glowColor} rounded-full blur-2xl group-hover:scale-150 transition-transform`} />

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 border border-zinc-800 bg-zinc-950/60 px-2.5 py-0.5 rounded-full">
                      {language === "bn" ? m.badgeBn : m.badgeEn}
                    </span>
                    <div className="p-2 rounded-xl bg-zinc-800/80 text-zinc-300 group-hover:scale-110 transition-transform">
                      <Icon size={18} className={m.accentTextColor} />
                    </div>
                  </div>

                  {/* High-Impact Stat Number */}
                  <div className="text-3xl sm:text-4xl font-black text-white tracking-tight tabular-nums mb-1">
                    {m.value}
                  </div>

                  <h3 className="text-sm font-bold text-zinc-200 mb-1">
                    {language === "bn" ? m.labelBn : m.labelEn}
                  </h3>
                </div>

                <div className="pt-4 border-t border-zinc-800/60 text-xs text-zinc-400 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className={m.accentTextColor} />
                  <span>{language === "bn" ? m.descBn : m.descEn}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
