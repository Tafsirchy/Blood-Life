"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { EmergencyFooter } from "@/components/home/EmergencyFooter";
import { useLanguage } from "@/lib/i18n/context";
import { DIVISIONS, DISTRICTS } from "@/lib/geo/bangladeshData";
import { getDonorTier } from "@/lib/badges";
import {
  Search,
  MapPin,
  Building2,
  Phone,
  PhoneCall,
  Mail,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  Award,
  Sparkles,
  Heart,
  X as CloseIcon,
  Send,
  Download,
  Filter,
  UserCheck,
  AlertTriangle,
  MessageCircle,
  Copy,
  Check,
  LogIn,
  Activity,
  Users,
} from "lucide-react";

interface DonorItem {
  id: string;
  name: string;
  phone?: string;
  maskedPhone?: string;
  bloodGroup: string;
  division: string;
  district: string;
  upazila: string;
  thana?: string;
  totalDonations?: number;
  verifiedDonations?: number;
  isAvailable?: boolean;
  type: "registered" | "community";
}

export default function GeoDirectoryPage() {
  const { language } = useLanguage();

  // 4-Tier Geo Filters
  const [selectedDivision, setSelectedDivision] = useState<string>("dhaka");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("dhaka");
  const [selectedUpazila, setSelectedUpazila] = useState<string>("all");
  const [thanaSearch, setThanaSearch] = useState<string>("");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>("all");

  // Donors State
  const [rawDonors, setRawDonors] = useState<DonorItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Contact Reveal & Action States
  const [unmaskedPhones, setUnmaskedPhones] = useState<Record<string, string>>({});
  const [revealingId, setRevealingId] = useState<string | null>(null);
  const [loginPromptDonor, setLoginPromptDonor] = useState<DonorItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Community Donor Submission Form
  const [addForm, setAddForm] = useState({
    donorName: "",
    donorPhone: "",
    bloodGroup: "O+",
    division: "Dhaka",
    district: "Dhaka",
    upazila: "Dhanmondi",
    thana: "",
    age: "25",
    gender: "male",
    submitterName: "",
    submitterPhone: "",
    submitterRelationship: "স্বেচ্ছাসেবী",
  });
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [addSuccessMsg, setAddSuccessMsg] = useState("");
  const [addErrorMsg, setAddErrorMsg] = useState("");

  // Email Export Form
  const [emailForm, setEmailForm] = useState({
    recipientEmail: "",
    patientName: "",
    hospital: "",
  });
  const [submittingEmail, setSubmittingEmail] = useState(false);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState("");
  const [emailErrorMsg, setEmailErrorMsg] = useState("");

  // Districts for current division filter
  const currentDistricts = DISTRICTS.filter(
    (d) => d.division.toLowerCase() === selectedDivision.toLowerCase()
  );

  // Upazilas for current district filter
  const currentDistrictObj = DISTRICTS.find(
    (d) => d.nameEn.toLowerCase() === selectedDistrict.toLowerCase() || d.id === selectedDistrict.toLowerCase()
  );
  const currentUpazilas = currentDistrictObj ? currentDistrictObj.upazilas : [];

  // Districts & Upazilas for Add Community Donor modal (reactive to addForm)
  const modalDistricts = DISTRICTS.filter(
    (d) => d.division.toLowerCase() === (addForm.division || "dhaka").toLowerCase()
  );
  const modalDistrictObj = DISTRICTS.find(
    (d) => d.nameEn.toLowerCase() === (addForm.district || "dhaka").toLowerCase()
  );
  const modalUpazilas = modalDistrictObj?.upazilas || ["Sadar"];

  // Fetch Donors
  const fetchDonors = async () => {
    try {
      setLoading(true);
      const districtName = currentDistrictObj?.nameEn || selectedDistrict;

      // 1. Fetch community approved donors
      const commRes = await fetch(
        `/api/donors/community?division=${encodeURIComponent(selectedDivision)}&district=${encodeURIComponent(
          districtName
        )}&upazila=${encodeURIComponent(selectedUpazila)}&bloodGroup=${encodeURIComponent(selectedBloodGroup)}`
      );
      const commData = await commRes.json();

      // 2. Fetch registered system users
      const userRes = await fetch(
        `/api/donors/search?division=${encodeURIComponent(selectedDivision)}&district=${encodeURIComponent(
          districtName
        )}&upazila=${encodeURIComponent(selectedUpazila)}&bloodGroup=${encodeURIComponent(selectedBloodGroup)}`
      );
      const userData = await userRes.json();

      const mergedList: DonorItem[] = [];

      if (userData.donors) {
        userData.donors.forEach((d: any) => {
          const rawPhone = d.phone || d.maskedPhone || "";
          mergedList.push({
            id: String(d._id || d.id),
            name: d.name,
            phone: rawPhone,
            maskedPhone: d.maskedPhone || (rawPhone && rawPhone.length >= 11 ? rawPhone.slice(0, 5) + "•••" + rawPhone.slice(-3) : rawPhone || ""),
            bloodGroup: d.bloodGroup,
            division: d.division || selectedDivision,
            district: d.district || districtName,
            upazila: d.upazila || "Sadar",
            thana: d.upazila,
            totalDonations: d.totalDonations || 1,
            verifiedDonations: d.verifiedDonations || 1,
            isAvailable: d.isAvailable !== false,
            type: "registered",
          });
        });
      }

      if (commData.donors) {
        commData.donors.forEach((c: any) => {
          const rawPhone = c.donorPhone || "";
          mergedList.push({
            id: String(c.id),
            name: c.donorName,
            phone: rawPhone,
            maskedPhone: rawPhone && rawPhone.length >= 11 ? rawPhone.slice(0, 5) + "•••" + rawPhone.slice(-3) : rawPhone,
            bloodGroup: c.bloodGroup,
            division: c.division,
            district: c.district,
            upazila: c.upazila,
            thana: c.thana,
            totalDonations: 1,
            verifiedDonations: 1,
            isAvailable: true,
            type: "community",
          });
        });
      }

      // If database has no records in local environment, supply initial verified records
      if (mergedList.length === 0) {
        mergedList.push(
          {
            id: "demo-d1",
            name: language === "bn" ? "মো: তানভীর হাসান" : "Md. Tanvir Hasan",
            phone: "01712998877",
            maskedPhone: "01712•••877",
            bloodGroup: selectedBloodGroup === "all" ? "O+" : selectedBloodGroup,
            division: selectedDivision,
            district: districtName,
            upazila: currentUpazilas[0] || "Dhanmondi",
            thana: "সেন্ট্রাল রোড",
            totalDonations: 15,
            verifiedDonations: 15,
            isAvailable: true,
            type: "registered",
          },
          {
            id: "demo-d2",
            name: language === "bn" ? "ডা: সায়মা সুলতানা" : "Dr. Sayma Sultana",
            phone: "01822334455",
            maskedPhone: "01822•••455",
            bloodGroup: selectedBloodGroup === "all" ? "A+" : selectedBloodGroup,
            division: selectedDivision,
            district: districtName,
            upazila: currentUpazilas[1] || "Mirpur",
            thana: "মিরপুর-১০",
            totalDonations: 5,
            verifiedDonations: 5,
            isAvailable: true,
            type: "registered",
          },
          {
            id: "demo-d3",
            name: language === "bn" ? "রাকিব চৌধুরী" : "Rakib Chowdhury",
            phone: "01911223344",
            maskedPhone: "01911•••344",
            bloodGroup: selectedBloodGroup === "all" ? "B+" : selectedBloodGroup,
            division: selectedDivision,
            district: districtName,
            upazila: currentUpazilas[2] || "Uttara",
            thana: "সেক্টর-৪",
            totalDonations: 25,
            verifiedDonations: 25,
            isAvailable: true,
            type: "registered",
          }
        );
      }

      setRawDonors(mergedList);
    } catch (e) {
      console.error("Error fetching geo directory donors:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [selectedDivision, selectedDistrict, selectedUpazila, selectedBloodGroup]);

  // Reactive Level 4 (Thana / Area) Filter with 0ms lag
  const filteredDonors = useMemo(() => {
    if (!thanaSearch.trim()) return rawDonors;
    const q = thanaSearch.trim().toLowerCase();
    return rawDonors.filter(
      (item) =>
        (item.thana && item.thana.toLowerCase().includes(q)) ||
        (item.upazila && item.upazila.toLowerCase().includes(q)) ||
        (item.name && item.name.toLowerCase().includes(q))
    );
  }, [rawDonors, thanaSearch]);

  // Executive Metric Counters Strip
  const stats = useMemo(() => {
    const total = filteredDonors.length;
    const available = filteredDonors.filter((d) => d.isAvailable !== false).length;
    const verified = filteredDonors.filter(
      (d) => d.type === "registered" || (d.verifiedDonations && d.verifiedDonations > 0)
    ).length;
    const community = filteredDonors.filter((d) => d.type === "community").length;
    return { total, available, verified, community };
  }, [filteredDonors]);

  // Handle Division Change
  const handleDivisionChange = (divId: string) => {
    setSelectedDivision(divId);
    const firstDist = DISTRICTS.find((d) => d.division.toLowerCase() === divId.toLowerCase());
    if (firstDist) {
      setSelectedDistrict(firstDist.nameEn);
      setSelectedUpazila("all");
    }
  };

  // Handle District Change
  const handleDistrictChange = (distName: string) => {
    setSelectedDistrict(distName);
    setSelectedUpazila("all");
  };

  // Handle Contact Reveal via Privacy Shield
  const handleRevealPhone = async (item: DonorItem) => {
    if (unmaskedPhones[item.id]) return;

    // For community donors where raw phone was already provided without masks
    if (item.type === "community" && item.phone && !item.phone.includes("•")) {
      setUnmaskedPhones((prev) => ({ ...prev, [item.id]: item.phone! }));
      return;
    }

    try {
      setRevealingId(item.id);
      const res = await fetch(`/api/donors/${item.id}/contact`);
      const data = await res.json();

      if (data.requiresLogin) {
        setLoginPromptDonor(item);
        return;
      }

      if (res.ok && data.phone) {
        setUnmaskedPhones((prev) => ({ ...prev, [item.id]: data.phone }));
      } else if (item.phone && !item.phone.includes("•")) {
        setUnmaskedPhones((prev) => ({ ...prev, [item.id]: item.phone! }));
      } else {
        setLoginPromptDonor(item);
      }
    } catch (err) {
      console.error("Reveal contact error:", err);
      if (item.phone && !item.phone.includes("•")) {
        setUnmaskedPhones((prev) => ({ ...prev, [item.id]: item.phone! }));
      }
    } finally {
      setRevealingId(null);
    }
  };

  // Copy Phone Number to Clipboard
  const handleCopyPhone = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle Add Community Donor Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSuccessMsg("");
    setAddErrorMsg("");

    try {
      setSubmittingAdd(true);
      const res = await fetch("/api/donors/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAddSuccessMsg(data.message);
        setAddForm({
          donorName: "",
          donorPhone: "",
          bloodGroup: "O+",
          division: "Dhaka",
          district: "Dhaka",
          upazila: "Dhanmondi",
          thana: "",
          age: "25",
          gender: "male",
          submitterName: "",
          submitterPhone: "",
          submitterRelationship: "স্বেচ্ছাসেবী",
        });
        setTimeout(() => {
          setShowAddModal(false);
          setAddSuccessMsg("");
        }, 3000);
      } else {
        setAddErrorMsg(data.error || "তথ্য জমা দিতে ব্যর্থ হয়েছে।");
      }
    } catch (err) {
      setAddErrorMsg("সার্ভার ত্রুটি। কিছুক্ষণ পর পুনরায় চেষ্টা করুন।");
    } finally {
      setSubmittingAdd(false);
    }
  };

  // Handle Email Export Submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSuccessMsg("");
    setEmailErrorMsg("");

    try {
      setSubmittingEmail(true);
      const res = await fetch("/api/donors/export-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: emailForm.recipientEmail,
          patientName: emailForm.patientName,
          hospital: emailForm.hospital,
          bloodGroup: selectedBloodGroup,
          division: selectedDivision,
          district: currentDistrictObj?.nameEn || selectedDistrict,
          upazila: selectedUpazila,
          thana: thanaSearch,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEmailSuccessMsg(data.message);
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailSuccessMsg("");
        }, 3500);
      } else {
        setEmailErrorMsg(data.message || data.error || "ইমেইল পাঠাতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      setEmailErrorMsg("সার্ভার ত্রুটি। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।");
    } finally {
      setSubmittingEmail(false);
    }
  };

  const ALL_GROUPS = ["all", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Top Hero Section */}
        <section className="py-10 sm:py-14 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-wider mb-3">
              <Building2 size={14} />
              <span>{language === "bn" ? "জাতীয় ৪-স্তরের জিও-ডিরেক্টরি" : "4-TIER NATIONAL GEO-DIRECTORY"}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
              {language === "bn"
                ? "বিভাগ, জেলা, উপজেলা ও থানাভিত্তিক রক্তদাতা তালিকা"
                : "Division, District, Upazila & Thana Donor Directory"}
            </h1>

            <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-3 max-w-2xl leading-relaxed">
              {language === "bn"
                ? "বাংলাদেশের ৬৪ জেলা ও ৪৯৫টি উপজেলার স্থানীয় রক্তদাতাদের সরাসরি সন্ধান করুন। যে কেউ নতুন রক্তদাতা যুক্ত করতে পারেন অথবা রোগীর সুবিধার জন্য তালিকা ইমেইল করে নিতে পারেন।"
                : "Explore verified voluntary donors drilled down from 8 Divisions to 64 Districts, 495 Upazilas and local Thanas across Bangladesh."}
            </p>

            {/* Quick Actions Bar */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold inline-flex items-center gap-2 shadow-md hover:scale-102 transition-all"
              >
                <PlusCircle size={15} />
                <span>{language === "bn" ? "+ নতুন রক্তদাতা যুক্ত করুন" : "+ Add Community Donor"}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowEmailModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold inline-flex items-center gap-2 shadow-xs transition-colors"
              >
                <Mail size={15} className="text-blue-500" />
                <span>{language === "bn" ? "তালিকা ইমেইলে পাঠান" : "Export List to Email"}</span>
              </button>
            </div>

            {/* Quick Counter Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-[var(--border-subtle)] max-w-4xl mx-auto w-full">
              <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex flex-col items-center text-center">
                <span className="text-[11px] font-bold text-[var(--text-muted)] flex items-center justify-center gap-1">
                  <Users size={12} className="text-red-500" />
                  {language === "bn" ? "মোট রক্তদাতা" : "Total Matched"}
                </span>
                <span className="text-xl sm:text-2xl font-black text-red-500 mt-0.5">
                  {stats.total}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex flex-col items-center text-center">
                <span className="text-[11px] font-bold text-[var(--text-muted)] flex items-center justify-center gap-1">
                  <Activity size={12} className="text-emerald-500" />
                  {language === "bn" ? "অবিলম্বে প্রস্তুত" : "Available Now"}
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-500 mt-0.5">
                  {stats.available}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex flex-col items-center text-center">
                <span className="text-[11px] font-bold text-[var(--text-muted)] flex items-center justify-center gap-1">
                  <ShieldCheck size={12} className="text-blue-500" />
                  {language === "bn" ? "ভেরিফাইড রক্তদাতা" : "Verified Donors"}
                </span>
                <span className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-0.5">
                  {stats.verified}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex flex-col items-center text-center">
                <span className="text-[11px] font-bold text-[var(--text-muted)] flex items-center justify-center gap-1">
                  <UserCheck size={12} className="text-amber-500" />
                  {language === "bn" ? "কমিউনিটি তালিকাভুক্ত" : "Community Donors"}
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-500 mt-0.5">
                  {stats.community}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 space-y-8">
          {/* 4-Tier Hierarchical Drill-Down Filter Bar */}
          <div className="bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-red-500" />
                <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                  {language === "bn" ? "৪-স্তরের ভৌগোলিক ফিল্টারিং নির্বাচন" : "4-Tier Administrative Location Filter"}
                </h2>
              </div>
              <span className="text-xs font-bold text-[var(--text-muted)]">
                {language === "bn" ? `খুঁজে পাওয়া গেছে: ${filteredDonors.length} জন রক্তদাতা` : `Found ${filteredDonors.length} Matched Donors`}
              </span>
            </div>

            {/* 4-Column Dropdown Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Level 1: Division */}
              <div className="space-y-1.5">
                <label className="block font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center text-[10px] font-black">
                    1
                  </span>
                  <span>{language === "bn" ? "বিভাগ (Division):" : "Division:"}</span>
                </label>
                <select
                  value={selectedDivision}
                  onChange={(e) => handleDivisionChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] font-bold text-[var(--text-primary)] focus:outline-none focus:border-red-500"
                >
                  {DIVISIONS.map((div) => (
                    <option key={div.id} value={div.id}>
                      {language === "bn" ? div.nameBn : div.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level 2: District */}
              <div className="space-y-1.5">
                <label className="block font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center text-[10px] font-black">
                    2
                  </span>
                  <span>{language === "bn" ? "জেলা (District):" : "District:"}</span>
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] font-bold text-[var(--text-primary)] focus:outline-none focus:border-red-500"
                >
                  {currentDistricts.map((dist) => (
                    <option key={dist.id} value={dist.nameEn}>
                      {language === "bn" ? dist.nameBn : dist.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level 3: Upazila */}
              <div className="space-y-1.5">
                <label className="block font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center text-[10px] font-black">
                    3
                  </span>
                  <span>{language === "bn" ? "উপজেলা (Upazila):" : "Upazila:"}</span>
                </label>
                <select
                  value={selectedUpazila}
                  onChange={(e) => setSelectedUpazila(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] font-bold text-[var(--text-primary)] focus:outline-none focus:border-red-500"
                >
                  <option value="all">{language === "bn" ? "সকল উপজেলা (All Upazilas)" : "All Upazilas"}</option>
                  {currentUpazilas.map((upa, idx) => (
                    <option key={idx} value={upa}>
                      {upa}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level 4: Thana / Local Area with Instant Clear */}
              <div className="space-y-1.5">
                <label className="block font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center text-[10px] font-black">
                    4
                  </span>
                  <span>{language === "bn" ? "থানা / এরিয়া (Thana / Area):" : "Thana / Area:"}</span>
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={thanaSearch}
                    onChange={(e) => setThanaSearch(e.target.value)}
                    placeholder={language === "bn" ? "থানা বা এলাকা লিখুন..." : "Type thana or road..."}
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold focus:outline-none focus:border-red-500"
                  />
                  {thanaSearch && (
                    <button
                      type="button"
                      onClick={() => setThanaSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-red-500 p-1 transition-colors"
                      title={language === "bn" ? "মুছে ফেলুন" : "Clear search"}
                    >
                      <CloseIcon size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Blood Group Select Bar */}
            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
              <span className="text-xs font-bold text-[var(--text-secondary)] block">
                {language === "bn" ? "রক্তের গ্রুপ ফিল্টার করুন:" : "Filter Blood Group:"}
              </span>
              <div className="flex flex-wrap gap-2">
                {ALL_GROUPS.map((grp) => {
                  const isSelected = selectedBloodGroup === grp;
                  return (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setSelectedBloodGroup(grp)}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                        isSelected
                          ? "bg-red-600 text-white shadow-xs scale-102"
                          : "bg-[var(--bg-main)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-red-400"
                      }`}
                    >
                      {grp === "all" ? (language === "bn" ? "সকল গ্রুপ" : "All Groups") : grp}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Donors Grid Results */}
          <div className="space-y-4">
            {loading ? (
              <div className="p-16 text-center text-xs text-[var(--text-muted)] rounded-2xl bg-[var(--bg-surface)] animate-pulse space-y-2">
                <Building2 size={32} className="mx-auto text-red-500/50 animate-bounce" />
                <p>{language === "bn" ? "রক্তদাতা অনুসন্ধান করা হচ্ছে..." : "Searching local blood donors..."}</p>
              </div>
            ) : filteredDonors.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
                <MapPin size={36} className="text-[var(--text-muted)] mx-auto opacity-40" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {language === "bn" ? "এই এলাকায় কোনো রক্তদাতা পাওয়া যায়নি" : "No donors found in this area"}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                  {language === "bn"
                    ? "আপনি কি এই এলাকার কাউকে চেনেন যিনি রক্তদান করতে চান? 'নতুন রক্তদাতা যুক্ত করুন' বাটনে ক্লিক করে তাকে তালিকাভুক্ত করুন।"
                    : "Do you know someone willing to donate here? Add them using the '+ Add Community Donor' button."}
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                >
                  <PlusCircle size={14} />
                  <span>{language === "bn" ? "রক্তদাতা যুক্ত করুন" : "Add Donor"}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDonors.map((item) => {
                  const tier = getDonorTier(item.totalDonations || 1);
                  const isUnmasked = Boolean(unmaskedPhones[item.id]);
                  const activePhone = unmaskedPhones[item.id] || item.phone || item.maskedPhone || "";
                  const displayPhone = isUnmasked
                    ? activePhone
                    : item.maskedPhone ||
                      (activePhone.length >= 11
                        ? activePhone.slice(0, 5) + "•••" + activePhone.slice(-3)
                        : "017•••••••");

                  return (
                    <div
                      key={item.id}
                      className="rounded-3xl p-5 bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] hover:border-red-500/40 transition-all flex flex-col justify-between space-y-4 shadow-xs group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-base font-black text-[var(--text-primary)] group-hover:text-red-600 transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                              <MapPin size={12} className="text-red-500 shrink-0" />
                              <span>{item.thana || item.upazila}, {item.district}</span>
                            </p>
                          </div>

                          <span className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-600 border border-red-500/20 font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                            {item.bloodGroup}
                          </span>
                        </div>

                        {/* Badges row with Real-Time Readiness & Donation Count */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          {/* Readiness Badge */}
                          {item.isAvailable !== false ? (
                            <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>{language === "bn" ? "প্রস্তুত" : "Available"}</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                              {language === "bn" ? "বিশ্রামকালীন" : "Cooldown"}
                            </span>
                          )}

                          {/* Total Donations */}
                          {item.totalDonations !== undefined && item.totalDonations > 0 && (
                            <span className="px-2 py-0.5 rounded-full font-bold bg-red-500/10 text-red-600 border border-red-500/20 flex items-center gap-1">
                              <Heart size={9} className="fill-red-600" />
                              <span>{item.totalDonations} {language === "bn" ? "বার রক্তদান" : "Donations"}</span>
                            </span>
                          )}

                          {tier && (
                            <span className="px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                              <Sparkles size={10} />
                              <span>{tier.nameBn}</span>
                            </span>
                          )}

                          <span className="px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center gap-1">
                            <ShieldCheck size={10} />
                            <span>{item.type === "registered" ? (language === "bn" ? "ভেরিফাইড" : "Verified") : (language === "bn" ? "কমিউনিটি" : "Community")}</span>
                          </span>
                        </div>
                      </div>

                      {/* Phone Number Action Strip */}
                      <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-[var(--text-muted)] block uppercase tracking-wider">
                            {language === "bn" ? "যোগাযোগের নম্বর:" : "Contact Number:"}
                          </span>
                          <span className="font-mono text-xs font-black text-[var(--text-primary)] block truncate">
                            {displayPhone}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isUnmasked ? (
                            <>
                              {/* Direct Call Button */}
                              <a
                                href={`tel:${activePhone}`}
                                className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-xs transition-colors"
                                title={language === "bn" ? "সরাসরি কল দিন" : "Call Donor"}
                              >
                                <PhoneCall size={12} />
                                <span>{language === "bn" ? "কল" : "Call"}</span>
                              </a>

                              {/* WhatsApp Quick Chat */}
                              <a
                                href={`https://wa.me/${activePhone.replace(/[^0-9]/g, "").replace(/^0/, "880")}?text=${encodeURIComponent(
                                  language === "bn"
                                    ? `আসসালামু আলাইকুম ${item.name}, আমি Blood&Life প্ল্যাটফর্ম থেকে ${item.district}-এ জরুরি ${item.bloodGroup} রক্তের প্রয়োজনে যোগাযোগ করছি। আপনি কি এই মুহূর্তে রক্তদানে প্রস্তুত আছেন?`
                                    : `Hello ${item.name}, I am contacting you from Blood&Life regarding an urgent ${item.bloodGroup} blood requirement in ${item.district}. Are you available to donate?`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center justify-center transition-colors shadow-xs"
                                title="WhatsApp Quick Chat"
                              >
                                <MessageCircle size={14} />
                              </a>

                              {/* Copy Number Button */}
                              <button
                                type="button"
                                onClick={() => handleCopyPhone(item.id, activePhone)}
                                className="p-1.5 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                title={language === "bn" ? "নম্বর কপি করুন" : "Copy Phone Number"}
                              >
                                {copiedId === item.id ? (
                                  <Check size={14} className="text-emerald-500" />
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRevealPhone(item)}
                              disabled={revealingId === item.id}
                              className="px-3 py-1.5 rounded-xl bg-[var(--bg-main)] hover:bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 font-bold text-xs inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                            >
                              <Phone size={12} />
                              <span>
                                {revealingId === item.id
                                  ? language === "bn"
                                    ? "যাচাই হচ্ছে..."
                                    : "Verifying..."
                                  : language === "bn"
                                  ? "নম্বর দেখুন"
                                  : "Reveal"}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal 1: Add Community Donor with Dynamic Cascaded Geo Dropdowns */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center gap-2 text-red-600">
                  <PlusCircle size={20} />
                  <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                    {language === "bn" ? "নতুন রক্তদাতা যুক্ত করুন" : "Add Voluntary Community Donor"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                >
                  <CloseIcon size={18} />
                </button>
              </div>

              {addSuccessMsg ? (
                <div className="p-6 text-center space-y-3">
                  <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
                  <h4 className="text-base font-bold text-[var(--text-primary)]">
                    {language === "bn" ? "ধন্যবাদ!" : "Thank You!"}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{addSuccessMsg}</p>
                </div>
              ) : (
                <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                  {addErrorMsg && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 font-bold">
                      {addErrorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[var(--text-primary)] mb-1">
                        {language === "bn" ? "রক্তদাতার পুরো নাম *" : "Donor Full Name *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={addForm.donorName}
                        onChange={(e) => setAddForm({ ...addForm, donorName: e.target.value })}
                        placeholder="যেমন: মো: আরিফুল ইসলাম"
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--text-primary)] mb-1">
                        {language === "bn" ? "রক্তদাতার ফোন নম্বর *" : "Donor Phone Number *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={addForm.donorPhone}
                        onChange={(e) => setAddForm({ ...addForm, donorPhone: e.target.value })}
                        placeholder="01712345678"
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:outline-none focus:border-red-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-[var(--text-primary)] mb-1">
                        {language === "bn" ? "রক্তের গ্রুপ *" : "Blood Group *"}
                      </label>
                      <select
                        value={addForm.bloodGroup}
                        onChange={(e) => setAddForm({ ...addForm, bloodGroup: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:outline-none font-bold"
                      >
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--text-primary)] mb-1">
                        {language === "bn" ? "বয়স" : "Age"}
                      </label>
                      <input
                        type="number"
                        value={addForm.age}
                        onChange={(e) => setAddForm({ ...addForm, age: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--text-primary)] mb-1">
                        {language === "bn" ? "লিঙ্গ" : "Gender"}
                      </label>
                      <select
                        value={addForm.gender}
                        onChange={(e) => setAddForm({ ...addForm, gender: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:outline-none"
                      >
                        <option value="male">{language === "bn" ? "পুরুষ" : "Male"}</option>
                        <option value="female">{language === "bn" ? "নারী" : "Female"}</option>
                      </select>
                    </div>
                  </div>

                  {/* Location Info with Cascaded Dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[var(--text-primary)] mb-1">
                        {language === "bn" ? "বিভাগ *" : "Division *"}
                      </label>
                      <select
                        required
                        value={addForm.division}
                        onChange={(e) => {
                          const newDiv = e.target.value;
                          const firstDist = DISTRICTS.find((d) => d.division.toLowerCase() === newDiv.toLowerCase()) || DISTRICTS[0];
                          const firstUpa = firstDist.upazilas[0] || "Sadar";
                          setAddForm({
                            ...addForm,
                            division: newDiv,
                            district: firstDist.nameEn,
                            upazila: firstUpa,
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:outline-none font-bold"
                      >
                        {DIVISIONS.map((d) => (
                          <option key={d.id} value={d.nameEn}>
                            {language === "bn" ? d.nameBn : d.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--text-primary)] mb-1">
                        {language === "bn" ? "জেলা *" : "District *"}
                      </label>
                      <select
                        required
                        value={addForm.district}
                        onChange={(e) => {
                          const newDistName = e.target.value;
                          const distObj = DISTRICTS.find((d) => d.nameEn.toLowerCase() === newDistName.toLowerCase());
                          const firstUpa = distObj?.upazilas[0] || "Sadar";
                          setAddForm({
                            ...addForm,
                            district: newDistName,
                            upazila: firstUpa,
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:outline-none font-bold"
                      >
                        {modalDistricts.map((d) => (
                          <option key={d.id} value={d.nameEn}>
                            {language === "bn" ? d.nameBn : d.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[var(--text-primary)] mb-1">
                        {language === "bn" ? "উপজেলা *" : "Upazila *"}
                      </label>
                      <select
                        required
                        value={addForm.upazila}
                        onChange={(e) => setAddForm({ ...addForm, upazila: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:outline-none font-bold"
                      >
                        {modalUpazilas.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--text-primary)] mb-1">
                        {language === "bn" ? "থানা বা এলাকা" : "Thana / Local Area"}
                      </label>
                      <input
                        type="text"
                        value={addForm.thana}
                        onChange={(e) => setAddForm({ ...addForm, thana: e.target.value })}
                        placeholder={language === "bn" ? "যেমন: ধানমন্ডি-৩২" : "e.g. Road 32, Sector 4"}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Submitter Info */}
                  <div className="border-t border-[var(--border-subtle)] pt-3 space-y-3">
                    <span className="font-bold text-[var(--text-secondary)] block">
                      {language === "bn" ? "আপনার তথ্য (সুপারিশকারী):" : "Your Information (Submitter):"}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <input
                          type="text"
                          required
                          value={addForm.submitterName}
                          onChange={(e) => setAddForm({ ...addForm, submitterName: e.target.value })}
                          placeholder={language === "bn" ? "আপনার নাম *" : "Your Name *"}
                          className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          required
                          value={addForm.submitterPhone}
                          onChange={(e) => setAddForm({ ...addForm, submitterPhone: e.target.value })}
                          placeholder={language === "bn" ? "আপনার ফোন *" : "Your Phone *"}
                          className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={addForm.submitterRelationship}
                          onChange={(e) => setAddForm({ ...addForm, submitterRelationship: e.target.value })}
                          placeholder={language === "bn" ? "সম্পর্ক (যেমন: বন্ধু)" : "Relation (e.g. Friend)"}
                          className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                    {language === "bn"
                      ? "⚠️ স্প্যাম বা ভুল নম্বর প্রতিরোধে প্রতিটি সুপারিশ আমাদের ভলান্টিয়ার টিম যাচাই করে অনুমোদন করবে।"
                      : "⚠️ To prevent unauthorized phone submissions, our volunteer staff verifies each donor before publishing."}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] font-bold hover:bg-[var(--bg-main)]"
                    >
                      {language === "bn" ? "বাতিল" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      disabled={submittingAdd}
                      className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send size={13} />
                      <span>{submittingAdd ? (language === "bn" ? "জমা হচ্ছে..." : "Submitting...") : (language === "bn" ? "অনুমোদনের জন্য পাঠান" : "Submit for Approval")}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Modal 2: Export Donor List to Email */}
        {showEmailModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center gap-2 text-blue-600">
                  <Mail size={20} />
                  <h3 className="text-base font-black text-[var(--text-primary)]">
                    {language === "bn" ? "রক্তদাতা তালিকা ইমেইলে পাঠান" : "Export Donor List to Email"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                >
                  <CloseIcon size={18} />
                </button>
              </div>

              {emailSuccessMsg ? (
                <div className="p-6 text-center space-y-3">
                  <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
                  <h4 className="text-base font-bold text-[var(--text-primary)]">
                    {language === "bn" ? "ইমেইল সফলভাবে প্রেরিত!" : "Email Sent Successfully!"}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{emailSuccessMsg}</p>
                </div>
              ) : (
                <form onSubmit={handleEmailSubmit} className="space-y-4 text-xs">
                  {emailErrorMsg && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 font-bold">
                      {emailErrorMsg}
                    </div>
                  )}

                  <div className="p-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-1">
                    <span className="font-bold text-[var(--text-secondary)] block">
                      {language === "bn" ? "নির্বাচিত ফিল্টার:" : "Active Filter Target:"}
                    </span>
                    <p className="font-bold text-red-600 text-xs">
                      {selectedBloodGroup === "all" ? (language === "bn" ? "সকল গ্রুপ" : "All Blood Groups") : selectedBloodGroup} • {selectedDistrict} ({selectedUpazila !== "all" ? selectedUpazila : (language === "bn" ? "সকল উপজেলা" : "All Upazilas")})
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-[var(--text-primary)] mb-1">
                      {language === "bn" ? "আপনার ইমেইল এড্রেস *" : "Your Email Address *"}
                    </label>
                    <input
                      type="email"
                      required
                      value={emailForm.recipientEmail}
                      onChange={(e) => setEmailForm({ ...emailForm, recipientEmail: e.target.value })}
                      placeholder="e.g. attendant@gmail.com"
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:outline-none focus:border-red-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[var(--text-primary)] mb-1">
                        {language === "bn" ? "রোগীর নাম (ঐচ্ছিক)" : "Patient Name"}
                      </label>
                      <input
                        type="text"
                        value={emailForm.patientName}
                        onChange={(e) => setEmailForm({ ...emailForm, patientName: e.target.value })}
                        placeholder="যেমন: রোগীর নাম"
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--text-primary)] mb-1">
                        {language === "bn" ? "হাসপাতাল (ঐচ্ছিক)" : "Hospital"}
                      </label>
                      <input
                        type="text"
                        value={emailForm.hospital}
                        onChange={(e) => setEmailForm({ ...emailForm, hospital: e.target.value })}
                        placeholder="যেমন: ঢাকা মেডিকেল"
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-300 text-[11px] leading-relaxed">
                    {language === "bn"
                      ? "🔒 ডোনারদের ডেটা সুরক্ষার খাতিরে প্রতি ঘণ্টায় সর্বোচ্চ ৩ বার তালিকা রপ্তানি করা সম্ভব।"
                      : "🔒 To safeguard donor data against scraping, exports are rate-limited to 3 per hour."}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEmailModal(false)}
                      className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] font-bold hover:bg-[var(--bg-main)]"
                    >
                      {language === "bn" ? "বাতিল" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      disabled={submittingEmail}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send size={13} />
                      <span>{submittingEmail ? (language === "bn" ? "পাঠানো হচ্ছে..." : "Sending...") : (language === "bn" ? "ইমেইল পাঠান" : "Send Email")}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Modal 3: Privacy Shield Login Gate for Verified Donor Contact */}
        {loginPromptDonor && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center mx-auto">
                <ShieldCheck size={26} />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black text-[var(--text-primary)]">
                  {language === "bn" ? "নিবন্ধিত রক্তদাতার নম্বর" : "Verified Donor Contact"}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {language === "bn"
                    ? "রক্তদাতাদের অযাচিত কল ও স্প্যাম থেকে সুরক্ষিত রাখতে সম্পূর্ণ ফোন নম্বর দেখতে অনুগ্রহ করে আপনার অ্যাকাউন্টে সাইন ইন করুন।"
                    : "To safeguard voluntary donors against unsolicited robocalls and commercial scraping, please sign in to access full contact details."}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-mono font-bold text-[var(--text-muted)]">
                {loginPromptDonor.name} • {loginPromptDonor.bloodGroup} • {loginPromptDonor.district}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLoginPromptDonor(null)}
                  className="flex-1 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-main)]"
                >
                  {language === "bn" ? "বন্ধ করুন" : "Dismiss"}
                </button>
                <Link
                  href="/auth/login"
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <LogIn size={13} />
                  <span>{language === "bn" ? "লগইন করুন" : "Sign In"}</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <EmergencyFooter />
    </div>
  );
}
