"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n/context";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Phone,
  Building2,
  MapPin,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export function VolunteerCockpit() {
  const { language } = useLanguage();

  const emergencyHospitals = [
    { name: "Dhaka Medical College Emergency", hotline: "01711-000001", district: "Dhaka" },
    { name: "Chittagong Medical Trauma Desk", hotline: "01819-000002", district: "Chittagong" },
    { name: "Rajshahi Medical Blood Bank", hotline: "01712-000003", district: "Rajshahi" },
    { name: "Sylhet Osmani Medical Emergency", hotline: "01713-000004", district: "Sylhet" },
  ];

  return (
    <div className="space-y-6">
      {/* Triage Banner */}
      <div className="card-clinical p-6 bg-gradient-to-r from-emerald-950/20 via-[var(--bg-surface)] to-[var(--bg-main)] border-2 border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            <ShieldCheck size={12} />
            <span>{language === "bn" ? "ভলান্টিয়ার ট্রায়াজ প্ল্যাটফর্ম" : "VOLUNTEER COMMAND"}</span>
          </div>
          <h2 className="text-xl font-black text-[var(--text-primary)]">
            {language === "bn" ? "ডাক্তার প্রেসক্রিপশন ভেরিফিকেশন স্টেশন" : "Prescription Triage & Verification Station"}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 max-w-xl">
            {language === "bn"
              ? "হাসপাতালের বেড টিকিট জুম করে পরীক্ষা করুন এবং ১-ক্লিকে প্রকৃত জরুরী কেসগুলোকে ভেরিফাইড ঘোষণা করুন।"
              : "Inspect uploaded medical requisition slips with pan/zoom and verify genuine hospital emergency cases."}
          </p>
        </div>

        <Link
          href="/dashboard/volunteer"
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-2 shrink-0 transition-colors shadow-lg shadow-emerald-900/20"
        >
          <span>{language === "bn" ? "ট্রায়াজ স্টেশনে যান" : "Open Triage Station"}</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Emergency Hospital Coordinator Sheet */}
      <div className="card-clinical p-6 border border-[var(--border-subtle)] space-y-4">
        <h3 className="text-sm font-black text-[var(--text-primary)]">
          {language === "bn" ? "হাসপাতাল জরুরী ব্লাড ব্যাংক হটলাইন ডিরেক্টরি" : "Hospital Blood Bank Emergency Directory"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {emergencyHospitals.map((hosp, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex items-center justify-between"
            >
              <div>
                <h4 className="text-xs font-bold text-[var(--text-primary)]">{hosp.name}</h4>
                <p className="text-[11px] text-[var(--text-muted)]">{hosp.district}</p>
              </div>
              <a
                href={`tel:${hosp.hotline}`}
                className="px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
              >
                <Phone size={12} />
                <span>{hosp.hotline}</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
