"use client";

import React, { useEffect, useState, use } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { EmergencyFooter } from "@/components/home/EmergencyFooter";
import { SosBroadcastModal } from "@/components/requests/SosBroadcastModal";
import { useLanguage } from "@/lib/i18n/context";
import { IDonationRequest } from "@/types";
import { 
  Hospital, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  Heart, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft 
} from "lucide-react";
import Link from "next/link";

export default function RequestDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { language } = useLanguage();
  const [request, setRequest] = useState<IDonationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [pledging, setPledging] = useState(false);
  const [pledgeSuccess, setPledgeSuccess] = useState<string | null>(null);
  const [pledgeError, setPledgeError] = useState<string | null>(null);
  const [isSosOpen, setIsSosOpen] = useState(false);

  useEffect(() => {
    async function fetchCase() {
      try {
        const res = await fetch(`/api/requests/${id}`);
        const data = await res.json();
        if (data.request) {
          setRequest(data.request);
        }
      } catch {
        // Handle fetch failure
      } finally {
        setLoading(false);
      }
    }
    fetchCase();
  }, [id]);

  const handlePledge = async () => {
    setPledging(true);
    setPledgeError(null);
    setPledgeSuccess(null);
    try {
      const res = await fetch(`/api/requests/${id}/pledge`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to pledge donation");
      }
      setPledgeSuccess(data.message);
      if (request) {
        setRequest({ ...request, status: "inprogress" });
      }
    } catch (err) {
      setPledgeError(err instanceof Error ? err.message : "Pledge failed");
    } finally {
      setPledging(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <div className="w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-main)] p-4 text-center">
        <AlertCircle size={40} className="text-red-500 mb-3" />
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Emergency Case Not Found</h2>
        <Link href="/search" className="mt-4 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold">
          Back to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
      {/* Global Unified Responsive Navbar */}
      <Navbar onOpenSos={() => setIsSosOpen(true)} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-red-500 transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          <span>{language === "bn" ? "আবেদন তালিকায় ফিরে যান" : "Back to Emergency Feed"}</span>
        </Link>

        <div className="p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-md space-y-6">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-red-600/25 shrink-0">
                {request.bloodGroup}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 block">
                  {request.urgency.toUpperCase()} EMERGENCY CASE
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                  {request.recipientName}
                </h1>
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-1">
                  <Hospital size={13} className="text-red-500 shrink-0" />
                  <span>{request.hospital} ({request.district}, {request.upazila})</span>
                </div>
              </div>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              request.status === "pending"
                ? "bg-red-500/10 text-red-600 border border-red-500/20"
                : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
            }`}>
              {request.status}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)]">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">
                Units Needed
              </span>
              <span className="text-base font-black text-[var(--text-primary)]">
                {request.unitsNeeded} Bag(s)
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)]">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">
                Schedule Date
              </span>
              <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                {request.scheduledDate}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)]">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">
                Required Time
              </span>
              <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                {request.scheduledTime}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)]">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">
                Hospital Ward
              </span>
              <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate block">
                {request.hospital}
              </span>
            </div>
          </div>

          {/* Message Context */}
          {request.message && (
            <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] italic leading-relaxed">
              "{request.message}"
            </div>
          )}

          {/* Feedback Messages */}
          {pledgeSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={18} className="shrink-0" />
              <span>{pledgeSuccess}</span>
            </div>
          )}

          {pledgeError && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{pledgeError}</span>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handlePledge}
              disabled={pledging || request.status !== "pending"}
              className="w-full sm:w-2/3 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-red-600/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              <Heart size={16} />
              <span>{pledging ? "Pledging..." : "Commit to Donate Blood"}</span>
            </button>

            <a
              href={`tel:${request.requesterPhone}`}
              className="w-full sm:w-1/3 py-3.5 px-6 rounded-2xl border border-[var(--border-subtle)] hover:border-red-500 bg-[var(--surface-card)] text-[var(--text-primary)] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <Phone size={15} />
              <span>Call Requester</span>
            </a>
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <EmergencyFooter />

      {/* SOS Modal */}
      <SosBroadcastModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
      />
    </div>
  );
}
