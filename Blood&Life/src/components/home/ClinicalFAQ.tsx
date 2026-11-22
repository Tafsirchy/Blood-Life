"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { HelpCircle, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";

export function ClinicalFAQ() {
  const { language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      qEn: "Does donating blood cause physical weakness or harm the donor?",
      qBn: "রক্তদান করলে কি কোনো শারীরিক ক্ষতি বা স্থায়ী দুর্বলতা হয়?",
      aEn: "No. The human body naturally restores blood plasma volume within 24–48 hours, and red blood cells are fully replenished by bone marrow within a few weeks. Donating blood actually stimulates new cell generation and reduces iron overload risk.",
      aBn: "একদমই না। রক্তদানের পর ২৪ থেকে ৪৮ ঘণ্টার মধ্যে শরীরে প্লাজমা বা তরল অংশ পূরণ হয়ে যায় এবং কয়েক সপ্তাহের মধ্যে বোন ম্যারো থেকে নতুন লোহিত রক্তকণিকা তৈরি হয়। নিয়মিত রক্তদানে হৃদরোগ ও অতিরিক্ত আয়রনের ঝুঁকি কমে এবং রক্ত সঞ্চালন বৃদ্ধি পায়।",
    },
    {
      qEn: "Why is a 90-day (3 months) cooldown interval strictly enforced between donations?",
      qBn: "রক্তদানের মাঝে কেন বাধ্যতামূলক ৯০ দিন (৩ মাস) বিরতি রাখা আবশ্যক?",
      aEn: "The 90-day cooldown protects donor safety. It ensures your body has fully replenished its hemoglobin and iron stores (ferritin) before the next donation. BLOOD&LIFE automatically locks donor pledges during this window to preserve your long-term health.",
      aBn: "রক্তদাতার স্বাস্থ্য সুরক্ষার জন্য ৯০ দিনের বিরতি বিশ্ব স্বাস্থ্য সংস্থার (WHO) আন্তর্জাতিক স্বীকৃত গাইডলাইন। এই সময়ে শরীরের হিমোগ্লোবিন এবং ফেরিটিন (আয়রন রিজার্ভ) সম্পূর্ণরূপে স্বাভাবিক মাত্রায় ফিরে আসে। ব্লাড অ্যান্ড লাইফ (BLOOD&LIFE) অ্যালগরিদম এই ৯০ দিন স্বয়ংক্রিয়ভাবে ডোনারের জন্য বিশ্রাম নিশ্চিত করে।",
    },
    {
      qEn: "Is my phone number kept safe and hidden from public scrapers and marketing agents?",
      qBn: "আমার ফোন নম্বর কি সাধারণ ভিজিটর বা হয়রানিমূলক কল থেকে সুরক্ষিত থাকবে?",
      aEn: "Yes, 100%. BLOOD&LIFE employs an automated Donor Privacy Shield. Your telephone number is never rendered in public HTML or accessible to automated scrapers. Only verified and logged-in emergency requesters can request contact reveals, strictly throttled to 3 per hour with immutable audit logging.",
      aBn: "হ্যাঁ, সম্পূর্ণ সুরক্ষিত। ব্লাড অ্যান্ড লাইফ-এ ডোনারদের ফোন নম্বর কোনো পাবলিক পেজে প্রদর্শিত হয় না। শুধুমাত্র নিবন্ধিত ও যাচাইকৃত রোগী বা স্বজন ঘন্টায় সর্বোচ্চ ৩টি কন্টাক্ট রিকোয়েস্ট করতে পারেন। প্রতিটি কন্টাক্ট অ্যাক্সেস সার্ভার অডিট লগে সংরক্ষিত থাকে।",
    },
    {
      qEn: "Are there any fees or hidden charges for patients or donors?",
      qBn: "রোগী বা রক্তদাতার জন্য কি কোনো চার্জ বা গোপন ফি আছে?",
      aEn: "Never. BLOOD&LIFE is a 100% voluntary, zero-profit public emergency initiative. We strictly forbid any blood brokerage or financial solicitation. Transfusions are selfless gifts of life.",
      aBn: "কখনোই নয়। ব্লাড অ্যান্ড লাইফ (BLOOD&LIFE) একটি শতভাগ অলাভজনক ও মানবতার কল্যাণে উৎসর্গীকৃত সেবা। রক্তদান কোনো পণ্য নয়, এটি একটি জীবন বাঁচানোর মহান দায়িত্ব। প্ল্যাটফর্মে কোনো প্রকার মধ্যস্বত্বভোগী বা দালালদের স্থান নেই।",
    },
  ];

  return (
    <section className="py-12 sm:py-16 border-b border-[var(--border-subtle)] bg-[var(--bg-main)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[11px] font-bold uppercase tracking-wider mb-2">
            <HelpCircle size={12} />
            <span>{language === "bn" ? "জরুরী জিজ্ঞাসা ও পরামর্শ" : "CLINICAL GUIDELINES & FAQ"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            {language === "bn" ? "সাধারণ জিজ্ঞাসা ও সঠিক চিকিৎসা তথ্য" : "Frequently Asked Questions & Medical Facts"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5">
            {language === "bn"
              ? "রক্তদান নিয়ে প্রচলিত ভুল ধারণা এবং নিরাপত্তা নীতিমালার স্পষ্ট ব্যাখ্যা।"
              : "Clear, evidence-based answers regarding donation safety, privacy shield, and recovery."}
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="card-clinical rounded-xl border border-[var(--border-subtle)] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[var(--text-primary)] hover:text-red-500 transition-colors"
                >
                  <span>{language === "bn" ? faq.qBn : faq.qEn}</span>
                  <span className="p-1 rounded-md bg-[var(--bg-main)] text-[var(--text-muted)] shrink-0">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-3">
                    {language === "bn" ? faq.aBn : faq.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
