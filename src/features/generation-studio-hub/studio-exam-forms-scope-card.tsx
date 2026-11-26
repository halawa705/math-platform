"use client";

/**
 * @file studio-exam-forms-scope-card.tsx
 * @description بطاقة ذرية لاختيار الغرض من النماذج فقط (اختبار شهر / نهاية ترم / مراجعة بنماذج)،
 * مع عرض النطاق النشط الموروث من شريط «النطاق والدروس المستهدفة» العلوي دون تكرار قوائم الشيك بوكس.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 70 سطراً).
 */

import React from "react";
import type { ExamFormsScopeKind } from "@/core/ssot/studio-state-persistence-ssot";

export const MODULE_ID_STUDIO_EXAM_FORMS_SCOPE_CARD = "studio_exam_forms_scope_card" as const;

export interface StudioExamFormsScopeCardProps {
  readonly scopeKind: ExamFormsScopeKind;
  readonly activeScopeSummaryAr: string;
  readonly onSelectScopeKind: (kind: ExamFormsScopeKind) => void;
}

const SCOPE_OPTIONS: readonly { readonly id: ExamFormsScopeKind; readonly label: string }[] = [
  { id: "monthly_exam", label: "اختبار شهر" },
  { id: "end_of_term", label: "نهاية ترم" },
  { id: "custom_units_review", label: "مراجعة بنماذج" },
];

export default function StudioExamFormsScopeCard({
  scopeKind,
  activeScopeSummaryAr,
  onSelectScopeKind,
}: StudioExamFormsScopeCardProps) {
  return (
    <div className="space-y-1.5 pb-1">
      <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 block">
        🎯 نوع النماذج:
      </span>
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900">
        {SCOPE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelectScopeKind(opt.id)}
            className={`min-h-[44px] px-2 rounded-xl text-xs font-black cursor-pointer transition-all ${
              scopeKind === opt.id
                ? "bg-white dark:bg-slate-800 text-indigo-950 dark:text-teal-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {activeScopeSummaryAr && (
        <div className="px-2.5 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate">
          📌 النطاق المختار: <span className="text-indigo-900 dark:text-teal-300">{activeScopeSummaryAr}</span>
        </div>
      )}
    </div>
  );
}
