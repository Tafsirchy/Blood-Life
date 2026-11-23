"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { Building2, ShieldCheck, MapPin, Bed, ArrowRight, Activity, Stethoscope } from "lucide-react";

export function HospitalNetworkGrid() {
  const { language } = useLanguage();

  const hospitals = [
    {
      nameEn: "Dhaka Medical College Hospital",
      nameBn: "ঢাকা মেডিকেল কলেজ হাসপাতাল (DMCH)",
      locationEn: "Dhaka",
      locationBn: "ঢাকা",
      beds: "2,600+ Beds",
      badgeEn: "National Referral Center",
      badgeBn: "জাতীয় রেফারেল কেন্দ্র",
      specialtyEn: "Trauma & Emergency ICU",
      specialtyBn: "ট্রমা ও ইমার্জেন্সি আইসিইউ",
    },
    {
      nameEn: "BSMMU (PG Hospital)",
      nameBn: "বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয়",
      locationEn: "Shahbagh, Dhaka",
      locationBn: "শাহবাগ, ঢাকা",
      beds: "1,900+ Beds",
      badgeEn: "Specialized Transfusion Center",
      badgeBn: "বিশেষায়িত ট্রান্সফিউশন ইউনিট",
      specialtyEn: "Hematology & Dialysis",
      specialtyBn: "হেমাটোলজি ও ডায়ালাইসিস",
    },
    {
      nameEn: "Chittagong Medical College Hospital",
      nameBn: "চট্টগ্রাম মেডিকেল কলেজ হাসপাতাল (CMCH)",
      locationEn: "Chittagong",
      locationBn: "চট্টগ্রাম",
      beds: "2,200+ Beds",
      badgeEn: "Division Trauma Center",
      badgeBn: "বিভাগীয় প্রধান ট্রমা সেন্টার",
      specialtyEn: "Burn & Critical Care",
      specialtyBn: "বার্ন ও ক্রিটিক্যাল কেয়ার",
    },
    {
      nameEn: "Rajshahi Medical College Hospital",
      nameBn: "রাজশাহী মেডিকেল কলেজ হাসপাতাল",
      locationEn: "Rajshahi",
      locationBn: "রাজশাহী",
      beds: "1,200+ Beds",
      badgeEn: "Northern Healthcare Hub",
      badgeBn: "উত্তরাঞ্চলীয় প্রধান রেফারেল কেন্দ্র",
      specialtyEn: "Cardiology & Surgery",
      specialtyBn: "কার্ডিওলজি ও সার্জারি",
    },
    {
      nameEn: "Sylhet MAG Osmani Medical College",
      nameBn: "সিলেট এম এ জি ওসমানী মেডিকেল কলেজ",
      locationEn: "Sylhet",
      locationBn: "সিলেট",
      beds: "1,000+ Beds",
      badgeEn: "Eastern Trauma Center",
      badgeBn: "পূর্বাঞ্চলীয় রেফারেল হাব",
      specialtyEn: "Maternity & Pediatric ICU",
      specialtyBn: "মাতৃত্ব ও পেডিয়াট্রিক আইসিইউ",
    },
    {
      nameEn: "Sher-e-Bangla Medical College Hospital",
      nameBn: "শের-ই-বাংলা মেডিকেল কলেজ হাসপাতাল",
      locationEn: "Barishal",
      locationBn: "বরিশাল",
      beds: "1,000+ Beds",
      badgeEn: "Southern Healthcare Hub",
      badgeBn: "দক্ষিণাঞ্চলীয় প্রধান হাসপাতাল",
      specialtyEn: "General & Emergency Surgery",
      specialtyBn: "জেনারেল ও ইমার্জেন্সি সার্জারি",
    },
  ];

  return (
    <section className="py-8 sm:py-12 border-b border-[var(--border-subtle)] bg-[var(--bg-main)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[11px] font-bold uppercase tracking-wider mb-2.5">
            <Building2 size={12} className="text-blue-600 dark:text-blue-400" />
            <span>{language === "bn" ? "হাসপাতাল ও ব্লাড ব্যাংক নেটওয়ার্ক" : "INSTITUTIONAL PARTNERS"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            {language === "bn"
              ? "বাংলাদেশের শীর্ষ হাসপাতাল ও জরুরি ট্রমা সেন্টার নেটওয়ার্ক"
              : "Institutional Hospital & Blood Bank Network"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
            {language === "bn"
              ? "জরুরী সার্জারি ও আইসিইউ ট্রান্সফিউশনে সরাসরি স্বেচ্ছাসেবী রক্তদাতাদের দ্রুত পৌঁছানোর সমন্বিত ব্যবস্থা।"
              : "Coordinated volunteer response across major medical colleges and emergency surgical theaters."}
          </p>

          <div className="mt-4 flex items-center justify-center">
            <Link
              href="/hospitals"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md hover:scale-105"
            >
              <Activity size={14} className="animate-pulse" />
              <span>
                {language === "bn"
                  ? "লাইভ হাসপাতাল রক্তের চাহিদা ও অপারেশন শিডিউল দেখুন"
                  : "View Live Hospital Demand & Surgery Schedules"}
              </span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* 6 Hospital Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {hospitals.map((hosp, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-zinc-900/90 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-5 shadow-xs hover:shadow-md hover:border-red-500/40 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Header row with Hospital Icon & Beds */}
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                    <Building2 size={18} />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                    <Bed size={12} className="text-zinc-400" />
                    <span>{hosp.beds}</span>
                  </span>
                </div>

                {/* Hospital Name & Location */}
                <h3 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-snug mb-1">
                  {language === "bn" ? hosp.nameBn : hosp.nameEn}
                </h3>
                <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 mb-2.5">
                  <MapPin size={12} className="text-zinc-400 shrink-0" />
                  <span>{language === "bn" ? hosp.locationBn : hosp.locationEn}</span>
                </div>

                {/* Specialty Pill */}
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 px-2 py-0.5 rounded-md border border-zinc-200/60 dark:border-zinc-700/60 mb-3">
                  <Stethoscope size={11} className="text-red-500 shrink-0" />
                  <span>{language === "bn" ? hosp.specialtyBn : hosp.specialtyEn}</span>
                </div>
              </div>

              {/* Bottom Metadata & Verified Badge */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck size={13} className="shrink-0" />
                  <span>{language === "bn" ? hosp.badgeBn : hosp.badgeEn}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{language === "bn" ? "২৪/৭ সক্রিয়" : "24/7 Active"}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Partnership / Verification CTA Bar */}
        <div className="mt-8 rounded-xl bg-white dark:bg-zinc-900/70 border border-zinc-200/90 dark:border-zinc-800 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-400 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Activity size={16} className="text-red-500 shrink-0 animate-pulse" />
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {language === "bn"
                ? "আপনার হাসপাতাল বা ব্লাড ব্যাংক কি তালিকায় নেই? আমাদের মেডিকেল কোঅর্ডিনেশন ডেস্কে যোগাযোগ করুন।"
                : "Is your medical institution or blood bank not listed? Connect with the BLOOD&LIFE dispatch network."}
            </span>
          </div>
          <Link
            href="/about"
            className="inline-flex items-center gap-1 font-bold text-red-600 dark:text-red-400 hover:text-red-700 hover:underline shrink-0 text-xs"
          >
            <span>{language === "bn" ? "হাসপাতাল পার্টনারশিপ গাইডলাইন" : "Hospital Partner Guidelines"}</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  );
}

