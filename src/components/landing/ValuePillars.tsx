"use client";

import React from "react";
import { useLanguage } from "@/i18n";
import { Store, CreditCard, Truck, BarChart3, ArrowUpRight } from "lucide-react";

export const ValuePillars: React.FC = () => {
  const { t } = useLanguage();

  const pillars = [
    {
      icon: Store,
      accent: "var(--color-accent-violet)",
      badgeColor: "rgba(153, 132, 216, 0.15)",
      badgeBorder: "rgba(153, 132, 216, 0.3)",
      title: t.pillars.card1Title,
      description: t.pillars.card1Description,
      metric: t.pillars.card1Metric,
      metricLabel: t.pillars.card1MetricLabel,
    },
    {
      icon: CreditCard,
      accent: "var(--color-accent-mint)",
      badgeColor: "rgba(63, 203, 127, 0.12)",
      badgeBorder: "rgba(63, 203, 127, 0.3)",
      title: t.pillars.card2Title,
      description: t.pillars.card2Description,
      metric: t.pillars.card2Metric,
      metricLabel: t.pillars.card2MetricLabel,
    },
    {
      icon: Truck,
      accent: "var(--color-accent-violet)",
      badgeColor: "rgba(153, 132, 216, 0.15)",
      badgeBorder: "rgba(153, 132, 216, 0.3)",
      title: t.pillars.card3Title,
      description: t.pillars.card3Description,
      metric: t.pillars.card3Metric,
      metricLabel: t.pillars.card3MetricLabel,
    },
    {
      icon: BarChart3,
      accent: "var(--color-accent-mint)",
      badgeColor: "rgba(63, 203, 127, 0.12)",
      badgeBorder: "rgba(63, 203, 127, 0.3)",
      title: t.pillars.card4Title,
      description: t.pillars.card4Description,
      metric: t.pillars.card4Metric,
      metricLabel: t.pillars.card4MetricLabel,
    },
  ];

  return (
    <section id="pillars" className="w-full py-20 sm:py-28 relative">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* ─── STANDARDIZED BASEDASH SECTION HEADER ─── */}
        <div className="text-center max-w-[760px] mx-auto mb-14 sm:mb-16">
          <div className="status-pill-badge mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-violet)]" />
            <span>{t.pillars.sectionBadge}</span>
          </div>

          <h2 className="font-heading text-[34px] sm:text-[44px] md:text-[48px] font-normal leading-[1.0] text-[var(--color-text-primary)] mb-6">
            {t.pillars.heading}
          </h2>

          <p className="text-[16px] sm:text-[18px] text-[var(--color-text-secondary)] leading-[1.56] tracking-inter">
            {t.pillars.subhead}
          </p>
        </div>

        {/* ─── 4 CARBON CARDS GRID (16px radius, recessed wells) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {pillars.map((pillar, idx) => {
            const IconComponent = pillar.icon;
            return (
              <div
                key={idx}
                className="carbon-card p-6 sm:p-8 flex flex-col justify-between group hover:border-[var(--color-border-hover)] transition-all duration-200"
              >
                <div>
                  {/* Top Row: Icon + Metric Tag */}
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className="w-11 h-11 rounded-[8px] flex items-center justify-center border"
                      style={{
                        backgroundColor: pillar.badgeColor,
                        borderColor: pillar.badgeBorder,
                      }}
                    >
                      <IconComponent
                        className="w-5 h-5"
                        style={{ color: pillar.accent }}
                      />
                    </div>

                    <div className="text-end">
                      <div
                        className="text-[20px] font-semibold font-mono tracking-tight"
                        style={{ color: pillar.accent }}
                      >
                        {pillar.metric}
                      </div>
                      <div className="text-[11px] text-[var(--color-text-muted)] tracking-inter">
                        {pillar.metricLabel}
                      </div>
                    </div>
                  </div>

                  {/* Card Title */}
                  <h3 className="text-[20px] sm:text-[22px] font-medium text-[var(--color-text-primary)] mb-3 tracking-inter">
                    {pillar.title}
                  </h3>

                  {/* Benefit-Driven Description */}
                  <p className="text-[14px] sm:text-[15px] text-[var(--color-text-secondary)] leading-[1.55] tracking-inter">
                    {pillar.description}
                  </p>
                </div>

                {/* Subtle telemetry underline */}
                <div className="mt-8 pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-[12px] text-[var(--color-text-muted)] font-mono">
                  <span>core_primitive_{idx + 1}</span>
                  <span className="flex items-center gap-1 group-hover:text-[var(--color-text-primary)] transition-colors">
                    Active Module
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
