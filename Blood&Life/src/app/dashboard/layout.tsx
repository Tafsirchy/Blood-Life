"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { EmergencyFooter } from "@/components/home/EmergencyFooter";
import { useLanguage } from "@/lib/i18n/context";
import {
  LayoutDashboard,
  ShieldCheck,
  Settings,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language } = useLanguage();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated && d.user) {
          setUserRole(d.user.role);
        }
      })
      .catch(() => {});
  }, []);

  const isStaff = userRole === "Volunteer" || userRole === "Admin";

  const navItems = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      labelEn: "Overview Cockpit",
      labelBn: "ড্যাশবোর্ড ওভারভিউ",
    },
    ...(isStaff
      ? [
          {
            href: "/dashboard/volunteer",
            icon: ShieldCheck,
            labelEn: "Volunteer Triage",
            labelBn: "প্রেসক্রিপশন ভেরিফিকেশন",
          },
        ]
      : []),
    {
      href: "/dashboard/settings",
      icon: Settings,
      labelEn: "Privacy & Profile",
      labelBn: "প্রাইভেসি ও প্রোফাইল",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
      <Navbar />

      {/* Subnav Ribbon */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium">
            <Link href="/" className="hover:text-red-500 transition-colors">
              {language === "bn" ? "হোম" : "Home"}
            </Link>
            <ChevronRight size={12} />
            <span className="text-[var(--text-primary)] font-bold">
              {language === "bn" ? "ড্যাশবোর্ড" : "Dashboard"}
            </span>
          </div>

          {/* Quick Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors shrink-0 ${
                    isActive
                      ? "bg-red-500/10 text-red-500 border border-red-500/20"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-main)]"
                  }`}
                >
                  <Icon size={13} />
                  <span>{language === "bn" ? item.labelBn : item.labelEn}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>

      <EmergencyFooter />
    </div>
  );
}
