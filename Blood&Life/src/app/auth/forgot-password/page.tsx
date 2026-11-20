"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { BloodLagbeLogo } from "@/components/brand/BloodLagbeLogo";
import { Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      setSubmitted(true);
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
            {language === "bn" ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot Your Password?"}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            {language === "bn"
              ? "আপনার অ্যাকাউন্টের নিবন্ধিত ইমেইল দিন। আমরা পাসওয়ার্ড রিসেট লিঙ্ক পাঠিয়ে দেব।"
              : "Enter your registered email address to receive a secure recovery link."}
          </p>
        </div>

        <div className="card-clinical p-6 border-2 border-[var(--border-subtle)] space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
              {error}
            </div>
          )}

          {submitted ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {language === "bn" ? "রিসেট লিংক পাঠানো হয়েছে!" : "Check Your Inbox"}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {language === "bn"
                    ? `যদি এই ইমেইল (${email}) দিয়ে অ্যাকাউন্ট খোলা থাকে, তবে ৩০ মিনিটের জন্য একটি রিসেট লিংক পাঠানো হয়েছে।`
                    : `If an account exists for ${email}, a password reset link has been dispatched. The link is valid for 30 minutes.`}
                </p>
              </div>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 text-xs font-bold text-red-500 hover:text-red-400 pt-2"
              >
                <ArrowLeft size={14} />
                <span>{language === "bn" ? "লগইন পেজে ফিরে যান" : "Return to Sign In"}</span>
              </Link>
            </div>
          ) : (
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

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-emergency !py-2.5 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Send size={14} />
                <span>
                  {loading
                    ? language === "bn"
                      ? "প্রসেস হচ্ছে..."
                      : "Sending link..."
                    : language === "bn"
                    ? "রিসেট লিংক পাঠান"
                    : "Send Reset Link"}
                </span>
              </button>

              <div className="text-center pt-2 border-t border-[var(--border-subtle)]">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-red-500"
                >
                  <ArrowLeft size={13} />
                  <span>{language === "bn" ? "লগইনে ফিরে যান" : "Back to Sign In"}</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
