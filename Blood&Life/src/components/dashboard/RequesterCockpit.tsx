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
  ShieldAlert,
  ShieldCheck,
  Users,
  Check,
  X as CloseIcon,
} from "lucide-react";
import Link from "next/link";

interface PledgedDonor {
  donorId: string;
  donorName: string;
  donorPhone?: string;
  units?: number;
  status?: string;
  timestamp?: string;
}

interface RequesterCase {
  id: string;
  patientName: string;
  bloodGroup: string;
  units: number;
  hospital: string;
  district: string;
  status: string;
  urgency: string;
  isVerifiedGenuine?: boolean;
  assignedDonorName?: string;
  assignedDonorPhone?: string;
  pledges?: PledgedDonor[];
  createdAt: string;
}

interface RequesterCockpitProps {
  onOpenSos: () => void;
}

export function RequesterCockpit({ onOpenSos }: RequesterCockpitProps) {
  const { language } = useLanguage();
  const [cases, setCases] = useState<RequesterCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "done" | "canceled">("all");

  const fetchCases = async () => {
    try {
      setLoading(true);
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (!meData.authenticated || !meData.user) {
        setLoading(false);
        return;
      }
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
            urgency: r.urgency || "urgent",
            isVerifiedGenuine: r.isVerifiedGenuine,
            assignedDonorName: r.assignedDonorName,
            assignedDonorPhone: r.assignedDonorPhone,
            pledges: r.pledges || [],
            createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }) : "Recent",
          }))
        );
      }
    } catch (e) {
      console.error("Error fetching requester cases:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: "done" | "canceled") => {
    const isCancel = newStatus === "canceled";
    const confirmMsg = isCancel
      ? language === "bn"
        ? "আপনি কি নিশ্চিত যে এই রক্তের আবেদনটি বাতিল করতে চান?"
        : "Are you sure you want to cancel this emergency request?"
      : language === "bn"
      ? "রক্তদান সফলভাবে সম্পন্ন হয়েছে হিসেবে চিহ্নিত করতে চান?"
      : "Mark this emergency request as successfully fulfilled?";

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setCases((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
        );
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update status");
      }
    } catch (e) {
      console.error("Error updating case:", e);
    }
  };

  // Filtered list
  const filteredCases = cases.filter((c) => {
    if (filter === "all") return true;
    if (filter === "active") return c.status === "pending" || c.status === "inprogress";
    if (filter === "done") return c.status === "done";
    if (filter === "canceled") return c.status === "canceled" || c.status === "expired";
    return true;
  });

  const totalCases = cases.length;
  const activeCases = cases.filter((c) => c.status === "pending" || c.status === "inprogress").length;
  const completedCases = cases.filter((c) => c.status === "done").length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="card-clinical p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[var(--border-subtle)]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            <FileText size={12} />
            <span>{language === "bn" ? "রোগী ও গ্রহীতা ককপিট" : "PATIENT & REQUESTER COCKPIT"}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
            {language === "bn" ? "আপনার জরুরী রক্তের আবেদনের ইতিহাস" : "Your Emergency Blood Request History"}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {language === "bn"
              ? "আবেদনের অগ্রগতি, হাসপাতালের ভেরিফিকেশন এবং স্বেচ্ছাসেবী রক্তদাতাদের লাইভ স্ট্যাটাস পরিচালনা করুন।"
              : "Track live doctor verification, pledged donor dispatches, and hospital transfusion milestones."}
          </p>
        </div>

        <button
          onClick={onOpenSos}
          className="btn-emergency !py-2.5 !px-4 text-xs font-bold inline-flex items-center gap-2 shrink-0 shadow-md"
        >
          <PlusCircle size={15} />
          <span>{language === "bn" ? "নতুন রক্তের আবেদন (SOS)" : "New SOS Broadcast"}</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card-clinical p-4 text-center border border-[var(--border-subtle)]">
          <span className="text-xl sm:text-2xl font-black text-[var(--text-primary)] block">
            {totalCases}
          </span>
          <span className="text-[11px] font-bold text-[var(--text-muted)]">
            {language === "bn" ? "মোট আবেদন" : "Total Requests"}
          </span>
        </div>

        <div className="card-clinical p-4 text-center border border-amber-500/30 bg-amber-500/5">
          <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 block">
            {activeCases}
          </span>
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
            {language === "bn" ? "সক্রিয় লাইভ রিক্যুয়েস্ট" : "Active Broadcasts"}
          </span>
        </div>

        <div className="card-clinical p-4 text-center border border-emerald-500/30 bg-emerald-500/5">
          <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
            {completedCases}
          </span>
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
            {language === "bn" ? "রক্তদান সম্পন্ন" : "Fulfilled / Done"}
          </span>
        </div>
      </div>

      {/* Requests History Ledger */}
      <div className="card-clinical p-6 border border-[var(--border-subtle)] space-y-5">
        {/* Filter Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)]">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === "all"
                  ? "bg-red-600 text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-red-500"
              }`}
            >
              {language === "bn" ? "সকল আবেদন" : "All"} ({totalCases})
            </button>

            <button
              onClick={() => setFilter("active")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === "active"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-amber-600"
              }`}
            >
              {language === "bn" ? "সক্রিয়" : "Active"} ({activeCases})
            </button>

            <button
              onClick={() => setFilter("done")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === "done"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-emerald-600"
              }`}
            >
              {language === "bn" ? "সম্পন্ন" : "Fulfilled"} ({completedCases})
            </button>

            <button
              onClick={() => setFilter("canceled")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === "canceled"
                  ? "bg-zinc-700 text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-zinc-500"
              }`}
            >
              {language === "bn" ? "বাতিলকৃত" : "Canceled"}
            </button>
          </div>

          <span className="text-xs text-[var(--text-muted)] font-medium">
            {language === "bn"
              ? `প্রদর্শিত: ${filteredCases.length}টি আবেদন`
              : `Showing ${filteredCases.length} record(s)`}
          </span>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-8 text-center text-xs text-[var(--text-muted)]">
              Loading transfusion requests...
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-3">
              <CheckCircle2 size={36} className="text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {language === "bn" ? "এই ফিল্টারে কোনো আবেদন পাওয়া যায়নি" : "No Requests in this View"}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                {language === "bn"
                  ? "জরুরি রক্তের প্রয়োজন হলে 'নতুন রক্তের আবেদন' বাটনে ক্লিক করে হাসপাতালে ভর্তি রোগীর বিবরণ দিন।"
                  : "Submit an emergency SOS broadcast to rapidly notify matched donors near your hospital."}
              </p>
              <button
                onClick={onOpenSos}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                <PlusCircle size={14} />
                <span>{language === "bn" ? "নতুন রক্তের আবেদন তৈরি করুন" : "Create SOS Request"}</span>
              </button>
            </div>
          ) : (
            filteredCases.map((item) => {
              const isDone = item.status === "done";
              const isCanceled = item.status === "canceled" || item.status === "expired";
              const isActive = !isDone && !isCanceled;

              return (
                <div
                  key={item.id}
                  className={`card-clinical p-5 sm:p-6 border-2 transition-all space-y-4 ${
                    isDone
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : isCanceled
                      ? "border-zinc-300 dark:border-zinc-800 opacity-70"
                      : "border-red-500/30 hover:border-red-500/60"
                  }`}
                >
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
                    <div className="flex items-center gap-3">
                      <span className="badge-blood text-sm font-black px-3 py-1.5">
                        {item.bloodGroup}
                      </span>
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-[var(--text-primary)]">
                          {item.patientName} ({item.units} {language === "bn" ? "ব্যাগ প্রয়োজন" : "Units Needed"})
                        </h3>
                        <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-2 mt-0.5">
                          <span>{item.hospital}</span>
                          <span>•</span>
                          <span>{item.district}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {item.isVerifiedGenuine && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <ShieldCheck size={11} />
                          <span>{language === "bn" ? "ডাক্তার ভেরিফাইড" : "Doctor Verified"}</span>
                        </span>
                      )}

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isDone
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : isCanceled
                            ? "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border border-zinc-500/30"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse"
                        }`}
                      >
                        {isDone
                          ? language === "bn" ? "রক্তদান সম্পন্ন" : "Completed"
                          : isCanceled
                          ? language === "bn" ? "বাতিল" : "Canceled"
                          : language === "bn" ? "লাইভ সক্রিয়" : "Live Active"}
                      </span>

                      <span className="text-[11px] font-mono text-[var(--text-muted)]">
                        #{item.id.slice(-6).toUpperCase()} • {item.createdAt}
                      </span>
                    </div>
                  </div>

                  {/* Pledged / Assigned Donors Information */}
                  {item.pledges && item.pledges.length > 0 && (
                    <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-2">
                      <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                        <Users size={13} className="text-red-500" />
                        <span>{language === "bn" ? "অঙ্গীকারবদ্ধ রক্তদাতাবৃন্দ:" : "Pledged Blood Donors:"}</span>
                      </div>
                      <div className="space-y-1.5">
                        {item.pledges.map((p, pIdx) => (
                          <div
                            key={pIdx}
                            className="flex items-center justify-between text-xs bg-[var(--bg-surface)] p-2 rounded-lg border border-[var(--border-subtle)]"
                          >
                            <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                              <UserCheck size={13} className="text-emerald-500" />
                              <span>{p.donorName}</span>
                            </span>
                            {p.donorPhone && (
                              <a
                                href={`tel:${p.donorPhone}`}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] inline-flex items-center gap-1 hover:bg-emerald-500/20"
                              >
                                <PhoneCall size={11} />
                                <span>{p.donorPhone}</span>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <Link
                      href={`/search?tab=requests`}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>{language === "bn" ? "পাবলিক ভিউ দেখুন" : "View Live Feed"}</span>
                      <ArrowRight size={12} />
                    </Link>

                    {isActive && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateStatus(item.id, "done")}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Check size={13} />
                          <span>{language === "bn" ? "রক্ত পেয়েছি (সম্পন্ন)" : "Mark as Received"}</span>
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(item.id, "canceled")}
                          className="px-3 py-1.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-bold transition-colors"
                        >
                          <CloseIcon size={13} />
                          <span>{language === "bn" ? "আবেদন বাতিল" : "Cancel SOS"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
