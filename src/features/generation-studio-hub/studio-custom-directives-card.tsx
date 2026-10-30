"use client";

/**
 * @file studio-custom-directives-card.tsx
 * @description بطاقة إدخال توجيهات المعلم الخاصة بالذكاء الاصطناعي في الاستوديو مع حفظها في البرومبت.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 80 سطراً).
 */

import StudioCollapsibleSectionCard from "./studio-collapsible-section-card";

export const MODULE_ID_STUDIO_CUSTOM_DIRECTIVES_CARD =
  "studio_custom_directives_card" as const;

export interface StudioCustomDirectivesCardProps {
  readonly customDirectives: string;
  readonly onChangeDirectives: (text: string) => void;
  readonly defaultOpen?: boolean;
}

export default function StudioCustomDirectivesCard({
  customDirectives,
  onChangeDirectives,
  defaultOpen,
}: StudioCustomDirectivesCardProps) {
  const summary = customDirectives.trim()
    ? `توجيه مخصص: "${customDirectives.trim().slice(0, 42)}..."`
    : "لا توجد توجيهات إضافية (افتراضي)";

  return (
    <StudioCollapsibleSectionCard
      icon="💡"
      titleAr="توجيهات المعلم الخاصة لـ NotebookLM (اختياري)"
      summaryAr={summary}
      defaultOpen={defaultOpen ?? customDirectives.trim().length > 0}
    >
      <div className="space-y-2 pt-2">
        <textarea
          rows={3}
          value={customDirectives}
          onChange={(e) => onChangeDirectives(e.target.value)}
          placeholder="مثال: اشرح كل شكل هندسي مطلوب بدقة وتفصيل (الأضلاع والزوايا والتوازي والتناظر) حتى يستطيع النظام رسم شكل مطابق تماماً..."
          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900 dark:text-white"
        />
        <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-500">
          <span>تُدمج هذه التوجيهات تلقائياً في البرومبت للالتزام بها.</span>
          {customDirectives.trim().length > 0 && (
            <button
              type="button"
              onClick={() => onChangeDirectives("")}
              className="text-rose-600 hover:underline cursor-pointer"
            >
              مسح التوجيه
            </button>
          )}
        </div>
      </div>
    </StudioCollapsibleSectionCard>
  );
}
