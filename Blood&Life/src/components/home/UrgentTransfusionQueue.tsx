"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { Clock, MapPin, Building2, ArrowRight, HeartHandshake, ShieldCheck, Droplet } from "lucide-react";
import Link from "next/link";
import { useEmergencyCountdown } from "@/lib/hooks/useEmergencyCountdown";

interface UrgentCase {
  id: string;
  patientName: string;
  bloodGroup: string;
  units: number;
  pledgedUnits?: number;
  hospital: string;
  district: string;
  urgency: "CRITICAL" | "URGENT";
  hoursLeft: number;
  expiresAt: string;
  verified: boolean;
  purpose: string;
}

const SAMPLE_URGENT_CASES: UrgentCase[] = [
  {
    id: "case-101",
    patientName: "Tasneem Rahman",
    bloodGroup: "O-",
    units: 2,
    pledgedUnits: 0,
    hospital: "Dhaka Medical College Hospital (DMCH ICU-3)",
    district: "Dhaka",
    urgency: "CRITICAL",
    hoursLeft: 1.75, // 1h 45m -> Tier 2 Code Red
    expiresAt: new Date(Date.now() + 105 * 60 * 1000).toISOString(),
    verified: true,
    purpose: "Emergency Cesarean Surgery",
  },
  {
    id: "case-102",
    patientName: "Abdul Gafur",
    bloodGroup: "B+",
    units: 3,
    pledgedUnits: 1,
    hospital: "Chittagong Medical College Hospital",
    district: "Chittagong",
    urgency: "CRITICAL",
    hoursLeft: 0.45, // 27 mins -> Tier 1 ICU Golden Window
    expiresAt: new Date(Date.now() + 27 * 60 * 1000).toISOString(),
    verified: true,
    purpose: "Trauma Road Accident Recovery",
  },
  {
    id: "case-103",
    patientName: "Meghla Akter",
    bloodGroup: "AB-",
    units: 1,
    pledgedUnits: 0,
    hospital: "Sylhet MAG Osmani Medical College",
    district: "Sylhet",
    urgency: "URGENT",
    hoursLeft: 4.5, // 4h 30m -> Tier 3 Elevated
    expiresAt: new Date(Date.now() + 270 * 60 * 1000).toISOString(),
    verified: true,
    purpose: "Thalassemia Transfusion",
  },
  {
    id: "case-104",
    patientName: "Farhan Hossain",
    bloodGroup: "A+",
    units: 2,
    pledgedUnits: 1,
    hospital: "Rajshahi Medical College Hospital",
    district: "Rajshahi",
    urgency: "URGENT",
    hoursLeft: 7.5, // 7h 30m -> Tier 4 Standard
    expiresAt: new Date(Date.now() + 450 * 60 * 1000).toISOString(),
    verified: true,
    purpose: "Open Heart Bypass Surgery",
  },
];

