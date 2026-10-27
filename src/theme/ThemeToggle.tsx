"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "./useTheme";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = "" }) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`relative inline-flex items-center justify-center w-8 h-8 rounded-[6px] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-violet)] ${className}`}
    >
      {/* Fallback before hydration to prevent mismatch */}
      {!mounted ? (
        <span className="w-4 h-4 block opacity-50" aria-hidden="true" />
      ) : isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-200" aria-hidden="true" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-200" aria-hidden="true" />
      )}
      <span className="sr-only">{label}</span>
    </button>
  );
};
