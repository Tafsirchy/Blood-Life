"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import {
  Heart,
  Calendar,
  Award,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ExternalLink,
  Printer,
  Sparkles,
} from "lucide-react";

interface DonationRecord {
  id: string;
  patientName: string;
  hospital: string;
  district: string;
  date: string;
  units: number;
  status: "COMPLETED";
}

const SAMPLE_DONATIONS: DonationRecord[] = [
  {
    id: "tx-881",
    patientName: "Tasneem Rahman",
    hospital: "Dhaka Medical College Hospital",
    district: "Dhaka",
    date: "14 Oct 2025",
    units: 1,
    status: "COMPLETED",
  },
  {
    id: "tx-720",
    patientName: "Kamal Hossain",
    hospital: "Bangabandhu Sheikh Mujib Medical Univ",
    district: "Dhaka",
    date: "10 Jul 2025",
    units: 1,
    status: "COMPLETED",
  },
  {
    id: "tx-615",
    patientName: "Ayesha Siddiqua",
    hospital: "Dhaka Shishu Hospital",
    district: "Dhaka",
    date: "04 Apr 2025",
    units: 1,
    status: "COMPLETED",
  },
];

export function DonorCockpit() {
  const { language } = useLanguage();
  const [selectedCert, setSelectedCert] = useState<DonationRecord | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUserProfile(d.user);
      })
      .catch(() => {});
  }, []);

  // Biological Cooldown Calculation
  const totalCooldownDays = 90;
  let elapsedDays = 90;
  let remainingDays = 0;
  let progressPercent = 100;
  let nextEligibleDate = language === "bn" ? "আজই প্রস্তুত" : "Eligible Today";

  if (userProfile?.lastDonationDate) {
    const lastDate = new Date(userProfile.lastDonationDate).getTime();
    elapsedDays = Math.max(0, Math.floor((Date.now() - lastDate) / (1000 * 60 * 60 * 24)));
    if (elapsedDays < 90) {
      remainingDays = totalCooldownDays - elapsedDays;
      progressPercent = Math.round((elapsedDays / totalCooldownDays) * 100);
      const nextDate = new Date(lastDate + 90 * 24 * 60 * 60 * 1000);
      nextEligibleDate = nextDate.toLocaleDateString();
    }
  }

  const totalDonations = userProfile?.totalDonations || 0;
  const livesSaved = totalDonations * 3;

  // SVG Dial Circumference
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Cards: 90-Day Cooldown Dial + Lifetime Impact */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Cooldown Circular Dial (6 cols) */}
        <div className="md:col-span-6 card-clinical p-6 flex flex-col sm:flex-row items-center gap-6 justify-between border-2 border-amber-500/30">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
              <Clock size={11} className="animate-spin" />
              <span>{language === "bn" ? "স্বাস্থ্য বিরতি প্রটোকল" : "SAFE COOLDOWN ENGINE"}</span>
            </div>
            <h3 className="text-lg font-black text-[var(--text-primary)]">
              {language === "bn" ? "৯০ দিনের বৈজ্ঞানিক বিরতি" : "90-Day Biological Cooldown"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-xs">
              {language === "bn"
                ? `আপনার শরীরের হিমোগ্লোবিন ও আয়রন সম্পূর্ণ স্বাভাবিক হতে আর ${remainingDays} দিন বাকি।`
                : `${remainingDays} days remaining until your iron and hemoglobin reserves fully replenish.`}
            </p>
            <div className="pt-2 text-xs font-bold text-amber-500">
              {language === "bn" ? `পরবর্তী রক্তদান: ${nextEligibleDate}` : `Next Eligible: ${nextEligibleDate}`}
            </div>
          </div>

          {/* Dial Graphic */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="text-[var(--border-subtle)] stroke-current"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="text-amber-500 stroke-current transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-[var(--text-primary)]">
                {remainingDays}d
              </span>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">
                {language === "bn" ? "বাকি আছে" : "remaining"}
              </span>
            </div>
          </div>
        </div>

        {/* Lifetime Impact Statistics (6 cols) */}
        <div className="md:col-span-6 card-clinical p-6 flex flex-col justify-between border-2 border-red-500/30">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider mb-2">
              <Award size={12} />
              <span>{language === "bn" ? "লাইফ সেভার অনার রোল" : "DONOR HONOR ROLL"}</span>
            </div>
            <h3 className="text-lg font-black text-[var(--text-primary)] mb-1">
              {language === "bn" ? "আপনার জীবন বাঁচানোর পরিসংখ্যান" : "Your Lifetime Blood Impact"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {language === "bn"
                ? "স্বেচ্ছায় রক্তদানে আপনার অবদানে আজ বেঁচে আছে ৩টি পরিবার।"
                : "Your voluntary donations have directly saved the lives of 3 critical patients."}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <div className="p-2.5 rounded-lg bg-[var(--bg-main)] text-center">
              <span className="text-xl font-black text-red-500 block">{totalDonations}</span>
              <span className="text-[10px] font-bold text-[var(--text-muted)]">
                {language === "bn" ? "বার রক্তদান" : "Donations"}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--bg-main)] text-center">
              <span className="text-xl font-black text-emerald-500 block">{livesSaved}</span>
              <span className="text-[10px] font-bold text-[var(--text-muted)]">
                {language === "bn" ? "জীবন রক্ষা" : "Lives Saved"}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--bg-main)] text-center">
              <span className="text-xl font-black text-blue-500 block">{userProfile?.bloodGroup || "O+"}</span>
              <span className="text-[10px] font-bold text-[var(--text-muted)]">
                {language === "bn" ? "ব্লাড গ্রুপ" : "Blood Group"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Timeline & Certificate Downloader */}
      <div className="card-clinical p-6 border border-[var(--border-subtle)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <h3 className="text-base font-black text-[var(--text-primary)]">
              {language === "bn" ? "রক্তদানের ইতিহাস ও ডিজিটাল সার্টিফিকেট" : "Donation Timeline & Digital Certificate"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {language === "bn"
                ? "প্রত্যেকটি সফল রক্তদানের জন্য জাতীয় জীবন রক্ষাকারী ডিজিটাল সার্টিফিকেট ডাউনলোড করুন।"
                : "Generate and download official vector certificates of appreciation for each completed transfusion."}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {(!userProfile?.totalDonations || userProfile.totalDonations === 0) ? (
            <div className="p-8 text-center rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-2">
              <Award size={32} className="text-[var(--text-muted)] mx-auto opacity-40" />
              <h4 className="text-xs font-bold text-[var(--text-primary)]">
                {language === "bn" ? "এখনও কোনো রক্তদান সম্পন্ন হয়নি" : "No Completed Donations Yet"}
              </h4>
              <p className="text-[11px] text-[var(--text-muted)] max-w-sm mx-auto">
                {language === "bn"
                  ? "জরুরী রক্তদান সম্পন্ন করার পর এখানে আপনার ভেরিফাইড সার্টিফিকেট যুক্ত হবে।"
                  : "Official vector appreciation certificates will appear here after your first completed transfusion."}
              </p>
            </div>
          ) : (
            SAMPLE_DONATIONS.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-red-500/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Heart size={18} fill="currentColor" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">
                    {item.patientName} • {item.hospital}
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-2 mt-0.5 font-medium">
                    <span>{item.date}</span>
                    <span>•</span>
                    <span>{item.district}</span>
                    <span>•</span>
                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                      <CheckCircle2 size={11} />
                      {language === "bn" ? "ভেরিফাইড রক্তদান" : "Verified"}
                    </span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCert(item)}
                className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-red-500/10 border border-[var(--border-subtle)] text-xs font-bold text-red-500 inline-flex items-center gap-1.5 self-start sm:self-auto transition-colors"
              >
                <Award size={13} />
                <span>{language === "bn" ? "সার্টিফিকেট দেখুন" : "View Certificate"}</span>
              </button>
            </div>
          )))}
        </div>
      </div>

      {/* Vector Printable Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="card-clinical max-w-2xl w-full p-6 sm:p-8 space-y-6 relative border-4 border-amber-500/30">
            {/* Certificate Canvas */}
            <div
              id="printable-cert"
              className="p-8 rounded-2xl bg-gradient-to-b from-amber-50/20 via-[var(--bg-surface)] to-amber-50/10 border-2 border-amber-500/40 text-center relative overflow-hidden"
            >
              <Sparkles size={32} className="text-amber-500/40 mx-auto mb-2" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 block mb-1">
                NATIONAL HERO CERTIFICATE OF APPRECIATION
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight mb-2">
                ব্লাড অ্যান্ড লাইফ লাইফ-সেভার স্বীকৃতি
              </h2>
              <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto mb-6">
                This certifies with highest gratitude that the voluntary donor selflessly donated blood to preserve a human life.
              </p>

              <div className="py-4 border-y border-[var(--border-subtle)] my-4 space-y-1">
                <span className="text-xs text-[var(--text-muted)] block">Awarded to Voluntary Donor</span>
                <span className="text-xl font-black text-red-500">Tafsirul Islam</span>
                <span className="text-xs font-bold text-[var(--text-secondary)] block">
                  Blood Group: O- (Universal Hero) • 1 Unit
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left text-xs pt-2">
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] block">Patient & Hospital:</span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {selectedCert.patientName} ({selectedCert.hospital})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[var(--text-muted)] block">Date & Certificate ID:</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">
                    {selectedCert.date} • #{selectedCert.id.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-main)] border border-[var(--border-subtle)]"
              >
                {language === "bn" ? "বন্ধ করুন" : "Close"}
              </button>
              <button
                onClick={handlePrintCertificate}
                className="btn-emergency !py-2 !px-4 text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Printer size={14} />
                <span>{language === "bn" ? "প্রিন্ট বা পিডিএফ সেভ" : "Print / Save PDF"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
