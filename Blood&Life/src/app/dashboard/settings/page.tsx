"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { DIVISIONS, DISTRICTS } from "@/lib/geo/bangladeshData";
import { Lock, MapPin, CheckCircle2, User as UserIcon, KeyRound, Trash2, AlertTriangle, BellRing } from "lucide-react";
import {
  isPushSupported,
  getCurrentPushSubscription,
  subscribeToBrowserPush,
  unsubscribeFromBrowserPush,
} from "@/lib/notifications/pushClient";

export default function DashboardSettingsPage() {
  const { language } = useLanguage();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [hidePhone, setHidePhone] = useState(true);
  const [notifyOnView, setNotifyOnView] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [division, setDivision] = useState("Dhaka");
  const [district, setDistrict] = useState("Dhaka");
  const [upazila, setUpazila] = useState("");
  const [address, setAddress] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  // Delete Account State
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Browser Web Push State
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);

  React.useEffect(() => {
    setPushSupported(isPushSupported());
    getCurrentPushSubscription().then((sub) => setPushSubscribed(Boolean(sub)));
  }, []);

  const handleToggleBrowserPush = async () => {
    setPushBusy(true);
    setError(null);
    try {
      if (pushSubscribed) {
        await unsubscribeFromBrowserPush();
        setPushSubscribed(false);
      } else {
        const res = await subscribeToBrowserPush();
        if (res.success) {
          setPushSubscribed(true);
        } else if (res.error) {
          setError(res.error);
        }
      }
    } finally {
      setPushBusy(false);
    }
  };

  React.useEffect(() => {
    fetch("/api/users/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          if (d.user.name) setName(d.user.name);
          if (d.user.phone) setPhone(d.user.phone);
          if (d.user.division) setDivision(d.user.division);
          if (d.user.district) setDistrict(d.user.district);
          if (d.user.upazila) setUpazila(d.user.upazila);
          if (d.user.address) setAddress(d.user.address);
          setEmailNotifications(d.user.emailNotifications ?? true);
          if (d.user.privacy) {
            setHidePhone(d.user.privacy.hidePhoneNumber ?? true);
            setNotifyOnView(d.user.privacy.notifyOnProfileView ?? true);
          }
        }
      })
      .catch(() => {});
  }, []);

  const currentDistricts = DISTRICTS.filter(
    (d) => d.division.toLowerCase() === division.toLowerCase()
  );
  const selectedDistObj = DISTRICTS.find(
    (d) => d.nameEn.toLowerCase() === district.toLowerCase()
  );
  const availableUpazilas = selectedDistObj?.upazilas || [];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          phone: phone.trim() || undefined,
          division,
          district,
          upazila: upazila || undefined,
          address,
          hidePhoneNumber: hidePhone,
          notifyOnProfileView: notifyOnView,
          emailNotifications,
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdLoading(true);
    setPwdMsg(null);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      setPwdMsg({ type: "ok", text: data.message || "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setPwdMsg({ type: "err", text: err.message });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/users/profile", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete account");
      window.location.href = "/";
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
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
            ? "আপনার প্রোফাইল তথ্য, ফোন নম্বরের নিরাপত্তা এবং নোটিফিকেশন অগ্রাধিকার পরিচালনা করুন।"
            : "Manage your personal details, anti-scraping privacy shield, password, and regional coverage."}
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
        {/* Basic Personal Details */}
        <div className="card-clinical p-6 border border-[var(--border-subtle)] space-y-4">
          <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-sm">
            <UserIcon size={16} className="text-red-500" />
            <span>{language === "bn" ? "ব্যক্তিগত ও যোগাযোগের তথ্য" : "Personal & Contact Details"}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                {language === "bn" ? "পুরো নাম" : "Full Name"}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-bold outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                {language === "bn" ? "ফোন নম্বর" : "Phone Number"}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-mono font-bold outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

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
                    ? "কোন রোগী আপনার নম্বর দেখেছেন তা জানতে সাথে সাথে নোটিফিকেশন পান।"
                    : "Receive instant notification with requester details when contact is accessed."}
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifyOnView}
                onChange={(e) => setNotifyOnView(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] cursor-pointer">
              <div>
                <span className="text-xs font-bold text-[var(--text-primary)] block">
                  {language === "bn" ? "জরুরি ইমেইল অ্যালার্ট সক্রিয় রাখুন" : "Enable Emergency Email Alerts"}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] block">
                  {language === "bn"
                    ? "আপনার এলাকায় জরুরি রক্তের প্রয়োজন হলে ইমেইলে সতর্কবার্তা পান।"
                    : "Receive emergency blood match notifications in your inbox."}
                </span>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
            </label>

            {pushSupported && (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)]">
                <div>
                  <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <BellRing size={13} className="text-red-500" />
                    <span>{language === "bn" ? "ব্রাউজার লাইভ পুশ নোটিফিকেশন" : "Browser Live Push Alerts"}</span>
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] block">
                    {language === "bn"
                      ? "অ্যাপ বন্ধ থাকলেও আপনার জেলায় রক্তের আবেদন আসলে তাৎক্ষণিক পপ-আপ পান।"
                      : "Receive instant device push notifications for urgent matched blood requests even when the tab is closed."}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={pushBusy}
                  onClick={handleToggleBrowserPush}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors shrink-0 ${
                    pushSubscribed
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-600 hover:bg-red-700 border-red-600 text-white"
                  }`}
                >
                  {pushBusy
                    ? "..."
                    : pushSubscribed
                    ? language === "bn" ? "সক্রিয় আছে (বন্ধ করুন)" : "Enabled (Turn Off)"
                    : language === "bn" ? "চালু করুন" : "Enable Push"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Location Update Box */}
        <div className="card-clinical p-6 border border-[var(--border-subtle)] space-y-4">
          <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-sm">
            <MapPin size={16} className="text-red-500" />
            <span>{language === "bn" ? "জরুরী রক্তদান এলাকা ও অবস্থান" : "Regional Dispatch Location"}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                {language === "bn" ? "বিভাগ" : "Division"}
              </label>
              <select
                value={division}
                onChange={(e) => {
                  const nextDiv = e.target.value;
                  setDivision(nextDiv);
                  const first = DISTRICTS.find((d) => d.division.toLowerCase() === nextDiv.toLowerCase());
                  if (first) {
                    setDistrict(first.nameEn);
                    setUpazila(first.upazilas[0] || "");
                  }
                }}
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
                onChange={(e) => {
                  const nextDist = e.target.value;
                  setDistrict(nextDist);
                  const obj = DISTRICTS.find((d) => d.nameEn.toLowerCase() === nextDist.toLowerCase());
                  setUpazila(obj?.upazilas[0] || "");
                }}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-bold outline-none"
              >
                {(currentDistricts.length > 0 ? currentDistricts : DISTRICTS).map((d) => (
                  <option key={d.id} value={d.nameEn}>
                    {language === "bn" ? d.nameBn : d.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                {language === "bn" ? "উপজেলা / থানা" : "Upazila / Thana"}
              </label>
              {availableUpazilas.length > 0 ? (
                <select
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-bold outline-none"
                >
                  {availableUpazilas.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-bold outline-none"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
              {language === "bn" ? "বিস্তারিত ঠিকানা (ঐচ্ছিক)" : "Street / Area Address (Optional)"}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={language === "bn" ? "যেমন: ধানমন্ডি-৩২, ঢাকা" : "e.g. Road 32, Dhanmondi"}
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs outline-none focus:border-red-500"
            />
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

      {/* Change Password Card */}
      <form onSubmit={handleChangePassword} className="card-clinical p-6 border border-[var(--border-subtle)] space-y-4">
        <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-sm">
          <KeyRound size={16} className="text-blue-500" />
          <span>{language === "bn" ? "পাসওয়ার্ড পরিবর্তন করুন" : "Change Account Password"}</span>
        </div>

        {pwdMsg && (
          <div
            className={`p-3 rounded-xl text-xs font-bold border ${
              pwdMsg.type === "ok"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                : "bg-red-500/10 border-red-500/30 text-red-500"
            }`}
          >
            {pwdMsg.text}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
              {language === "bn" ? "বর্তমান পাসওয়ার্ড" : "Current Password"}
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
              {language === "bn" ? "নতুন পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)" : "New Password (min 8 chars)"}
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={pwdLoading}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50"
        >
          {pwdLoading
            ? language === "bn" ? "আপডেট হচ্ছে..." : "Updating..."
            : language === "bn" ? "পাসওয়ার্ড আপডেট করুন" : "Update Password"}
        </button>
      </form>

      {/* Danger Zone: Delete Account */}
      <div className="card-clinical p-6 border-2 border-red-500/30 bg-red-500/[0.03] space-y-3">
        <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
          <AlertTriangle size={16} />
          <span>{language === "bn" ? "অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলুন" : "Danger Zone: Delete Account"}</span>
        </div>
        <p className="text-xs text-[var(--text-secondary)]">
          {language === "bn"
            ? "অ্যাকাউন্ট ডিলিট করলে আপনার প্রোফাইল স্থায়ীভাবে মুছে যাবে এবং ডিরেক্টরি থেকে অপসারিত হবে।"
            : "Deleting your account permanently removes your profile from the donor network and signs you out."}
        </p>

        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 rounded-xl border border-red-500/40 text-red-500 hover:bg-red-500/10 text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Trash2 size={13} />
            <span>{language === "bn" ? "অ্যাকাউন্ট ডিলিট করুন" : "Delete My Account"}</span>
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-red-500/30 space-y-3">
            {deleteError && <p className="text-xs font-bold text-red-500">{deleteError}</p>}
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder={language === "bn" ? "নিশ্চিত করতে আপনার পাসওয়ার্ড লিখুন" : "Enter current password to confirm"}
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs outline-none focus:border-red-500"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold disabled:opacity-50"
              >
                {deleteLoading
                  ? language === "bn" ? "ডিলিট হচ্ছে..." : "Deleting..."
                  : language === "bn" ? "স্থায়ীভাবে ডিলিট নিশ্চিত করুন" : "Confirm Permanent Delete"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteError(null);
                }}
                className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-secondary)]"
              >
                {language === "bn" ? "বাতিল" : "Cancel"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
