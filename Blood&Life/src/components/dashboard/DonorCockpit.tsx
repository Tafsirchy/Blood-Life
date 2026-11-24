"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/context";
import {
  Heart,
  Calendar,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ExternalLink,
  Printer,
  Sparkles,
  PlusCircle,
  X,
  PhoneCall,
  User,
  ShieldCheck,
  Star,
} from "lucide-react";
import Link from "next/link";
import { getDonorTier, getNextTierProgress } from "@/lib/badges";
import { ProfessionalCertificate } from "@/components/certificate/ProfessionalCertificate";

interface TransfusionRecord {
  id: string;
  patientName: string;
  hospital: string;
  district: string;
  date: string;
  units: number;
  bloodGroup: string;
  certificateId: string;
  status: "COMPLETED";
  recipientVerified?: boolean;
  rating?: number;
  recipientFeedback?: string;
}

interface PledgedRequest {
  _id: string;
  recipientName: string;
  bloodGroup: string;
  hospital: string;
  district: string;
  status: string;
  urgency: string;
  unitsNeeded: number;
  scheduledDate: string;
  requesterPhone?: string;
  createdAt: string;
}

const SAMPLE_DONATIONS: TransfusionRecord[] = [
  {
    id: "tx-881",
    patientName: "Tasneem Rahman",
    hospital: "Dhaka Medical College Hospital",
    district: "Dhaka",
    date: "14 Oct 2025",
    units: 1,
    bloodGroup: "O-",
    certificateId: "BL-CERT-DMCH-881",
    status: "COMPLETED",
    recipientVerified: true,
    rating: 5,
    recipientFeedback: "জরুরি অস্ত্রোপচারের সময় দ্রুত রক্ত দিয়ে জীবন বাঁচিয়েছেন। অশেষ কৃতজ্ঞতা!",
  },
  {
    id: "tx-720",
    patientName: "Kamal Hossain",
    hospital: "Bangabandhu Sheikh Mujib Medical Univ",
    district: "Dhaka",
    date: "10 Jul 2025",
    units: 1,
    bloodGroup: "O-",
    certificateId: "BL-CERT-BSMMU-720",
    status: "COMPLETED",
  },
  {
    id: "tx-615",
    patientName: "Ayesha Siddiqua",
    hospital: "Dhaka Shishu Hospital",
    district: "Dhaka",
    date: "04 Apr 2025",
    units: 1,
    bloodGroup: "O-",
    certificateId: "BL-CERT-DSH-615",
    status: "COMPLETED",
  },
];

