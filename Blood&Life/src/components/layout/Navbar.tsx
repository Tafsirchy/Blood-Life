"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { BloodLagbeLogo } from "@/components/brand/BloodLagbeLogo";
import { LanguageToggle } from "@/components/theme/LanguageToggle";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  Droplet,
  Search,
  ShieldAlert,
  Heart,
  Menu,
  X,
  ChevronDown,
  Info,
  DollarSign,
  Lock,
  FileText,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  onOpenSos: () => void;
}

export function Navbar({ onOpenSos }: NavbarProps) {
  const { t, language } = useLanguage();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAboutActive = ["/about", "/funding", "/privacy", "/terms"].includes(pathname);

  return (
    <nav className="sticky top-0 z-40 bg-[var(--bg-surface)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] px-4 sm:px-6 py-2 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <BloodLagbeLogo size="md" />

        {/* Desktop Links with Active Indicators */}
        <div className="hidden lg:flex items-center gap-1 text-xs font-bold text-[var(--text-secondary)]">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              pathname === "/"
                ? "bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold border border-red-500/20"
                : "hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            {t.nav.home}
          </Link>

          <Link
            href="/donate"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              pathname === "/donate"
                ? "bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold border border-red-500/20"
                : "hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            {language === "bn" ? "রক্ত দিন" : "Donate"}
          </Link>

          <Link
            href="/search"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              pathname === "/search"
                ? "bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold border border-red-500/20"
                : "hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            {t.nav.search}
          </Link>

          <Link
            href={pathname === "/" ? "#life-fund" : "/funding"}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              pathname === "/funding"
                ? "bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold border border-red-500/20"
                : "hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            {language === "bn" ? "লাইফ ফান্ড" : "Life Fund"}
          </Link>

          {/* About Us Interactive Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 ${
                isAboutActive
                  ? "bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold border border-red-500/20"
                  : "hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Info size={13} />
              <span>{language === "bn" ? "আমাদের সম্পর্কে" : "About Us"}</span>
              <ChevronDown
                size={12}
                className={`transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-52 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                <Link
                  href="/about"
                  onClick={() => setDropdownOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                    pathname === "/about"
                      ? "bg-red-500/10 text-red-500 font-bold"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                  }`}
                >
                  <Info size={14} className="text-red-500" />
                  <span>{language === "bn" ? "আমাদের কথা" : "Who We Are"}</span>
                </Link>

                <Link
                  href="/funding"
                  onClick={() => setDropdownOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                    pathname === "/funding"
                      ? "bg-red-500/10 text-red-500 font-bold"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                  }`}
                >
                  <DollarSign size={14} className="text-emerald-500" />
                  <span>{language === "bn" ? "কমিউনিটি ফান্ড ও লেজার" : "Community Life Fund"}</span>
                </Link>

                <Link
                  href="/privacy"
                  onClick={() => setDropdownOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                    pathname === "/privacy"
                      ? "bg-red-500/10 text-red-500 font-bold"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                  }`}
                >
                  <Lock size={14} className="text-amber-500" />
                  <span>{language === "bn" ? "ডোনার প্রাইভেসি শিল্ড" : "Privacy Shield"}</span>
                </Link>

                <Link
                  href="/terms"
                  onClick={() => setDropdownOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                    pathname === "/terms"
                      ? "bg-red-500/10 text-red-500 font-bold"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                  }`}
                >
                  <FileText size={14} className="text-blue-500" />
                  <span>{language === "bn" ? "শর্তাবলী ও আচরণবিধি" : "Terms & Guidelines"}</span>
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/dashboard"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              pathname.startsWith("/dashboard")
                ? "bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold border border-red-500/20"
                : "hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            {t.nav.dashboard}
          </Link>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <NotificationBell />
          <LanguageToggle />
          <ThemeToggle />

          <button
            onClick={onOpenSos}
            type="button"
            className="btn-emergency !py-1.5 !px-3 text-xs font-bold hidden sm:inline-flex"
          >
            <ShieldAlert size={13} />
            <span>{t.nav.needBloodNow}</span>
          </button>

          {/* Mobile Drawer Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg border border-[var(--border-subtle)] lg:hidden text-[var(--text-muted)]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="lg:hidden pt-3 pb-2 border-t border-[var(--border-subtle)] mt-2 space-y-1 text-xs font-bold animate-in fade-in">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className={`block px-3 py-2 rounded-lg transition-colors ${
              pathname === "/" ? "bg-red-500/10 text-red-500" : "text-[var(--text-primary)]"
            }`}
          >
            {t.nav.home}
          </Link>
          <Link
            href="/donate"
            onClick={() => setMobileOpen(false)}
            className={`block px-3 py-2 rounded-lg transition-colors ${
              pathname === "/donate" ? "bg-red-500/10 text-red-500" : "text-[var(--text-primary)]"
            }`}
          >
            {language === "bn" ? "রক্ত দিন" : "Donate"}
          </Link>
          <Link
            href="/search"
            onClick={() => setMobileOpen(false)}
            className={`block px-3 py-2 rounded-lg transition-colors ${
              pathname === "/search" ? "bg-red-500/10 text-red-500" : "text-[var(--text-primary)]"
            }`}
          >
            {t.nav.search}
          </Link>
          <Link
            href={pathname === "/" ? "#life-fund" : "/funding"}
            onClick={() => setMobileOpen(false)}
            className={`block px-3 py-2 rounded-lg transition-colors ${
              pathname === "/funding" ? "bg-red-500/10 text-red-500" : "text-[var(--text-primary)]"
            }`}
          >
            {language === "bn" ? "লাইফ ফান্ড" : "Life Fund"}
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileOpen(false)}
            className={`block px-3 py-2 rounded-lg transition-colors ${
              pathname === "/about" ? "bg-red-500/10 text-red-500" : "text-[var(--text-primary)]"
            }`}
          >
            {language === "bn" ? "আমাদের কথা" : "About Us"}
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className={`block px-3 py-2 rounded-lg transition-colors ${
              pathname.startsWith("/dashboard") ? "bg-red-500/10 text-red-500" : "text-[var(--text-primary)]"
            }`}
          >
            {t.nav.dashboard}
          </Link>
          <button
            onClick={() => {
              setMobileOpen(false);
              onOpenSos();
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-red-500 font-bold flex items-center gap-1.5"
          >
            <ShieldAlert size={14} />
            <span>{t.nav.needBloodNow}</span>
          </button>
        </div>
      )}
    </nav>
  );
}
