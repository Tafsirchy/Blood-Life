"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/context";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  UserCheck,
  Building2,
  MapPin,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface RequesterCase {
  id: string;
  patientName: string;
  bloodGroup: string;
  units: number;
  hospital: string;
  district: string;
  status: string;
  isVerifiedGenuine?: boolean;
  assignedDonorName?: string;
  createdAt: string;
}

interface RequesterCockpitProps {
  onOpenSos: () => void;
}

export function RequesterCockpit({ onOpenSos }: RequesterCockpitProps) {
  const { language } = useLanguage();
  const [cases, setCases] = useState<RequesterCase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCases = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (!meData.authenticated || !meData.user) return;
      const userId = meData.user.id || meData.user._id;
      const res = await fetch(`/api/requests/search?requesterId=${userId}&status=all`);
      const data = await res.json();
      if (data.requests) {
        setCases(
          data.requests.map((r: any) => ({
            id: r._id,
            patientName: r.recipientName,
            bloodGroup: r.bloodGroup,
            units: r.unitsNeeded,
            hospital: r.hospital,
            district: r.district,
            status: r.status,
            isVerifiedGenuine: r.isVerifiedGenuine,
            assignedDonorName: r.assignedDonorName,
            createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Recent",
          }))
        );
      }
    } catch (e) {
      console.error("Error fetching requester cases:", e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCases();
  }, []);

  const handleCancelCase = async (id: string) => {
    const confirmMsg =
      language === "bn"
        ? "আপনি কি নিশ্চিত যে এই আবেদনটি বাতিল করতে চান?"
        : "Are you sure you want to cancel this emergency request?";
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "canceled" }),
      });
      if (res.ok) {
        setCases((prev: RequesterCase[]) => prev.map((c: RequesterCase) => (c.id === id ? { ...c, status: "canceled" } : c)));
      }
    } catch (e) {
      console.error("Error cancelling case:", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="card-clinical p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[var(--border-subtle)]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            <FileText size={12} />
            <span>{language === "bn" ? "রোগী ও স্বজনদের ড্যাশবোর্ড" : "PATIENT & REQUESTER CENTER"}</span>
          </div>
          <h2 className="text-xl font-black text-[var(--text-primary)]">
            {language === "bn" ? "আপনার জরুরী রক্তের আবেদনসমূহ" : "Active Transfusion Requests"}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {language === "bn"
              ? "আবেদনের অগ্রগতি, ভেরিফিকেশন স্ট্যাটাস ও রক্তদাতার সাথে সরাসরি যোগাযোগ রাখুন।"
              : "Track live verification, donor matching milestones, and coordinator dispatches."}
          </p>
        </div>

        <button
          onClick={onOpenSos}
          className="btn-emergency !py-2.5 !px-4 text-xs font-bold inline-flex items-center gap-2 shrink-0"
        >
          <PlusCircle size={15} />
          <span>{language === "bn" ? "নতুন রক্তের আবেদন" : "New SOS Broadcast"}</span>
        </button>
      </div>

      {/* Case Tracker Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="card-clinical p-8 text-center text-xs text-[var(--text-muted)]">
            Loading emergency cases...
          </div>
        ) : cases.length === 0 ? (
          <div className="card-clinical p-10 text-center space-y-3">
            <CheckCircle2 size={36} className="text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {language === "bn" ? "কোন সক্রিয় আবেদন নেই" : "No Active Emergency Requests"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
              {language === "bn"
                ? "জরুরি রক্তের প্রয়োজন হলে উপরের বাটনে ক্লিক করে নতুন আবেদন প্রচার করুন।"
                : "Submit an emergency SOS broadcast whenever blood transfusion is urgently needed."}
            </p>
          </div>
        ) : (
          cases.map((item: RequesterCase) => (
            <div
              key={item.id}
              className="card-clinical p-6 border-2 border-[var(--border-subtle)] hover:border-red-500/30 transition-all space-y-5"
            >
              {/* Header info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center gap-2">
                  <span className="badge-blood text-sm font-black px-2.5 py-1">
                    {item.bloodGroup}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      {item.patientName} ({item.units} {language === "bn" ? "ব্যাগ" : "Units"})
                    </h3>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {item.hospital} • {item.district}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[var(--text-muted)]">
                    #{item.id.slice(-6).toUpperCase()} • {item.createdAt}
                  </span>
                  {item.status !== "canceled" && item.status !== "done" && item.status !== "expired" && (
                    <button
                      onClick={() => handleCancelCase(item.id)}
                      className="px-2.5 py-1 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 text-[11px] font-bold transition-colors"
                    >
                      {language === "bn" ? "আবেদন বাতিল" : "Cancel SOS"}
                    </button>
                  )}
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-between text-xs font-bold px-1">
                <span className="text-[var(--text-secondary)]">
                  {language === "bn" ? "বর্তমান অবস্থা:" : "Current Status:"}{" "}
                  <strong className="text-red-500 uppercase">{item.status}</strong>
                </span>
                <Link
                  href={`/requests/${item.id}`}
                  className="text-red-500 hover:underline inline-flex items-center gap-1 text-[11px]"
                >
                  <span>{language === "bn" ? "বিস্তারিত দেখুন" : "View Live Ticket"}</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
