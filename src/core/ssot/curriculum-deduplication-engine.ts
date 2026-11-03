/**
 * @file curriculum-deduplication-engine.ts
 * @description محرك المعالجة الذاتية والتطهير الحتمي لشجرة المنهج (Curriculum Deduplication & Normalization Engine)
 * يعالج مشكلات تكرار الردود من NotebookLM، وتصحيح العناوين والدروس المبتورة، وإزالة التكرارات وضمان وجود وحدة واحدة لكل رقم وحدة لكل صف.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 150 سطراً).
 */

import type { CurriculumLessonNode, CurriculumUnitNode } from "./curriculum-hierarchy-ssot";

export const MODULE_ID_CURRICULUM_DEDUPLICATION_ENGINE =
  "curriculum_deduplication_engine" as const;

/**
 * يضمن فصل رؤوس الوحدات والدروس التي تلتحم في سطر واحد دون سطر جديد أثناء التوليد.
 */
export function normalizeCurriculumSplitterRawText(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/([^\n])\s*(===\s*\[(?:GRADE|UNIT))/gi, "$1\n$2")
    .replace(/([^\n])\s*(-\s*\[LESSON:)/gi, "$1\n$2");
}

/**
 * يطهر مصفوفة الوحدات ويزيل أي تكرار لنفس رقم الوحدة في نفس الصف والفصل الدراسي،
 * مع اختيار الوحدة الأكمل (الأكثر في عدد الدروس والأنقى في العنوان).
 */
export function deduplicateCurriculumUnitsSSOT(
  units: readonly CurriculumUnitNode[]
): readonly CurriculumUnitNode[] {
  if (!Array.isArray(units) || units.length === 0) return [];

  const map = new Map<string, CurriculumUnitNode>();

  for (const unit of units) {
    const key = `${unit.gradeId}-t${unit.termNumber}-u${unit.orderIndex}`;
    const existing = map.get(key);

    if (!existing) {
      map.set(key, unit);
    } else {
      const newLessonsCount = unit.lessons?.length || 0;
      const existingLessonsCount = existing.lessons?.length || 0;

      if (newLessonsCount > existingLessonsCount) {
        map.set(key, unit);
      } else if (newLessonsCount === existingLessonsCount) {
        const isExistingTruncated =
          existing.titleArabic.length <= 18 || existing.titleArabic.endsWith(":");
        const isNewTruncated =
          unit.titleArabic.length <= 18 || unit.titleArabic.endsWith(":");

        if (isExistingTruncated && !isNewTruncated) {
          map.set(key, unit);
        } else if (unit.titleArabic.length > existing.titleArabic.length) {
          map.set(key, unit);
        } else {
          map.set(key, unit);
        }
      }
    }
  }

  return Array.from(map.values())
    .map((unit) => {
      const lessonMap = new Map<number, CurriculumLessonNode>();
      for (const lesson of unit.lessons || []) {
        const lKey = lesson.orderIndex;
        const existingLesson = lessonMap.get(lKey);
        if (
          !existingLesson ||
          (lesson.coreConcepts?.length || 0) >= (existingLesson.coreConcepts?.length || 0)
        ) {
          lessonMap.set(lKey, lesson);
        }
      }
      return {
        ...unit,
        lessons: Array.from(lessonMap.values()).sort((a, b) => a.orderIndex - b.orderIndex),
      };
    })
    .sort((a, b) => {
      if (a.gradeId === b.gradeId) {
        if (a.termNumber !== b.termNumber) return a.termNumber - b.termNumber;
        return a.orderIndex - b.orderIndex;
      }
      return 0;
    });
}
