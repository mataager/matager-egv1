"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { Locale, Direction, TranslationDictionary, translations } from "./translations";

interface LanguageContextValue {
  locale: Locale;
  dir: Direction;
  isSwitching: boolean;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const LOCALE_STORAGE_KEY = "matager-locale";

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  defaultLocale?: Locale;
}> = ({ children, defaultLocale = "en" }) => {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [isSwitching, setIsSwitching] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
      if (stored === "en" || stored === "ar") {
        setLocaleState(stored);
      }
    } catch {
      // Storage unavailable
    }
    setMounted(true);
  }, []);

  const dir: Direction = locale === "ar" ? "rtl" : "ltr";

  // Sync with document element
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.setAttribute("lang", locale);
    root.setAttribute("dir", dir);

    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // ignore
    }
  }, [locale, dir, mounted]);

  const switchWithAnimation = useCallback((targetLocale: Locale) => {
    if (targetLocale === locale) return;
    setIsSwitching(true);

    // Phase 1: Begin transition out
    const timeout1 = setTimeout(() => {
      setLocaleState(targetLocale);

      // Phase 2: Settle and reveal
      const timeout2 = setTimeout(() => {
        setIsSwitching(false);
      }, 320);

      return () => clearTimeout(timeout2);
    }, 180);

    return () => clearTimeout(timeout1);
  }, [locale]);

  const setLocale = useCallback(
    (newLocale: Locale) => {
      switchWithAnimation(newLocale);
    },
    [switchWithAnimation]
  );

  const toggleLocale = useCallback(() => {
    const nextLocale = locale === "en" ? "ar" : "en";
    switchWithAnimation(nextLocale);
  }, [locale, switchWithAnimation]);

  const t = useMemo(() => translations[locale], [locale]);

  const value = useMemo(
    () => ({
      locale,
      dir,
      isSwitching,
      setLocale,
      toggleLocale,
      t,
    }),
    [locale, dir, isSwitching, setLocale, toggleLocale, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a <LanguageProvider />");
  }
  return context;
}
