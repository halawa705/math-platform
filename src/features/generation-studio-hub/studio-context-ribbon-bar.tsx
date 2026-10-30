"use client";

/**
 * @file studio-context-ribbon-bar.tsx
 * @description شريط السياق الهادئ لاختيار (الصف الدراسي النشط -> الوحدة الحقيقية -> الدرس الحقيقي)
 * مربوط حصرياً بمستكشف المنهج (`loadActiveCurriculumUnitsSSOT`) وبالصفوف المفعلة (`loadEnabledGradesSSOT`).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 150 سطراً).
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  loadActiveCurriculumUnitsSSOT,
  type CurriculumUnitNode,
} from "@/core/ssot/curriculum-hierarchy-ssot";
import { loadEnabledGradesSSOT } from "@/core/ssot/teacher-identity-ssot";
import type { MathBranchId } from "@/core/ssot/math-branches-ssot";

export const MODULE_ID_STUDIO_CONTEXT_RIBBON_BAR = "studio_context_ribbon_bar" as const;

export interface StudioContextRibbonBarProps {
  readonly selectedGradeId: string;
  readonly selectedBranchId: MathBranchId;
  readonly selectedUnitTitle?: string;
  readonly selectedLessonTitle: string;
  readonly selectedLessonOrder?: number;
  readonly onChangeGrade: (gradeId: string) => void;
  readonly onChangeBranch: (branchId: MathBranchId) => void;
  readonly onChangeUnitTitle?: (unitTitle: string) => void;
  readonly onChangeLessonTitle: (lessonTitle: string) => void;
  readonly onChangeLessonOrder?: (order: number) => void;
}

export default function StudioContextRibbonBar({
  selectedGradeId,
  selectedUnitTitle,
  selectedLessonTitle,
  selectedLessonOrder = 15,
  onChangeGrade,
  onChangeBranch,
  onChangeUnitTitle,
  onChangeLessonTitle,
  onChangeLessonOrder,
}: StudioContextRibbonBarProps) {
  const [enabledGrades, setEnabledGrades] = useState(() => loadEnabledGradesSSOT());
  const [units, setUnits] = useState<readonly CurriculumUnitNode[]>([]);

  useEffect(() => {
    setEnabledGrades(loadEnabledGradesSSOT());
    const loaded = loadActiveCurriculumUnitsSSOT(selectedGradeId);
    setUnits(loaded);
    const firstUnit = loaded[0];
    if (firstUnit) {
      onChangeUnitTitle?.(firstUnit.titleArabic);
      onChangeBranch(firstUnit.branchId);
      if (firstUnit.lessons[0]) onChangeLessonTitle(firstUnit.lessons[0].titleArabic);
    }
  }, [selectedGradeId]);

  const activeUnit = units.find((u) => u.titleArabic === selectedUnitTitle) || units[0];
  const lessonsList = activeUnit?.lessons || [];

  return (
    <section aria-label="سياق الصف والوحدة والدرس من مستكشف المنهج" className="space-y-3 pt-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="col-span-1">
          <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1">الصف الدراسي</label>
          <select
            value={selectedGradeId}
            onChange={(e) => onChangeGrade(e.target.value)}
            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black text-slate-900 dark:text-white"
          >
            {enabledGrades.map((g) => (
              <option key={g.id} value={g.id}>{g.nameArabic}</option>
            ))}
          </select>
        </div>

        <div className="col-span-1">
          <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1">رقم الدرس</label>
          <input
            type="number"
            min={1}
            max={60}
            value={selectedLessonOrder}
            onChange={(e) => onChangeLessonOrder?.(Math.max(1, parseInt(e.target.value || "1", 10)))}
            className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black text-center"
          />
        </div>

        <div className="col-span-1">
          <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1 truncate">
            الوحدة {activeUnit ? `(${activeUnit.branchNameArabic})` : ""}:
          </label>
          {units.length > 0 ? (
            <select
              value={activeUnit?.titleArabic || ""}
              onChange={(e) => {
                const pickedUnit = units.find((u) => u.titleArabic === e.target.value);
                onChangeUnitTitle?.(e.target.value);
                if (pickedUnit) {
                  onChangeBranch(pickedUnit.branchId);
                  if (pickedUnit.lessons[0]) {
                    onChangeLessonTitle(pickedUnit.lessons[0].titleArabic);
                    onChangeLessonOrder?.(pickedUnit.lessons[0].orderIndex);
                  }
                }
              }}
              className="w-full min-h-[44px] px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black text-slate-900 dark:text-white"
            >
              {units.map((u) => (
                <option key={u.id} value={u.titleArabic}>[{u.branchNameArabic}] {u.titleArabic}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={selectedUnitTitle || ""}
              onChange={(e) => onChangeUnitTitle?.(e.target.value)}
              placeholder="الوحدة الثالثة..."
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black"
            />
          )}
        </div>

        <div className="col-span-1">
          <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1 truncate">اسم الدرس</label>
          {lessonsList.length > 0 ? (
            <select
              value={selectedLessonTitle}
              onChange={(e) => {
                const pickedLesson = lessonsList.find((l) => l.titleArabic === e.target.value);
                onChangeLessonTitle(e.target.value);
                if (pickedLesson) onChangeLessonOrder?.(pickedLesson.orderIndex);
              }}
              className="w-full min-h-[44px] px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black text-slate-900 dark:text-white"
            >
              {lessonsList.map((lesson) => (
                <option key={lesson.id} value={lesson.titleArabic}>{lesson.orderIndex}. {lesson.titleArabic}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={selectedLessonTitle}
              onChange={(e) => onChangeLessonTitle(e.target.value)}
              placeholder="تشابه المضلعات..."
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black"
            />
          )}
        </div>
      </div>

      {units.length === 0 && (
        <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
          <span>💡 لم تقم بتقسيم منهج هذا الصف بعد في مستكشف المنهج.</span>
          <Link href="/library" className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black">
            🧭 انتقل لمستكشف المنهج لتقسيم هذا الصف الآن ↗
          </Link>
        </div>
      )}
    </section>
  );
}
