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
      month: "long",
      year: "numeric",
    }
  );

  return (
    <div
      id="printable-cert"
      className={`relative bg-[#FFFDF9] text-neutral-900 border-[6px] border-double border-[#991B1B] p-6 sm:p-10 shadow-2xl rounded-2xl overflow-hidden print:m-0 print:border-[4px] print:rounded-none print:shadow-none ${className}`}
      style={{
        boxShadow: "0 20px 40px -15px rgba(153, 27, 27, 0.15), 0 0 0 1px rgba(180, 83, 9, 0.25)",
      }}
    >
      {/* Decorative Inner Gold Pin-Stripe Border */}
      <div className="absolute inset-2 sm:inset-3 border border-[#B45309]/40 pointer-events-none rounded-xl" />
      <div className="absolute inset-3.5 sm:inset-4.5 border border-[#991B1B]/20 pointer-events-none rounded-lg" />

      {/* Classical Certificate Corner Ornaments (SVG) */}
      {/* Top-Left Corner */}
      <svg
        className="absolute top-4 left-4 w-12 h-12 text-[#B45309] pointer-events-none opacity-85"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
      >
        <path d="M 0,0 L 45,0 C 25,5 15,15 15,35 L 15,100" strokeWidth="2.5" />
        <path d="M 0,0 L 0,45 C 5,25 15,15 35,15 L 100,15" strokeWidth="2.5" />
        <circle cx="15" cy="15" r="4" fill="currentColor" />
        <path d="M 28,28 C 36,20 45,20 52,28 C 60,36 60,45 52,52 C 45,60 36,60 28,52 Z" strokeWidth="1.5" />
      </svg>

      {/* Top-Right Corner */}
      <svg
        className="absolute top-4 right-4 w-12 h-12 text-[#B45309] pointer-events-none opacity-85 scale-x-[-1]"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
      >
        <path d="M 0,0 L 45,0 C 25,5 15,15 15,35 L 15,100" strokeWidth="2.5" />
        <path d="M 0,0 L 0,45 C 5,25 15,15 35,15 L 100,15" strokeWidth="2.5" />
        <circle cx="15" cy="15" r="4" fill="currentColor" />
        <path d="M 28,28 C 36,20 45,20 52,28 C 60,36 60,45 52,52 C 45,60 36,60 28,52 Z" strokeWidth="1.5" />
      </svg>

      {/* Bottom-Left Corner */}
      <svg
        className="absolute bottom-4 left-4 w-12 h-12 text-[#B45309] pointer-events-none opacity-85 scale-y-[-1]"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
      >
        <path d="M 0,0 L 45,0 C 25,5 15,15 15,35 L 15,100" strokeWidth="2.5" />
        <path d="M 0,0 L 0,45 C 5,25 15,15 35,15 L 100,15" strokeWidth="2.5" />
        <circle cx="15" cy="15" r="4" fill="currentColor" />
        <path d="M 28,28 C 36,20 45,20 52,28 C 60,36 60,45 52,52 C 45,60 36,60 28,52 Z" strokeWidth="1.5" />
      </svg>

      {/* Bottom-Right Corner */}
      <svg
        className="absolute bottom-4 right-4 w-12 h-12 text-[#B45309] pointer-events-none opacity-85 scale-[-1]"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
      >
        <path d="M 0,0 L 45,0 C 25,5 15,15 15,35 L 15,100" strokeWidth="2.5" />
        <path d="M 0,0 L 0,45 C 5,25 15,15 35,15 L 100,15" strokeWidth="2.5" />
        <circle cx="15" cy="15" r="4" fill="currentColor" />
        <path d="M 28,28 C 36,20 45,20 52,28 C 60,36 60,45 52,52 C 45,60 36,60 28,52 Z" strokeWidth="1.5" />
      </svg>

      {/* Faint Guilloche Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
        <svg viewBox="0 0 400 400" className="w-[380px] h-[380px] text-neutral-900" fill="none" stroke="currentColor">
          <circle cx="200" cy="200" r="180" strokeWidth="2" strokeDasharray="6 4" />
          <circle cx="200" cy="200" r="150" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="120" strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="200" cy="200" r="90" strokeWidth="1" />
          <path
            d="M 200,60 C 230,130 270,170 270,220 C 270,265 238,295 200,295 C 162,295 130,265 130,220 C 130,170 170,130 200,60 Z"
            strokeWidth="3"
          />
        </svg>
      </div>

      {/* Certificate Content Body */}
      <div className="relative z-10 text-center space-y-4 sm:space-y-5">
        {/* Institutional Top Brand Header */}
        <div className="flex flex-col items-center justify-center space-y-1.5">
          <img
            src="/logo.png"
            alt="Blood&Life"
            className="h-9 sm:h-11 w-auto object-contain mx-auto"
          />
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em] text-[#991B1B]">
            CENTRAL BLOOD DISPATCH & TRANSFUSION REGISTRY • BANGLADESH
          </div>
          <div className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase">
            EST. 2026 • OFFICIAL RECOGNITION DIVISION • VERIFIED RECORD
          </div>
        </div>

        {/* Decorative Golden Ribbon Badge */}
        <div className="inline-flex items-center gap-3 px-5 py-1 rounded-full bg-[#FEF3C7] border border-[#B45309]/40 text-[#92400E] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em]">
          <span>★</span>
          <span>
            {language === "bn"
              ? data.tierTitleBn || "স্বেচ্ছায় রক্তদান সম্মাননা ও স্বীকৃতি"
              : data.tierTitleEn || "NATIONAL RECOGNITION FOR VOLUNTARY TRANSFUSION"}
          </span>
          <span>★</span>
        </div>

        {/* Certificate Title Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-serif font-black text-neutral-900 tracking-tight leading-tight">
            {language === "bn"
              ? "সম্মাননা ও কৃতজ্ঞতা সনদ"
              : "CERTIFICATE OF APPRECIATION"}
          </h1>
          <p className="text-xs sm:text-sm font-serif italic text-neutral-600">
            {language === "bn"
              ? "মানবতার কল্যাণে নিঃস্বার্থ রক্তদানের জন্য প্রদত্ত"
              : "Presented in grateful recognition of voluntary, unremunerated blood donation"}
          </p>
        </div>

        {/* Formal Preamble */}
        <div className="max-w-xl mx-auto text-xs text-neutral-600 font-serif leading-relaxed">
          {language === "bn"
            ? "অত্যন্ত শ্রদ্ধা ও আন্তরিক কৃতজ্ঞতার সাথে এই মর্মে প্রত্যয়ন করা যাচ্ছে যে,"
            : "This is to certify with profound gratitude and highest civic honor that,"}
        </div>

        {/* Honoree / Recipient Name */}
        <div className="py-2.5 sm:py-3 border-y-2 border-[#B45309]/30 max-w-2xl mx-auto my-2">
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-[#991B1B] tracking-wide uppercase">
            {data.donorName}
          </h2>
          <div className="text-xs sm:text-sm font-serif text-neutral-700 mt-1 font-semibold">
            {language === "bn" ? "রক্তের গ্রুপ: " : "Blood Group: "}
            <span className="font-sans font-black text-[#991B1B] text-base px-2 py-0.5 rounded bg-red-50 border border-red-200 inline-block ml-1">
              {data.bloodGroup}
            </span>
            <span className="mx-2 text-neutral-400">|</span>
            <span>
              {language === "bn"
                ? `পরিমাণ: ${data.units || 1} ব্যাগ (৪৫০ মি.লি.)`
                : `Volume: ${data.units || 1} Unit (450 ml)`}
            </span>
          </div>
        </div>

        {/* Formal Citation Text */}
        <p className="max-w-2xl mx-auto text-xs sm:text-sm font-serif text-neutral-700 leading-relaxed italic px-4">
          {language === "bn"
            ? data.citationBn ||
              "কোনো প্রকার আর্থিক বিনিময় ব্যতীত সম্পূর্ণ নিঃস্বার্থভাবে মুমূর্ষু রোগীর জীবন রক্ষার্থে স্বেচ্ছায় রক্তদান সম্পন্ন করে মানবিক সংহতি ও মানবতার এক অনন্য উজ্জ্বল দৃষ্টান্ত স্থাপন করেছেন। তাঁর এই অবদান জাতির নিকট চিরস্মরণীয়।"
            : data.citationEn ||
              "Has selflessly completed a voluntary, unremunerated blood donation to save the life of an emergency patient, demonstrating exceptional civic virtue, compassion, and the highest ideals of humanitarian service."}
        </p>

        {/* Archival Clinical Details Box (Strict, clean, institutional layout) */}
        <div className="max-w-2xl mx-auto bg-amber-50/40 rounded-xl border border-[#B45309]/30 p-3 sm:p-4 text-xs font-serif text-neutral-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-500 block">
                {language === "bn" ? "হাসপাতাল ও চিকিৎসা কেন্দ্র:" : "Hospital / Medical Center:"}
              </span>
              <span className="font-bold text-neutral-900 block text-xs sm:text-sm">
                {data.hospital}
                {data.district ? `, ${data.district}` : ""}
              </span>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-500 block">
                {language === "bn" ? "রক্তদানের তারিখ ও রেজিস্ট্রি কোড:" : "Transfusion Date & Record ID:"}
              </span>
              <span className="font-mono font-bold text-neutral-900 block text-xs">
                {formattedDate} • #{data.certificateId}
              </span>
            </div>
          </div>

          {/* Validation note */}
          {data.recipientVerified && (
            <div className="mt-2.5 pt-2 border-t border-[#B45309]/20 text-[11px] text-neutral-600 flex items-center justify-between">
              <span className="font-sans font-semibold text-emerald-800">
                ✓ {language === "bn" ? "গ্রহীতা পরিবার ও হাসপাতাল কর্তৃক ডিজিটাল ভেরিফাইড" : "Digitally Verified by Recipient Family & Hospital Desk"}
              </span>
              <span className="font-mono text-[10px] text-neutral-500 uppercase">
                Status: AUTHENTICATED
              </span>
            </div>
          )}
        </div>

        {/* Bottom Section: Formal Signatures & Golden Seal */}
        <div className="pt-6 sm:pt-8 grid grid-cols-3 items-end gap-2 sm:gap-4 max-w-2xl mx-auto">
          {/* Left Signature: Medical Officer */}
          <div className="text-center space-y-1">
            <div className="h-10 flex items-center justify-center">
              <svg className="w-28 h-8 text-neutral-800" viewBox="0 0 120 35">
                <path
                  d="M 5,25 Q 25,5 40,20 T 70,12 T 95,26 T 115,15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="w-32 sm:w-40 mx-auto border-t border-neutral-700" />
            <span className="font-serif font-bold text-[11px] sm:text-xs text-neutral-900 block">
              Dr. S. K. Haque, FCPS
            </span>
            <span className="text-[9px] font-sans text-neutral-500 block leading-tight">
              {language === "bn" ? "প্রধান চিকিৎসা কর্মকর্তা (রক্ত পরিসঞ্চালন)" : "Chief Medical Officer (Transfusion)"}
            </span>
          </div>

          {/* Center: Official Golden Embossed Seal of Authenticity */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center">
              {/* Gold Ribbon Tails behind seal */}
              <div className="absolute top-10 flex gap-1 pointer-events-none">
                <div
                  className="w-4 h-9 bg-linear-to-b from-[#B45309] to-[#78350F]"
                  style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)" }}
                />
                <div
                  className="w-4 h-9 bg-linear-to-b from-[#991B1B] to-[#5A0E0E]"
                  style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)" }}
                />
              </div>

              {/* Medallion Badge */}
              <div
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-full relative z-10 p-1 flex items-center justify-center shadow-lg"
                style={{
                  background: "radial-gradient(circle, #FDE68A 0%, #D97706 60%, #92400E 100%)",
                  boxShadow: "0 4px 14px rgba(180, 83, 9, 0.4), inset 0 0 4px rgba(255, 255, 255, 0.8)",
                }}
              >
                {/* Inner Serrated Ring */}
                <div className="w-full h-full rounded-full border-2 border-dashed border-[#78350F] flex flex-col items-center justify-center p-1 text-center">
                  <div className="text-[7px] font-black uppercase tracking-widest text-[#78350F] leading-tight">
                    BLOOD&LIFE
                  </div>
                  <div className="text-xs font-black text-[#5A0E0E] my-0.5">
                    ★ SEAL ★
                  </div>
                  <div className="text-[6px] font-black uppercase tracking-wider text-[#78350F] leading-tight">
                    OFFICIAL MERIT
                  </div>
                  <div className="text-[6px] font-mono text-[#991B1B] font-bold">
                    2026
                  </div>
                </div>
              </div>
            </div>
            <span className="text-[8px] font-mono uppercase tracking-widest text-neutral-500 mt-5 block">
              AUTHENTIC SEAL
            </span>
          </div>

          {/* Right Signature: Operations Director & QR Hash */}
          <div className="text-center space-y-1">
            <div className="h-10 flex items-center justify-center">
              <svg className="w-28 h-8 text-neutral-800" viewBox="0 0 120 35">
                <path
                  d="M 10,20 Q 30,28 45,10 T 75,24 T 100,10 T 115,22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="w-32 sm:w-40 mx-auto border-t border-neutral-700" />
            <span className="font-serif font-bold text-[11px] sm:text-xs text-neutral-900 block">
              Tafsirul Islam
            </span>
            <span className="text-[9px] font-sans text-neutral-500 block leading-tight">
              {language === "bn" ? "পরিচালক, ন্যাশনাল ব্লাড রেজিস্ট্রি" : "Director, National Blood Registry"}
            </span>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="pt-4 border-t border-neutral-300 flex items-center justify-between text-[9px] font-mono text-neutral-500">
          <div>
            REGISTRY REFERENCE: BL-DOC-{data.certificateId}
          </div>
          <div className="hidden sm:block">
            SECURITY HASH: SHA-256 CLINICAL VERIFICATION
          </div>
          <div>
            BLOODANDLIFE.COM
          </div>
        </div>
      </div>
    </div>
  );
}
