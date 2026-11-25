"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { BloodLagbeLogo } from "@/components/brand/BloodLagbeLogo";
import { EmergencyPulseRibbon } from "@/components/home/EmergencyPulseRibbon";
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
  Sparkles,
  MapPin,
  Building2,
  Hospital,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface NavbarProps {
  onOpenSos?: () => void;
}

// Global in-memory cache to guarantee zero-latency synchronous initialization across all route navigations
let globalCachedUser: { name: string; role: string; email: string } | null = null;
let hasHydrated = false;

export function Navbar({ onOpenSos }: NavbarProps) {
  const { t, language } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // On SSR & initial client hydration: mounted is false, so Server & Client produce 100% IDENTICAL HTML.
  // On subsequent client-side route navigations: hasHydrated is true, so it renders immediately without flashing!
  const [mounted, setMounted] = useState<boolean>(() => hasHydrated);
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    role: string;
    email: string;
    bloodGroup?: string;
  } | null>(
    () => (hasHydrated ? globalCachedUser : null)
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleDropdownEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    dropdownTimeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 150);
  };

  const handleUserMenuEnter = () => {
    if (userMenuTimeoutRef.current) {
      clearTimeout(userMenuTimeoutRef.current);
      userMenuTimeoutRef.current = null;
    }
    setUserMenuOpen(true);
  };

  const handleUserMenuLeave = () => {
    if (userMenuTimeoutRef.current) {
      clearTimeout(userMenuTimeoutRef.current);
    }
    userMenuTimeoutRef.current = setTimeout(() => {
      setUserMenuOpen(false);
    }, 150);
  };

  // Close menus when pathname changes
  useEffect(() => {
    setDropdownOpen(false);
    setUserMenuOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // Cleanup hover timeouts on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
      if (userMenuTimeoutRef.current) clearTimeout(userMenuTimeoutRef.current);
    };
  }, []);

  // Synchronize authenticated user state
  useEffect(() => {
    hasHydrated = true;
    setMounted(true);

    const syncUser = () => {
      // 1. Instantly restore from localStorage if memory cache is empty
      if (!globalCachedUser && typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("bloodlife_cached_user");
          if (stored) {
            const parsed = JSON.parse(stored);
            globalCachedUser = parsed;
            setCurrentUser(parsed);
          }
        } catch {}
      }

      // 2. Verify with server
      fetch("/api/auth/me")
        .then((r) => r.json())
        .then((d) => {
          if (d.authenticated && d.user) {
            const u = {
              name: d.user.name,
              role: d.user.role,
              email: d.user.email,
              bloodGroup: d.user.bloodGroup,
            };
            globalCachedUser = u;
            setCurrentUser(u);
            try {
              localStorage.setItem(
                "bloodlife_cached_user",
                JSON.stringify({ name: u.name, role: u.role, bloodGroup: u.bloodGroup })
              );
            } catch {}
          } else {
            globalCachedUser = null;
            setCurrentUser(null);
            try {
              localStorage.removeItem("bloodlife_cached_user");
            } catch {}
          }
        })
        .catch(() => {
          if (globalCachedUser === null) {
            setCurrentUser(null);
          }
        });
    };

    syncUser();

    window.addEventListener("bloodlife-auth-changed", syncUser);
    return () => {
      window.removeEventListener("bloodlife-auth-changed", syncUser);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      globalCachedUser = null;
      try {
        localStorage.removeItem("bloodlife_cached_user");
      } catch {}
      window.dispatchEvent(new Event("bloodlife-auth-changed"));
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAboutActive = ["/about", "/privacy", "/terms", "/blood-info", "/clinical-shield", "/fraud-shield"].includes(pathname);

  return (
    <header className="sticky top-0 z-40">
      <EmergencyPulseRibbon />
      <nav className="bg-[var(--bg-surface)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] px-3 sm:px-6 py-2 transition-colors">
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
            href="/hospitals"
            className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
              pathname === "/hospitals"
                ? "bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold border border-red-500/20"
                : "hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            {language === "bn" ? "হাসপাতাল বোর্ড" : "Hospitals"}
          </Link>

          <Link
            href="/funding"
            className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
              pathname === "/funding"
                ? "bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold border border-red-500/20"
                : "hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            {language === "bn" ? "লাইফ ফান্ড" : "Life Fund"}
          </Link>

          <Link
            href="/directory"
            className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
              pathname === "/directory"
                ? "bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold border border-red-500/20"
                : "hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            {language === "bn" ? "রক্তদাতা ডিরেক্টরি" : "Directory"}
          </Link>

          <Link
            href="/membership"
            className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
              pathname === "/membership"
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold border border-amber-500/30"
                : "hover:text-amber-500 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            {language === "bn" ? "মেম্বারশিপ" : "Membership"}
          </Link>

          {/* About Us Interactive Dropdown */}
          <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleDropdownLeave}
          >
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
              <div className="absolute left-0 mt-1.5 w-64 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 space-y-0.5 before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2">
                <Link
                  href="/hospitals"
                  onClick={() => setDropdownOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl transition-colors ${
                    pathname === "/hospitals"
                      ? "bg-red-500/10 text-red-500 font-bold"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                  }`}
                >
                  <Hospital size={16} className="text-red-500 shrink-0" />
                  <span>{language === "bn" ? "হাসপাতাল রক্তের চাহিদা ও শিডিউল" : "Hospital Demand & Schedules"}</span>
                </Link>

                <Link
                  href="/directory"
                  onClick={() => setDropdownOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl transition-colors ${
                    pathname === "/directory"
                      ? "bg-red-500/10 text-red-500 font-bold"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                  }`}
                >
                  <MapPin size={16} className="text-blue-500 shrink-0" />
                  <span>{language === "bn" ? "৪-স্তরের রক্তদাতা ডিরেক্টরি" : "Geo-Donor Directory"}</span>
                </Link>

                <Link
                  href="/fraud-shield"
                  onClick={() => setDropdownOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl transition-colors ${
                    pathname === "/fraud-shield"
                      ? "bg-red-500/10 text-red-500 font-bold"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                  }`}
                >
                  <ShieldAlert size={16} className="text-amber-500 shrink-0" />
                  <span>{language === "bn" ? "প্রতারক ও দালাল ব্ল্যাকলিস্ট" : "Fraud Donor Blacklist"}</span>
                </Link>

                <Link
                  href="/clinical-shield"
                  onClick={() => setDropdownOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl transition-colors ${
                    pathname === "/clinical-shield"
                      ? "bg-red-500/10 text-red-500 font-bold"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                  }`}
                >
                  <ShieldAlert size={16} className="text-red-500 shrink-0" />
                  <span>{language === "bn" ? "রোগ ও রক্তের উপাদান শিল্ড" : "Clinical Disease Shield"}</span>
                </Link>

                <Link
                  href="/blood-info"
                  onClick={() => setDropdownOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl transition-colors ${
                    pathname === "/blood-info"
                      ? "bg-red-500/10 text-red-500 font-bold"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                  }`}
                >
                  <Droplet size={16} className="text-red-500 shrink-0" />
                  <span>{language === "bn" ? "রক্তের তথ্য ও ম্যাচিং" : "Blood Info & Matching"}</span>
                </Link>

                <Link
                  href="/about"
                  onClick={() => setDropdownOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl transition-colors ${
                    pathname === "/about"
                      ? "bg-red-500/10 text-red-500 font-bold"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                  }`}
                >
                  <Info size={16} className="text-red-500 shrink-0" />
                  <span>{language === "bn" ? "আমাদের কথা" : "Who We Are"}</span>
                </Link>

                <Link
                  href="/funding"
                  onClick={() => setDropdownOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl transition-colors ${
                    pathname === "/funding"
                      ? "bg-red-500/10 text-red-500 font-bold"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                  }`}
                >
                  <DollarSign size={16} className="text-emerald-500 shrink-0" />
                  <span>{language === "bn" ? "কমিউনিটি ফান্ড ও লেজার" : "Community Life Fund"}</span>
                </Link>

                <Link
                  href="/privacy"
                  onClick={() => setDropdownOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl transition-colors ${
                    pathname === "/privacy"
                      ? "bg-red-500/10 text-red-500 font-bold"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                  }`}
                >
                  <Lock size={16} className="text-amber-500 shrink-0" />
                  <span>{language === "bn" ? "ডোনার প্রাইভেসি শিল্ড" : "Privacy Shield"}</span>
                </Link>

                <Link
                  href="/terms"
                  onClick={() => setDropdownOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl transition-colors ${
                    pathname === "/terms"
                      ? "bg-red-500/10 text-red-500 font-bold"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                  }`}
                >
                  <FileText size={16} className="text-blue-500 shrink-0" />
                  <span>{language === "bn" ? "শর্তাবলী ও আচরণবিধি" : "Terms & Guidelines"}</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSosClick}
            type="button"
            className="btn-emergency !py-1.5 !px-3 text-xs font-bold hidden sm:inline-flex"
          >
            <ShieldAlert size={13} />
            <span>{t.nav.needBloodNow}</span>
          </button>

          {/* User Profile Dropdown or Sign In Buttons */}
          {!mounted ? (
            <div className="hidden sm:block w-20 h-7" suppressHydrationWarning />
          ) : currentUser ? (
            <div
              className="relative hidden sm:block"
              ref={userMenuRef}
              onMouseEnter={handleUserMenuEnter}
              onMouseLeave={handleUserMenuLeave}
            >
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                  pathname.startsWith("/dashboard") || userMenuOpen
                    ? "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400"
                    : "border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-primary)] hover:border-red-500/30"
                }`}
                title={currentUser.email}
                aria-expanded={userMenuOpen}
              >
                <span className="w-5 h-5 rounded-lg bg-red-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                </span>
                <span className="text-xs font-bold max-w-[85px] truncate">{currentUser.name}</span>
                <ChevronDown
                  size={12}
                  className={`text-[var(--text-muted)] transition-transform duration-150 ${
                    userMenuOpen ? "rotate-180 text-red-500" : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-1 space-y-1 before:content-[''] before:absolute before:-top-2.5 before:left-0 before:right-0 before:h-2.5">
                  {/* User Info Header */}
                  <div className="px-3 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)]/60">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-red-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xs">
                        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-black text-[var(--text-primary)] block truncate">
                          {currentUser.name}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] block truncate">
                          {currentUser.email}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full capitalize">
                        {currentUser.role === "donor"
                          ? language === "bn"
                            ? "স্বেচ্ছাসেবী রক্তদাতা"
                            : "Blood Donor"
                          : currentUser.role === "recipient"
                          ? language === "bn"
                            ? "রক্তগ্রহীতা"
                            : "Blood Requester"
                          : currentUser.role === "admin"
                          ? language === "bn"
                            ? "অ্যাডমিন"
                            : "Administrator"
                          : currentUser.role}
                      </span>
                      {currentUser.bloodGroup ? (
                        <span className="badge-blood text-[10px] font-black px-1.5 py-0.5">
                          {currentUser.bloodGroup}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {language === "bn" ? "ভেরিফাইড" : "Verified"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Menu Links */}
                  <div className="pt-1 space-y-0.5">
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                        pathname === "/dashboard"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : "text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                      }`}
                    >
                      <LayoutDashboard size={15} className="text-red-500" />
                      <span>{language === "bn" ? "ইউজার ড্যাশবোর্ড" : "User Dashboard"}</span>
                    </Link>

                    <Link
                      href="/dashboard/donations"
                      onClick={() => setUserMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                        pathname === "/dashboard/donations"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : "text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                      }`}
                    >
                      <Droplet size={15} className="text-rose-500" />
                      <span>{language === "bn" ? "রক্তদানের ইতিহাস" : "Donation Records"}</span>
                    </Link>

                    <Link
                      href="/dashboard/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                        pathname === "/dashboard/settings"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : "text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                      }`}
                    >
                      <Settings size={15} className="text-blue-500" />
                      <span>{language === "bn" ? "প্রোফাইল ও সেটিংস" : "Profile & Settings"}</span>
                    </Link>
                  </div>

                  {/* Logout Button */}
                  <div className="pt-1 border-t border-[var(--border-subtle)]">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                    >
                      <LogOut size={15} />
                      <span>{language === "bn" ? "লগআউট করুন" : "Sign Out"}</span>
                    </button>
                  </div>
                </div>
              )}
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
            href="/funding"
            onClick={() => setMobileOpen(false)}
            className={`block px-3 py-2 rounded-lg transition-colors ${
              pathname === "/funding" ? "bg-red-500/10 text-red-500 font-bold" : "text-[var(--text-primary)]"
            }`}
          >
            {language === "bn" ? "লাইফ ফান্ড" : "Life Fund"}
          </Link>
          <Link
            href="/hospitals"
            onClick={() => setMobileOpen(false)}
            className={`block px-3 py-2 rounded-lg transition-colors ${
              pathname === "/hospitals" ? "bg-red-500/10 text-red-500 font-bold" : "text-[var(--text-primary)]"
            }`}
          >
            {language === "bn" ? "হাসপাতাল রক্তের চাহিদা ও শিডিউল" : "Hospital Blood Demand Board"}
          </Link>
          <Link
            href="/directory"
            onClick={() => setMobileOpen(false)}
            className={`block px-3 py-2 rounded-lg transition-colors ${
              pathname === "/directory" ? "bg-red-500/10 text-red-500 font-bold" : "text-[var(--text-primary)]"
            }`}
          >
            {language === "bn" ? "৪-স্তরের রক্তদাতা ডিরেক্টরি" : "Geo-Donor Directory"}
          </Link>
          <Link
            href="/membership"
            onClick={() => setMobileOpen(false)}
            className={`block px-3 py-2 rounded-lg transition-colors ${
              pathname === "/membership" ? "bg-amber-500/10 text-amber-500 font-bold" : "text-[var(--text-primary)]"
            }`}
          >
            {language === "bn" ? "মেম্বারশিপ ও সম্মাননা" : "Membership & Honors"}
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
            href="/fraud-shield"
            onClick={() => setMobileOpen(false)}
            className={`block px-3 py-2 rounded-lg transition-colors ${
              pathname === "/fraud-shield" ? "bg-red-500/10 text-red-500 font-bold" : "text-[var(--text-primary)]"
            }`}
          >
            {language === "bn" ? "প্রতারক ও দালাল ব্ল্যাকলিস্ট" : "Fraud Donor Blacklist"}
          </Link>
          <Link
            href="/clinical-shield"
            onClick={() => setMobileOpen(false)}
            className={`block px-3 py-2 rounded-lg transition-colors ${
              pathname === "/clinical-shield" ? "bg-red-500/10 text-red-500 font-bold" : "text-[var(--text-primary)]"
            }`}
          >
            {language === "bn" ? "রোগ ও রক্তের উপাদান শিল্ড" : "Clinical Disease Shield"}
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
            {!mounted ? (
              <div className="h-9" suppressHydrationWarning />
            ) : currentUser ? (
              <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-7 h-7 rounded-xl bg-red-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                    </span>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[var(--text-primary)] block truncate">{currentUser.name}</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium block truncate">{currentUser.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="px-2 py-1 rounded-md text-[11px] font-bold text-red-500 hover:bg-red-500/10 flex items-center gap-1 shrink-0"
                  >
                    <LogOut size={12} />
                    <span>{language === "bn" ? "লগআউট" : "Sign Out"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-[var(--border-subtle)]">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="py-1.5 px-2 text-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <LayoutDashboard size={13} />
                    <span>{language === "bn" ? "ড্যাশবোর্ড" : "Dashboard"}</span>
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    onClick={() => setMobileOpen(false)}
                    className="py-1.5 px-2 text-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Settings size={13} />
                    <span>{language === "bn" ? "প্রোফাইল" : "Profile"}</span>
                  </Link>
                </div>
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
  </header>
  );
}
