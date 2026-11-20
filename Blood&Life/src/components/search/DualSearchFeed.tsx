"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BloodGroup } from "@/types";
import { DIVISIONS, DISTRICTS } from "@/lib/geo/bangladeshData";
import { useLanguage } from "@/lib/i18n/context";
import { translateBloodGroup } from "@/lib/utils";
import { 
  Search, 
  Droplet, 
  Phone, 
  MapPin, 
  Hospital, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  RotateCcw, 
  Eye, 
  HeartHandshake, 
  ChevronRight,
  Lock
} from "lucide-react";
import Link from "next/link";

interface DonorCardData {
  _id: string;
  name: string;
  bloodGroup: BloodGroup;
  division: string;
  district: string;
  upazila: string;
  maskedPhone: string;
  totalDonations: number;
  lastDonationDate?: string;
  isAvailable: boolean;
}

interface RequestCardData {
  _id: string;
  recipientName: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  urgency: "critical" | "urgent" | "standard";
  hospital: string;
  division: string;
  district: string;
  upazila: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  isVerifiedGenuine: boolean;
}

export function DualSearchFeed() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"donors" | "requests">("donors");

  // Filters
  const [selectedBlood, setSelectedBlood] = useState<string>("all");
  const [selectedDivision, setSelectedDivision] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");

  // State
  const [donors, setDonors] = useState<DonorCardData[]>([]);
  const [requests, setRequests] = useState<RequestCardData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [revealedContacts, setRevealedContacts] = useState<Record<string, string>>({});
  const [revealingId, setRevealingId] = useState<string | null>(null);
  const [privacyError, setPrivacyError] = useState<string | null>(null);

  const bloodGroups: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const filteredDistricts = selectedDivision === "all"
    ? DISTRICTS
    : DISTRICTS.filter((d) => d.division.toLowerCase() === selectedDivision.toLowerCase());

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setPrivacyError(null);
    try {
      if (activeTab === "donors") {
        const params = new URLSearchParams();
        if (selectedBlood !== "all") params.set("bloodGroup", selectedBlood);
        if (selectedDivision !== "all") params.set("division", selectedDivision);
        if (selectedDistrict !== "all") params.set("district", selectedDistrict);

        const res = await fetch(`/api/donors/search?${params.toString()}`);
        const data = await res.json();
        setDonors(data.donors || []);
      } else {
        const params = new URLSearchParams();
        if (selectedBlood !== "all") params.set("bloodGroup", selectedBlood);
        if (selectedDivision !== "all") params.set("division", selectedDivision);
        if (selectedDistrict !== "all") params.set("district", selectedDistrict);

        const res = await fetch(`/api/requests/search?${params.toString()}`);
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch {
      // Handle fetch failure gracefully
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedBlood, selectedDivision, selectedDistrict]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleRevealContact = async (donorId: string) => {
    setRevealingId(donorId);
    setPrivacyError(null);
    try {
      const res = await fetch(`/api/donors/${donorId}/contact`);
      const data = await res.json();

      if (data.phone) {
        setRevealedContacts((prev) => ({ ...prev, [donorId]: data.phone }));
      } else if (data.requiresLogin) {
        setPrivacyError(language === "bn" ? "যোগাযোগ নম্বর দেখতে অনুগ্রহ করে লগইন করুন।" : "Please sign in to view donor contact details.");
      } else if (data.error) {
        setPrivacyError(data.error);
      }
    } catch {
      setPrivacyError(language === "bn" ? "যোগাযোগ দেখতে সমস্যা হয়েছে।" : "Failed to load contact.");
    } finally {
      setRevealingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dual Tab Switcher */}
      <div className="flex items-center justify-center">
        <div className="inline-flex p-1 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("donors")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "donors"
                ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Droplet size={16} fill="currentColor" />
            <span>{language === "bn" ? "প্রস্তুত রক্তদাতা খুঁজুন" : "Available Donors"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("requests")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "requests"
                ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <AlertCircle size={16} />
            <span>{language === "bn" ? "জরুরী রক্তের আবেদনসমূহ" : "Emergency Transfusions"}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Blood Group Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
              {language === "bn" ? "রক্তের গ্রুপ" : "Blood Group"}
            </label>
            <select
              value={selectedBlood}
              onChange={(e) => setSelectedBlood(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)] text-xs sm:text-sm font-bold text-[var(--text-primary)] focus:border-red-500 outline-none cursor-pointer"
            >
              <option value="all">{language === "bn" ? "সকল রক্তের গ্রুপ" : "All Blood Groups"}</option>
              {bloodGroups.map((bg) => (
                <option key={bg} value={bg}>
                  {bg} {language === "bn" ? `(${translateBloodGroup(bg)})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Division Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
              {language === "bn" ? "বিভাগ" : "Division"}
            </label>
            <select
              value={selectedDivision}
              onChange={(e) => {
                setSelectedDivision(e.target.value);
                setSelectedDistrict("all");
              }}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)] text-xs sm:text-sm font-bold text-[var(--text-primary)] focus:border-red-500 outline-none cursor-pointer"
            >
              <option value="all">{language === "bn" ? "সকল বিভাগ" : "All Divisions"}</option>
              {DIVISIONS.map((div) => (
                <option key={div.id} value={div.nameEn}>
                  {language === "bn" ? div.nameBn : div.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* District Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
              {language === "bn" ? "জেলা" : "District"}
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)] text-xs sm:text-sm font-bold text-[var(--text-primary)] focus:border-red-500 outline-none cursor-pointer"
            >
              <option value="all">{language === "bn" ? "সকল জেলা" : "All Districts"}</option>
              {filteredDistricts.map((dst) => (
                <option key={dst.id} value={dst.nameEn}>
                  {language === "bn" ? dst.nameBn : dst.nameEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {privacyError && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-2">
            <Lock size={15} className="shrink-0" />
            <span>{privacyError}</span>
          </div>
        )}
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
            {language === "bn" ? "রেকর্ড লোড হচ্ছে..." : "Loading records..."}
          </p>
        </div>
      ) : activeTab === "donors" ? (
        donors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {donors.map((donor) => {
              const isRevealed = Boolean(revealedContacts[donor._id]);
              return (
                <div
                  key={donor._id}
                  className="p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-red-500/40 transition-all flex flex-col justify-between group shadow-xs"
                >
                  <div>
                    {/* Header: Blood Pill + Name */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white font-black text-base flex items-center justify-center shadow-md shadow-red-600/20 shrink-0">
                          {donor.bloodGroup}
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] group-hover:text-red-500 transition-colors">
                            {donor.name}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] mt-0.5">
                            <MapPin size={12} className="text-red-500 shrink-0" />
                            <span>
                              {donor.district}, {donor.upazila}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {language === "bn" ? "প্রস্তুত" : "Ready"}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs flex items-center justify-between mb-3.5">
                      <span className="text-[var(--text-muted)]">
                        {language === "bn" ? "মোট রক্তদান:" : "Total Donations:"}
                      </span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {donor.totalDonations} {language === "bn" ? "বার" : "times"}
                      </span>
                    </div>
                  </div>

                  {/* Privacy Shield Contact Action */}
                  <div>
                    {isRevealed ? (
                      <a
                        href={`tel:${revealedContacts[donor._id]}`}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                      >
                        <Phone size={14} />
                        <span>{revealedContacts[donor._id]} (Call Now)</span>
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRevealContact(donor._id)}
                        disabled={revealingId === donor._id}
                        className="w-full py-2.5 px-4 rounded-xl border border-red-500/30 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                      >
                        <Phone size={13} />
                        <span>{revealingId === donor._id ? "Verifying Access..." : `${donor.maskedPhone} • View Contact`}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-14 text-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-8">
            <Droplet size={36} className="text-red-500/40 mx-auto mb-2.5" />
            <h4 className="text-base font-bold text-[var(--text-primary)] mb-1">
              {language === "bn" ? "কোন রক্তদাতা পাওয়া যায়নি" : "No Donors Found"}
            </h4>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              {language === "bn" 
                ? "নির্বাচিত রক্তের গ্রুপ বা জেলার জন্য কোনো সক্রিয় রক্তদাতা পাওয়া যায়নি। ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।" 
                : "No matching active donors found for the selected criteria. Try adjusting the filters."}
            </p>
          </div>
        )
      ) : (
        requests.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map((req) => (
              <div
                key={req._id}
                className="p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-red-500/40 transition-all flex flex-col justify-between group shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white font-black text-base flex items-center justify-center shadow-md shadow-red-600/20 shrink-0">
                        {req.bloodGroup}
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] group-hover:text-red-500 transition-colors">
                          {req.recipientName}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] mt-0.5">
                          <Hospital size={12} className="text-red-500 shrink-0" />
                          <span className="truncate max-w-[170px]">{req.hospital}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      req.urgency === "critical"
                        ? "bg-red-500/10 text-red-600 border border-red-500/20 animate-pulse"
                        : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    }`}>
                      {req.urgency}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs mb-3.5">
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">
                        {language === "bn" ? "প্রয়োজন" : "Needed"}
                      </span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {req.unitsNeeded} {language === "bn" ? "ব্যাগ" : "bag(s)"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">
                        {language === "bn" ? "তারিখ ও সময়" : "Schedule"}
                      </span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {req.scheduledDate} ({req.scheduledTime})
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/requests/${req._id}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>{language === "bn" ? "বিস্তারিত ও রক্ত দিন" : "View Case & Pledge"}</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-14 text-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-8">
            <AlertCircle size={36} className="text-red-500/40 mx-auto mb-2.5" />
            <h4 className="text-base font-bold text-[var(--text-primary)] mb-1">
              {language === "bn" ? "কোন জরুরী আবেদন পাওয়া যায়নি" : "No Emergency Requests Found"}
            </h4>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              {language === "bn"
                ? "বর্তমানে এই ফিল্টারে কোনো সক্রিয় জরুরী আবেদন নেই।"
                : "There are currently no matching emergency cases matching your filter."}
            </p>
          </div>
        )
      )}
    </div>
  );
}
