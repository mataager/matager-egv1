"use client";

import { useEffect } from "react";

/**
 * Hook to inject dynamic viewport height tokens (--vh, --svh, --dvh)
 * on devices where native CSS units need assistance, preventing mobile Safari/Chrome address-bar jumps.
 */
export function useViewportHeight(): void {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const setViewportProperties = () => {
      // 1% of inner height
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);

      // Determine orientation & screen metrics
      const isLandscape = window.matchMedia("(orientation: landscape)").matches;
      document.documentElement.dataset.orientation = isLandscape
        ? "landscape"
        : "portrait";
    };

    setViewportProperties();

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      // Debounce slightly to prevent jump while scrolling on mobile
      resizeTimer = setTimeout(setViewportProperties, 100);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", setViewportProperties, {
      passive: true,
    });

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", setViewportProperties);
    };
  }, []);
}
