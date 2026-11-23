"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import {
  CheckCircle2,
  AlertCircle,
  Mail,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Edit2,
  KeyRound,
} from "lucide-react";

function VerifyEmailContent() {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialCode = searchParams.get("code") || searchParams.get("token") || "";
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState<string>(initialEmail);
  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(!initialEmail);
  const [digits, setDigits] = useState<string[]>(() => {
    if (initialCode && initialCode.length === 6 && /^\d+$/.test(initialCode)) {
      return initialCode.split("");
    }
    return ["", "", "", "", "", ""];
  });

  const [status, setStatus] = useState<"verifying" | "success" | "error" | "idle">(
    initialCode && initialEmail ? "verifying" : "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [resending, setResending] = useState<boolean>(false);
  const [resendMessage, setResendMessage] = useState<string>("");
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Execute verification call
  const executeVerification = async (codeToVerify: string, targetEmail: string) => {
    if (!targetEmail || !codeToVerify || codeToVerify.length < 6) return;

    setStatus("verifying");
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeToVerify, email: targetEmail }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(
          data.error ||
            (language === "bn"
              ? "ভেরিফিকেশন কোডটি সঠিক নয় অথবা এর মেয়াদ শেষ হয়ে গেছে।"
              : "Invalid, expired, or previously used verification code.")
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

  // Auto-verify on load if 6-digit code and email are present in query params
  useEffect(() => {
    if (initialCode && initialEmail) {
      executeVerification(initialCode, initialEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode, initialEmail]);

  // Handle single digit input
  const handleDigitChange = (index: number, val: string) => {
    const numeric = val.replace(/\D/g, "");

    // Multi-digit paste into single field
    if (numeric.length > 1) {
      handlePastedCode(numeric, index);
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = numeric.slice(-1);
    setDigits(newDigits);

    // Auto-advance focus to next box
    if (numeric && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit when all 6 digits filled
    const fullCode = newDigits.join("");
    if (fullCode.length === 6 && email) {
      executeVerification(fullCode, email);
    }
  };

  // Handle keyboard events (Backspace, Arrow keys)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle pasting full 6-digit code
  const handlePastedCode = (pastedText: string, startIndex = 0) => {
    const cleanNumbers = pastedText.replace(/\D/g, "").slice(0, 6);
    if (!cleanNumbers) return;

    const newDigits = [...digits];
    for (let i = 0; i < cleanNumbers.length && startIndex + i < 6; i++) {
      newDigits[startIndex + i] = cleanNumbers[i];
    }
    setDigits(newDigits);

    const nextIndex = Math.min(startIndex + cleanNumbers.length, 5);
    inputRefs.current[nextIndex]?.focus();

    const fullCode = newDigits.join("");
    if (fullCode.length === 6 && email) {
      executeVerification(fullCode, email);
    }
  };

  const handlePasteEvent = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    handlePastedCode(pasted, 0);
  };

  // Submit button
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) {
      setErrorMessage(
        language === "bn"
          ? "অনুগ্রহ করে পূর্ণ ৬-সংখ্যার কোডটি প্রবেশ করান।"
          : "Please enter all 6 digits of the verification code."
      );
      setStatus("error");
      return;
    }
    if (!email) {
      setErrorMessage(
        language === "bn"
          ? "অনুগ্রহ করে আপনার ইমেইল এড্রেস প্রবেশ করান।"
          : "Please enter your email address."
      );
      setStatus("error");
      return;
    }
    executeVerification(code, email);
  };

  // Resend OTP code
  const handleResend = async () => {
    if (!email) {
      setIsEditingEmail(true);
      return;
    }
    if (resendCooldown > 0 || resending) return;

    setResending(true);
    setResendMessage("");
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendCooldown(60);
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        setResendMessage(
          language === "bn"
            ? "নতুন ৬-সংখ্যার ভেরিফিকেশন কোড আপনার ইমেইলে পাঠানো হয়েছে।"
            : "A new 6-digit verification code has been dispatched to your email."
        );
        if (status === "error") setStatus("idle");
      } else {
        setErrorMessage(data.error || "Failed to resend verification code");
      }
    } catch {
      setErrorMessage(
        language === "bn"
          ? "নেটওয়ার্ক সমস্যা। কিছুক্ষণ পর আবার চেষ্টা করুন।"
          : "Network error. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full card-clinical p-6 sm:p-8 border-2 border-[var(--border-subtle)] shadow-2xl text-center space-y-6">
        
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-500/25 text-red-600 flex items-center justify-center mx-auto shadow-inner">
          {status === "success" ? (
            <ShieldCheck size={32} className="text-emerald-500" />
          ) : status === "verifying" ? (
            <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <KeyRound size={30} />
          )}
        </div>

        {/* ================= SUCCESS STATE ================= */}
        {status === "success" ? (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="w-12 h-12 bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                {language === "bn" ? "ইমেইল সফলভাবে ভেরিফাইড!" : "Email Successfully Verified!"}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                {language === "bn"
                  ? "আপনার BLOOD&LIFE অ্যাকাউন্ট সক্রিয় হয়েছে। এখন আপনি জরুরি রক্তের আবেদন ও রক্তদানে অংশ নিতে পারবেন।"
                  : "Your account is now activated. You have full access to life-saving emergency requests and donor matches."}
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard"
                className="w-full btn-emergency !py-3 text-xs font-bold inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/20"
              >
                <span>{language === "bn" ? "ড্যাশবোর্ডে প্রবেশ করুন" : "Proceed to Dashboard"}</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        ) : (
          /* ================= CODE ENTRY / VERIFY FORM ================= */
          <div className="space-y-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                {language === "bn" ? "ইমেইল ভেরিফিকেশন কোড" : "Verify Email with Code"}
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                {language === "bn"
                  ? "আপনার ইমেইলে প্রেরিত ৬-সংখ্যার কোডটি নিচে প্রদান করুন।"
                  : "Enter the 6-digit verification code sent to your registered inbox."}
              </p>
            </div>

            {/* Target Email Banner & Edit Option */}
            <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate text-left">
                <Mail size={15} className="text-red-500 shrink-0" />
                {isEditingEmail ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-transparent border-b border-red-500 text-xs font-semibold text-[var(--text-primary)] outline-none"
                    autoFocus
                  />
                ) : (
                  <span className="font-semibold text-[var(--text-primary)] truncate">
                    {email || (language === "bn" ? "ইমেইল প্রদান করুন" : "No email entered")}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsEditingEmail(!isEditingEmail)}
                className="text-[11px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1 shrink-0"
              >
                <Edit2 size={12} />
                <span>{isEditingEmail ? (language === "bn" ? "ঠিক আছে" : "Done") : (language === "bn" ? "পরিবর্তন" : "Change")}</span>
              </button>
            </div>

            {/* 6-Box OTP Code Input */}
            <form onSubmit={handleManualSubmit} className="space-y-5">
              <div className="flex justify-center items-center gap-2 sm:gap-2.5">
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePasteEvent}
                    className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-mono font-black rounded-xl border-2 transition-all outline-none ${
                      digit
                        ? "border-red-500 bg-red-500/5 text-red-600 dark:text-red-400 ring-2 ring-red-500/20"
                        : "border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-primary)] hover:border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    }`}
                  />
                ))}
              </div>

              {/* Error Alert */}
              {status === "error" && errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2 text-left animate-in fade-in">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Resend Success Alert */}
              {resendMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold text-left animate-in fade-in">
                  {resendMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === "verifying" || digits.join("").length !== 6 || !email}
                className="w-full btn-emergency !py-3 text-xs font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md"
              >
                {status === "verifying" ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>{language === "bn" ? "যাচাই করা হচ্ছে..." : "Verifying Code..."}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>{language === "bn" ? "কোড ভেরিফাই করুন" : "Verify Code"}</span>
                  </>
                )}
              </button>
            </form>

            {/* Resend Section */}
            <div className="border-t border-[var(--border-subtle)] pt-4 space-y-2">
              <p className="text-xs text-[var(--text-muted)]">
                {language === "bn" ? "ইমেইলে কোড পাননি?" : "Didn't receive the code in your inbox?"}
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || resendCooldown > 0}
                className="text-xs font-bold text-red-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw size={13} className={resending ? "animate-spin" : ""} />
                <span>
                  {resending
                    ? language === "bn"
                      ? "পাঠানো হচ্ছে..."
                      : "Sending..."
                    : resendCooldown > 0
                    ? language === "bn"
                      ? `পুনরায় কোড পাঠান (${resendCooldown}s)`
                      : `Resend Code (${resendCooldown}s)`
                    : language === "bn"
                    ? "নতুন কোড পাঠান"
                    : "Resend Code"}
                </span>
              </button>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                {language === "bn"
                  ? "💡 আপনার স্প্যাম বা প্রোমোশন ফোল্ডারও চেক করে দেখুন।"
                  : "💡 Also check your spam or promotions folder."}
              </p>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="border-t border-[var(--border-subtle)] pt-4">
          <Link
            href="/auth/login"
            className="text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors inline-block"
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
