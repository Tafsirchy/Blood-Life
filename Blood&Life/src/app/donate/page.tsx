"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { EmergencyFooter } from "@/components/home/EmergencyFooter";
import { BloodDonorRegistrationForm } from "@/components/donor/BloodDonorRegistrationForm";
import { SosBroadcastModal } from "@/components/requests/SosBroadcastModal";
import { useLanguage } from "@/lib/i18n/context";
import { Heart, ShieldCheck, CheckCircle2, Users } from "lucide-react";

export default function DonateBloodPage() {
  const { language } = useLanguage();
  const [isSosOpen, setIsSosOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
      {/* Navbar with SOS modal trigger */}
      <Navbar onOpenSos={() => setIsSosOpen(true)} />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header Banner */}
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/50 border border-red-200/80 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
              <Heart size={13} className="text-red-600 fill-red-600/20" />
              <span>{language === "bn" ? "রক্তদাতা হিসেবে আত্মপ্রকাশ" : "VOLUNTARY BLOOD DONOR ENROLLMENT"}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
              {language === "bn" ? "একটি সিদ্ধান্ত, চারটি জীবন রক্ষা" : "One Decision. Up to Four Lives Saved."}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
              {language === "bn"
                ? "কোয়ান্টাম, সন্ধানী ও রেড ক্রিসেন্ট ব্লাড ব্যাংক নির্দেশিকা অনুযায়ী আপনার স্বাস্থ্যগত তথ্য প্রদান করুন। নিরাপদ রক্তদান নিশ্চিত করতে প্রতি ধাপে সহায়তা করা হবে।"
                : "Complete the standardized national clinical questionnaire. Your private data is protected under our 3-reveal/hr privacy shield."}
            </p>

            {/* Trust metrics bar */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>{language === "bn" ? "১০০% নিরাপদ ও এনক্রিপ্টেড" : "100% Encrypted Records"}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-red-600" />
                <span>{language === "bn" ? "স্বয়ংক্রিয় ৯০ দিনের কুলডাউন" : "Automated 90-Day Cooldown"}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-amber-600" />
                <span>{language === "bn" ? "৬৪ জেলায় জরুরি নেটওয়ার্ক" : "64-District Lifeline Network"}</span>
              </span>
            </div>
          </div>

          {/* Official 5-Step Blood Donor Form */}
          <BloodDonorRegistrationForm />
        </div>
      </main>

      <EmergencyFooter />

      {/* SOS Modal if triggered from Navbar */}
      <SosBroadcastModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
    </div>
  );
}