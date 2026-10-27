"use client";

import React from "react";
import { useDashboardLanguage } from "@/lib/i18n";
import { StatusPill } from "@/components/ui/StatusPill";

export const AdTracking: React.FC = () => {
  const { t } = useDashboardLanguage();

  return (
    <div className="glass-panel rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] overflow-hidden transition-all duration-200 hover:-translate-y-[1px]">
      <input
        type="checkbox"
        id="toggle-ad-tracking"
        className="peer/ad hidden"
        aria-hidden="true"
      />

      <div className="p-4 sm:p-5 border-b border-[var(--color-border-subtle)] flex justify-between items-center">
        <div>
          <h3 className="text-sm sm:text-base font-bold font-heading text-[var(--color-text-primary)]">
            {t.adTracking.title}
          </h3>
          <p className="text-[11px] font-subtitle text-[var(--color-text-muted)] mt-0.5">
            {t.adTracking.subtitle}
          </p>
        </div>

        <label
          htmlFor="toggle-ad-tracking"
          className="text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors group cursor-pointer select-none peer-checked/ad:[&_.ad-chevron]:rotate-180"
        >
          <span className="tracking-wide">{t.adTracking.showDetails}</span>
          <i className="bi bi-chevron-down transition-transform duration-300 group-hover:text-[var(--color-text-primary)] ad-chevron text-[10px]" />
        </label>
      </div>

      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/ad:max-h-[300px] bg-white/[0.01]">
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Health Col */}
          <div className="flex flex-col justify-between md:border-r rtl:md:border-r-0 rtl:md:border-l border-[var(--color-border-subtle)] md:pr-6 rtl:md:pr-0 rtl:md:pl-6">
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-subtitle mb-2">
                {t.adTracking.pixelHealth}
              </p>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-status-green)] animate-pulse shadow-[0_0_8px_var(--color-status-green)]" />
                <span className="text-xs font-bold text-[var(--color-status-green)] font-ui">
                  {t.adTracking.live}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] font-subtitle leading-relaxed">
                {t.adTracking.healthDesc}
              </p>
            </div>
          </div>

          {/* Integrations List */}
          <div className="md:col-span-2 space-y-3">
            {/* Meta */}
            <div className="flex items-center justify-between py-2 border-b border-[var(--color-border-subtle)]/40">
              <div>
                <p className="text-xs font-bold text-[var(--color-text-primary)] font-ui">
                  {t.adTracking.metaTitle}
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)] font-subtitle">
                  {t.adTracking.metaDesc}
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <StatusPill variant="success">{t.adTracking.connected}</StatusPill>
                <button
                  type="button"
                  className="text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors font-ui"
                >
                  {t.adTracking.editBtn}
                </button>
              </div>
            </div>

            {/* TikTok */}
            <div className="flex items-center justify-between py-2 border-b border-[var(--color-border-subtle)]/40">
              <div>
                <p className="text-xs font-bold text-[var(--color-text-primary)] font-ui">
                  {t.adTracking.tiktokTitle}
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)] font-subtitle">
                  {t.adTracking.tiktokDesc}
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <StatusPill variant="neutral">{t.adTracking.notLinked}</StatusPill>
                <button
                  type="button"
                  className="text-[11px] text-[var(--color-primary-light)] hover:underline font-bold transition-colors font-ui"
                >
                  {t.adTracking.setupBtn}
                </button>
              </div>
            </div>

            {/* GA4 */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-xs font-bold text-[var(--color-text-primary)] font-ui">
                  {t.adTracking.googleTitle}
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)] font-subtitle">
                  {t.adTracking.googleDesc}
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <StatusPill variant="success">{t.adTracking.connected}</StatusPill>
                <button
                  type="button"
                  className="text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors font-ui"
                >
                  {t.adTracking.editBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
