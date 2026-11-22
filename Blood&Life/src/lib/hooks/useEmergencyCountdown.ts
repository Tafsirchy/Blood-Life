"use client";

import { useState, useEffect, useMemo } from "react";
import { getPersistentEmergencyDeadline } from "@/lib/emergencyDeadlines";

export type UrgencyTierLevel = 0 | 1 | 2 | 3 | 4;

export interface EmergencyCountdownState {
  totalSeconds: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  tier: UrgencyTierLevel;
  tierNameEn: string;
  tierNameBn: string;
  formattedCountdown: string;
  badgeClass: string;
  borderClass: string;
  pulseClass: string;
  isCodeRed: boolean;
  isMounted: boolean;
}

/**
 * Custom hook for live time-dependent emergency countdown and dynamic tier escalation.
 * Updates in real-time every 1000ms.
 * Resilient against background tab suspension and tab closing by calculating directly against
 * the target wall-clock epoch timestamp.
 */
export function useEmergencyCountdown(
  expiresAtInput?: Date | string | null,
  fallbackUrgency: "critical" | "urgent" | "standard" = "urgent",
  caseId?: string
): EmergencyCountdownState {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // Resolve target expiration timestamp
  const targetTimestamp = useMemo(() => {
    if (expiresAtInput) {
      const parsed = new Date(expiresAtInput).getTime();
      if (!isNaN(parsed)) return parsed;
    }

    if (caseId && typeof window !== "undefined") {
      const defaultMins = fallbackUrgency === "critical" ? 105 : fallbackUrgency === "urgent" ? 270 : 1440;
      const persistent = getPersistentEmergencyDeadline(caseId, defaultMins);
      const parsed = new Date(persistent).getTime();
      if (!isNaN(parsed)) return parsed;
    }

    // Relative fallback if no explicit expiresAt is provided
    const defaultHours = fallbackUrgency === "critical" ? 2 : fallbackUrgency === "urgent" ? 6 : 24;
    return Date.now() + defaultHours * 60 * 60 * 1000;
  }, [expiresAtInput, fallbackUrgency, caseId]);

  useEffect(() => {
    setMounted(true);
    // Instant wall-clock synchronization upon client mounting
    setNow(Date.now());

    // Continuous 1000ms real-time ticker
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    // Re-synchronize instantaneously when user switches back to tab or device wakes up
    const handleSync = () => {
      if (document.visibilityState === "visible") {
        setNow(Date.now());
      }
    };

    window.addEventListener("focus", handleSync);
    document.addEventListener("visibilitychange", handleSync);

    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", handleSync);
      document.removeEventListener("visibilitychange", handleSync);
    };
  }, []);

  const totalSeconds = Math.max(0, Math.floor((targetTimestamp - now) / 1000));
  const isExpired = totalSeconds <= 0;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Determine dynamic urgency tier
  let tier: UrgencyTierLevel = 4;
  let tierNameEn = "Standard Window";
  let tierNameBn = "পরিকল্পিত সময়";
  let badgeClass = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
  let borderClass = "border-zinc-200 dark:border-zinc-800";
  let pulseClass = "";
  let isCodeRed = false;

  if (isExpired) {
    tier = 0;
    tierNameEn = "Window Expired";
    tierNameBn = "সময়সীমা অতিক্রান্ত";
    badgeClass = "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
    borderClass = "border-zinc-300 dark:border-zinc-800 opacity-60";
  } else if (totalSeconds <= 1800) {
    // Tier 1: <= 30 mins (ICU Golden Half-Hour)
    tier = 1;
    tierNameEn = "ICU Golden Window";
    tierNameBn = "আইসিইউ গোল্ডেন আওয়ার";
    badgeClass = "bg-red-600 text-white border-red-700 animate-pulse font-black shadow-sm shadow-red-600/30";
    borderClass = "border-red-600 dark:border-red-500 ring-2 ring-red-500/30";
    pulseClass = "animate-ping";
    isCodeRed = true;
  } else if (totalSeconds <= 7200) {
    // Tier 2: 30 mins to 2 hours (Code Red Emergency)
    tier = 2;
    tierNameEn = "Code Red (Surgery Imminent)";
    tierNameBn = "জরুরী সার্জারি আসন্ন (কোড রেড)";
    badgeClass = "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 font-extrabold";
    borderClass = "border-red-500/80 dark:border-red-500/60";
    pulseClass = "animate-pulse";
    isCodeRed = true;
  } else if (totalSeconds <= 21600) {
    // Tier 3: 2 to 6 hours (Elevated Urgency)
    tier = 3;
    tierNameEn = "High Urgency";
    tierNameBn = "উচ্চ অগ্রাধিকার";
    badgeClass = "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold";
    borderClass = "border-amber-500/40 dark:border-amber-500/30";
  }

  // Format countdown string: e.g. "01h 42m 10s" or "24m 15s"
  let formattedCountdown = "";
  if (isExpired) {
    formattedCountdown = "00:00:00 (Expired)";
  } else if (hours > 0) {
    formattedCountdown = `${hours}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
  } else {
    formattedCountdown = `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  }

  return {
    totalSeconds,
    hours,
    minutes,
    seconds,
    isExpired,
    tier,
    tierNameEn,
    tierNameBn,
    formattedCountdown,
    badgeClass,
    borderClass,
    pulseClass,
    isCodeRed,
    isMounted: mounted,
  };
}
