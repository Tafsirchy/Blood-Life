"use client";

import React from "react";
import { WifiOff, PhoneCall, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function OfflineFallbackPage() {
  return (
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-6">
        <WifiOff size={32} />
      </div>

      <span className="text-[11px] font-black uppercase tracking-widest text-red-500 mb-1">
        OFFLINE EMERGENCY MODE • অফলাইন মোড
      </span>
      <h1 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">
        ইন্টারনেট সংযোগ বিচ্ছিন্ন রয়েছে
      </h1>
      <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
        হাসপাতাল বা বেইজমেন্টে নেটওয়ার্ক না থাকলেও আপনি জরুরী পরিস্থিতিতে সরাসরি আমাদের হটলাইনে ফোন করতে পারেন।
      </p>

      {/* Offline Emergency Hotlines */}
      <div className="w-full max-w-sm p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 mb-6 text-left">
        <div className="text-xs font-bold text-slate-300">
          জরুরী পরিস্থিতিতে ডায়াল করুন:
        </div>
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-red-600/20 border border-red-500/30">
          <div>
            <div className="text-xs font-bold text-white">জাতীয় জরুরী সেবা</div>
            <div className="text-[11px] text-red-300 font-mono">999 (ফ্রি)</div>
          </div>
          <a
            href="tel:999"
            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold flex items-center gap-1"
          >
            <PhoneCall size={12} /> কল দিন
          </a>
        </div>
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10">
          <div>
            <div className="text-xs font-bold text-white">BLOOD&LIFE হেল্পলাইন</div>
            <div className="text-[11px] text-slate-400 font-mono">+880 1800-BLOOD</div>
          </div>
          <a
            href="tel:+880180025663"
            className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-bold flex items-center gap-1 hover:bg-white/20"
          >
            <PhoneCall size={12} /> কল দিন
          </a>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 transition-colors"
        >
          <RefreshCw size={14} />
          <span>পুনরায় চেষ্টা করুন (Retry)</span>
        </button>
        <Link
          href="/"
          className="px-4 py-2 rounded-xl border border-white/20 text-slate-300 hover:text-white text-xs font-bold transition-colors"
        >
          হোমে ফিরে যান
        </Link>
      </div>
    </div>
  );
}
