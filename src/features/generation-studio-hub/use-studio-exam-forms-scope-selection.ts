"use client";

/**
 * @file use-studio-exam-forms-scope-selection.ts
 * @description كوستوم هوك ذري مستقل لإدارة تحديد الوحدات والدروس بالشيك بوكس في استوديو النماذج المتعددة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 150 سطراً).
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
}

export function useStudioExamFormsScopeSelection({
  gradeId,
  unitTitleAr,
  scopeKind,
  initialUnitIds = [],
  initialLessonIds = [],
  onScopeDescChanged,
}: UseStudioExamFormsScopeSelectionParams) {
  const [units, setUnits] = useState<readonly CurriculumUnitNode[]>([]);
  const [selectedUnitIds, setSelectedUnitIds] = useState<readonly string[]>(initialUnitIds);
  const [selectedLessonIds, setSelectedLessonIds] = useState<readonly string[]>(initialLessonIds);

  useEffect(() => {
    const loaded = loadActiveCurriculumUnitsSSOT(gradeId);
    setUnits(loaded);

    if (loaded.length > 0 && selectedUnitIds.length === 0 && selectedLessonIds.length === 0) {
      if (scopeKind === "end_of_term") {
        const uIds = loaded.map((u) => u.id);
        const lIds = loaded.flatMap((u) => u.lessons.map((l) => l.id));
        setSelectedUnitIds(uIds);
        setSelectedLessonIds(lIds);
        const text = formatSelectedCurriculumScopeArabic(loaded, uIds, lIds);
        onScopeDescChanged(text);
        saveStudioExamFormsSettingsSSOT({
          selectedUnitIds: uIds,
          selectedLessonIds: lIds,
          targetedUnitsOrLessons: text,
        });
      } else if (unitTitleAr) {
        const matched = loaded.find((u) => u.titleArabic === unitTitleAr);
        if (matched) {
          const uIds = [matched.id];
          const lIds = matched.lessons.map((l) => l.id);
          setSelectedUnitIds(uIds);
          setSelectedLessonIds(lIds);
          const text = formatSelectedCurriculumScopeArabic(loaded, uIds, lIds);
          onScopeDescChanged(text);
          saveStudioExamFormsSettingsSSOT({
            selectedUnitIds: uIds,
            selectedLessonIds: lIds,
            targetedUnitsOrLessons: text,
          });
        }
      }
    }
  }, [gradeId, unitTitleAr]);

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

    setSelectedUnitIds(nextUnitIds);
    setSelectedLessonIds(nextLessonIds);
    const text = formatSelectedCurriculumScopeArabic(units, nextUnitIds, nextLessonIds);
    onScopeDescChanged(text);
    saveStudioExamFormsSettingsSSOT({
      selectedUnitIds: nextUnitIds,
      selectedLessonIds: nextLessonIds,
      targetedUnitsOrLessons: text,
    });
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

    setSelectedUnitIds(nextUnitIds);
    setSelectedLessonIds(nextLessonIds);
    const text = formatSelectedCurriculumScopeArabic(units, nextUnitIds, nextLessonIds);
    onScopeDescChanged(text);
    saveStudioExamFormsSettingsSSOT({
      selectedUnitIds: nextUnitIds,
      selectedLessonIds: nextLessonIds,
      targetedUnitsOrLessons: text,
    });
  };

  const handleSelectAll = () => {
    const uIds = units.map((u) => u.id);
    const lIds = units.flatMap((u) => u.lessons.map((l) => l.id));
    setSelectedUnitIds(uIds);
    setSelectedLessonIds(lIds);
    const text = formatSelectedCurriculumScopeArabic(units, uIds, lIds);
    onScopeDescChanged(text);
    saveStudioExamFormsSettingsSSOT({
      selectedUnitIds: uIds,
      selectedLessonIds: lIds,
      targetedUnitsOrLessons: text,
    });
  };

  const handleDeselectAll = () => {
    setSelectedUnitIds([]);
    setSelectedLessonIds([]);
    onScopeDescChanged("");
    saveStudioExamFormsSettingsSSOT({
      selectedUnitIds: [],
      selectedLessonIds: [],
      targetedUnitsOrLessons: "",
    });
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