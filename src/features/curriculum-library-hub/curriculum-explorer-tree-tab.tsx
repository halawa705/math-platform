"use client";

/**
 * @file curriculum-explorer-tree-tab.tsx
 * @description مستكشف المنهج المعتمد: يعرض شجرة الوحدات والدروس المعتمدة لكل صف دراسي على حدة
 * مع شريط أفقي للصفوف الدراسية، وإحصائيات فورية، وعزل تام لكل صف عن الآخر.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 220 سطراً).
 */

import { useState, useEffect, useMemo } from "react";
import CalmEmptyStateCard from "@/components/global-ui/calm-empty-state-card";
import {
  CURRICULUM_UNITS_UPDATED_EVENT,
  deleteCurriculumUnitsForGradeSSOT,
  loadActiveCurriculumUnitsSSOT,
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
        refreshUnits();
      }
    });

    window.addEventListener(CURRICULUM_UNITS_UPDATED_EVENT, refreshUnits);
    window.addEventListener("storage", refreshUnits);
    return () => {
      window.removeEventListener(CURRICULUM_UNITS_UPDATED_EVENT, refreshUnits);
      window.removeEventListener("storage", refreshUnits);
    };
  }, []);

  // فلترة حتمية صارمة: وحدات الصف المختار فقط لا غير
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

  return (
    <div className="space-y-4">
      {/* شريط اختيار الصفوف الدراسيّة القابل للتمرير الأفقي */}
      <section aria-label="اختيار الصف الدراسي" className="space-y-2">
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-xs font-black text-slate-700 dark:text-slate-200">
            اختر الصف الدراسي لاستعراض منهجه:
          </span>
          <span className="text-[11px] font-bold text-slate-400">
            {allUnits.length} وحدة محفوظة إجمالاً
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {enabledGrades.map((grade) => {
            const countForGrade = allUnits.filter((u) => u.gradeId === grade.id).length;
            const isSelected = grade.id === selectedGradeId;

            return (
              <button
                key={grade.id}
                type="button"
                onClick={() => setSelectedGradeId(grade.id)}
                className={`min-h-[44px] px-3.5 py-1.5 rounded-2xl text-xs font-black shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <span>{grade.nameArabic}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    isSelected
                      ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900"
                      : countForGrade > 0
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                  }`}
                >
                  {countForGrade}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* بطاقة معلومات وتحكم الصف المختار */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-slate-900 dark:text-white">
              {gradeName}
            </span>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {activeGradeUnits.length} وحدات • {totalLessonsCount} درساً
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 mt-0.5">
            هذه الوحدات والدروس تظهر حصراً لـ ({gradeName}) في استوديو التوليد والاختبارات
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenSplitterForGrade && (
            <button
              type="button"
              onClick={() => onOpenSplitterForGrade(selectedGradeId)}
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-black cursor-pointer hover:opacity-90"
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
        </div>
      </div>

      {/* قائمة الوحدات والدروس المعزولة لهذا الصف */}
      {activeGradeUnits.length === 0 ? (
        <CalmEmptyStateCard
          icon="📂"
          titleAr={`لا توجد وحدات معتمدة بعد لـ (${gradeName})`}
          hintAr="اضغط على زر «تقسيم أو تحديث هذا الصف» بالأعلى، وانسخ البرومبت والصق الرد من NotebookLM لاعتماد وحدات هذا الصف بشكل مستقل تماماً."
        />
      ) : (
        <CurriculumSavedUnitsList units={activeGradeUnits} gradeNameAr={gradeName} />
      )}
    </div>
  );
}