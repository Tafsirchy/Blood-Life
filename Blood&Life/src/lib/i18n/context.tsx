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

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("bn"); // Default to Bangla as primary national resonance

  useEffect(() => {
    const saved = localStorage.getItem("blood_lagbe_lang") as Language | null;
    if (saved === "en" || saved === "bn") {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("blood_lagbe_lang", lang);
    document.cookie = `blood_lagbe_lang=${lang}; path=/; max-age=31536000`;
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
