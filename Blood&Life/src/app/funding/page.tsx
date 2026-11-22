"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { EmergencyFooter } from "@/components/home/EmergencyFooter";
import { useLanguage } from "@/lib/i18n/context";
import {
  Heart,
  ShieldCheck,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  CreditCard,
  Building2,
} from "lucide-react";

export default function FundingPage() {
  const { language } = useLanguage();
  const [amount, setAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const presetAmountsUSD = [10, 25, 50, 100];
  const presetAmountsBDT = [500, 1000, 2500, 5000];

  const ledgerRecords = [
    {
      date: "Nov 19, 2026",
      purposeEn: "Emergency cross-matching test subsidy (DMCH ICU)",
      purposeBn: "জরুরী ক্রস-ম্যাচিং টেস্ট অনুদান (ঢাকা মেডিকেল আইসিইউ)",
      amount: "৳1,800",
      patient: "Tanvir Rahman",
    },
    {
      date: "Nov 17, 2026",
      purposeEn: "Blood bag and screening kit support (CMCH Trauma)",
      purposeBn: "ব্লাড ব্যাগ ও স্ক্রীনিং কিট সহায়তা (চট্টগ্রাম মেডিকেল)",
      amount: "৳2,400",
      patient: "Abdul Gafur",
    },
    {
      date: "Nov 14, 2026",
      purposeEn: "Pediatric thalassemia transfusion assistance (Dhaka Shishu)",
      purposeBn: "শিশু থ্যালাসেমিয়া রক্ত সঞ্চালন সহায়তা (ঢাকা শিশু হাসপাতাল)",
      amount: "৳1,500",
      patient: "Ayesha Siddiqua",
    },
  ];

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Header */}
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck size={12} />
              <span>{language === "bn" ? "স্বচ্ছ কমিউনিটি ফান্ড" : "TRANSPARENT LIFE SUPPORT FUND"}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
              {language === "bn" ? "অসহায় রোগীর জরুরী রক্তদান সহায়তা তহবিল" : "Community Emergency Blood Transfusion Fund"}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {language === "bn"
                ? "ব্লাড অ্যান্ড লাইফ (BLOOD&LIFE) প্ল্যাটফর্ম সম্পূর্ণ ফ্রি। তবে হাসপাতালের আইসিইউতে অসচ্ছল রোগীদের রক্তের ক্রস-ম্যাচিং টেস্ট ও ব্যাগ কেনার সামর্থ্য না থাকলে এই তহবিল থেকে সরাসরি সহায়তা দেওয়া হয়।"
                : "BLOOD&LIFE operates with zero fees. However, impoverished ICU patients frequently lack the funds for laboratory cross-matching screening and sterile blood bags. This transparent fund subsidizes those clinical expenses."}
            </p>
          </div>

          {/* Main Grid: Donation Checkout & Public Transparency Ledger */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Donation Form (5 cols) */}
            <div className="lg:col-span-5 card-clinical p-6 border-2 border-[var(--border-subtle)] space-y-5">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <h3 className="text-sm font-black text-[var(--text-primary)]">
                  {language === "bn" ? "অনুদান ফর্ম (Stripe সিকিউর)" : "Make a Contribution (Stripe Secure)"}
                </h3>
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                  <Lock size={11} />
                  <span>256-bit SSL</span>
                </span>
              </div>

              {success ? (
                <div className="p-6 text-center space-y-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={36} className="mx-auto" />
                  <h4 className="text-sm font-bold">
                    {language === "bn" ? "অসংখ্য ধন্যবাদ!" : "Thank You for Your Generosity!"}
                  </h4>
                  <p className="text-xs">
                    {language === "bn"
                      ? "আপনার অবদান একজন অসহায় রোগীর জরুরি সার্জারিতে সরাসরি ভূমিকা রাখবে।"
                      : "Your contribution directly funds life-saving emergency surgery screenings."}
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="text-xs font-bold underline pt-2"
                  >
                    {language === "bn" ? "পুনরায় অনুদান দিন" : "Donate Again"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleDonate} className="space-y-4">
                  {/* Amount Selector */}
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2">
                      {language === "bn" ? "অনুদানের পরিমাণ নির্বাচন করুন" : "Select Contribution Amount"}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(language === "bn" ? presetAmountsBDT : presetAmountsUSD).map((val) => {
                        const isSelected = amount === val && !customAmount;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => {
                              setAmount(val);
                              setCustomAmount("");
                            }}
                            className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                              isSelected
                                ? "bg-red-600 text-white border-red-600 shadow-sm"
                                : "bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-red-500/40"
                            }`}
                          >
                            {language === "bn" ? `৳${val}` : `$${val}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Donor Info */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                        {language === "bn" ? "আপনার নাম" : "Your Name"}
                      </label>
                      <input
                        type="text"
                        required
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Tafsirul Islam"
                        className="w-full px-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-medium outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                        {language === "bn" ? "ইমেইল এড্রেস (রিসিপ্ট পাঠানো হবে)" : "Email Address (for receipt)"}
                      </label>
                      <input
                        type="email"
                        required
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full px-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-medium outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-emergency !py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Heart size={14} fill="currentColor" />
                    <span>
                      {loading
                        ? language === "bn"
                          ? "প্রক্রিয়াধীন..."
                          : "Processing..."
                        : language === "bn"
                        ? `৳${amount} অনুদান দিন`
                        : `Donate $${amount}`}
                    </span>
                  </button>
                </form>
              )}
            </div>

            {/* Right: Public Ledger (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="card-clinical p-6 border border-[var(--border-subtle)] space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                  <div>
                    <h3 className="text-sm font-black text-[var(--text-primary)]">
                      {language === "bn" ? "রিয়েল-টাইম ডিসবার্সমেন্ট লেজার" : "Real-Time Emergency Disbursement Ledger"}
                    </h3>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      {language === "bn"
                        ? "ফান্ড থেকে রোগীর বিল পরিশোধের সরাসরি হিসাব"
                        : "Direct clinical verification records"}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    <span>100% Audit Verified</span>
                  </span>
                </div>

                <div className="space-y-2.5">
                  {ledgerRecords.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-[var(--text-primary)]">
                          {language === "bn" ? item.purposeBn : item.purposeEn}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                          {item.date} • {language === "bn" ? `রোগী: ${item.patient}` : `Patient: ${item.patient}`}
                        </div>
                      </div>
                      <div className="text-right font-black text-red-500 font-mono shrink-0">
                        {item.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <EmergencyFooter />
    </div>
  );
}
