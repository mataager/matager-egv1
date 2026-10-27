"use client";

import React from "react";
import { useLanguage } from "@/i18n";
import { MatagerLogo } from "@/components/brand/MatagerLogo";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { APP_ROUTES } from "@/config/routes";

interface LandingFooterProps {
  onOpenAuth: (mode?: "signin" | "signup", role?: "owner" | "employee") => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onOpenAuth }) => {
  const { t } = useLanguage();

  return (
    <footer className="w-full relative border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* ─── FINAL HERO CTA STACK ─── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-20 pb-20 text-center">
        <div className="max-w-[760px] mx-auto space-y-6">
          <h2 className="font-heading text-[34px] sm:text-[44px] md:text-[48px] font-normal leading-[1.0] text-[var(--color-text-primary)]">
            {t.finalCta.heading}
          </h2>

          <p className="text-[16px] sm:text-[18px] text-[var(--color-text-secondary)] leading-[1.56] tracking-inter max-w-[620px] mx-auto">
            {t.finalCta.subhead}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => onOpenAuth("signup", "owner")}
              className="btn-primary-pill text-[15px] py-3 px-6"
            >
              <span>{t.finalCta.primaryButton}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth("signin", "owner")}
              className="btn-ghost-action text-[15px]"
            >
              <span>{t.finalCta.secondaryButton}</span>
            </button>
          </div>

          <div className="pt-2 text-[12px] text-[var(--color-text-muted)] tracking-inter flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--color-accent-mint)] opacity-80" />
            <span>{t.finalCta.noCardRequired}</span>
          </div>
        </div>
      </div>

      {/* ─── TECHNICAL TERMINAL FOOTER BAR ─── */}
      <div className="border-t border-[var(--color-border-subtle)] py-10 px-4 sm:px-6 bg-[var(--color-canvas)]">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-[13px] text-[var(--color-text-secondary)]">
          {/* Brand Identity & Tagline */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a href="#top" aria-label="Matager">
              <MatagerLogo size="sm" showWordmark={true} animated={false} />
            </a>
            <span className="hidden sm:inline-block text-[var(--color-border)]">•</span>
            <span className="text-[var(--color-text-muted)] tracking-inter">
              {t.footer.tagline}
            </span>
          </div>

          {/* Access Portals */}
          <div className="flex flex-wrap items-center gap-6">
            <a
              href={APP_ROUTES.dashboard}
              className="hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-1 focus-visible:outline-none"
            >
              <span>{t.footer.ownerPortal}</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
            </a>

            <button
              type="button"
              onClick={() => onOpenAuth("signin", "employee")}
              className="hover:text-[var(--color-text-primary)] transition-colors focus-visible:outline-none"
            >
              {t.footer.staffPortal}
            </button>

            <a
              href={APP_ROUTES.landing}
              className="hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-1 focus-visible:outline-none"
            >
              <span>{t.footer.customerStore}</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>

          {/* Copyright & Legal */}
          <div className="text-[12px] text-[var(--color-text-muted)] font-mono">
            © {new Date().getFullYear()} {t.footer.rights}
          </div>
        </div>
      </div>
    </footer>
  );
};
