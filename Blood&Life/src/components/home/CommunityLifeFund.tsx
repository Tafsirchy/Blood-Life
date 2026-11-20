"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n/context";
import { Heart, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function CommunityLifeFund() {
  const { language } = useLanguage();

  const ledgerItems = [
    {
      itemEn: "Serverless & Cloud Database Infrastructure",
      itemBn: "ক্লাউড ডেটাবেস ও সার্ভার পরিচালনা",
      cost: "$0.00",
      noteEn: "100% Free Open Architecture",
      noteBn: "সম্পূর্ণ উন্মুক্ত ও টেকসই",
    },
    {
      itemEn: "Emergency Web Push Alert Service",
      itemBn: "জরুরী পুশ নোটিফিকেশন ইঞ্জিন",
      cost: "$0.00",
      noteEn: "Free VAPID Protocol",
      noteBn: "বিনামূল্যে VAPID প্রযুক্তি",
    },
    {
      itemEn: "Volunteer Background Verification Desk",
      itemBn: "ভলান্টিয়ার যাচাই ও হেল্পডেস্ক",
      cost: "Volunteer Driven",
      noteEn: "Community Volunteers",
      noteBn: "স্বেচ্ছাসেবী চিকিৎসাকর্মী",
    },
    {
      itemEn: "Patient Financial Aid for Poor Transfusions",
      itemBn: "অসহায় রোগীদের রক্ত পরীক্ষা ও ব্যাগ অনুদান",
      cost: "100% Fund Allocation",
      noteEn: "Direct Emergency Aid",
      noteBn: "সরাসরি রোগীর বিল পরিশোধ",
    },
  ];

  return (
    <section
      id="life-fund"
      className="scroll-mt-20 py-8 sm:py-12 border-b border-zinc-200/80 dark:border-zinc-800 bg-[var(--bg-surface)] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Text & Actions */}
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider shadow-2xs">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>{language === "bn" ? "স্বচ্ছ কমিউনিটি ফান্ড" : "TRANSPARENT LIFE FUND"}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
              {language === "bn" ? "ব্লাড অ্যান্ড লাইফ সাপোর্ট ফান্ড" : "The BLOOD&LIFE Community Life Fund"}
            </h2>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
              {language === "bn"
                ? "ব্লাড অ্যান্ড লাইফ (BLOOD&LIFE) প্ল্যাটফর্ম ব্যবহারের জন্য রোগী বা রক্তদাতা কারো থেকেই কোনো ফি নেওয়া হয় না। তবে অসচ্ছল রোগীদের রক্তের ক্রস-ম্যাচিং টেস্ট ও ব্যাগ কেনার সামর্থ্য না থাকলে আমাদের ফান্ড থেকে সরাসরি সাহায্য করা হয়।"
                : "BLOOD&LIFE is 100% free and non-profit. However, destitute emergency patients often struggle to afford cross-matching screening and blood bags. Our transparent fund helps impoverished families in critical moments."}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Linked correctly to /funding page */}
              <Link
                href="/funding"
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all inline-flex items-center gap-2 group"
              >
                <Heart size={14} className="fill-white group-hover:scale-110 transition-transform" />
                <span>{language === "bn" ? "অসহায় রোগীর পাশে দাঁড়ান" : "Support Life Fund"}</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform text-red-200" />
              </Link>

              <Link
                href="/funding#transparency"
                className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition-colors"
              >
                <span>{language === "bn" ? "অডিট রিপোর্ট দেখুন" : "View Full Audit"}</span>
              </Link>
            </div>
          </div>

          {/* Right Public Transparency Ledger Card */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  {language === "bn" ? "পাবলিক ট্রান্সপারেন্সি লেজার" : "PUBLIC TRANSPARENCY LEDGER"}
                </span>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-900/40 flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                  <span>{language === "bn" ? "অডিট ভেরিফাইড" : "Audit Verified"}</span>
                </span>
              </div>

              <div className="space-y-2.5">
                {ledgerItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">
                        {language === "bn" ? item.itemBn : item.itemEn}
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                        {language === "bn" ? item.noteBn : item.noteEn}
                      </div>
                    </div>
                    <div className="text-right font-black text-emerald-600 dark:text-emerald-400 shrink-0 pl-3">
                      {item.cost}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}