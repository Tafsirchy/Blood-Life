"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { BloodLagbeLogo } from "@/components/brand/BloodLagbeLogo";
import { LogIn, ArrowRight, ShieldCheck, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
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
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
              {error}
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
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                {language === "bn" ? "পাসওয়ার্ড" : "Password"}
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

          <div className="pt-2 text-center border-t border-[var(--border-subtle)]">
            <span className="text-xs text-[var(--text-muted)]">
              {language === "bn" ? "অ্যাকাউন্ট নেই? " : "Don't have an account? "}
            </span>
            <Link
              href="/auth/register"
              className="text-xs font-bold text-red-500 hover:text-red-400"
            >
              {language === "bn" ? "রক্তদাতা হিসেবে নিবন্ধন করুন" : "Register as Donor"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
