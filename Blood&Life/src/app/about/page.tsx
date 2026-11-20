"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { EmergencyFooter } from "@/components/home/EmergencyFooter";
import { useLanguage } from "@/lib/i18n/context";
import {
  Heart,
  ShieldCheck,
  Users,
  Target,
  Sparkles,
  MapPin,
  Clock,
  Award,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const { language } = useLanguage();

  const values = [
    {
      icon: Heart,
      titleEn: "100% Voluntary & Non-Profit",
      titleBn: "১০০% অলাভজনক ও মানবতার সেবায়",
      descEn: "Blood is an irreplaceable gift of life. We strictly forbid any buying, selling, or financial brokerage of blood.",
      descBn: "রক্ত কোনো পণ্য নয়, এটি জীবন বাঁচানোর দান। রক্ত কেনাবেচা বা কোনো প্রকার মধ্যস্বত্বভোগী দালালদের এখানে কোনো স্থান নেই।",
    },
    {
      icon: ShieldCheck,
      titleEn: "Zero-Compromise Privacy Shield",
      titleBn: "ডোনার প্রাইভেসি শিল্ড",
      descEn: "Volunteer telephone numbers are guarded against scrapers and call harassment with rate-limited reveals and immutable audit trails.",
      descBn: "রক্তদাতাদের ফোন নম্বর পাবলিক পেজে প্রদর্শিত হয় না। অত্যাধুনিক রেট-লিমিট ও অডিট লগের মাধ্যমে নম্বর সুরক্ষিত রাখা হয়।",
    },
    {
      icon: Clock,
      titleEn: "Under 20-Minute Emergency Dispatch",
      titleBn: "২০ মিনিটের মধ্যে দ্রুততম সাড়া",
      descEn: "When surgery patients hemorrhage, our geo-radius routing notifies matching donors within 5-10km of the hospital immediately.",
      descBn: "জরুরী সার্জারিতে এক সেকেন্ডও অমূল্য। হাসপাতালের নিকটবর্তী ৫-১০ কিমি ব্যাসার্ধের রক্তদাতাদের তাৎক্ষণিক নোটিফিকেশন পাঠানো হয়।",
    },
    {
      icon: Award,
      titleEn: "Physician & Bed-Ticket Verification",
      titleBn: "প্রেসক্রিপশন ও বেড টিকিট যাচাই",
      descEn: "Our medical volunteer triage verifies hospital bed tickets and doctor signatures before prioritizing urgent alerts.",
      descBn: "প্রতিটি রক্তের আবেদন ডাক্তারের প্রেসক্রিপশন ও হাসপাতালের ভর্তি টিকিট যাচাই করে তবেই ভেরিফাইড ব্যাজ দেওয়া হয়।",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
      <Navbar onOpenSos={() => {}} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-8 sm:py-12 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-bold uppercase tracking-wider">
                <Target size={12} />
                <span>{language === "bn" ? "আমাদের লক্ষ্য ও দর্শন" : "OUR MISSION & IDENTITY"}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
                {language === "bn"
                  ? "ব্লাড অ্যান্ড লাইফ (BLOOD&LIFE) — প্রতিটি রক্তের ফোঁটায় জীবনের স্পন্দন"
                  : "BLOOD&LIFE — Transforming Emergency Blood Dispatch Across Bangladesh"}
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {language === "bn"
                  ? "আমরা বিশ্বাস করি, রক্তের অভাবে যেন কোনো মানুষকে অকালে প্রাণ হারাতে না হয়। হাসপাতালের আইসিইউ বা জরুরি অস্ত্রোপচার কক্ষে অসহায় রোগীদের সাথে নিঃস্বার্থ রক্তদাতাদের তাৎক্ষণিক, নিরাপদ ও নিখরচায় যুক্ত করাই আমাদের অঙ্গীকার।"
                  : "No family should ever lose a loved one due to delayed blood transfusions. BLOOD&LIFE connects critical surgical cases with voluntary verified donors in minutes across all 64 districts in Bangladesh."}
              </p>
            </div>
          </div>
        </section>

        {/* 4 Core Pillars */}
        <section className="py-8 sm:py-10 border-b border-[var(--border-subtle)] bg-[var(--bg-main)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
            <div className="text-left space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-500 block">
                {language === "bn" ? "আমাদের মূল ভিত্তি" : "FOUR CORE PILLARS"}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                {language === "bn" ? "যে নীতিতে পরিচালিত হয় ব্লাড অ্যান্ড লাইফ" : "Built on Uncompromising Principles"}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {values.map((val, idx) => {
                const Icon = val.icon;
                return (
                  <div
                    key={idx}
                    className="card-clinical p-5 border border-[var(--border-subtle)] space-y-2.5 hover:border-red-500/30 transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                      <Icon size={18} />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      {language === "bn" ? val.titleBn : val.titleEn}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {language === "bn" ? val.descBn : val.descEn}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Operational Statistics */}
        <section className="py-8 sm:py-10 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)]">
                <span className="text-2xl font-black text-red-500 block">64</span>
                <span className="text-xs font-bold text-[var(--text-secondary)]">
                  {language === "bn" ? "জেলায় কভারেজ" : "Districts Covered"}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)]">
                <span className="text-2xl font-black text-emerald-500 block">38,400+</span>
                <span className="text-xs font-bold text-[var(--text-secondary)]">
                  {language === "bn" ? "নিবন্ধিত রক্তদাতা" : "Ready Donors"}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)]">
                <span className="text-2xl font-black text-blue-500 block">18 min</span>
                <span className="text-xs font-bold text-[var(--text-secondary)]">
                  {language === "bn" ? "গড় ম্যাচিং সময়" : "Median Response"}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)]">
                <span className="text-2xl font-black text-amber-500 block">0%</span>
                <span className="text-xs font-bold text-[var(--text-secondary)]">
                  {language === "bn" ? "হিডেন চার্জ বা ফি" : "Platform Fees"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="py-8 sm:py-10 bg-[var(--bg-main)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
              {language === "bn" ? "আজই যুক্ত হন এই জীবনরক্ষাকারী কাফেলায়" : "Join the Movement Today"}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
              {language === "bn"
                ? "আপনার এক ব্যাগ রক্ত ৩ জনের জীবন বাঁচাতে পারে। কোনো অর্থ নয়, আপনার সামান্য সদিচ্ছাই যথেষ্ট।"
                : "A single donation can save up to 3 lives. Register now or search for emergency surgery cases."}
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link href="/auth/register" className="btn-emergency !py-2 !px-4 text-xs font-bold">
                {language === "bn" ? "রক্তদাতা হন" : "Become a Donor"}
              </Link>
              <Link
                href="/search"
                className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] text-xs font-bold"
              >
                {language === "bn" ? "জরুরী আবেদনসমূহ" : "Emergency Feed"}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <EmergencyFooter />
    </div>
  );
}
