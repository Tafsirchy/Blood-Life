"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { EmergencyFooter } from "@/components/home/EmergencyFooter";
import { BloodKnowledgeHub } from "@/components/home/BloodKnowledgeHub";
import { useLanguage } from "@/lib/i18n/context";
import {
  Heart,
  CheckCircle2,
  Clock,
  ArrowRight,
  HelpCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";

export default function BloodInfoPage() {
  const { language } = useLanguage();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const clinicalMyths = [
    {
      mythBn: "রক্তদান করলে কি শরীর স্থায়ীভাবে দুর্বল হয়ে যায় বা রোগ প্রতিরোধ ক্ষমতা কমে যায়?",
      mythEn: "Does donating blood cause permanent weakness or lower the immune system?",
      truthBn: "সম্পূর্ণ ভুল ধারণা। মানবদেহ প্রাকৃতিকভাবে ২৪ থেকে ৪৮ ঘণ্টার মধ্যে রক্তের প্লাজমা (তরল অংশ) পূরণ করে নেয় এবং কয়েক সপ্তাহের মধ্যে অস্থিমজ্জা (Bone marrow) থেকে নতুন সতেজ রক্তকোষ তৈরি হয়। বরং রক্তদান শরীরকে নতুন কোষ তৈরিতে উদ্দীপিত করে।",
      truthEn: "Completely false. The human body naturally restores blood plasma volume within 24–48 hours, and red blood cells are replenished within a few weeks. Donating stimulates fresh marrow hematopoiesis.",
    },
    {
      mythBn: "ডায়াবেটিস বা উচ্চ রক্তচাপের রোগীরা কি কখনো রক্তদান করতে পারেন না?",
      mythEn: "Can individuals with diabetes or hypertension ever donate blood?",
      truthBn: "যদি রক্তচাপ এবং ডায়াবেটিস ওষুধের মাধ্যমে নিয়ন্ত্রণে থাকে এবং রোগী ইনসুলিন না নেন (বা চিকিৎসকের বিশেষ বারণ না থাকে), তবে তারা সম্পূর্ণ নিরাপদে রক্ত দিতে পারেন। রক্তদানের পূর্বে রক্তচাপ ও পালস মেপে নেওয়া হয়।",
      truthEn: "If blood pressure and blood glucose are medically well-controlled through oral medications and the donor does not take insulin, they can safely donate after on-site physician screening.",
    },
    {
      mythBn: "রক্তদানের সময় কি কোনো সংক্রামক রোগ বা ইনফেকশন হওয়ার ঝুঁকি থাকে?",
      mythEn: "Is there any risk of contracting an infection or virus during donation?",
      truthBn: "একেবারেই কোনো ঝুঁকি নেই। প্রতিটি রক্তদানের জন্য ১০০% নতুন, জীবাণুমুক্ত এবং একবার ব্যবহারযোগ্য (Disposable) সিরিঞ্জ ও রক্ত সংগ্রহ ব্যাগ ব্যবহার করা হয়। রক্ত সংগ্রহের পর তা ফেলে নষ্ট করে দেওয়া হয়।",
      truthEn: "Zero risk. Certified blood banks and mobile units exclusively use factory-sealed, 100% sterile disposable needles and blood collection bags, discarded immediately after a single use.",
    },
    {
      mythBn: "নারীরা কি নিয়মিত রক্ত দিতে পারেন?",
      mythEn: "Can women regularly donate blood safely?",
      truthBn: "হ্যাঁ, অবশ্যই! যে কোনো সুস্থ নারী যার ওজন ন্যূনতম ৪৫-৫০ কেজি এবং হিমোগ্লোবিন লেভেল ১২.০ গ্রাম/ডেসিলিটার বা তার বেশি, তিনি প্রতি ৪ মাস (১২০ দিন) পরপর নিরাপদে রক্ত দিতে পারেন। গর্ভাবস্থা ও বুকের দুধ খাওয়ানোর সময় সাময়িক বিরত থাকতে হয়।",
      truthEn: "Absolutely! Any healthy woman meeting the minimum weight (45–50 kg) and hemoglobin threshold (≥ 12.0 g/dL) can safely donate every 4 months (120 days). Temporary deferral applies during pregnancy and lactation.",
    },
    {
      mythBn: "ধূমপায়ী বা অ্যালকোহল গ্রহণকারীরা কি রক্ত দিতে পারেন?",
      mythEn: "Can smokers or occasional drinkers donate blood?",
      truthBn: "ধূমপায়ীরা রক্ত দিতে পারেন, তবে রক্তদানের অন্তত ৩ ঘণ্টা আগে এবং রক্তদানের ৩ ঘণ্টা পরে ধূমপান থেকে সম্পূর্ণ বিরত থাকতে হবে। অ্যালকোহল গ্রহণের পর অন্তত ২৪-৪৮ ঘণ্টা অতিবাহিত হওয়া আবশ্যক।",
      truthEn: "Smokers can donate provided they refrain from smoking at least 3 hours before and after donation. For alcohol, a mandatory abstinence interval of 24–48 hours is strictly enforced.",
    },
  ];

  const donationSteps = [
    {
      step: "01",
      titleBn: "নিবন্ধন ও স্বাস্থ্য ইতিহাস",
      titleEn: "Registration & Health History",
      descBn: "ডোনার কার্ড বা জাতীয় পরিচয়পত্র দিয়ে প্রাথমিক তথ্য ও পূর্ববর্তী চিকিৎসার ইতিহাস লিপিবদ্ধ করা হয়।",
      descEn: "Basic demographic info and confidential clinical questionnaire to verify donation readiness.",
    },
    {
      step: "02",
      titleBn: "প্রাথমিক স্বাস্থ্য পরীক্ষা (Vital Signs)",
      titleEn: "Mini-Physical & Hemoglobin Check",
      descBn: "রক্তচাপ, পালস, শরীরের তাপমাত্রা এবং আঙুলের এক ফোঁটা রক্ত দিয়ে তাৎক্ষণিক হিমোগ্লোবিন পরীক্ষা।",
      descEn: "On-site blood pressure, heart rate, temperature, and a quick finger-prick hemoglobin test.",
    },
    {
      step: "03",
      titleBn: "নিরাপদ রক্ত সংগ্রহ (Phlebotomy)",
      titleEn: "Sterile Blood Draw (8–10 Mins)",
      descBn: "সম্পূর্ণ জীবাণুমুক্ত ওয়ান-টাইম সুচের মাধ্যমে মাত্র ৮ থেকে ১০ মিনিটে ৩৫০-৪৫০ মিলি রক্ত নেওয়া হয়।",
      descEn: "Relax in a specialized donor recliner. The actual blood draw takes only 8 to 10 minutes.",
    },
    {
      step: "04",
      titleBn: "বিশ্রাম ও রিফ্রেশমেন্ট",
      titleEn: "Rest & Hydration Recovery",
      descBn: "রক্তদানের পর ১০-১৫ মিনিট বিশ্রাম নিয়ে ফলের জুস বা তরল এবং হালকা স্ন্যাক্স গ্রহণ করতে হয়।",
      descEn: "Rest for 10–15 minutes, hydrate with fresh juices or saline, and enjoy a light nutritious snack.",
    },
    {
      step: "05",
      titleBn: "ল্যাব স্ক্রিনিং ও ৩ জনে রূপান্তর",
      titleEn: "Lab Testing & 3-Way Component Separation",
      descBn: "সংগৃহীত রক্ত ৫টি সংক্রামক স্ক্রিনিং সম্পন্ন করে সেন্ট্রিফিউজের মাধ্যমে লোহিত কণিকা, প্লাটিলেট ও প্লাজমায় পৃথক হয়।",
      descEn: "Tested for 5 mandatory viral markers, then centrifuged into PRBC, platelets, and plasma to save 3 lives.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
      <Navbar />

      <main className="flex-1">
        {/* Interactive Knowledge Hub (Compatibility, 4 Components, Preparation & Benefits) */}
        <div id="compatibility-matrix">
          <BloodKnowledgeHub />
        </div>

        {/* Section: 5-Step Hospital Donation Journey */}
        <section id="donation-process" className="py-12 sm:py-16 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Clock size={13} />
                <span>{language === "bn" ? "রক্তদান অভিজ্ঞতা" : "HOSPITAL CLINICAL PROCESS"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                {language === "bn" ? "হাসপাতালে রক্তদানের ৫টি সহজ ধাপ" : "The 5-Step Hospital Donation Journey"}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5">
                {language === "bn"
                  ? "রক্তদান সম্পূর্ণ নিরাপদ, বেদনাদায়ক নয় এবং মাত্র কয়েক মিনিট সময় নেয়।"
                  : "Safe, confidential, and comfortable. Here is exactly what happens during a certified donation."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {donationSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl p-5 bg-[var(--bg-main)] border border-[var(--border-subtle)] flex flex-col justify-between hover:border-blue-500/40 transition-all group"
                >
                  <div>
                    <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-3 group-hover:scale-105 transition-transform">
                      {step.step}
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1.5">
                      {language === "bn" ? step.titleBn : step.titleEn}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {language === "bn" ? step.descBn : step.descEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Clinical Myths vs Evidence-Based Facts */}
        <section id="myths-and-facts" className="py-12 sm:py-16 border-b border-[var(--border-subtle)] bg-[var(--bg-main)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <HelpCircle size={13} />
                <span>{language === "bn" ? "মেডিকেল ফ্যাক্ট চেক" : "EVIDENCE-BASED MEDICAL TRUTHS"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                {language === "bn" ? "রক্তদান নিয়ে প্রচলিত ভুল ধারণা বনাম বৈজ্ঞানিক সত্য" : "Common Donation Myths vs Medical Realities"}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5">
                {language === "bn"
                  ? "ভুল ধারণার কারণে অনেকে রক্তদানে দ্বিধাবোধ করেন। জেনে নিন চিকিৎসাবিজ্ঞানের সঠিক তথ্য।"
                  : "Debunking common misconceptions that hold compassionate people back from donating."}
              </p>
            </div>

            <div className="space-y-3">
              {clinicalMyths.map((item, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden transition-all shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[var(--text-primary)] hover:text-red-500 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                        <span>{language === "bn" ? item.mythBn : item.mythEn}</span>
                      </span>
                      <span className="p-1 rounded-lg bg-[var(--bg-main)] text-[var(--text-muted)] shrink-0">
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-3.5 bg-emerald-500/5 dark:bg-emerald-950/10">
                        <div className="flex items-start gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
                          <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-bold text-[var(--text-primary)]">
                              {language === "bn" ? "চিকিৎসাবিজ্ঞানের বক্তব্য: " : "Medical Reality: "}
                            </strong>
                            {language === "bn" ? item.truthBn : item.truthEn}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Call to Action Card */}
            <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
              <div>
                <h3 className="text-xl sm:text-2xl font-black">
                  {language === "bn" ? "আপনি কি আজই কারো জীবন বাঁচাতে প্রস্তুত?" : "Ready to Save a Life Today?"}
                </h3>
                <p className="text-xs sm:text-sm text-red-100/90 mt-1 max-w-xl">
                  {language === "bn"
                    ? "আপনার মাত্র ৮ মিনিটের রক্তদান একটি পরিবারকে তাদের প্রিয়জন হারানোর কান্না থেকে রক্ষা করতে পারে।"
                    : "Join thousands of verified voluntary donors registered across Bangladesh's 64 districts."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link
                  href="/auth/register"
                  className="px-5 py-2.5 rounded-xl bg-white text-red-600 hover:bg-red-50 text-xs sm:text-sm font-bold shadow-md transition-all inline-flex items-center gap-1.5"
                >
                  <Heart size={14} className="fill-current" />
                  <span>{language === "bn" ? "রক্তদাতা হোন" : "Register as Donor"}</span>
                </Link>
                <Link
                  href="/search"
                  className="px-5 py-2.5 rounded-xl bg-red-800/80 hover:bg-red-800 text-white border border-white/20 text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-1.5"
                >
                  <span>{language === "bn" ? "জরুরি রক্ত খুঁজুন" : "Emergency Search"}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <EmergencyFooter />
    </div>
  );
}
