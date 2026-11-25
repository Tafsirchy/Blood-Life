"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { EmergencyFooter } from "@/components/home/EmergencyFooter";
import { SosBroadcastModal } from "@/components/requests/SosBroadcastModal";
import { useLanguage } from "@/lib/i18n/context";
import {
  Building2,
  Calendar,
  Clock,
  Heart,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Phone,
  MapPin,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Users,
  Activity,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Flame,
  Navigation,
  MessageCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import { DISTRICTS } from "@/lib/geo/bangladeshData";

interface ScheduledPatient {
  id: string;
  patientCode: string;
  patientName: string;
  hospital: string;
  department: string;
  district: string;
  division: string;
  bloodGroup: string;
  bloodComponent: string;
  unitsNeeded: number;
  pledgedUnits: number;
  urgency: "critical" | "urgent" | "standard";
  scheduledDate: string;
  scheduledTime: string;
  medicalReason: string;
  requesterPhone: string;
  isVerifiedGenuine: boolean;
  createdAt: string;
}

interface HospitalSummary {
  hospitalName: string;
  district: string;
  division: string;
  totalPatients: number;
  totalUnits: number;
  bloodBreakdown: Record<string, number>;
  criticalCount: number;
  patients: ScheduledPatient[];
}

interface HospitalStats {
  totalSurgeries: number;
  totalUnitsNeeded: number;
  totalPledgedUnits: number;
  criticalCases: number;
  activeHospitals: number;
}

const BLOOD_GROUPS = ["all", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const BLOOD_COMPONENTS = [
  { id: "all", labelEn: "All Types", labelBn: "সব উপাদান" },
  { id: "Whole Blood", labelEn: "Whole Blood", labelBn: "হোল ব্লাড" },
  { id: "PRBC", labelEn: "PRBC (Red Cells)", labelBn: "পিআরবিসি" },
  { id: "Platelets", labelEn: "Platelets (SDP/RDP)", labelBn: "প্লাটিলেট" },
  { id: "Plasma", labelEn: "Plasma / FFP", labelBn: "প্লাজমা" },
];

export default function HospitalDemandBoardPage() {
  const { language } = useLanguage();
  const [viewMode, setViewMode] = useState<"patients" | "hospitals" | "inventory">("patients");
  const [inventories, setInventories] = useState<any[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("all");
  const [selectedUrgency, setSelectedUrgency] = useState("all");
  const [selectedComponent, setSelectedComponent] = useState("all");

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<HospitalStats>({
    totalSurgeries: 0,
    totalUnitsNeeded: 0,
    totalPledgedUnits: 0,
    criticalCases: 0,
    activeHospitals: 0,
  });
  const [hospitals, setHospitals] = useState<HospitalSummary[]>([]);
  const [patients, setPatients] = useState<ScheduledPatient[]>([]);
  const [revealedPhones, setRevealedPhones] = useState<Record<string, boolean>>({});
  const [expandedHospitals, setExpandedHospitals] = useState<Record<string, boolean>>({});

  // Pledge Modal state
  const [pledgeTarget, setPledgeTarget] = useState<ScheduledPatient | null>(null);
  const [pledging, setPledging] = useState(false);
  const [pledgeSuccess, setPledgeSuccess] = useState<string | null>(null);
  const [pledgeError, setPledgeError] = useState<string | null>(null);
  const [isSosOpen, setIsSosOpen] = useState(false);

  // Fetch hospital data from API
  const fetchHospitalDemand = async (overrideSearch?: string) => {
    try {
      setLoading(true);
      const querySearch = overrideSearch !== undefined ? overrideSearch : searchTerm;
      const params = new URLSearchParams();
      if (querySearch.trim()) params.set("hospital", querySearch.trim());
      if (selectedDistrict !== "all") params.set("district", selectedDistrict);
      if (selectedBloodGroup !== "all") params.set("bloodGroup", selectedBloodGroup);
      if (selectedUrgency !== "all") params.set("urgency", selectedUrgency);
      if (selectedComponent !== "all") params.set("bloodComponent", selectedComponent);

      const res = await fetch(`/api/hospitals/demand?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setStats(data.stats);
        setHospitals(data.hospitals);
        setPatients(data.patients);
      }
    } catch (err) {
      console.error("Error loading hospital board:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalDemand();
  }, [selectedDistrict, selectedBloodGroup, selectedUrgency, selectedComponent]);

  useEffect(() => {
    if (viewMode === "inventory") {
      setLoadingInventory(true);
      const params = new URLSearchParams();
      if (selectedDistrict !== "all") params.set("district", selectedDistrict);
      if (searchTerm.trim()) params.set("hospitalName", searchTerm.trim());
      fetch(`/api/hospitals/inventory?${params.toString()}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.inventories) setInventories(d.inventories);
        })
        .catch(() => {})
        .finally(() => setLoadingInventory(false));
    }
  }, [viewMode, selectedDistrict]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHospitalDemand();
  };

  const togglePhone = (patientId: string) => {
    setRevealedPhones((prev) => ({
      ...prev,
      [patientId]: !prev[patientId],
    }));
  };

  const toggleHospitalExpand = (hospitalName: string) => {
    setExpandedHospitals((prev) => ({
      ...prev,
      [hospitalName]: !prev[hospitalName],
    }));
  };

  // Handle Blood Pledge
  const handleConfirmPledge = async () => {
    if (!pledgeTarget) return;
    try {
      setPledging(true);
      setPledgeError(null);

      const res = await fetch(`/api/requests/${pledgeTarget.id}/pledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPledgeSuccess(
          language === "bn"
            ? `ধন্যবাদ! আপনি ${pledgeTarget.hospital}-এর ${pledgeTarget.patientCode} রোগীর জন্য ১ ব্যাগ রক্তদানের প্রতিশ্রুতি দিয়েছেন। রোগী পরিবারকে বার্তা পাঠানো হয়েছে।`
            : `Pledge confirmed! You have committed 1 unit of blood for patient ${pledgeTarget.patientCode} at ${pledgeTarget.hospital}. Attendants notified.`
        );
        // Optimistically increment pledged count across patients, hospitals, and stats
        setPatients((prev) =>
          prev.map((p) =>
            p.id === pledgeTarget.id
              ? { ...p, pledgedUnits: Math.min(p.unitsNeeded, p.pledgedUnits + 1) }
              : p
          )
        );
        setHospitals((prev) =>
          prev.map((h) => ({
            ...h,
            patients: h.patients.map((p) =>
              p.id === pledgeTarget.id
                ? { ...p, pledgedUnits: Math.min(p.unitsNeeded, p.pledgedUnits + 1) }
                : p
            ),
          }))
        );
        setStats((prev) => ({
          ...prev,
          totalPledgedUnits: Math.min(prev.totalUnitsNeeded, prev.totalPledgedUnits + 1),
        }));

        setTimeout(() => {
          setPledgeTarget(null);
          setPledgeSuccess(null);
        }, 3500);
      } else {
        setPledgeError(data.error || "Pledge failed. Please log in or check cooldown.");
      }
    } catch (err) {
      console.error(err);
      setPledgeError("Network connection failed. Please try again.");
    } finally {
      setPledging(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors">
      <Navbar onOpenSos={() => setIsSosOpen(true)} />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Top Hero Banner */}
        <div className="card-clinical p-6 sm:p-8 relative overflow-hidden border border-[var(--border-subtle)] shadow-xl text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-red-600/10 via-rose-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-3 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-wider">
              <Activity size={14} className="animate-pulse" />
              <span>
                {language === "bn"
                  ? "হাসপাতাল রক্তের লাইভ চাহিদা বোর্ড"
                  : "LIVE HOSPITAL BLOOD DEMAND BOARD"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
              {language === "bn" ? (
                <>
                  হাসপাতালভিত্তিক <span className="text-red-500">রোগীর রক্ত ও অপারেশন</span> শিডিউল
                </>
              ) : (
                <>
                  Hospital-Wise <span className="text-red-500">Surgery & Patient Blood</span> Schedules
                </>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
              {language === "bn"
                ? "বাংলাদেশের শীর্ষ মেডিকেল কলেজ ও বিশেষায়িত হাসপাতালগুলোতে আইসিইউ, কার্ডিয়াক বাইপাস ও জরুরী সার্জারির জন্য কোন গ্রুপের কত ব্যাগ রক্ত কখন প্রয়োজন—তার সরাসরি লাইভ ট্র্যাকার ও স্বেচ্ছাসেবী অঙ্গীকার।"
                : "Real-time surgery schedules, ICU transfusions, and clinical blood requirements across leading tertiary hospitals in Bangladesh. Connect directly with verified hospital attendants."}
            </p>
          </div>

          {/* Quick Counter Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-[var(--border-subtle)]">
            <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex flex-col items-center text-center">
              <span className="text-[11px] font-bold text-[var(--text-muted)] flex items-center justify-center gap-1">
                <Flame size={12} className="text-red-500" />
                {language === "bn" ? "ক্রিটিক্যাল সার্জারি" : "Critical Surgeries"}
              </span>
              <span className="text-xl sm:text-2xl font-black text-red-500 mt-0.5">
                {stats.criticalCases}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex flex-col items-center text-center">
              <span className="text-[11px] font-bold text-[var(--text-muted)] flex items-center justify-center gap-1">
                <Heart size={12} className="text-rose-500" />
                {language === "bn" ? "মোট রক্তের ব্যাগ" : "Total Units Needed"}
              </span>
              <span className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-0.5">
                {stats.totalUnitsNeeded}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex flex-col items-center text-center">
              <span className="text-[11px] font-bold text-[var(--text-muted)] flex items-center justify-center gap-1">
                <Building2 size={12} className="text-blue-500" />
                {language === "bn" ? "সক্রিয় হাসপাতাল" : "Active Hospitals"}
              </span>
              <span className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-0.5">
                {stats.activeHospitals}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex flex-col items-center text-center">
              <span className="text-[11px] font-bold text-[var(--text-muted)] flex items-center justify-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-500" />
                {language === "bn" ? "নিশ্চিত অঙ্গীকার" : "Units Pledged"}
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-500 mt-0.5">
                {stats.totalPledgedUnits} / {stats.totalUnitsNeeded}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Console */}
        <div className="card-clinical p-4 sm:p-5 space-y-4 border border-[var(--border-subtle)]">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="w-full lg:w-96 relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  language === "bn"
                    ? "হাসপাতালের নাম লিখুন (যেমন: ঢাকা মেডিকেল, BSMMU)..."
                    : "Search by hospital name (e.g. DMCH, NICVD)..."
                }
                className="w-full pl-9 pr-24 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] outline-none focus:border-red-500 transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    fetchHospitalDemand("");
                  }}
                  className="absolute right-16 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                  title={language === "bn" ? "মুছে ফেলুন" : "Clear search"}
                >
                  <X size={14} />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold transition-colors"
              >
                {language === "bn" ? "খুঁজুন" : "Search"}
              </button>
            </form>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] self-start lg:self-auto shrink-0">
              <button
                onClick={() => setViewMode("patients")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === "patients"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Calendar size={13} />
                <span>{language === "bn" ? "রোগীর শিডিউল ভিউ" : "Patient Schedule"}</span>
              </button>
              <button
                onClick={() => setViewMode("hospitals")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === "hospitals"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Building2 size={13} />
                <span>{language === "bn" ? "হাসপাতালভিত্তিক ভিউ" : "By Hospital"}</span>
              </button>
              <button
                onClick={() => setViewMode("inventory")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === "inventory"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Activity size={13} />
                <span>{language === "bn" ? "ব্লাড ব্যাংক স্টক" : "Blood Stock"}</span>
              </button>
            </div>
          </div>

          {/* Secondary Quick Filters: District, Blood Group, Urgency */}
          <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-3 text-xs">
            {/* District Dropdown - 64 Districts */}
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-blue-500" />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="py-1 px-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] outline-none focus:border-red-500 max-w-[150px] sm:max-w-none truncate"
              >
                <option value="all">
                  {language === "bn" ? "সকল জেলা (৬৪ জেলা)" : "All Districts (64)"}
                </option>
                {DISTRICTS.map((d) => (
                  <option key={d.id} value={d.nameEn}>
                    {language === "bn" ? `${d.nameBn} (${d.nameEn})` : d.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Urgency Filter */}
            <div className="flex items-center gap-1.5">
              <Filter size={13} className="text-amber-500" />
              <select
                value={selectedUrgency}
                onChange={(e) => setSelectedUrgency(e.target.value)}
                className="py-1 px-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] outline-none focus:border-red-500"
              >
                <option value="all">{language === "bn" ? "সকল জরুরী স্তর" : "All Urgency"}</option>
                <option value="critical">{language === "bn" ? "🚨 আশঙ্কাজনক (Critical)" : "Critical"}</option>
                <option value="urgent">{language === "bn" ? "⚡ অতি জরুরী (Urgent)" : "Urgent"}</option>
                <option value="standard">{language === "bn" ? "📅 সাধারণ (Scheduled)" : "Standard"}</option>
              </select>
            </div>

            {/* Blood Group Chips */}
            <div className="flex items-center gap-1 ml-auto overflow-x-auto py-1 max-w-full">
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  onClick={() => setSelectedBloodGroup(bg)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all shrink-0 ${
                    selectedBloodGroup === bg
                      ? "bg-red-600 text-white shadow-sm scale-105"
                      : "bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-red-500/40"
                  }`}
                >
                  {bg === "all" ? (language === "bn" ? "সব গ্রুপ" : "All") : bg}
                </button>
              ))}
            </div>

            {/* Blood Component Chips */}
            <div className="w-full flex items-center gap-1.5 pt-2.5 border-t border-[var(--border-subtle)]/70 overflow-x-auto py-1">
              <span className="text-[11px] text-[var(--text-muted)] font-bold shrink-0">
                {language === "bn" ? "রক্তের উপাদান:" : "Component:"}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                {BLOOD_COMPONENTS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedComponent(c.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                      selectedComponent === c.id
                        ? "bg-red-600 text-white shadow-xs scale-105"
                        : "bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-red-500/40"
                    }`}
                  >
                    {language === "bn" ? c.labelBn : c.labelEn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content View: Patient Schedules vs Hospital Summaries */}
        {loading ? (
          <div className="card-clinical p-16 text-center text-xs text-[var(--text-muted)] animate-pulse space-y-2">
            <Building2 size={36} className="mx-auto text-red-500/50 animate-bounce" />
            <p>{language === "bn" ? "হাসপাতালের লাইভ তথ্য প্রস্তুত হচ্ছে..." : "Loading hospital schedules..."}</p>
          </div>
        ) : viewMode === "patients" ? (
          /* Patient Schedule View */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
                {language === "bn"
                  ? `নির্ধারিত অপারেশন ও ট্রান্সফিউশন রোগীর তালিকা (${patients.length})`
                  : `Scheduled Patient Transfusions (${patients.length})`}
              </h2>
              <span className="text-xs text-[var(--text-muted)] font-mono">
                {language === "bn" ? "সরাসরি হাসপাতাল সমন্বয়" : "Direct Hospital Coordination"}
              </span>
            </div>

            {patients.length === 0 ? (
              <div className="card-clinical p-12 text-center max-w-md mx-auto space-y-3">
                <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {language === "bn" ? "কোনো রোগী অপেক্ষমান নেই!" : "No Patients Waiting"}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {language === "bn"
                    ? "আপনার নির্বাচিত ফিল্টারে এই মুহূর্তে কোনো অমীমাংসিত অপারেশন বা রক্তের আবেদন নেই।"
                    : "No pending surgical requisitions match the selected filters."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patients.map((p) => {
                  const percentPledged = Math.min(100, Math.round((p.pledgedUnits / p.unitsNeeded) * 100));
                  const isCritical = p.urgency === "critical";

                  return (
                    <div
                      key={p.id}
                      className={`card-clinical p-5 space-y-4 border transition-all ${
                        isCritical
                          ? "border-red-500/40 hover:border-red-500 shadow-sm ring-1 ring-red-500/20"
                          : "border-[var(--border-subtle)] hover:border-red-500/40"
                      }`}
                    >
                      {/* Top Header: Patient Code, Blood Group, Urgency */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                              {p.patientCode}
                            </span>
                            {p.isVerifiedGenuine && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                <ShieldCheck size={12} />
                                <span>{language === "bn" ? "ভেরিফাইড রোগী" : "Verified Genuine"}</span>
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-[var(--text-primary)]">
                            {p.department}
                          </h3>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="badge-blood text-sm font-black px-2.5 py-1">
                            {p.bloodGroup}
                          </span>
                          <span className="block text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md mt-1 border border-red-500/20">
                            {p.bloodComponent}
                          </span>
                        </div>
                      </div>

                      {/* Hospital & Department */}
                      <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[var(--text-primary)] font-bold min-w-0">
                            <Building2 size={13} className="text-blue-500 shrink-0" />
                            <span className="truncate">{p.hospital}</span>
                          </div>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${p.hospital}, ${p.district}, Bangladesh`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 text-[10px] font-bold shrink-0 transition-colors"
                            title={language === "bn" ? "গুগল ম্যাপে দিকনির্দেশনা দেখুন" : "Get Google Maps Directions"}
                          >
                            <Navigation size={10} />
                            <span>{language === "bn" ? "দিকনির্দেশনা" : "Map"}</span>
                          </a>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--text-secondary)] pt-1 border-t border-[var(--border-subtle)]">
                          <div className="flex items-center gap-1">
                            <Calendar size={11} className="text-red-500" />
                            <span>{p.scheduledDate}</span>
                          </div>
                          <div className="flex items-center gap-1 font-mono font-bold text-red-500">
                            <Clock size={11} />
                            <span>{p.scheduledTime}</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-[var(--text-secondary)] italic leading-tight">
                          "{p.medicalReason}"
                        </p>
                      </div>

                      {/* Units Progress Bar */}
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[var(--text-muted)] font-medium">
                            {language === "bn" ? "রক্তের সংগ্রহ অগ্রগতি:" : "Blood Target:"}
                          </span>
                          <span className="font-bold text-[var(--text-primary)]">
                            {p.pledgedUnits} / {p.unitsNeeded} {language === "bn" ? "ব্যাগ" : "Units"}
                            {percentPledged === 100 && (
                              <span className="text-emerald-500 ml-1 font-bold">✓ (পূর্ণ)</span>
                            )}
                          </span>
                        </div>

                        <div className="w-full h-2 rounded-full bg-[var(--bg-main)] overflow-hidden border border-[var(--border-subtle)]">
                          <div
                            className={`h-full transition-all duration-300 ${
                              percentPledged === 100
                                ? "bg-emerald-500"
                                : isCritical
                                ? "bg-red-600"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${percentPledged}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Buttons: Phone Reveal & Pledge */}
                      <div className="flex items-center gap-2 pt-1 border-t border-[var(--border-subtle)]">
                        {/* Phone Reveal / Instant Call & WhatsApp */}
                        {revealedPhones[p.id] ? (
                          <div className="flex-1 flex items-center gap-1.5">
                            <a
                              href={`tel:${p.requesterPhone}`}
                              className="flex-1 py-2 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                              title={language === "bn" ? "সরাসরি কল করুন" : "Call Attendant"}
                            >
                              <Phone size={13} className="fill-white" />
                              <span className="font-mono">{p.requesterPhone}</span>
                            </a>
                            <a
                              href={`https://wa.me/${p.requesterPhone.replace(/[^0-9]/g, "").replace(/^0/, "880")}?text=${encodeURIComponent(
                                language === "bn"
                                  ? `আসসালামু আলাইকুম, আমি Blood&Life প্ল্যাটফর্ম থেকে ${p.hospital}-এ ${p.patientCode} রোগীর জন্য (${p.bloodGroup} ${p.bloodComponent}) রক্তদানে যোগাযোগ করছি।`
                                  : `Hello, I am contacting from Blood&Life regarding blood donation for patient ${p.patientCode} at ${p.hospital} (${p.bloodGroup} ${p.bloodComponent}).`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center transition-colors shadow-xs"
                              title="WhatsApp Chat"
                            >
                              <MessageCircle size={15} />
                            </a>
                          </div>
                        ) : (
                          <button
                            onClick={() => togglePhone(p.id)}
                            className="flex-1 py-2 px-3 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-main)] text-xs font-bold text-[var(--text-primary)] flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Phone size={13} className="text-blue-500" />
                            <span>
                              {language === "bn" ? "অ্যাটেনডেন্ট ফোন নম্বর" : "Attendant Phone"}
                            </span>
                          </button>
                        )}

                        {/* Pledge Blood Button */}
                        <button
                          onClick={() => setPledgeTarget(p)}
                          className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Heart size={13} className="fill-white" />
                          <span>{language === "bn" ? "রক্ত দিতে চাই (Pledge)" : "I Will Donate"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : viewMode === "inventory" ? (
          /* Live Blood Bank Stock View */
          <div className="space-y-4">
            {loadingInventory ? (
              <div className="card-clinical p-12 text-center text-xs text-[var(--text-muted)]">
                {language === "bn" ? "ব্লাড ব্যাংক স্টক লোড হচ্ছে..." : "Loading live hospital blood inventory..."}
              </div>
            ) : inventories.length === 0 ? (
              <div className="card-clinical p-12 text-center text-xs text-[var(--text-muted)]">
                {language === "bn" ? "এই জেলায় কোনো ব্লাড ব্যাংক স্টক তথ্য পাওয়া যায়নি।" : "No blood bank stock data found for this filter."}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inventories.map((inv: any) => (
                  <div key={inv._id} className="card-clinical p-5 space-y-3 border border-[var(--border-subtle)]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-black text-[var(--text-primary)]">{inv.hospitalName}</h3>
                        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="text-red-500" />
                          <span>{inv.district}, {inv.division}</span>
                        </p>
                      </div>
                      <a
                        href={`tel:${inv.contactNumber}`}
                        className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-mono font-bold inline-flex items-center gap-1"
                      >
                        <Phone size={11} />
                        <span>{inv.contactNumber}</span>
                      </a>
                    </div>
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[var(--border-subtle)]">
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => {
                        const qty = inv.inventory?.[bg] ?? 0;
                        return (
                          <div
                            key={bg}
                            className={`p-2 rounded-lg text-center border ${
                              qty === 0
                                ? "bg-red-500/10 border-red-500/30 text-red-500"
                                : "bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-primary)]"
                            }`}
                          >
                            <span className="text-xs font-black block">{bg}</span>
                            <span className="text-[11px] font-bold">{qty} {language === "bn" ? "ব্যাগ" : "bags"}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* By Hospital Aggregated View */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
                {language === "bn"
                  ? `হাসপাতালভিত্তিক রক্তের চাহিদা তালিকা (${hospitals.length})`
                  : `Hospital Demand Consoles (${hospitals.length})`}
              </h2>
            </div>

            <div className="space-y-3">
              {hospitals.map((h) => {
                const isExpanded = expandedHospitals[h.hospitalName];

                return (
                  <div
                    key={h.hospitalName}
                    className="card-clinical p-4 sm:p-5 border border-[var(--border-subtle)] hover:border-red-500/30 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-red-500" />
                          <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                            {h.hospitalName}
                          </h3>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${h.hospitalName}, ${h.district}, Bangladesh`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 text-[10px] font-bold ml-1 transition-colors"
                            title={language === "bn" ? "গুগল ম্যাপে দেখুন" : "View on Google Maps"}
                          >
                            <Navigation size={10} />
                            <span className="hidden sm:inline">{language === "bn" ? "ম্যাপ" : "Map"}</span>
                          </a>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5 flex items-center gap-1.5">
                          <MapPin size={12} className="text-blue-500" />
                          <span>
                            {h.district}, {h.division}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {h.criticalCount > 0 && (
                          <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-[11px] font-black uppercase flex items-center gap-1">
                            <Flame size={11} />
                            <span>
                              {h.criticalCount} {language === "bn" ? "টি ক্রনিক সার্জারি" : "Critical Cases"}
                            </span>
                          </span>
                        )}

                        <span className="px-3 py-1 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)]">
                          {h.totalUnits} {language === "bn" ? "ব্যাগ প্রয়োজন" : "Bags Needed"}
                        </span>

                        <button
                          onClick={() => toggleHospitalExpand(h.hospitalName)}
                          className="p-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-main)] text-[var(--text-secondary)] transition-colors"
                          title="Expand Hospital Patients"
                        >
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Blood Group Breakdown Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[var(--border-subtle)]">
                      <span className="text-[11px] text-[var(--text-muted)] font-medium mr-1">
                        {language === "bn" ? "প্রয়োজনীয় গ্রুপ:" : "Required Blood:"}
                      </span>
                      {Object.entries(h.bloodBreakdown).map(([bg, count]) => (
                        <span
                          key={bg}
                          className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-black"
                        >
                          {bg}: {count} {language === "bn" ? "ব্যাগ" : "units"}
                        </span>
                      ))}
                    </div>

                    {/* Expandable Patients List for this Hospital */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2.5 animate-in fade-in slide-in-from-top-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)] block">
                          {language === "bn"
                            ? `${h.hospitalName}-এর নির্ধারিত রোগী তালিকা:`
                            : `Scheduled Patients at ${h.hospitalName}:`}
                        </span>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {h.patients.map((p) => (
                            <div
                              key={p.id}
                              className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-2.5 text-xs"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-0.5">
                                  <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                                    {p.patientCode}
                                  </span>
                                  <h4 className="font-bold text-[var(--text-primary)] text-xs mt-1">
                                    {p.department}
                                  </h4>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="badge-blood text-xs font-black px-2 py-0.5">
                                    {p.bloodGroup}
                                  </span>
                                  <span className="block text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-md mt-0.5 border border-red-500/20">
                                    {p.bloodComponent}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                                <span className="flex items-center gap-1">
                                  <Calendar size={11} className="text-red-500" /> {p.scheduledDate}
                                </span>
                                <span className="flex items-center gap-1 font-mono font-bold text-red-500">
                                  <Clock size={11} /> {p.scheduledTime}
                                </span>
                              </div>

                              <p className="text-[11px] text-[var(--text-secondary)] italic leading-tight">
                                "{p.medicalReason}"
                              </p>

                              {/* Action Buttons: Phone & Pledge */}
                              <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
                                {revealedPhones[p.id] ? (
                                  <div className="flex-1 flex items-center gap-1">
                                    <a
                                      href={`tel:${p.requesterPhone}`}
                                      className="flex-1 py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                                      title={language === "bn" ? "সরাসরি কল করুন" : "Call Attendant"}
                                    >
                                      <Phone size={11} className="fill-white" />
                                      <span className="font-mono text-[10px]">{p.requesterPhone}</span>
                                    </a>
                                    <a
                                      href={`https://wa.me/${p.requesterPhone.replace(/[^0-9]/g, "").replace(/^0/, "880")}?text=${encodeURIComponent(
                                        language === "bn"
                                          ? `আসসালামু আলাইকুম, আমি Blood&Life প্ল্যাটফর্ম থেকে ${p.hospital}-এ ${p.patientCode} রোগীর জন্য (${p.bloodGroup} ${p.bloodComponent}) রক্তদানে যোগাযোগ করছি।`
                                          : `Hello, I am contacting from Blood&Life regarding blood donation for patient ${p.patientCode} at ${p.hospital} (${p.bloodGroup} ${p.bloodComponent}).`
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center transition-colors"
                                      title="WhatsApp Chat"
                                    >
                                      <MessageCircle size={13} />
                                    </a>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => togglePhone(p.id)}
                                    className="flex-1 py-1.5 px-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] text-[11px] font-bold text-[var(--text-primary)] flex items-center justify-center gap-1 transition-colors"
                                  >
                                    <Phone size={11} className="text-blue-500" />
                                    <span>{language === "bn" ? "ফোন নম্বর" : "Attendant Phone"}</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => setPledgeTarget(p)}
                                  className="py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
                                >
                                  <Heart size={11} className="fill-white" />
                                  <span>{language === "bn" ? "রক্ত দিন" : "Pledge"}</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pledge Modal */}
        {pledgeTarget && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="card-clinical max-w-lg w-full p-6 space-y-5 border border-red-500/30 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between border-b border-[var(--border-subtle)] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
                    <Heart size={20} className="fill-red-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[var(--text-primary)]">
                      {language === "bn" ? "রক্তদানের সরাসরি অঙ্গীকার" : "Hospital Blood Pledge"}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      {pledgeTarget.patientCode} • {pledgeTarget.hospital}
                    </p>
                  </div>
                </div>

                <span className="badge-blood text-sm font-black px-2.5 py-1">
                  {pledgeTarget.bloodGroup}
                </span>
              </div>

              {pledgeSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} />
                    <span>{pledgeSuccess}</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] font-normal">
                    {language === "bn"
                      ? "হাসপাতালের নির্ধারিত সময়ে উপস্থিত হয়ে রোগীকে রক্তদানে সহযোগিতা করুন।"
                      : "Please arrive at the hospital transfusion ward before the scheduled surgery window."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">
                        {language === "bn" ? "সার্জারি বা বিভাগ:" : "Department:"}
                      </span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {pledgeTarget.department}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">
                        {language === "bn" ? "রক্তের উপাদান:" : "Blood Component:"}
                      </span>
                      <span className="font-bold text-red-600 dark:text-red-400">
                        {pledgeTarget.bloodComponent}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">
                        {language === "bn" ? "নির্ধারিত তারিখ ও সময়:" : "Scheduled Time:"}
                      </span>
                      <span className="font-mono font-bold text-red-500">
                        {pledgeTarget.scheduledDate} ({pledgeTarget.scheduledTime})
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">
                        {language === "bn" ? "রোগীর কারণ:" : "Clinical Reason:"}
                      </span>
                      <span className="font-medium text-[var(--text-secondary)] max-w-xs text-right truncate">
                        {pledgeTarget.medicalReason}
                      </span>
                    </div>
                  </div>

                  {pledgeError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-2">
                      <AlertTriangle size={15} />
                      <span>{pledgeError}</span>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-400 space-y-1">
                    <span className="font-bold block flex items-center gap-1">
                      <AlertTriangle size={12} />
                      {language === "bn" ? "স্বেচ্ছাসেবী অঙ্গীকার নীতি:" : "Voluntary Donor Pledge Notice:"}
                    </span>
                    <p>
                      {language === "bn"
                        ? "রক্তদান সম্পূর্ণ বিনামূল্যে। মধ্যস্বত্বভোগী বা কারো প্ররোচনায় কোনো অগ্রিম অর্থ লেনদেন করবেন না।"
                        : "Blood donation is strictly voluntary and zero-cost. Never transfer advance funds or deal with third-party brokers."}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      onClick={() => setPledgeTarget(null)}
                      disabled={pledging}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-main)] transition-colors"
                    >
                      {language === "bn" ? "ফিরে যান" : "Cancel"}
                    </button>
                    <button
                      onClick={handleConfirmPledge}
                      disabled={pledging}
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-md"
                    >
                      <Heart size={14} className="fill-white" />
                      <span>
                        {pledging
                          ? language === "bn"
                            ? "প্রসেসিং হচ্ছে..."
                            : "Confirming..."
                          : language === "bn"
                          ? "আমি রক্তদান করব (Confirm Pledge)"
                          : "Confirm 1-Unit Pledge"}
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        </div>
      </main>

      <EmergencyFooter />

      {/* SOS Modal if triggered from Navbar */}
      <SosBroadcastModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
    </div>
  );
}
