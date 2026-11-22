"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface UrgentAlert {
  id: string;
  patient: string;
  hospital: { en: string; bn: string };
  bloodGroup: string;
  units: number;
  reason: { en: string; bn: string };
  district: { en: string; bn: string };
}

const DEFAULT_ALERTS: UrgentAlert[] = [
  {
    id: "1",
    patient: "Kamal Hossain",
    hospital: { en: "Dhaka Medical College Hospital", bn: "ঢাকা মেডিকেল কলেজ হাসপাতাল" },
    bloodGroup: "O-",
    units: 2,
    reason: { en: "Emergency ICU", bn: "জরুরি আইসিইউ" },
    district: { en: "Dhaka", bn: "ঢাকা" },
  },
  {
    id: "2",
    patient: "Fatima Begum",
    hospital: { en: "Chittagong Medical College (ICU)", bn: "চট্টগ্রাম মেডিকেল কলেজ (আইসিইউ)" },
    bloodGroup: "AB-",
    units: 1,
    reason: { en: "Cardiac OT", bn: "কার্ডিয়াক ওটি" },
    district: { en: "Chittagong", bn: "চট্টগ্রাম" },
  },
  {
    id: "3",
    patient: "Abdur Rahim",
    hospital: { en: "Rajshahi Sadar Hospital", bn: "রাজশাহী সদর হাসপাতাল" },
    bloodGroup: "B-",
    units: 2,
    reason: { en: "Post-Accident Surgery", bn: "জরুরি সার্জারি" },
    district: { en: "Rajshahi", bn: "রাজশাহী" },
  },
  {
    id: "4",
    patient: "Nasreen Akter",
    hospital: { en: "Sylhet MAG Osmani Medical", bn: "সিলেট এমএজি ওসমানী মেডিকেল" },
    bloodGroup: "A-",
    units: 1,
    reason: { en: "Thalassemia Crisis", bn: "থ্যালাসেমিয়া" },
    district: { en: "Sylhet", bn: "সিলেট" },
  },
  {
    id: "5",
    patient: "Siddiqur Rahman",
    hospital: { en: "Sir Salimullah Medical (Mitford)", bn: "স্যার সলিমুল্লাহ মেডিকেল (মিটফোর্ড)" },
    bloodGroup: "O+",
    units: 3,
    reason: { en: "Vascular Emergency", bn: "জরুরি রক্তক্ষরণ" },
    district: { en: "Dhaka", bn: "ঢাকা" },
  },
  {
    id: "6",
    patient: "Tahmina Khatun",
    hospital: { en: "Mymensingh Medical College", bn: "ময়মনসিংহ মেডিকেল কলেজ" },
    bloodGroup: "B+",
    units: 2,
    reason: { en: "Maternity OT", bn: "প্রসূতি ওটি" },
    district: { en: "Mymensingh", bn: "ময়মনসিংহ" },
  },
  {
    id: "7",
    patient: "Asaduzzaman Noor",
    hospital: { en: "Rangpur Medical College", bn: "রংপুর মেডিকেল কলেজ" },
    bloodGroup: "AB+",
    units: 1,
    reason: { en: "Burn Unit Trauma", bn: "বার্ন ইউনিট ট্রমা" },
    district: { en: "Rangpur", bn: "রংপুর" },
  },
];

