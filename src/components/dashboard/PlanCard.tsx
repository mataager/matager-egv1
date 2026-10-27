"use client";

import React from "react";
import { useDashboardLanguage } from "@/lib/i18n";
import { StatusPill } from "@/components/ui/StatusPill";

export const PlanCard: React.FC = () => {
  const { t } = useDashboardLanguage();

  return (
    <div className="glass-panel p-5 rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] font-subtitle">
            {t.plan.currentPlan}
          </span>
          <StatusPill variant="info">{t.plan.statusActive}</StatusPill>
        </div>

        {/* Plan Name & Expiry */}
        <div className="flex justify-between items-end mb-2">
          <h4 className="text-lg font-bold font-heading text-[var(--color-text-primary)]">
            {t.plan.planName}
          </h4>
          <span className="text-[10px] font-subtitle text-[var(--color-text-muted)] mb-0.5">
            {t.plan.endsDate}
          </span>
        </div>

        {/* Usage Progress Bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-status-green)] w-[70%] rounded-full" />
        </div>

        {/* Usage Text */}
        <p className="text-[11px] font-subtitle text-[var(--color-text-secondary)] mt-2">
          {t.plan.usageText}
        </p>
      </div>

      {/* Upgrade Plan Ghost Button */}
      <button
        type="button"
        className="w-full mt-5 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-[var(--color-border-subtle)] hover:border-[var(--color-text-muted)] text-[10px] font-bold font-ui text-[var(--color-text-primary)] transition-all text-center"
      >
        {t.plan.upgradeButton}
      </button>
    </div>
  );
};
