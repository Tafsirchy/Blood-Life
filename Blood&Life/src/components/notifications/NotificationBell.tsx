"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/lib/i18n/context";
import {
  Bell,
  ShieldCheck,
  Heart,
  AlertCircle,
  CheckCircle2,
  Droplet,
  Lock,
  Info,
  Trash2,
  BellRing,
} from "lucide-react";
import Link from "next/link";
import {
  isPushSupported,
  getCurrentPushSubscription,
  subscribeToBrowserPush,
  unsubscribeFromBrowserPush,
} from "@/lib/notifications/pushClient";

interface NotificationItem {
  id: string;
  category: "MATCH" | "VERIFIED" | "PLEDGE" | "COOLDOWN" | "SECURITY" | "SYSTEM";
  titleEn: string;
  titleBn: string;
  messageEn: string;
  messageBn: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

function formatRelativeTime(dateStr: string, language: string): string {
  try {
    if (!dateStr) return language === "bn" ? "এইমাত্র" : "Just now";
    const parsedTime = new Date(dateStr).getTime();
    if (isNaN(parsedTime)) return language === "bn" ? "এইমাত্র" : "Just now";
    const diffMs = Date.now() - parsedTime;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (language === "bn") {
      if (diffMin < 1) return "এইমাত্র";
      if (diffMin < 60) return `${diffMin} মিনিট আগে`;
      if (diffHour < 24) return `${diffHour} ঘণ্টা আগে`;
      return `${diffDay} দিন আগে`;
    } else {
      if (diffMin < 1) return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHour < 24) return `${diffHour}h ago`;
      return `${diffDay}d ago`;
    }
  } catch {
    return language === "bn" ? "এইমাত্র" : "Just now";
  }
}

export function NotificationBell() {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pushEnabled, setPushEnabled] = useState<boolean>(false);
  const [pushBusy, setPushBusy] = useState<boolean>(false);

  const fetchNotifications = useCallback(async () => {
    try {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setIsAuthenticated(Boolean(data.authenticated));
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Gracefully silent on failure
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchNotifications();
    getCurrentPushSubscription().then((sub) => setPushEnabled(Boolean(sub)));
  }, [fetchNotifications]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifications]);

  const handleTogglePush = async () => {
    setPushBusy(true);
    try {
      if (pushEnabled) {
        await unsubscribeFromBrowserPush();
        setPushEnabled(false);
      } else {
        const res = await subscribeToBrowserPush();
        if (res.success) setPushEnabled(true);
        else if (res.error) alert(res.error);
      }
    } finally {
      setPushBusy(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllRead" }),
      });
    } catch {
      // Revert if error
      fetchNotifications();
    }
  };

  const handleClearAll = async () => {
    try {
      setNotifications([]);
      setUnreadCount(0);
      await fetch("/api/notifications", { method: "DELETE" });
    } catch {
      fetchNotifications();
    }
  };

  const handleDeleteOne = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const target = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (target && !target.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    try {
      await fetch(`/api/notifications?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch {
      fetchNotifications();
    }
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    setIsOpen(false);
    if (!item.isRead) {
      try {
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id }),
        });
      } catch {
        // silent
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="p-2 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-red-500 transition-colors relative"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {mounted && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
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

            <div className="flex items-center gap-2.5">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] font-bold text-red-500 hover:text-red-600 cursor-pointer"
                >
                  {language === "bn" ? "সবগুলো পড়া" : "Mark read"}
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[11px] font-bold text-[var(--text-muted)] hover:text-red-500 cursor-pointer"
                >
                  {language === "bn" ? "সব মুছুন" : "Clear all"}
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border-subtle)]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 size={30} className="text-emerald-500/50 mx-auto" />
                <p className="text-xs font-bold text-[var(--text-primary)]">
                  {language === "bn" ? "কোন নতুন নোটিফিকেশন নেই" : "No New Notifications"}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] max-w-xs mx-auto">
                  {language === "bn"
                    ? "জরুরী রক্তের আবেদন বা অঙ্গীকার সম্পর্কিত সকল আপডেট এখানে প্রদর্শিত হবে।"
                    : "Emergency blood matches, donor pledges, and case updates will appear here."}
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <Link
                  key={item.id}
                  href={item.link || "/dashboard"}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-[var(--bg-main)] transition-colors block ${
                    !item.isRead ? "bg-red-500/[0.04]" : ""
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {item.category === "MATCH" && (
                      <div className="w-7 h-7 rounded-lg bg-red-500/15 text-red-500 flex items-center justify-center">
                        <Droplet size={14} />
                      </div>
                    )}
                    {item.category === "PLEDGE" && (
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                        <Heart size={14} />
                      </div>
                    )}
                    {item.category === "VERIFIED" && (
                      <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center">
                        <ShieldCheck size={14} />
                      </div>
                    )}
                    {item.category === "COOLDOWN" && (
                      <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-500 flex items-center justify-center">
                        <Heart size={14} />
                      </div>
                    )}
                    {item.category === "SECURITY" && (
                      <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
                        <Lock size={14} />
                      </div>
                    )}
                    {item.category === "SYSTEM" && (
                      <div className="w-7 h-7 rounded-lg bg-slate-500/15 text-slate-500 flex items-center justify-center">
                        <Info size={14} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h5
                        className={`text-xs truncate ${
                          !item.isRead
                            ? "font-black text-[var(--text-primary)]"
                            : "font-semibold text-[var(--text-secondary)]"
                        }`}
                      >
                        {language === "bn" ? item.titleBn : item.titleEn}
                      </h5>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-[var(--text-muted)] font-medium">
                          {formatRelativeTime(item.createdAt, language)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteOne(e, item.id)}
                          className="p-0.5 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                          title={language === "bn" ? "মুছে ফেলুন" : "Delete notification"}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {language === "bn" ? item.messageBn : item.messageEn}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="p-2.5 bg-[var(--bg-main)] border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
            {mounted && isPushSupported() && isAuthenticated ? (
              <button
                type="button"
                disabled={pushBusy}
                onClick={handleTogglePush}
                className={`text-[11px] font-bold inline-flex items-center gap-1 px-2 py-1 rounded-lg border transition-colors ${
                  pushEnabled
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-red-500"
                }`}
              >
                <BellRing size={12} />
                <span>
                  {pushBusy
                    ? "..."
                    : pushEnabled
                    ? language === "bn" ? "পুশ অ্যালার্ট চালু" : "Push Alerts On"
                    : language === "bn" ? "পুশ অ্যালার্ট চালু করুন" : "Enable Push"}
                </span>
              </button>
            ) : (
              <span />
            )}
            <Link
              href="/search"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-red-500 hover:text-red-400"
            >
              {language === "bn" ? "সব জরুরী আবেদন →" : "Emergency Queue →"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
