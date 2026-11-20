"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { Bell, ShieldCheck, Heart, AlertCircle, CheckCircle2, X } from "lucide-react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  type: "MATCH" | "VERIFIED" | "COOLDOWN";
  titleEn: string;
  titleBn: string;
  messageEn: string;
  messageBn: string;
  timeAgoEn: string;
  timeAgoBn: string;
  read: boolean;
  link: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "MATCH",
    titleEn: "Urgent O- Transfusion Request",
    titleBn: "জরুরী O- রক্তের আবেদন",
    messageEn: "Dhaka Medical College ICU needs 2 units of O- blood.",
    messageBn: "ঢাকা মেডিকেল কলেজ আইসিইউ-তে ২ ব্যাগ O- রক্ত জরুরী প্রয়োজন।",
    timeAgoEn: "5 mins ago",
    timeAgoBn: "৫ মিনিট আগে",
    read: false,
    link: "/requests/sample-1",
  },
  {
    id: "notif-2",
    type: "VERIFIED",
    titleEn: "Case Verified Genuine",
    titleBn: "প্রেসক্রিপশন ভেরিফাইড",
    messageEn: "Volunteer Dr. Rahman approved your request bed ticket.",
    messageBn: "ভলান্টিয়ার কর্তৃক আপনার আবেদনটি যাচাই ও ভেরিফাইড করা হয়েছে।",
    timeAgoEn: "1 hour ago",
    timeAgoBn: "১ ঘণ্টা আগে",
    read: false,
    link: "/requests/sample-2",
  },
  {
    id: "notif-3",
    type: "COOLDOWN",
    titleEn: "90-Day Cooldown Safe",
    titleBn: "৯০ দিনের স্বাস্থ্য বিরতি",
    messageEn: "You are on day 42 of 90. Next eligible date: Dec 14.",
    messageBn: "আপনার ৯০ দিনের বিরতির ৪২তম দিন চলছে। পরবর্তী রক্তদানের তারিখ: ১৪ ডিসেম্বর।",
    timeAgoEn: "Yesterday",
    timeAgoBn: "গতকাল",
    read: true,
    link: "/dashboard",
  },
];

export function NotificationBell() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-red-500 transition-colors relative"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                {language === "bn" ? "নোটিফিকেশন সেন্টার" : "Emergency Alerts"}
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold">
                  {unreadCount} {language === "bn" ? "নতুন" : "new"}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-bold text-red-500 hover:text-red-600"
              >
                {language === "bn" ? "পড়েছি চিহ্নিত করুন" : "Mark read"}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border-subtle)]">
            {notifications.map((item) => (
              <Link
                key={item.id}
                href={item.link}
                onClick={() => setIsOpen(false)}
                className={`p-3.5 flex items-start gap-3 hover:bg-[var(--bg-main)] transition-colors block ${
                  !item.read ? "bg-red-500/[0.03]" : ""
                }`}
              >
                <div className="mt-0.5">
                  {item.type === "MATCH" && (
                    <div className="w-7 h-7 rounded-lg bg-red-500/15 text-red-500 flex items-center justify-center">
                      <AlertCircle size={14} />
                    </div>
                  )}
                  {item.type === "VERIFIED" && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                      <ShieldCheck size={14} />
                    </div>
                  )}
                  {item.type === "COOLDOWN" && (
                    <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center">
                      <Heart size={14} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h5 className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {language === "bn" ? item.titleBn : item.titleEn}
                    </h5>
                    <span className="text-[10px] text-[var(--text-muted)] shrink-0 font-medium">
                      {language === "bn" ? item.timeAgoBn : item.timeAgoEn}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {language === "bn" ? item.messageBn : item.messageEn}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="p-2.5 bg-[var(--bg-main)] border-t border-[var(--border-subtle)] text-center">
            <Link
              href="/search"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-red-500 hover:text-red-400"
            >
              {language === "bn" ? "সব জরুরী আবেদন দেখুন" : "View Emergency Queue"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
