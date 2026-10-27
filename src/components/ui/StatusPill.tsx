import React from "react";

export type PillVariant =
  | "success"
  | "pending"
  | "danger"
  | "info"
  | "purple"
  | "orange"
  | "neutral";

export interface StatusPillProps {
  variant?: PillVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<PillVariant, string> = {
  success:
    "text-[var(--color-status-green)] bg-[var(--color-status-green-bg)] border-[var(--color-status-green-border)]",
  pending:
    "text-[var(--color-status-amber)] bg-[var(--color-status-amber-bg)] border-[var(--color-status-amber-border)]",
  danger:
    "text-[var(--color-status-red)] bg-[var(--color-status-red-bg)] border-[var(--color-status-red-border)]",
  info:
    "text-[var(--color-status-blue)] bg-[var(--color-status-blue-bg)] border-[var(--color-status-blue-border)]",
  purple:
    "text-[var(--color-status-purple)] bg-[var(--color-status-purple-bg)] border-[var(--color-status-purple-border)]",
  orange:
    "text-[var(--color-status-orange)] bg-[var(--color-status-orange-bg)] border-[var(--color-status-orange-border)]",
  neutral:
    "text-[var(--color-text-muted)] bg-white/5 border-[var(--color-border-subtle)]",
};

export const StatusPill: React.FC<StatusPillProps> = ({
  variant = "info",
  children,
  className = "",
}) => {
  return (
    <span
      className={`inline-flex items-center text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border leading-normal select-none ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
