"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { EmergencyFooter } from "@/components/home/EmergencyFooter";
import { useLanguage } from "@/lib/i18n/context";
import { ShieldCheck, Lock, EyeOff, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";

export default function PrivacyPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-bold uppercase tracking-wider">
              <Lock size={12} />
              <span>{language === "bn" ? "ডোনার প্রাইভেসি শিল্ড" : "DATA SECURITY & PRIVACY POLICY"}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
              {language === "bn"
                ? "BLOOD&LIFE ডোনার প্রাইভেসি শিল্ড ও তথ্য সুরক্ষা নীতিমালা"
                : "BLOOD&LIFE Donor Privacy Shield & Data Protection Standards"}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              {language === "bn"
                ? "সর্বশেষ হালনাগাদ: নভেম্বর ২০২৬ • সম্পূর্ণ অ্যান্টি-স্ক্র্যাপিং ও নিরাপদ ফ্রেমওয়ার্ক"
                : "Last Updated: November 2026 • Full Anti-Scraping & End-to-End Audit Trail"}
            </p>
          </div>

          {/* Privacy Articles */}
          <div className="space-y-6 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            <div className="card-clinical p-6 border border-[var(--border-subtle)] space-y-3">
              <div className="flex items-center gap-2 text-red-500 font-bold">
                <EyeOff size={18} />
                <h2 className="text-sm sm:text-base font-black text-[var(--text-primary)]">
                  {language === "bn" ? "১. ফোন নম্বর প্রকাশ না করার নীতি" : "1. Zero Public Phone Number Exposure"}
                </h2>
              </div>
              <p>
                {language === "bn"
                  ? "BLOOD&LIFE প্ল্যাটফর্মে নিবন্ধিত কোনো রক্তদাতার ফোন নম্বর পাবলিক এইচটিএমএল (HTML) সোর্সে কখনো রেন্ডার করা হয় না। কোনো সাধারণ ব্রাউজার বা ওয়েব স্ক্র্যাপার রোবট রক্তদাতাদের নম্বর সংগ্রহ করতে পারবে না।"
                  : "Under no circumstances are donor telephone numbers rendered in public HTML source code. Automated web crawlers and scraping bots cannot extract volunteer contact details."}
              </p>
            </div>

            <div className="card-clinical p-6 border border-[var(--border-subtle)] space-y-3">
              <div className="flex items-center gap-2 text-amber-500 font-bold">
                <ShieldAlert size={18} />
                <h2 className="text-sm sm:text-base font-black text-[var(--text-primary)]">
                  {language === "bn" ? "২. রেট-লিমিটেড কন্টাক্ট অ্যাক্সেস" : "2. Rate-Limited Emergency Access (3 / hour)"}
                </h2>
              </div>
              <p>
                {language === "bn"
                  ? "শুধুমাত্র লগইন করা জরুরী রোগী বা তাদের স্বজনরা ঘন্টায় সর্বোচ্চ ৩টি কন্টাক্ট নম্বর আনলক করতে পারবেন। অতিরিক্ত রিকোয়েস্ট স্বয়ংক্রিয়ভাবে ক্লাউড রেট-লিমিটার দ্বারা ব্লক হয়ে যাবে।"
                  : "Only authenticated emergency requesters with verified patient records may unlock donor contact details, strictly limited to a maximum of 3 reveals per hour."}
              </p>
            </div>

            <div className="card-clinical p-6 border border-[var(--border-subtle)] space-y-3">
              <div className="flex items-center gap-2 text-emerald-500 font-bold">
                <FileText size={18} />
                <h2 className="text-sm sm:text-base font-black text-[var(--text-primary)]">
                  {language === "bn" ? "৩. অপরিবর্তনীয় অডিট লগ" : "3. Immutable Audit Trails"}
                </h2>
              </div>
              <p>
                {language === "bn"
                  ? "প্রতিবার যখনই কোনো রক্তদাতার নম্বর আনলক করা হয়, সিস্টেম স্বয়ংক্রিয়ভাবে আবেদনকারীর আইপি এড্রেস, টাইমস্ট্যাম্প এবং রোগীর কেস আইডি একটি অপরিবর্তনীয় সার্ভার লগে সংরক্ষণ করে।"
                  : "Every time a donor phone number is revealed, an immutable audit log is generated recording the requester ID, IP address, timestamp, and target patient request."}
              </p>
            </div>
          </div>
        </div>
      </main>

      <EmergencyFooter />
    </div>
  );
}
