"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n/context";
import { Shield, Sparkles, ArrowRight, Droplet } from "lucide-react";
import Link from "next/link";

export function RareBloodVault() {
  const { language } = useLanguage();

  const standardRareGroups = [
    { group: "O-", prevalence: "< 1.5%", roleEn: "Universal Red Cell Hero", roleBn: "সার্বজনীন লোহিত রক্তদাতা" },
    { group: "AB-", prevalence: "< 0.5%", roleEn: "Ultra-Rare Plasma Hero", roleBn: "বিরলতম প্লাজমা রক্তদাতা" },
    { group: "A-", prevalence: "< 1.0%", roleEn: "Critical Surgery Match", roleBn: "জরুরি সার্জারি রক্তদাতা" },
    { group: "B-", prevalence: "< 1.2%", roleEn: "High Demand Negative", roleBn: "উচ্চ চাহিদাসম্পন্ন বিরল গ্রুপ" },
  ];

  const goldenBlood = {
    group: "Bombay (hh)",
    prevalence: "0.0004%",
    roleEn: "National Golden Blood Reserve",
    roleBn: "স্বর্ণরক্ত ও জাতীয় বিশেষায়িত রিজার্ভ",
  };

  return (
    <section className="py-8 sm:py-12 border-b border-zinc-200/80 dark:border-zinc-800 bg-[var(--bg-surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Vault Container - Pristine, Crystal Clear, Zero Eye Strain */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 p-6 sm:p-10 shadow-xs">
          {/* Subtle Ambient Decorative Glows */}
          <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Info Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold uppercase tracking-wider shadow-2xs">
                <Sparkles size={13} className="text-rose-600 dark:text-rose-400" />
                <span>{language === "bn" ? "বিশেষায়িত রেয়ার ব্লাড সেল" : "SPECIALIZED RARE BLOOD VAULT"}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
                {language === "bn" ? "নেগেটিভ ও বোম্বে ব্লাড গ্রুপের জন্য বিশেষ রিজার্ভ" : "The Rare Blood Group Emergency Vault"}
              </h2>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
                {language === "bn"
                  ? "বাংলাদেশে নেগেটিভ ব্লাড গ্রুপের রক্তদাতার হার মাত্র ২-৩%। জরুরি মুহূর্তে রক্ত সংকট এড়াতে আমরা গঠন করেছি বিশেষায়িত রেয়ার ডোনার সেল। আপনি নেগেটিভ গ্রুপের রক্তদাতা হলে আজই তালিকায় নাম লেখান।"
                  : "Rh-negative blood groups account for less than 3% of Bangladesh's population. We maintain a verified rapid-dispatch vault to prevent tragic surgery delays."}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/auth/register"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all inline-flex items-center gap-2"
                >
                  <Shield size={15} />
                  <span>{language === "bn" ? "রেয়ার ডোনার ভল্টে যুক্ত হন" : "Join Rare Donor Vault"}</span>
                </Link>
                <Link
                  href="/search?bloodGroup=O-"
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-2"
                >
                  <span>{language === "bn" ? "রেয়ার ডোনার খুঁজুন" : "Search Rare Donors"}</span>
                  <ArrowRight size={14} className="text-zinc-500" />
                </Link>
              </div>
            </div>

            {/* Right Interactive Rare Blood Cards - Crisp, Elegant & Eye-Friendly */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-3.5">
              {standardRareGroups.map((item) => (
                <div
                  key={item.group}
                  className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 flex flex-col justify-between hover:bg-white dark:hover:bg-zinc-800 hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-xs transition-all text-center group"
                >
                  <div>
                    <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 block tracking-tight group-hover:scale-105 transition-transform mb-1">
                      {item.group}
                    </span>
                    <span className="inline-block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-700/70 border border-zinc-200 dark:border-zinc-600 px-2 py-0.5 rounded-full mb-2">
                      {item.prevalence}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block line-clamp-1">
                    {language === "bn" ? item.roleBn : item.roleEn}
                  </span>
                </div>
              ))}

              {/* Highlighted Bombay (hh) Golden Blood Card - Spanning Full Width */}
              <div className="col-span-2 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between gap-4 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:shadow-xs transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 border border-amber-300/60 dark:border-amber-700 flex items-center justify-center shrink-0">
                    <Droplet size={18} className="text-amber-700 dark:text-amber-300 fill-amber-500/30" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-lg sm:text-xl font-black text-amber-900 dark:text-amber-200 tracking-tight">
                        {goldenBlood.group}
                      </span>
                      <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/80 border border-amber-300/80 dark:border-amber-700 px-2 py-0.2 rounded-full">
                        {goldenBlood.prevalence}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mt-0.5">
                      {language === "bn" ? goldenBlood.roleBn : goldenBlood.roleEn}
                    </span>
                  </div>
                </div>

                <Link
                  href="/search?bloodGroup=Bombay"
                  className="shrink-0 p-2 rounded-xl bg-white dark:bg-zinc-800 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors"
                  title="Search Bombay Donors"
                >
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}