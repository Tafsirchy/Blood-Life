/**
 * BLOOD&LIFE Gamification Engine & Milestone Tier Architecture
 * Complete 6-Tier Recognition System with Dedicated Certifications for Every Tier
 */

export interface BadgeTier {
  id: "bronze" | "silver" | "gold" | "platinum" | "titanium" | "diamond";
  nameBn: string;
  nameEn: string;
  minDonations: number;
  colorHex: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  accentClass: string;
  certificateTitleBn: string;
  certificateTitleEn: string;
  citationBn: string;
  citationEn: string;
  perksBn: string[];
  perksEn: string[];
  avatarFrameColor: string;
  isHighestTier?: boolean;
}

export const DONOR_TIERS: BadgeTier[] = [
  {
    id: "bronze",
    nameBn: "প্রথম রক্তদূত (First-Drop Hero)",
    nameEn: "First-Drop Hero",
    minDonations: 1,
    colorHex: "#CD7F32",
    bgClass: "bg-amber-900/10",
    borderClass: "border-amber-700/30",
    textClass: "text-amber-700 dark:text-amber-400",
    accentClass: "from-amber-700 to-amber-900",
    certificateTitleBn: "জাতীয় প্রথম রক্তদান সম্মাননা সনদ",
    certificateTitleEn: "National First Blood Gift Honor Certificate",
    citationBn: "মানবতার কল্যাণে স্বেচ্ছায় প্রথমবারের মতো অমূল্য রক্তদান করে একজন মুমূর্ষু রোগীর জীবন রক্ষায় অনন্য ভূমিকা রাখার জন্য এই সনদ প্রদান করা হলো।",
    citationEn: "Awarded in deepest appreciation for selflessly giving the gift of life for the very first time, demonstrating profound humanitarian spirit.",
    perksBn: [
      "অফিসিয়াল ডিজিটাল মেম্বারশিপ কার্ড আনলক",
      "জাতীয় প্রথম রক্তদান সম্মাননা সনদ",
      "সোশ্যাল মিডিয়া ভেরিফাইড ডোনার স্টিকার",
    ],
    perksEn: [
      "Unlock Official Digital Membership Card",
      "Downloadable First Blood Gift Certificate",
      "Verified Donor Social Media Avatar Sticker",
    ],
    avatarFrameColor: "#CD7F32",
  },
  {
    id: "silver",
    nameBn: "জীবন অভিভাবক (Life Guardian)",
    nameEn: "Life Guardian",
    minDonations: 3,
    colorHex: "#C0C0C0",
    bgClass: "bg-slate-400/10",
    borderClass: "border-slate-400/30",
    textClass: "text-slate-600 dark:text-slate-300",
    accentClass: "from-slate-400 to-slate-600",
    certificateTitleBn: "জীবন অভিভাবক সম্মাননা সনদ",
    certificateTitleEn: "Life Guardian Appreciation Certificate",
    citationBn: "ধারাবাহিকভাবে ৩ বার রক্তদান সম্পন্ন করে রক্তের ঘাটতি দূরীকরণে এবং একাধিক পরিবারের মুখে হাসি ফোটাতে অভিভাবকের মতো পাশে থাকার স্বীকৃতিস্বরূপ।",
    citationEn: "Recognizing steadfast humanitarian dedication through 3 certified blood donations, preserving critical emergency patients.",
    perksBn: [
      "সিলভার গার্ডিয়ান মেডেল ও সনদ",
      "জরুরি কেসে অগ্রাধিকার নোটিফিকেশন ব্যাজ",
      "সিলভার অ্যাভাটার ফ্রেম",
    ],
    perksEn: [
      "Silver Guardian Medal & Verifiable Certificate",
      "Priority Dispatch Volunteer Badge",
      "Silver Profile Avatar Frame",
    ],
    avatarFrameColor: "#A8A29E",
  },
  {
    id: "gold",
    nameBn: "সোনালী প্রাণদূত (Gold Savior)",
    nameEn: "Gold Savior",
    minDonations: 5,
    colorHex: "#EAB308",
    bgClass: "bg-yellow-500/10",
    borderClass: "border-yellow-500/30",
    textClass: "text-yellow-600 dark:text-yellow-400",
    accentClass: "from-yellow-400 to-amber-600",
    certificateTitleBn: "সোনালী জীবনদাতা সম্মাননা সনদ",
    certificateTitleEn: "Gold Savior Humanitarian Certificate",
    citationBn: "অন্তত ৫ বার স্বেচ্ছায় রক্তদানের মাইলফলক অর্জন করে সমাজে নিরবচ্ছিন্ন জীবনের আলো ছড়িয়ে দেওয়ার মহতী অবদানের স্বীকৃতিস্বরূপ।",
    citationEn: "Conferred for achieving the profound milestone of 5 voluntary donations, touching countless lives across Bangladesh.",
    perksBn: [
      "গোল্ড সেভিয়ার গোল্ডেন সিল ও সনদ",
      "গোল্ড মেম্বারশিপ স্বীকৃতি ও প্রোফাইল হাইলাইট",
      "গোল্ডেন সোশ্যাল স্টিকার কিট",
    ],
    perksEn: [
      "Golden Seal Verifiable Certificate",
      "Gold Membership Profile Highlight",
      "Golden Social Avatar Studio Kit",
    ],
    avatarFrameColor: "#EAB308",
  },
  {
    id: "platinum",
    nameBn: "অমর সেনানী (Platinum Vanguard)",
    nameEn: "Platinum Vanguard",
    minDonations: 10,
    colorHex: "#38BDF8",
    bgClass: "bg-cyan-500/10",
    borderClass: "border-cyan-500/30",
    textClass: "text-cyan-600 dark:text-cyan-400",
    accentClass: "from-cyan-400 to-blue-600",
    certificateTitleBn: "প্ল্যাটিনাম জাতীয় জীবনরক্ষক সনদ",
    certificateTitleEn: "Platinum National Life Defender Certificate",
    citationBn: "১০ বার রক্তদানের মাধ্যমে ৩০ জন মুমূর্ষু মানুষের জীবন রক্ষায় অগ্রণী অবদান রেখে মানবতার ইতিহাসে অমর দৃষ্টান্ত স্থাপন করায় এই জাতীয় সম্মাননা।",
    citationEn: "Honoring an extraordinary lifetime achievement of 10 donations directly impacting up to 30 patient lives.",
    perksBn: [
      "প্ল্যাটিনাম জাতীয় জীবনরক্ষক সনদ",
      "ডিজিটাল মেম্বারশিপ কার্ডে প্ল্যাটিনাম হলোগ্রাম",
      "প্ল্যাটিনাম সাইবার ক্রাউন ফ্রেম",
    ],
    perksEn: [
      "Platinum National Defender Certificate",
      "Holographic Platinum Digital Membership Seal",
      "Platinum Cyber-Crown Avatar Frame",
    ],
    avatarFrameColor: "#0EA5E9",
  },
  {
    id: "titanium",
    nameBn: "জাতীয় প্রাণরক্ষা অগ্রদূত (Life Champion)",
    nameEn: "National Life Champion",
    minDonations: 15,
    colorHex: "#E11D48",
    bgClass: "bg-rose-500/10",
    borderClass: "border-rose-500/30",
    textClass: "text-rose-600 dark:text-rose-400",
    accentClass: "from-rose-500 to-pink-700",
    certificateTitleBn: "জাতীয় প্রাণরক্ষা অগ্রদূত সম্মাননা সনদ",
    certificateTitleEn: "National Life Champion Award Certificate",
    citationBn: "১৫ বার রক্তদানের বিরল ও ঐতিহাসিক অবদানের মাধ্যমে জাতির জরুরি স্বাস্থ্যসেবায় অনন্য বীরত্ব ও নিঃস্বার্থ আত্মত্যাগের স্বীকৃতিস্বরূপ।",
    citationEn: "Bestowed for monumental dedication reaching 15 verified donations, standing as a legendary vanguard of emergency transfusion.",
    perksBn: [
      "জাতীয় প্রাণরক্ষা অগ্রদূত সনদ (১৫ বার রক্তদান বিশেষ স্বীকৃতি)",
      "ভিআইপি ইমার্জেন্সি রেসপন্ডার গোল্ডেন ব্যাজ",
      "টাইটানিয়াম রুবি রিং সোশ্যাল ফ্রেম",
    ],
    perksEn: [
      "National Life Champion Certificate (15-Donation Milestone)",
      "VIP Emergency Responder Protocol Badge",
      "Titanium Ruby Ring Avatar Frame",
    ],
    avatarFrameColor: "#E11D48",
  },
  {
    id: "diamond",
    nameBn: "শতায়ু রক্তযোদ্ধা (Diamond Legend)",
    nameEn: "Diamond Legend - Presidential Award",
    minDonations: 25,
    colorHex: "#8B5CF6",
    bgClass: "bg-purple-500/10",
    borderClass: "border-purple-500/30",
    textClass: "text-purple-600 dark:text-purple-400",
    accentClass: "from-purple-500 to-indigo-700",
    certificateTitleBn: "শতায়ু জাতীয় বীর রাষ্ট্রীয় সম্মাননা সনদ",
    certificateTitleEn: "Diamond Legend Presidential Lifetime Honor Certificate",
    citationBn: "২৫+ বার রক্তদান সম্পন্ন করে ৭৫-এর অধিক মানুষের প্রাণ বাঁচিয়ে দেশের সর্বোচ্চ রক্তদান সম্মানে ভূষিত ও জাতীয় রোল মডেল হিসেবে স্বীকৃতিস্বরূপ।",
    citationEn: "The highest accolade of BLOOD&LIFE for exceeding 25+ blood donations, preserving over 75 human souls as a true national legend.",
    perksBn: [
      "দেশের সর্বোচ্চ 'শতায়ু জাতীয় বীর' রাষ্ট্রীয় সম্মাননা সনদ",
      "হল অব ফেম (Hall of Fame) আজীবন লাইফটাইম লিজেন্ড এন্ট্রি",
      "ডায়মন্ড লাক্সারি মেম্বারশিপ কার্ড ও রয়েল ব্যাজ",
    ],
    perksEn: [
      "Highest National Presidential Lifetime Award Certificate",
      "Hall of Fame Lifetime Entry & Permanent Roll",
      "Diamond Obsidian Royal Membership & Gold Foil Avatar",
    ],
    avatarFrameColor: "#8B5CF6",
    isHighestTier: true,
  },
];

