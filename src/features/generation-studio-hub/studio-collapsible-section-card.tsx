"use client";

/**
 * @file studio-collapsible-section-card.tsx
 * @description بطاقة قسم قابلة للطي (Accordion) هادئة وصديقة للهاتف لإخفاء الإعدادات الثانوية وتقليل الزحام.
 * تُبقي المحتوى محملاً في الصفحة (`hidden`) حتى لا تضيع حالة الحقول عند الطي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import { useState, type ReactNode } from "react";

export const MODULE_ID_STUDIO_COLLAPSIBLE_SECTION_CARD =
  "studio_collapsible_section_card" as const;

export interface StudioCollapsibleSectionCardProps {
  readonly icon: string;
  readonly titleAr: string;
  readonly summaryAr?: string;
  readonly defaultOpen?: boolean;
  readonly children: ReactNode;
}

export default function StudioCollapsibleSectionCard({
  icon,
  titleAr,
  summaryAr,
  defaultOpen = false,
  children,
}: StudioCollapsibleSectionCardProps) {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);

  return (
    <section className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 overflow-hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full min-h-[52px] px-4 py-2.5 flex items-center justify-between gap-3 text-right cursor-pointer"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="text-lg leading-none shrink-0">{icon}</span>
          <span className="min-w-0">
            <span className="block text-sm font-black text-slate-900 dark:text-white">
              {titleAr}
            </span>
            {summaryAr && (
              <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
                {summaryAr}
              </span>
            )}
          </span>
        </span>
        <span
          className={`text-slate-400 text-xs transition-transform shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>
      <div
        className={`${
          isOpen ? "block" : "hidden"
        } px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800`}
      >
        {children}
      </div>
    </section>
  );
}
