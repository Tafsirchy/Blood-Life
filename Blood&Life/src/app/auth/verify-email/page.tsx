"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { CheckCircle2, AlertCircle, Mail, ArrowRight, RefreshCw } from "lucide-react";

function VerifyEmailContent() {
  const { language } = useLanguage();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"verifying" | "success" | "error" | "idle">(
    token && email ? "verifying" : "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [resendEmail, setResendEmail] = useState<string>(email || "");
  const [resending, setResending] = useState<boolean>(false);
  const [resendMessage, setResendMessage] = useState<string>("");

  useEffect(() => {
    if (!token || !email) {
      setStatus("idle");
      return;
    }

    const performVerification = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email }),
        });

        const data = await res.json();
        if (res.ok) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage(
            data.error ||
              (language === "bn"
                ? "ভেরিফিকেশন লিঙ্কটির মেয়াদ শেষ অথবা এটি পূর্বে ব্যবহৃত হয়েছে।"
                : "Invalid, expired, or previously used verification link.")
          );
        }
      } catch {
        setStatus("error");
        setErrorMessage(
          language === "bn"
            ? "সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।"
            : "Connection error. Please try again later."
        );
      }
    };

    performVerification();
  }, [token, email, language]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResending(true);
    setResendMessage("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendMessage(
          language === "bn"
            ? "যদি এই ইমেইলে অনির্ধারিত অ্যাকাউন্ট থাকে, তবে নতুন লিঙ্ক পাঠানো হয়েছে।"
            : "If an unverified account exists, a new verification link has been dispatched."
        );
      } else {
        setResendMessage(data.error || "Failed to resend");
      }
    } catch {
      setResendMessage("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full card-clinical p-8 border-2 border-[var(--border-subtle)] shadow-xl text-center space-y-6">
        {/* Brand droplet */}
        <div className="w-14 h-14 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-600 flex items-center justify-center mx-auto shadow-inner">
          <Mail size={28} />
        </div>

        {/* Verifying State */}
        {status === "verifying" && (
          <div className="space-y-4">
            <div className="w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-xl font-black text-[var(--text-primary)]">
              {language === "bn" ? "ইমেইল ভেরিফাই করা হচ্ছে..." : "Verifying Your Email..."}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              {language === "bn"
                ? "অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন, নিরাপত্তা টোকেন যাচাই করা হচ্ছে।"
                : "Validating your cryptographic security token with the database."}
            </p>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="space-y-5">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-[var(--text-primary)]">
                {language === "bn" ? "ইমেইল সফলভাবে ভেরিফাইড!" : "Email Successfully Verified!"}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                {language === "bn"
                  ? "আপনার BLOOD&LIFE অ্যাকাউন্ট সক্রিয় করা হয়েছে। এখন আপনি জরুরি রক্তের আবেদন ও রক্তদানে অংশ নিতে পারবেন।"
                  : "Your account is now fully activated on the national emergency network."}
              </p>
            </div>

            <Link
              href="/dashboard"
              className="w-full btn-emergency !py-3 text-xs font-bold inline-flex items-center justify-center gap-2"
            >
              <span>{language === "bn" ? "ড্যাশবোর্ডে প্রবেশ করুন" : "Proceed to Dashboard"}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="space-y-5">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-[var(--text-primary)]">
                {language === "bn" ? "ভেরিফিকেশন ব্যর্থ হয়েছে" : "Verification Failed"}
              </h2>
              <p className="text-xs text-red-500 mt-1.5">{errorMessage}</p>
            </div>

            <div className="border-t border-[var(--border-subtle)] pt-4 text-left space-y-3">
              <h3 className="text-xs font-bold text-[var(--text-primary)]">
                {language === "bn" ? "নতুন ভেরিফিকেশন লিঙ্ক চান?" : "Need a new link?"}
              </h3>
              <form onSubmit={handleResend} className="space-y-2.5">
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  disabled={resending}
                  className="w-full py-2.5 rounded-xl bg-[var(--surface-card)] hover:bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw size={13} className={resending ? "animate-spin" : ""} />
                  <span>
                    {resending
                      ? language === "bn"
                        ? "পাঠানো হচ্ছে..."
                        : "Sending..."
                      : language === "bn"
                      ? "পুনরায় লিঙ্ক পাঠান"
                      : "Resend Verification Link"}
                  </span>
                </button>
              </form>
              {resendMessage && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium text-center">
                  {resendMessage}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Idle State (No parameters in URL) */}
        {status === "idle" && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[var(--text-primary)]">
              {language === "bn" ? "ইমেইল ভেরিফিকেশন" : "Email Verification"}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              {language === "bn"
                ? "আপনার ইমেইলে পাঠানো লিঙ্কে ক্লিক করুন অথবা নিচে ইমেইল দিয়ে নতুন লিঙ্ক পান।"
                : "Please click the link sent to your inbox, or request a new verification email below."}
            </p>

            <form onSubmit={handleResend} className="space-y-3 text-left">
              <div>
                <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">
                  {language === "bn" ? "ইমেইল অ্যাড্রেস" : "Email Address"}
                </label>
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={resending}
                className="w-full btn-emergency !py-2.5 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={14} className={resending ? "animate-spin" : ""} />
                <span>
                  {resending
                    ? language === "bn"
                      ? "পাঠানো হচ্ছে..."
                      : "Sending..."
                    : language === "bn"
                    ? "ভেরিফিকেশন লিঙ্ক পাঠান"
                    : "Send Verification Link"}
                </span>
              </button>
            </form>

            {resendMessage && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {resendMessage}
              </p>
            )}
          </div>
        )}

        <div className="border-t border-[var(--border-subtle)] pt-4">
          <Link
            href="/auth/login"
            className="text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors"
          >
            {language === "bn" ? "← লগইন পেজে ফিরে যান" : "← Back to Sign In"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
