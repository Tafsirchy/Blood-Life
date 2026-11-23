"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { EmergencyFooter } from "@/components/home/EmergencyFooter";
import { useLanguage } from "@/lib/i18n/context";
import {
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Award,
  Heart,
  Building2,
  Calendar,
  Printer,
  Sparkles,
  ArrowLeft,
  Share2,
  Star,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default function CertificateVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const certId = (params?.id as string) || "";

  const [loading, setLoading] = useState(true);
  const [certData, setCertData] = useState<any>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!certId) return;

    const fetchCert = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/certificates/${encodeURIComponent(certId)}`);
        const data = await res.json();
        if (res.ok && data.verified) {
          setCertData(data.certificate);
        } else {
          setError(data.error || "সার্টিফিকেট যাচাই ব্যর্থ হয়েছে।");
        }
      } catch (err) {
        setError("সার্ভার ত্রুটি। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।");
      } finally {
        setLoading(false);
      }
    };

    fetchCert();
  }, [certId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Back link */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-xs font-bold text-[var(--text-secondary)] hover:text-red-500 inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>{language === "bn" ? "হোমপেজে ফিরে যান" : "Back to Home"}</span>
            </Link>

            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              Registry Query: #{certId}
            </span>
          </div>

          {loading ? (
            <div className="p-16 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
              <Sparkles size={32} className="text-red-500 mx-auto animate-spin" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {language === "bn" ? "সনদপত্র ও ডিজিটাল স্বাক্ষর যাচাই করা হচ্ছে..." : "Verifying Digital Seal & Transfusion Records..."}
              </h3>
            </div>
          ) : error || !certData ? (
            <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border-2 border-red-500/30 space-y-4">
              <AlertCircle size={44} className="text-red-500 mx-auto" />
              <h2 className="text-xl font-black text-[var(--text-primary)]">
                {language === "bn" ? "সনদপত্রটি বৈধ নয় বা খুঁজে পাওয়া যায়নি" : "Certificate Not Found or Unverified"}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                {error || (language === "bn"
                  ? "প্রদত্ত সার্টিফিকেট আইডিটি আমাদের ডিজিটাল রেজিস্ট্রি ডাটাবেজে রেকর্ড করা নেই।"
                  : "The queried certificate ID does not match any verified record in our national registry.")}
              </p>
              <div className="pt-2">
                <Link
                  href="/search"
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold inline-flex items-center gap-2"
                >
                  <span>{language === "bn" ? "অন্যান্য রেকর্ড অনুসন্ধান করুন" : "Search Registry"}</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Verification Header Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">
                      OFFICIALLY VERIFIED CLINICAL RECORD
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-[var(--text-primary)]">
                      {language === "bn"
                        ? "এই সনদপত্রটি ১০০% সত্য, বৈধ ও ডাটাবেজ ভেরিফাইড"
                        : "Official Blood&Life Authenticated Certificate"}
                    </h3>
                  </div>
                </div>

                <div className="text-right self-start sm:self-auto">
                  <span className="font-mono text-xs font-black text-emerald-700 dark:text-emerald-300 block">
                    #{certData.certificateId}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    SHA-256 Digital Signature Verified
                  </span>
                </div>
              </div>

              {/* Printable Certificate Canvas */}
              <div
                id="printable-cert"
                className="p-8 sm:p-12 rounded-3xl bg-linear-to-b from-amber-500/5 via-[var(--bg-surface)] to-amber-500/5 border-4 border-amber-500/40 text-center relative overflow-hidden shadow-xl"
              >
                {/* Watermark / Background Crest */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-3">
                  <Heart size={300} fill="currentColor" className="text-red-600" />
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest">
                    <Sparkles size={14} />
                    <span>{certData.tier?.certificateTitleEn || "NATIONAL APPRECIATION AWARD"}</span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
                    {certData.tier?.certificateTitleBn || "ব্লাড অ্যান্ড লাইফ লাইফ-সেভার স্বীকৃতি"}
                  </h1>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">
                    {certData.tier?.citationBn || "মানবতার কল্যাণে স্বেচ্ছায় অমূল্য রক্তদান করে মুমূর্ষু রোগীর জীবন রক্ষায় অনন্য ভূমিকা রাখার জন্য এই সনদ প্রদান করা হলো।"}
                  </p>

                  {/* Donor Honor Plaque */}
                  <div className="py-6 border-y-2 border-[var(--border-subtle)] my-6 space-y-2">
                    <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                      Awarded with Highest Honor to Voluntary Blood Donor
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-500 tracking-tight">
                      {certData.donorName}
                    </h2>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
                      <span className="px-3 py-1 rounded-full font-black bg-red-500/10 text-red-600 border border-red-500/20">
                        Blood Group: {certData.bloodGroup}
                      </span>
                      <span className="px-3 py-1 rounded-full font-bold bg-[var(--bg-main)] text-[var(--text-primary)] border border-[var(--border-subtle)]">
                        {certData.tier?.nameBn || "স্বেচ্ছাসেবী রক্তদাতা"}
                      </span>
                    </div>

                    {/* Recipient Verified Badge */}
                    {certData.recipientVerified && (
                      <div className="pt-3 flex flex-col items-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold">
                          <Star size={13} className="fill-amber-500 text-amber-500" />
                          <span>
                            {language === "bn"
                              ? `রক্তগ্রহীতা পরিবার কর্তৃক ভেরিফাইড (${certData.rating || 5}★ রেটিং)`
                              : `Recipient Family Verified Voluntary Transfusion (${certData.rating || 5}★)`}
                          </span>
                        </div>
                        {certData.recipientFeedback && (
                          <p className="text-xs text-[var(--text-secondary)] italic mt-1.5 max-w-md">
                            "{certData.recipientFeedback}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Clinical & Transfusion Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-xs bg-[var(--bg-main)]/60 p-4 rounded-2xl border border-[var(--border-subtle)]">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-[var(--text-muted)] block flex items-center gap-1">
                        <Building2 size={12} className="text-red-500" />
                        <span>{language === "bn" ? "হাসপাতাল ও এলাকা:" : "Hospital & District:"}</span>
                      </span>
                      <span className="font-bold text-[var(--text-primary)] block">
                        {certData.hospital} • {certData.district}
                      </span>
                    </div>

                    <div className="space-y-1 sm:text-right">
                      <span className="text-[11px] font-bold text-[var(--text-muted)] block flex items-center sm:justify-end gap-1">
                        <Calendar size={12} className="text-blue-500" />
                        <span>{language === "bn" ? "রক্তদানের তারিখ ও কোড:" : "Date & Verification Serial:"}</span>
                      </span>
                      <span className="font-mono font-bold text-[var(--text-primary)] block">
                        {new Date(certData.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        • #{certData.certificateId}
                      </span>
                    </div>
                  </div>

                  {/* Seal and Signatures */}
                  <div className="pt-6 flex items-center justify-between border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] font-bold">
                    <div className="text-left">
                      <span className="block text-[var(--text-primary)] font-black">BLOOD&LIFE CENTRAL CLINICAL DESK</span>
                      <span>Health & Family Welfare Emergency Protocol</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-emerald-600 font-black">VERIFIED VOLUNTARY DISPATCH</span>
                      <span>Digital Ledger Reference: BL-{certData.certificateId}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <Link
                  href="/membership"
                  className="px-4 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] inline-flex items-center gap-2 transition-colors"
                >
                  <Award size={14} className="text-amber-500" />
                  <span>{language === "bn" ? "অফিসিয়াল মেম্বারশিপ কার্ড দেখুন" : "View Membership Card"}</span>
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-md hover:scale-102 transition-all"
                  >
                    <Printer size={15} />
                    <span>{language === "bn" ? "প্রিন্ট বা পিডিএফ ডাউনলোড" : "Print / Save PDF"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <EmergencyFooter />
    </div>
  );
}
