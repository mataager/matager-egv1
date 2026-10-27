"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MatagerLogo } from "@/components/brand/MatagerLogo";
import { SITE_CONFIG } from "@/config/site";
import { ArrowUpRight, Menu, X } from "lucide-react";

interface StickyNavProps {
  isVisible: boolean;
  onOpenAuth: (mode?: "signin" | "signup", role?: "owner" | "employee") => void;
}

export const StickyNav: React.FC<StickyNavProps> = ({ isVisible, onOpenAuth }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        aria-label="Main Navigation"
        className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 pt-3 sm:pt-4 pointer-events-none"
      >
        <div
          className={`max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-5 py-2.5 rounded-pill pointer-events-auto transition-all duration-300 ${
            scrolled
              ? "bg-[var(--color-surface)]/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/60"
              : "bg-white/[0.03] backdrop-blur-md border border-white/5"
          }`}
        >
          {/* Logo link */}
          <a
            href="#top"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-full p-1"
            aria-label="Matager Home"
          >
            <MatagerLogo size="sm" showWordmark={true} animated={false} />
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            {SITE_CONFIG.navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded px-1.5 py-0.5"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onOpenAuth("signin", "owner")}
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth("signup", "owner")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-black bg-white hover:bg-slate-200 px-3.5 py-1.5 rounded-full transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue active:scale-95"
            >
              <span>Get Started</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-20 z-40 bg-[var(--color-surface)]/95 border border-white/10 backdrop-blur-2xl rounded-2xl p-5 md:hidden shadow-2xl"
          >
            <div className="flex flex-col gap-3">
              {SITE_CONFIG.navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-slate-200 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth("signin", "owner");
                  }}
                  className="w-full text-center py-2.5 text-xs font-semibold text-white bg-white/5 rounded-xl"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth("signup", "owner");
                  }}
                  className="w-full text-center py-2.5 text-xs font-semibold text-black bg-white rounded-xl"
                >
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
