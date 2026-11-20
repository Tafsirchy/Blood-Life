"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { Navbar } from "@/components/layout/Navbar";
import { EmergencyFooter } from "@/components/home/EmergencyFooter";
import {
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
} from "lucide-react";

interface PendingCase {
  id: string;
  patientName: string;
  bloodGroup: string;
  units: number;
  hospital: string;
  district: string;
  urgency: "critical" | "urgent" | "standard";
  requesterName: string;
  requesterPhone: string;
  createdAt: string;
  prescriptionUrl: string;
  doctorNotes: string;
}

const SAMPLE_PENDING_CASES: PendingCase[] = [
  {
    id: "case-v1",
    patientName: "Tasneem Rahman",
    bloodGroup: "O-",
    units: 2,
    hospital: "Dhaka Medical College Hospital (DMCH ICU-3)",
    district: "Dhaka",
    urgency: "critical",
    requesterName: "Tanvir Rahman (Husband)",
    requesterPhone: "+880 1711-002233",
    createdAt: "12 minutes ago",
    prescriptionUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80",
    doctorNotes: "Emergency Cesarean section. Severe post-partum hemorrhage. Immediate 2 units of O- packed red blood cells requested by Dr. S. K. Roy (Gynae Registrar).",
  },
  {
    id: "case-v2",
    patientName: "Abdul Gafur",
    bloodGroup: "B+",
    units: 3,
    hospital: "Chittagong Medical College Hospital",
    district: "Chittagong",
    urgency: "critical",
    requesterName: "Zahid Gafur (Son)",
    requesterPhone: "+880 1819-445566",
    createdAt: "25 minutes ago",
    prescriptionUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80",
    doctorNotes: "Multiple trauma, polytrauma ward, fracture femur & internal pelvic bleed. Cross-matched B+ needed urgently.",
  },
];

