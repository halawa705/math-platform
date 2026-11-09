"use client";

/**
 * @file use-studio-exam-unit-focus-weights.ts
 * @description هوك ذري مستقل لإدارة نسب وأوزان تركيز أسئلة الامتحان على الوحدات والدروس المختارة،
 * مع دعم إدراج الوحدة حتى لو تم اختيار درس واحد فقط منها، والتحكم في تضمينها بالبرومبت عبر تشيك بوكس.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 160 سطراً).
 */

import { useEffect, useMemo, useState } from "react";
import type { CurriculumUnitNode } from "@/core/ssot/curriculum-hierarchy-ssot";
import type { UnitFocusWeightItem } from "./studio-curriculum-units-checklist";

export interface UseStudioExamUnitFocusWeightsParams {
  readonly allCurriculumUnits: readonly CurriculumUnitNode[];
  readonly selectedUnitIds?: readonly string[];
  readonly selectedLessonIds?: readonly string[];
  readonly initialWeights?: Record<string, number>;
  readonly initialIncludeInPrompt?: boolean;
  readonly totalQuestionsCount: number;
  readonly onPersist?: (updates: {
    unitFocusWeights?: Record<string, number>;
    includeUnitFocusWeightsInPrompt?: boolean;
  }) => void;
}

export interface UseStudioExamUnitFocusWeightsReturn {
  readonly activeSelectedUnits: readonly CurriculumUnitNode[];
  readonly weights: Record<string, number>;
  readonly includeInPrompt: boolean;
  readonly focusWeightItems: readonly UnitFocusWeightItem[];
  readonly totalPercentage: number;
  readonly isExact100: boolean;
  readonly handleWeightsChange: (newWeights: Record<string, number>) => void;
  readonly updateUnitWeight: (unitId: string, val: number) => void;
  readonly handleEqualize: () => void;
  readonly handleToggleIncludeInPrompt: (include: boolean) => void;
}

export function useStudioExamUnitFocusWeights({
  allCurriculumUnits,
  selectedUnitIds = [],
  selectedLessonIds = [],
  initialWeights = {},
  initialIncludeInPrompt = true,
  totalQuestionsCount,
  onPersist,
}: UseStudioExamUnitFocusWeightsParams): UseStudioExamUnitFocusWeightsReturn {
  const [weights, setWeights] = useState<Record<string, number>>(initialWeights);
  const [includeInPrompt, setIncludeInPrompt] = useState<boolean>(initialIncludeInPrompt);

  // احتساب الوحدات النشطة: تشمل الوحدة إذا حُددت كلياً أو كان بها درس واحد على الأقل محدد
  const activeSelectedUnits = useMemo(() => {
    return allCurriculumUnits.filter((u) => {
      const isUnitExplicit = selectedUnitIds.includes(u.id);
      const hasAnySelectedLesson = u.lessons.some((l) => selectedLessonIds.includes(l.id));
      return isUnitExplicit || hasAnySelectedLesson;
    });
  }, [allCurriculumUnits, selectedUnitIds, selectedLessonIds]);

  // إعداد أو تحديث الأوزان الافتراضية المتساوية للوحدات النشطة إن لم تكن محددة مسبقاً
  useEffect(() => {
    if (activeSelectedUnits.length > 1) {
      const missing = activeSelectedUnits.some((u) => typeof weights[u.id] !== "number");
      if (missing) {
        const count = activeSelectedUnits.length;
        const base = Math.floor(100 / count);
        const remainder = 100 - base * count;
        const next: Record<string, number> = { ...weights };
        activeSelectedUnits.forEach((u, idx) => {
          if (typeof next[u.id] !== "number") {
            next[u.id] = base + (idx < remainder ? 1 : 0);
          }
        });
        setWeights(next);
        onPersist?.({ unitFocusWeights: next });
      }
    }
  }, [activeSelectedUnits]);

  const handleWeightsChange = (newWeights: Record<string, number>) => {
    setWeights(newWeights);
    onPersist?.({ unitFocusWeights: newWeights });
  };

  const updateUnitWeight = (unitId: string, val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    const next = { ...weights, [unitId]: clamped };
    setWeights(next);
    onPersist?.({ unitFocusWeights: next });
  };

  const handleEqualize = () => {
    const count = activeSelectedUnits.length;
    if (count === 0) return;
    const base = Math.floor(100 / count);
    const remainder = 100 - base * count;
    const next: Record<string, number> = {};
    activeSelectedUnits.forEach((u, idx) => {
      next[u.id] = base + (idx < remainder ? 1 : 0);
    });
    setWeights(next);
    onPersist?.({ unitFocusWeights: next });
  };

  const handleToggleIncludeInPrompt = (include: boolean) => {
    setIncludeInPrompt(include);
    onPersist?.({ includeUnitFocusWeightsInPrompt: include });
  };

  const totalPercentage = useMemo(() => {
    return activeSelectedUnits.reduce((acc, u) => acc + (weights[u.id] ?? 0), 0);
  }, [activeSelectedUnits, weights]);

  const isExact100 = totalPercentage === 100;

  // توليد عناصر أوزان البرومبت: فارغة إذا كان التشيك بوكس معطلاً أو عدد الوحدات <= 1
  const focusWeightItems: readonly UnitFocusWeightItem[] = useMemo(() => {
    if (!includeInPrompt || activeSelectedUnits.length <= 1) return [];
    return activeSelectedUnits.map((u) => {
      const pct = weights[u.id] ?? 0;
      return {
        unitId: u.id,
        unitTitle: `الوحدة ${u.orderIndex} (${u.titleArabic})`,
        unitOrderIndex: u.orderIndex,
        percentage: pct,
        questionCount: Math.round((pct / 100) * totalQuestionsCount),
      };
    });
  }, [includeInPrompt, activeSelectedUnits, weights, totalQuestionsCount]);

  return {
    activeSelectedUnits,
    weights,
    includeInPrompt,
    focusWeightItems,
    totalPercentage,
    isExact100,
    handleWeightsChange,
    updateUnitWeight,
    handleEqualize,
    handleToggleIncludeInPrompt,
  };
}
