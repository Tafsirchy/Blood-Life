"use client";

import React, { useState, useMemo } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { BloodLagbeLogo } from "@/components/brand/BloodLagbeLogo";
import {
  BD_DIVISIONS,
  getDistrictsForDivision,
  getUpazilasForDistrict,
} from "@/lib/geo/bangladeshData";
import { BloodGroup } from "@/types";
import {
  UserPlus,
  Mail,
  Lock,
  Phone,
  User,
  MapPin,
  Building2,
  Navigation,
  Home,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { language } = useLanguage();
  const router = useRouter();

  // Basic Account Details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("O+");

  // Security Credentials
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 4-Tier Cascaded Location Hierarchy (Division -> District -> Upazila/Thana -> Union/Area)
  // Default to Dhaka Division (id: "3"), Dhaka District (id: "1")
  const [selectedDivId, setSelectedDivId] = useState<string>("3");
  const [selectedDistId, setSelectedDistId] = useState<string>("1");

  const initialUpazilas = useMemo(() => getUpazilasForDistrict("1"), []);
  const defaultUpazilaId = initialUpazilas.find((u) => u.name === "Dhanmondi")?.id || initialUpazilas[0]?.id || "";
  const [selectedUpazilaId, setSelectedUpazilaId] = useState<string>(defaultUpazilaId);

  // Detailed Free-Text Address (House, Road, Village, Area, Landmark)
  const [address, setAddress] = useState<string>("");

  // Step Wizard State (1: Personal & Security, 2: Location & Address)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bloodGroups: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Memoized dynamic dependent options
  const availableDistricts = useMemo(() => {
    return getDistrictsForDivision(selectedDivId);
  }, [selectedDivId]);

  const availableUpazilas = useMemo(() => {
    return getUpazilasForDistrict(selectedDistId);
  }, [selectedDistId]);

  // Cascading Change Handlers
  const handleDivisionChange = (divId: string) => {
    setSelectedDivId(divId);
    const districts = getDistrictsForDivision(divId);
    const firstDistId = districts[0]?.id || "";
    setSelectedDistId(firstDistId);

    const upazilas = getUpazilasForDistrict(firstDistId);
    const firstUpId = upazilas[0]?.id || "";
    setSelectedUpazilaId(firstUpId);
  };

  const handleDistrictChange = (distId: string) => {
    setSelectedDistId(distId);
    const upazilas = getUpazilasForDistrict(distId);
    const firstUpId = upazilas[0]?.id || "";
    setSelectedUpazilaId(firstUpId);
  };

  const handleUpazilaChange = (upId: string) => {
    setSelectedUpazilaId(upId);
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    setError(null);
    if (!name.trim()) {
      setError(language === "bn" ? "অনুগ্রহ করে আপনার পুরো নাম লিখুন।" : "Please enter your full name.");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      setError(language === "bn" ? "একটি সঠিক ইমেইল এড্রেস লিখুন।" : "Please enter a valid email address.");
      return false;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.length < 11) {
      setError(language === "bn" ? "সঠিক ১১ ডিজিটের ফোন নম্বর লিখুন।" : "Please enter a valid 11-digit phone number.");
      return false;
    }
    if (password.length < 8) {
      setError(
        language === "bn"
          ? "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।"
          : "Password must be at least 8 characters long."
      );
      return false;
    }
    if (password !== confirmPassword) {
      setError(
        language === "bn"
          ? "পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড একই হতে হবে।"
          : "Password and Confirm Password do not match."
      );
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      handleNextStep();
      return;
    }
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    setLoading(true);
    setError(null);

    // Resolve Location Names
    const divObj = BD_DIVISIONS.find((d) => d.id === selectedDivId);
    const distObj = availableDistricts.find((d) => d.id === selectedDistId);
    const upObj = availableUpazilas.find((u) => u.id === selectedUpazilaId);

    const divisionName = divObj?.name || "Dhaka";
    const districtName = distObj?.name || "Dhaka";
    const upazilaName = upObj?.name || "Dhanmondi";

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          bloodGroup,
          division: divisionName,
          district: districtName,
          upazila: upazilaName,
          union: "",
          address: address.trim(),
          role: "Donor",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      localStorage.setItem("dashboard_preferred_role", "donor");
      if (data.requiresVerification) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isPasswordMatch = confirmPassword.length > 0 && password === confirmPassword;
  const isPasswordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col items-center justify-center p-4 py-8">
      <div className="w-full max-w-lg space-y-4">
        {/* Top Back to Home Button */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-red-500 transition-colors py-1.5 px-3 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] hover:border-red-500/30 shadow-xs"
          >
            <ArrowLeft size={13} />
            <span>{language === "bn" ? "হোম পেজে ফিরে যান" : "Back to Home"}</span>
          </Link>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="flex justify-center">
            <BloodLagbeLogo size="lg" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
            {language === "bn" ? "জরুরি ব্লাড নেটওয়ার্কে নিবন্ধন করুন" : "Join the Life-Saving Network"}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            {language === "bn"
              ? "রক্তদাতা ও গ্রহীতা উভয় সুবিধা • ফোন নম্বর প্রাইভেসী শিল্ড দ্বারা সুরক্ষিত"
              : "Dual Donor & Requester Access • Phone masked by Privacy Shield"}
          </p>
        </div>

        {/* Step Indicator Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-[var(--surface-card)] rounded-2xl border border-[var(--border-subtle)] text-xs font-bold shadow-xs">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              currentStep === 1
                ? "bg-red-600 text-white shadow-xs font-black"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center ${
                currentStep === 1
                  ? "bg-white/20 text-white"
                  : "bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
              }`}
            >
              ১
            </span>
            <span>{language === "bn" ? "ব্যক্তিগত ও নিরাপত্তা" : "Personal & Security"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (currentStep === 1) handleNextStep();
            }}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              currentStep === 2
                ? "bg-red-600 text-white shadow-xs font-black"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center ${
                currentStep === 2
                  ? "bg-white/20 text-white"
                  : "bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
              }`}
            >
              ২
            </span>
            <span>{language === "bn" ? "অবস্থান ও ঠিকানা" : "Location & Address"}</span>
          </button>
        </div>

        {/* Form Card */}
        <div className="card-clinical p-6 border-2 border-[var(--border-subtle)] space-y-4 shadow-xl">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* STEP 1: Personal & Security */}
            {currentStep === 1 && (
              <div className="space-y-3.5 animate-in fade-in">
                {/* Full Name & Blood Group */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                      {language === "bn" ? "পুরো নাম" : "Full Name"} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-3 text-[var(--text-muted)]" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tafsirul Islam"
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-medium outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                      {language === "bn" ? "রক্তের গ্রুপ" : "Blood Group"} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                      className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-bold outline-none cursor-pointer focus:border-red-500"
                    >
                      {bloodGroups.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                      {language === "bn" ? "ইমেইল এড্রেস" : "Email Address"} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-3 text-[var(--text-muted)]" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-medium outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                      {language === "bn" ? "ফোন নম্বর (সুরক্ষিত)" : "Phone Number"} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3 top-3 text-[var(--text-muted)]" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+880 1711-XXXXXX"
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-medium outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                      {language === "bn" ? "পাসওয়ার্ড" : "Password"} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-3 text-[var(--text-muted)]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={language === "bn" ? "কমপক্ষে ৮ অক্ষর ও ১ সংখ্যা" : "Min 8 chars with 1 number"}
                        className="w-full pl-9 pr-9 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-medium outline-none focus:border-red-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-[var(--text-muted)] hover:text-red-500 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                      {language === "bn" ? "পাসওয়ার্ড নিশ্চিত করুন" : "Confirm Password"} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-3 text-[var(--text-muted)]" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={language === "bn" ? "একই পাসওয়ার্ড পুনরায় লিখুন" : "Re-enter password"}
                        className={`w-full pl-9 pr-9 py-2.5 rounded-lg bg-[var(--bg-main)] border text-xs font-medium outline-none transition-all ${
                          isPasswordMismatch
                            ? "border-red-500 ring-1 ring-red-500/20"
                            : isPasswordMatch
                            ? "border-emerald-500 ring-1 ring-emerald-500/20"
                            : "border-[var(--border-subtle)] focus:border-red-500"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-[var(--text-muted)] hover:text-red-500 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Password Match Feedback */}
                {isPasswordMismatch && (
                  <p className="text-[11px] text-red-500 font-bold flex items-center gap-1">
                    <span>⚠️ {language === "bn" ? "পাসওয়ার্ড দুটি মিলছে না।" : "Passwords do not match."}</span>
                  </p>
                )}
                {isPasswordMatch && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    <span>{language === "bn" ? "পাসওয়ার্ড মিলেছে।" : "Passwords match perfectly."}</span>
                  </p>
                )}

                {/* Step 1 Next Button */}
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full btn-emergency !py-3 text-xs font-bold flex items-center justify-center gap-2 mt-2 shadow-md cursor-pointer"
                >
                  <span>{language === "bn" ? "পরবর্তী ধাপ: অবস্থান ও ঠিকানা" : "Next: Location & Address"}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            )}

            {/* STEP 2: Location & Address */}
            {currentStep === 2 && (
              <div className="space-y-3.5 animate-in fade-in">
                <div>
                  <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <MapPin size={14} className="text-red-500" />
                    <span>
                      {language === "bn"
                        ? "অবস্থান নির্বাচন (ড্রপডাউন থেকে নির্বাচন আবশ্যক)"
                        : "Location Selection (Required Dropdowns)"}
                    </span>
                  </label>
                </div>

                {/* Tier 1 & Tier 2: Division & District */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1 flex items-center gap-1">
                      <Building2 size={12} className="text-[var(--text-muted)]" />
                      <span>{language === "bn" ? "১. বিভাগ (Division)" : "1. Division"} <span className="text-red-500">*</span></span>
                    </label>
                    <select
                      value={selectedDivId}
                      onChange={(e) => handleDivisionChange(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-bold outline-none cursor-pointer focus:border-red-500"
                    >
                      {BD_DIVISIONS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {language === "bn" ? `${d.bn_name} (${d.name})` : `${d.name} (${d.bn_name})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1 flex items-center gap-1">
                      <MapPin size={12} className="text-[var(--text-muted)]" />
                      <span>{language === "bn" ? "২. জেলা (District)" : "2. District"} <span className="text-red-500">*</span></span>
                    </label>
                    <select
                      value={selectedDistId}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-bold outline-none cursor-pointer focus:border-red-500"
                    >
                      {availableDistricts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {language === "bn" ? `${d.bn_name} (${d.name})` : `${d.name} (${d.bn_name})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Upazila / Thana */}
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1 flex items-center gap-1">
                    <Navigation size={12} className="text-[var(--text-muted)]" />
                    <span>{language === "bn" ? "৩. উপজেলা / থানা (Upazila/Thana)" : "3. Upazila / Thana"} <span className="text-red-500">*</span></span>
                  </label>
                  <select
                    value={selectedUpazilaId}
                    onChange={(e) => handleUpazilaChange(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-bold outline-none cursor-pointer focus:border-red-500"
                  >
                    {availableUpazilas.map((u) => (
                      <option key={u.id} value={u.id}>
                        {language === "bn" ? `${u.bn_name} (${u.name})` : `${u.name} (${u.bn_name})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Free-Text Detailed Address (House, Road, Village, Area, Landmark) */}
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1 flex items-center gap-1">
                    <Home size={12} className="text-[var(--text-muted)]" />
                    <span>{language === "bn" ? "বিস্তারিত ঠিকানা (বাড়ি, রোড, গ্রাম, এলাকা বা ল্যান্ডমার্ক)" : "Detailed Address (House, Road, Village, Area)"}</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={
                      language === "bn"
                        ? "যেমন: বাড়ি নং ১২, রোড নং ৪, সেক্টর ৩, ফ্ল্যাট ৫বি..."
                        : "e.g. House 12, Road 4, Sector 3, Flat 5B..."
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-medium outline-none focus:border-red-500"
                  />
                </div>

                {/* Unified Dual-Role Service Indicator */}
                <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15 flex items-center gap-2.5 text-left">
                  <Sparkles size={16} className="text-red-500 shrink-0" />
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    {language === "bn"
                      ? "💡 আপনার একাউন্টে রক্তদান (Donor) এবং রক্ত আবেদন (Requester) উভয় সেবাই সার্বক্ষণিক সক্রিয় থাকবে।"
                      : "💡 Your account automatically includes full access to both Blood Donor and Requester services."}
                  </p>
                </div>

                {/* Step 2 Back & Submit Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setCurrentStep(1);
                    }}
                    className="px-4 py-3 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-main)] text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>{language === "bn" ? "পূর্ববর্তী" : "Back"}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading || isPasswordMismatch}
                    className="flex-1 btn-emergency !py-3 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md cursor-pointer"
                  >
                    <UserPlus size={15} />
                    <span>
                      {loading
                        ? language === "bn"
                          ? "নিবন্ধন হচ্ছে..."
                          : "Registering..."
                        : language === "bn"
                        ? "নিবন্ধন সম্পন্ন করুন"
                        : "Complete Registration"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Login & Home Link */}
          <div className="pt-2 text-center border-t border-[var(--border-subtle)] space-y-2">
            <div>
              <span className="text-xs text-[var(--text-muted)]">
                {language === "bn" ? "ইতিমধ্যে অ্যাকাউন্ট আছে? " : "Already registered? "}
              </span>
              <Link
                href="/auth/login"
                className="text-xs font-bold text-red-500 hover:text-red-400"
              >
                {language === "bn" ? "লগইন করুন" : "Sign In"}
              </Link>
            </div>
            <div>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors pt-1"
              >
                <Home size={13} />
                <span>{language === "bn" ? "হোম পেজে ফিরে যান" : "Back to Home"}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
