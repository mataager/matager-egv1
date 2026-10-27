"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/i18n";
import { ThemeToggle } from "@/theme";
import { LanguageSwitcher } from "@/i18n";
import { MatagerLogo } from "@/components/brand/MatagerLogo";
import { Menu, X, ChevronDown, Compass, Sparkles } from "lucide-react";
import { APP_ROUTES } from "@/config/routes";

interface LandingHeaderProps {
  onOpenAuth: (mode?: "signin" | "signup", role?: "owner" | "employee") => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ onOpenAuth }) => {
  const { t, dir, locale } = useLanguage();
  const isAr = locale === "ar";

  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("top");
  const lastScrollY = useRef(0);
  const [isScrollingDown, setIsScrollingDown] = useState(false);

  // Monitor scroll position & direction
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 40);

      if (currentScrollY > lastScrollY.current && currentScrollY > 120) {
        setIsScrollingDown(true);
      } else {
        setIsScrollingDown(false);
      }
      lastScrollY.current = currentScrollY;

      // Detect active section for indicator
      const sections = ["pillars", "how-it-works", "ecosystem", "metrics", "integrations"];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 180 && rect.bottom >= 180) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
      if (currentScrollY < 200) {
        setActiveSection("top");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { id: "pillars", label: t.nav.pillars, href: "#pillars" },
    { id: "how-it-works", label: t.nav.howItWorks, href: "#how-it-works" },
    { id: "ecosystem", label: t.nav.ecosystem, href: "#ecosystem" },
    { id: "metrics", label: t.nav.metrics, href: "#metrics" },
    { id: "integrations", label: t.nav.integrations, href: "#integrations" },
  ];

  // Smooth Auto-Scroll Handler with Navbar Height Offset
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setIsManuallyExpanded(false);

    const targetId = href.replace("#", "");
    if (targetId === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // State: Smart hidden or increased height (hydrated safely)
  const isScrolled = mounted && scrolled;
  const isCompactCollapsed = isScrolled && isScrollingDown && !isHovered && !isManuallyExpanded;
  const isExpandedHeight = isHovered || isManuallyExpanded || !isScrolled;

  return (
    <header
      suppressHydrationWarning

      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`}
    >
      <div
        suppressHydrationWarning
        className={`max-w-[1240px] mx-auto px-4 sm:px-6 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isScrolled ? "pt-2.5 sm:pt-3" : "pt-4"
          }`}
      >
        <div
          suppressHydrationWarning
          className={`relative rounded-[16px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] border ${isScrolled
            ? isExpandedHeight
              ? "bg-[var(--color-canvas)]/92 backdrop-blur-xl border-[var(--color-border)] shadow-2xl py-4 sm:py-5 px-5 sm:px-6 ring-1 ring-white/5"
              : "bg-[var(--color-canvas)]/80 backdrop-blur-md border-[var(--color-border-subtle)] shadow-lg py-2.5 px-4"
            : "bg-transparent border-transparent py-2"
            }`}
        >
          <div className="flex items-center justify-between gap-4">
            {/* Left: Brand Logo & Wordmark */}
            <a
              href="#top"
              onClick={(e) => handleNavClick(e, "#top")}
              className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-dark)] rounded-[6px] shrink-0"
              aria-label={t.hero.brand}
            >
              <MatagerLogo size="sm" showWordmark={true} animated={false} />
            </a>

            {/* Center: Desktop Nav Links with Zone Auto-Scroll & Active Glow */}


            {/* Right: Controls & Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Smart Expand/Collapse Toggle Button for Scrolled State */}
              {isScrolled && (
                <button
                  type="button"
                  onClick={() => setIsManuallyExpanded(!isManuallyExpanded)}
                  title={isExpandedHeight ? (isAr ? "طي القائمة" : "Collapse nav") : (isAr ? "توسيع القائمة" : "Expand nav")}
                  aria-label="Toggle increased height navigation"
                  className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] border text-xs font-ui transition-all ${isExpandedHeight
                    ? "bg-[rgba(4,121,232,0.12)] border-[var(--color-primary-dark)]/40 text-[var(--color-primary-light)]"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-white"
                    }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpandedHeight ? "rotate-180" : ""}`} />
                </button>
              )}



              {/* Ghost "Log in" action */}
              <button
                type="button"
                onClick={() => onOpenAuth("signin", "owner")}
                className="hidden sm:inline-flex btn-ghost-action text-[13px] font-ui py-1.5 px-3"
              >
                {t.nav.signIn}
              </button>

              {/* Primary Pill CTA (UNTOUCHED Primary Button) */}
              <button
                type="button"
                onClick={() => onOpenAuth("signup", "owner")}
                className="btn-primary-pill text-[13px] sm:text-[14px] font-ui py-2 sm:py-2.5 px-3.5 sm:px-5"
              >
                <span>{t.nav.getStarted}</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-[8px] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface)]"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown with Zone Auto-Scroll */}
          {mobileMenuOpen && (
            <div className="md:hidden pt-4 pb-2 mt-3 border-t border-[var(--color-border-subtle)] space-y-2 font-ui animate-in fade-in slide-in-from-top-2 duration-200">
              <nav className="flex flex-col space-y-1">
                {navLinks.map((link) => {
                  const isActive = activeSection === link.id;
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className={`text-[14px] py-2 px-3 rounded-[8px] flex items-center justify-between ${isActive
                        ? "bg-[rgba(4,121,232,0.12)] text-[var(--color-primary-light)] font-medium border border-[var(--color-primary-dark)]/30"
                        : "text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-surface)]"
                        }`}
                    >
                      <span>{link.label}</span>
                      {isActive && <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary-light)]" />}
                    </a>
                  );
                })}
              </nav>

              <div className="pt-3 border-t border-[var(--color-border-subtle)] flex flex-col gap-2">
                <a
                  href={APP_ROUTES.dashboard}
                  className="w-full text-center py-2.5 rounded-[8px] border border-[var(--color-border)] text-[14px] font-ui text-[var(--color-text-primary)] bg-[var(--color-surface)] flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
                >
                  <i className="bi bi-speedometer2 text-sm text-[var(--color-primary-light)]" />
                  <span>{isAr ? "لوحة التحكم" : "Merchant Dashboard"}</span>
                </a>

                <a
                  href={APP_ROUTES.cashier}
                  target="_blank"
                  className="w-full text-center py-2.5 rounded-[8px] border border-emerald-500/30 text-[14px] font-ui text-emerald-300 bg-emerald-500/10 flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-colors"
                >
                  <i className="bi bi-shop text-sm text-emerald-400" />
                  <span>{isAr ? "نظام كاشير نقاط البيع" : "POS Cashier Terminal"}</span>
                </a>

                <a
                  href={APP_ROUTES.superAdmin}
                  className="w-full text-center py-2.5 rounded-[8px] border border-red-500/30 text-[14px] font-ui text-red-300 bg-red-500/10 flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
                >
                  <i className="bi bi-shield-lock text-sm text-red-400" />
                  <span>{isAr ? "لوحة الإدارة العامة (سوبر أدمن)" : "Super Admin Control"}</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth("signin", "owner");
                  }}
                  className="w-full text-center py-2.5 rounded-[8px] border border-[var(--color-border)] text-[14px] font-ui text-[var(--color-text-primary)] bg-[var(--color-surface)]"
                >
                  {t.nav.signIn}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

