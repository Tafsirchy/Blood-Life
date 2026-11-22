"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { Quote, Heart, Star, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

export function RecoveryStories() {
  const { language } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  const stories = [
    {
      nameEn: "Ayesha Siddiqua",
      nameBn: "আয়েশা সিদ্দিকা",
      roleEn: "Mother of 4-year-old child (Thalassemia)",
      roleBn: "থ্যালাসেমিয়া আক্রান্ত শিশুর মা",
      hospitalEn: "Dhaka Shishu Hospital",
      hospitalBn: "ঢাকা শিশু হাসপাতাল",
      bloodGroup: "O-",
      storyEn:
        "My son needed O-negative blood in the middle of midnight. Within 12 minutes of posting on BLOOD&LIFE, a university donor confirmed and reached the hospital. I can never repay this gratitude.",
      storyBn:
        "মধ্যরাতে আমার ৪ বছরের ছেলের জন্য O নেগেটিভ রক্তের খুব প্রয়োজন ছিল। ব্লাড অ্যান্ড লাইফ (BLOOD&LIFE)-এ পোস্ট করার মাত্র ১২ মিনিটের মধ্যে একজন রক্তদাতা যোগাযোগ করেন এবং দ্রুত হাসপাতালে পৌঁছান। এই নিঃস্বার্থ সহায়তা কোনোদিন ভুলব না।",
    },
    {
      nameEn: "Tanvir Ahmed",
      nameBn: "তানভীর আহমেদ",
      roleEn: "Road Accident Survivor & Volunteer Donor",
      roleBn: "সড়ক দুর্ঘটনা থেকে সুস্থ হওয়া রোগী ও রক্তদাতা",
      hospitalEn: "National Institute of Traumatology (NITOR)",
      hospitalBn: "পঙ্গু হাসপাতাল (নিটোর), ঢাকা",
      bloodGroup: "B+",
      storyEn:
        "I was in urgent need of 4 bags of blood during emergency surgery. Unknown brothers gave me blood through this platform. Today I am fully recovered and donate blood regularly on this platform.",
      storyBn:
        "জরুরী অপারেশনের সময় আমার ৪ ব্যাগ রক্তের প্রয়োজন হয়েছিল। প্ল্যাটফর্মের মাধ্যমে অচেনা ভাইয়েরা রক্ত দিয়ে আমাকে জীবনদান করেছেন। আজ আমি সম্পূর্ণ সুস্থ এবং প্রতি ৯০ দিন পর পর নিজে রক্ত দিচ্ছি।",
    },
    {
      nameEn: "Dr. Nazmul Huda",
      nameBn: "ডাঃ নাজমুল হুদা",
      roleEn: "ICU Specialist",
      roleBn: "আইসিইউ ইনচার্জ ও কনসালট্যান্ট",
      hospitalEn: "Chittagong Medical College Hospital",
      hospitalBn: "চট্টগ্রাম মেডিকেল কলেজ হাসপাতাল",
      bloodGroup: "AB+",
      storyEn:
        "BLOOD&LIFE has drastically reduced our patient emergency wait times. The doctor prescription verification ensures only genuine patients get prioritized assistance.",
      storyBn:
        "ব্লাড অ্যান্ড লাইফ (BLOOD&LIFE) প্ল্যাটফর্মটি হাসপাতালে রক্ত খোঁজার জটিলতা দূর করেছে। প্রেসক্রিপশন যাচাইয়ের কারণে প্রকৃত রোগীরা দ্রুততম সময়ে কোনো দালাল ছাড়া সরাসরি ডোনার পেয়ে যাচ্ছেন।",
    },
  ];

  const current = stories[activeIndex];

  return (
    <section className="py-12 sm:py-16 border-b border-[var(--border-subtle)] bg-gradient-to-b from-white via-amber-50/15 to-white dark:from-zinc-900/60 dark:via-zinc-950 dark:to-zinc-900/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
            {language === "bn" ? "বাস্তব জীবনের গল্প" : "VOICES OF HOPE"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            {language === "bn" ? "সুস্থ হয়ে ওঠা রোগীদের ভালোবাসার বার্তা" : "Verified Recipient Recovery Stories"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5">
            {language === "bn"
              ? "মানুষ মানুষের জন্য — প্রতিটি ফোঁটা রক্তে ফিরে পাওয়া হাসির অনুপ্রেরণা।"
              : "Real testimonials from patients, emergency caregivers, and critical care physicians."}
          </p>
        </div>

        {/* Carousel Card */}
        <div className="max-w-4xl mx-auto">
          <div className="card-clinical p-6 sm:p-10 relative overflow-hidden border-2 border-[var(--border-subtle)]">
            <Quote size={48} className="absolute right-6 top-6 text-red-500/10 pointer-events-none" />

            <div className="flex items-center gap-2 mb-4">
              <span className="badge-blood text-xs font-black px-2.5 py-0.5">
                {current.bloodGroup}
              </span>
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>{language === "bn" ? "যাচাইকৃত সফল রক্তদান" : "Verified Recovery"}</span>
              </span>
            </div>

            <p className="text-sm sm:text-base text-[var(--text-primary)] font-medium leading-relaxed mb-6 italic">
              "{language === "bn" ? current.storyBn : current.storyEn}"
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[var(--border-subtle)]">
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">
                  {language === "bn" ? current.nameBn : current.nameEn}
                </h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  {language === "bn" ? current.roleBn : current.roleEn} •{" "}
                  <span className="text-red-500 font-medium">
                    {language === "bn" ? current.hospitalBn : current.hospitalEn}
                  </span>
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() =>
                    setActiveIndex((prev) => (prev === 0 ? stories.length - 1 : prev - 1))
                  }
                  className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors"
                  aria-label="Previous story"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="text-xs font-bold text-[var(--text-muted)] px-1">
                  {activeIndex + 1} / {stories.length}
                </div>
                <button
                  onClick={() =>
                    setActiveIndex((prev) => (prev === stories.length - 1 ? 0 : prev + 1))
                  }
                  className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors"
                  aria-label="Next story"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
