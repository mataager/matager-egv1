"use client";

import React, { useState } from "react";
import { useLanguage } from "@/i18n";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroTerminalMockup } from "@/components/landing/HeroTerminalMockup";
import { ValuePillars } from "@/components/landing/ValuePillars";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { EcosystemGrid } from "@/components/landing/EcosystemGrid";
import { SocialProofMetrics } from "@/components/landing/SocialProofMetrics";
import { IntegrationsGrid } from "@/components/landing/IntegrationsGrid";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { AuthModal } from "@/components/auth/AuthModal";
import { LiveRegion } from "@/components/common/LiveRegion";
import { LanguageTransitionOverlay } from "@/components/common/LanguageTransitionOverlay";
import { GsapScrollManager } from "@/components/layout/GsapScrollManager";
import { ArrowRight, ChevronRight, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  const { t, dir } = useLanguage();

  // Auth modal management
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [authRole, setAuthRole] = useState<"owner" | "employee">("owner");

  // Screen-reader live region announcement
  const [announcement, setAnnouncement] = useState("");

  const handleOpenAuth = (
    mode: "signin" | "signup" = "signin",
    role: "owner" | "employee" = "owner"
  ) => {
    setAuthMode(mode);
    setAuthRole(role);
    setAuthModalOpen(true);
    setAnnouncement(
      mode === "signup"
        ? "Opening Matager merchant signup terminal."
        : "Opening Matager access portal."
    );
  };

  return (
    <GsapScrollManager>
      <div className="min-h-screen w-full bg-[var(--color-canvas)] text-[var(--color-text-primary)] relative overflow-x-hidden selection:bg-[var(--color-accent-violet)]/30 selection:text-white">
        {/* Screen-reader live region announcer */}
        <LiveRegion message={announcement} />

        {/* Smooth animated language switching transition overlay */}
        <LanguageTransitionOverlay />

        {/* Persistent Top Navigation Bar */}
        <LandingHeader onOpenAuth={handleOpenAuth} />

      <main id="top" className="relative pt-24 sm:pt-32">
        {/* ══════════════════════════════════════════════════════════════════════
            HERO CENTERED STACK (Basedash Command Surface)
            ══════════════════════════════════════════════════════════════════════ */}
        <section className="relative px-4 sm:px-6 pt-6 sm:pt-12 pb-16 sm:pb-24">
          <div className="max-w-[1200px] mx-auto text-center">
            {/* ─── Announcement Pill Badge (Inter 13px, 999px radius, Mint Live Dot) ─── */}
            <div className="inline-flex items-center gap-2 mb-8">
              <div className="status-pill-badge cursor-pointer hover:border-[var(--color-text-muted)] transition-colors">
                <span className="mint-live-dot" />
                <span className="tracking-inter">{t.hero.pillBadge}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60 rtl:rotate-180" />
              </div>
            </div>

            {/* ─── Hero Headline (Serif / Josefin / Reem Kufi Display at 48px) ─── */}
            <div className="space-y-4 max-w-[880px] mx-auto">
              <h1 className="font-heading text-[38px] sm:text-[48px] md:text-[54px] font-normal leading-[1.0] text-[var(--color-text-primary)] tracking-tight">
                {t.hero.brand} — {t.hero.tagline}
              </h1>

              {/* Subhead in Inter 18px Ash Gray (ash-gray), max-width 640px */}
              <p className="text-[16px] sm:text-[18px] text-[var(--color-text-secondary)] leading-[1.56] tracking-inter max-w-[640px] mx-auto pt-2">
                {t.hero.supporting}
              </p>
            </div>

            {/* ─── Button Row (White Filled Pill + Ghost Action) ─── */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 mt-8 sm:mt-10">
              {/* Primary Filled White Pill Button */}
              <button
                type="button"
                onClick={() => handleOpenAuth("signup", "owner")}
                className="btn-primary-pill text-[15px] py-3 px-6 shadow-sm"
              >
                <span>{t.hero.primaryCta}</span>
              </button>

              {/* Ghost Action Button */}
              <button
                type="button"
                onClick={() => handleOpenAuth("signin", "owner")}
                className="btn-ghost-action text-[15px]"
              >
                <span>{t.hero.secondaryCta}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180 opacity-70" />
              </button>
            </div>

            {/* ─── Trust Line in Inter 13px Ash Gray ─── */}
            <div className="mt-8 text-[13px] text-[var(--color-text-muted)] tracking-inter flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--color-accent-mint)] opacity-80" />
              <span>{t.hero.trustLine}</span>
            </div>

            {/* ─── Full-Bleed 3D Dashboard Mockup Frame ─── */}
            <HeroTerminalMockup />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            VALUE PILLARS (4 Carbon Cards)
            ══════════════════════════════════════════════════════════════════════ */}
        <ValuePillars />

        {/* ══════════════════════════════════════════════════════════════════════
            HOW IT WORKS (3-Step Connected Flow)
            ══════════════════════════════════════════════════════════════════════ */}
        <HowItWorks />

        {/* ══════════════════════════════════════════════════════════════════════
            ECOSYSTEM OVERVIEW (Modules Grid)
            ══════════════════════════════════════════════════════════════════════ */}
        <EcosystemGrid />

        {/* ══════════════════════════════════════════════════════════════════════
            SOCIAL PROOF & TELEMETRY (Metric Display Cards + Testimonials)
            ══════════════════════════════════════════════════════════════════════ */}
        <SocialProofMetrics />

        {/* ══════════════════════════════════════════════════════════════════════
            INTEGRATIONS LOGO GRID (Floating on Void)
            ══════════════════════════════════════════════════════════════════════ */}
        <IntegrationsGrid />
      </main>

      {/* ══════════════════════════════════════════════════════════════════════
          FINAL CTA & TERMINAL FOOTER
          ══════════════════════════════════════════════════════════════════════ */}
      <LandingFooter onOpenAuth={handleOpenAuth} />

      {/* ══════════════════════════════════════════════════════════════════════
          UNIFIED AUTHENTICATION MODAL (Preserved for Owner & Staff)
          ══════════════════════════════════════════════════════════════════════ */}
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authMode}
          initialRole={authRole}
          onClose={() => setAuthModalOpen(false)}
        />
      </div>
    </GsapScrollManager>
  );
}
