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
  LogOut,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface NavbarProps {
  onOpenSos?: () => void;
}

export function Navbar({ onOpenSos }: NavbarProps) {
  const { t, language } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; email: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Synchronize authenticated user state
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated && d.user) {
          setCurrentUser({
            name: d.user.name,
            role: d.user.role,
            email: d.user.email,
          });
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => setCurrentUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      window.location.href = "/";
    } catch {
      window.location.href = "/";
    }
  };

  const handleSosClick = () => {
    if (onOpenSos) {
      onOpenSos();
    } else {
      router.push("/search?openSos=true");
    }
  };

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

  const isAboutActive = ["/about", "/funding", "/privacy", "/terms", "/blood-info"].includes(pathname);

  return (
    <nav className="sticky top-0 z-40 bg-[var(--bg-surface)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] px-3 sm:px-6 py-2 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <BloodLagbeLogo size="md" />

        {/* Desktop Links with Active Indicators */}
        <div className="hidden lg:flex items-center gap-0.5 text-xs font-bold text-[var(--text-secondary)] shrink-0 whitespace-nowrap">
          <Link
            href="/"
            className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
              pathname === "/"
                ? "bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold border border-red-500/20"
                : "hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            {t.nav.home}
          </Link>

          <Link
            href="/donate"
            className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
              pathname === "/donate"
                ? "bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold border border-red-500/20"
                : "hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            {language === "bn" ? "রক্ত দিন" : "Donate"}
          </Link>

          <Link
            href="/search"
            className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
              pathname === "/search"
                ? "bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold border border-red-500/20"
                : "hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            {t.nav.search}
          </Link>

          <Link
            href={pathname === "/" ? "#life-fund" : "/funding"}
            className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
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
              className={`px-2 py-1 rounded-md transition-colors inline-flex items-center gap-0.5 whitespace-nowrap ${
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
                  href="/blood-info"
                  onClick={() => setDropdownOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                    pathname === "/blood-info"
                      ? "bg-red-500/10 text-red-500 font-bold"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                  }`}
                >
                  <Droplet size={14} className="text-red-500" />
                  <span>{language === "bn" ? "রক্তের তথ্য ও ম্যাচিং" : "Blood Info & Matching"}</span>
                </Link>

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
            className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
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
            onClick={handleSosClick}
            type="button"
            className="btn-emergency !py-1.5 !px-3 text-xs font-bold hidden sm:inline-flex"
          >
            <ShieldAlert size={13} />
            <span>{t.nav.needBloodNow}</span>
          </button>

          {/* User Profile or Sign In Buttons */}
          {currentUser ? (
            <div className="hidden sm:flex items-center gap-1.5 pl-1 border-l border-[var(--border-subtle)]">
              <Link
                href="/dashboard/settings"
                className="px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] text-[11px] font-bold text-[var(--text-primary)] hover:border-red-500/40 transition-colors flex items-center gap-1.5"
                title={currentUser.email}
              >
                <span className="w-5 h-5 rounded-md bg-red-600 text-white flex items-center justify-center text-[10px] font-black">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                </span>
                <span className="max-w-[75px] truncate">{currentUser.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                title={language === "bn" ? "লগআউট" : "Sign Out"}
                aria-label="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1 pl-1 border-l border-[var(--border-subtle)]">
              <Link
                href="/auth/login"
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-[var(--text-secondary)] hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                {language === "bn" ? "লগইন" : "Sign In"}
              </Link>
              <Link
                href="/auth/register"
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-colors"
              >
                {language === "bn" ? "নিবন্ধন" : "Join"}
              </Link>
            </div>
          )}

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
            href="/blood-info"
            onClick={() => setMobileOpen(false)}
            className={`block px-3 py-2 rounded-lg transition-colors ${
              pathname === "/blood-info" ? "bg-red-500/10 text-red-500 font-bold" : "text-[var(--text-primary)]"
            }`}
          >
            {language === "bn" ? "রক্তের তথ্য ও ম্যাচিং" : "Blood Info & Matching"}
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
            href="/privacy"
            onClick={() => setMobileOpen(false)}
            className={`block px-3 py-2 rounded-lg transition-colors ${
              pathname === "/privacy" ? "bg-red-500/10 text-red-500" : "text-[var(--text-primary)]"
            }`}
          >
            {language === "bn" ? "ডোনার প্রাইভেসি শিল্ড" : "Privacy Shield"}
          </Link>
          <Link
            href="/terms"
            onClick={() => setMobileOpen(false)}
            className={`block px-3 py-2 rounded-lg transition-colors ${
              pathname === "/terms" ? "bg-red-500/10 text-red-500" : "text-[var(--text-primary)]"
            }`}
          >
            {language === "bn" ? "শর্তাবলী" : "Terms & Guidelines"}
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

          {/* Emergency SOS in Mobile Menu */}
          <button
            onClick={() => {
              setMobileOpen(false);
              handleSosClick();
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-red-500 font-bold flex items-center gap-1.5"
          >
            <ShieldAlert size={14} />
            <span>{t.nav.needBloodNow}</span>
          </button>

          {/* Mobile Auth Actions */}
          <div className="pt-2 mt-2 border-t border-[var(--border-subtle)] space-y-1">
            {currentUser ? (
              <div className="px-3 py-2 rounded-lg bg-[var(--bg-main)] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[var(--text-primary)] block">{currentUser.name}</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-medium block">{currentUser.role}</span>
                </div>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="px-2.5 py-1 rounded-md text-xs font-bold text-red-500 hover:bg-red-500/10 flex items-center gap-1"
                >
                  <LogOut size={13} />
                  <span>{language === "bn" ? "লগআউট" : "Sign Out"}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="py-2 text-center rounded-lg border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] hover:border-red-500/40"
                >
                  {language === "bn" ? "লগইন" : "Sign In"}
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileOpen(false)}
                  className="py-2 text-center rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                >
                  {language === "bn" ? "নিবন্ধন" : "Join"}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
