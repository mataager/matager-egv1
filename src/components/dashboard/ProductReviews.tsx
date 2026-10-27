"use client";

import React, { useState } from "react";
import { useDashboardLanguage } from "@/lib/i18n";
import { StatusPill } from "@/components/ui/StatusPill";

export const ProductReviews: React.FC = () => {
  const { t } = useDashboardLanguage();
  const [search, setSearch] = useState("");

  const reviews = [
    {
      id: "r1",
      product: t.productReviews.sampleProduct,
      author: t.productReviews.sampleAuthor,
      rating: t.productReviews.sampleRating,
      comment: t.productReviews.sampleComment,
      status: t.productReviews.sampleStatus,
      image: "https://static.nike.com/a/images/t_web_pw_592_v2/f_auto/pysqd15onjaeugu8mh4l/AIR+MAX+270.png",
    },
  ];

  const filtered = reviews.filter(
    (r) =>
      r.product.toLowerCase().includes(search.toLowerCase()) ||
      r.author.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="glass-panel rounded-[20px] bg-[var(--color-glass-card-bg)] border border-[var(--color-glass-card-border)] shadow-[var(--shadow-glass-card)] overflow-hidden transition-all duration-200 hover:-translate-y-[1px]">
      <input
        type="checkbox"
        id="toggle-product-reviews"
        className="peer/rev hidden"
        aria-hidden="true"
      />

      <div className="p-4 sm:p-5 border-b border-[var(--color-border-subtle)] flex justify-between items-center">
        <div>
          <h3 className="text-sm sm:text-base font-bold font-heading text-[var(--color-text-primary)]">
            {t.productReviews.title}
          </h3>
          <p className="text-[11px] font-subtitle text-[var(--color-text-muted)] mt-0.5">
            {t.productReviews.subtitle}
          </p>
        </div>

        <label
          htmlFor="toggle-product-reviews"
          className="text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors group cursor-pointer select-none peer-checked/rev:[&_.rev-chevron]:rotate-180"
        >
          <span className="tracking-wide">{t.productReviews.showDetails}</span>
          <i className="bi bi-chevron-down transition-transform duration-300 group-hover:text-[var(--color-text-primary)] rev-chevron text-[10px]" />
        </label>
      </div>

      <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out peer-checked/rev:max-h-[300px] bg-white/[0.01]">
        <div className="p-4 sm:p-5 space-y-3.5">
          <div className="relative w-full max-w-[220px]">
            <i className="bi bi-search absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.productReviews.searchPlaceholder}
              className="w-full bg-[var(--input-bg-gradient)] border border-[var(--input-border-color)] rounded-lg py-1.5 pl-8 pr-3 rtl:pl-3 rtl:pr-8 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary-light)] font-ui"
            />
          </div>

          <div className="max-h-[160px] overflow-y-auto pr-1 custom-scrollbar space-y-2">
            {filtered.map((rev) => (
              <div
                key={rev.id}
                className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 text-xs border-b border-[var(--color-border-subtle)]/40 pb-2.5 last:border-b-0 hover:bg-white/[0.02] p-2 rounded-xl transition-colors"
              >
                <div className="w-full sm:w-1/4 flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-white/5 border border-[var(--color-border-subtle)] overflow-hidden shrink-0">
                    <img
                      src={rev.image}
                      alt={rev.product}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-bold text-[var(--color-text-primary)] truncate font-ui">
                    {rev.product}
                  </span>
                </div>

                <span className="text-[var(--color-text-secondary)] font-ui w-24">
                  {rev.author}
                </span>

                <span className="text-[var(--color-status-amber)] text-xs tracking-wider">
                  {rev.rating}
                </span>

                <span className="text-[var(--color-text-secondary)] italic truncate flex-1 font-subtitle">
                  {rev.comment}
                </span>

                <span className="text-right rtl:text-left text-[var(--color-primary-light)] font-bold text-[10px] uppercase tracking-wider font-ui shrink-0">
                  {rev.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
