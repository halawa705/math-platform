"use client";

/**
 * @file use-studio-exam-forms-scope-selection.ts
 * @description كوستوم هوك ذري مستقل لإدارة تحديد الوحدات والدروس بالشيك بوكس في استوديو النماذج المتعددة
 * مع المزامنة الثنائية مع شريط السياق العام.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 170 سطراً).
 */

import { useState, useEffect } from "react";
import {
  loadActiveCurriculumUnitsSSOT,
  type CurriculumUnitNode,
} from "@/core/ssot/curriculum-hierarchy-ssot";
import {
  saveStudioExamFormsSettingsSSOT,
  type ExamFormsScopeKind,
} from "@/core/ssot/studio-state-persistence-ssot";
import { formatSelectedCurriculumScopeArabic } from "./studio-curriculum-units-checklist";

export interface UseStudioExamFormsScopeSelectionParams {
  readonly gradeId: string;
  readonly unitTitleAr?: string;
  readonly scopeKind: ExamFormsScopeKind;
  readonly initialUnitIds?: readonly string[];
  readonly initialLessonIds?: readonly string[];
  readonly onScopeDescChanged: (desc: string) => void;
  readonly onScopeSelectionChanged?: (unitIds: readonly string[], lessonIds: readonly string[]) => void;
}

export function useStudioExamFormsScopeSelection({
  gradeId,
  unitTitleAr,
  scopeKind,
  initialUnitIds = [],
  initialLessonIds = [],
  onScopeDescChanged,
  onScopeSelectionChanged,
}: UseStudioExamFormsScopeSelectionParams) {
  const [units, setUnits] = useState<readonly CurriculumUnitNode[]>([]);
  const [selectedUnitIds, setSelectedUnitIds] = useState<readonly string[]>(initialUnitIds);
  const [selectedLessonIds, setSelectedLessonIds] = useState<readonly string[]>(initialLessonIds);

  const commitSelection = (nextUnits: readonly string[], nextLessons: readonly string[], sourceUnits = units) => {
    setSelectedUnitIds(nextUnits);
    setSelectedLessonIds(nextLessons);
    const text = formatSelectedCurriculumScopeArabic(sourceUnits, nextUnits, nextLessons);
    onScopeDescChanged(text);
    onScopeSelectionChanged?.(nextUnits, nextLessons);
    saveStudioExamFormsSettingsSSOT({
      selectedUnitIds: nextUnits,
      selectedLessonIds: nextLessons,
      targetedUnitsOrLessons: text,
    });
  };

  useEffect(() => {
    const loaded = loadActiveCurriculumUnitsSSOT(gradeId);
    setUnits(loaded);
    if (loaded.length === 0) return;

    if (initialUnitIds.length > 0 || initialLessonIds.length > 0) {
      setSelectedUnitIds(initialUnitIds);
      setSelectedLessonIds(initialLessonIds);
      const text = formatSelectedCurriculumScopeArabic(loaded, initialUnitIds, initialLessonIds);
      if (text) onScopeDescChanged(text);
      return;
    }

    if (selectedUnitIds.length === 0 && selectedLessonIds.length === 0) {
      if (scopeKind === "end_of_term") {
        const uIds = loaded.map((u) => u.id);
        const lIds = loaded.flatMap((u) => u.lessons.map((l) => l.id));
        commitSelection(uIds, lIds, loaded);
      } else if (unitTitleAr) {
        const matched = loaded.find((u) => u.titleArabic === unitTitleAr);
        if (matched) {
          commitSelection([matched.id], matched.lessons.map((l) => l.id), loaded);
        }
      }
    }
  }, [gradeId, unitTitleAr, initialUnitIds.join(","), initialLessonIds.join(",")]);

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

    commitSelection(nextUnitIds, nextLessonIds);
  };

  const handleToggleLesson = (lessonId: string, unitId: string) => {
    const targetUnit = units.find((u) => u.id === unitId);
    if (!targetUnit) return;
    const isChecked = selectedLessonIds.includes(lessonId);
    const nextLessonIds = isChecked
      ? selectedLessonIds.filter((id) => id !== lessonId)
      : [...selectedLessonIds, lessonId];

    const unitLessonIds = targetUnit.lessons.map((l) => l.id);
    const allChecked =
      unitLessonIds.length > 0 && unitLessonIds.every((id) => nextLessonIds.includes(id));

    let nextUnitIds = selectedUnitIds;
    if (allChecked && !selectedUnitIds.includes(unitId)) {
      nextUnitIds = [...selectedUnitIds, unitId];
    } else if (!allChecked && selectedUnitIds.includes(unitId)) {
      nextUnitIds = selectedUnitIds.filter((id) => id !== unitId);
    }

    commitSelection(nextUnitIds, nextLessonIds);
  };

  const handleSelectAll = () => {
    const uIds = units.map((u) => u.id);
    const lIds = units.flatMap((u) => u.lessons.map((l) => l.id));
    commitSelection(uIds, lIds);
  };

  const handleDeselectAll = () => {
    commitSelection([], []);
  };

  return {
    units,
    selectedUnitIds,
    selectedLessonIds,
    handleToggleUnit,
    handleToggleLesson,
    handleSelectAll,
    handleDeselectAll,
  };
}
