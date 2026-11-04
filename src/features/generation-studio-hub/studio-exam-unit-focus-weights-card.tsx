"use client";

/**
 * @file studio-exam-unit-focus-weights-card.tsx
 * @description بطاقة ذرية مستقلة للتحكم في نسب وأوزان تركيز أسئلة الاختبار على الوحدات المختارة (مثال: 20%، 30%، 50%).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import React, { useMemo } from "react";
import type { CurriculumUnitNode } from "@/core/ssot/curriculum-hierarchy-ssot";

export const MODULE_ID_STUDIO_EXAM_UNIT_FOCUS_WEIGHTS_CARD =
  "studio_exam_unit_focus_weights_card" as const;

export interface StudioExamUnitFocusWeightsCardProps {
  readonly selectedUnits: readonly CurriculumUnitNode[];
  readonly totalQuestionsCount: number;
  readonly weights: Record<string, number>;
  readonly onChangeWeights: (newWeights: Record<string, number>) => void;
}

export default function StudioExamUnitFocusWeightsCard({
  selectedUnits,
  totalQuestionsCount,
  weights,
  onChangeWeights,
}: StudioExamUnitFocusWeightsCardProps) {
  // تظهر هذه البطاقة فقط عند اختيار وحدتين فأكثر
  if (selectedUnits.length <= 1) {
    return null;
  }

  // حساب المجموع الحالي للأوزان
  const totalPercentage = useMemo(() => {
    return selectedUnits.reduce((acc, u) => acc + (weights[u.id] ?? 0), 0);
  }, [selectedUnits, weights]);

  const isExact100 = totalPercentage === 100;

  // زر التوزيع المتساوي للنسب على الوحدات المختارة
  const handleEqualize = () => {
    const count = selectedUnits.length;
    if (count === 0) return;
    const base = Math.floor(100 / count);
    const remainder = 100 - base * count;
    const next: Record<string, number> = {};
    selectedUnits.forEach((u, idx) => {
      next[u.id] = base + (idx < remainder ? 1 : 0);
    });
    onChangeWeights(next);
  };

  const updateUnitWeight = (unitId: string, val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    onChangeWeights({
      ...weights,
      [unitId]: clamped,
    });
  };

  return (
    <section
      aria-label="نسب تركيز الأسئلة على الوحدات"
      className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-slate-900/60 border border-indigo-100 dark:border-indigo-900/40 space-y-2.5"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">⚖️</span>
          <span className="text-xs font-black text-slate-800 dark:text-slate-100">
            نسب تركيز الأسئلة على الوحدات:
          </span>
          <span
            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              isExact100
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
                : "bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300"
            }`}
          >
            المجموع: {totalPercentage}% {isExact100 ? "✓" : `(متبقي ${100 - totalPercentage}%)`}
          </span>
        </div>

        <button
          type="button"
          onClick={handleEqualize}
          className="min-h-[32px] px-2.5 py-1 rounded-xl text-[10px] font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 cursor-pointer transition-colors shadow-2xs"
        >
          توزيع متساوٍ
        </button>
      </div>

      <div className="space-y-2">
        {selectedUnits.map((unit) => {
          const currentPct = weights[unit.id] ?? 0;
          const questionsCount = Math.round((currentPct / 100) * totalQuestionsCount);

          return (
            <div
              key={unit.id}
              className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                  الوحدة {unit.orderIndex}: {unit.titleArabic}
                </p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {totalQuestionsCount > 0 ? `يعادل حوالي ${questionsCount} أسئلة من أصل ${totalQuestionsCount}` : "حدد عدد الأسئلة"}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => updateUnitWeight(unit.id, currentPct - 5)}
                  disabled={currentPct <= 0}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs disabled:opacity-30 cursor-pointer"
                  title="إنقاص 5%"
                >
                  -
                </button>

                <div className="relative flex items-center">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={5}
                    value={currentPct}
                    onChange={(e) => updateUnitWeight(unit.id, parseInt(e.target.value || "0", 10))}
                    className="w-14 min-h-[34px] px-1.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs font-black text-center"
                  />
                  <span className="absolute left-1 text-[10px] font-bold text-slate-400 pointer-events-none">%</span>
                </div>

                <button
                  type="button"
                  onClick={() => updateUnitWeight(unit.id, currentPct + 5)}
                  disabled={currentPct >= 100}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs disabled:opacity-30 cursor-pointer"
                  title="زيادة 5%"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!isExact100 && (
        <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
          💡 يُفضل أن يكون مجموع النسب 100% لضمان توزيع درجات وأسئلة الاختبار بدقة متناهية.
        </p>
      )}
    </section>
  );
}
