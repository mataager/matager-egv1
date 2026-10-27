"use client";

import React from "react";
import { useLanguage } from "@/i18n";
import { ArrowUpRight } from "lucide-react";

export const IntegrationsGrid: React.FC = () => {
  const { t } = useLanguage();

  // Native brand badges rendered in their authentic colors directly on the void canvas
  const brands = [
    { name: "Stripe", color: "var(--color-status-purple)", category: "Payments", tag: "PAY" },
    { name: "Visa", color: "var(--color-status-blue)", category: "Cards", tag: "VISA" },
    { name: "Mastercard", color: "var(--color-status-red)", category: "Cards", tag: "MC" },
    { name: "Apple Pay", color: "var(--color-text-muted)", category: "Mobile", tag: "APPLE" },
    { name: "PayPal", color: "var(--color-status-blue)", category: "Payments", tag: "PP" },
    { name: "Mada", color: "var(--color-status-green)", category: "Saudi Rail", tag: "MADA" },
    { name: "DHL Express", color: "var(--color-status-amber)", textColor: "var(--color-status-red)", category: "Logistics", tag: "DHL" },
    { name: "FedEx", color: "var(--color-status-purple)", category: "Logistics", tag: "FEDEX" },
    { name: "Aramex", color: "var(--color-status-red)", category: "Logistics", tag: "ARAMEX" },
    { name: "Shopify Sync", color: "var(--color-status-green)", category: "Commerce", tag: "SHOP" },
    { name: "SAP ERP", color: "var(--color-status-blue)", category: "Enterprise", tag: "SAP" },
    { name: "QuickBooks", color: "var(--color-status-green)", category: "Accounting", tag: "QB" },
  ];

  return (
    <section id="integrations" className="w-full py-20 sm:py-28 relative border-t border-[var(--color-border-subtle)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-[760px] mx-auto mb-14 sm:mb-16">
          <div className="status-pill-badge mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-violet)]" />
            <span>{t.integrations.sectionBadge}</span>
          </div>

          <h2 className="font-heading text-[34px] sm:text-[44px] md:text-[48px] font-normal leading-[1.0] text-[var(--color-text-primary)] mb-6">
            {t.integrations.heading}
          </h2>

          <p className="text-[16px] sm:text-[18px] text-[var(--color-text-secondary)] leading-[1.56] tracking-inter">
            {t.integrations.subhead}
          </p>
        </div>

        {/* ─── NATIVE BRAND LOGO GRID FLOATING ON VOID ─── */}
        {/* Basedash spec: "No borders, no card containers — logos float directly on the void in native brand colors" */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5 mb-12">
          {brands.map((b, idx) => (
            <div
              key={idx}
              className="h-24 rounded-[12px] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-hover)] p-3 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 group"
            >
              <div
                className="w-10 h-10 rounded-[8px] flex items-center justify-center text-[12px] font-bold shadow-sm transition-transform duration-200 group-hover:scale-105"
                style={{
                  backgroundColor: b.color,
                  color: b.textColor || "var(--color-ghost-white)",
                }}
              >
                {b.tag}
              </div>

              <div className="text-[13px] font-medium text-[var(--color-text-primary)] tracking-inter">
                {b.name}
              </div>

              <div className="text-[10px] text-[var(--color-text-muted)] font-mono">
                {b.category}
              </div>
            </div>
          ))}
        </div>

        {/* Centered Outlined Action Button */}
        <div className="text-center">
          <button
            type="button"
            className="btn-outline-action inline-flex items-center gap-2"
          >
            <span>{t.integrations.ctaButton}</span>
            <ArrowUpRight className="w-4 h-4 opacity-70" />
          </button>
        </div>
      </div>
    </section>
  );
};
