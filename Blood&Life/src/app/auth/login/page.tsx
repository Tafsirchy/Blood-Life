"use client";

import React, { useState, Suspense } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { BloodLagbeLogo } from "@/components/brand/BloodLagbeLogo";
import { LogIn, ArrowRight, ShieldCheck, Mail, Lock, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const { language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNeedsVerification(false);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.requiresEmailVerification) {
          setError(
            language === "bn"
              ? "আপনার ইমেইল এখনও ভেরিফাই করা হয়নি। অনুগ্রহ করে আপনার ইনবক্স চেক করুন অথবা নিচে ক্লিক করুন:"
              : "Email not verified. Please check your inbox or click below to verify:"
          );
          setNeedsVerification(true);
          return;
        }
        throw new Error(data.error || "Login failed");
      }

      const destination = from.startsWith("/") ? from : "/dashboard";
      router.push(destination);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col items-center justify-center p-4 py-8">
      <div className="w-full max-w-md space-y-4">
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

        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BloodLagbeLogo size="lg" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
            {language === "bn" ? "অ্যাকাউন্টে প্রবেশ করুন" : "Sign In to BLOOD&LIFE"}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            {language === "bn"
              ? "জরুরী রক্তদান ও রোগী সেবা পরিচালনা করতে লগইন করুন"
              : "Access your donor health dial, case progress, or volunteer desk"}
          </p>
        </div>

        <div className="card-clinical p-6 border-2 border-[var(--border-subtle)] space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold space-y-1">
              <div>{error}</div>
              {needsVerification && (
                <Link
                  href={`/auth/verify-email?email=${encodeURIComponent(email)}`}
                  className="inline-block text-red-600 dark:text-red-400 underline font-extrabold hover:text-red-700 mt-1"
                >
                  {language === "bn" ? "ভেরিফিকেশন পেজে যান ও নতুন লিঙ্ক চান →" : "Verify Email Now →"}
                </Link>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                {language === "bn" ? "ইমেইল এড্রেস" : "Email Address"}
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-[var(--text-muted)]" />
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[var(--text-secondary)]">
                  {language === "bn" ? "পাসওয়ার্ড" : "Password"}
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-[11px] font-semibold text-red-500 hover:text-red-400"
                >
                  {language === "bn" ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot password?"}
                </Link>
              </div>
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-emergency !py-2.5 text-xs font-bold flex items-center justify-center gap-2"
            >
              <LogIn size={14} />
              <span>
                {loading
                  ? language === "bn"
                    ? "যাচাই হচ্ছে..."
                    : "Signing in..."
                  : language === "bn"
                  ? "লগইন করুন"
                  : "Sign In"}
              </span>
            </button>
          </form>

          <div className="pt-2 text-center border-t border-[var(--border-subtle)] space-y-2">
            <div>
              <span className="text-xs text-[var(--text-muted)]">
                {language === "bn" ? "অ্যাকাউন্ট নেই? " : "Don't have an account? "}
              </span>
              <Link
                href="/auth/register"
                className="text-xs font-bold text-red-500 hover:text-red-400"
              >
                {language === "bn" ? "নতুন একাউন্ট খুলুন" : "Create Account"}
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
