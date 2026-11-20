"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle clinical color theme"
      className="relative p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-red-500/30 transition-all duration-200"
    >
      {theme === "dark" ? (
        <Sun size={17} className="text-amber-400 transition-transform rotate-0 hover:rotate-45" />
      ) : (
        <Moon size={17} className="text-slate-700 transition-transform -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
}
