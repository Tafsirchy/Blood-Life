"use client";

import React, { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { EmergencyFooter } from "@/components/home/EmergencyFooter";
import { useLanguage } from "@/lib/i18n/context";
import { CLINICAL_CONDITIONS, ClinicalCondition } from "@/lib/clinicalDiseases";
import {
  Shield,
  Activity,
  Droplet,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Heart,
  Building2,
  Sparkles,
  ArrowRight,
  Filter,
  Info,
  PhoneCall,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

export default function ClinicalShieldPage() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedUrgency, setSelectedUrgency] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>("thalassemia");

  const filteredConditions = useMemo(() => {
    return CLINICAL_CONDITIONS.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.primaryComponentBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.primaryComponentEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.symptomsBn.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.symptomsEn.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      const matchesUrgency =
        selectedUrgency === "all" || item.urgency === selectedUrgency;

      return matchesSearch && matchesCategory && matchesUrgency;
    });
  }, [searchQuery, selectedCategory, selectedUrgency]);

  const categories = [
    { id: "all", labelBn: "সকল রোগ", labelEn: "All Conditions" },
    { id: "emergency", labelBn: "জরুরি সার্জারি ও ট্রমা", labelEn: "Emergency & Trauma" },
    { id: "chronic", labelBn: "জন্মগত ও ক্রনিক", labelEn: "Chronic & Genetic" },
    { id: "infectious", labelBn: "সংক্রামক রোগ", labelEn: "Infectious" },
    { id: "oncology", labelBn: "ক্যানসার ও কেমোথেরাপি", labelEn: "Oncology" },
  ];

  const getComponentBadge = (type: string) => {
    switch (type) {
      case "platelets":
        return { label: "প্লাটিলেট (Platelets)", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" };
      case "ffp":
        return { label: "প্লাজমা (FFP)", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30" };
      case "cryo":
        return { label: "ক্রায়োপ্রিসিপিটেট (Cryo)", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" };
      case "whole_blood":
        return { label: "পূর্ণ রক্ত (Whole Blood)", color: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30" };
      default:
        return { label: "লোহিত কণিকা (PRBC)", color: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30" };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-10 sm:py-14 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider">
                <Shield size={13} />
                <span>{language === "bn" ? "ক্লিনিক্যাল ডিজিজ ও ট্রান্সফিউশন শিল্ড" : "CLINICAL BLOOD DISEASE SHIELD"}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
                {language === "bn"
                  ? "রক্তজনিত রোগ, প্রয়োজনীয় রক্তের উপাদান ও চিকিৎসা প্রটোকল"
                  : "Blood-Related Diseases, Component Therapy & Safety Protocols"}
              </h1>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
                {language === "bn"
                  ? "থ্যালাসেমিয়া, ডেঙ্গু, লিউকেমিয়া, প্রসবকালীন অতিরিক্ত রক্তক্ষরণ (PPH) কিংবা হিমোফিলিয়ার মতো গুরুতর অবস্থায় কোন উপাদান কত ব্যাগ লাগে, প্রতিকার ও হাসপাতালের সতর্কতা জানুন।"
                  : "Evidence-based guidelines on required blood components, transfusion frequency, clinical precautions, and emergency attendant protocols."}
              </p>

              {/* Search Bar */}
              <div className="pt-4 max-w-xl mx-auto">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-3 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      language === "bn"
                        ? "রোগের নাম, রক্তের উপাদান বা লক্ষণ দিয়ে খুঁজুন (যেমন: ডেঙ্গু, প্লাটিলেট, থ্যালাসেমিয়া)..."
                        : "Search by condition, component, or symptoms (e.g. Dengue, Platelets, Thalassemia)..."
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs sm:text-sm font-medium outline-none focus:border-red-500 shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-2.5 text-xs text-[var(--text-muted)] hover:text-red-500 font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters & Results Section */}
        <section className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[var(--border-subtle)]">
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === cat.id
                        ? "bg-red-600 text-white shadow-xs"
                        : "text-[var(--text-secondary)] hover:text-red-500"
                    }`}
                  >
                    {language === "bn" ? cat.labelBn : cat.labelEn}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-[var(--text-muted)] font-medium">
                  {language === "bn" ? "তীব্রতা:" : "Urgency:"}
                </span>
                <select
                  value={selectedUrgency}
                  onChange={(e) => setSelectedUrgency(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-bold outline-none"
                >
                  <option value="all">{language === "bn" ? "সকল স্তর" : "All Urgencies"}</option>
                  <option value="Critical">{language === "bn" ? "সংকটজনক (Critical)" : "Critical"}</option>
                  <option value="Urgent">{language === "bn" ? "জরুরি (Urgent)" : "Urgent"}</option>
                  <option value="Scheduled">{language === "bn" ? "পরিকল্পিত (Scheduled)" : "Scheduled"}</option>
                </select>
              </div>
            </div>

            {/* Empty State */}
            {filteredConditions.length === 0 && (
              <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
                <AlertTriangle size={36} className="text-amber-500 mx-auto" />
                <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                  {language === "bn"
                    ? "কোনো রোগ বা তথ্যের মিল পাওয়া যায়নি"
                    : "No matching clinical conditions found"}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                  {language === "bn"
                    ? "দয়া করে অন্য কোনো কি-ওয়ার্ড দিয়ে খুঁজুন অথবা ফিল্টার রিসেট করুন।"
                    : "Try searching with a different medical term or reset the category filter."}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedUrgency("all");
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
                >
                  {language === "bn" ? "ফিল্টার রিসেট করুন" : "Reset Filters"}
                </button>
              </div>
            )}

            {/* Clinical Conditions List */}
            <div className="space-y-5">
              {filteredConditions.map((item) => {
                const isExpanded = expandedId === item.id;
                const badge = getComponentBadge(item.componentType);

                return (
                  <div
                    key={item.id}
                    className="card-clinical rounded-3xl border-2 border-[var(--border-subtle)] hover:border-red-500/30 transition-all overflow-hidden shadow-xs"
                  >
                    {/* Header Bar */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="p-5 sm:p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-surface)] hover:bg-[var(--bg-main)]/50 transition-colors"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${badge.color}`}
                          >
                            {language === "bn" ? item.primaryComponentBn : item.primaryComponentEn}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.urgency === "Critical"
                                ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 animate-pulse"
                                : item.urgency === "Urgent"
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                            }`}
                          >
                            {item.urgency === "Critical"
                              ? language === "bn" ? "সংকটজনক" : "Critical"
                              : item.urgency === "Urgent"
                              ? language === "bn" ? "জরুরি" : "Urgent"
                              : language === "bn" ? "শিডিউলড" : "Scheduled"}
                          </span>

                          <span className="text-[11px] text-[var(--text-muted)] font-medium">
                            • {language === "bn" ? item.categoryBn : item.categoryEn}
                          </span>
                        </div>

                        <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                          {language === "bn" ? item.nameBn : item.nameEn}
                        </h2>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-left md:text-right">
                          <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold block">
                            {language === "bn" ? "প্রয়োজনীয় রক্তের পরিমাণ" : "Required Blood Units"}
                          </span>
                          <span className="text-xs sm:text-sm font-black text-red-600 dark:text-red-400">
                            {language === "bn" ? item.unitsNeededBn : item.unitsNeededEn}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-xl bg-[var(--bg-main)] text-xs font-bold text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-red-400 transition-colors"
                        >
                          {isExpanded ? (language === "bn" ? "সংক্ষেপ" : "Collapse") : (language === "bn" ? "বিস্তারিত" : "Details")}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Details Drawer */}
                    {isExpanded && (
                      <div className="p-5 sm:p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-main)]/40 space-y-6 animate-in fade-in duration-200">
                        {/* 3 Key Stats Pills */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-0.5">
                              {language === "bn" ? "রক্তের সঠিক উপাদান" : "Blood Component Required"}
                            </span>
                            <span className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
                              {language === "bn" ? item.primaryComponentBn : item.primaryComponentEn}
                            </span>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-0.5">
                              {language === "bn" ? "রক্ত সঞ্চালনের সময়সীমা" : "Transfusion Frequency"}
                            </span>
                            <span className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400">
                              {language === "bn" ? item.frequencyBn : item.frequencyEn}
                            </span>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-0.5">
                              {language === "bn" ? "উপযুক্ত রক্তদাতা ধরন" : "Ideal Donor Criteria"}
                            </span>
                            <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                              {language === "bn" ? item.suitableDonorsBn : item.suitableDonorsEn}
                            </span>
                          </div>
                        </div>

                        {/* Symptoms & Precautions Split */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Symptoms */}
                          <div className="rounded-2xl p-4 sm:p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs sm:text-sm">
                              <AlertTriangle size={15} />
                              <span>{language === "bn" ? "প্রধান লক্ষণসমূহ (Key Symptoms)" : "Clinical Signs & Symptoms"}</span>
                            </div>
                            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                              {(language === "bn" ? item.symptomsBn : item.symptomsEn).map((sym, sIdx) => (
                                <li key={sIdx} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                  <span>{sym}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Precautions */}
                          <div className="rounded-2xl p-4 sm:p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs sm:text-sm">
                              <CheckCircle2 size={15} />
                              <span>{language === "bn" ? "প্রতিকার ও চিকিৎসা সতর্কতা" : "Precautions & Medical Protocols"}</span>
                            </div>
                            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                              {(language === "bn" ? item.precautionsBn : item.precautionsEn).map((pre, pIdx) => (
                                <li key={pIdx} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                  <span>{pre}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Hospital Attendant Guidance Box */}
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-start gap-2.5 text-amber-800 dark:text-amber-300">
                            <Building2 size={16} className="shrink-0 mt-0.5" />
                            <div>
                              <strong className="font-bold text-[var(--text-primary)] block mb-0.5">
                                {language === "bn" ? "হাসপাতালে স্বজনদের জন্য জরুরি গাইড:" : "Hospital Ward Requisition Note:"}
                              </strong>
                              <span>{language === "bn" ? item.hospitalGuidelinesBn : item.hospitalGuidelinesEn}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Link
                              href="/search"
                              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                            >
                              <span>{language === "bn" ? "ডোনার খুঁজুন" : "Find Donors"}</span>
                              <ArrowRight size={12} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <EmergencyFooter />
    </div>
  );
}
