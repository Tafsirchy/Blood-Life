"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n/context";
import { ShieldAlert, Heart, ArrowRight, Activity, Users, Clock, MapPin, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface HeroSectionProps {
  onOpenSos: () => void;
}

export function HeroSection({ onOpenSos }: HeroSectionProps) {
  const { t, language } = useLanguage();

  return (
    <section className="relative overflow-hidden py-10 sm:py-14 lg:py-16 border-b border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column (60%): Typographical Value Proposition */}
          <div className="lg:col-span-7 text-left space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-wider">
              <Activity size={13} className="animate-pulse text-red-600" />
              <span>{t.hero.eyebrow}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight leading-[1.15] text-[var(--text-primary)]">
              {t.hero.titleStart}
              <span className="bg-gradient-to-r from-red-600 via-red-500 to-rose-600 bg-clip-text text-transparent">
                {t.hero.titleHighlight}
              </span>
              {t.hero.titleEnd}
            </h1>

            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-xl">
              {t.hero.subtitle}
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-bold text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-500" />
                <span>{t.hero.activeDonorsCount}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={15} className="text-blue-500" />
                <span>{t.hero.medianResponseTime}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldAlert size={15} className="text-amber-500" />
                <span>{t.hero.zeroCostLabel}</span>
              </span>
            </div>
          </div>

          {/* Right Column (40%): Symmetrical Dual Quick Dispatch Card */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-7 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-xl relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {language === "bn" ? "তাৎক্ষণিক একশন" : "Instant Action Dispatch"}
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>

              {/* Action 1: Need Blood */}
              <button
                type="button"
                onClick={onOpenSos}
                className="w-full p-4 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black text-left shadow-md shadow-red-600/25 flex items-center justify-between group transition-all"
              >
                <div>
                  <div className="text-base font-black flex items-center gap-2">
                    <ShieldAlert size={18} />
                    <span>{t.hero.btnNeedBlood}</span>
                  </div>
                  <p className="text-[11px] text-red-100 font-medium mt-0.5">
                    {language === "bn" ? "৩ ধাপে দ্রুততম সময়ে রক্তদাতা খুঁজুন" : "3-step rapid dispatch to nearby donors"}
                  </p>
                </div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Action 2: I Want to Donate */}
              <Link
                href="/donate"
                className="w-full p-4 rounded-2xl border-2 border-red-500/30 hover:border-red-500 bg-[var(--bg-main)] text-[var(--text-primary)] font-black text-left shadow-xs flex items-center justify-between group transition-all"
              >
                <div>
                  <div className="text-base font-black flex items-center gap-2">
                    <Heart size={18} className="text-red-500" />
                    <span>{t.hero.btnDonate}</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">
                    {language === "bn" ? "রক্তদাতা হিসেবে নিবন্ধন করুন ও জীবন বাঁচান" : "Register as a voluntary donor & save lives"}
                  </p>
                </div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-red-500" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
