"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { EmergencyPulseRibbon } from "@/components/home/EmergencyPulseRibbon";
import { HeroSection } from "@/components/home/HeroSection";
import { DistrictAvailabilityHeatmap } from "@/components/home/DistrictAvailabilityHeatmap";
import { UrgentTransfusionQueue } from "@/components/home/UrgentTransfusionQueue";
import { LifeSavingLifecycle } from "@/components/home/LifeSavingLifecycle";
import { EligibilityCalculator } from "@/components/home/EligibilityCalculator";
import { RareBloodVault } from "@/components/home/RareBloodVault";
import { PlatformTelemetry } from "@/components/home/PlatformTelemetry";
import { RecoveryStories } from "@/components/home/RecoveryStories";
import { HospitalNetworkGrid } from "@/components/home/HospitalNetworkGrid";
import { CommunityLifeFund } from "@/components/home/CommunityLifeFund";
import { ClinicalFAQ } from "@/components/home/ClinicalFAQ";
import { EmergencyFooter } from "@/components/home/EmergencyFooter";
import { SosBroadcastModal } from "@/components/requests/SosBroadcastModal";
import { EmergencyEntryModal } from "@/components/modals/EmergencyEntryModal";

export default function HomePage() {
  const [isSosOpen, setIsSosOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
      {/* Section 01: Live Emergency Pulse Ribbon */}
      <EmergencyPulseRibbon />

      {/* Task 4.14: Unified Responsive Navbar with Emergency Trigger */}
      <Navbar onOpenSos={() => setIsSosOpen(true)} />

      <main className="flex-1">
        {/* Section 02: 60/40 Symmetrical Hero Section */}
        <HeroSection onOpenSos={() => setIsSosOpen(true)} />

        {/* Section 03: 64-District Live Availability Heatmap */}
        <DistrictAvailabilityHeatmap />

        {/* Section 04: Urgent Transfusion Queue */}
        <UrgentTransfusionQueue />

        {/* Section 05: Life-Saving Lifecycle (3 Steps) */}
        <LifeSavingLifecycle />

        {/* Section 06: Interactive Safe Donation Eligibility Calculator */}
        <EligibilityCalculator />

        {/* Section 07: Rare Blood Group Emergency Vault */}
        <RareBloodVault />

        {/* Section 08: Live Platform Telemetry & Transparency Counters */}
        <PlatformTelemetry />

        {/* Section 09: Verified Recipient Recovery Stories */}
        <RecoveryStories />

        {/* Section 10: Institutional Hospital & Blood Bank Network Grid */}
        <HospitalNetworkGrid />

        {/* Section 11: Community Life Support Fund & Transparency Ledger */}
        <CommunityLifeFund />

        {/* Section 12: Clinical FAQ & Myth Busters */}
        <ClinicalFAQ />
      </main>

      {/* Section 13: 24/7 Hotline & Emergency PWA Action Footer */}
      <EmergencyFooter />

      {/* 3-Step Rapid SOS Broadcast Modal */}
      <SosBroadcastModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        onSuccess={() => setIsSosOpen(false)}
      />

      {/* Website-Entry Interstitial Emergency Alert Modal */}
      <EmergencyEntryModal />
    </div>
  );
}
