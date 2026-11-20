"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n/context";
import { BloodLagbeLogo } from "@/components/brand/BloodLagbeLogo";
import { PhoneCall, ShieldAlert, Heart, MapPin, ExternalLink, Download } from "lucide-react";
import Link from "next/link";

export function EmergencyFooter() {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors">
      {/* 24/7 Red Alert Hotline Strip */}
      <div className="bg-red-600 text-white px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs sm:text-sm font-bold">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            <span>
              {language === "bn"
                ? "২৪/৭ সার্বক্ষণিক জরুরী মেডিক্যাল হেল্পলাইন: ৯৯৯ / +৮৮০ ১৮০০-ব্লাড"
                : "24/7 National Emergency Hotline: 999 / +880 1800-BLOOD"}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a
              href="tel:999"
              className="px-3 py-1 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors font-black flex items-center gap-1.5"
            >
              <PhoneCall size={12} />
              <span>{language === "bn" ? "কল করুন ৯৯৯" : "Call 999"}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-2.5">
            <BloodLagbeLogo size="md" />
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-sm">
              {language === "bn"
                ? "ব্লাড অ্যান্ড লাইফ (BLOOD&LIFE) বাংলাদেশের ৬৪ জেলায় জরুরী রোগী ও স্বেচ্ছাসেবী রক্তদাতাদের সরাসরি সংযুক্ত করার একটি সম্পূর্ণ অলাভজনক ও উন্মুক্ত জীবনরক্ষাকারী প্ল্যাটফর্ম।"
                : "BLOOD&LIFE is a zero-profit digital emergency network connecting critical patients with verified voluntary donors across all 64 districts in Bangladesh."}
            </p>
            <div className="text-[11px] font-bold text-emerald-500 flex items-center gap-1.5 pt-0.5">
              <ShieldAlert size={14} />
              <span>{language === "bn" ? "১০০% নিরাপদ • কোনো মধ্যস্বত্বভোগী নেই" : "100% Free & Protected • Zero Broker Policy"}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
              {language === "bn" ? "দ্রুত সেবা" : "Fast Services"}
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/search" className="hover:text-red-500 transition-colors">
                  {language === "bn" ? "রক্তদাতা খুঁজুন" : "Search Donors"}
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-red-500 transition-colors">
                  {language === "bn" ? "জরুরী আবেদনসমূহ" : "Emergency Queue"}
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-red-500 transition-colors">
                  {language === "bn" ? "রক্তদাতা হিসেবে নিবন্ধন" : "Become a Donor"}
                </Link>
              </li>
              <li>
                <Link href="/funding" className="hover:text-red-500 transition-colors text-emerald-500 font-bold">
                  {language === "bn" ? "কমিউনিটি লাইফ ফান্ড" : "Community Life Fund"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Guidelines */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
              {language === "bn" ? "নির্দেশিকা ও নীতি" : "Guidelines & Trust"}
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/dashboard/volunteer" className="hover:text-red-500 transition-colors">
                  {language === "bn" ? "প্রেসক্রিপশন ভেরিফিকেশন" : "Prescription Verification"}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-red-500 transition-colors">
                  {language === "bn" ? "ডোনার প্রাইভেসি শিল্ড" : "Donor Privacy Shield"}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-red-500 transition-colors">
                  {language === "bn" ? "আমাদের মূল লক্ষ্য" : "About & Mission"}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-red-500 transition-colors">
                  {language === "bn" ? "ব্যবহারের শর্তাবলী" : "Terms of Service"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Division Emergency Coverage */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
              {language === "bn" ? "জাতীয় কভারেজ" : "Coverage"}
            </h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {language === "bn"
                ? "ঢাকা, চট্টগ্রাম, রাজশাহী, খুলনা, সিলেট, বরিশাল, রংপুর এবং ময়মনসিংহ বিভাগের সকল জেলা ও উপজেলায় সার্বক্ষণিক কার্যকর।"
                : "Active across all 8 divisions and 64 districts nationwide 24/7."}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 mt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
          <div>{t.footer.copyright}</div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-red-500 transition-colors">
              {t.footer.privacy}
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-red-500 transition-colors">
              {t.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
