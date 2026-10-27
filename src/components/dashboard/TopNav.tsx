"use client";

import React from "react";
import { MatagerLogo } from "@/components/brand/MatagerLogo";
import { useDashboardLanguage } from "@/lib/i18n";
import { useTheme } from "@/theme/useTheme";
import { APP_ROUTES } from "@/config/routes";

interface TopNavProps {
  onSearchChange?: (term: string) => void;
  searchValue?: string;
}

export const TopNav: React.FC<TopNavProps> = ({ onSearchChange, searchValue = "" }) => {
  const { locale, dir, toggleLocale, t } = useDashboardLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--color-canvas)]/85 border-b border-[var(--color-border-subtle)] transition-colors duration-200">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Breadcrumb */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={APP_ROUTES.dashboard}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            aria-label="Matager Home"
          >
            <MatagerLogo size="md" showWordmark={true} />
          </a>

          <span
            className="h-4 w-px bg-[var(--color-border)] hidden sm:inline-block"
            aria-hidden="true"
          />

          <span className="text-xs font-subtitle text-[var(--color-text-secondary)] tracking-wider uppercase font-medium hidden sm:inline-block">
            {t.nav.consoleBreadcrumb}
          </span>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md mx-2 hidden md:block">
          <div className="relative">
            <i className="bi bi-search absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)] pointer-events-none" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={t.nav.searchPlaceholder}
              className="w-full text-xs py-2 pl-9 pr-8 rtl:pl-8 rtl:pr-9 rounded-full bg-[var(--input-bg-gradient)] border border-[var(--input-border-color)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary-light)] focus:ring-1 focus:ring-[var(--color-primary-light)]/40 transition-all font-ui"
            />
            <kbd className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] pointer-events-none hidden lg:inline-block">
              /
            </kbd>
          </div>
        </div>

        {/* Right Cluster: Controls & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLocale}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-[var(--color-border-subtle)] text-xs font-bold font-ui text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all flex items-center gap-1.5"
            aria-label={t.nav.switchLang}
          >
            <i className="bi bi-translate text-xs text-[var(--color-primary-light)]" />
            <span className="text-[11px]">{t.nav.switchLang}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all flex items-center justify-center text-xs"
            aria-label={t.nav.switchTheme}
          >
            {theme === "dark" ? (
              <i className="bi bi-sun text-xs text-[var(--color-status-amber)]" />
            ) : (
              <i className="bi bi-moon-stars text-xs text-[var(--color-primary-light)]" />
            )}
          </button>

          {/* Notification Bell */}
          <button
            type="button"
            className="relative w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all flex items-center justify-center text-xs"
            aria-label={t.nav.notifications}
          >
            <i className="bi bi-bell text-xs" />
            <span className="absolute top-1.5 right-1.5 rtl:right-auto rtl:left-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-status-green)] shadow-[0_0_6px_var(--color-status-green)]" />
          </button>

          {/* POS Cashier Register Link */}
          <a
            href={APP_ROUTES.cashier}
            target="_blank"
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-ui transition-all flex items-center gap-1.5"
            title="Launch In-Store Cashier POS Register"
          >
            <i className="bi bi-shop text-xs text-emerald-400" />
            <span className="hidden md:inline-block">POS Cashier</span>
          </a>

          {/* Super Admin Center Link */}
          <a
            href={APP_ROUTES.superAdmin}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold font-ui transition-all flex items-center gap-1.5"
            title="Super Admin Platform Governance"
          >
            <i className="bi bi-shield-lock text-xs text-red-400" />
            <span className="hidden lg:inline-block">Super Admin</span>
          </a>

          {/* Open Storefront Primary Gradient Button */}
          <a
            href={APP_ROUTES.storefront}
            target="_blank"
            className="px-3.5 py-2 rounded-full bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white text-xs font-bold font-ui shadow-sm hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
          >
            <i className="bi bi-arrow-up-right-square text-xs" />
            <span className="hidden sm:inline-block">{t.nav.openStorefront}</span>
          </a>

          {/* Merchant Avatar Chip */}
          <div className="flex items-center gap-2 pl-1 rtl:pl-0 rtl:pr-1">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-primary-dark)] to-[var(--color-primary-light)] flex items-center justify-center text-[11px] font-bold text-white shadow-sm font-ui">
                MA
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 rtl:-right-auto rtl:-left-0.5 w-2.5 h-2.5 rounded-full bg-[var(--color-status-green)] border-2 border-[var(--color-canvas)]" />
            </div>
            <div className="hidden xl:flex flex-col leading-none">
              <span className="text-xs font-bold font-ui text-[var(--color-text-primary)]">
                {t.nav.ownerName}
              </span>
              <span className="text-[10px] font-subtitle text-[var(--color-text-muted)] mt-0.5">
                {t.nav.ownerRole}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
