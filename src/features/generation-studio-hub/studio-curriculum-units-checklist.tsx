"use client";

/**
 * @file studio-curriculum-units-checklist.tsx
 * @description قائمة اختيار تفاعلية مربعات اختيار (Checkboxes) بجوار كل وحدة وكل درس لاختيار نطاق النماذج بدقة تامة.
 * تتيح تحديد أكثر من وحدة ودروس بعينها، مع حساب فوري وتنسيق نصي لنطاق الاختبار الموجه لـ NotebookLM.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 260 سطراً).
 */

import React, { useState } from "react";
import Link from "next/link";
import type { CurriculumUnitNode } from "@/core/ssot/curriculum-hierarchy-ssot";

export const MODULE_ID_STUDIO_CURRICULUM_UNITS_CHECKLIST =
  "studio_curriculum_units_checklist" as const;

export interface StudioCurriculumUnitsChecklistProps {
  readonly units: readonly CurriculumUnitNode[];
  readonly selectedUnitIds: readonly string[];
  readonly selectedLessonIds: readonly string[];
  readonly onToggleUnit: (unitId: string) => void;
  readonly onToggleLesson: (lessonId: string, unitId: string) => void;
  readonly onSelectAll: () => void;
  readonly onDeselectAll: () => void;
}

/**
 * يحول الوحدات والدروس المختارة إلى صياغة عربية دقيقة وشاملة للبرومبت وترويسة المستند
 */
export function formatSelectedCurriculumScopeArabic(
  units: readonly CurriculumUnitNode[],
  selectedUnitIds: readonly string[],
  selectedLessonIds: readonly string[]
): string {
  if (units.length === 0) return "";

  const allLessons = units.flatMap((u) => u.lessons);
  const totalLessonsCount = allLessons.length;
  const isAllUnitsSelected = units.every((u) => selectedUnitIds.includes(u.id));
  const isAllLessonsSelected =
    totalLessonsCount > 0 && allLessons.every((l) => selectedLessonIds.includes(l.id));

  if (isAllUnitsSelected && isAllLessonsSelected) {
    return "كامل المنهج المقرر (جميع الوحدات والدروس)";
  }

  const parts: string[] = [];

  for (const unit of units) {
    const unitLessonIds = unit.lessons.map((l) => l.id);
    const chosenLessons = unit.lessons.filter((l) => selectedLessonIds.includes(l.id));

    if (chosenLessons.length === 0 && !selectedUnitIds.includes(unit.id)) {
      continue;
    }

    if (unitLessonIds.length > 0 && chosenLessons.length === unitLessonIds.length) {
      parts.push(`الوحدة ${unit.orderIndex} (${unit.titleArabic}) كاملة`);
    } else if (chosenLessons.length > 0) {
      const lessonNames = chosenLessons.map((l) => l.titleArabic).join("، ");
      parts.push(`الوحدة ${unit.orderIndex} (${unit.titleArabic}): [${lessonNames}]`);
    } else if (selectedUnitIds.includes(unit.id)) {
      parts.push(`الوحدة ${unit.orderIndex} (${unit.titleArabic})`);
    }
  }

  return parts.join(" + ");
}

export default function StudioCurriculumUnitsChecklist({
  units,
  selectedUnitIds,
  selectedLessonIds,
  onToggleUnit,
  onToggleLesson,
  onSelectAll,
  onDeselectAll,
}: StudioCurriculumUnitsChecklistProps) {
  const [expandedUnitIds, setExpandedUnitIds] = useState<Record<string, boolean>>(() => {
    // فتح جميع الوحدات افتراضياً لسهولة الرؤية
    const init: Record<string, boolean> = {};
    units.forEach((u) => {
      init[u.id] = true;
    });
    return init;
  });

  const toggleExpand = (unitId: string) => {
    setExpandedUnitIds((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  if (units.length === 0) {
    return (
      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-amber-900 dark:text-amber-200">
            ⚠️ لا توجد وحدات معتمدة لهذا الصف بعد.
          </span>
          <Link
            href="/library?tab=splitter"
            className="px-2.5 py-1 rounded-lg bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-black hover:underline shrink-0"
          >
            تقسيم واستيراد المنهج ↗
          </Link>
        </div>
      </div>
    );
  }

  const selectedUnitsCount = units.filter((u) => selectedUnitIds.includes(u.id)).length;
  const selectedLessonsCount = selectedLessonIds.length;

  return (
    <div className="space-y-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
      {/* شريط الإجراءات السريعة والإحصائيات */}
      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-black text-slate-800 dark:text-slate-200">
            اختر الوحدات والدروس المستهدفة:
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300">
            {selectedUnitsCount} وحدة • {selectedLessonsCount} درساً
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onSelectAll}
            className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-teal-300 cursor-pointer"
          >
            تحديد الكل
          </button>
          <button
            type="button"
            onClick={onDeselectAll}
            className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-500 cursor-pointer"
          >
            إلغاء التحديد
          </button>
        </div>
      </div>

      {/* قائمة الوحدات والدروس بشيك بوكس تفاعلي */}
      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
        {units.map((unit) => {
          const isUnitChecked = selectedUnitIds.includes(unit.id);
          const unitLessonIds = unit.lessons.map((l) => l.id);
          const checkedLessonsCount = unit.lessons.filter((l) =>
            selectedLessonIds.includes(l.id)
          ).length;
          const isExpanded = !!expandedUnitIds[unit.id];

          return (
            <div
              key={unit.id}
              className={`rounded-xl border transition-colors ${
                isUnitChecked || checkedLessonsCount > 0
                  ? "bg-white dark:bg-[#111827] border-indigo-200 dark:border-indigo-900/60 shadow-xs"
                  : "bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80"
              }`}
            >
              {/* سطر الوحدة الأساسي مع التشيك بوكس */}
              <div className="min-h-[42px] px-2.5 py-1.5 flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={isUnitChecked}
                    onChange={() => onToggleUnit(unit.id)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600 shrink-0"
                  />
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                    الوحدة {unit.orderIndex}: {unit.titleArabic}
                  </span>
                </label>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    {checkedLessonsCount} / {unit.lessons.length} درس
                  </span>

                  {unit.lessons.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(unit.id)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-black cursor-pointer"
                      title={isExpanded ? "طي الدروس" : "عرض الدروس"}
                    >
                      {isExpanded ? "▴" : "▾"}
                    </button>
                  )}
                </div>
              </div>

              {/* قائمة دروس الوحدة القابلة للطي */}
              {isExpanded && unit.lessons.length > 0 && (
                <div className="px-3 pb-2 pt-1 border-t border-slate-100 dark:border-slate-800/60 space-y-1">
                  {unit.lessons.map((lesson) => {
                    const isLessonChecked = selectedLessonIds.includes(lesson.id);

                    return (
                      <label
                        key={lesson.id}
                        className={`flex items-center justify-between gap-2 p-1.5 rounded-lg cursor-pointer transition-colors ${
                          isLessonChecked
                            ? "bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200"
                            : "hover:bg-slate-100/70 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={isLessonChecked}
                            onChange={() => onToggleLesson(lesson.id, unit.id)}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600 shrink-0"
                          />
                          <span className="text-[11px] font-bold truncate">
                            {lesson.orderIndex}. {lesson.titleArabic}
                          </span>
                        </div>

                        {lesson.coreConcepts.length > 0 && (
                          <span className="text-[9px] font-bold text-slate-400 truncate max-w-[120px] hidden sm:inline">
                            {lesson.coreConcepts[0]}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}