export function EmergencyPulseRibbon() {
  const { language } = useLanguage();
  const [alerts, setAlerts] = useState<UrgentAlert[]>(DEFAULT_ALERTS);

  useEffect(() => {
    let isSubscribed = true;

    async function fetchLiveBroadcasts() {
      try {
        const res = await fetch("/api/requests/search?status=pending&limit=10");
        if (res.ok) {
          const data = await res.json();
          if (isSubscribed && data.requests && data.requests.length > 0) {
            const live: UrgentAlert[] = data.requests.map((r: any) => ({
              id: String(r._id),
              patient: r.recipientName,
              hospital: { en: r.hospital, bn: r.hospital },
              bloodGroup: r.bloodGroup,
              units: r.unitsNeeded || 1,
              reason: {
                en: r.medicalReason || r.bloodComponent || "Emergency Hospital Transfusion",
                bn: r.medicalReason || "জরুরি ট্রান্সফিউশন",
              },
              district: { en: r.district, bn: r.district },
            }));
            setAlerts(live);
          }
        }
      } catch {
        // Fallback to DEFAULT_ALERTS
      }
    }

    fetchLiveBroadcasts();

    return () => {
      isSubscribed = false;
    };
  }, []);

  // Duplicate list to guarantee seamless 100% infinite continuous scrolling
  const marqueeItems = [...alerts, ...alerts];

  return (
    <>
      {/* Self-contained, foolproof marquee animation styles to guarantee smooth scrolling */}
      <style>{`
        @keyframes emergencyMarqueeScroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .emergency-marquee-track {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: emergencyMarqueeScroll 34s linear infinite;
        }
        .emergency-marquee-container:hover .emergency-marquee-track,
        .emergency-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Redesigned Clean White Background with Crisp Red Bottom Borderline */}
      <aside
        aria-label="Live Emergency Blood Requests Ticker"
        className="bg-white dark:bg-zinc-900 border-b-2 border-red-600 dark:border-red-500 text-zinc-800 dark:text-zinc-100 py-1.5 px-3 sm:px-4 overflow-hidden relative select-none shadow-xs z-30 transition-colors"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
          {/* Left Fixed Beacon / Label - Soothing light red pill */}
          <div className="flex items-center gap-2 shrink-0 z-20">
            <div className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-red-200/80 dark:border-red-800/60 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
              </span>
              <span className="hidden xs:inline">
                {language === "bn" ? "জরুরি রক্তের আবেদন" : "URGENT BLOOD CASES"}
              </span>
              <span className="xs:hidden">
                {language === "bn" ? "জরুরি" : "LIVE"}
              </span>
            </div>

            <span className="hidden md:inline-flex items-center text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700">
              {language === "bn" ? `${alerts.length}টি লাইভ কেস` : `${alerts.length} Live`}
            </span>
          </div>

          {/* Center Infinite Marquee Container */}
          <div className="flex-1 overflow-hidden relative mx-1 sm:mx-2 emergency-marquee-container">
            {/* Soft Edge Gradient Fade Masks (White in Light mode, Dark Zinc in Dark mode) */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-12 z-10 bg-gradient-to-r from-white dark:from-zinc-900 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-12 z-10 bg-gradient-to-l from-white dark:from-zinc-900 to-transparent" />

            {/* Continuous Scrolling Track */}
            <div className="emergency-marquee-track flex items-center gap-6 py-0.5 whitespace-nowrap">
              {marqueeItems.map((alert, index) => (
                <Link
                  key={`${alert.id}-${index}`}
                  href={alert.id.length > 5 ? `/requests/${alert.id}` : `/search?bloodGroup=${encodeURIComponent(alert.bloodGroup)}`}
                  className="shrink-0 inline-flex items-center gap-2 group hover:bg-zinc-100 dark:hover:bg-zinc-800/70 px-2.5 py-1 rounded-md transition-all cursor-pointer"
                  title={`${alert.hospital[language]} — ${alert.reason[language]}`}
                >
                  {/* Clean Blood Group Pill: Vivid yet gentle red */}
                  <span className="px-2 py-0.5 rounded-md bg-red-600 text-white font-black text-xs shadow-xs group-hover:bg-red-700 group-hover:scale-105 transition-all">
                    {alert.bloodGroup}
                  </span>

                  {/* Hospital & Location: Crisp, high-contrast, eye-friendly typography */}
                  <span className="text-xs sm:text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    {alert.hospital[language]}
                  </span>

                  {/* Medical Reason tag */}
                  <span className="hidden sm:inline-block text-[10px] font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded">
                    {alert.reason[language]}
                  </span>

                  {/* Units needed in bold red accent */}
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">
                    — {alert.units} {language === "bn" ? "ব্যাগ প্রয়োজন" : "unit(s) needed"}
                  </span>

                  {/* Subtle divider */}
                  <span className="text-zinc-300 dark:text-zinc-700 text-xs pl-4 select-none">|</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Action Anchor - Clean, professional, low-stress button */}
          <Link
            href="/search"
            className="shrink-0 text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5 transition-all z-20 active:scale-95"
          >
            <span>{language === "bn" ? "সব দেখুন" : "View All"}</span>
            <ArrowRight size={13} className="text-zinc-300 dark:text-zinc-600 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </aside>
    </>
  );
}