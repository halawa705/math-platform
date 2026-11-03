"use client";

/**
 * @file curriculum-explorer-tree-tab.tsx
 * @description مستكشف المنهج المعتمد: يعرض شجرة الوحدات والدروس المعتمدة لكل صف دراسي على حدة
 * عبر قائمة منسدلة أنيقة تقرأ من مصدر الحقيقة SSOT، مع إحصائيات فورية، وإمكانية المسح الشامل للبدء من جديد.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 220 سطراً).
 */

import { useState, useEffect, useMemo } from "react";
import CalmEmptyStateCard from "@/components/global-ui/calm-empty-state-card";
import {
  CURRICULUM_UNITS_UPDATED_EVENT,
  deleteAllCurriculumUnitsSSOT,
  deleteCurriculumUnitsForGradeSSOT,
  loadActiveCurriculumUnitsSSOT,
  saveImportedCurriculumUnitsSSOT,
  type CurriculumUnitNode,
} from "@/core/ssot/curriculum-hierarchy-ssot";
import { loadEnabledGradesSSOT } from "@/core/ssot/teacher-identity-ssot";
import { pullCurriculumUnitsFromSupabaseCloud } from "@/core/supabase/supabase-cloud-sync-ssot";
import CurriculumSavedUnitsList from "./curriculum-saved-units-list";

export const MODULE_ID_CURRICULUM_EXPLORER_TREE_TAB =
  "curriculum_explorer_tree_tab" as const;

export interface CurriculumExplorerTreeTabProps {
  readonly onOpenSplitterForGrade?: (gradeId: string) => void;
}

