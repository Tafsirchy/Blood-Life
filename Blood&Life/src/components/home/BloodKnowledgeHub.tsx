"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import {
  Droplet,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Sparkles,
  Clock,
  ArrowRight,
  Info,
  Check,
  X as CloseIcon,
  Zap,
  Waves,
  Award,
} from "lucide-react";
import Link from "next/link";

type BloodGroup = "O-" | "O+" | "A-" | "A+" | "B-" | "B+" | "AB-" | "AB+";

interface CompatibilityInfo {
  group: BloodGroup;
  name: string;
  badgeBn: string;
  badgeEn: string;
  prevalence: string;
  canDonateTo: BloodGroup[];
  canReceiveFrom: BloodGroup[];
  roleBn: string;
  roleEn: string;
  clinicalFactBn: string;
  clinicalFactEn: string;
  isUniversalDonor?: boolean;
  isUniversalRecipient?: boolean;
}

const BLOOD_COMPATIBILITY: Record<BloodGroup, CompatibilityInfo> = {
  "O-": {
    group: "O-",
    name: "O Negative",
    badgeBn: "সর্বজনীন লোহিত রক্তদাতা",
    badgeEn: "Universal Red Cell Donor",
    prevalence: "~1.4% (বাংলাদেশে অতি বিরল)",
    canDonateTo: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    canReceiveFrom: ["O-"],
    roleBn: "যে কোনো রক্তের গ্রুপের রোগীকে জরুরি মুহূর্তে ও-নেগেটিভ রক্ত দেওয়া যায়।",
    roleEn: "Can be safely transfused to any patient in life-or-death emergencies when blood group is unknown.",
    clinicalFactBn: "দুর্ঘটনা ও জরুরি অস্ত্রোপচারে রোগীর ক্রস-ম্যাচিং করার সময় না থাকলে চিকিৎসকরা সরাসরি O- রক্ত বেছে নেন। তবে তারা কেবল O- রক্তই গ্রহণ করতে পারেন।",
    clinicalFactEn: "Paramount in emergency trauma resuscitation. Because their red cells lack A, B, and Rh antigens, antibodies will not attack them.",
    isUniversalDonor: true,
  },
  "O+": {
    group: "O+",
    name: "O Positive",
    badgeBn: "সর্বাধিক জরুরি পজিটিভ দাতা",
    badgeEn: "Universal Positive Donor",
    prevalence: "~31.3% (বাংলাদেশে উচ্চ চাহিদা)",
    canDonateTo: ["O+", "A+", "B+", "AB+"],
    canReceiveFrom: ["O+", "O-"],
    roleBn: "সকল পজিটিভ গ্রুপের রোগীকে ও-পজিটিভ রক্ত দেওয়া যায়।",
    roleEn: "Can donate red blood cells to any Rh-positive recipient.",
    clinicalFactBn: "বাংলাদেশে শতকরা প্রায় ৮৫% মানুষ পজিটিভ গ্রুপের। তাই ট্রমা সেন্টার ও হাসপাতালে O+ রক্তের চাহিদা থাকে সবচেয়ে বেশি।",
    clinicalFactEn: "Since over 85% of patients in Bangladesh are Rh-positive, O+ is the most frequently transfused blood group during surgeries and accidents.",
  },
  "A-": {
    group: "A-",
    name: "A Negative",
    badgeBn: "জরুরি নেগেটিভ সার্জারি ডোনার",
    badgeEn: "Critical Negative Surgery Match",
    prevalence: "~0.9% (বিরল গ্রুপ)",
    canDonateTo: ["A-", "A+", "AB-", "AB+"],
    canReceiveFrom: ["A-", "O-"],
    roleBn: "A ও AB উভয় গ্রুপের নেগেটিভ ও পজিটিভ রোগীদের রক্ত দিতে পারেন।",
    roleEn: "Can donate to both A and AB types, regardless of Rh factor.",
    clinicalFactBn: "A- গ্রুপের রোগীদের শরীরে অ্যান্টি-বি অ্যান্টিবডি থাকে। তাই তারা কেবল A- ও O- রক্তই নিরাপদে নিতে পারেন।",
    clinicalFactEn: "A- donors are crucial for maternal care and neonatal units when an Rh-negative mother requires emergency intervention.",
  },
  "A+": {
    group: "A+",
    name: "A Positive",
    badgeBn: "উচ্চ চাহিদাসম্পন্ন প্রাইমারি ডোনার",
    badgeEn: "High-Demand Platelet & Red Cell Match",
    prevalence: "~23.8% (প্রচলিত গ্রুপ)",
    canDonateTo: ["A+", "AB+"],
    canReceiveFrom: ["A+", "A-", "O+", "O-"],
    roleBn: "A+ এবং AB+ রোগীদের রক্ত দিতে সক্ষম।",
    roleEn: "Can donate red blood cells to A+ and AB+ recipients.",
    clinicalFactBn: "ক্যানসার ও কেমোথেরাপি রোগীদের চিকিৎসায় A+ রক্তদাতাদের প্লাটিলেট ও লোহিত রক্তকণিকা অপরিহার্য ভূমিকা পালন করে।",
    clinicalFactEn: "A+ donors are frequently called upon for platelet apheresis donations to support oncology and bone marrow patients.",
  },
  "B-": {
    group: "B-",
    name: "B Negative",
    badgeBn: "উচ্চ চাহিদাসম্পন্ন বিরল নেগেটিভ হিরো",
    badgeEn: "High-Demand Rare Negative Hero",
    prevalence: "~0.8% (অতি বিরল)",
    canDonateTo: ["B-", "B+", "AB-", "AB+"],
    canReceiveFrom: ["B-", "O-"],
    roleBn: "B ও AB উভয় গ্রুপের রোগীদের জীবন বাঁচাতে পারেন।",
    roleEn: "Can donate to B and AB patients across both positive and negative spectrums.",
    clinicalFactBn: "বাংলাদেশে থ্যালাসেমিয়া ও ডায়ালিসিস রোগীদের একটি বড় অংশ B গ্রুপের হওয়ায় B- ডোনারদের চাহিদা সর্বদা জরুরি থাকে।",
    clinicalFactEn: "With less than 1% prevalence, B- donors form the backbone of national thalassemia and pediatric transfusion registries.",
  },
  "B+": {
    group: "B+",
    name: "B Positive",
    badgeBn: "বাংলাদেশের সর্বাধিক প্রচলিত গ্রুপ",
    badgeEn: "Bangladesh's Most Prevalent Group",
    prevalence: "~33.5% (জাতীয় পর্যায়ে সর্বাধিক)",
    canDonateTo: ["B+", "AB+"],
    canReceiveFrom: ["B+", "B-", "O+", "O-"],
    roleBn: "B+ এবং AB+ উভয় গ্রুপের রোগীদের রক্ত দিতে পারেন।",
    roleEn: "Can donate to B+ and AB+ individuals.",
    clinicalFactBn: "বাংলাদেশে প্রতি ৩ জন নাগরিকের মধ্যে প্রায় ১ জন B+ গ্রুপের। ফলে প্রতিদিনের রক্ত চাহিদার সবচেয়ে বড় অংশ এই গ্রুপের।",
    clinicalFactEn: "The most common blood group in South Asia (~33.5%), representing the highest volume of hospital transfusion orders daily.",
  },
  "AB-": {
    group: "AB-",
    name: "AB Negative",
    badgeBn: "বিরলতম রক্তদাতা ও সার্বজনীন প্লাজমা ম্যাচ",
    badgeEn: "Ultra-Rare Hero & Plasma Asset",
    prevalence: "~0.2% (দেশের বিরলতম গ্রুপ)",
    canDonateTo: ["AB-", "AB+"],
    canReceiveFrom: ["AB-", "A-", "B-", "O-"],
    roleBn: "লোহিত কণিকা দিতে পারেন AB রোগীদের, কিন্তু প্লাজমা দিতে পারেন সব নেগেটিভ রোগীকে।",
    roleEn: "Can give red cells to AB patients and provides universal plasma for negative types.",
    clinicalFactBn: "AB- রক্ত বাংলাদেশে প্রতি ৫০০ জনে মাত্র ১ জনের থাকে। এই গ্রুপের রোগীরা কেবল সকল নেগেটিভ রক্তের গ্রুপ গ্রহণ করতে পারেন।",
    clinicalFactEn: "Rarest standard group in Bangladesh (0.2%). Dedicated proactive matching registries are essential to avoid critical surgery cancellations.",
  },
  "AB+": {
    group: "AB+",
    name: "AB Positive",
    badgeBn: "সর্বজনীন লোহিত রক্তগ্রহীতা ও সর্বজনীন প্লাজমা দাতা",
    badgeEn: "Universal Red Cell Recipient & Universal Plasma Donor",
    prevalence: "~8.1% (জাতীয় উপস্থিতি)",
    canDonateTo: ["AB+"],
    canReceiveFrom: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    roleBn: "যে কোনো রক্তের গ্রুপ থেকে রক্ত গ্রহণ করতে পারেন (Universal Recipient)।",
    roleEn: "Can safely receive red blood cells from any blood group.",
    clinicalFactBn: "লোহিত রক্তকণিকার ক্ষেত্রে তারা সবার রক্ত নিতে পারেন। তবে প্লাজমার ক্ষেত্রে AB+ হলেন 'সর্বজনীন প্লাজমা দাতা', যার প্লাজমা যে কোনো রোগীর জীবন বাঁচায়!",
    clinicalFactEn: "AB+ patients can receive red cells from everyone. In reverse, AB+ plasma is universal and can be transfused to any human without reaction.",
    isUniversalRecipient: true,
  },
};

