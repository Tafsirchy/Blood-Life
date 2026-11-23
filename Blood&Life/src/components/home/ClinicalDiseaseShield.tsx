"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { CLINICAL_CONDITIONS, ClinicalCondition } from "@/lib/clinicalDiseases";
import {
  Shield,
  Activity,
  Droplet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Building2,
  Heart,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export function ClinicalDiseaseShield() {
  const { language } = useLanguage();
  const featuredConditions = CLINICAL_CONDITIONS.filter((c) => c.isFeaturedHome);
  const [selectedId, setSelectedId] = useState<string>(featuredConditions[0]?.id || "thalassemia");

  const currentCondition =
    featuredConditions.find((c) => c.id === selectedId) || featuredConditions[0];

  const getComponentPill = (type: string) => {
    switch (type) {
      case "platelets":
        return {
          labelBn: "প্লাটিলেট / অণুচক্রিকা (Platelets)",
          labelEn: "Platelet Apheresis (SDP / RDP)",
          color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
          storage: "মেয়াদ: মাত্র ৫ দিন (২০°-২৪°C)",
        };
      case "ffp":
        return {
          labelBn: "তাজা হিমায়িত প্লাজমা (FFP)",
          labelEn: "Fresh Frozen Plasma (FFP)",
          color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
          storage: "মেয়াদ: ১ বছর পর্যন্ত (-১৮°C)",
        };
      case "whole_blood":
        return {
          labelBn: "পূর্ণ রক্ত / প্লাজমা (Whole Blood / FFP)",
          labelEn: "Whole Blood & Plasma Resuscitation",
          color: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
          storage: "মেয়াদ: ৩৫ দিন (২°-৬°C)",
        };
      default:
        return {
          labelBn: "ধৌত লোহিত কণিকা (Washed PRBC)",
          labelEn: "Leukodepleted PRBC Red Cells",
          color: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
          storage: "মেয়াদ: ৩৫-৪২ দিন (২°-৬°C)",
        };
    }
  };

  const currentPill = getComponentPill(currentCondition.componentType);

  return (
    <section className="py-12 sm:py-16 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-2.5">
              <Shield size={13} />
              <span>{language === "bn" ? "জরুরি চিকিৎসা প্রটোকল" : "CLINICAL DISEASE & COMPONENT SHIELD"}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              {language === "bn"
                ? "রক্তজনিত জটিল রোগ ও সঠিক রক্তের উপাদান"
                : "Blood-Related Conditions & Component Protocols"}
            </h2>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-xl">
              {language === "bn"
                ? "কোন রোগে রক্তের কোন উপাদান কত ব্যাগ লাগে এবং জরুরি পরিস্থিতিতে হাসপাতালের চিকিৎসকদের নির্দেশনা জানুন।"
                : "Transfusion quantities, required components (PRBC, Platelets, FFP), and clinical precautions."}
            </p>
          </div>

          <Link
            href="/clinical-shield"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 px-3.5 py-2 rounded-xl transition-all self-start md:self-auto shrink-0 shadow-2xs"
          >
            <span>{language === "bn" ? "সম্পূর্ণ ক্লিনিক্যাল শিল্ড দেখুন" : "Explore All Conditions"}</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Distinct Split-Pane Medical Console Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Disease Selector Deck (4 cols) */}
          <div className="lg:col-span-4 space-y-2.5">
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block px-1">
              {language === "bn" ? "রোগ নির্বাচন করুন:" : "Select Medical Condition:"}
            </span>

            {featuredConditions.map((item) => {
              const isSelected = selectedId === item.id;
              const pill = getComponentPill(item.componentType);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full p-4 rounded-2xl text-left transition-all border-2 flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-[var(--bg-main)] border-red-500 shadow-md ring-2 ring-red-500/20"
                      : "bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-red-400/50 hover:bg-[var(--bg-main)]/50"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
                        {language === "bn" ? item.nameBn.split("(")[0] : item.nameEn.split("&")[0]}
                      </span>
                      {item.urgency === "Critical" && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                      )}
                    </div>
                    <span
                      className={`inline-block px-2 py-0.2 rounded-full text-[10px] font-bold border ${pill.color}`}
                    >
                      {language === "bn" ? item.primaryComponentBn.split("(")[0] : item.primaryComponentEn.split("(")[0]}
                    </span>
                  </div>

                  <ChevronRight
                    size={16}
                    className={`transition-transform shrink-0 ${
                      isSelected ? "text-red-500 translate-x-1" : "text-[var(--text-muted)]"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right Column: Dynamic Medical Dossier (8 cols) */}
          <div className="lg:col-span-8 card-clinical p-6 sm:p-8 rounded-3xl border-2 border-red-500/20 bg-[var(--bg-main)] shadow-sm space-y-6">
            {/* Dossier Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${currentPill.color}`}
                  >
                    {language === "bn" ? currentCondition.primaryComponentBn : currentCondition.primaryComponentEn}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                    {language === "bn" ? currentCondition.categoryBn : currentCondition.categoryEn}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                  {language === "bn" ? currentCondition.nameBn : currentCondition.nameEn}
                </h3>
              </div>

              <div className="bg-[var(--bg-surface)] px-4 py-2.5 rounded-2xl border border-[var(--border-subtle)] shrink-0 text-left sm:text-right">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">
                  {language === "bn" ? "প্রয়োজনীয় রক্তের পরিমাণ" : "Required Quantity"}
                </span>
                <span className="text-sm font-black text-red-600 dark:text-red-400">
                  {language === "bn" ? currentCondition.unitsNeededBn : currentCondition.unitsNeededEn}
                </span>
              </div>
            </div>

            {/* 2-Column Clinical Insight */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Symptoms */}
              <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400">
                  <AlertTriangle size={14} />
                  <span>{language === "bn" ? "রোগের প্রধান লক্ষণসমূহ:" : "Clinical Symptoms:"}</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                  {(language === "bn" ? currentCondition.symptomsBn : currentCondition.symptomsEn)
                    .slice(0, 3)
                    .map((sym, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                        <span>{sym}</span>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Precautions */}
              <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={14} />
                  <span>{language === "bn" ? "জরুরি চিকিৎসা সতর্কতা ও প্রতিকার:" : "Clinical Precautions:"}</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                  {(language === "bn" ? currentCondition.precautionsBn : currentCondition.precautionsEn)
                    .slice(0, 3)
                    .map((pre, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{pre}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            {/* Hospital Requisition Warning Bar */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
              <Building2 size={17} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <strong className="font-bold text-[var(--text-primary)] block mb-0.5">
                  {language === "bn" ? "হাসপাতাল ও চিকিৎসকের জরুরি প্রটোকল:" : "Hospital Clinical Protocol:"}
                </strong>
                <span>
                  {language === "bn"
                    ? currentCondition.hospitalGuidelinesBn
                    : currentCondition.hospitalGuidelinesEn}
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-[var(--text-muted)] font-medium">
                {language === "bn"
                  ? `সঞ্চালন পৌনঃপুনিকতা: ${currentCondition.frequencyBn}`
                  : `Schedule: ${currentCondition.frequencyEn}`}
              </span>

              <div className="flex items-center gap-2">
                <Link
                  href="/search"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Heart size={13} className="fill-current" />
                  <span>{language === "bn" ? "এই রোগীর জন্য রক্তদাতা খুঁজুন" : "Find Matched Donors"}</span>
                </Link>

                <Link
                  href="/clinical-shield"
                  className="px-3 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] inline-flex items-center gap-1"
                >
                  <span>{language === "bn" ? "বিস্তারিত গাইড" : "Full Guide"}</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
