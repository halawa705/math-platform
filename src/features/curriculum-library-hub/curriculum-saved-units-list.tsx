"use client";

/**
 * @file curriculum-saved-units-list.tsx
 * @description قائمة الوحدات والدروس المعتمدة لصف معيّن بتصميم هادئ: وحدة واحدة في كل سطر قابلة للفتح لعرض دروسها ومفاهيمها.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import CalmEmptyStateCard from "@/components/global-ui/calm-empty-state-card";
import type { CurriculumUnitNode } from "@/core/ssot/curriculum-hierarchy-ssot";

export const MODULE_ID_CURRICULUM_SAVED_UNITS_LIST = "curriculum_saved_units_list" as const;

export interface CurriculumSavedUnitsListProps {
  readonly units: readonly CurriculumUnitNode[];
  readonly gradeNameAr: string;
}

export default function CurriculumSavedUnitsList({
  units,
  gradeNameAr,
}: CurriculumSavedUnitsListProps) {
  if (units.length === 0) {
    return (
      <CalmEmptyStateCard
        icon="📂"
        titleAr={`لا توجد وحدات محفوظة بعد (${gradeNameAr})`}
        hintAr="انسخ البرومبت وافتح NotebookLM، ثم الصق الرد واعتمده لتظهر وحداتك ودروسك في كامل المنصة."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {units.map((unit) => (
        <li
          key={unit.id}
          className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <details className="group">
            <summary className="min-h-[52px] px-4 py-2.5 flex items-center justify-between gap-3 cursor-pointer list-none">
              <span className="min-w-0">
                <span className="block text-sm font-black truncate">{unit.titleArabic}</span>
                <span className="block text-[11px] font-bold text-slate-500">
                  الوحدة {unit.orderIndex} • {unit.branchNameArabic} • {unit.lessons.length} دروس
                </span>
              </span>
              <span className="text-slate-400 text-xs shrink-0 transition-transform group-open:rotate-180">
                ▾
              </span>
            </summary>
            <ol className="px-4 pb-3 pt-1 space-y-2 border-t border-slate-100 dark:border-slate-800">
              {unit.lessons.map((lesson) => (
                <li key={lesson.id} className="text-xs">
                  <div className="font-black">
                    {lesson.orderIndex}. {lesson.titleArabic}
                  </div>
                  {lesson.coreConcepts.length > 0 && (
                    <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                      {lesson.coreConcepts.join(" • ")}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </details>
        </li>
      ))}
    </ul>
  );
}
