"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Theme, ResolvedTheme, ThemeContext } from "./useTheme";
import { THEME_STORAGE_KEY } from "./noFlashScript";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "dark",
}) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");
  const [mounted, setMounted] = useState(false);

  // Determine system theme
  const getSystemTheme = useCallback((): ResolvedTheme => {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }, []);

  // Initialize theme from storage or system
  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (stored === "light" || stored === "dark" || stored === "system") {
        setThemeState(stored);
        setResolvedTheme(stored === "system" ? getSystemTheme() : stored);
      } else {
        setThemeState("dark");
        setResolvedTheme("dark");
      }
    } catch {
      setThemeState("dark");
      setResolvedTheme("dark");
    }
    setMounted(true);
  }, [getSystemTheme]);

  // Apply theme to DOM and persist
  useEffect(() => {
    if (!mounted) return;

    const activeResolved = theme === "system" ? getSystemTheme() : theme;
    setResolvedTheme(activeResolved);

    const root = document.documentElement;
    root.setAttribute("data-theme", activeResolved);
    if (activeResolved === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage unavailable or quota exceeded
    }
  }, [theme, mounted, getSystemTheme]);

  // Listen for OS scheme updates when in system mode
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = () => {
      if (theme === "system") {
        const nextResolved: ResolvedTheme = mediaQuery.matches ? "light" : "dark";
        setResolvedTheme(nextResolved);
        const root = document.documentElement;
        root.setAttribute("data-theme", nextResolved);
        if (nextResolved === "dark") {
          root.classList.add("dark");
          root.classList.remove("light");
        } else {
          root.classList.add("light");
          root.classList.remove("dark");
        }
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const current = prev === "system" ? getSystemTheme() : prev;
      return current === "dark" ? "light" : "dark";
    });
  }, [getSystemTheme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      resolvedTheme,
    }),
    [theme, setTheme, toggleTheme, resolvedTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