/**
 * Returns the current highest badge tier achieved based on total donations.
 */
export function getDonorTier(totalDonations: number): BadgeTier | null {
  if (!totalDonations || totalDonations < 1) return null;

  // Search in reverse order to get the highest matching tier
  for (let i = DONOR_TIERS.length - 1; i >= 0; i--) {
    if (totalDonations >= DONOR_TIERS[i].minDonations) {
      return DONOR_TIERS[i];
    }
  }
  return DONOR_TIERS[0];
}

/**
 * Returns next upcoming tier and donations required to reach it.
 */
export function getNextTierProgress(totalDonations: number): {
  currentTier: BadgeTier | null;
  nextTier: BadgeTier | null;
  donationsRemaining: number;
  progressPercent: number;
} {
  const currentTier = getDonorTier(totalDonations);

  if (!currentTier) {
    const nextTier = DONOR_TIERS[0];
    return {
      currentTier: null,
      nextTier,
      donationsRemaining: nextTier.minDonations - (totalDonations || 0),
      progressPercent: Math.min(100, Math.round(((totalDonations || 0) / nextTier.minDonations) * 100)),
    };
  }

  const currentIndex = DONOR_TIERS.findIndex((t) => t.id === currentTier.id);
  if (currentIndex === DONOR_TIERS.length - 1) {
    // Already at highest tier (Diamond 25+)
    return {
      currentTier,
      nextTier: null,
      donationsRemaining: 0,
      progressPercent: 100,
    };
  }

  const nextTier = DONOR_TIERS[currentIndex + 1];
  const prevTarget = currentTier.minDonations;
  const nextTarget = nextTier.minDonations;
  const progressInsideTier = totalDonations - prevTarget;
  const tierSpread = nextTarget - prevTarget;

  return {
    currentTier,
    nextTier,
    donationsRemaining: Math.max(0, nextTarget - totalDonations),
    progressPercent: Math.min(100, Math.max(0, Math.round((progressInsideTier / tierSpread) * 100))),
  };
}

/**
 * Returns all tiers unlocked by the donor.
 */
export function getUnlockedTiers(totalDonations: number): BadgeTier[] {
  if (!totalDonations || totalDonations < 1) return [];
  return DONOR_TIERS.filter((t) => totalDonations >= t.minDonations);
}

/**
 * Determines whether a user qualifies for the Official Blood&Life Membership Card.
 * Requirement: Minimum 1 voluntary blood donation.
 */
export function isMembershipEligible(totalDonations: number): boolean {
  return typeof totalDonations === "number" && totalDonations >= 1;
}

/**
 * Generates a standard Blood&Life Membership Number
 */
export function generateMembershipId(userId: string, createdAt?: Date | string): string {
  const cleanId = (userId || "0000").slice(-4).toUpperCase();
  const year = createdAt ? new Date(createdAt).getFullYear() : 2026;
  return `BL-MEM-${year}-${cleanId}`;
}
