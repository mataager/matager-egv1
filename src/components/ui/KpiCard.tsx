"use client";

import React, { useState, useEffect } from "react";

export interface KpiCardProps {
  title: string;
  value: string;
  delta: string;
  isPositive?: boolean;
  sparklinePoints?: string; // e.g. "0,25 20,22 40,26 60,18 80,12 100,5"
  icon?: string;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  delta,
  isPositive = true,
  sparklinePoints = "0,28 15,22 30,25 45,18 60,20 75,12 90,14 100,4",
  icon = "bi-graph-up-arrow",
  className = "",
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div
        className={`glass-panel p-5 rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] animate-pulse ${className}`}
      >
        <div className="h-3 w-28 bg-white/10 rounded mb-4" />
        <div className="h-7 w-24 bg-white/10 rounded mb-3" />
        <div className="h-4 w-16 bg-white/10 rounded" />
      </div>
    );
  }

  return (
    <div
      className={`glass-panel p-5 rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] transition-all duration-200 hover:-translate-y-[1px] relative overflow-hidden group ${className}`}
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] font-subtitle">
          {title}
        </span>
        <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[10px] text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] transition-colors">
          <i className={`bi ${icon}`} />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2 mt-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-heading text-[var(--color-text-primary)] tracking-tight">
            {value}
          </span>
          <span
            className={`text-xs font-bold font-ui flex items-center gap-0.5 ${
              isPositive
                ? "text-[var(--color-status-green)]"
                : "text-[var(--color-status-red)]"
            }`}
          >
            <i
              className={`bi ${
                isPositive ? "bi-arrow-up-right" : "bi-arrow-down-right"
              } text-[10px]`}
            />
            {delta}
          </span>
        </div>

        {/* Dynamic Sparkline Graphic */}
        <div className="w-16 h-8 opacity-40 group-hover:opacity-80 transition-opacity">
          <svg
            viewBox="0 0 100 32"
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <polyline
              fill="none"
              stroke={
                isPositive
                  ? "var(--color-status-green)"
                  : "var(--color-status-red)"
              }
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={sparklinePoints}
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
