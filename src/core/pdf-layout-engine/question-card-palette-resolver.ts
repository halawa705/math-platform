/**
 * @file question-card-palette-resolver.ts
 * @description محلل ألوان وحواف بطاقة المسألة في الـ PDF لتمييز الأمثلة والتدريبات والواجبات.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 60 سطراً).
 */

import type { PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";

export interface QuestionCardColorScheme {
  readonly cardSurfaceBgHex: string;
  readonly cardBorderColorHex: string;
  readonly badgeBgColorHex: string;
  readonly exampleRoleLabel: string;
}

export function resolveQuestionCardColorScheme(params: {
  readonly isBookletSolvedExample: boolean;
  readonly isBookletDrill: boolean;
  readonly isBookletHomework: boolean;
  readonly isOddQuestion: boolean;
  readonly palette: PrintThemePaletteTokens;
}): QuestionCardColorScheme {
  const { isBookletSolvedExample, isBookletDrill, isBookletHomework, isOddQuestion, palette } = params;

  const cardSurfaceBgHex = isBookletSolvedExample
    ? isOddQuestion
      ? "#F2FBF7"
      : "#F0F9FF"
    : isBookletDrill
      ? "#F8FAFC"
      : "#FFFFFF";

  const cardBorderColorHex = isBookletSolvedExample
    ? isOddQuestion
      ? "#10B981"
      : "#0E7490"
    : isBookletDrill
      ? "#6366F1"
      : isBookletHomework
        ? "#9D174D"
        : palette.borderHex;

  const badgeBgColorHex = isBookletSolvedExample
    ? isOddQuestion
      ? "#065F46"
      : "#155E75"
    : palette.primaryHex;

  const exampleRoleLabel = isOddQuestion ? "تطبيقي" : "متقدم";

  return {
    cardSurfaceBgHex,
    cardBorderColorHex,
    badgeBgColorHex,
    exampleRoleLabel,
  };
}
