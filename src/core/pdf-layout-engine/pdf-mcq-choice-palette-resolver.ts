/**
 * @file pdf-mcq-choice-palette-resolver.ts
 * @description المحلل الذري الموحد لألوان كبسولات وحروف ونصوص اختيارات الأسئلة الموضوعية (MCQ) في الـ PDF:
 * يستبدل اللون الأحمر الفاقع والسماوي المتنافر بدرجات مطبعية هادئة رصينة واضحة في الطباعة الليزرية ومتناغمة مع كل سمة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 110 سطراً).
 */

import type { PrintColorThemeId } from "../ssot/pdf-print-settings-ssot";
import type { PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";

export const MODULE_ID_PDF_MCQ_CHOICE_PALETTE_RESOLVER =
  "pdf_mcq_choice_palette_resolver" as const;

export interface McqChoiceVisualTokens {
  readonly capsuleBgHex: string;
  readonly capsuleBorderHex: string;
  readonly capsuleShadowCss: string;
  readonly letterBadgeBgHex: string;
  readonly letterBadgeBorderHex: string;
  readonly letterBadgeTextHex: string;
  readonly choiceTextHex: string;
  readonly dividerBorderHex: string;
  readonly correctBgHex: string;
  readonly correctBorderHex: string;
  readonly correctBadgeBgHex: string;
  readonly correctTextHex: string;
}

const STANDARD_CORRECT_TOKENS = {
  correctBgHex: "#F0FDF4",
  correctBorderHex: "#15803D",
  correctBadgeBgHex: "#15803D",
  correctTextHex: "#064E3B",
} as const;

const PHOTOCOPY_CORRECT_TOKENS = {
  correctBgHex: "#F8FAFC",
  correctBorderHex: "#0F172A",
  correctBadgeBgHex: "#000000",
  correctTextHex: "#000000",
} as const;

const THEME_MCQ_TOKENS_MAP: Record<PrintColorThemeId, Omit<McqChoiceVisualTokens, keyof typeof STANDARD_CORRECT_TOKENS | "capsuleBgHex" | "letterBadgeTextHex" | "choiceTextHex">> = {
  math_teal: {
    capsuleBorderHex: "#CBD5E1",
    dividerBorderHex: "#E2E8F0",
    capsuleShadowCss: "0 1px 0 rgba(23, 43, 94, 0.07)",
    letterBadgeBgHex: "#1E3A5F",
    letterBadgeBorderHex: "#152A47",
  },
  navy_gold: {
    capsuleBorderHex: "#CBD5E1",
    dividerBorderHex: "#E6E1D6",
    capsuleShadowCss: "0 1px 0 rgba(15, 30, 54, 0.07)",
    letterBadgeBgHex: "#162844",
    letterBadgeBorderHex: "#0F1E36",
  },
  emerald_moasser: {
    capsuleBorderHex: "#D5CEE4",
    dividerBorderHex: "#EAE5F3",
    capsuleShadowCss: "0 1px 0 rgba(51, 20, 89, 0.07)",
    letterBadgeBgHex: "#3F2368",
    letterBadgeBorderHex: "#2D174D",
  },
  royal_indigo: {
    capsuleBorderHex: "#C6DCD5",
    dividerBorderHex: "#E2EFEA",
    capsuleShadowCss: "0 1px 0 rgba(10, 71, 54, 0.07)",
    letterBadgeBgHex: "#145343",
    letterBadgeBorderHex: "#0B3B2E",
  },
  amber_gold: {
    capsuleBorderHex: "#DDD2C4",
    dividerBorderHex: "#EFE8DE",
    capsuleShadowCss: "0 1px 0 rgba(66, 32, 8, 0.07)",
    letterBadgeBgHex: "#5C3415",
    letterBadgeBorderHex: "#42220A",
  },
  photocopy_black: {
    capsuleBorderHex: "#94A3B8",
    dividerBorderHex: "#CBD5E1",
    capsuleShadowCss: "none",
    letterBadgeBgHex: "#1E293B",
    letterBadgeBorderHex: "#0F172A",
  },
};

export function resolveMcqChoiceVisualTokens(
  themeId: PrintColorThemeId | undefined,
  _palette?: PrintThemePaletteTokens
): McqChoiceVisualTokens {
  const effectiveThemeId: PrintColorThemeId =
    themeId && themeId in THEME_MCQ_TOKENS_MAP ? themeId : "math_teal";
  const baseTokens = THEME_MCQ_TOKENS_MAP[effectiveThemeId];
  const correctTokens =
    effectiveThemeId === "photocopy_black"
      ? PHOTOCOPY_CORRECT_TOKENS
      : STANDARD_CORRECT_TOKENS;

  return {
    capsuleBgHex: "#FFFFFF",
    letterBadgeTextHex: "#FFFFFF",
    choiceTextHex: "#0F172A",
    ...baseTokens,
    ...correctTokens,
  };
}
