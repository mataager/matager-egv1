"use client";

import React from "react";
import { KpiCard } from "@/components/ui/KpiCard";
import { useDashboardLanguage } from "@/lib/i18n";

export const KpiStrip: React.FC = () => {
  const { t } = useDashboardLanguage();

  return (
    <section className="space-y-4">
      {/* Welcome Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-[var(--color-text-primary)] tracking-tight">
            {t.welcome.title}
          </h1>
          <p className="text-xs sm:text-sm font-subtitle text-[var(--color-text-secondary)] mt-0.5">
            {t.welcome.subtitle}
          </p>
        </div>
      </div>

      {/* 4 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title={t.kpis.revenue.title}
          value={t.kpis.revenue.value}
          delta={t.kpis.revenue.delta}
          isPositive={t.kpis.revenue.isPositive}
          icon="bi-cash-coin"
          sparklinePoints="0,26 15,22 30,24 45,18 60,19 75,12 90,14 100,5"
        />
        <KpiCard
          title={t.kpis.orders.title}
          value={t.kpis.orders.value}
          delta={t.kpis.orders.delta}
          isPositive={t.kpis.orders.isPositive}
          icon="bi-bag-check"
          sparklinePoints="0,24 20,20 40,22 60,15 80,14 100,6"
        />
        <KpiCard
          title={t.kpis.customers.title}
          value={t.kpis.customers.value}
          delta={t.kpis.customers.delta}
          isPositive={t.kpis.customers.isPositive}
          icon="bi-people"
          sparklinePoints="0,25 20,22 40,18 60,19 80,11 100,7"
        />
        <KpiCard
          title={t.kpis.cartValue.title}
          value={t.kpis.cartValue.value}
          delta={t.kpis.cartValue.delta}
          isPositive={t.kpis.cartValue.isPositive}
          icon="bi-cart3"
          sparklinePoints="0,22 20,24 40,19 60,16 80,12 100,8"
        />
      </div>
    </section>
  );
};
