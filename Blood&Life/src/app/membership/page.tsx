"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { EmergencyFooter } from "@/components/home/EmergencyFooter";
import { useLanguage } from "@/lib/i18n/context";
import {
  DONOR_TIERS,
  BadgeTier,
  getDonorTier,
  getNextTierProgress,
  isMembershipEligible,
  generateMembershipId,
} from "@/lib/badges";
import {
  Award,
  ShieldCheck,
  Heart,
  Sparkles,
  Download,
  Camera,
  CheckCircle2,
  Lock,
  ArrowRight,
  Printer,
  Share2,
  Eye,
  RefreshCw,
  User,
  Star,
  Building2,
  MapPin,
  Calendar,
} from "lucide-react";
import Link from "next/link";

export default function MembershipPage() {
  const { language } = useLanguage();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Avatar Studio State
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<string>("titanium");
  const [selectedSticker, setSelectedSticker] = useState<string>("15_hero");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch logged in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          if (data.user.avatarUrl) {
            setAvatarImage(data.user.avatarUrl);
          }
        }
      } catch (e) {
        console.error("Error fetching user session:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Demo user fallback if not logged in or 0 donations
  const totalDonations = currentUser?.totalDonations ?? 0;
  const eligible = isMembershipEligible(totalDonations);
  const donorTier = getDonorTier(totalDonations);
  const tierProgress = getNextTierProgress(totalDonations);
  const membershipId = generateMembershipId(currentUser?._id || "2026", currentUser?.createdAt);

  const displayUser = currentUser || {
    name: language === "bn" ? "মো: ফারহান আহমেদ" : "Md. Farhan Ahmed",
    bloodGroup: "O+",
    district: language === "bn" ? "ঢাকা" : "Dhaka",
    totalDonations: 15,
  };

  // Sticker list
  const STICKERS = [
    { id: "verified_donor", textBn: "ভেরিফাইড রক্তদাতা", textEn: "Verified Blood Donor", color: "#10B981" },
    { id: "15_hero", textBn: "১৫ বার রক্তদানকারী বীর", textEn: "15+ Life Champion", color: "#E11D48" },
    { id: "blood_life_member", textBn: "অফিসিয়াল মেম্বার", textEn: "Official Member", color: "#8B5CF6" },
    { id: "save_lives", textBn: "রক্ত দিন, জীবন বাঁচান", textEn: "Donate Blood, Save Lives", color: "#DC2626" },
    { id: "diamond_legend", textBn: "শতায়ু রক্তযোদ্ধা (২৫+)", textEn: "25+ Diamond Legend", color: "#6366F1" },
  ];

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Redraw Avatar Canvas whenever image, frame, or sticker changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 400;
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);

    // 1. Draw circular user photo or placeholder
    const drawContent = (imgSrc: CanvasImageSource | null) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, 170, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      if (imgSrc) {
        ctx.drawImage(imgSrc, 30, 30, 340, 340);
      } else {
        // Gradient fallback avatar
        const grad = ctx.createLinearGradient(0, 0, size, size);
        grad.addColorStop(0, "#1E293B");
        grad.addColorStop(1, "#0F172A");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        ctx.fillStyle = "#E2E8F0";
        ctx.font = "bold 90px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(displayUser.bloodGroup || "O+", size / 2, size / 2);
      }
      ctx.restore();

      // 2. Draw outer decorative frame ring
      const frameTier = DONOR_TIERS.find((t) => t.id === selectedFrame) || DONOR_TIERS[4];
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, 175, 0, Math.PI * 2);
      ctx.lineWidth = 14;
      ctx.strokeStyle = frameTier.colorHex;
      ctx.stroke();

      // Inner thin white accent ring
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, 168, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.stroke();
      ctx.restore();

      // 3. Draw Bottom Curved Ribbon / Sticker Banner
      const stickerObj = STICKERS.find((s) => s.id === selectedSticker) || STICKERS[0];
      const stickerText = language === "bn" ? stickerObj.textBn : stickerObj.textEn;

      ctx.save();
      // Banner Background
      ctx.fillStyle = stickerObj.color;
      ctx.beginPath();
      ctx.roundRect(50, 315, 300, 52, 26);
      ctx.fill();

      // Banner Border
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#FFFFFF";
      ctx.stroke();

      // Banner Text
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 17px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`★ ${stickerText} ★`, size / 2, 341);
      ctx.restore();

      // 4. Draw Blood&Life logo watermark at top
      ctx.save();
      ctx.fillStyle = "#DC2626";
      ctx.beginPath();
      ctx.roundRect(140, 20, 120, 26, 13);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("BLOOD&LIFE", size / 2, 33);
      ctx.restore();
    };

    if (avatarImage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = avatarImage;
      img.onload = () => drawContent(img);
      img.onerror = () => drawContent(null);
    } else {
      drawContent(null);
    }
  }, [avatarImage, selectedFrame, selectedSticker, language, displayUser.bloodGroup]);

  // Download Avatar PNG
  const handleDownloadAvatar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `bloodlife-avatar-${displayUser.name.replace(/\s+/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Top Hero Banner */}
        <section className="py-12 sm:py-16 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider mb-3">
              <Sparkles size={14} />
              <span>{language === "bn" ? "অফিসিয়াল ডিজিটাল মেম্বারশিপ ও স্বীকৃতি" : "OFFICIAL DIGITAL MEMBERSHIP & HONORS"}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
              {language === "bn"
                ? "ব্লাড অ্যান্ড লাইফ ডিজিটাল মেম্বারশিপ ও সম্মাননা"
                : "Blood&Life Digital Membership & Honors"}
            </h1>

            <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-3 max-w-2xl leading-relaxed">
              {language === "bn"
                ? "ন্যূনতম ১ বার স্বেচ্ছায় রক্তদান করলেই আপনি অর্জন করবেন আমাদের অফিসিয়াল ডিজিটাল মেম্বারশিপ কার্ড, প্রতিটি টায়ারের সম্মাননা সনদ এবং সোশ্যাল মিডিয়া স্টিকার।"
                : "Every donor who completes at least 1 voluntary blood donation unlocks their Official Digital Membership Card, tier-based appreciation certificates, and social avatar stickers."}
            </p>

            {/* Requirement Notice */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
              <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-bold inline-flex items-center gap-2">
                <Heart size={14} fill="currentColor" />
                <span>{language === "bn" ? "যোগ্যতা: ন্যূনতম ১ বার রক্তদান" : "Eligibility: Minimum 1 Blood Donation"}</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-bold inline-flex items-center gap-2">
                <Award size={14} />
                <span>{language === "bn" ? "৬টি সম্মাননা টায়ার ও সনদ" : "6 Milestone Honor Tiers"}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 space-y-16">
          {/* Section 1: The Official Membership Card Preview */}
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                <Award size={14} />
                <span>{language === "bn" ? "ডিজিটাল আইডি কার্ড" : "DIGITAL MEMBERSHIP CARD"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                {language === "bn" ? "আপনার অফিসিয়াল ব্লাড অ্যান্ড লাইফ মেম্বারশিপ কার্ড" : "Your Official Blood&Life Membership Card"}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                {language === "bn"
                  ? "হাসপাতালে রক্তদান বা জরুরি প্রয়োজনে প্রদর্শনযোগ্য ডিজিটাল প্রমাণপত্র।"
                  : "A verifiable digital identity credential recognizing your humanitarian contribution across Bangladesh."}
              </p>
            </div>

            {/* The Membership Card Asset */}
            <div className="max-w-md mx-auto">
              <div className="relative rounded-3xl p-6 sm:p-8 bg-linear-to-br from-zinc-900 via-neutral-900 to-black text-white shadow-2xl border-2 border-amber-500/40 overflow-hidden group hover:scale-102 transition-all duration-300">
                {/* Holographic Background Pattern */}
                <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-red-600/20 blur-3xl pointer-events-none" />
                <div className="absolute -left-16 -top-16 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center font-black text-white shadow-md">
                      B
                    </div>
                    <div>
                      <span className="font-black text-sm tracking-wider block">BLOOD&LIFE</span>
                      <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">
                        OFFICIAL MEMBER
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                    <Sparkles size={11} />
                    <span>{donorTier?.nameEn || "15+ Life Champion"}</span>
                  </span>
                </div>

                {/* Card Body */}
                <div className="py-6 flex items-center gap-4 relative z-10">
                  {/* Photo / Avatar */}
                  <div className="w-20 h-20 rounded-2xl bg-zinc-800 border-2 border-amber-400/60 overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
                    {avatarImage ? (
                      <img src={avatarImage} alt="Member Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-red-500">{displayUser.bloodGroup}</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white tracking-tight leading-snug">
                      {displayUser.name}
                    </h3>
                    <p className="text-xs text-zinc-300 flex items-center gap-2 font-medium">
                      <span>{language === "bn" ? "ব্লাড গ্রুপ:" : "Group:"} <strong className="text-red-400 font-black">{displayUser.bloodGroup}</strong></span>
                      <span>•</span>
                      <span>{displayUser.district}</span>
                    </p>
                    <div className="pt-1 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 size={10} />
                        <span>{language === "bn" ? "ভেরিফাইড ডোনার" : "Verified Donor"}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Membership ID & Security QR */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs relative z-10">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-400 block font-bold">
                      MEMBERSHIP ID
                    </span>
                    <span className="font-mono text-xs font-black tracking-wider text-amber-400">
                      {membershipId}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider text-zinc-400 block font-bold">
                      ISSUED YEAR
                    </span>
                    <span className="font-mono text-xs font-bold text-zinc-200">
                      2026 • LIFETIME
                    </span>
                  </div>
                </div>

                {/* Not eligible lock banner if 0 donations */}
                {!eligible && (
                  <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
                    <Lock size={32} className="text-amber-500" />
                    <h4 className="text-sm font-black text-white">
                      {language === "bn" ? "মেম্বারশিপ কার্ড আনলক করতে ১ বার রক্তদান করুন" : "Donate 1 Time to Unlock Your Card"}
                    </h4>
                    <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                      {language === "bn"
                        ? "স্বেচ্ছায় রক্তদানের পর হাসপাতাল বা গ্রহীতা কর্তৃক ভেরিফাই হলে তাৎক্ষণিকভাবে আপনার আইডি কার্ড সক্রিয় হবে।"
                        : "Your official ID activates automatically following your first verified voluntary blood donation."}
                    </p>
                    <Link
                      href="/search"
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                    >
                      {language === "bn" ? "রক্তদানের আবেদন দেখুন" : "Find Donation Requests"}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Interactive Avatar & Social Sticker Studio */}
          <div className="bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                <Camera size={14} />
                <span>{language === "bn" ? "সোশ্যাল মিডিয়া অ্যাভাটার স্টুডিও" : "SOCIAL MEDIA AVATAR STUDIO"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                {language === "bn"
                  ? "আপনার ছবির সাথে রক্তদাতা সম্মাননা ফ্রেম ও স্টিকার যুক্ত করুন"
                  : "Design Your Verified Blood Donor Social Avatar"}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                {language === "bn"
                  ? "ফেসবুক, হোয়াটসঅ্যাপ বা লিংকডইন প্রোফাইলে ব্যবহার করার জন্য নিজের ছবিতে বিশেষ ব্লাড&লাইফ ফ্রেম ও স্টিকার বসিয়ে ডাউনলোড করুন।"
                  : "Customize your profile picture with official donor milestone rings, honor badges, and downloadable high-res frames."}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Live Canvas Preview */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-4">
                <div className="relative p-2 rounded-3xl bg-linear-to-b from-amber-500/10 via-[var(--bg-main)] to-[var(--bg-main)] border-2 border-[var(--border-subtle)] shadow-xl">
                  <canvas
                    ref={canvasRef}
                    className="w-64 h-64 sm:w-80 sm:h-80 rounded-2xl bg-zinc-900 shadow-inner"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <label className="px-4 py-2 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] cursor-pointer inline-flex items-center gap-1.5 shadow-xs transition-colors">
                    <Camera size={14} className="text-blue-500" />
                    <span>{language === "bn" ? "নিজের ছবি আপলোড করুন" : "Upload Your Photo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleDownloadAvatar}
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md hover:scale-102 transition-all"
                  >
                    <Download size={14} />
                    <span>{language === "bn" ? "অ্যাভাটার ডাউনলোড করুন (PNG)" : "Download Avatar (PNG)"}</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Customization Controls */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Select Milestone Tier Frame */}
                <div className="space-y-3">
                  <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider">
                    {language === "bn" ? "১. রক্তদান মাইলস্টোন ফ্রেম নির্বাচন করুন:" : "1. Select Milestone Tier Ring:"}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {DONOR_TIERS.map((tier) => {
                      const isSelected = selectedFrame === tier.id;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => setSelectedFrame(tier.id)}
                          className={`p-3 rounded-2xl border text-left transition-all relative ${
                            isSelected
                              ? "border-red-500 bg-red-500/10 shadow-sm ring-2 ring-red-500/30"
                              : "border-[var(--border-subtle)] bg-[var(--bg-main)] hover:border-red-500/40"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: tier.colorHex }}
                            />
                            <span className="text-xs font-black text-[var(--text-primary)] truncate">
                              {tier.id.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-[var(--text-secondary)] truncate">
                            {tier.minDonations} {language === "bn" ? "বার রক্তদান" : "Donations"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Select Sticker Badge */}
                <div className="space-y-3">
                  <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider">
                    {language === "bn" ? "২. সোশ্যাল স্টিকার স্লোগান নির্বাচন করুন:" : "2. Select Badge Sticker Slogan:"}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {STICKERS.map((sticker) => {
                      const isSelected = selectedSticker === sticker.id;
                      return (
                        <button
                          key={sticker.id}
                          type="button"
                          onClick={() => setSelectedSticker(sticker.id)}
                          className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 ${
                            isSelected
                              ? "border-red-500 bg-red-500/10 shadow-sm ring-2 ring-red-500/30"
                              : "border-[var(--border-subtle)] bg-[var(--bg-main)] hover:border-red-500/40"
                          }`}
                        >
                          <span className="text-xs font-bold text-[var(--text-primary)]">
                            {language === "bn" ? sticker.textBn : sticker.textEn}
                          </span>
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0"
                            style={{ backgroundColor: sticker.color }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tip box */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs leading-relaxed space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" />
                    {language === "bn" ? "সোশ্যাল মিডিয়াতে শেয়ার করুন:" : "Inspire Others on Social Media:"}
                  </span>
                  <p className="text-[11px]">
                    {language === "bn"
                      ? "আপনার রক্তদানের গর্বিত ছবি সোশ্যাল মিডিয়ায় ব্যবহার করলে আশেপাশের মানুষের মধ্যে স্বেচ্ছায় রক্তদানের অনুপ্রেরণা ছড়িয়ে পড়ে।"
                      : "Using your verified donor frame encourages your community, friends, and family to step forward as life savers."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: All 6 Tiers & Official Certificate Collection */}
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <Award size={14} />
                <span>{language === "bn" ? "সকল টায়ারের সনদপত্র ও স্বীকৃতি" : "ALL 6 MILESTONE CERTIFICATES"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                {language === "bn"
                  ? "প্রতিটি টায়ারের জন্য ডিজিটাল ও প্রিন্টযোগ্য সম্মাননা সনদ"
                  : "Dedicated Official Certificates for Every Milestone Tier"}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                {language === "bn"
                  ? "১ম রক্তদান থেকে শুরু করে সর্বোচ্চ ২৫+ রক্তদান পর্যন্ত প্রতিটি টায়ারেই রক্তদাতার অবদানকে অফিশিয়াল সনদের মাধ্যমে সম্মানিত করা হয়।"
                  : "From your very first drop to 25+ legendary transfusions, every milestone includes a certified, printable award."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {DONOR_TIERS.map((tier) => {
                const isUnlocked = totalDonations >= tier.minDonations;
                const isSpecial15 = tier.id === "titanium";
                const isSpecial25 = tier.id === "diamond";

                return (
                  <div
                    key={tier.id}
                    className={`rounded-3xl p-6 border-2 transition-all flex flex-col justify-between space-y-4 relative ${
                      isUnlocked
                        ? "bg-[var(--bg-surface)] border-red-500/40 shadow-sm"
                        : "bg-[var(--bg-surface)]/60 border-[var(--border-subtle)] opacity-75"
                    }`}
                  >
                    {isSpecial15 && (
                      <span className="absolute -top-3 right-5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                        15+ SPECIAL TIER
                      </span>
                    )}
                    {isSpecial25 && (
                      <span className="absolute -top-3 right-5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white shadow-xs">
                        25+ HIGHEST TIER
                      </span>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: tier.colorHex }}
                          />
                          <span className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
                            {tier.id} TIER
                          </span>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[var(--bg-main)] text-[var(--text-primary)] border border-[var(--border-subtle)]">
                          {tier.minDonations}+ {language === "bn" ? "বার রক্তদান" : "Donations"}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-[var(--text-primary)]">
                        {language === "bn" ? tier.nameBn : tier.nameEn}
                      </h3>

                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {language === "bn" ? tier.citationBn : tier.citationEn}
                      </p>

                      <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1.5 text-[11px]">
                        <span className="font-bold text-[var(--text-muted)] block uppercase tracking-wider">
                          {language === "bn" ? "পুরস্কার ও সুবিধা:" : "Perks & Honors:"}
                        </span>
                        {(language === "bn" ? tier.perksBn : tier.perksEn).map((perk, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-1.5 text-[var(--text-secondary)] font-medium">
                            <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                            <span>{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[var(--border-subtle)]">
                      <Link
                        href={`/verify-cert/BL-TIER-${tier.id.toUpperCase()}-2026`}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                          isUnlocked
                            ? "bg-red-600 hover:bg-red-700 text-white shadow-xs"
                            : "bg-[var(--bg-main)] hover:bg-red-500/10 text-[var(--text-primary)] border border-[var(--border-subtle)]"
                        }`}
                      >
                        <Award size={14} />
                        <span>{language === "bn" ? "সনদপত্র দেখুন ও প্রিন্ট করুন" : "View & Print Certificate"}</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <EmergencyFooter />
    </div>
  );
}
