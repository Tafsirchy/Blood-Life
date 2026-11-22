"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { DonorCockpit } from "@/components/dashboard/DonorCockpit";
import { RequesterCockpit } from "@/components/dashboard/RequesterCockpit";
import { VolunteerCockpit } from "@/components/dashboard/VolunteerCockpit";
import { AdminCommandCenter } from "@/components/dashboard/AdminCommandCenter";
import { SosBroadcastModal } from "@/components/requests/SosBroadcastModal";
import { Heart, FileText, ShieldCheck, ShieldAlert, ArrowLeftRight, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";

type RoleTab = "donor" | "requester" | "volunteer" | "admin";

export default function DashboardPage() {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<RoleTab>("donor");
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    // Check URL param first
    const roleParam = searchParams.get("role");
    const savedRole = localStorage.getItem("dashboard_preferred_role") as RoleTab | null;

    if (roleParam === "donor" || roleParam === "requester") {
      setActiveTab(roleParam);
    } else if (savedRole === "donor" || savedRole === "requester") {
      setActiveTab(savedRole);
    }

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          const role = data.user.role;
          setUserRole(role);
          if (data.user.name) setUserName(data.user.name);

          // If no URL or local preference was set, default according to backend role
          if (!roleParam && !savedRole) {
            if (role === "Requester") {
              setActiveTab("requester");
            } else if (role === "Volunteer") {
              setActiveTab("volunteer");
            } else if (role === "Admin") {
              setActiveTab("admin");
            } else {
              setActiveTab("donor");
            }
          }
        }
      })
      .catch(() => {});
  }, [searchParams]);

  const handleRoleSwitch = (tab: RoleTab) => {
    setActiveTab(tab);
    localStorage.setItem("dashboard_preferred_role", tab);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("role", tab);
    window.history.replaceState({}, "", newUrl.toString());
  };

  const isVolunteerOrAdmin = userRole === "Volunteer" || userRole === "Admin";
  const isAdmin = userRole === "Admin";

  return (
    <div className="space-y-6">
      {/* Prominent Multi-Role Switcher Header */}
      <div className="card-clinical p-5 sm:p-6 border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
              <Sparkles size={11} />
              <span>{language === "bn" ? "ব্যবহারকারী মাল্টি-রোল কন্ট্রোল" : "DUAL-ROLE COMMAND CENTER"}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
              {userName
                ? language === "bn" ? `স্বাগতম, ${userName}!` : `Welcome, ${userName}!`
                : language === "bn" ? "ইউজার কমান্ড সেন্টার" : "User Command Center"}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {language === "bn"
                ? "একই একাউন্ট থেকে যেকোনো সময় রক্তদাতা এবং রক্তগ্রহীতা হিসেবে ভূমিকা পরিবর্তন করুন ও আলাদা ইতিহাস দেখুন।"
                : "Seamlessly switch between Blood Donor and Blood Requester modes with independent activity ledgers."}
            </p>
          </div>

          {/* Primary Role Switcher Toggle */}
          <div className="inline-flex p-1 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] shadow-2xs self-start md:self-auto">
            {/* Donor Mode Tab */}
            <button
              type="button"
              onClick={() => handleRoleSwitch("donor")}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === "donor"
                  ? "bg-red-600 text-white shadow-md scale-102"
                  : "text-[var(--text-secondary)] hover:text-red-500"
              }`}
            >
              <Heart size={15} className={activeTab === "donor" ? "fill-current" : ""} />
              <span>{language === "bn" ? "রক্তদাতা মোড (Donor)" : "Donor Mode"}</span>
            </button>

            {/* Requester Mode Tab */}
            <button
              type="button"
              onClick={() => handleRoleSwitch("requester")}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === "requester"
                  ? "bg-red-600 text-white shadow-md scale-102"
                  : "text-[var(--text-secondary)] hover:text-red-500"
              }`}
            >
              <FileText size={15} />
              <span>{language === "bn" ? "গ্রহীতা মোড (Requester)" : "Requester Mode"}</span>
            </button>

            {/* Staff / Volunteer Tab if permitted */}
            {isVolunteerOrAdmin && (
              <button
                type="button"
                onClick={() => handleRoleSwitch("volunteer")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "volunteer"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-[var(--text-secondary)] hover:text-emerald-500"
                }`}
              >
                <ShieldCheck size={14} />
                <span>{language === "bn" ? "ভলান্টিয়ার" : "Volunteer"}</span>
              </button>
            )}

            {/* Staff / Admin Tab if permitted */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => handleRoleSwitch("admin")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "admin"
                    ? "bg-zinc-800 text-white shadow-md"
                    : "text-[var(--text-secondary)] hover:text-zinc-400"
                }`}
              >
                <ShieldAlert size={14} />
                <span>{language === "bn" ? "এডমিন" : "Admin"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Informative Active State Ribbon with Quick-Switch Action */}
        <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span>
              {activeTab === "donor"
                ? language === "bn"
                  ? "বর্তমানে সক্রিয়: রক্তদাতা ভিউ — আপনার রক্তদানের ইতিহাস, স্বাস্থ্য বিরতি ও সার্টিফিকেট প্রদর্শিত হচ্ছে।"
                  : "Active View: Donor Mode — Viewing your completed donation records, biological cooldown, and certificates."
                : activeTab === "requester"
                ? language === "bn"
                  ? "বর্তমানে সক্রিয়: রক্ত গ্রহীতা ভিউ — আপনার জরুরি রক্তের আবেদনের ইতিহাস ও সাড়া প্রদানকারী রক্তদাতাদের তথ্য প্রদর্শিত হচ্ছে।"
                  : "Active View: Requester Mode — Managing your emergency blood requests, volunteer verifications, and matched donors."
                : language === "bn"
                ? "বর্তমানে সক্রিয়: বিশেষায়িত স্টাফ ভিউ।"
                : "Active View: Specialized Staff Dashboard."}
            </span>
          </div>

          {(activeTab === "donor" || activeTab === "requester") && (
            <button
              type="button"
              onClick={() => handleRoleSwitch(activeTab === "donor" ? "requester" : "donor")}
              className="inline-flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400 hover:underline shrink-0"
            >
              <ArrowLeftRight size={12} />
              <span>
                {activeTab === "donor"
                  ? language === "bn" ? "গ্রহীতা মোডে যেতে ক্লিক করুন" : "Switch to Requester Mode"
                  : language === "bn" ? "রক্তদাতা মোডে যেতে ক্লিক করুন" : "Switch to Donor Mode"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Render Active Role Cockpit */}
      {activeTab === "donor" && <DonorCockpit />}
      {activeTab === "requester" && <RequesterCockpit onOpenSos={() => setIsSosOpen(true)} />}
      {activeTab === "volunteer" && isVolunteerOrAdmin && <VolunteerCockpit />}
      {activeTab === "admin" && isAdmin && <AdminCommandCenter />}

      {/* SOS Modal */}
      <SosBroadcastModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        onSuccess={() => setIsSosOpen(false)}
      />
    </div>
  );
}
