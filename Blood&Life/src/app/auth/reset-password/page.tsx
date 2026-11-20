"use client";

import React, { useState, Suspense } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { BloodLagbeLogo } from "@/components/brand/BloodLagbeLogo";
import { Lock, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const { language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token || !email) {
      setError(
        language === "bn"
          ? "অবৈধ রিসেট লিংক। দয়া করে আবার নতুন লিংক চেয়ে আবেদন করুন।"
          : "Invalid reset parameters. Please request a new recovery link."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        language === "bn"
          ? "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।"
          : "Password must be at least 8 characters long."
      );
      return;
    }

    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError(
        language === "bn"
          ? "পাসওয়ার্ডে অন্তত একটি অক্ষর ও একটি সংখ্যা থাকতে হবে।"
          : "Password must contain both letters and numbers."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        language === "bn"
          ? "পাসওয়ার্ড দুটি মেলেনি।"
          : "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 3500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-clinical p-6 border-2 border-[var(--border-subtle)] space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
          {error}
        </div>
      )}

      {success ? (
        <div className="space-y-4 text-center py-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {language === "bn" ? "পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!" : "Password Reset Successfully!"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {language === "bn"
                ? "আপনার সমস্ত পূর্ববর্তী সেশন বন্ধ করা হয়েছে। আপনাকে কয়েক সেকেন্ডের মধ্যে লগইন পেজে নিয়ে যাওয়া হচ্ছে..."
                : "All prior sessions have been securely invalidated. Redirecting you to the sign-in page..."}
            </p>
          </div>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center gap-2 text-xs font-bold text-red-500 hover:text-red-400 pt-2"
          >
            <span>{language === "bn" ? "এখনই লগইন করুন" : "Sign In Now"}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
              {language === "bn" ? "নতুন পাসওয়ার্ড" : "New Password"}
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-[var(--text-muted)]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-medium outline-none focus:border-red-500"
              />
            </div>
            <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
              {language === "bn"
                ? "কমপক্ষে ৮ অক্ষর (অক্ষর ও সংখ্যা সংমিশ্রণ)"
                : "Minimum 8 characters with letters & numbers"}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
              {language === "bn" ? "পাসওয়ার্ড নিশ্চিত করুন" : "Confirm New Password"}
            </label>
            <div className="relative">
              <ShieldCheck size={16} className="absolute left-3 top-3 text-[var(--text-muted)]" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-medium outline-none focus:border-red-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-emergency !py-2.5 text-xs font-bold flex items-center justify-center gap-2"
          >
            <Lock size={14} />
            <span>
              {loading
                ? language === "bn"
                  ? "আপডেট হচ্ছে..."
                  : "Updating password..."
                : language === "bn"
                ? "পাসওয়ার্ড পরিবর্তন সম্পন্ন করুন"
                : "Set New Password"}
            </span>
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BloodLagbeLogo size="lg" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
            {language === "bn" ? "নতুন পাসওয়ার্ড নির্ধারণ" : "Create New Password"}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            {language === "bn"
              ? "একটি শক্তিশালী এবং নিরাপদ পাসওয়ার্ড নির্বাচন করুন।"
              : "Choose a strong, unique password to protect your account."}
          </p>
        </div>

        <Suspense
          fallback={
            <div className="card-clinical p-8 text-center text-xs text-[var(--text-muted)]">
              Loading recovery details...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
