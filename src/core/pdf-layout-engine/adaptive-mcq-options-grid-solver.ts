/**
 * @file adaptive-mcq-options-grid-solver.ts
 * @description خوارزمية توزيع بدائل الاختيار من متعدد (Adaptive MCQ Options Grid Solver):
 * - 4 أعمدة في سطر واحد (`grid-cols-4`) إذا كانت جميع البدائل قصيرة (<= 18 حرفاً صافيًا بعد استبعاد أوامر LaTeX).
 * - عمودان (`grid-cols-2`) إذا كانت البدائل متوسطة الطول (<= 42 حرفاً).
 * - عمود واحد (`grid-cols-1`) للبدائل الطويلة أو الجمل البرهانية المركبة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import type { MCQAdaptiveColumnsCount } from "../ir/a4-paginated-layout-ir";

export const MODULE_ID_ADAPTIVE_MCQ_OPTIONS_GRID_SOLVER =
  "adaptive_mcq_options_grid_solver" as const;

/**
 * يحسب الطول البصري الصافي للبديل بعد تجريد أوامر LaTeX مثل `\frac` و `\sqrt` والمحددات `$`.
 */
function estimateVisualChoiceCharacterLength(choiceText: string): number {
  if (!choiceText) return 0;
  const stripped = choiceText
    .replace(/\$/g, "")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1/$2")
    .replace(/\\sqrt\{([^}]+)\}/g, "√$1")
    .replace(/\\[a-zA-Z]+/g, "X")
    .replace(/[{}]/g, "")
    .trim();

  return stripped.length;
}

/**
 * يحدد عدد الأعمدة الأمثل (4 أو 2 أو 1) لتوزيع البدائل الأربعة بأقصى توفير للمساحة الرأسية
 * مع منع أي تقطيع مشوه للحروف العربية في نصف العمود.
 */
export function resolveAdaptiveMCQColumnsCount(
  choices: readonly string[] | undefined,
  isInsideNarrowHalfColumn = false,
  compactHeader = false
): MCQAdaptiveColumnsCount {
  if (!choices || choices.length === 0) return 4;

  const maxVisualLen = Math.max(
    ...choices.map((c) => estimateVisualChoiceCharacterLength(c))
  );

  if (compactHeader) {
    if (maxVisualLen <= 12) return 4;
    if (maxVisualLen <= 52) return 2;
    return 1;
  }

  if (isInsideNarrowHalfColumn) {
    // شبكة 2x2 متوازنة (أ في اليمين وب في اليسار / جـ تحت أ ود تحت ب) لمعظم البدائل
    if (maxVisualLen <= 52) {
      return 2;
    }
    return 1;
  }

  // في العرض الكامل (صفحة بعمود واحد ~190 مم)
  if (maxVisualLen <= 18) {
    return 4;
  }
  if (maxVisualLen <= 52) {
    return 2;
  }
  return 1;
}

export function resolveMCQGridTailwindClass(
  columnsCount: MCQAdaptiveColumnsCount
): string {
  if (columnsCount === 4) return "grid-cols-4";
  if (columnsCount === 2) return "grid-cols-2";
  return "grid-cols-1";
}
