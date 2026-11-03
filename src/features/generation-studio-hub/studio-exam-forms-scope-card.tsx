"use client";

/**
 * @file studio-exam-forms-scope-card.tsx
 * @description بطاقة ذرية مستقلة لاختيار الغرض من النماذج (شهر / نهاية ترم / مراجعة) ونطاق الوحدات المستهدفة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 75 سطراً).
 */

import React from "react";
import type { ExamFormsScopeKind } from "@/core/ssot/studio-state-persistence-ssot";

export const MODULE_ID_STUDIO_EXAM_FORMS_SCOPE_CARD = "studio_exam_forms_scope_card" as const;

export interface StudioExamFormsScopeCardProps {
  readonly scopeKind: ExamFormsScopeKind;
  readonly scopeDescription: string;
  readonly onSelectScopeKind: (kind: ExamFormsScopeKind) => void;
  readonly onChangeScopeDescription: (desc: string) => void;
}

const SCOPE_OPTIONS: readonly { readonly id: ExamFormsScopeKind; readonly label: string }[] = [
  { id: "monthly_exam", label: "اختبار شهر (وحدات محددة)" },
  { id: "end_of_term", label: "نهاية ترم (كامل المنهج)" },
  { id: "custom_units_review", label: "مراجعة بنماذج (دروس معينة)" },
];

export default function StudioExamFormsScopeCard({
  scopeKind,
  scopeDescription,
  onSelectScopeKind,
  onChangeScopeDescription,
}: StudioExamFormsScopeCardProps) {
  return (
    <div className="space-y-2 pb-1">
      <div className="space-y-1">
        <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">🎯 الغرض من النماذج:</span>
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900">
          {SCOPE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectScopeKind(opt.id)}
              className={`min-h-[40px] px-2 rounded-xl text-[11px] font-black cursor-pointer transition-all ${
                scopeKind === opt.id
                  ? "bg-white dark:bg-slate-800 text-indigo-950 dark:text-teal-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">📖 الوحدات والدروس المستهدفة في النماذج:</span>
        <input
          type="text"
          value={scopeDescription}
          onChange={(e) => onChangeScopeDescription(e.target.value)}
          placeholder="مثال: الوحدة الأولى والثانية (أو اتركها لكامل المنهج)"
          className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
}
