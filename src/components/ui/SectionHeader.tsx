import React from "react";

export interface SectionHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  action,
  className = "",
}) => {
  return (
    <div className={`flex flex-wrap justify-between items-center gap-3 mb-4 ${className}`}>
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
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};
