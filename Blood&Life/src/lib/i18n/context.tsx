"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { dictionaries, Language } from "./dictionaries";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (typeof dictionaries)["en"];
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

let globalCachedLang: Language | null = null;

export function LanguageProvider({
  children,
  initialLanguage = "bn",
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (globalCachedLang) return globalCachedLang;
    return initialLanguage;
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("blood_lagbe_lang") as Language | null;
      if (saved === "en" || saved === "bn") {
        globalCachedLang = saved;
        if (language !== saved) {
          setLanguageState(saved);
        }
      } else {
        localStorage.setItem("blood_lagbe_lang", language);
      }
      document.cookie = `blood_lagbe_lang=${language}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
  }, [language]);

  const setLanguage = (lang: Language) => {
    globalCachedLang = lang;
    setLanguageState(lang);
    try {
      localStorage.setItem("blood_lagbe_lang", lang);
      document.cookie = `blood_lagbe_lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
  };

  const toggleLanguage = () => {
    const nextLang: Language = language === "en" ? "bn" : "en";
    setLanguage(nextLang);
  };

  const t = dictionaries[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
