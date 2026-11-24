"use client";

import React from "react";

export interface CertificateData {
  certificateId: string;
  donorName: string;
  bloodGroup: string;
  units?: number;
  hospital: string;
  district?: string;
  date: string | Date;
  recipientVerified?: boolean;
  rating?: number;
  recipientFeedback?: string;
  patientName?: string;
  tierTitleBn?: string;
  tierTitleEn?: string;
  citationBn?: string;
  citationEn?: string;
}

interface ProfessionalCertificateProps {
  data: CertificateData;
  language?: "bn" | "en";
  className?: string;
}

export function ProfessionalCertificate({
  data,
  language = "bn",
  className = "",
}: ProfessionalCertificateProps) {
  const formattedDate = new Date(data.date).toLocaleDateString(
    language === "bn" ? "bn-BD" : "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

  return (
    <div
      id="printable-cert"
      className={`relative w-full max-w-[880px] mx-auto bg-white text-neutral-900 border-2 border-neutral-200 rounded-2xl shadow-xl overflow-hidden p-6 sm:p-9 flex flex-col justify-between print:m-0 print:border-2 print:border-neutral-300 print:rounded-none print:shadow-none ${className}`}
      style={{
        aspectRatio: "1.414 / 1", // Standard A4 Landscape (297x210 mm) and US Letter ratio
        minHeight: "520px",
      }}
    >
      {/* Top Modern Accent Gradient Stripe */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-red-600 via-rose-500 to-amber-500 pointer-events-none" />

      {/* Modern Sleek Minimalist Corner Accents */}
      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-red-500/40 pointer-events-none" />
      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-red-500/40 pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-red-500/40 pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-red-500/40 pointer-events-none" />

      {/* Faint Modern Geometric Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.025]">
        <svg viewBox="0 0 200 200" className="w-[340px] h-[340px] text-neutral-900" fill="none" stroke="currentColor">
          <circle cx="100" cy="100" r="90" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="100" cy="100" r="75" strokeWidth="1.5" />
          <path d="M 100,30 C 115,70 140,95 140,120 C 140,145 120,165 100,165 C 80,165 60,145 60,120 C 60,95 85,70 100,30 Z" strokeWidth="2" />
        </svg>
      </div>

      {/* Top Header: Logo + Registry Status */}
      <div className="relative z-10 flex items-center justify-between pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Blood&Life"
            className="h-8 sm:h-9 w-auto object-contain"
          />
          <div className="border-l border-neutral-200 pl-3 hidden sm:block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block leading-tight">
              NATIONAL BLOOD DISPATCH PLATFORM
            </span>
            <span className="text-[9px] font-mono text-neutral-400 block">
              EST. 2026 • VOLUNTARY LIFE SAVER REGISTRY
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>{language === "bn" ? "ভেরিফাইড রেকর্ড" : "VERIFIED RECORD"}</span>
          </span>
          <span className="font-mono text-[10px] font-bold text-neutral-400 block mt-0.5">
            #{data.certificateId}
          </span>
        </div>
      </div>

      {/* Center Body: Modern Typographic Presentation */}
      <div className="relative z-10 my-auto text-center space-y-3 sm:space-y-4 py-2 sm:py-3">
        {/* Modern Eyebrow */}
        <div className="inline-block text-[10px] sm:text-[11px] font-black uppercase tracking-[0.22em] text-red-600 bg-red-50 border border-red-200/60 px-3.5 py-0.5 rounded-full">
          {language === "bn"
            ? data.tierTitleBn || "স্বেচ্ছায় রক্তদান সম্মাননা ও স্বীকৃতি"
            : data.tierTitleEn || "NATIONAL CITATION OF HUMANITARIAN HONOR"}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight leading-tight uppercase">
          {language === "bn"
            ? "স্বেচ্ছায় রক্তদান সম্মাননা সনদ"
            : "CERTIFICATE OF APPRECIATION"}
        </h1>

        {/* Preamble */}
        <p className="text-xs text-neutral-500 font-medium max-w-lg mx-auto">
          {language === "bn"
            ? "মানবতার কল্যাণে নিঃস্বার্থভাবে রক্তদান করার অনন্য অবদানের স্বীকৃতিস্বরূপ এই সনদ প্রদান করা হলো"
            : "Presented with highest gratitude and civic honor to voluntary blood donor"}
        </p>

        {/* Donor Name Display */}
        <div className="py-1">
          <h2 className="text-2xl sm:text-4xl font-black text-red-600 tracking-wide uppercase">
            {data.donorName}
          </h2>
          <div className="w-16 h-0.5 bg-red-500/40 mx-auto mt-2 rounded-full" />
        </div>

        {/* Citation text */}
        <p className="max-w-xl mx-auto text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal px-2">
          {language === "bn"
            ? data.citationBn ||
              "কোনো প্রকার পারিশ্রমিক ব্যতীত সম্পূর্ণ নিঃস্বার্থভাবে মুমূর্ষু রোগীর জীবন রক্ষার্থে স্বেচ্ছায় রক্তদান সম্পন্ন করে মানবতার উজ্জ্বল দৃষ্টান্ত স্থাপন করেছেন।"
            : data.citationEn ||
              "For voluntarily donating life-saving blood without remuneration, demonstrating exceptional civic virtue, empathy, and humanity in preservation of human life."}
        </p>

        {/* Modern 4-Column Clean Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto bg-neutral-50 rounded-xl p-2.5 sm:p-3 border border-neutral-200 text-left text-xs">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">
              {language === "bn" ? "রক্তের গ্রুপ" : "BLOOD GROUP"}
            </span>
            <span className="font-black text-red-600 text-sm block">
              {data.bloodGroup}
            </span>
          </div>

          <div>
            <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">
              {language === "bn" ? "রক্তের পরিমাণ" : "UNITS / VOL"}
            </span>
            <span className="font-bold text-neutral-800 text-xs sm:text-sm block">
              {data.units || 1} {language === "bn" ? "ব্যাগ (৪৫০ মি.লি.)" : "Bag (450 ml)"}
            </span>
          </div>

          <div>
            <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">
              {language === "bn" ? "হাসপাতাল" : "HOSPITAL"}
            </span>
            <span className="font-bold text-neutral-800 text-xs sm:text-sm truncate block" title={data.hospital}>
              {data.hospital}
            </span>
          </div>

          <div className="sm:text-right">
            <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">
              {language === "bn" ? "রক্তদানের তারিখ" : "DATE ISSUED"}
            </span>
            <span className="font-mono font-bold text-neutral-800 text-xs block">
              {formattedDate}
            </span>
          </div>
        </div>
      </div>

      {/* Modern Executive Footer: Signatures & Minimalist Seal */}
      <div className="relative z-10 pt-3 border-t border-neutral-100 flex items-end justify-between gap-4 text-xs">
        {/* Left: Medical Officer */}
        <div className="text-left space-y-0.5">
          <div className="h-7 flex items-center">
            <span className="font-serif italic font-bold text-neutral-800 text-sm sm:text-base">
              Dr. S. K. Haque
            </span>
          </div>
          <div className="w-28 sm:w-36 border-t border-neutral-300" />
          <span className="font-bold text-[10px] text-neutral-800 block">
            Dr. S. K. Haque, FCPS
          </span>
          <span className="text-[9px] text-neutral-400 block">
            {language === "bn" ? "প্রধান চিকিৎসা কর্মকর্তা" : "Chief Medical Officer"}
          </span>
        </div>

        {/* Center: Sleek Minimalist Stamp Seal */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-red-600/70 p-0.5 flex items-center justify-center relative shadow-xs">
            <div className="w-full h-full rounded-full border border-dashed border-red-500/50 flex flex-col items-center justify-center text-center p-1 bg-red-50/40">
              <span className="text-[6px] font-black uppercase tracking-widest text-red-600 leading-tight">
                BLOOD&LIFE
              </span>
              <span className="text-[8px] font-black text-neutral-900 leading-none my-0.5">
                ★ 2026 ★
              </span>
              <span className="text-[5.5px] font-bold uppercase tracking-wider text-neutral-500 leading-tight">
                AUTHENTIC
              </span>
            </div>
          </div>
        </div>

        {/* Right: National Registrar */}
        <div className="text-right space-y-0.5">
          <div className="h-7 flex items-center justify-end">
            <span className="font-serif italic font-bold text-neutral-800 text-sm sm:text-base">
              Tafsirul Islam
            </span>
          </div>
          <div className="w-28 sm:w-36 ml-auto border-t border-neutral-300" />
          <span className="font-bold text-[10px] text-neutral-800 block">
            Tafsirul Islam
          </span>
          <span className="text-[9px] text-neutral-400 block">
            {language === "bn" ? "পরিচালক, ন্যাশনাল রেজিস্ট্রি" : "Director, National Registry"}
          </span>
        </div>
      </div>
    </div>
  );
}
