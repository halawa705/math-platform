"use client";

/**
 * @file studio-context-ribbon-bar.tsx
 * @description شريط السياق العام لاستوديو التوليد لاختيار (الصف الدراسي -> الوحدات والدروس بالشيك بوكس التفاعلي).
 * يربط كافة تبويبات الاستوديو بقائمة موحدة تتيح تحديد أكثر من وحدة ودروس بعينها أو المنهج كاملاً.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 250 سطراً).
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  loadActiveCurriculumUnitsSSOT,
  type CurriculumUnitNode,
} from "@/core/ssot/curriculum-hierarchy-ssot";
import { loadEnabledGradesSSOT } from "@/core/ssot/teacher-identity-ssot";
import type { MathBranchId } from "@/core/ssot/math-branches-ssot";
import type { MathNotationLanguage } from "@/core/ssot/numeral-and-unit-ssot";
import StudioCurriculumUnitsChecklist from "./studio-curriculum-units-checklist";

export const MODULE_ID_STUDIO_CONTEXT_RIBBON_BAR = "studio_context_ribbon_bar" as const;

export interface StudioContextRibbonBarProps {
  readonly selectedGradeId: string;
  readonly selectedBranchId: MathBranchId;
  readonly selectedUnitTitle?: string;
  readonly selectedLessonTitle: string;
  readonly selectedLessonOrder?: number;
  readonly notationLanguage?: MathNotationLanguage;
  readonly selectedUnitIds?: readonly string[];
  readonly selectedLessonIds?: readonly string[];
  readonly essayAnswerLinesCount?: number;
  readonly onChangeGrade: (gradeId: string) => void;
  readonly onChangeBranch: (branchId: MathBranchId) => void;
  readonly onChangeUnitTitle?: (unitTitle: string) => void;
  readonly onChangeLessonTitle: (lessonTitle: string) => void;
  readonly onChangeLessonOrder?: (order: number) => void;
  readonly onChangeNotationLanguage?: (lang: MathNotationLanguage) => void;
  readonly onChangeScopeSelection?: (unitIds: readonly string[], lessonIds: readonly string[]) => void;
  readonly onChangeEssayAnswerLinesCount?: (count: number) => void;
}

export default function StudioContextRibbonBar({
  selectedGradeId,
  selectedUnitTitle,
  selectedLessonTitle,
  selectedLessonOrder = 15,
  notationLanguage = "english",
  selectedUnitIds = [],
  selectedLessonIds = [],
  essayAnswerLinesCount = 3,
  onChangeGrade,
  onChangeBranch,
  onChangeUnitTitle,
  onChangeLessonTitle,
  onChangeLessonOrder,
  onChangeNotationLanguage,
  onChangeScopeSelection,
  onChangeEssayAnswerLinesCount,
}: StudioContextRibbonBarProps) {
  const [enabledGrades, setEnabledGrades] = useState(() => loadEnabledGradesSSOT());
  const [units, setUnits] = useState<readonly CurriculumUnitNode[]>([]);

  useEffect(() => {
    setEnabledGrades(loadEnabledGradesSSOT());
    const loaded = loadActiveCurriculumUnitsSSOT(selectedGradeId);
    setUnits(loaded);
    if (loaded.length === 0) return;

    // إذا لم يكن هناك تحديد مسبق للوحدات والدروس، نحدد أول وحدة افتراضياً
    if (selectedUnitIds.length === 0 && selectedLessonIds.length === 0) {
      const firstUnit = loaded[0];
      const initialUnitIds = [firstUnit.id];
      const initialLessonIds = firstUnit.lessons.map((l) => l.id);
      onChangeScopeSelection?.(initialUnitIds, initialLessonIds);
      onChangeUnitTitle?.(firstUnit.titleArabic);
      onChangeBranch(firstUnit.branchId);
      if (firstUnit.lessons[0]) {
        onChangeLessonTitle(firstUnit.lessons[0].titleArabic);
        onChangeLessonOrder?.(firstUnit.lessons[0].orderIndex);
      }
    } else {
      const matchedUnit = loaded.find((u) => selectedUnitIds.includes(u.id)) || loaded[0];
      if (matchedUnit) {
        onChangeBranch(matchedUnit.branchId);
      }
    }
  }, [selectedGradeId]);

  const handleToggleUnit = (unitId: string) => {
    const targetUnit = units.find((u) => u.id === unitId);
    if (!targetUnit) return;
    const isChecked = selectedUnitIds.includes(unitId);
    const unitLessonIds = targetUnit.lessons.map((l) => l.id);

    const nextUnitIds = isChecked
      ? selectedUnitIds.filter((id) => id !== unitId)
      : [...selectedUnitIds, unitId];

    const nextLessonIds = isChecked
      ? selectedLessonIds.filter((id) => !unitLessonIds.includes(id))
      : Array.from(new Set([...selectedLessonIds, ...unitLessonIds]));

    onChangeScopeSelection?.(nextUnitIds, nextLessonIds);
    if (!isChecked) {
      onChangeUnitTitle?.(targetUnit.titleArabic);
      onChangeBranch(targetUnit.branchId);
      if (targetUnit.lessons[0]) {
        onChangeLessonTitle(targetUnit.lessons[0].titleArabic);
        onChangeLessonOrder?.(targetUnit.lessons[0].orderIndex);
      }
    }
  };

  const handleToggleLesson = (lessonId: string, unitId: string) => {
    const isChecked = selectedLessonIds.includes(lessonId);
    const nextLessonIds = isChecked
      ? selectedLessonIds.filter((id) => id !== lessonId)
      : [...selectedLessonIds, lessonId];

    const targetUnit = units.find((u) => u.id === unitId);
    let nextUnitIds = [...selectedUnitIds];

    if (targetUnit) {
      const allLessonsChecked =
        targetUnit.lessons.length > 0 &&
        targetUnit.lessons.every((l) => nextLessonIds.includes(l.id));

      if (allLessonsChecked && !nextUnitIds.includes(unitId)) {
        nextUnitIds.push(unitId);
      } else if (!allLessonsChecked && nextUnitIds.includes(unitId)) {
        nextUnitIds = nextUnitIds.filter((id) => id !== unitId);
      }

      const clickedLesson = targetUnit.lessons.find((l) => l.id === lessonId);
      if (clickedLesson && !isChecked) {
        onChangeLessonTitle(clickedLesson.titleArabic);
        onChangeLessonOrder?.(clickedLesson.orderIndex);
        onChangeUnitTitle?.(targetUnit.titleArabic);
        onChangeBranch(targetUnit.branchId);
      }
    }

    onChangeScopeSelection?.(nextUnitIds, nextLessonIds);
  };

  const handleSelectAll = () => {
    const allU = units.map((u) => u.id);
    const allL = units.flatMap((u) => u.lessons.map((l) => l.id));
    onChangeScopeSelection?.(allU, allL);
  };

  const handleDeselectAll = () => {
    onChangeScopeSelection?.([], []);
  };

  return (
    <section aria-label="سياق الصف والوحدات والدروس المستهدفة" className="space-y-3 pt-2">
      {/* الصف الدراسي والخيارات الأساسية */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="col-span-1">
          <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1">
            الصف الدراسي
          </label>
          <select
            value={selectedGradeId}
            onChange={(e) => onChangeGrade(e.target.value)}
            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black text-slate-900 dark:text-white"
          >
            {enabledGrades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nameArabic}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-1">
          <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1">
            رقم الدرس الفردي
          </label>
          <input
            type="number"
            min={1}
            max={60}
            value={selectedLessonOrder}
            onChange={(e) =>
              onChangeLessonOrder?.(Math.max(1, parseInt(e.target.value || "1", 10)))
            }
            className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black text-center"
          />
        </div>

        <div className="col-span-1 flex flex-col justify-end">
          <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1">
            رموز المعادلات
          </label>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 min-h-[44px]">
            <button
              type="button"
              onClick={() => onChangeNotationLanguage?.("english")}
              className={`flex-1 min-h-[34px] rounded-lg font-black text-[11px] transition-all ${
                notationLanguage === "english"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              $x, y$
            </button>
            <button
              type="button"
              onClick={() => onChangeNotationLanguage?.("arabic")}
              className={`flex-1 min-h-[34px] rounded-lg font-black text-[11px] transition-all ${
                notationLanguage === "arabic"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              $س، ص$
            </button>
          </div>
        </div>

        <div className="col-span-1 flex flex-col justify-end">
          <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1 truncate" title="سطور حل المقالي والبرهان فقط (اختر = 0 تلقائياً)">
            📝 سطور المقالي
          </label>
          <div className="flex items-center justify-between gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 min-h-[44px]">
            <button
              type="button"
              onClick={() => onChangeEssayAnswerLinesCount?.(Math.max(0, essayAnswerLinesCount - 1))}
              disabled={essayAnswerLinesCount <= 0}
              className="w-7 h-7 flex items-center justify-center font-black text-xs rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
              title="تقليل سطر"
            >
              -
            </button>
            <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 px-1 truncate">
              {essayAnswerLinesCount === 0 ? "بدون" : `${essayAnswerLinesCount}س`}
            </span>
            <button
              type="button"
              onClick={() => onChangeEssayAnswerLinesCount?.(Math.min(20, essayAnswerLinesCount + 1))}
              disabled={essayAnswerLinesCount >= 20}
              className="w-7 h-7 flex items-center justify-center font-black text-xs rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
              title="زيادة سطر"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* قائمة الشيك بوكس التفاعلية لجميع وحدات ودروس المنهج */}
      {units.length > 0 ? (
        <StudioCurriculumUnitsChecklist
          units={units}
          selectedUnitIds={selectedUnitIds}
          selectedLessonIds={selectedLessonIds}
          onToggleUnit={handleToggleUnit}
          onToggleLesson={handleToggleLesson}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
        />
      ) : (
        <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
          <span>💡 لم تقم بتقسيم منهج هذا الصف بعد في مستكشف المنهج.</span>
          <Link
            href="/library"
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black"
          >
            🧭 انتقل لمستكشف المنهج لتقسيم هذا الصف الآن ↗
          </Link>
        </div>
      )}
    </section>
  );
}
