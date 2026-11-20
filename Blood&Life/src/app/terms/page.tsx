"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { EmergencyFooter } from "@/components/home/EmergencyFooter";
import { useLanguage } from "@/lib/i18n/context";
import { ShieldCheck, AlertTriangle, FileText, CheckCircle2, XCircle } from "lucide-react";

export default function TermsPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
      <Navbar onOpenSos={() => {}} />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-bold uppercase tracking-wider">
              <FileText size={12} />
              <span>{language === "bn" ? "ব্যবহারের নীতিমালা" : "TERMS OF SERVICE"}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
              {language === "bn"
                ? "ব্লাড অ্যান্ড লাইফ (BLOOD&LIFE) ব্যবহারের শর্তাবলী ও আচরণবিধি"
                : "Terms of Service & Code of Conduct"}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              {language === "bn"
                ? "রক্তদান সম্পূর্ণ নিঃস্বার্থ ও অলাভজনক উদ্যোগ। প্ল্যাটফর্ম ব্যবহারের আগে শর্তগুলো জেনে নিন।"
                : "BLOOD&LIFE is a zero-profit humanitarian initiative. Please review the mandatory operating standards."}
            </p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            <div className="card-clinical p-6 border border-[var(--border-subtle)] space-y-3">
              <div className="flex items-center gap-2 text-red-500 font-bold">
                <XCircle size={18} />
                <h2 className="text-sm sm:text-base font-black text-[var(--text-primary)]">
                  {language === "bn" ? "১. রক্ত কেনাবেচা সম্পূর্ণ নিষিদ্ধ" : "1. Strict Prohibition of Commercial Blood Sales"}
                </h2>
              </div>
              <p>
                {language === "bn"
                  ? "ব্লাড অ্যান্ড লাইফ প্ল্যাটফর্মের মাধ্যমে রক্তের বিনিময়ে কোনো ধরনের আর্থিক লেনদেন বা ক্ষতিপূরণ দাবি করা সম্পূর্ণ নিষিদ্ধ এবং আইনত দণ্ডনীয় অপরাধ। কোনো রক্তদাতা বা মধ্যস্বত্বভোগী অর্থ দাবি করলে তৎক্ষণাৎ তার অ্যাকাউন্ট স্থায়ীভাবে ব্লক করা হবে।"
                  : "Any financial transaction, selling, or brokerage of blood is strictly forbidden and constitutes a criminal offense under Bangladesh law. Any user attempting extortion will be permanently banned and reported."}
              </p>
            </div>

            <div className="card-clinical p-6 border border-[var(--border-subtle)] space-y-3">
              <div className="flex items-center gap-2 text-emerald-500 font-bold">
                <CheckCircle2 size={18} />
                <h2 className="text-sm sm:text-base font-black text-[var(--text-primary)]">
                  {language === "bn" ? "২. ৯০ দিনের স্বাস্থ্য বিরতি মেনে চলা" : "2. Mandatory 90-Day Biological Cooldown"}
                </h2>
              </div>
              <p>
                {language === "bn"
                  ? "রক্তদাতার শারীরিক সুস্থতা আমাদের সর্বোচ্চ অগ্রাধিকার। প্রতিবার রক্তদানের পর ন্যূনতম ৯০ দিন (৩ মাস) বিরতি রাখা বাধ্যতামূলক। ব্লাড অ্যান্ড লাইফ (BLOOD&LIFE) সিস্টেম এই সময়ে স্বয়ংক্রিয়ভাবে রক্তদাতাকে সাময়িক বিশ্রামে রাখবে।"
                  : "Donors must observe a minimum 90-day cooldown between whole-blood donations. The platform automatically enforces biological rest to safeguard donor hemoglobin and ferritin levels."}
              </p>
            </div>

            <div className="card-clinical p-6 border border-[var(--border-subtle)] space-y-3">
              <div className="flex items-center gap-2 text-blue-500 font-bold">
                <ShieldCheck size={18} />
                <h2 className="text-sm sm:text-base font-black text-[var(--text-primary)]">
                  {language === "bn" ? "৩. প্রেসক্রিপশন ও তথ্যের সত্যতা" : "3. Authenticity of Hospital Requisitions"}
                </h2>
              </div>
              <p>
                {language === "bn"
                  ? "আবেদনকারীকে অবশ্যই হাসপাতালের জেনুইন বেড টিকিট বা ডাক্তারের প্রেসক্রিপশন আপলোড করতে হবে। ভুয়া বা বিভ্রান্তিকর তথ্য দিলে সংশ্লিষ্ট ব্যক্তির বিরুদ্ধে আইনি ব্যবস্থা গ্রহণ করা হতে পারে।"
                  : "Requesters must upload legitimate hospital admission bed tickets and doctor's requisition slips. Submitting fraudulent medical documents will result in account termination and legal escalation."}
              </p>
            </div>
          </div>
        </div>
      </main>

      <EmergencyFooter />
    </div>
  );
}
