"use client";

import React from "react";
import { GsapScrollManager } from "./GsapScrollManager";

interface SmoothScrollProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export const SmoothScrollProvider: React.FC<SmoothScrollProviderProps> = ({
  children,
}) => {
  return <GsapScrollManager>{children}</GsapScrollManager>;
};
