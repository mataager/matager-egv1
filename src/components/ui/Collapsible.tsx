import React from "react";

export interface CollapsibleProps {
  id: string;
  peerName: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  headerAction?: React.ReactNode;
  toggleText?: string;
  defaultOpen?: boolean;
  maxHeight?: string; // e.g. "max-h-[300px]", "max-h-[600px]", "max-h-[900px]"
  children: React.ReactNode;
  className?: string;
}

export const Collapsible: React.FC<CollapsibleProps> = ({
  id,
  peerName,
  title,
  subtitle,
  badge,
  headerAction,
  toggleText = "Show Details",
  defaultOpen = false,
  maxHeight = "peer-checked/collapsible:max-h-[800px]",
  children,
  className = "",
}) => {
  return (
    <div
      className={`glass-panel rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] overflow-hidden transition-all duration-200 hover:-translate-y-[1px] ${className}`}
    >
      {/* Pure-CSS Checkbox Tracker */}
      <input
        type="checkbox"
        id={id}
        defaultChecked={defaultOpen}
        className={`peer/${peerName} hidden`}
        aria-hidden="true"
      />

      {/* Header Strip */}
      <div className="p-4 sm:p-5 border-b border-[var(--color-border-subtle)] flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2.5">
          {badge}
          <div>
            <h3 className="text-sm sm:text-base font-bold font-heading text-[var(--color-text-primary)] tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[11px] font-subtitle text-[var(--color-text-muted)] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {headerAction}
          <label
            htmlFor={id}
            className={`text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors group cursor-pointer select-none peer-checked/${peerName}:[&_.collapsible-chevron]:rotate-180`}
          >
            <span className="tracking-wide">{toggleText}</span>
            <i className="bi bi-chevron-down transition-transform duration-300 group-hover:text-[var(--color-text-primary)] collapsible-chevron text-[10px]" />
          </label>
        </div>
      </div>

      {/* Pure-CSS Animated Drawer */}
      <div
        className={`max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/${peerName}:max-h-[1400px] bg-white/[0.01]`}
      >
        {children}
      </div>
    </div>
  );
};
