"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n/context";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  UserCheck,
  Building2,
  MapPin,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface RequesterCase {
  id: string;
  patientName: string;
  bloodGroup: string;
  units: number;
  hospital: string;
  district: string;
  status: "pending" | "verified" | "matched" | "completed";
  assignedDonor?: {
    name: string;
    phone: string;
    bloodGroup: string;
  };
  createdAt: string;
}

const SAMPLE_REQUESTER_CASES: RequesterCase[] = [
  {
    id: "req-501",
    patientName: "Tasneem Rahman",
    bloodGroup: "O-",
    units: 2,
    hospital: "Dhaka Medical College Hospital (ICU)",
    district: "Dhaka",
    status: "matched",
    assignedDonor: {
      name: "Tafsirul Islam",
      phone: "+880 1711-223344",
      bloodGroup: "O-",
    },
    createdAt: "Today, 10:15 AM",
  },
  {
    id: "req-498",
    patientName: "Nazmul Ahsan",
    bloodGroup: "B+",
    units: 1,
    hospital: "National Heart Foundation, Mirpur",
    district: "Dhaka",
    status: "completed",
    assignedDonor: {
      name: "Sadman Sakib",
      phone: "+880 1822-998877",
      bloodGroup: "B+",
    },
    createdAt: "12 Oct 2025",
  },
];

interface RequesterCockpitProps {
  onOpenSos: () => void;
}

export function RequesterCockpit({ onOpenSos }: RequesterCockpitProps) {
  const { language } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="card-clinical p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[var(--border-subtle)]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            <FileText size={12} />
            <span>{language === "bn" ? "রোগী ও স্বজনদের ড্যাশবোর্ড" : "PATIENT & REQUESTER CENTER"}</span>
          </div>
          <h2 className="text-xl font-black text-[var(--text-primary)]">
            {language === "bn" ? "আপনার জরুরী রক্তের আবেদনসমূহ" : "Active Transfusion Requests"}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {language === "bn"
              ? "আবেদনের অগ্রগতি, ভেরিফিকেশন স্ট্যাটাস ও রক্তদাতার সাথে সরাসরি যোগাযোগ রাখুন।"
              : "Track live verification, donor matching milestones, and coordinator dispatches."}
          </p>
        </div>

        <button
          onClick={onOpenSos}
          className="btn-emergency !py-2.5 !px-4 text-xs font-bold inline-flex items-center gap-2 shrink-0"
        >
          <PlusCircle size={15} />
          <span>{language === "bn" ? "নতুন রক্তের আবেদন" : "New SOS Broadcast"}</span>
        </button>
      </div>

      {/* Case Tracker Cards */}
      <div className="space-y-4">
        {SAMPLE_REQUESTER_CASES.map((item) => (
          <div
            key={item.id}
            className="card-clinical p-6 border-2 border-[var(--border-subtle)] hover:border-red-500/30 transition-all space-y-5"
          >
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <span className="badge-blood text-sm font-black px-2.5 py-1">
                  {item.bloodGroup}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {item.patientName} ({item.units} {language === "bn" ? "ব্যাগ" : "Units"})
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {item.hospital} • {item.district}
                  </p>
                </div>
              </div>

              <div className="text-xs font-mono text-[var(--text-muted)] self-start sm:self-center">
                #{item.id.toUpperCase()} • {item.createdAt}
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-bold">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500">
                1. {language === "bn" ? "আবেদন দাখিল" : "Submitted"}
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500">
                2. {language === "bn" ? "প্রেসক্রিপশন যাচাই" : "Verified"}
              </div>
              <div
                className={`p-2 rounded-lg border ${
                  item.status === "matched" || item.status === "completed"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                    : "bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-muted)]"
                }`}
              >
                3. {language === "bn" ? "রক্তদাতা নিশ্চিত" : "Donor Pledged"}
              </div>
              <div
                className={`p-2 rounded-lg border ${
                  item.status === "completed"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                    : "bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-muted)]"
                }`}
              >
                4. {language === "bn" ? "রক্তদান সম্পন্ন" : "Transfused"}
              </div>
            </div>

            {/* Assigned Donor Card */}
            {item.assignedDonor && (
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center shrink-0">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-500 block">
                      {language === "bn" ? "নিযুক্ত স্বেচ্ছাসেবী রক্তদাতা" : "Assigned Volunteer Donor"}
                    </span>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">
                      {item.assignedDonor.name} ({item.assignedDonor.bloodGroup})
                    </h4>
                    <p className="text-[11px] font-mono text-[var(--text-muted)]">
                      {item.assignedDonor.phone}
                    </p>
                  </div>
                </div>

                <a
                  href={`tel:${item.assignedDonor.phone}`}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-auto transition-colors"
                >
                  <PhoneCall size={14} />
                  <span>{language === "bn" ? "সরাসরি কল দিন" : "Call Donor Directly"}</span>
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
