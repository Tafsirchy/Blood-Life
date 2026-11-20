"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { DonorCockpit } from "@/components/dashboard/DonorCockpit";
import { RequesterCockpit } from "@/components/dashboard/RequesterCockpit";
import { VolunteerCockpit } from "@/components/dashboard/VolunteerCockpit";
import { AdminCommandCenter } from "@/components/dashboard/AdminCommandCenter";
import { SosBroadcastModal } from "@/components/requests/SosBroadcastModal";
import { Heart, FileText, ShieldCheck, ShieldAlert } from "lucide-react";

type RoleTab = "donor" | "requester" | "volunteer" | "admin";

export default function DashboardPage() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<RoleTab>("donor");
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          const role = data.user.role;
          setUserRole(role);
          if (role === "Admin") {
            setActiveTab("admin");
          } else if (role === "Volunteer") {
            setActiveTab("volunteer");
          }
        }
      })
      .catch(() => {});
  }, []);

  const isVolunteerOrAdmin = userRole === "Volunteer" || userRole === "Admin";
  const isAdmin = userRole === "Admin";

  return (
    <div className="space-y-6">
      {/* Role Switcher Pills */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
            {language === "bn" ? "ব্যবহারকারী কমান্ড সেন্টার" : "Multi-Role Dashboard Ecosystem"}
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {language === "bn"
              ? "রক্তদাতা, রোগী, ভলান্টিয়ার এবং এডমিন ভিউয়ের মধ্যে সহজে সুইচ করুন।"
              : "Switch between dedicated role views: Donor Health Dial, Requester Milestones, Triage & Admin Moderation."}
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <button
            onClick={() => setActiveTab("donor")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "donor"
                ? "bg-red-600 text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-red-500"
            }`}
          >
            <Heart size={13} fill={activeTab === "donor" ? "currentColor" : "none"} />
            <span>{language === "bn" ? "রক্তদাতা" : "Donor"}</span>
          </button>

          <button
            onClick={() => setActiveTab("requester")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "requester"
                ? "bg-red-600 text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-red-500"
            }`}
          >
            <FileText size={13} />
            <span>{language === "bn" ? "রোগী/স্বজন" : "Requester"}</span>
          </button>

          {isVolunteerOrAdmin && (
            <button
              onClick={() => setActiveTab("volunteer")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "volunteer"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-emerald-500"
              }`}
            >
              <ShieldCheck size={13} />
              <span>{language === "bn" ? "ভলান্টিয়ার" : "Volunteer"}</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "admin"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-zinc-400"
              }`}
            >
              <ShieldAlert size={13} />
              <span>{language === "bn" ? "এডমিন" : "Admin"}</span>
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
