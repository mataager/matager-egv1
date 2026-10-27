"use client";

import React from "react";
import { useLanguage } from "@/i18n";
import { ArrowUpRight } from "lucide-react";

export const SocialProofMetrics: React.FC = () => {
  const { t, dir } = useLanguage();

  const metricsData = [
    {
      title: t.metrics.metric1Label,
      value: t.metrics.metric1Val,
      delta: t.metrics.metric1Delta,
      secondary: "$1.4M / 24h peak",
      sparkline: "M0,28 Q15,22 30,24 T60,18 T90,12 T120,4",
    },
    {
      title: t.metrics.metric2Label,
      value: t.metrics.metric2Val,
      delta: t.metrics.metric2Delta,
      secondary: "Multi-region failover",
      sparkline: "M0,15 L30,15 L60,14 L90,15 L120,15",
    },
    {
      title: t.metrics.metric3Label,
      value: t.metrics.metric3Val,
      delta: t.metrics.metric3Delta,
      secondary: "Sub-second ledger write",
      sparkline: "M0,26 Q20,20 40,22 T80,10 T100,12 T120,6",
    },
    {
      title: t.metrics.metric4Label,
      value: t.metrics.metric4Val,
      delta: t.metrics.metric4Delta,
      secondary: "Middle East & Global",
      sparkline: "M0,25 Q30,18 60,16 T90,8 T120,2",
    },
  ];

  return (
    <section id="metrics" className="w-full py-20 sm:py-28 relative border-t border-[var(--color-border-subtle)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-[760px] mx-auto mb-14 sm:mb-16">
          <div className="status-pill-badge mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-mint)]" />
            <span>{t.metrics.sectionBadge}</span>
          </div>

          <h2 className="font-heading text-[34px] sm:text-[44px] md:text-[48px] font-normal leading-[1.0] text-[var(--color-text-primary)] mb-6">
            {t.metrics.heading}
          </h2>

          <p className="text-[16px] sm:text-[18px] text-[var(--color-text-secondary)] leading-[1.56] tracking-inter">
            {t.metrics.subhead}
          </p>

          {/* Sample data label clearly marked as required */}
          <div className="inline-block mt-4 px-3 py-1 rounded-[6px] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[11px] font-mono text-[var(--color-text-muted)]">
            ℹ {t.metrics.sampleNotice}
          </div>
        </div>

        {/* ─── 4 METRIC DISPLAY CARDS (Basedash Style Reference Specification) ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20 sm:mb-24">
          {metricsData.map((m, idx) => (
            <div
              key={idx}
              className="carbon-card p-5 sm:p-6 flex flex-col justify-between"
            >
              <div>
                {/* Header: Title in Ash Gray + 8px Mint Live Dot */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[14px] text-[var(--color-text-secondary)] font-normal tracking-inter">
                    {m.title}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="mint-live-dot" />
                    <span className="text-[11px] font-medium text-[var(--color-accent-mint)] font-mono">
                      Live
                    </span>
                  </div>
                </div>

                {/* Large Number: Inter 34px weight 600 */}
                <div className="text-[32px] sm:text-[34px] font-semibold text-[var(--color-text-primary)] leading-tight font-mono tracking-tight mb-2">
                  {m.value}
                </div>

                {/* Delta Row: Mint Signal text (+%) with secondary value in Ash Gray */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-[13px] font-medium text-[var(--color-accent-mint)] font-mono">
                    {m.delta}
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)] tracking-inter">
                    {m.secondary}
                  </span>
                </div>
              </div>

              {/* Chart visualization filling lower portion */}
              <div className="w-full h-8 pt-2 border-t border-[var(--color-border-subtle)]">
                <svg
                  viewBox="0 0 120 30"
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  <path
                    d={m.sparkline}
                    fill="none"
                    stroke="var(--color-status-green)"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* ─── TESTIMONIAL CARDS (Basedash Style Reference Specification) ─── */}
        {/* "No visible card border or background — sits directly on the black canvas. 
            64px circular avatar on left, quote text in light serif 24px weight 300 white on right." */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 pt-8 border-t border-[var(--color-border-subtle)]">
          {/* Testimonial 1 */}
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-16 h-16 rounded-full shrink-0 border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface-elevated)] flex items-center justify-center text-[18px] font-semibold text-[var(--color-accent-violet)]">
              TA
            </div>

            <div className="space-y-4">
              <blockquote className="font-heading text-[20px] sm:text-[24px] font-light leading-[1.28] text-[var(--color-text-primary)] tracking-[-0.025em]">
                "{t.metrics.quote1Text}"
              </blockquote>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div>
                  <div className="text-[14px] font-medium text-[var(--color-text-primary)] tracking-inter">
                    {t.metrics.quote1Author}
                  </div>
                  <div className="text-[13px] text-[var(--color-text-secondary)] tracking-inter">
                    {t.metrics.quote1Role} • {t.metrics.quote1Company}
                  </div>
                </div>

                <a
                  href="#top"
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent-violet)] transition-colors"
                >
                  {t.metrics.quote1Link}
                </a>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-16 h-16 rounded-full shrink-0 border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface-elevated)] flex items-center justify-center text-[18px] font-semibold text-[var(--color-accent-mint)]">
              ER
            </div>

            <div className="space-y-4">
              <blockquote className="font-heading text-[20px] sm:text-[24px] font-light leading-[1.28] text-[var(--color-text-primary)] tracking-[-0.025em]">
                "{t.metrics.quote2Text}"
              </blockquote>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div>
                  <div className="text-[14px] font-medium text-[var(--color-text-primary)] tracking-inter">
                    {t.metrics.quote2Author}
                  </div>
                  <div className="text-[13px] text-[var(--color-text-secondary)] tracking-inter">
                    {t.metrics.quote2Role} • {t.metrics.quote2Company}
                  </div>
                </div>

                <a
                  href="#top"
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent-mint)] transition-colors"
                >
                  {t.metrics.quote2Link}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
