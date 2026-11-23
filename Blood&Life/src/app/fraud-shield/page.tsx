"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { EmergencyFooter } from "@/components/home/EmergencyFooter";
import { useLanguage } from "@/lib/i18n/context";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Phone,
  Building2,
  MapPin,
  Calendar,
  PlusCircle,
  X as CloseIcon,
  Send,
  Lock,
  FileWarning,
  Eye,
  Info,
} from "lucide-react";

interface BlacklistRecord {
  id: string;
  maskedPhone: string;
  reportedName: string;
  scamCategory: string;
  hospitalName: string;
  district: string;
  description: string;
  status: string;
  incidentDate: string;
  bannedAt?: string;
}

export default function FraudShieldPage() {
  const { language } = useLanguage();

  // Directory state
  const [records, setRecords] = useState<BlacklistRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalBlacklisted: 0,
    pendingReview: 0,
    preventedExtortionsCount: 0,
  });

  // Phone lookup verifier state
  const [lookupPhone, setLookupPhone] = useState("");
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [lookupResult, setLookupResult] = useState<{
    checked: boolean;
    isFlagged: boolean;
    isBlacklisted: boolean;
    isUnderInvestigation: boolean;
    reportCount: number;
    verdict: string;
    details?: any;
    error?: string;
  } | null>(null);

  // Report submission modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reportSuccessMsg, setReportSuccessMsg] = useState("");
  const [reportErrorMsg, setReportErrorMsg] = useState("");
  const [reportForm, setReportForm] = useState({
    reportedPhone: "",
    reportedName: "",
    scamCategory: "advance_cash_scam",
    hospitalName: "",
    district: "",
    description: "",
    evidenceDetails: "",
    reporterName: "",
    reporterPhone: "",
  });

  // Fetch blacklisted records
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/fraud?category=${selectedCategory}`);
      const data = await res.json();
      if (data.reports) {
        setRecords(data.reports);
      }
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error loading blacklist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedCategory]);

  // Handle instant phone check
  const handleCheckPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupPhone.trim() || lookupPhone.trim().length < 8) {
      setLookupResult({
        checked: true,
        isFlagged: false,
        isBlacklisted: false,
        isUnderInvestigation: false,
        reportCount: 0,
        verdict: "INVALID_LENGTH",
        error: language === "bn" ? "কমপক্ষে ৮ সংখ্যার সঠিক ফোন নম্বর লিখুন।" : "Please enter at least 8 digits of the phone number.",
      });
      return;
    }

    try {
      setCheckingPhone(true);
      setLookupResult(null);
      const res = await fetch(`/api/fraud?phone=${encodeURIComponent(lookupPhone.trim())}`);
      const data = await res.json();
      setLookupResult(data);
    } catch (err) {
      setLookupResult({
        checked: true,
        isFlagged: false,
        isBlacklisted: false,
        isUnderInvestigation: false,
        reportCount: 0,
        verdict: "ERROR",
        error: language === "bn" ? "যাচাই করতে সমস্যা হয়েছে। কিছুক্ষণ পর পুনরায় চেষ্টা করুন।" : "Verification failed. Please retry.",
      });
    } finally {
      setCheckingPhone(false);
    }
  };

  // Handle fraud report submission
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportSuccessMsg("");
    setReportErrorMsg("");

    if (!reportForm.reportedPhone || !reportForm.description || !reportForm.reporterName || !reportForm.reporterPhone) {
      setReportErrorMsg(
        language === "bn"
          ? "অনুগ্রহ করে অভিযুক্তের ফোন নম্বর, ঘটনার বিবরণ এবং আপনার যোগাযোগের তথ্য পূরণ করুন।"
          : "Please complete the required fields: accused phone, description, and your contact info."
      );
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/fraud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportForm),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setReportSuccessMsg(data.message);
        setReportForm({
          reportedPhone: "",
          reportedName: "",
          scamCategory: "advance_cash_scam",
          hospitalName: "",
          district: "",
          description: "",
          evidenceDetails: "",
          reporterName: "",
          reporterPhone: "",
        });
        setTimeout(() => {
          setShowReportModal(false);
          setReportSuccessMsg("");
        }, 3000);
      } else {
        setReportErrorMsg(data.error || "অভিযোগ জমা দিতে ব্যর্থ হয়েছে।");
      }
    } catch (err) {
      setReportErrorMsg("সার্ভার ত্রুটি। অনুগ্রহ করে পরে চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "advance_cash_scam":
        return language === "bn" ? "বিকাশ/নগদে অগ্রিম টাকা দাবি" : "Advance Cash Extortion";
      case "fake_donor_noshow":
        return language === "bn" ? "মিথ্যা আশ্বাস ও শেষ মুহূর্তে ফোন বন্ধ" : "Crisis No-Show / Ghosting";
      case "blood_broker":
        return language === "bn" ? "বাণিজ্যিক দালাল চক্র" : "Commercial Blood Broker";
      case "false_screening":
        return language === "bn" ? "ভুয়া টেস্ট রিপোর্ট" : "Forged Clinical Screening";
      case "harassment":
        return language === "bn" ? "রোগীর স্বজনকে হুমকি বা হয়রানি" : "Extortion & Harassment";
      default:
        return language === "bn" ? "অন্যান্য প্রতারণা" : "Deceptive Conduct";
    }
  };

  const filteredRecords = records.filter((r) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.maskedPhone.toLowerCase().includes(term) ||
      r.reportedName.toLowerCase().includes(term) ||
      r.hospitalName.toLowerCase().includes(term) ||
      r.district.toLowerCase().includes(term) ||
      r.description.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Top Hero Banner */}
        <section className="py-12 sm:py-16 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-red-500/5 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldAlert size={14} />
              <span>{language === "bn" ? "কমিউনিটি সেফটি ও প্রতারক প্রতিরোধ শিল্ড" : "COMMUNITY SAFETY & FRAUD SHIELD"}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
              {language === "bn"
                ? "ভুয়া রক্তদাতা ও প্রতারক দালাল ব্ল্যাকলিস্ট"
                : "Fraud Donor Blacklist & Scammer Registry"}
            </h1>

            <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-3 max-w-2xl leading-relaxed">
              {language === "bn"
                ? "জরুরি রক্তদানে কাউকে কখনো বিকাশ বা নগদে অগ্রিম টাকা পাঠাবেন না। টাকা পাঠানোর পূর্বে রক্তদাতার ফোন নম্বর আমাদের জাতীয় ব্ল্যাকলিস্টে যাচাই করুন।"
                : "Never send advance payments via bKash or Nagad. BLOOD&LIFE is strictly non-commercial. Verify any donor's phone number against our national blacklist before proceeding."}
            </p>

            {/* Quick Stat Badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
              <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-bold inline-flex items-center gap-2">
                <ShieldAlert size={15} />
                <span>
                  {language === "bn"
                    ? `${stats.totalBlacklisted || 4}টি নিশ্চিত কালো তালিকাভুক্ত নম্বর`
                    : `${stats.totalBlacklisted || 4} Confirmed Blacklisted Numbers`}
                </span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-2">
                <CheckCircle2 size={15} />
                <span>
                  {language === "bn"
                    ? "১০০% স্বেচ্ছাসেবী ও সম্পূর্ণ ঝুঁকিমুক্ত"
                    : "100% Non-Commercial Volunteer Protocol"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-md inline-flex items-center gap-1.5 hover:scale-102"
              >
                <PlusCircle size={15} />
                <span>{language === "bn" ? "প্রতারকের বিরুদ্ধে অভিযোগ দিন" : "Report a Scammer"}</span>
              </button>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 space-y-12">
          {/* Section 1: Instant Phone Number Verifier Console */}
          <div className="bg-linear-to-br from-red-500/10 via-[var(--bg-surface)] to-[var(--bg-surface)] border-2 border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="max-w-3xl mx-auto text-center space-y-3 mb-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                <Search size={14} />
                <span>{language === "bn" ? "লাইভ ফোন নম্বর সেফটি চেকার" : "INSTANT PHONE NUMBER VERIFIER"}</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-[var(--text-primary)]">
                {language === "bn"
                  ? "রক্তদাতার ফোন নম্বর ব্ল্যাকলিস্টে আছে কি না যাচাই করুন"
                  : "Check if a Donor Phone Number is Flagged"}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                {language === "bn"
                  ? "যে কোনো রক্তদাতা ফোন করলে তার নম্বরটি এখানে লিখে চেক বাটনে চাপুন। ইতিপূর্বে কোনো রোগীর সাথে প্রতারণা করে থাকলে তৎক্ষণাৎ ধরা পড়বে।"
                  : "Enter any phone number to immediately query our nationwide incident registry before confirming emergency dispatch."}
              </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleCheckPhone} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={lookupPhone}
                  onChange={(e) => setLookupPhone(e.target.value)}
                  placeholder={language === "bn" ? "যেমন: 01712345678" : "e.g. 01712345678"}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:border-red-500 focus:outline-none text-sm font-mono font-bold text-[var(--text-primary)] transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={checkingPhone}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xs shrink-0 disabled:opacity-50"
              >
                {checkingPhone ? (
                  <span>{language === "bn" ? "যাচাই করা হচ্ছে..." : "Verifying..."}</span>
                ) : (
                  <>
                    <Search size={16} />
                    <span>{language === "bn" ? "নম্বর যাচাই করুন" : "Check Safety"}</span>
                  </>
                )}
              </button>
            </form>

            {/* Live Lookup Result Display */}
            {lookupResult && (
              <div className="max-w-xl mx-auto mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                {lookupResult.error ? (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold text-center">
                    {lookupResult.error}
                  </div>
                ) : lookupResult.isBlacklisted ? (
                  <div className="p-5 rounded-2xl bg-red-500/15 border-2 border-red-600 text-red-700 dark:text-red-400 space-y-2">
                    <div className="flex items-center gap-2 text-base font-black">
                      <XCircle size={20} className="text-red-600 shrink-0" />
                      <span>{language === "bn" ? "সতর্কতা! এই নম্বরটি কালো তালিকাভুক্ত প্রতারক" : "CRITICAL ALERT: Confirmed Blacklisted Scammer"}</span>
                    </div>
                    <p className="text-xs font-medium leading-relaxed">
                      {language === "bn"
                        ? "এই ফোন নম্বরটির বিরুদ্ধে পূর্বে জরুরি রোগীর স্বজনের কাছ থেকে টাকা হাতিয়ে নেওয়ার নিশ্চিত প্রমাণ পাওয়া গেছে। দয়া করে কোনো টাকা পাঠাবেন না এবং হাসপাতালে সরাসরি রিপোর্ট করুন।"
                        : "This phone number has verified incidents of extortion or deceptive conduct on record. DO NOT send any financial transactions."}
                    </p>
                    {lookupResult.details && (
                      <div className="pt-2 text-xs font-semibold border-t border-red-500/30 flex flex-wrap gap-x-4 gap-y-1">
                        <span>{language === "bn" ? "ধরণ:" : "Type:"} {getCategoryLabel(lookupResult.details.category)}</span>
                        <span>{language === "bn" ? "এলাকা:" : "District:"} {lookupResult.details.district}</span>
                      </div>
                    )}
                  </div>
                ) : lookupResult.isUnderInvestigation ? (
                  <div className="p-5 rounded-2xl bg-amber-500/15 border-2 border-amber-500 text-amber-800 dark:text-amber-300 space-y-2">
                    <div className="flex items-center gap-2 text-base font-black">
                      <AlertTriangle size={20} className="text-amber-500 shrink-0" />
                      <span>{language === "bn" ? "সতর্কতা: এই নম্বরের বিরুদ্ধে অভিযোগ তদন্তাধীন" : "CAUTION: Number Under Clinical Investigation"}</span>
                    </div>
                    <p className="text-xs font-medium leading-relaxed">
                      {language === "bn"
                        ? `এই ফোন নম্বরটির বিরুদ্ধে ${lookupResult.reportCount}টি অভিযোগ পর্যালোচনায় রয়েছে। হাসপাতালে সরাসরি সাক্ষাৎ ব্যতীত কোনো লেনদেন করবেন না।`
                        : `There are ${lookupResult.reportCount} active complaint(s) filed regarding this number. Exercise caution and do not send money.`}
                    </p>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 space-y-2">
                    <div className="flex items-center gap-2 text-base font-black">
                      <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                      <span>{language === "bn" ? "কোনো অপরাধের রেকর্ড পাওয়া যায়নি (Clean Record)" : "No Scam Reports Found for this Number"}</span>
                    </div>
                    <p className="text-xs font-medium leading-relaxed">
                      {language === "bn"
                        ? "আমাদের ডাটাবেজে এই নম্বরের বিরুদ্ধে কোনো অভিযোগ নেই। তবে সর্বদা মনে রাখবেন: প্রকৃত স্বেচ্ছাসেবী রক্তদাতা কখনোই অগ্রিম বিকাশ/নগদে টাকা চান না।"
                        : "No fraudulent activity reported. Please remember: authentic voluntary donors never request advance money."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Anti-Fraud Rules & Safety Shield Guidelines */}
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <Lock size={14} />
                <span>{language === "bn" ? "প্রতারক শনাক্তকরণ নীতিমালা" : "FRAUD IDENTIFICATION RULES"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                {language === "bn"
                  ? "রক্তের দালাল ও প্রতারক চেনার ৫টি সোনালী নিয়ম"
                  : "5 Golden Rules to Defeat Blood Scammers"}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                {language === "bn"
                  ? "কারা প্রতারক হিসেবে বিবেচিত হবে এবং রক্তগ্রহীতাদের সুরক্ষায় আমাদের গৃহীত কঠোর নির্দেশনা জানুন।"
                  : "Guidelines defining fraudulent behavior and zero-tolerance platform security protocols."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Card 1 */}
              <div className="rounded-2xl p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3 hover:border-red-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center font-black text-lg">
                  01
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {language === "bn" ? "জিরো অগ্রিম টাকা নীতি (Zero Advance Cash)" : "Zero Advance Payment Policy"}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {language === "bn"
                    ? "প্রকৃত রক্তদাতা রক্তদান করতে আসার জন্য কখনই সিএনজি বা যাতায়াত খরচ বাবদ বিকাশ/নগদে অগ্রিম টাকা দাবি করেন না। যে রক্তদাতা ফোনে টাকা পাঠানোর দাবি করবে, সে অবিলম্বে ব্ল্যাকলিস্টে যাবে।"
                    : "True voluntary donors never ask for advance taxi or travel fare via bKash or Nagad. Anyone asking for money before arriving at the hospital is a fraud."}
                </p>
              </div>

              {/* Card 2 */}
              <div className="rounded-2xl p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3 hover:border-red-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-black text-lg">
                  02
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {language === "bn" ? "হাসপাতাল ব্লাড ব্যাংকে সরাসরি উপস্থিতি" : "Direct Hospital Phlebotomy Desk"}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {language === "bn"
                    ? "রক্তদাতার রক্ত সংগ্রহ শুধুমাত্র হাসপাতালের সরকারি ব্লাড ব্যাংক বা অনুমোদিত প্যাথলজি ল্যাবে চিকিৎসকের উপস্থিতিতে সম্পন্ন হবে। হাসপাতালের বাইরে কোনো মধ্যস্থতাকারীর কাছ থেকে রক্তের ব্যাগ নেওয়া নিষিদ্ধ।"
                    : "All transfusions must occur exclusively inside hospital-certified blood banks. Never accept pre-collected blood bags from intermediaries or brokers outside the premises."}
                </p>
              </div>

              {/* Card 3 */}
              <div className="rounded-2xl p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3 hover:border-red-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-lg">
                  03
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {language === "bn" ? "জরুরি মুহূর্তে মিথ্যা আশ্বাস ও গা-ঢাকা (Crisis Ghosting)" : "Crisis No-Show & False Promises"}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {language === "bn"
                    ? "রোগীর অস্ত্রোপচার বা আইসিইউ পরিস্থিতিতে রক্ত দিতে সম্মত হয়ে শেষ মুহূর্তে ফোন বন্ধ করে নিরুদ্দেশ হওয়া বা অন্য দাতা খোঁজার সুযোগ নষ্ট করা দণ্ডনীয় অপরাধ এবং প্ল্যাটফর্মে আজীবন নিষিদ্ধের কারণ।"
                    : "Promising blood to an emergency surgical or ICU case and intentionally shutting off phones or vanishing is severe negligence resulting in an immediate permanent ban."}
                </p>
              </div>

              {/* Card 4 */}
              <div className="rounded-2xl p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3 hover:border-red-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-black text-lg">
                  04
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {language === "bn" ? "বাণিজ্যিক দালাল ও সিন্ডিকেট দমন" : "Commercial Broker Syndicate Suppression"}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {language === "bn"
                    ? "হাসপাতালের সামনে অসহায় রোগীদের জিম্মি করে চড়া দামে রক্ত বিক্রি বা কমিশন আদায়ের কোনো তথ্য পেলেই আমরা সেই চক্রের নম্বর এবং তথ্য আইন প্রয়োগকারী সংস্থার সহযোগিতায় উন্মোচন করি।"
                    : "Exploiting vulnerable patient families by demanding commercial prices for blood units is illegal and leads to swift reporting to law enforcement authorities."}
                </p>
              </div>

              {/* Card 5 */}
              <div className="rounded-2xl p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3 hover:border-red-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-lg">
                  05
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {language === "bn" ? "গ্রহীতার ১-ক্লিক ভেরিফিকেশন (Peer Verification)" : "Recipient 1-Click Peer Verification"}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {language === "bn"
                    ? "রক্তদান সম্পন্ন হওয়ার পর গ্রহীতা তার ড্যাশবোর্ড থেকে রক্তদাতাকে সত্যতা ভেরিফাই করতে পারেন। এই ভেরিফিকেশন ডোনারের প্রোফাইলে ট্রাস্ট ব্যাজ ও মাইলস্টোন সম্মাননা নিশ্চিত করে।"
                    : "After blood is received, the patient or family can 1-click verify the voluntary donor from their dashboard, unlocking the verified trust star on the donor's profile."}
                </p>
              </div>

              {/* Card 6 */}
              <div className="rounded-2xl p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3 hover:border-red-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-black text-lg">
                  06
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {language === "bn" ? "ভুয়া স্ক্রিনিং ও ভুল তথ্যের প্রতিরোধ" : "Forged Clinical Screening Defense"}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {language === "bn"
                    ? "রক্তের গ্রুপ বা সংক্রামক রোগের তথ্য গোপন করা অথবা ভুয়া প্রেসক্রিপশন তৈরি করার অপচেষ্টায় জড়িতদের প্রোফাইল চিরতরে ব্লক করা হয়।"
                    : "Forging blood test documentation or misrepresenting clinical eligibility is dangerous and subject to instantaneous blacklisting."}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Confirmed Blacklist Public Directory */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] flex items-center gap-2">
                  <FileWarning size={22} className="text-red-600" />
                  <span>{language === "bn" ? "নিশ্চিত কালো তালিকাভুক্ত ভুয়া নম্বরসমূহ" : "Confirmed Blacklisted Scammer Directory"}</span>
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {language === "bn"
                    ? "গোপনীয়তা রক্ষা ও সতর্কতামূলক উদ্দেশ্যে ফোন নম্বরের মাঝামাঝি অংশ গোপন রাখা হয়েছে।"
                    : "For public safety and privacy compliance, middle digits are masked."}
                </p>
              </div>

              {/* Search & Category Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="all">{language === "bn" ? "সকল অপরাধের ধরণ" : "All Scam Categories"}</option>
                  <option value="advance_cash_scam">{language === "bn" ? "অগ্রিম টাকা দাবি" : "Advance Money"}</option>
                  <option value="fake_donor_noshow">{language === "bn" ? "শেষ মুহূর্তে গা-ঢাকা" : "Crisis No-Show"}</option>
                  <option value="blood_broker">{language === "bn" ? "দালাল সিন্ডিকেট" : "Blood Broker"}</option>
                </select>

                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={language === "bn" ? "তালিকা খুঁজুন..." : "Filter list..."}
                    className="pl-8 pr-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none w-40 sm:w-48"
                  />
                </div>
              </div>
            </div>

            {/* Blacklist Records Cards */}
            {loading ? (
              <div className="p-12 text-center text-xs text-[var(--text-muted)]">
                {language === "bn" ? "ব্ল্যাকলিস্ট তথ্য লোড হচ্ছে..." : "Loading blacklist registry..."}
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="p-10 text-center rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
                <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {language === "bn" ? "এই ক্যাটাগরিতে কোনো রেকর্ড নেই" : "No records matching this filter"}
                </h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRecords.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl p-5 bg-[var(--bg-surface)] border-2 border-red-500/20 hover:border-red-500/40 transition-all space-y-3 relative group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-black text-red-600 dark:text-red-400">
                            {item.maskedPhone}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                            PERMANENTLY BANNED
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[var(--text-primary)] mt-1">
                          {item.reportedName}
                        </h4>
                      </div>

                      <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0">
                        {getCategoryLabel(item.scamCategory)}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-main)] p-3 rounded-xl border border-[var(--border-subtle)]">
                      "{item.description}"
                    </p>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-[var(--text-muted)] pt-1">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={12} className="text-red-500" />
                        <span className="truncate max-w-[200px]">{item.hospitalName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-blue-500" />
                        <span>{item.district}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Report Scammer Modal */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center gap-2 text-red-600">
                  <ShieldAlert size={20} />
                  <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                    {language === "bn" ? "প্রতারক রক্তদাতার বিরুদ্ধে অভিযোগ দায়ের" : "File Fraud / Extortion Report"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                >
                  <CloseIcon size={18} />
                </button>
              </div>

              {reportSuccessMsg ? (
                <div className="p-6 text-center space-y-3">
                  <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
                  <h4 className="text-base font-bold text-[var(--text-primary)]">
                    {language === "bn" ? "অভিযোগ গৃহীত হয়েছে!" : "Report Submitted Successfully!"}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {reportSuccessMsg}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
                  {reportErrorMsg && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 font-bold">
                      {reportErrorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[var(--text-primary)] mb-1">
                        {language === "bn" ? "অভিযুক্তের ফোন নম্বর *" : "Accused Phone Number *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={reportForm.reportedPhone}
                        onChange={(e) => setReportForm({ ...reportForm, reportedPhone: e.target.value })}
                        placeholder="01712345678"
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:outline-none focus:border-red-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--text-primary)] mb-1">
                        {language === "bn" ? "অভিযুক্তের নাম বা ছদ্মনাম" : "Accused Name / Alias"}
                      </label>
                      <input
                        type="text"
                        value={reportForm.reportedName}
                        onChange={(e) => setReportForm({ ...reportForm, reportedName: e.target.value })}
                        placeholder="যেমন: কামরুল হাসান"
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[var(--text-primary)] mb-1">
                      {language === "bn" ? "প্রতারণার ধরণ *" : "Scam Category *"}
                    </label>
                    <select
                      value={reportForm.scamCategory}
                      onChange={(e) => setReportForm({ ...reportForm, scamCategory: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:outline-none focus:border-red-500"
                    >
                      <option value="advance_cash_scam">
                        {language === "bn" ? "বিকাশ/নগদে অগ্রিম টাকা দাবি (Advance Money via bKash/Nagad)" : "Advance Money via bKash/Nagad"}
                      </option>
                      <option value="fake_donor_noshow">
                        {language === "bn" ? "জরুরি মুহূর্তে রক্ত না দিয়ে ফোন বন্ধ (Crisis No-Show / Phone Off)" : "Crisis No-Show / Phone Off"}
                      </option>
                      <option value="blood_broker">
                        {language === "bn" ? "বাণিজ্যিক দালাল চক্র (Commercial Blood Broker / Selling Blood)" : "Commercial Blood Broker"}
                      </option>
                      <option value="false_screening">
                        {language === "bn" ? "ভুয়া টেস্ট রিপোর্ট বা ভুল তথ্য (Forged Screening / False Identity)" : "Forged Screening / False Identity"}
                      </option>
                      <option value="harassment">
                        {language === "bn" ? "রোগীর স্বজনকে হুমকি বা হয়রানি (Harassment / Threatening)" : "Harassment / Threatening"}
                      </option>
                      <option value="other">
                        {language === "bn" ? "অন্যান্য অনৈতিক কার্যকলাপ (Other)" : "Other"}
                      </option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[var(--text-primary)] mb-1">
                        {language === "bn" ? "হাসপাতালের নাম" : "Hospital Name"}
                      </label>
                      <input
                        type="text"
                        value={reportForm.hospitalName}
                        onChange={(e) => setReportForm({ ...reportForm, hospitalName: e.target.value })}
                        placeholder="যেমন: ঢাকা মেডিকেল কলেজ"
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--text-primary)] mb-1">
                        {language === "bn" ? "জেলা" : "District"}
                      </label>
                      <input
                        type="text"
                        value={reportForm.district}
                        onChange={(e) => setReportForm({ ...reportForm, district: e.target.value })}
                        placeholder="যেমন: ঢাকা"
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[var(--text-primary)] mb-1">
                      {language === "bn" ? "ঘটনার বিস্তারিত বিবরণ *" : "Incident Description *"}
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={reportForm.description}
                      onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                      placeholder={language === "bn" ? "কী ঘটেছিল, কত টাকা চেয়েছিল বা কীভাবে প্রতারণা করেছিল লিখুন..." : "Describe what happened, how much money was asked, etc."}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="border-t border-[var(--border-subtle)] pt-3 space-y-3">
                    <span className="font-bold text-[var(--text-secondary)] block">
                      {language === "bn" ? "অভিযোগকারীর তথ্য (গোপন রাখা হবে):" : "Your Contact Info (Kept Strictly Confidential):"}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          required
                          value={reportForm.reporterName}
                          onChange={(e) => setReportForm({ ...reportForm, reporterName: e.target.value })}
                          placeholder={language === "bn" ? "আপনার নাম *" : "Your Name *"}
                          className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          required
                          value={reportForm.reporterPhone}
                          onChange={(e) => setReportForm({ ...reportForm, reporterPhone: e.target.value })}
                          placeholder={language === "bn" ? "আপনার ফোন নম্বর *" : "Your Phone *"}
                          className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReportModal(false)}
                      className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] font-bold hover:bg-[var(--bg-main)]"
                    >
                      {language === "bn" ? "বাতিল" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send size={13} />
                      <span>{submitting ? (language === "bn" ? "জমা হচ্ছে..." : "Submitting...") : (language === "bn" ? "অভিযোগ জমা দিন" : "Submit Report")}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <EmergencyFooter />
    </div>
  );
}
