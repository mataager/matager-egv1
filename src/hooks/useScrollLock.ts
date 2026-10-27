"use client";

import { useEffect } from "react";

/**
 * useScrollLock: strictly locks body scrolling on first paint until the user
 * answers the gate choice ("Customer" vs "Owner / Employee").
 * Prevents horizontal and vertical jitter with zero layout shift.
 */
export function useScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalOverscroll = document.body.style.overscrollBehavior;

    if (isLocked) {
      // Calculate scrollbar width to prevent layout shift
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "none";

      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
    } else {
      document.documentElement.style.overflow = originalHtmlOverflow || "";
      document.body.style.overflow = originalOverflow || "";
      document.body.style.overscrollBehavior = originalOverscroll || "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
      document.body.style.paddingRight = "";
    };
  }, [isLocked]);
}
