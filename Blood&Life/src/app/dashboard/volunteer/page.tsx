"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import {
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Users,
  Check,
  X,
  Phone,
  Building2,
  MapPin,
  Sparkles,
  ShieldAlert,
  Trash2,
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
  const [activeTab, setActiveTab] = useState<"prescriptions" | "community_donors" | "fraud_reports">("prescriptions");
  const [cases, setCases] = useState<PendingCase[]>([]);
  const [communityDonors, setCommunityDonors] = useState<any[]>([]);
  const [fraudReports, setFraudReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [loadingFraud, setLoadingFraud] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchCommunityDonors = async () => {
    try {
      setLoadingCommunity(true);
      const res = await fetch("/api/donors/community?status=pending_review");
      const data = await res.json();
      if (data.donors) {
        setCommunityDonors(data.donors);
      }
    } catch (e) {
      console.error("Error loading community donors:", e);
    } finally {
      setLoadingCommunity(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === "community_donors") {
      fetchCommunityDonors();
    } else if (activeTab === "fraud_reports") {
      fetchFraudReports();
    }
  }, [activeTab]);

  const fetchFraudReports = async () => {
    try {
      setLoadingFraud(true);
      const res = await fetch("/api/fraud?status=pending_review");
      const data = await res.json();
      if (data.reports) {
        setFraudReports(data.reports);
      }
    } catch (e) {
      console.error("Error loading fraud reports:", e);
    } finally {
      setLoadingFraud(false);
    }
  };

  const handleReviewFraud = async (id: string, status: "confirmed_fraud" | "dismissed") => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/fraud/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setFraudReports((prev) => prev.filter((r) => r.id !== id));
        setSuccessMessage(
          language === "bn"
            ? status === "confirmed_fraud"
              ? "অভিযোগটি নিশ্চিত প্রতারণা হিসেবে ব্ল্যাকলিস্টে যুক্ত হয়েছে!"
              : "অভিযোগটি খারিজ করা হয়েছে।"
            : `Report marked as ${status}.`
        );
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFraud = async (id: string) => {
    if (!window.confirm(language === "bn" ? "অভিযোগটি ডিলিট করতে চান?" : "Delete this fraud report?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/fraud/${id}`, { method: "DELETE" });
      if (res.ok) {
        setFraudReports((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCommunityDonor = async (id: string) => {
    if (!window.confirm(language === "bn" ? "ডোনার এন্ট্রিটি মুছতে চান?" : "Delete this submission?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/donors/community/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCommunityDonors((prev) => prev.filter((d) => (d.id || d._id) !== id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  React.useEffect(() => {
    fetch("/api/requests/search?status=pending&limit=50")
      .then((r) => r.json())
      .then((data) => {
        if (data.requests && data.requests.length > 0) {
          const mapped: PendingCase[] = data.requests.map((r: any) => ({
            id: r._id,
            patientName: r.recipientName,
            bloodGroup: r.bloodGroup,
            units: r.unitsNeeded,
            hospital: r.hospital,
            district: r.district,
            urgency: r.urgency,
            requesterName: r.requesterName,
            requesterPhone: r.requesterPhone || "N/A",
            createdAt: r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently",
            prescriptionUrl: r.prescriptionUrl || "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80",
            doctorNotes: r.message || r.medicalReason || "Emergency surgical requisition.",
          }));
          setCases(mapped);
          setSelectedCaseId(mapped[0]?.id || "");
        } else {
          setCases([]);
        }
      })
      .catch((err) => console.error("Error loading triage queue:", err))
      .finally(() => setLoading(false));
  }, []);

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

  const handleReviewCommunityDonor = async (id: string, action: "APPROVE" | "REJECT") => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/donors/community/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(
          language === "bn"
            ? `রক্তদাতা সফলভাবে ${action === "APPROVE" ? "অনুমোদিত ও সক্রিয়" : "বাতিল"} করা হয়েছে!`
            : `Donor successfully ${action === "APPROVE" ? "approved & listed" : "rejected"}!`
        );
        setCommunityDonors((prev) => prev.filter((d) => d._id !== id));
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        alert(data.error || "Failed to review donor");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-bold uppercase tracking-wider mb-1.5">
            <ShieldCheck size={13} />
            <span>{language === "bn" ? "ভলান্টিয়ার ট্রায়াজ স্টেশন" : "VOLUNTEER VERIFICATION DESK"}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
            {language === "bn" ? "ডাক্তার প্রেসক্রিপশন ও বেড টিকিট যাচাইকরণ" : "Prescription Triage & Verification"}
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
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

      {/* Sub-tab navigation */}
      <div className="flex border-b border-[var(--border-subtle)] gap-2">
        <button
          onClick={() => setActiveTab("prescriptions")}
          className={`pb-3 px-4 text-xs font-bold transition-all relative ${
            activeTab === "prescriptions"
              ? "text-red-500 border-b-2 border-red-500"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          }`}
        >
          <span className="flex items-center gap-2">
            <FileText size={15} />
            {language === "bn" ? "ডাক্তার প্রেসক্রিপশন ট্রায়াজ" : "Prescription Triage"}
            <span className="px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black">
              {cases.length}
            </span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab("community_donors")}
          className={`pb-3 px-4 text-xs font-bold transition-all relative ${
            activeTab === "community_donors"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          }`}
        >
          <span className="flex items-center gap-2">
            <Users size={15} />
            {language === "bn" ? "কমিউিনিটি রক্তদাতা অনুমোদন" : "Community Donor Approvals"}
            <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black">
              {communityDonors.length}
            </span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab("fraud_reports")}
          className={`pb-3 px-4 text-xs font-bold transition-all relative ${
            activeTab === "fraud_reports"
              ? "text-amber-500 border-b-2 border-amber-500"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          }`}
        >
          <span className="flex items-center gap-2">
            <ShieldAlert size={15} />
            {language === "bn" ? "প্রতারণা অভিযোগ যাচাই" : "Fraud Reports Review"}
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black">
              {fraudReports.length}
            </span>
          </span>
        </button>
      </div>

      {/* Success Alert Banner */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Active Tab Content */}
      {activeTab === "community_donors" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
              {language === "bn" ? "অনুমোদনের অপেক্ষায় থাকা স্বেচ্ছাসেবী রক্তদাতা" : "Pending Community Donor Submissions"}
            </h2>
            <button
              onClick={fetchCommunityDonors}
              className="text-xs text-blue-500 hover:underline flex items-center gap-1 font-bold"
            >
              <RotateCcw size={12} />
              <span>{language === "bn" ? "রিফ্রেশ" : "Refresh"}</span>
            </button>
          </div>

          {loadingCommunity ? (
            <div className="card-clinical p-8 text-center text-xs text-[var(--text-muted)] animate-pulse">
              {language === "bn" ? "তথ্য লোড হচ্ছে..." : "Loading pending submissions..."}
            </div>
          ) : communityDonors.length === 0 ? (
            <div className="card-clinical p-12 text-center max-w-lg mx-auto space-y-3">
              <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {language === "bn" ? "কোনো অমীমাংসিত আবেদন নেই!" : "Queue Clear!"}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {language === "bn"
                  ? "কমিউনিটি কর্তৃক প্রস্তাবিত সকল রক্তদাতা পর্যালোচিত হয়েছে।"
                  : "All community-recommended donors have been reviewed and verified."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {communityDonors.map((donor) => {
                const donorId = donor.id || donor._id;
                return (
                <div key={donorId} className="card-clinical p-5 space-y-4 border border-[var(--border-subtle)] hover:border-blue-500/40 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="badge-blood text-sm font-black px-2.5 py-0.5">
                          {donor.bloodGroup}
                        </span>
                        <h3 className="text-sm font-black text-[var(--text-primary)]">
                          {donor.donorName}
                        </h3>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1.5">
                        <MapPin size={13} className="text-blue-500 shrink-0" />
                        <span>{[donor.thana, donor.upazila, donor.district, donor.division].filter(Boolean).join(", ")}</span>
                      </p>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase">
                      {language === "bn" ? "যাচাই অপেক্ষমান" : "Pending Review"}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)] font-medium">{language === "bn" ? "রক্তদাতার ফোন:" : "Donor Phone:"}</span>
                      <a href={`tel:${donor.donorPhone}`} className="font-mono font-bold text-blue-500 hover:underline flex items-center gap-1">
                        <Phone size={11} />
                        {donor.donorPhone}
                      </a>
                    </div>
                    {donor.age && (
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)] font-medium">{language === "bn" ? "বয়স ও লিঙ্গ:" : "Age & Gender:"}</span>
                        <span className="font-bold text-[var(--text-primary)]">
                          {donor.age} {language === "bn" ? "বছর" : "yrs"} {donor.gender ? `• ${donor.gender}` : ""}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)] text-[11px]">
                      <span className="text-[var(--text-muted)]">{language === "bn" ? "প্রস্তাবক:" : "Submitted by:"}</span>
                      <span className="font-medium text-[var(--text-secondary)]">
                        {donor.submitterName} ({donor.submitterRelationship || "Volunteer"}) • {donor.submitterPhone}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleReviewCommunityDonor(donorId, "APPROVE")}
                      disabled={actionLoading}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Check size={14} />
                      <span>{language === "bn" ? "অনুমোদন করুন (Approve)" : "Approve & Activate"}</span>
                    </button>
                    <button
                      onClick={() => handleReviewCommunityDonor(donorId, "REJECT")}
                      disabled={actionLoading}
                      className="py-2 px-3 rounded-xl border border-red-500/40 text-red-500 hover:bg-red-500/10 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <X size={14} />
                      <span>{language === "bn" ? "বাতিল" : "Reject"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCommunityDonor(donorId)}
                      disabled={actionLoading}
                      className="p-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title={language === "bn" ? "ডিলিট করুন" : "Delete"}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );})}
            </div>
          )}
        </div>
      ) : activeTab === "fraud_reports" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
              {language === "bn" ? "যাচাইয়ের অপেক্ষায় থাকা প্রতারণা অভিযোগ" : "Pending Fraud Shield Reports"}
            </h2>
            <button
              onClick={fetchFraudReports}
              className="text-xs text-amber-500 hover:underline flex items-center gap-1 font-bold"
            >
              <RotateCcw size={12} />
              <span>{language === "bn" ? "রিফ্রেশ" : "Refresh"}</span>
            </button>
          </div>

          {loadingFraud ? (
            <div className="card-clinical p-8 text-center text-xs text-[var(--text-muted)] animate-pulse">
              {language === "bn" ? "অভিযোগ লোড হচ্ছে..." : "Loading fraud reports..."}
            </div>
          ) : fraudReports.length === 0 ? (
            <div className="card-clinical p-12 text-center max-w-lg mx-auto space-y-3">
              <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {language === "bn" ? "কোনো পেন্ডিং অভিযোগ নেই!" : "No Pending Fraud Reports!"}
              </h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fraudReports.map((rep) => (
                <div key={rep.id} className="card-clinical p-5 space-y-3 border border-[var(--border-subtle)]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[10px] font-bold uppercase">
                        {rep.scamCategory}
                      </span>
                      <h3 className="text-sm font-black text-[var(--text-primary)] mt-1">
                        {rep.reportedName} • <span className="font-mono text-red-500">{rep.maskedPhone}</span>
                      </h3>
                      <p className="text-xs text-[var(--text-muted)]">{rep.hospitalName}, {rep.district}</p>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-main)] p-3 rounded-lg border border-[var(--border-subtle)]">
                    {rep.description}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      disabled={actionLoading}
                      onClick={() => handleReviewFraud(rep.id, "confirmed_fraud")}
                      className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                    >
                      {language === "bn" ? "ব্ল্যাকলিস্ট নিশ্চিত করুন" : "Confirm Blacklist"}
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleReviewFraud(rep.id, "dismissed")}
                      className="py-2 px-3 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs font-bold hover:bg-[var(--bg-main)]"
                    >
                      {language === "bn" ? "খারিজ" : "Dismiss"}
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleDeleteFraud(rep.id)}
                      className="p-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Prescriptions Tab */
        <>
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
        </>
      )}

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
    </div>
  );
}