export default function VolunteerTriageStation() {
  const { language } = useLanguage();
  const [cases, setCases] = useState<PendingCase[]>(SAMPLE_PENDING_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(SAMPLE_PENDING_CASES[0]?.id || "");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activeCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  const handleVerifyCase = async () => {
    if (!activeCase) return;
    setActionLoading(true);
    try {
      await fetch(`/api/requests/${activeCase.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "VERIFY" }),
      });

      setSuccessMessage(
        language === "bn"
          ? `কেস #${activeCase.id} সফলভাবে যাচাই ও সক্রিয় করা হয়েছে!`
          : `Case #${activeCase.id} verified genuine and prioritized!`
      );
      setCases((prev) => prev.filter((c) => c.id !== activeCase.id));
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectCase = async () => {
    if (!activeCase) return;
    setActionLoading(true);
    try {
      await fetch(`/api/requests/${activeCase.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT", rejectReason }),
      });

      setRejectModalOpen(false);
      setRejectReason("");
      setCases((prev) => prev.filter((c) => c.id !== activeCase.id));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
      <Navbar onOpenSos={() => {}} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[var(--border-subtle)]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-bold uppercase tracking-wider mb-1.5">
              <ShieldCheck size={13} />
              <span>{language === "bn" ? "ভলান্টিয়ার ট্রায়াজ স্টেশন" : "VOLUNTEER VERIFICATION DESK"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              {language === "bn" ? "ডাক্তার প্রেসক্রিপশন ও বেড টিকিট যাচাইকরণ" : "Prescription Triage & Verification"}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              {language === "bn"
                ? "হাসপাতালের কাগজপত্র ও ডাক্তারের সিল পরীক্ষা করে প্রকৃত জরুরী কেসগুলোকে ভেরিফাইড ব্যাজ প্রদান করুন।"
                : "Inspect hospital bed tickets and physician seals to ensure zero brokers and 100% genuine patient aid."}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold">
              {cases.length} {language === "bn" ? "টি কেস অপেক্ষমান" : "Pending Cases"}
            </span>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {cases.length === 0 ? (
          <div className="card-clinical p-12 text-center max-w-lg mx-auto space-y-3">
            <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              {language === "bn" ? "সব কেস যাচাই সম্পন্ন!" : "All Prescriptions Audited!"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {language === "bn"
                ? "এই মুহূর্তে কোনো অমীমাংসিত প্রেসক্রিপশন নেই। নতুন আবেদন এলে স্বয়ংক্রিয়ভাবে নোটিফিকেশন আসবে।"
                : "No pending triage cases currently awaiting verification in this region."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Queue List (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)] px-1">
                {language === "bn" ? "অপেক্ষমান কেসের তালিকা" : "Pending Queue"}
              </h2>

              <div className="space-y-2.5">
                {cases.map((c) => {
                  const isSelected = c.id === activeCase?.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCaseId(c.id);
                        setZoomLevel(1);
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                        isSelected
                          ? "bg-[var(--bg-surface)] border-red-500 shadow-md ring-1 ring-red-500/30"
                          : "bg-[var(--bg-surface)]/60 border-[var(--border-subtle)] hover:border-red-500/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="badge-blood text-xs font-black px-2 py-0.5">
                          {c.bloodGroup}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 flex items-center gap-1">
                          <Clock size={10} />
                          {c.createdAt}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-[var(--text-primary)] truncate">
                        {c.patientName}
                      </h3>
                      <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                        {c.hospital}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Detailed Inspector (8 cols) */}
            {activeCase && (
              <div className="lg:col-span-8 space-y-4">
                {/* Prescription Pan & Zoom Viewer */}
                <div className="card-clinical p-4 border border-[var(--border-subtle)] space-y-3">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-red-500" />
                      <span className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                        {language === "bn" ? "প্রেসক্রিপশন / বেড টিকিট ভিউয়ার" : "Medical Requisition Slip"}
                      </span>
                    </div>

                    {/* Zoom Toolbar */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleZoomOut}
                        className="p-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-main)] text-[var(--text-secondary)] transition-colors"
                        title="Zoom Out"
                      >
                        <ZoomOut size={14} />
                      </button>
                      <span className="text-xs font-mono font-bold text-[var(--text-muted)] px-1">
                        {Math.round(zoomLevel * 100)}%
                      </span>
                      <button
                        onClick={handleZoomIn}
                        className="p-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-main)] text-[var(--text-secondary)] transition-colors"
                        title="Zoom In"
                      >
                        <ZoomIn size={14} />
                      </button>
                      <button
                        onClick={handleResetZoom}
                        className="p-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-main)] text-[var(--text-secondary)] transition-colors"
                        title="Reset Zoom"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Image Viewport */}
                  <div className="h-80 sm:h-96 rounded-xl bg-black/90 overflow-hidden relative flex items-center justify-center border border-[var(--border-subtle)]">
                    <img
                      src={activeCase.prescriptionUrl}
                      alt="Hospital Requisition Slip"
                      className="max-h-full object-contain transition-transform duration-150 cursor-grab active:cursor-grabbing"
                      style={{ transform: `scale(${zoomLevel})` }}
                    />
                  </div>
                </div>

                {/* Case Details Card */}
                <div className="card-clinical p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[11px] font-bold text-[var(--text-muted)] block">
                        {language === "bn" ? "রোগীর নাম" : "Patient Name"}
                      </span>
                      <span className="font-bold text-[var(--text-primary)] text-sm">
                        {activeCase.patientName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[var(--text-muted)] block">
                        {language === "bn" ? "প্রয়োজনীয় রক্ত" : "Blood & Units"}
                      </span>
                      <span className="font-bold text-red-500 text-sm">
                        {activeCase.bloodGroup} • {activeCase.units} {language === "bn" ? "ব্যাগ" : "Units"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[var(--text-muted)] block">
                        {language === "bn" ? "হাসপাতাল ও জেলা" : "Hospital & District"}
                      </span>
                      <span className="font-medium text-[var(--text-secondary)]">
                        {activeCase.hospital}, {activeCase.district}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[var(--text-muted)] block">
                        {language === "bn" ? "আবেদনকারী ও ফোন" : "Requester & Phone"}
                      </span>
                      <span className="font-medium text-[var(--text-secondary)]">
                        {activeCase.requesterName} ({activeCase.requesterPhone})
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                    <span className="font-bold text-[var(--text-primary)] block mb-1">
                      {language === "bn" ? "ডাক্তার বা নার্স নির্দেশিকা নোট:" : "Clinical Notes:"}
                    </span>
                    {activeCase.doctorNotes}
                  </div>

                  {/* Verification Decision Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={handleVerifyCase}
                      disabled={actionLoading}
                      className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 size={16} />
                      <span>{language === "bn" ? "যাচাইকৃত নিশ্চিত করুন (Verify Genuine)" : "Approve Genuine Prescription"}</span>
                    </button>

                    <button
                      onClick={() => setRejectModalOpen(true)}
                      disabled={actionLoading}
                      className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-red-500/40 text-red-500 hover:bg-red-500/10 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <XCircle size={16} />
                      <span>{language === "bn" ? "প্রত্যাখ্যান / বাতিল" : "Reject / Flag"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-clinical max-w-md w-full p-6 space-y-4">
            <h3 className="text-sm font-black text-[var(--text-primary)]">
              {language === "bn" ? "কেস বাতিলের কারণ উল্লেখ করুন" : "Reason for Rejection"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {language === "bn"
                ? "প্রেসক্রিপশন অস্পষ্ট, মেয়াদোত্তীর্ণ বা ভুয়া মনে হলে কারণ লিখুন।"
                : "Please specify why this ticket failed validation (e.g., illegible seal, expired date)."}
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="E.g., Missing doctor seal and hospital admission number..."
              className="w-full p-3 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs outline-none focus:border-red-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-main)]"
              >
                {language === "bn" ? "বাতিল" : "Cancel"}
              </button>
              <button
                onClick={handleRejectCase}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                {language === "bn" ? "নিশ্চিত প্রত্যাখ্যান" : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      <EmergencyFooter />
    </div>
  );
}