export default function CurriculumExplorerTreeTab({
  onOpenSplitterForGrade,
}: CurriculumExplorerTreeTabProps) {
  const [enabledGrades] = useState(() => loadEnabledGradesSSOT());
  const [selectedGradeId, setSelectedGradeId] = useState<string>(() => {
    const list = loadEnabledGradesSSOT();
    return list.find((g) => g.id === "prim-6")?.id || list[0]?.id || "prep-3";
  });
  const [allUnits, setAllUnits] = useState<readonly CurriculumUnitNode[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const refreshUnits = () => {
    setAllUnits(loadActiveCurriculumUnitsSSOT());
  };

  useEffect(() => {
    refreshUnits();
    void pullCurriculumUnitsFromSupabaseCloud().then((cloudUnits) => {
      if (cloudUnits && cloudUnits.length > 0) {
        const local = loadActiveCurriculumUnitsSSOT();
        const hasCorruptedUnit = local.some(
          (u) =>
            u.titleArabic.length <= 18 ||
            u.titleArabic.endsWith(":") ||
            u.titleArabic.endsWith("الت") ||
            (u.orderIndex > 1 && u.lessons[0]?.titleArabic?.includes("الكسور العشرية"))
        );
        if (local.length === 0 || hasCorruptedUnit) {
          saveImportedCurriculumUnitsSSOT(cloudUnits);
          refreshUnits();
        }
      }
    });

    window.addEventListener(CURRICULUM_UNITS_UPDATED_EVENT, refreshUnits);
    window.addEventListener("storage", refreshUnits);
    return () => {
      window.removeEventListener(CURRICULUM_UNITS_UPDATED_EVENT, refreshUnits);
      window.removeEventListener("storage", refreshUnits);
    };
  }, []);

  // فلترة حتمية صارمة: وحدات الصف المختار فقط لا غير من مصدر الحقيقة
  const activeGradeUnits = useMemo(
    () => allUnits.filter((u) => u.gradeId === selectedGradeId),
    [allUnits, selectedGradeId]
  );

  const totalLessonsCount = useMemo(
    () => activeGradeUnits.reduce((acc, u) => acc + (u.lessons?.length || 0), 0),
    [activeGradeUnits]
  );

  const selectedGrade = enabledGrades.find((g) => g.id === selectedGradeId) || enabledGrades[0];
  const gradeName = selectedGrade?.nameArabic || "الصف المختار";

  const handleDeleteCurrentGrade = () => {
    const confirmed = window.confirm(
      `هل أنت متأكد من رغبتك في مسح جميع وحدات ودروس (${gradeName})؟\nلن تتأثر وحدات الصفوف الأخرى إطلاقاً.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    deleteCurriculumUnitsForGradeSSOT(selectedGradeId);
    refreshUnits();
    setTimeout(() => setIsDeleting(false), 500);
  };

  const handleWipeAllCurriculums = () => {
    const confirmed = window.confirm(
      "تحذير حاسم وإعادة ضبط شاملة:\nهل أنت متأكد تماماً من مسح كافة المناهج والوحدات والدروس المسجلة لجميع الصفوف بالكامل والبدء من جديد من الصفر؟"
    );
    if (!confirmed) return;

    setIsDeleting(true);
    deleteAllCurriculumUnitsSSOT();
    refreshUnits();
    setTimeout(() => setIsDeleting(false), 500);
  };

  return (
    <div className="space-y-4">
      {/* قائمة منسدلة لاختيار الصف الدراسي وقراءة بياناته من الـ SSOT */}
      <section aria-label="اختيار الصف الدراسي" className="p-3.5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="flex items-center justify-between gap-2 px-0.5">
          <label htmlFor="curriculum-grade-select" className="text-xs font-black text-slate-800 dark:text-slate-200">
            اختر الصف الدراسي لاستعراض منهجه:
          </label>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {allUnits.length} وحدة محفوظة بالمنصة إجمالاً
          </span>
        </div>

        <select
          id="curriculum-grade-select"
          value={selectedGradeId}
          onChange={(e) => setSelectedGradeId(e.target.value)}
          className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black text-slate-800 dark:text-slate-100 cursor-pointer shadow-inner"
        >
          {enabledGrades.map((grade) => {
            const countForGrade = allUnits.filter((u) => u.gradeId === grade.id).length;
            return (
              <option key={grade.id} value={grade.id}>
                {grade.nameArabic} {countForGrade > 0 ? `(${countForGrade} وحدات معتمدة)` : "(⚠️ غير مسجل بعد)"}
              </option>
            );
          })}
        </select>
      </section>

      {/* بطاقة معلومات وتحكم الصف المختار */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-slate-900 dark:text-white">
              {gradeName}
            </span>
            <span
              className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                activeGradeUnits.length > 0
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
              }`}
            >
              {activeGradeUnits.length > 0
                ? `${activeGradeUnits.length} وحدات • ${totalLessonsCount} درساً`
                : "غير مسجل بعد"}
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 mt-0.5">
            هذه الوحدات والدروس تظهر حصراً لـ ({gradeName}) في استوديو التوليد والاختبارات
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenSplitterForGrade && (
            <button
              type="button"
              onClick={() => onOpenSplitterForGrade(selectedGradeId)}
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-black cursor-pointer hover:opacity-90"
            >
              تقسيم أو تحديث هذا الصف ↗
            </button>
          )}

          {activeGradeUnits.length > 0 && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteCurrentGrade}
              className="min-h-[40px] px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20 text-xs font-black cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-950/50 disabled:opacity-40"
            >
              {isDeleting ? "جارٍ المسح..." : "مسح وحدات هذا الصف"}
            </button>
          )}

          {allUnits.length > 0 && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleWipeAllCurriculums}
              className="min-h-[40px] px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 bg-rose-100/60 dark:bg-rose-950/40 text-xs font-black cursor-pointer hover:bg-rose-200 dark:hover:bg-rose-900/50 disabled:opacity-40"
              title="مسح كافة وحدات جميع الصفوف وإعادة الضبط من الصفر"
            >
              مسح كل المناهج بالكامل 🗑️
            </button>
          )}
        </div>
      </div>

      {/* قائمة الوحدات والدروس المعزولة لهذا الصف */}
      {activeGradeUnits.length === 0 ? (
        <div className="space-y-3">
          <CalmEmptyStateCard
            icon="📂"
            titleAr={`لا توجد وحدات أو دروس مسجلة بعد لـ (${gradeName})`}
            hintAr={`لم يتم استيراد منهج ${gradeName} حتى الآن. يمكنك النقر على الزر بالأسفل للانتقال لتبويب التقسيم ونسخ البرومبت إلى NotebookLM واعتماد المنهج في ثوانٍ.`}
          />
          {onOpenSplitterForGrade && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => onOpenSplitterForGrade(selectedGradeId)}
                className="min-h-[44px] px-5 rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-black cursor-pointer hover:opacity-90 shadow-sm flex items-center gap-2"
              >
                <span>🚀 تقسيم واستيراد منهج {gradeName} الآن ↗</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <CurriculumSavedUnitsList units={activeGradeUnits} gradeNameAr={gradeName} />
      )}
    </div>
  );
}