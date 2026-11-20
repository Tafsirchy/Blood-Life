"use client";

import React, { useState } from "react";
import { DIVISIONS, DISTRICTS } from "@/lib/geo/bangladeshData";
import { useLanguage } from "@/lib/i18n/context";
import { MapPin, Users, Droplet, ArrowRight } from "lucide-react";
import Link from "next/link";

export function DistrictAvailabilityHeatmap() {
  const { language } = useLanguage();
  const [selectedDiv, setSelectedDiv] = useState<string>("dhaka");

  const divisionStats: Record<string, { donors: number; activeCases: number }> = {
    dhaka: { donors: 14200, activeCases: 42 },
    chittagong: { donors: 8900, activeCases: 26 },
    rajshahi: { donors: 4300, activeCases: 14 },
    khulna: { donors: 3800, activeCases: 11 },
    sylhet: { donors: 2900, activeCases: 9 },
    barishal: { donors: 1850, activeCases: 6 },
    rangpur: { donors: 2200, activeCases: 8 },
    mymensingh: { donors: 1750, activeCases: 5 },
  };

  const activeDivision = DIVISIONS.find((d) => d.id === selectedDiv) || DIVISIONS[0];
  const activeStats = divisionStats[selectedDiv] || { donors: 1000, activeCases: 5 };
  const districtsInDiv = DISTRICTS.filter((d) => d.division.toLowerCase() === activeDivision.nameEn.toLowerCase());

  return (
    <section className="py-6 sm:py-8 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-500 block mb-1">
            {language === "bn" ? "জাতীয় কভারেজ ও প্রাপ্যতা" : "NATIONAL DONOR HEATMAP"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            {language === "bn" ? "৬৪ জেলায় রক্তের লাইভ প্রাপ্যতা" : "Live Blood Availability Across 64 Districts"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-lg mx-auto">
            {language === "bn"
              ? "বিভাগ অনুযায়ী সক্রিয় রক্তদাতা এবং হাসপাতালের চলমান চাহিদার রিয়েল-টাইম তথ্য।"
              : "Real-time volunteer donor reserves and active cases across Bangladesh's 8 administrative divisions."}
          </p>
        </div>

        {/* Division Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {DIVISIONS.map((div) => (
            <button
              key={div.id}
              onClick={() => setSelectedDiv(div.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDiv === div.id
                  ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                  : "border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {language === "bn" ? div.nameBn : div.nameEn}
            </button>
          ))}
        </div>

        {/* Division Summary Card */}
        <div className="p-5 sm:p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)] mb-5">
            <div>
              <h3 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                <MapPin size={18} className="text-red-500" />
                <span>
                  {language === "bn" ? `${activeDivision.nameBn} বিভাগ` : `${activeDivision.nameEn} Division`}
                </span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {districtsInDiv.length} {language === "bn" ? "টি জেলা সংযুক্ত" : "Districts Connected"}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)] block text-[10px]">
                  {language === "bn" ? "প্রস্তুত রক্তদাতা" : "Ready Donors"}
                </span>
                <span className="text-base font-black text-emerald-500">
                  {activeStats.donors.toLocaleString()}
                </span>
              </span>

              <span className="p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)] block text-[10px]">
                  {language === "bn" ? "সক্রিয় আবেদন" : "Live Cases"}
                </span>
                <span className="text-base font-black text-red-500">
                  {activeStats.activeCases}
                </span>
              </span>
            </div>
          </div>

          {/* Districts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {districtsInDiv.map((dst) => (
              <Link
                key={dst.id}
                href={`/search?division=${encodeURIComponent(activeDivision.nameEn)}&district=${encodeURIComponent(dst.nameEn)}`}
                className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)] hover:border-red-500/50 hover:bg-red-500/5 transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-red-500 transition-colors block">
                    {language === "bn" ? dst.nameBn : dst.nameEn}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {dst.upazilas.length} Upazilas
                  </span>
                </div>
                <ArrowRight size={13} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
