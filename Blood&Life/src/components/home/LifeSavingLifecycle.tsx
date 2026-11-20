"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n/context";
import { Radio, ShieldCheck, HeartHandshake, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

export function LifeSavingLifecycle() {
  const { language } = useLanguage();

  const steps = [
    {
      num: "01",
      icon: Radio,
      titleEn: "Instant Emergency Broadcast",
      titleBn: "তাৎক্ষণিক জরুরী ব্রডকাস্ট",
      descEn: "Hospital patient or attendant posts an emergency blood request with hospital location and prescription verification.",
      descBn: "রোগী বা স্বজন মাত্র ৬০ সেকেন্ডে হাসপাতালের ঠিকানা ও প্রেসক্রিপশন দিয়ে জরুরী আবেদন সাবমিট করেন।",
      highlightEn: "Sub-minute dispatch",
      highlightBn: "৬০ সেকেন্ডে সম্প্রচার",
    },
    {
      num: "02",
      icon: ShieldCheck,
      titleEn: "Volunteer Triage & Geo-Match",
      titleBn: "ভলান্টিয়ার যাচাই ও নিকটস্থ রক্তদাতা ম্যাচিং",
      descEn: "Our medical verification team validates the bed ticket while our algorithm alerts available donors within a 5-10km radius.",
      descBn: "ভলান্টিয়াররা প্রেসক্রিপশন যাচাই করেন এবং অ্যালগরিদম হাসপাতালের ৫-১০ কিমি ব্যাসার্ধের রক্তদাতাদের নোটিফিকেশন পাঠায়।",
      highlightEn: "Zero spam guarantee",
      highlightBn: "শতভাগ দালালমুক্ত ও নিরাপদ",
    },
    {
      num: "03",
      icon: HeartHandshake,
      titleEn: "Direct Transfusion & Cooldown",
      titleBn: "সরাসরি রক্তদান ও ৯০ দিনের বিরতি",
      descEn: "The voluntary donor arrives at the hospital, donates directly to the patient, and enters a protected 90-day biological cooldown.",
      descBn: "স্বেচ্ছাসেবী রক্তদাতা সরাসরি হাসপাতালে গিয়ে রক্তদান করেন এবং তাঁর অ্যাকাউন্টে স্বয়ংক্রিয় ৯০ দিনের বিশ্রাম চালু হয়।",
      highlightEn: "100% Free & Transparent",
      highlightBn: "১০০% বিনামূল্যে সেবা",
    },
  ];

  return (
    <section className="py-6 sm:py-8 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-500 block mb-1">
            {language === "bn" ? "জীবন রক্ষার ৩টি ধাপ" : "THE LIFESAVING PROTOCOL"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            {language === "bn" ? "কীভাবে কাজ করে ব্লাড অ্যান্ড লাইফ?" : "How BLOOD&LIFE Saves Lives in Minutes"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5">
            {language === "bn"
              ? "রোগী থেকে রক্তদাতা — দালালমুক্ত, নিরাপদ ও আধুনিক ডিজিটাল সংযোগ প্রক্রিয়া。"
              : "From hospital ICU to direct blood donor: a streamlined, transparent medical pipeline."}
          </p>
        </div>

        {/* 3 Step Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative bg-[var(--bg-main)] p-6 rounded-2xl border border-[var(--border-subtle)] hover:border-red-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-red-600/30">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">
                    {language === "bn" ? step.titleBn : step.titleEn}
                  </h3>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    {language === "bn" ? step.descBn : step.descEn}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center gap-1.5 text-[11px] font-bold text-emerald-500">
                  <CheckCircle2 size={13} />
                  <span>{language === "bn" ? step.highlightBn : step.highlightEn}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
