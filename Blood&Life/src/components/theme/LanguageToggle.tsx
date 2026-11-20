"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n/context";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex items-center p-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] text-xs font-bold shadow-xs">
      <button
        type="button"
        onClick={() => setLanguage("bn")}
        className={`px-2.5 py-1 rounded-lg transition-all ${
          language === "bn"
            ? "bg-red-600 text-white shadow-xs"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        }`}
      >
        বাংলা
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`px-2.5 py-1 rounded-lg transition-all ${
          language === "en"
            ? "bg-red-600 text-white shadow-xs"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        }`}
      >
        ENG
      </button>
    </div>
  );
}
