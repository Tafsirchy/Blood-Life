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
  Star,
  Award,
  MessageSquare,
  Pencil,
  Trash2,
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
  assignedDonorId?: string;
  recipientVerification?: {
    isVerified: boolean;
    verifiedDonorName?: string;
    verifiedAt?: string;
    rating?: number;
    feedback?: string;
  };
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

  // Recipient Donor 1-Click Verification State
  const [verifyingCase, setVerifyingCase] = useState<RequesterCase | null>(null);
  const [selectedDonorId, setSelectedDonorId] = useState<string>("");
  const [selectedDonorName, setSelectedDonorName] = useState<string>("");
  const [selectedDonorPhone, setSelectedDonorPhone] = useState<string>("");
  const [verifyRating, setVerifyRating] = useState<number>(5);
  const [verifyFeedback, setVerifyFeedback] = useState<string>("");
  const [submittingVerify, setSubmittingVerify] = useState<boolean>(false);
  const [verifySuccessMsg, setVerifySuccessMsg] = useState<string>("");

  // Edit Request Modal State
  const [editingCase, setEditingCase] = useState<RequesterCase | null>(null);
  const [editForm, setEditForm] = useState({
    recipientName: "",
    hospital: "",
    unitsNeeded: 1,
    urgency: "urgent" as "critical" | "urgent" | "standard",
  });
  const [savingEdit, setSavingEdit] = useState(false);

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
            assignedDonorId: r.assignedDonorId,
            assignedDonorName: r.assignedDonorName,
            assignedDonorPhone: r.assignedDonorPhone,
            recipientVerification: r.recipientVerification,
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

  const handleRecipientVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingCase) return;

    try {
      setSubmittingVerify(true);
      const res = await fetch(`/api/requests/${verifyingCase.id}/recipient-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorId: selectedDonorId || verifyingCase.assignedDonorId || (verifyingCase.pledges?.[0]?.donorId),
          donorName: selectedDonorName || verifyingCase.assignedDonorName || (verifyingCase.pledges?.[0]?.donorName),
          donorPhone: selectedDonorPhone || verifyingCase.assignedDonorPhone || (verifyingCase.pledges?.[0]?.donorPhone),
          rating: verifyRating,
          feedback: verifyFeedback,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setVerifySuccessMsg(data.message);
        await fetchCases();
        setTimeout(() => {
          setVerifyingCase(null);
          setVerifySuccessMsg("");
        }, 2000);
      } else {
        alert(data.error || "Failed to verify donation.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      alert("Network error. Please try again.");
    } finally {
      setSubmittingVerify(false);
    }
  };

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

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCase) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/requests/${editingCase.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCases((prev) =>
          prev.map((c) =>
            c.id === editingCase.id
              ? {
                  ...c,
                  patientName: editForm.recipientName,
                  hospital: editForm.hospital,
                  units: editForm.unitsNeeded,
                  urgency: editForm.urgency,
                }
              : c
          )
        );
        setEditingCase(null);
      } else {
        alert(data.error || "Failed to update request");
      }
    } catch {
      alert("Network error while updating request.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    const confirmMsg =
      language === "bn"
        ? "আপনি কি স্থায়ীভাবে এই রক্তের আবেদনটি মুছে ফেলতে চান?"
        : "Permanently delete this blood request record?";
    if (!window.confirm(confirmMsg)) return;
    try {
      const res = await fetch(`/api/requests/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCases((prev) => prev.filter((c) => c.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete request");
      }
    } catch {
      alert("Network error while deleting request.");
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

                    {/* Completed Transfusion Peer Verification Section */}
                    {isDone && (
                      <div className="flex items-center gap-2">
                        {item.recipientVerification?.isVerified ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                            <Award size={14} className="text-emerald-500" />
                            <span>
                              {language === "bn"
                                ? `গ্রহীতা কর্তৃক রক্তদান ভেরিফাইড (${item.recipientVerification.rating || 5}★)`
                                : `Recipient Verified Voluntary Donor (${item.recipientVerification.rating || 5}★)`}
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setVerifyingCase(item);
                              const defaultPledge = item.pledges?.[0];
                              setSelectedDonorId(defaultPledge?.donorId || item.assignedDonorId || "");
                              setSelectedDonorName(defaultPledge?.donorName || item.assignedDonorName || (language === "bn" ? "স্বেচ্ছাসেবী রক্তদাতা" : "Voluntary Donor"));
                              setSelectedDonorPhone(defaultPledge?.donorPhone || item.assignedDonorPhone || "");
                              setVerifyRating(5);
                              setVerifyFeedback("");
                              setVerifySuccessMsg("");
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs"
                          >
                            <Star size={13} className="text-amber-500 fill-amber-500" />
                            <span>{language === "bn" ? "রক্তদাতার অবদান ভেরিফাই করুন" : "Verify Donor Recognition"}</span>
                          </button>
                        )}
                      </div>
                    )}

                    {isActive && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCase(item);
                            setEditForm({
                              recipientName: item.patientName,
                              hospital: item.hospital,
                              unitsNeeded: item.units,
                              urgency: (item.urgency as "critical" | "urgent" | "standard") || "urgent",
                            });
                          }}
                          className="px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-main)] text-xs font-bold inline-flex items-center gap-1 transition-colors"
                        >
                          <Pencil size={12} />
                          <span>{language === "bn" ? "সম্পাদনা" : "Edit"}</span>
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(item.id, "done")}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Check size={13} />
                          <span>{language === "bn" ? "রক্ত পেয়েছি (সম্পন্ন)" : "Mark as Received"}</span>
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(item.id, "canceled")}
                          className="px-3 py-1.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-bold inline-flex items-center gap-1 transition-colors"
                        >
                          <CloseIcon size={13} />
                          <span>{language === "bn" ? "বাতিল" : "Cancel"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteRequest(item.id)}
                          className="p-1.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title={language === "bn" ? "মুছে ফেলুন" : "Delete Request"}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}

                    {isCanceled && (
                      <button
                        type="button"
                        onClick={() => handleDeleteRequest(item.id)}
                        className="px-3 py-1.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-bold inline-flex items-center gap-1 transition-colors"
                      >
                        <Trash2 size={12} />
                        <span>{language === "bn" ? "স্থায়ীভাবে মুছুন" : "Delete"}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 1-Click Recipient Donor Verification Modal */}
        {verifyingCase && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center gap-2 text-amber-500">
                  <Star size={20} className="fill-amber-500" />
                  <h3 className="text-base font-black text-[var(--text-primary)]">
                    {language === "bn" ? "স্বেচ্ছাসেবী রক্তদাতা ভেরিফিকেশন" : "Voluntary Donor Verification"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setVerifyingCase(null)}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                >
                  <CloseIcon size={18} />
                </button>
              </div>

              {verifySuccessMsg ? (
                <div className="p-6 text-center space-y-3">
                  <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">
                    {verifySuccessMsg}
                  </h4>
                </div>
              ) : (
                <form onSubmit={handleRecipientVerify} className="space-y-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--text-secondary)]">
                        {language === "bn" ? "রক্তগ্রহীতা রোগী:" : "Recipient Patient:"} {verifyingCase.patientName}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 font-bold border border-red-500/20">
                        {verifyingCase.bloodGroup}
                      </span>
                    </div>

                    {verifyingCase.pledges && verifyingCase.pledges.length > 1 ? (
                      <div>
                        <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1">
                          {language === "bn" ? "কোন রক্তদাতা রক্ত দিয়েছেন নির্বাচন করুন:" : "Select which donor donated:"}
                        </label>
                        <select
                          value={selectedDonorId}
                          onChange={(e) => {
                            const found = verifyingCase.pledges?.find((p) => p.donorId === e.target.value);
                            if (found) {
                              setSelectedDonorId(found.donorId);
                              setSelectedDonorName(found.donorName);
                              setSelectedDonorPhone(found.donorPhone || "");
                            }
                          }}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-bold text-xs text-[var(--text-primary)] focus:outline-none focus:border-red-500"
                        >
                          {verifyingCase.pledges.map((p, idx) => (
                            <option key={idx} value={p.donorId}>
                              {p.donorName} {p.donorPhone ? `(${p.donorPhone})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="pt-1.5 text-xs border-t border-[var(--border-subtle)] flex items-center justify-between">
                        <span className="text-[var(--text-muted)] font-medium">
                          {language === "bn" ? "স্বেচ্ছাসেবী রক্তদাতা:" : "Voluntary Donor:"}
                        </span>
                        <span className="font-black text-[var(--text-primary)] flex items-center gap-1.5">
                          <UserCheck size={13} className="text-emerald-500" />
                          <span>{selectedDonorName}</span>
                          {selectedDonorPhone && (
                            <span className="font-mono text-[11px] text-[var(--text-muted)]">
                              ({selectedDonorPhone})
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 5-Star Rating */}
                  <div>
                    <label className="block font-bold text-[var(--text-primary)] mb-2">
                      {language === "bn" ? "রক্তদাতার স্বেচ্ছাসেবার রেটিং দিন:" : "Rate Voluntary Donor Experience:"}
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setVerifyRating(star)}
                          className="p-1 hover:scale-115 transition-transform"
                        >
                          <Star
                            size={24}
                            className={
                              star <= verifyRating
                                ? "text-amber-500 fill-amber-500"
                                : "text-zinc-300 dark:text-zinc-700"
                            }
                          />
                        </button>
                      ))}
                      <span className="ml-2 font-black text-sm text-[var(--text-primary)]">
                        {verifyRating} / 5
                      </span>
                    </div>
                  </div>

                  {/* Gratitude / Feedback message */}
                  <div>
                    <label className="block font-bold text-[var(--text-primary)] mb-1">
                      {language === "bn" ? "রক্তদাতার প্রতি ধন্যবাদ বা মন্তব্য (ঐচ্ছিক):" : "Gratitude or Notes (Optional):"}
                    </label>
                    <textarea
                      rows={3}
                      value={verifyFeedback}
                      onChange={(e) => setVerifyFeedback(e.target.value)}
                      placeholder={
                        language === "bn"
                          ? "যেমন: উনি সঠিক সময়ে এসে বিনা মূল্যে রক্ত দিয়ে আমার রোগীর জীবন বাঁচিয়েছেন..."
                          : "e.g. Arrived on time and voluntarily donated without taking any money..."
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:outline-none focus:border-red-500 text-xs text-[var(--text-primary)]"
                    />
                  </div>

                  {/* Safety Warning */}
                  <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-600 dark:text-red-400 flex items-start gap-2">
                    <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                    <span>
                      {language === "bn"
                        ? "রক্তদাতা কি কোনো টাকা বা অগ্রিম বিকাশ দাবি করেছিলেন? অসদাচরণের শিকার হলে আমাদের প্রতারক প্রতিরোধ সেলে রিপোর্ট করুন।"
                        : "Did the donor ask for payment or extortion? Report them immediately on our Fraud Shield."}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Link
                      href="/fraud-shield"
                      onClick={() => setVerifyingCase(null)}
                      className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline"
                    >
                      {language === "bn" ? "প্রতারণা রিপোর্ট করুন" : "Report Fraud"}
                    </Link>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setVerifyingCase(null)}
                        className="px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] font-bold hover:bg-[var(--bg-main)]"
                      >
                        {language === "bn" ? "বাতিল" : "Cancel"}
                      </button>
                      <button
                        type="submit"
                        disabled={submittingVerify}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                      >
                        <Check size={13} />
                        <span>
                          {submittingVerify
                            ? language === "bn" ? "ভেরিফাই হচ্ছে..." : "Verifying..."
                            : language === "bn" ? "ভেরিফিকেশন সম্পন্ন করুন" : "Confirm Verification"}
                        </span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Edit Request Modal */}
        {editingCase && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center gap-2 text-red-500">
                  <Pencil size={18} />
                  <h3 className="text-base font-black text-[var(--text-primary)]">
                    {language === "bn" ? "আবেদনের তথ্য সম্পাদনা" : "Edit Blood Request"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingCase(null)}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-main)]"
                >
                  <CloseIcon size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-[var(--text-secondary)] mb-1">
                    {language === "bn" ? "রোগীর নাম" : "Patient Name"}
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.recipientName}
                    onChange={(e) => setEditForm({ ...editForm, recipientName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[var(--text-secondary)] mb-1">
                    {language === "bn" ? "হাসপাতালের নাম" : "Hospital Name"}
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.hospital}
                    onChange={(e) => setEditForm({ ...editForm, hospital: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] outline-none focus:border-red-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[var(--text-secondary)] mb-1">
                      {language === "bn" ? "প্রয়োজনীয় ব্যাগ" : "Units Needed"}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      required
                      value={editForm.unitsNeeded}
                      onChange={(e) => setEditForm({ ...editForm, unitsNeeded: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[var(--text-secondary)] mb-1">
                      {language === "bn" ? "জরুরি স্তর" : "Urgency"}
                    </label>
                    <select
                      value={editForm.urgency}
                      onChange={(e) => setEditForm({ ...editForm, urgency: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] outline-none font-bold"
                    >
                      <option value="critical">Critical</option>
                      <option value="urgent">Urgent</option>
                      <option value="standard">Standard</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingCase(null)}
                    className="px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] font-bold"
                  >
                    {language === "bn" ? "বাতিল" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-50"
                  >
                    {savingEdit
                      ? language === "bn" ? "সংরক্ষণ হচ্ছে..." : "Saving..."
                      : language === "bn" ? "আপডেট সংরক্ষণ করুন" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
