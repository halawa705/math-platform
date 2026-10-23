"use client";

/**
 * @file studio-context-ribbon-bar.tsx
 * @description شريط السياق المدمج لاختيار (الصف الدراسي -> الفرع الرياضي -> الوحدة -> الدرس)
 * مربوط مباشرة بمستكشف المنهج الحي (`loadActiveCurriculumUnitsSSOT` في `curriculum-hierarchy-ssot.ts`)
 * و `math-branches-ssot.ts`.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 150 سطراً).
 */

import React, { useEffect, useState } from "react";
import {
  EGYPTIAN_MATH_GRADES_SSOT,
  loadActiveCurriculumUnitsSSOT,
  type CurriculumUnitNode,
} from "@/core/ssot/curriculum-hierarchy-ssot";
import {
  ALL_MATH_BRANCHES_LIST,
  type MathBranchId,
} from "@/core/ssot/math-branches-ssot";

export const MODULE_ID_STUDIO_CONTEXT_RIBBON_BAR =
  "studio_context_ribbon_bar" as const;

export interface StudioContextRibbonBarProps {
  readonly selectedGradeId: string;
  readonly selectedBranchId: MathBranchId;
  readonly selectedUnitTitle?: string;
  readonly selectedLessonTitle: string;
  readonly onChangeGrade: (gradeId: string) => void;
  readonly onChangeBranch: (branchId: MathBranchId) => void;
  readonly onChangeUnitTitle?: (unitTitle: string) => void;
  readonly onChangeLessonTitle: (lessonTitle: string) => void;
}

export default function StudioContextRibbonBar({
  selectedGradeId,
  selectedBranchId,
  selectedUnitTitle,
  selectedLessonTitle,
  onChangeGrade,
  onChangeBranch,
  onChangeUnitTitle,
  onChangeLessonTitle,
}: StudioContextRibbonBarProps) {
  const [units, setUnits] = useState<readonly CurriculumUnitNode[]>([]);

  useEffect(() => {
    const loaded = loadActiveCurriculumUnitsSSOT(selectedGradeId);
    setUnits(loaded);
  }, [selectedGradeId]);

  const activeUnit =
    units.find((u) => u.titleArabic === selectedUnitTitle) ||
    units.find((u) => u.branchId === selectedBranchId) ||
    units[0];

  const lessonsList = activeUnit?.lessons || [];

  return (
    <section
      aria-label="سياق الصف والوحدة والدرس من مستكشف المنهج"
      className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
    >
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
        {/* ١. الصف الدراسي */}
        <div>
          <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 mb-1">
            ١. الصف الدراسي (SSOT):
          </label>
          <select
            value={selectedGradeId}
            onChange={(e) => onChangeGrade(e.target.value)}
            className="w-full min-h-[42px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black text-slate-900 dark:text-white"
          >
            {EGYPTIAN_MATH_GRADES_SSOT.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nameArabic}
              </option>
            ))}
          </select>
        </div>

        {/* ٢. الفرع الرياضي */}
        <div>
          <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 mb-1">
            ٢. الفرع الرياضي:
          </label>
          <select
            value={selectedBranchId}
            onChange={(e) => onChangeBranch(e.target.value as MathBranchId)}
            className="w-full min-h-[42px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black text-slate-900 dark:text-white"
          >
            {ALL_MATH_BRANCHES_LIST.map((b) => (
              <option key={b.id} value={b.id}>
                {b.symbolBadge} {b.nameArabic}
              </option>
            ))}
          </select>
        </div>

        {/* ٣. الوحدة الدراسية من مستكشف المنهج */}
        <div>
          <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 mb-1">
            ٣. الوحدة من مستكشف المنهج:
          </label>
          <select
            value={activeUnit?.titleArabic || ""}
            onChange={(e) => {
              const pickedUnit = units.find(
                (u) => u.titleArabic === e.target.value
              );
              onChangeUnitTitle?.(e.target.value);
              if (pickedUnit) {
                onChangeBranch(pickedUnit.branchId);
                if (pickedUnit.lessons[0]) {
                  onChangeLessonTitle(pickedUnit.lessons[0].titleArabic);
                }
              }
            }}
            className="w-full min-h-[42px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black text-slate-900 dark:text-white"
          >
            {units.map((u) => (
              <option key={u.id} value={u.titleArabic}>
                {u.titleArabic}
              </option>
            ))}
          </select>
        </div>

        {/* ٤. الدرس المستهدف */}
        <div>
          <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 mb-1">
            ٤. الدرس المستهدف:
          </label>
          <select
            value={selectedLessonTitle}
            onChange={(e) => onChangeLessonTitle(e.target.value)}
            className="w-full min-h-[42px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black text-slate-900 dark:text-white"
          >
            {lessonsList.map((lesson) => (
              <option key={lesson.id} value={lesson.titleArabic}>
                {lesson.orderIndex}. {lesson.titleArabic}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
