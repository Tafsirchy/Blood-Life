"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { BloodLagbeLogo } from "@/components/brand/BloodLagbeLogo";
import { DIVISIONS, DISTRICTS } from "@/lib/geo/bangladeshData";
import { BloodGroup } from "@/types";
import { UserPlus, Mail, Lock, Phone, User, MapPin, Heart, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { language } = useLanguage();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("O+");
  const [role, setRole] = useState<"Donor" | "Requester">("Donor");
  const [division, setDivision] = useState("Dhaka");
  const [district, setDistrict] = useState("Dhaka");
  const [upazila, setUpazila] = useState("Dhanmondi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bloodGroups: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          bloodGroup,
          division,
          district,
          upazila,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      localStorage.setItem("dashboard_preferred_role", role.toLowerCase());
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BloodLagbeLogo size="lg" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
            {language === "bn" ? "রক্তদাতা হিসেবে নিবন্ধন করুন" : "Join the Life-Saving Network"}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            {language === "bn"
              ? "জরুরী মুহূর্তে রক্ত দিয়ে অন্যের জীবন বাঁচাতে যুক্ত হন আমাদের ভলান্টিয়ার নেটওয়ার্কে"
              : "Register as a voluntary hero. Your phone is masked by our Privacy Shield."}
          </p>
        </div>

        <div className="card-clinical p-6 border-2 border-[var(--border-subtle)] space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  {language === "bn" ? "পুরো নাম" : "Full Name"}
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-3 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tafsirul Islam"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-medium outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  {language === "bn" ? "রক্তের গ্রুপ" : "Blood Group"}
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-bold outline-none"
                >
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  {language === "bn" ? "ইমেইল এড্রেস" : "Email Address"}
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-3 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-medium outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  {language === "bn" ? "ফোন নম্বর (সুরক্ষিত)" : "Phone Number"}
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-3 text-[var(--text-muted)]" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1711-..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-medium outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                {language === "bn" ? "পাসওয়ার্ড" : "Password"}
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-3 text-[var(--text-muted)]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-medium outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  {language === "bn" ? "বিভাগ" : "Division"}
                </label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-bold outline-none"
                >
                  {DIVISIONS.map((d) => (
                    <option key={d.id} value={d.nameEn}>
                      {language === "bn" ? d.nameBn : d.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  {language === "bn" ? "জেলা" : "District"}
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-bold outline-none"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d.id} value={d.nameEn}>
                      {language === "bn" ? d.nameBn : d.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Primary Intent / Role Selector */}
            <div className="pt-1">
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                {language === "bn" ? "আপনার প্রাথমিক ভূমিকা নির্বাচন করুন:" : "Select Your Primary Account Role:"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("Donor")}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    role === "Donor"
                      ? "bg-red-500/10 border-red-500 text-red-600 dark:text-red-400 ring-2 ring-red-500/20 shadow-xs"
                      : "bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-red-400"
                  }`}
                >
                  <Heart size={14} className={role === "Donor" ? "fill-current text-red-600" : ""} />
                  <span>{language === "bn" ? "রক্তদাতা (Donor)" : "Blood Donor"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("Requester")}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    role === "Requester"
                      ? "bg-red-500/10 border-red-500 text-red-600 dark:text-red-400 ring-2 ring-red-500/20 shadow-xs"
                      : "bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-red-400"
                  }`}
                >
                  <FileText size={14} />
                  <span>{language === "bn" ? "রক্ত গ্রহীতা (Requester)" : "Blood Requester"}</span>
                </button>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                {language === "bn"
                  ? "💡 রেজিস্ট্রেশনের পর ড্যাশবোর্ড থেকে যে কোনো সময় এক ক্লিকেই রক্তদাতা ও গ্রহীতা মোডে সুইচ করতে পারবেন।"
                  : "💡 You can seamlessly switch between Donor and Requester modes at any time from your dashboard."}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-emergency !py-2.5 text-xs font-bold flex items-center justify-center gap-2 mt-2"
            >
              <UserPlus size={14} />
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
          </form>

          <div className="pt-2 text-center border-t border-[var(--border-subtle)]">
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
        </div>
      </div>
    </div>
  );
}
