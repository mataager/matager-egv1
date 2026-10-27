"use client";

import React from "react";
import { useDashboardLanguage } from "@/lib/i18n";

export const LiveVisitors: React.FC = () => {
  const { t } = useDashboardLanguage();

  return (
    <div className="glass-panel rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] overflow-hidden transition-all duration-200 hover:-translate-y-[1px]">
      {/* Pure-CSS Checkbox */}
      <input
        type="checkbox"
        id="toggle-live-visitors"
        className="peer/live-v hidden"
        aria-hidden="true"
      />

      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[var(--color-border-subtle)] flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-status-green)] animate-pulse shadow-[0_0_8px_var(--color-status-green)]" />
          <h3 className="text-sm sm:text-base font-bold font-heading text-[var(--color-text-primary)]">
            {t.liveVisitors.title}
          </h3>
          <span className="text-[10px] font-subtitle px-1.5 py-0.5 rounded bg-white/5 border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]">
            {t.liveVisitors.badge}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[11px] font-bold text-[var(--color-status-green)] font-ui flex items-center gap-1">
            <span>0</span> {t.liveVisitors.onlineNow}
          </span>

          <label
            htmlFor="toggle-live-visitors"
            className="text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors group cursor-pointer select-none peer-checked/live-v:[&_.live-v-chevron]:rotate-180"
          >
            <span className="tracking-wide">{t.liveVisitors.showDetails}</span>
            <i className="bi bi-chevron-down transition-transform duration-300 group-hover:text-[var(--color-text-primary)] live-v-chevron text-[10px]" />
          </label>
        </div>
      </div>

      {/* Collapsible Content */}
      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/live-v:max-h-[350px] bg-white/[0.01]">
        <div className="p-4 sm:p-5 space-y-4">
          {/* Top 4 Mini-Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Live Now */}
            <div className="flex flex-col p-3 bg-[var(--color-status-green-bg)] rounded-xl border border-[var(--color-status-green-border)]">
              <span className="text-[9px] font-black uppercase tracking-wider text-[var(--color-status-green)] mb-1 font-subtitle">
                {t.liveVisitors.liveNow}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-heading text-[var(--color-text-primary)] leading-none">
                  0
                </span>
                <span className="w-2 h-2 rounded-full bg-[var(--color-status-green)] animate-pulse" />
              </div>
            </div>

            {/* Views 5m */}
            <div className="flex flex-col p-3 bg-[var(--color-status-blue-bg)] rounded-xl border border-[var(--color-status-blue-border)]">
              <span className="text-[9px] font-black uppercase tracking-wider text-[var(--color-status-blue)] mb-1 font-subtitle">
                {t.liveVisitors.views5m}
              </span>
              <span className="text-xl font-bold font-heading text-[var(--color-text-primary)] leading-none">
                0
              </span>
            </div>

            {/* Avg Time */}
            <div className="flex flex-col p-3 bg-[var(--color-status-purple-bg)] rounded-xl border border-[var(--color-status-purple-border)]">
              <span className="text-[9px] font-black uppercase tracking-wider text-[var(--color-status-purple)] mb-1 font-subtitle">
                {t.liveVisitors.avgTime}
              </span>
              <span className="text-xl font-bold font-heading text-[var(--color-text-primary)] leading-none">
                0:00
              </span>
            </div>

            {/* Bounce Rate */}
            <div className="flex flex-col p-3 bg-[var(--color-status-amber-bg)] rounded-xl border border-[var(--color-status-amber-border)]">
              <span className="text-[9px] font-black uppercase tracking-wider text-[var(--color-status-amber)] mb-1 font-subtitle">
                {t.liveVisitors.bounce}
              </span>
              <span className="text-xl font-bold font-heading text-[var(--color-text-primary)] leading-none">
                0%
              </span>
            </div>
          </div>

          {/* Bottom Grid: Traffic Sources & Devices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[var(--color-border-subtle)]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] font-subtitle mb-2">
                {t.liveVisitors.trafficSources}
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-[var(--color-border-subtle)]/40">
                  <span className="text-[var(--color-text-secondary)] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-status-green)]" />
                    {t.liveVisitors.organic}
                  </span>
                  <span className="font-bold text-[var(--color-text-primary)] font-ui">62%</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[var(--color-border-subtle)]/40">
                  <span className="text-[var(--color-text-secondary)] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-status-blue)]" />
                    {t.liveVisitors.direct}
                  </span>
                  <span className="font-bold text-[var(--color-text-primary)] font-ui">24%</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-[var(--color-text-secondary)] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-status-purple)]" />
                    {t.liveVisitors.social}
                  </span>
                  <span className="font-bold text-[var(--color-text-primary)] font-ui">14%</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] font-subtitle mb-2">
                {t.liveVisitors.devices}
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-[var(--color-border-subtle)]/40">
                  <span className="text-[var(--color-text-secondary)] flex items-center gap-2">
                    <i className="bi bi-phone text-xs text-[var(--color-primary-light)]" />
                    {t.liveVisitors.mobile}
                  </span>
                  <span className="font-bold text-[var(--color-text-primary)] font-ui">68%</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[var(--color-border-subtle)]/40">
                  <span className="text-[var(--color-text-secondary)] flex items-center gap-2">
                    <i className="bi bi-laptop text-xs text-[var(--color-status-blue)]" />
                    {t.liveVisitors.desktop}
                  </span>
                  <span className="font-bold text-[var(--color-text-primary)] font-ui">26%</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-[var(--color-text-secondary)] flex items-center gap-2">
                    <i className="bi bi-tablet text-xs text-[var(--color-status-purple)]" />
                    {t.liveVisitors.tablet}
                  </span>
                  <span className="font-bold text-[var(--color-text-primary)] font-ui">6%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