const ALL_GROUPS: BloodGroup[] = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

export function BloodKnowledgeHub() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"compatibility" | "components" | "guidelines">("compatibility");
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>("O+");

  const currentInfo = BLOOD_COMPATIBILITY[selectedGroup];

  return (
    <section id="blood-info" className="py-12 sm:py-16 border-b border-[var(--border-subtle)] bg-[var(--bg-main)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles size={13} />
            <span>{language === "bn" ? "রক্তের বৈজ্ঞানিক তথ্য ও গাইডলাইন" : "CLINICAL BLOOD KNOWLEDGE HUB"}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            {language === "bn"
              ? "রক্তের গ্রুপ, সামঞ্জস্য ও জীবনরক্ষাকারী চিকিৎসা তথ্য"
              : "Blood Groups, Compatibility & Lifesaving Science"}
          </h2>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2.5 leading-relaxed">
            {language === "bn"
              ? "কার রক্ত কে নিতে পারবে, ১ ব্যাগ রক্তে কীভাবে ৩ জনের জীবন বাঁচে এবং রক্তদানের আগে-পরের সঠিক চিকিৎসা নির্দেশিকা জানুন।"
              : "Explore donor-recipient matching, component breakdown (1 donation = 3 lives), and evidence-based safety rules."}
          </p>
        </div>

        {/* 3 Main Interactive View Switchers */}
        <div className="flex justify-center mb-8 sm:mb-10">
          <div className="inline-flex p-1 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("compatibility")}
              className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === "compatibility"
                  ? "bg-red-600 text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Droplet size={15} />
              <span>{language === "bn" ? "রক্তের সামঞ্জস্য ও ম্যাচিং" : "Compatibility Matrix"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("components")}
              className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === "components"
                  ? "bg-red-600 text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Activity size={15} />
              <span>{language === "bn" ? "রক্তের ৪টি উপাদান ও ব্যবহার" : "Blood Components"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("guidelines")}
              className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === "guidelines"
                  ? "bg-red-600 text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <ShieldCheck size={15} />
              <span>{language === "bn" ? "প্রস্তুতি ও উপকারিতা" : "Safety & Benefits"}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: Compatibility Explorer */}
        {activeTab === "compatibility" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Blood Group Selector Bar */}
            <div className="bg-[var(--bg-surface)] p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] shadow-xs">
              <div className="text-center mb-3">
                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  {language === "bn" ? "আপনার রক্তের গ্রুপ নির্বাচন করুন:" : "Select a blood group to inspect:"}
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {ALL_GROUPS.map((grp) => {
                  const isSelected = selectedGroup === grp;
                  const isRare = grp.includes("-");
                  return (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setSelectedGroup(grp)}
                      className={`relative py-3 px-2 rounded-xl font-black text-sm sm:text-base transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? "bg-red-600 text-white shadow-md scale-102 ring-2 ring-red-500/40"
                          : "bg-[var(--bg-main)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-red-400 hover:bg-red-500/5"
                      }`}
                    >
                      <span>{grp}</span>
                      {isRare && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          Rare
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Compatibility Card */}
            <div className="bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-subtle)] p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-3xl sm:text-4xl font-black text-red-600 dark:text-red-500">
                      {currentInfo.group}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                      ({currentInfo.name})
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                      {language === "bn" ? currentInfo.badgeBn : currentInfo.badgeEn}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
                    {language === "bn" ? currentInfo.roleBn : currentInfo.roleEn}
                  </p>
                </div>

                <div className="bg-[var(--bg-main)] px-4 py-3 rounded-2xl border border-[var(--border-subtle)] shrink-0">
                  <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    {language === "bn" ? "বাংলাদেশে উপস্থিতির হার" : "Bangladesh Demographics"}
                  </div>
                  <div className="text-sm sm:text-base font-black text-[var(--text-primary)] mt-0.5">
                    {currentInfo.prevalence}
                  </div>
                </div>
              </div>

              {/* Two Column Grid: Can Donate To & Can Receive From */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                {/* Can Donate Red Cells To */}
                <div className="rounded-2xl p-5 bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm mb-3">
                    <CheckCircle2 size={16} />
                    <span>
                      {language === "bn"
                        ? `${currentInfo.group} রক্ত দিতে পারবেন (Can Donate Red Cells To):`
                        : `${currentInfo.group} Can Donate Red Cells To:`}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {ALL_GROUPS.map((grp) => {
                      const isCompatible = currentInfo.canDonateTo.includes(grp);
                      return (
                        <div
                          key={grp}
                          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all ${
                            isCompatible
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)] opacity-40"
                          }`}
                        >
                          {isCompatible ? <Check size={13} /> : <CloseIcon size={12} />}
                          <span>{grp}</span>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] mt-3">
                    {currentInfo.isUniversalDonor
                      ? language === "bn"
                        ? "🌟 ও-নেগেটিভ হলো সর্বজনীন লোহিত রক্তদাতা। যেকোনো গ্রুপের রোগীকে জীবন বাঁচাতে দেওয়া যায়।"
                        : "🌟 O- is the Universal Red Cell Donor, transfused when matching blood cannot be delayed."
                      : language === "bn"
                      ? `মোট ${currentInfo.canDonateTo.length}টি রক্তের গ্রুপে নিরাপদ সঞ্চালন সম্ভব।`
                      : `Safe to transfuse to ${currentInfo.canDonateTo.length} recipient blood groups.`}
                  </p>
                </div>

                {/* Can Receive Red Cells From */}
                <div className="rounded-2xl p-5 bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/20">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-sm mb-3">
                    <Droplet size={16} />
                    <span>
                      {language === "bn"
                        ? `${currentInfo.group} রক্ত গ্রহণ করতে পারবেন (Can Receive Red Cells From):`
                        : `${currentInfo.group} Can Receive Red Cells From:`}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {ALL_GROUPS.map((grp) => {
                      const isCompatible = currentInfo.canReceiveFrom.includes(grp);
                      return (
                        <div
                          key={grp}
                          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all ${
                            isCompatible
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)] opacity-40"
                          }`}
                        >
                          {isCompatible ? <Check size={13} /> : <CloseIcon size={12} />}
                          <span>{grp}</span>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] mt-3">
                    {currentInfo.isUniversalRecipient
                      ? language === "bn"
                        ? "🌟 এবি-পজিটিভ হলো সর্বজনীন লোহিত রক্তগ্রহীতা। তারা যে কোনো গ্রুপের রক্ত গ্রহণ করতে পারেন।"
                        : "🌟 AB+ is the Universal Red Cell Recipient, able to safely receive red blood cells from any donor."
                      : language === "bn"
                      ? `জরুরি সময়ে ${currentInfo.canReceiveFrom.length}টি গ্রুপের রক্ত গ্রহণ করা যাবে।`
                      : `Compatible with ${currentInfo.canReceiveFrom.length} donor blood groups in clinical transfusions.`}
                  </p>
                </div>
              </div>

              {/* Clinical Transfusion Insight Box */}
              <div className="mt-6 p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 flex items-start gap-3">
                <Info size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  <strong className="text-[var(--text-primary)] font-bold">
                    {language === "bn" ? "মেডিকেল ফ্যাক্ট: " : "Clinical Insight: "}
                  </strong>
                  {language === "bn" ? currentInfo.clinicalFactBn : currentInfo.clinicalFactEn}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Blood Components (1 Donation = 3 Lives) */}
        {activeTab === "components" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Banner: 1 Bag = 3 Lives */}
            <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-red-600/10 via-amber-500/10 to-blue-500/10 border border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-600 text-white shrink-0">
                  <Heart size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                    {language === "bn"
                      ? "১ ব্যাগ রক্ত = ৩ জন মুমূর্ষু রোগীর জীবন রক্ষা"
                      : "1 Blood Donation = Up to 3 Lives Saved"}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {language === "bn"
                      ? "আধুনিক ব্লাড ব্যাংকে ১ ব্যাগ পূর্ণ রক্তকে (Whole Blood) সেন্ট্রিফিউজের মাধ্যমে আলাদা ৩টি উপাদানে রূপান্তর করা হয়।"
                      : "Through apheresis & centrifugation, one 450ml donation is separated into specific components to treat 3 patients."}
                  </p>
                </div>
              </div>
              <Link
                href="/donate"
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors shrink-0 inline-flex items-center gap-1.5"
              >
                <span>{language === "bn" ? "আজই রক্তদাতা হোন" : "Register as Donor"}</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* 4 Components Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Component 1: PRBC */}
              <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:border-red-400 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                      <Droplet size={20} />
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                      PRBC
                    </span>
                  </div>

                  <h4 className="text-base font-black text-[var(--text-primary)] mb-1">
                    {language === "bn" ? "লোহিত রক্তকণিকা (PRBC)" : "Red Blood Cells (PRBC)"}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    {language === "bn"
                      ? "ফুসফুস থেকে পুরো শরীরে অক্সিজেন বহন করে। মারাত্মক রক্তশূন্যতা ও রক্তক্ষরণে অপরিহার্য।"
                      : "Carries oxygen from lungs to every vital organ. Essential for trauma and severe anemia."}
                  </p>

                  <div className="space-y-2 border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-secondary)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)] font-medium">
                        {language === "bn" ? "সংরক্ষণ মেয়াদ:" : "Shelf Life:"}
                      </span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {language === "bn" ? "৩৫ থেকে ৪২ দিন (২°-৬°C)" : "35–42 Days (2°-6°C)"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)] font-medium">
                        {language === "bn" ? "রোগীর ক্ষেত্র:" : "Primary Use:"}
                      </span>
                      <span className="font-bold text-red-600 dark:text-red-400">
                        {language === "bn" ? "অস্ত্রোপচার, ট্রমা, সিজার" : "Surgery, Trauma, Childbirth"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Component 2: Platelets */}
              <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:border-amber-400 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Zap size={20} />
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Platelets
                    </span>
                  </div>

                  <h4 className="text-base font-black text-[var(--text-primary)] mb-1">
                    {language === "bn" ? "প্লাটিলেট / অণুচক্রিকা" : "Platelets / Apheresis"}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    {language === "bn"
                      ? "রক্তপাত বন্ধে ও জমাট বাঁধতে সাহায্য করে। ডেঙ্গু ও ক্যানসার কেমোথেরাপি রোগীদের জন্য জীবনরক্ষাকারী।"
                      : "Stops internal and external bleeding. Lifesaving for dengue hemorrhagic fever and chemotherapy."}
                  </p>

                  <div className="space-y-2 border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-secondary)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)] font-medium">
                        {language === "bn" ? "সংরক্ষণ মেয়াদ:" : "Shelf Life:"}
                      </span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {language === "bn" ? "মাত্র ৫ দিন (২০°-২৪°C)" : "Strictly 5 Days (20°-24°C)"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)] font-medium">
                        {language === "bn" ? "রোগীর ক্ষেত্র:" : "Primary Use:"}
                      </span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {language === "bn" ? "ডেঙ্গু, লিউকেমিয়া, ক্যানসার" : "Dengue, Leukemia, Oncology"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Component 3: Plasma (FFP) */}
              <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:border-blue-400 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Waves size={20} />
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      FFP
                    </span>
                  </div>

                  <h4 className="text-base font-black text-[var(--text-primary)] mb-1">
                    {language === "bn" ? "তাজা প্লাজমা (FFP)" : "Fresh Frozen Plasma"}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    {language === "bn"
                      ? "গুরুত্বপূর্ণ প্রোটিন ও ক্লটিং ফ্যাক্টর ধারণ করে। আগুনে পোড়া ও যকৃতের জটিল রোগে অপরিহার্য।"
                      : "Carries vital clotting factors, albumin, and antibodies. Crucial for severe burn injuries and liver disease."}
                  </p>

                  <div className="space-y-2 border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-secondary)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)] font-medium">
                        {language === "bn" ? "সংরক্ষণ মেয়াদ:" : "Shelf Life:"}
                      </span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {language === "bn" ? "১ বছর পর্যন্ত (-১৮°C)" : "Up to 1 Year (≤ -18°C)"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)] font-medium">
                        {language === "bn" ? "রোগীর ক্ষেত্র:" : "Primary Use:"}
                      </span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {language === "bn" ? "বার্ন ইউনিট, শক, লিভার ফেইলিউর" : "Severe Burns, Liver Failure, Shock"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Component 4: Cryoprecipitate */}
              <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:border-emerald-400 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck size={20} />
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      CRYO
                    </span>
                  </div>

                  <h4 className="text-base font-black text-[var(--text-primary)] mb-1">
                    {language === "bn" ? "ক্রায়োপ্রিসিপিটেট" : "Cryoprecipitate"}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    {language === "bn"
                      ? "কনসেনট্রেটেড ফাইব্রিনোজেন ও ফ্যাক্টর ৮ সরবরাহ করে। বিরল জন্মগত রক্তক্ষরণজনিত রোগে জীবনদায়ী।"
                      : "Rich in fibrinogen and Factor VIII. Crucial for hereditary bleeding and massive obstetric hemorrhage."}
                  </p>

                  <div className="space-y-2 border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-secondary)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)] font-medium">
                        {language === "bn" ? "সংরক্ষণ মেয়াদ:" : "Shelf Life:"}
                      </span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {language === "bn" ? "১ বছর পর্যন্ত হিমায়িত" : "Up to 1 Year Frozen"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)] font-medium">
                        {language === "bn" ? "রোগীর ক্ষেত্র:" : "Primary Use:"}
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {language === "bn" ? "হিমোফিলিয়া, জটিল রক্তক্ষরণ" : "Hemophilia, Coagulopathy"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Guidelines & Health Benefits */}
        {activeTab === "guidelines" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
            {/* Left: Preparation & Step-by-Step */}
            <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <span className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                  <Clock size={18} />
                </span>
                <h3 className="text-lg font-black text-[var(--text-primary)]">
                  {language === "bn" ? "রক্তদানের প্রস্তুতি ও জরুরি নিয়মাবলী" : "Donation Preparation & Golden Rules"}
                </h3>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-[var(--text-secondary)]">
                <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)]">
                  <div className="font-bold text-[var(--text-primary)] mb-1 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                    <span>{language === "bn" ? "রক্তদানের পূর্বে (Before Donation):" : "Before Donation:"}</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs pl-2 text-[var(--text-secondary)]">
                    <li>{language === "bn" ? "আগের রাতে ৭-৮ ঘণ্টা পর্যাপ্ত ঘুম আবশ্যক।" : "Ensure 7–8 hours of restful sleep."}</li>
                    <li>{language === "bn" ? "রক্তদানের ২-৩ ঘণ্টা আগে পুষ্টিকর খাবার গ্রহণ করুন (খালি পেটে কখনো নয়)।" : "Eat a nutritious light meal 2–3 hours prior. Never donate on an empty stomach."}</li>
                    <li>{language === "bn" ? "রক্তদানের আধা ঘণ্টা আগে ৫০০ মি.লি. পানি বা ফলের রস পান করুন।" : "Drink at least 500ml of water or fruit juice beforehand."}</li>
                    <li>{language === "bn" ? "বিগত ২৪ ঘণ্টায় ধূমপান ও ভারী পরিশ্রম থেকে বিরত থাকুন।" : "Avoid smoking or intense physical workouts 24 hours prior."}</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)]">
                  <div className="font-bold text-[var(--text-primary)] mb-1 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-blue-600 dark:text-blue-400" />
                    <span>{language === "bn" ? "রক্তদানের সময় ও পরে (During & After):" : "During & After Donation:"}</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs pl-2 text-[var(--text-secondary)]">
                    <li>{language === "bn" ? "প্রক্রিয়া মাত্র ৮-১০ মিনিট সময় নেয়, শতভাগ জীবাণুমুক্ত ও একক ব্যবহারের সুচ ব্যবহার হয়।" : "Procedure takes only 8–10 minutes using 100% sterile disposable needles."}</li>
                    <li>{language === "bn" ? "রক্তদান শেষে বেডে অন্তত ১০-১৫ মিনিট বিশ্রাম নিন।" : "Rest comfortably in the donor chair for 10–15 minutes."}</li>
                    <li>{language === "bn" ? "পরবর্তী ৪-৬ ঘণ্টা স্বাভাবিকের চেয়ে বেশি পানি বা তরল পান করুন।" : "Hydrate generously with water and juices over the next 6 hours."}</li>
                    <li>{language === "bn" ? "রক্তদানের হাত দিয়ে ভারী ওজন বা জিনিস তোলা পরিহার করুন।" : "Avoid lifting heavy loads with the phlebotomy arm for 24 hours."}</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                  <strong>{language === "bn" ? "নিরাপদ বিরতি: " : "Safe Interval: "}</strong>
                  {language === "bn"
                    ? "পুরুষ রক্তদাতারা প্রতি ৩ মাস (৯০ দিন) এবং নারী রক্তদাতারা প্রতি ৪ মাস (১২০ দিন) পরপর নিরাপদে রক্তদান করতে পারেন।"
                    : "Men can safely donate every 3 months (90 days); women every 4 months (120 days) as per WHO clinical guidelines."}
                </div>
              </div>
            </div>

            {/* Right: Health Benefits for Donors */}
            <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-8 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Award size={18} />
                  </span>
                  <h3 className="text-lg font-black text-[var(--text-primary)]">
                    {language === "bn" ? "রক্তদানে রক্তদাতার প্রমাণিত স্বাস্থ্য উপকারিতা" : "Proven Medical Benefits for Donors"}
                  </h3>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 shrink-0 mt-0.5">
                      <Heart size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        {language === "bn" ? "হৃদরোগ ও স্ট্রোকের ঝুঁকি হ্রাস" : "Cardiovascular Health & Reduced Heart Attack Risk"}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {language === "bn"
                          ? "শরীরে অতিরিক্ত আয়রন (ফেরিটিন) জমা হওয়া কমায়, যা ধমনী ব্লক এবং হার্ট অ্যাটাকের ঝুঁকি প্রায় ৩০% হ্রাস করে।"
                          : "Regulates iron stores (ferritin), lowering blood viscosity and reducing arterial stress."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                      <Sparkles size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        {language === "bn" ? "নতুন রক্তকণিকা তৈরিতে বোন ম্যারোর উদ্দীপনা" : "Stimulates Fresh Cell Generation in Bone Marrow"}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {language === "bn"
                          ? "রক্তদানের পর শরীরের অস্থিমজ্জা সক্রিয় হয়ে ৪৮ ঘণ্টার মধ্যে নতুন রক্তরস এবং কয়েক সপ্তাহে সতেজ লোহিত কোষ তৈরি করে।"
                          : "Triggers bone marrow hematopoietic activity, replacing donated volume with revitalized new cells."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                      <ShieldCheck size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        {language === "bn" ? "বিনামূল্যে ৫টি সংক্রামক রোগের স্ক্রিনিং" : "Complimentary Clinical Infectious Disease Screening"}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {language === "bn"
                          ? "প্রতিবার রক্তদানের সময় হেপাটাইটিস বি, সি, এইচআইভি, সিফিলিস এবং ম্যালেরিয়া সম্পূর্ণ বিনামূল্যে পরীক্ষা করা হয়।"
                          : "Every donation undergoes rigorous standard laboratory screening for Hep B, Hep C, HIV, Syphilis & Malaria."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                      <Activity size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        {language === "bn" ? "ক্যালোরি বার্ন ও মানসিক আত্মতৃপ্তি" : "Caloric Expenditure & Mental Wellbeing"}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {language === "bn"
                          ? "প্রতি ব্যাগ রক্তদানে প্রায় ৬৫০ ক্যালোরি ক্ষয় হয়। একজন মুমূর্ষু মানুষের জীবন বাঁচানোর অনুভূতি মানসিক চাপ কমায়।"
                          : "Burns ~650 calories per donation while releasing endorphins from the profound sense of saving human lives."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--border-subtle)] mt-4 flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)] font-medium">
                  {language === "bn" ? "জীবন বাঁচাতে প্রস্তুত?" : "Ready to save someone's life?"}
                </span>
                <Link
                  href="/donate"
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>{language === "bn" ? "রক্তদাতা হিসেবে যুক্ত হন" : "Join as Donor"}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
