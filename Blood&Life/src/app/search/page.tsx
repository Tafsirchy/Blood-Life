"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { EmergencyFooter } from "@/components/home/EmergencyFooter";
import { DualSearchFeed } from "@/components/search/DualSearchFeed";
import { SosBroadcastModal } from "@/components/requests/SosBroadcastModal";
import { useLanguage } from "@/lib/i18n/context";
import { Droplet } from "lucide-react";

export default function SearchPage() {
  const { language } = useLanguage();
  const [isSosOpen, setIsSosOpen] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("openSos") === "true" || params.get("sos") === "true") {
        setIsSosOpen(true);
      }
    } catch {
      // fallback
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
      {/* Global Unified Responsive Navbar */}
      <Navbar onOpenSos={() => setIsSosOpen(true)} />

      {/* Main Search Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-wider mb-3">
            <Droplet size={13} fill="currentColor" />
            <span>{language === "bn" ? "লাইভ জাতীয় ডিরেক্টরি" : "Live National Registry"}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)]">
            {language === "bn" ? "রক্তদাতা ও জরুরী আবেদন খুঁজুন" : "Find Blood Donors & Emergency Cases"}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 max-w-lg mx-auto">
            {language === "bn"
              ? "৬৪ জেলার যাচাইকৃত রক্তদাতা এবং হাসপাতালের জরুরি রোগীদের তাৎক্ষণিক তালিকা।"
              : "Search verified voluntary donors and live ICU transfusion cases across Bangladesh."}
          </p>
        </div>

        <DualSearchFeed />
      </main>

      {/* Footer */}
      <EmergencyFooter />

      {/* SOS Modal */}
      <SosBroadcastModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
      />
    </div>
  );
}
