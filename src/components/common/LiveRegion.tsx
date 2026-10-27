"use client";

import React, { useEffect, useState } from "react";

interface LiveRegionProps {
  message: string;
}

/**
 * LiveRegion: Announces stage shifts, role changes, and auth notifications
 * to screen-readers politely without visual intrusion.
 */
export const LiveRegion: React.FC<LiveRegionProps> = ({ message }) => {
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (message) {
      setAnnouncement(message);
    }
  }, [message]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only select-none"
    >
      {announcement}
    </div>
  );
};
