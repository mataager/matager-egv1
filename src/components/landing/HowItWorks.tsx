"use client";

import React from "react";
import { useLanguage } from "@/i18n";
import { Database, Split, Gauge, ArrowRight } from "lucide-react";

export const HowItWorks: React.FC = () => {
  const { t, dir } = useLanguage();

  const steps = [
    {
      num: t.howItWorks.step1Num,
      title: t.howItWorks.step1Title,
      desc: t.howItWorks.step1Desc,
      icon: Database,
      accent: "var(--color-accent-violet)",
    },
    {
      num: t.howItWorks.step2Num,
      title: t.howItWorks.step2Title,
      desc: t.howItWorks.step2Desc,
      icon: Split,
      accent: "var(--color-accent-mint)",
    },
    {
      num: t.howItWorks.step3Num,
      title: t.howItWorks.step3Title,
      desc: t.howItWorks.step3Desc,
      icon: Gauge,
      accent: "var(--color-accent-violet)",
    },
  ];

  return (
    <section id="how-it-works" className="w-full py-20 sm:py-28 relative border-t border-[var(--color-border-subtle)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-[720px] mx-auto mb-14 sm:mb-16">
          <div className="status-pill-badge mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-mint)]" />
            <span>{t.howItWorks.sectionBadge}</span>
          </div>

          <h2 className="font-heading text-[34px] sm:text-[44px] md:text-[48px] font-normal leading-[1.0] text-[var(--color-text-primary)] mb-6">
            {t.howItWorks.heading}
          </h2>

          <p className="text-[16px] sm:text-[18px] text-[var(--color-text-secondary)] leading-[1.56] tracking-inter">
            {t.howItWorks.subhead}
          </p>
        </div>

        {/* 3-Step Flow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="carbon-card p-6 sm:p-7 relative flex flex-col justify-between"
              >
                <div>
                  {/* Step Index Badge & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[32px] font-bold font-mono text-[var(--color-text-muted)] opacity-60">
                      {step.num}
                    </span>
                    <div
                      className="w-10 h-10 rounded-[6px] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] flex items-center justify-center"
                    >
                      <Icon className="w-5 h-5" style={{ color: step.accent }} />
                    </div>
                  </div>

                  <h3 className="text-[18px] sm:text-[20px] font-medium text-[var(--color-text-primary)] mb-3 tracking-inter">
                    {step.title}
                  </h3>

                  <p className="text-[14px] text-[var(--color-text-secondary)] leading-[1.55] tracking-inter">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-[11px] font-mono text-[var(--color-text-muted)]">
                  <span>pipeline_stage_{idx + 1}</span>
                  <span className="text-[var(--color-accent-mint)]">Ready</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
