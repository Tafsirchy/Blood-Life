"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { DIVISIONS, DISTRICTS } from "@/lib/geo/bangladeshData";
import { Lock, MapPin, CheckCircle2 } from "lucide-react";

export default function DashboardSettingsPage() {
  const { language } = useLanguage();
  const [hidePhone, setHidePhone] = useState(true);
  const [notifyOnView, setNotifyOnView] = useState(true);
  const [division, setDivision] = useState("Dhaka");
  const [district, setDistrict] = useState("Dhaka");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/users/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          if (d.user.division) setDivision(d.user.division);
          if (d.user.district) setDistrict(d.user.district);
          if (d.user.privacy) {
            setHidePhone(d.user.privacy.hidePhoneNumber ?? true);
            setNotifyOnView(d.user.privacy.notifyOnProfileView ?? true);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          division,
          district,
          hidePhoneNumber: hidePhone,
          notifyOnProfileView: notifyOnView,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update settings");

      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
          {language === "bn" ? "প্রোফাইল ও ডোনার প্রাইভেসি শিল্ড" : "Privacy Shield & Profile Settings"}
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          {language === "bn"
            ? "আপনার ফোন নম্বরের নিরাপত্তা এবং নোটিফিকেশন অগ্রাধিকার পরিচালনা করুন।"
            : "Manage your anti-scraping privacy shield, emergency notifications, and regional coverage."}
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>
            {language === "bn"
              ? "সেটিংস সফলভাবে সংরক্ষিত হয়েছে!"
              : "Settings successfully updated and encrypted!"}
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* Donor Privacy Shield Box */}
        <div className="card-clinical p-6 border-2 border-[var(--border-subtle)] space-y-4">
          <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
            <Lock size={16} />
            <span>{language === "bn" ? "ডোনার প্রাইভেসি শিল্ড সেটিংস" : "Donor Privacy Shield (Anti-Harassment)"}</span>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] cursor-pointer">
              <div>
                <span className="text-xs font-bold text-[var(--text-primary)] block">
                  {language === "bn" ? "ফোন নম্বর পাবলিক স্ক্র্যাপার থেকে গোপন রাখুন" : "Mask Phone Number from Public Visitors"}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] block">
                  {language === "bn"
                    ? "শুধুমাত্র যাচাইকৃত রোগী প্রতি ঘন্টায় সর্বোচ্চ ৩ বার কন্টাক্ট রিকোয়েস্ট করতে পারবে।"
                    : "Only verified requesters under strict rate-limits (3/hr) can reveal your telephone link."}
                </span>
              </div>
              <input
                type="checkbox"
                checked={hidePhone}
                onChange={(e) => setHidePhone(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] cursor-pointer">
              <div>
                <span className="text-xs font-bold text-[var(--text-primary)] block">
                  {language === "bn" ? "প্রোফাইল বা কন্টাক্ট কেউ আনলক করলে নোটিফিকেশন দিন" : "Notify Me Whenever My Contact Is Revealed"}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] block">
                  {language === "bn"
                    ? "কোন রোগী আপনার নম্বর দেখেছেন তা জানতে সাথে সাথে পুশ নোটিফিকেশন পান।"
                    : "Receive instant push notification with requester details when contact is accessed."}
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifyOnView}
                onChange={(e) => setNotifyOnView(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
            </label>
          </div>
        </div>

        {/* Location Update Box */}
        <div className="card-clinical p-6 border border-[var(--border-subtle)] space-y-4">
          <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-sm">
            <MapPin size={16} className="text-red-500" />
            <span>{language === "bn" ? "জরুরী রক্তদান এলাকা ও অবস্থান" : "Regional Dispatch Location"}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs font-bold">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-emergency !py-2.5 !px-6 text-xs font-bold disabled:opacity-50"
        >
          {loading
            ? language === "bn"
              ? "সংরক্ষণ হচ্ছে..."
              : "Saving..."
            : language === "bn"
            ? "পরিবর্তনগুলো সংরক্ষণ করুন"
            : "Save Preferences"}
        </button>
      </form>
    </div>
  );
}
