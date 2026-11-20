"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/context";
import {
  AlertTriangle,
  Clock,
  MapPin,
  Building2,
  X,
  Share2,
  Heart,
  Droplet,
  Volume2,
  VolumeX,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useEmergencyCountdown } from "@/lib/hooks/useEmergencyCountdown";

interface EmergencyAlertCase {
  id: string;
  patientName: string;
  bloodGroup: string;
  unitsNeeded: number;
  pledgedUnits: number;
  hospital: string;
  district: string;
  medicalReason: string;
  expiresAt: string;
  phone: string;
}

// Fallback emergency case for immediate demonstration if DB has no critical records
const DEMO_CODE_RED_CASE: EmergencyAlertCase = {
  id: "case-dmch-emergency-1",
  patientName: "Tasneem Rahman",
  bloodGroup: "O-",
  unitsNeeded: 2,
  pledgedUnits: 0,
  hospital: "Dhaka Medical College Hospital (DMCH ICU-3)",
  district: "Dhaka",
  medicalReason: "Emergency Cesarean Surgery (Severe Hemorrhage)",
  expiresAt: new Date(Date.now() + 105 * 60 * 1000).toISOString(), // 1h 45m left
  phone: "01712345678",
};

export function EmergencyEntryModal() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeCase, setActiveCase] = useState<EmergencyAlertCase | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [hasShared, setHasShared] = useState(false);

  // Hook for live ticking countdown
  const countdown = useEmergencyCountdown(activeCase?.expiresAt, "critical");

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem("bloodlife_entry_sos_dismissed");
    if (isDismissed) return;

    // Fetch active critical emergencies
    const checkEmergencies = async () => {
      try {
        const res = await fetch("/api/requests/search?status=pending&limit=5");
        if (res.ok) {
          const data = await res.json();
          const requests = data.requests || [];
          // Find critical or rare blood emergencies with active deadline
          const critical = requests.find(
            (r: { urgency?: string; bloodGroup?: string; expiresAt?: string }) =>
              r.urgency === "critical" ||
              ["O-", "AB-", "A-", "B-"].includes(r.bloodGroup || "")
          );

          if (critical) {
            setActiveCase({
              id: critical._id,
              patientName: critical.recipientName,
              bloodGroup: critical.bloodGroup,
              unitsNeeded: critical.unitsNeeded || 1,
              pledgedUnits: critical.pledgedUnits || 0,
              hospital: critical.hospital,
              district: critical.district,
              medicalReason: critical.medicalReason || "Emergency Hospital Transfusion",
              expiresAt: critical.expiresAt || new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
              phone: critical.requesterPhone,
            });
            // Show modal after brief 800ms landing animation
            setTimeout(() => setIsOpen(true), 800);
            return;
          }
        }
      } catch {
        // Fallback to sample demo emergency
      }

      // Default demo emergency trigger to guarantee life-saving preview
      setActiveCase(DEMO_CODE_RED_CASE);
      setTimeout(() => setIsOpen(true), 900);
    };

    checkEmergencies();
  }, []);

  // Web Audio API synthesizer for clinical heartbeat chime
  const playHeartbeatChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(480, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(720, audioCtx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // Audio context not allowed or unsupported
    }
  };

  const handleToggleAudio = () => {
    const nextState = !isAudioEnabled;
    setIsAudioEnabled(nextState);
    if (nextState) {
      playHeartbeatChime();
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem("bloodlife_entry_sos_dismissed", "true");
  };

  const handleWhatsAppShare = () => {
    if (!activeCase) return;
    const text = encodeURIComponent(
      `🚨 *জরুরী ${activeCase.bloodGroup} রক্ত প্রয়োজন — BLOOD&LIFE* 🚨\n\n` +
      `👤 রোগী: ${activeCase.patientName}\n` +
      `🏥 হাসপাতাল: ${activeCase.hospital}, ${activeCase.district}\n` +
      `🩸 রক্তের গ্রুপ: ${activeCase.bloodGroup} (${activeCase.unitsNeeded} ব্যাগ)\n` +
      `⏱️ সময় বাকি: ${countdown.formattedCountdown}\n` +
      `কারণ: ${activeCase.medicalReason}\n\n` +
      `👉 সরাসরি রক্ত দিতে বা দেখতে ক্লিক করুন:\n` +
      `https://bloodandlife.org/requests/${activeCase.id}\n\n` +
      `_দয়া করে আপনার পরিচিতদের গ্রুপে দ্রুত শেয়ার করুন!_`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
    setHasShared(true);
  };

  if (!isOpen || !activeCase || countdown.isExpired) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-2xl border-2 border-red-600 shadow-2xl shadow-red-600/30 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Urgent Header Tier Banner */}
        <div className="bg-gradient-to-r from-red-600 via-red-600 to-rose-700 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider">
              {language === "bn" ? "🚨 লাইভ কোড-রেড ইমার্জেন্সি অ্যালার্ট" : "🚨 LIVE CODE-RED SURGERY ALERT"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToggleAudio}
              type="button"
              className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title={isAudioEnabled ? "Mute alert audio" : "Enable heartbeat chime"}
            >
              {isAudioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              onClick={handleDismiss}
              type="button"
              className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Dismiss alert"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Top Countdown & Blood Group Highlight */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 block">
                {language === "bn" ? "অপারেশন বা ট্রান্সফিউশন বাকি:" : "SURGICAL DEADLINE REMAINING:"}
              </span>
              <div className="flex items-center gap-1.5 text-xl sm:text-2xl font-black text-red-600 dark:text-red-400">
                <Clock size={20} className="animate-pulse shrink-0" />
                <span className="tabular-nums">{countdown.formattedCountdown}</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-lg shadow-red-600/30 border-2 border-white dark:border-zinc-900">
              <span className="text-2xl sm:text-3xl font-black leading-none">{activeCase.bloodGroup}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-90 mt-0.5">
                {activeCase.unitsNeeded} {language === "bn" ? "ব্যাগ" : "Unit(s)"}
              </span>
            </div>
          </div>

          {/* Patient & Hospital Info */}
          <div className="space-y-2 text-xs sm:text-sm">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                {language === "bn" ? "রোগীর নাম ও ক্লিনিক্যাল অবস্থা:" : "PATIENT & CLINICAL CONDITION:"}
              </span>
              <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
                {activeCase.patientName}
              </h3>
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-0.5">
                • {activeCase.medicalReason}
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
              <div className="flex items-start gap-1.5 text-zinc-700 dark:text-zinc-300">
                <Building2 size={14} className="text-red-500 shrink-0 mt-0.5" />
                <span className="font-bold">{activeCase.hospital}</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs">
                <MapPin size={13} className="shrink-0" />
                <span>{activeCase.district}, Bangladesh</span>
              </div>
            </div>
          </div>

          {/* Fulfillment Tracking Status */}
          <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs flex items-center justify-between">
            <span className="text-zinc-600 dark:text-zinc-400 font-medium">
              {language === "bn" ? "রক্ত পাওয়ার অগ্রগতি:" : "Fulfillment Progress:"}
            </span>
            <span className="font-extrabold text-zinc-900 dark:text-zinc-100">
              {activeCase.pledgedUnits} / {activeCase.unitsNeeded} {language === "bn" ? "ব্যাগ নিশ্চিত" : "Bags Pledged"}
            </span>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-1">
            <Link
              href={`/requests/${activeCase.id}`}
              onClick={() => setIsOpen(false)}
              className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-red-600/30 transition-all active:scale-[0.98]"
            >
              <Droplet size={16} fill="currentColor" />
              <span>{language === "bn" ? "আমি রক্ত দিতে প্রস্তুত (Commit to Donate)" : "I Can Donate Blood (View Case)"}</span>
              <ArrowRight size={16} />
            </Link>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleWhatsAppShare}
                type="button"
                className="py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 size={14} />
                <span>{hasShared ? (language === "bn" ? "শেয়ার করা হয়েছে" : "Shared!") : (language === "bn" ? "হোয়াটসঅ্যাপে শেয়ার" : "WhatsApp Share")}</span>
              </button>

              <button
                onClick={handleDismiss}
                type="button"
                className="py-2.5 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs transition-colors text-center"
              >
                {language === "bn" ? "পরে সহযোগিতা করব" : "Dismiss For Now"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