function UrgentTransfusionCard({
  req,
  language,
}: {
  req: UrgentCase;
  language: string;
}) {
  const countdown = useEmergencyCountdown(req.expiresAt, req.urgency.toLowerCase() as "critical" | "urgent");

  return (
    <div
      className={`bg-white dark:bg-zinc-900 rounded-2xl border p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden ${
        countdown.isCodeRed
          ? "border-red-500/80 dark:border-red-500/60 ring-1 ring-red-500/20"
          : "border-zinc-200/90 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
      } ${countdown.isExpired ? "opacity-60 grayscale" : ""}`}
    >
      {/* Top Accent for Code Red */}
      {countdown.isCodeRed && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-rose-600 animate-pulse" />
      )}

      {/* Top Row: Blood Group, Multi-Unit & Urgency Countdown */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center font-black text-sm px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 shadow-2xs">
              {req.bloodGroup}
            </span>
            <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md">
              {req.units} {language === "bn" ? "ব্যাগ" : "Units"}
            </span>
          </div>

          {/* Dynamic Time Escalation Badge */}
          <span
            className={`text-[10px] sm:text-[11px] font-bold tracking-wide px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs border ${countdown.badgeClass}`}
          >
            <Clock size={11} className={countdown.isCodeRed ? "animate-pulse" : ""} />
            <span className="tabular-nums">
              {countdown.isExpired ? (language === "bn" ? "সময় শেষ" : "Expired") : countdown.formattedCountdown}
            </span>
          </span>
        </div>

        {/* Patient Name & Clinical Reason */}
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1 tracking-tight group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
          {req.patientName}
        </h3>
        <div className="mb-2.5">
          <span className="inline-block text-[11px] font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 px-2.5 py-0.5 rounded-md">
            {req.purpose}
          </span>
        </div>

        {/* Multi-bag fulfillment tracker */}
        <div className="mb-3 flex items-center justify-between text-[10.5px] font-semibold text-zinc-500 dark:text-zinc-400">
          <span>{language === "bn" ? "রক্ত পাওয়ার স্থিতি:" : "Pledge Status:"}</span>
          <span className={req.pledgedUnits && req.pledgedUnits > 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-amber-600 dark:text-amber-400 font-bold"}>
            {req.pledgedUnits || 0} / {req.units} {language === "bn" ? "ব্যাগ নিশ্চিত" : "Secured"}
          </span>
        </div>

        {/* Hospital, District & Verification Badge */}
        <div className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-start gap-2">
            <Building2 size={14} className="shrink-0 mt-0.5 text-zinc-400 dark:text-zinc-500" />
            <span className="line-clamp-1 font-medium text-zinc-800 dark:text-zinc-200">{req.hospital}</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-0.5">
            <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
              <MapPin size={13} className="shrink-0 text-zinc-400" />
              <span>{req.district}</span>
            </span>

            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-900/40">
              <ShieldCheck size={11} className="text-emerald-600 dark:text-emerald-400" />
              <span>{language === "bn" ? "যাচাইকৃত" : "Verified"}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Link
        href={`/requests/${req.id}`}
        className={`w-full mt-4 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs group-hover:shadow ${
          countdown.isExpired
            ? "bg-zinc-200 text-zinc-500 cursor-not-allowed pointer-events-none"
            : countdown.isCodeRed
            ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/25"
            : "bg-zinc-900 hover:bg-rose-600 dark:bg-zinc-100 dark:hover:bg-rose-600 text-white dark:text-zinc-900 dark:hover:text-white"
        }`}
      >
        <HeartHandshake size={15} className={countdown.isCodeRed ? "text-white" : "text-rose-400 dark:text-rose-600 group-hover:text-white transition-colors"} />
        <span>
          {countdown.isExpired
            ? (language === "bn" ? "সময়সীমা শেষ" : "Window Elapsed")
            : (language === "bn" ? "রক্তদানে সাড়া দিন" : "Pledge to Help")}
        </span>
        <ArrowRight size={13} className="opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
      </Link>
    </div>
  );
}

export function UrgentTransfusionQueue() {
  const { language } = useLanguage();
  const [cases] = useState<UrgentCase[]>(SAMPLE_URGENT_CASES);

  return (
    <section className="py-6 sm:py-8 border-b border-[var(--border-subtle)] bg-[var(--bg-main)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-[11px] font-bold uppercase tracking-wider mb-2 shadow-2xs">
              <Droplet size={13} className="text-rose-600 fill-rose-600/30" />
              <span>{language === "bn" ? "জরুরি রক্ত পরিসঞ্চালন কিউ" : "CRITICAL SURGERY QUEUE"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
              {language === "bn" ? "জরুরি রক্তের চলমান আবেদন" : "Urgent Transfusion Queue"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
              {language === "bn"
                ? "হাসপাতাল ও ডাক্তার প্রেসক্রিপশন দ্বারা যাচাইকৃত সরাসরি রক্তের চাহিদা। সময় কমার সাথে সাথে স্বয়ংক্রিয় জরুরি অ্যালার্ট তীব্রতর হয়।"
                : "Real-time doctor verified requests. Dynamic alert intensity escalates as surgery time approaches."}
            </p>
          </div>

          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 group shrink-0 transition-colors"
          >
            <span>{language === "bn" ? "সকল জরুরি আবেদন দেখুন" : "View All Emergency Requests"}</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Live Queue Cards with Dynamic Escalation Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {cases.map((req) => (
            <UrgentTransfusionCard key={req.id} req={req} language={language} />
          ))}
        </div>
      </div>
    </section>
  );
}
