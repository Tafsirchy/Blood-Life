"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { EmergencyFooter } from "@/components/home/EmergencyFooter";
import { useLanguage } from "@/lib/i18n/context";
import {
  ShieldCheck,
  AlertCircle,
  Award,
  Printer,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { ProfessionalCertificate } from "@/components/certificate/ProfessionalCertificate";

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
        <div className="max-w-4xl mx-auto space-y-6">
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
              {/* Verification Header Banner (Hidden on Print) */}
              <div className="no-print p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

              {/* Printable Professional Certificate */}
              <ProfessionalCertificate
                data={{
                  certificateId: certData.certificateId,
                  donorName: certData.donorName,
                  bloodGroup: certData.bloodGroup,
                  units: certData.units || 1,
                  hospital: certData.hospital,
                  district: certData.district,
                  date: certData.date,
                  recipientVerified: certData.recipientVerified,
                  rating: certData.rating,
                  recipientFeedback: certData.recipientFeedback,
                  tierTitleBn: certData.tier?.certificateTitleBn,
                  tierTitleEn: certData.tier?.certificateTitleEn,
                  citationBn: certData.tier?.citationBn,
                  citationEn: certData.tier?.citationEn,
                }}
                language={language as "bn" | "en"}
              />

              {/* Action Buttons (Hidden on Print) */}
              <div className="no-print flex flex-wrap items-center justify-between gap-3 pt-2">
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