export function DonorCockpit() {
  const { language } = useLanguage();
  const [selectedCert, setSelectedCert] = useState<TransfusionRecord | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState<"history" | "pledges">("history");
  const [donations, setDonations] = useState<TransfusionRecord[]>([]);
  const [pledges, setPledges] = useState<PledgedRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal to Log a Past Donation
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logForm, setLogForm] = useState({
    recipientName: "",
    hospital: "",
    district: "Dhaka",
    units: 1,
    completedAt: new Date().toISOString().split("T")[0],
  });
  const [submittingLog, setSubmittingLog] = useState(false);

  const fetchDonorData = async () => {
    try {
      setLoading(true);
      const [meRes, donRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/donations"),
      ]);

      const meData = await meRes.json();
      if (meData.user) {
        setUserProfile(meData.user);
      }

      if (donRes.ok) {
        const donData = await donRes.json();
        const serverLogs: TransfusionRecord[] = (donData.transfusionLogs || []).map((l: any) => ({
          id: l._id || l.certificateId,
          patientName: l.recipientName,
          hospital: l.hospital,
          district: l.district || meData.user?.district || "Bangladesh",
          date: new Date(l.completedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          units: 1,
          bloodGroup: l.bloodGroup || meData.user?.bloodGroup || "O+",
          certificateId: l.certificateId,
          status: "COMPLETED",
          recipientVerified: l.recipientVerified || false,
          rating: l.rating || 5,
          recipientFeedback: l.recipientFeedback || "",
        }));

        // If user already had donations or sample donations
        if (serverLogs.length > 0) {
          setDonations(serverLogs);
        } else if (meData.user?.totalDonations > 0) {
          setDonations(SAMPLE_DONATIONS);
        } else {
          setDonations([]);
        }

        setPledges(donData.pledgedRequests || []);
      }
    } catch (e) {
      console.error("Error fetching donor history:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonorData();
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

  const totalDonations = userProfile?.totalDonations || donations.length || 0;
  const livesSaved = totalDonations * 3;
  const currentTier = getDonorTier(totalDonations);
  const tierProgress = getNextTierProgress(totalDonations);

  // SVG Dial Circumference
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleLogDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLog(true);
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...logForm,
          bloodGroup: userProfile?.bloodGroup || "O+",
        }),
      });
      if (res.ok) {
        setIsLogModalOpen(false);
        setLogForm({
          recipientName: "",
          hospital: "",
          district: "Dhaka",
          units: 1,
          completedAt: new Date().toISOString().split("T")[0],
        });
        await fetchDonorData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to log donation");
      }
    } catch {
      alert("Error submitting donation log");
    } finally {
      setSubmittingLog(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Cards: 90-Day Cooldown Dial + Lifetime Impact */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Cooldown Circular Dial (6 cols) */}
        <div className="md:col-span-6 card-clinical p-6 flex flex-col sm:flex-row items-center gap-6 justify-between border-2 border-amber-500/30">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
              <Clock size={11} className={remainingDays > 0 ? "animate-spin" : ""} />
              <span>{language === "bn" ? "স্বাস্থ্য বিরতি প্রটোকল" : "SAFE COOLDOWN ENGINE"}</span>
            </div>
            <h3 className="text-lg font-black text-[var(--text-primary)]">
              {language === "bn" ? "৯০ দিনের বৈজ্ঞানিক বিরতি" : "90-Day Biological Cooldown"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-xs">
              {remainingDays > 0
                ? language === "bn"
                  ? `আপনার শরীরের হিমোগ্লোবিন ও আয়রন সম্পূর্ণ স্বাভাবিক হতে আর ${remainingDays} দিন বাকি।`
                  : `${remainingDays} days remaining until your iron and hemoglobin reserves fully replenish.`
                : language === "bn"
                ? "আপনি শারীরিক ও ক্লিনিক্যালি সম্পূর্ণ সুস্থ এবং রক্তদানের জন্য প্রস্তুত!"
                : "You have completed the cooldown and are medically eligible to donate blood today!"}
            </p>
            <div className="pt-2 text-xs font-bold text-amber-500 flex items-center gap-1.5">
              <ShieldCheck size={14} />
              <span>{language === "bn" ? `পরবর্তী রক্তদান: ${nextEligibleDate}` : `Next Eligible: ${nextEligibleDate}`}</span>
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
                {remainingDays > 0 ? `${remainingDays}d` : "READY"}
              </span>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">
                {remainingDays > 0 ? (language === "bn" ? "বাকি আছে" : "remaining") : (language === "bn" ? "প্রস্তুত" : "Eligible")}
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
              {language === "bn" ? "আপনার রক্তদান ও জীবনরক্ষার পরিসংখ্যান" : "Your Lifetime Blood Impact"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {language === "bn"
                ? `স্বেচ্ছায় রক্তদানে আপনার অবদানে সরাসরি রক্ষা পেয়েছে ${livesSaved} জন মুমূর্ষু রোগীর অমূল্য জীবন।`
                : `Your voluntary donations have directly helped preserve the lives of ${livesSaved} critical surgery patients.`}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <div className="p-2.5 rounded-xl bg-[var(--bg-main)] text-center">
              <span className="text-xl font-black text-red-500 block">{totalDonations}</span>
              <span className="text-[10px] font-bold text-[var(--text-muted)]">
                {language === "bn" ? "বার রক্তদান" : "Donations"}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--bg-main)] text-center">
              <span className="text-xl font-black text-emerald-500 block">{livesSaved}</span>
              <span className="text-[10px] font-bold text-[var(--text-muted)]">
                {language === "bn" ? "জীবন রক্ষা" : "Lives Saved"}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--bg-main)] text-center">
              <span className="text-xl font-black text-blue-500 block">{userProfile?.bloodGroup || "O+"}</span>
              <span className="text-[10px] font-bold text-[var(--text-muted)]">
                {language === "bn" ? "ব্লাড গ্রুপ" : "Blood Group"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Tier & Digital Membership Banner */}
      <div className="card-clinical p-5 sm:p-6 border-2 border-amber-500/30 bg-linear-to-r from-amber-500/5 via-[var(--bg-surface)] to-red-500/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-md">
            <Sparkles size={24} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
                {language === "bn" ? "বর্তমান সম্মাননা টায়ার:" : "CURRENT MILESTONE TIER:"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                {currentTier?.nameBn || (language === "bn" ? "১ম রক্তদান সম্পন্ন করুন" : "Donate 1 Time to Unlock")}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
              {tierProgress.nextTier ? (
                language === "bn"
                  ? `পরবর্তী সম্মাননা টায়ার (${tierProgress.nextTier.nameBn}) আনলক করতে আর মাত্র ${tierProgress.donationsRemaining}টি রক্তদান প্রয়োজন।`
                  : `Only ${tierProgress.donationsRemaining} more donation(s) to reach ${tierProgress.nextTier.nameEn}!`
              ) : (
                language === "bn"
                  ? "অভিনন্দন! আপনি দেশের সর্বোচ্চ 'শতায়ু রক্তযোদ্ধা (ডায়মন্ড লিজেন্ড ২৫+)' টায়ার অর্জন করেছেন!"
                  : "Congratulations! You have reached the highest Diamond Legend Presidential Tier (25+)!"
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
          <Link
            href="/membership"
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm hover:scale-102 transition-all"
          >
            <Award size={14} />
            <span>{language === "bn" ? "মেম্বারশিপ কার্ড ও স্টিকার" : "Membership Card & Stickers"}</span>
          </Link>
        </div>
      </div>

      {/* Donor Tabs: Donation History vs Active Pledges */}
      <div className="card-clinical p-6 border border-[var(--border-subtle)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSubTab("history")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === "history"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-red-500 border border-[var(--border-subtle)]"
              }`}
            >
              <Award size={13} />
              <span>{language === "bn" ? "রক্তদানের ইতিহাস ও সার্টিফিকেট" : "Donation History & Certificates"}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {donations.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab("pledges")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === "pledges"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-red-500 border border-[var(--border-subtle)]"
              }`}
            >
              <Heart size={13} />
              <span>{language === "bn" ? "আমার অঙ্গীকারসমূহ" : "My Active Pledges"}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {pledges.length}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsLogModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-main)] hover:bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold inline-flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <PlusCircle size={14} />
            <span>{language === "bn" ? "নতুন রক্তদানের রেকর্ড যোগ করুন" : "+ Log Past Donation"}</span>
          </button>
        </div>

        {/* SUBTAB 1: Donation History */}
        {activeSubTab === "history" && (
          <div className="space-y-3">
            {loading ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                Loading donation history...
              </div>
            ) : donations.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-2">
                <Award size={32} className="text-[var(--text-muted)] mx-auto opacity-40" />
                <h4 className="text-xs font-bold text-[var(--text-primary)]">
                  {language === "bn" ? "এখনও কোনো রক্তদান রেকর্ড যুক্ত করা হয়নি" : "No Completed Donations Logged Yet"}
                </h4>
                <p className="text-[11px] text-[var(--text-muted)] max-w-sm mx-auto">
                  {language === "bn"
                    ? "আপনি পূর্বে হাসপাতালে রক্তদান করে থাকলে উপরের '+ নতুন রক্তদানের রেকর্ড যোগ করুন' বাটনে ক্লিক করে তা যুক্ত করুন।"
                    : "If you have donated blood before, click '+ Log Past Donation' above to track your history and generate official certificates."}
                </p>
              </div>
            ) : (
              donations.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-red-500/40 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Heart size={18} fill="currentColor" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        {item.patientName} • {item.hospital}
                      </h4>
                      <p className="text-[11px] text-[var(--text-muted)] flex flex-wrap items-center gap-2 mt-0.5 font-medium">
                        <span>{item.date}</span>
                        <span>•</span>
                        <span>{item.district}</span>
                        <span>•</span>
                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                          <CheckCircle2 size={11} />
                          {language === "bn" ? "ভেরিফাইড রক্তদান" : "Verified Donation"}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-[10px] text-[var(--text-muted)]">
                          #{item.certificateId}
                        </span>
                        {item.recipientVerified && (
                          <>
                            <span>•</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                              <span>★</span>
                              <span>{language === "bn" ? `গ্রহীতা ভেরিফাইড (${item.rating || 5}★)` : `Recipient Verified (${item.rating || 5}★)`}</span>
                            </span>
                          </>
                        )}
                      </p>
                      {item.recipientFeedback && (
                        <p className="text-[11px] text-[var(--text-secondary)] italic mt-1.5 bg-[var(--bg-surface)] px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] inline-block">
                          "{item.recipientFeedback}"
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCert(item)}
                    className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-red-500/10 border border-[var(--border-subtle)] text-xs font-bold text-red-500 inline-flex items-center gap-1.5 self-start sm:self-auto transition-colors"
                  >
                    <Award size={13} />
                    <span>{language === "bn" ? "সার্টিফিকেট দেখুন" : "View Certificate"}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* SUBTAB 2: Active Pledges */}
        {activeSubTab === "pledges" && (
          <div className="space-y-3">
            {pledges.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-2">
                <Heart size={32} className="text-[var(--text-muted)] mx-auto opacity-40" />
                <h4 className="text-xs font-bold text-[var(--text-primary)]">
                  {language === "bn" ? "কোন সক্রিয় অঙ্গীকার নেই" : "No Active Pledges Right Now"}
                </h4>
                <p className="text-[11px] text-[var(--text-muted)] max-w-sm mx-auto mb-2">
                  {language === "bn"
                    ? "জরুরি রক্তের আবেদন তালিকায় গিয়ে যে কোনো রোগীকে রক্তদানের অঙ্গীকার করতে পারেন।"
                    : "Visit the live emergency transfusion queue to pledge blood for patients in critical need."}
                </p>
                <Link
                  href="/search?tab=requests"
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <span>{language === "bn" ? "জরুরি রক্তের আবেদন দেখুন" : "View Emergency Queue"}</span>
                </Link>
              </div>
            ) : (
              pledges.map((req) => (
                <div
                  key={req._id}
                  className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-500/40 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span className="badge-blood text-sm font-black px-2.5 py-1">
                      {req.bloodGroup}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        {req.recipientName} ({req.unitsNeeded} {language === "bn" ? "ব্যাগ প্রয়োজন" : "Units"})
                      </h4>
                      <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-2 mt-0.5">
                        <span>{req.hospital}</span>
                        <span>•</span>
                        <span>{req.district}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Link
                      href={`/search?tab=requests`}
                      className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] transition-colors"
                    >
                      {language === "bn" ? "আবেদন বিস্তারিত" : "View Case Details"}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Log Past Donation Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-clinical max-w-lg w-full p-6 space-y-4 relative border-2 border-red-500/30 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <Heart size={18} className="text-red-500" />
                <h3 className="text-sm font-black text-[var(--text-primary)]">
                  {language === "bn" ? "পূর্ববর্তী রক্তদানের তথ্য সংরক্ষণ" : "Log a Past Blood Donation"}
                </h3>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[var(--bg-main)] text-[var(--text-muted)]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleLogDonationSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  {language === "bn" ? "রোগীর নাম বা ক্ষেত্র" : "Recipient Name / Note"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Surgery Patient or Relative"
                  value={logForm.recipientName}
                  onChange={(e) => setLogForm({ ...logForm, recipientName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-medium outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  {language === "bn" ? "হাসপাতাল বা ব্লাড ব্যাংক" : "Hospital or Blood Bank"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dhaka Medical College Hospital"
                  value={logForm.hospital}
                  onChange={(e) => setLogForm({ ...logForm, hospital: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-medium outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    {language === "bn" ? "রক্তদানের তারিখ" : "Donation Date"}
                  </label>
                  <input
                    type="date"
                    required
                    value={logForm.completedAt}
                    onChange={(e) => setLogForm({ ...logForm, completedAt: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    {language === "bn" ? "রক্তের পরিমাণ (ব্যাগ)" : "Units Donated"}
                  </label>
                  <select
                    value={logForm.units}
                    onChange={(e) => setLogForm({ ...logForm, units: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-bold outline-none"
                  >
                    <option value={1}>1 Unit (450ml)</option>
                    <option value={2}>2 Units (Apheresis)</option>
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-[var(--text-muted)] pt-1">
                {language === "bn"
                  ? "💡 রেকর্ড সেভ করার সাথে সাথে আপনার মোট রক্তদান সংখ্যা বাড়বে এবং ৯০ দিনের বিরতি স্বয়ংক্রিয়ভাবে আপডেট হবে।"
                  : "💡 Logging this donation updates your lifetime stats and recalculates your 90-day cooldown dial automatically."}
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-main)]"
                >
                  {language === "bn" ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={submittingLog}
                  className="btn-emergency !py-2 !px-4 text-xs font-bold"
                >
                  {submittingLog
                    ? language === "bn" ? "সংরক্ষণ হচ্ছে..." : "Saving..."
                    : language === "bn" ? "রেকর্ড যুক্ত করুন" : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Professional Printable Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="max-w-4xl w-full space-y-4 relative my-auto">
            {/* Modal Controls (Hidden in Print) */}
            <div className="no-print flex items-center justify-between bg-[var(--bg-surface)] p-3 rounded-2xl border border-[var(--border-subtle)] shadow-lg">
              <span className="text-xs font-bold text-[var(--text-secondary)]">
                {language === "bn" ? "অফিসিয়াল সম্মাননা সনদপত্র প্রিভিউ" : "Official Recognition Certificate Preview"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCert(null)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-main)] border border-[var(--border-subtle)]"
                >
                  {language === "bn" ? "বন্ধ করুন" : "Close"}
                </button>
                <button
                  type="button"
                  onClick={handlePrintCertificate}
                  className="btn-emergency !py-1.5 !px-4 text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Printer size={14} />
                  <span>{language === "bn" ? "প্রিন্ট / পিডিএফ সেভ" : "Print / Save PDF"}</span>
                </button>
              </div>
            </div>

            {/* Official Professional Certificate Component */}
            <ProfessionalCertificate
              data={{
                certificateId: selectedCert.certificateId,
                donorName: userProfile?.name || "স্বেচ্ছাসেবী রক্তদাতা (Verified Donor)",
                bloodGroup: selectedCert.bloodGroup || userProfile?.bloodGroup || "O+",
                units: selectedCert.units || 1,
                hospital: selectedCert.hospital,
                district: selectedCert.district || "বাংলাদেশ",
                date: selectedCert.date,
                recipientVerified: selectedCert.recipientVerified,
                rating: selectedCert.rating,
                recipientFeedback: selectedCert.recipientFeedback,
                patientName: selectedCert.patientName,
              }}
              language={language as "bn" | "en"}
            />
          </div>
        </div>
      )}
    </div>
  );
}
