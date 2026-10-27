"use client";

import React from "react";
import { useLanguage } from "@/i18n";
import {
  Users,
  Store,
  Layers,
  FileCheck2,
  Navigation,
  BrainCircuit,
  CheckCircle2,
} from "lucide-react";

export const EcosystemGrid: React.FC = () => {
  const { t } = useLanguage();

  const modules = [
    {
      title: t.ecosystem.mod1Title,
      desc: t.ecosystem.mod1Desc,
      icon: Users,
      accent: "var(--color-accent-violet)",
      badge: "Marketplace Core",
    },
    {
      title: t.ecosystem.mod2Title,
      desc: t.ecosystem.mod2Desc,
      icon: Store,
      accent: "var(--color-accent-mint)",
      badge: "POS Terminal",
    },
    {
      title: t.ecosystem.mod3Title,
      desc: t.ecosystem.mod3Desc,
      icon: Layers,
      accent: "var(--color-accent-violet)",
      badge: "Real-time Matrix",
    },
    {
      title: t.ecosystem.mod4Title,
      desc: t.ecosystem.mod4Desc,
      icon: FileCheck2,
      accent: "var(--color-accent-mint)",
      badge: "Global Tax Engine",
    },
    {
      title: t.ecosystem.mod5Title,
      desc: t.ecosystem.mod5Desc,
      icon: Navigation,
      accent: "var(--color-accent-violet)",
      badge: "Carrier Routing",
    },
    {
      title: t.ecosystem.mod6Title,
      desc: t.ecosystem.mod6Desc,
      icon: BrainCircuit,
      accent: "var(--color-accent-mint)",
      badge: "Cohort Machine",
    },
  ];

  return (
    <section id="ecosystem" className="w-full py-20 sm:py-28 relative border-t border-[var(--color-border-subtle)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-[760px] mx-auto mb-14 sm:mb-16">
          <div className="status-pill-badge mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-violet)]" />
            <span>{t.ecosystem.sectionBadge}</span>
          </div>



          <h2 className="font-heading text-[34px] sm:text-[44px] md:text-[48px] font-normal leading-[1.0] text-[var(--color-text-primary)] mb-6">
            {t.ecosystem.heading}
          </h2>

          <p className="text-[16px] sm:text-[18px] text-[var(--color-text-secondary)] leading-[1.56] tracking-inter">
            {t.ecosystem.subhead}
          </p>
        </div>

        {/* 6-Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {modules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <div
                key={idx}
                className="carbon-card p-6 flex flex-col justify-between group hover:border-[var(--color-border-hover)] transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-9 h-9 rounded-[6px] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] flex items-center justify-center">
                      <Icon className="w-4 h-4" style={{ color: mod.accent }} />
                    </div>

                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-[4px] border border-[var(--color-border-subtle)] bg-[var(--color-canvas)] text-[var(--color-text-muted)]">
                      {mod.badge}
                    </span>
                  </div>

                  <h3 className="text-[17px] sm:text-[18px] font-medium text-[var(--color-text-primary)] mb-2.5 tracking-inter">
                    {mod.title}
                  </h3>

                  <p className="text-[13px] sm:text-[14px] text-[var(--color-text-secondary)] leading-[1.55] tracking-inter">
                    {mod.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-[11px] font-mono text-[var(--color-text-muted)]">
                  <span>subsystem_0{idx + 1}</span>
                  <span className="flex items-center gap-1 text-[var(--color-accent-mint)]">
                    <CheckCircle2 className="w-3 h-3" />
                    Online
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
