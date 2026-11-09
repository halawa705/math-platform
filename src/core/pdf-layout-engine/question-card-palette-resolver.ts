/**
 * @file question-card-palette-resolver.ts
 * @description محلل ألوان وحواف وتدرجات بطاقة المسألة والإجابة في الـ PDF:
 * يولد لوحة ألوان وتدرجات جراديانت راقية لشارات الإجابة تتناغم بعناية من روح كل سمة لونية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 160 سطراً).
 */

import type { PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";
import type { PrintColorThemeId } from "../ssot/pdf-print-settings-ssot";

export interface QuestionCardColorScheme {
  readonly cardSurfaceBgHex: string;
  readonly cardBorderColorHex: string;
  readonly badgeBgColorHex: string;
  readonly badgeGradientCss: string;
  readonly exampleRoleLabel: string;
}

export interface AnswerThemeTokens {
  readonly badgeBgColorHex: string;
  readonly badgeGradientCss: string;
  readonly cardBorderColorHex: string;
  readonly accentStepBorderHex: string;
}

/**
 * يولد حزمة ألوان وتدرجات الجراديانت الفاخرة المخصصة للإجابات بناءً على السمة اللونية.
 * تعتمد فلسفة التناغم الرصين المشتق من عائلة السمة نفسها لتجنب أي نشاز بصري.
 */
export function resolveAnswerThemeTokens(
  themeId: PrintColorThemeId | undefined,
  isOddQuestion: boolean
): AnswerThemeTokens {
  switch (themeId) {
    case "emerald_moasser": // أرجواني المعاصر -> تدرج أرجواني فاخر مع كحلي أنديجو عميق
      return isOddQuestion
        ? {
            badgeBgColorHex: "#4C1D95",
            badgeGradientCss: "linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%)",
            cardBorderColorHex: "#8B5CF6",
            accentStepBorderHex: "#6D28D9",
          }
        : {
            badgeBgColorHex: "#1E1B4B",
            badgeGradientCss: "linear-gradient(135deg, #1E1B4B 0%, #4338CA 100%)",
            cardBorderColorHex: "#6366F1",
            accentStepBorderHex: "#3730A3",
          };

    case "amber_gold": // ذهبي المراجعات -> ألوان كلاسيكية معتمدة وفاخرة
      return isOddQuestion
        ? {
            badgeBgColorHex: "#78350F",
            badgeGradientCss: "linear-gradient(135deg, #78350F 0%, #B45309 100%)",
            cardBorderColorHex: "#D97706",
            accentStepBorderHex: "#B45309",
          }
        : {
            badgeBgColorHex: "#92400E",
            badgeGradientCss: "linear-gradient(135deg, #92400E 0%, #D97706 100%)",
            cardBorderColorHex: "#F59E0B",
            accentStepBorderHex: "#92400E",
          };

    case "navy_gold": // كحلي وذهبي -> كحلي داكن ملكي مع ذهبي عنبري أصيل
      return isOddQuestion
        ? {
            badgeBgColorHex: "#0F172A",
            badgeGradientCss: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)",
            cardBorderColorHex: "#B8892B",
            accentStepBorderHex: "#1E3A8A",
          }
        : {
            badgeBgColorHex: "#78350F",
            badgeGradientCss: "linear-gradient(135deg, #78350F 0%, #B45309 100%)",
            cardBorderColorHex: "#D4AF5A",
            accentStepBorderHex: "#B8892B",
          };

    case "royal_indigo": // زمردي المعاصر -> تدرج زمردي مشرق مع تيل غابي وقور
      return isOddQuestion
        ? {
            badgeBgColorHex: "#064E3B",
            badgeGradientCss: "linear-gradient(135deg, #064E3B 0%, #059669 100%)",
            cardBorderColorHex: "#10B981",
            accentStepBorderHex: "#059669",
          }
        : {
            badgeBgColorHex: "#134E4A",
            badgeGradientCss: "linear-gradient(135deg, #134E4A 0%, #0F766E 100%)",
            cardBorderColorHex: "#14B8A6",
            accentStepBorderHex: "#0F766E",
          };

    case "photocopy_black": // تصوير ليزري -> تدرج رمادي وفحمي عالي التباين
      return isOddQuestion
        ? {
            badgeBgColorHex: "#1E293B",
            badgeGradientCss: "linear-gradient(135deg, #1E293B 0%, #475569 100%)",
            cardBorderColorHex: "#64748B",
            accentStepBorderHex: "#1E293B",
          }
        : {
            badgeBgColorHex: "#0F172A",
            badgeGradientCss: "linear-gradient(135deg, #0F172A 0%, #334155 100%)",
            cardBorderColorHex: "#475569",
            accentStepBorderHex: "#0F172A",
          };

    case "math_teal": // الأزرق الملكي -> أزرق كحلي ملكي هادئ مع تيل مائي وقور
    default:
      return isOddQuestion
        ? {
            badgeBgColorHex: "#1E3A8A",
            badgeGradientCss: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)",
            cardBorderColorHex: "#3B82F6",
            accentStepBorderHex: "#1D4ED8",
          }
        : {
            badgeBgColorHex: "#0F766E",
            badgeGradientCss: "linear-gradient(135deg, #0F766E 0%, #0D9488 100%)",
            cardBorderColorHex: "#14B8A6",
            accentStepBorderHex: "#0F766E",
          };
  }
}

export function resolveQuestionCardColorScheme(params: {
  readonly isBookletSolvedExample: boolean;
  readonly isBookletDrill: boolean;
  readonly isBookletHomework: boolean;
  readonly isOddQuestion: boolean;
  readonly palette: PrintThemePaletteTokens;
  readonly isAnswerCard?: boolean;
  readonly themeId?: PrintColorThemeId;
}): QuestionCardColorScheme {
  const { isBookletSolvedExample, isBookletDrill, isBookletHomework, isOddQuestion, palette, isAnswerCard, themeId } = params;

  if (isAnswerCard) {
    const answerTokens = resolveAnswerThemeTokens(themeId, isOddQuestion);
    return {
      cardSurfaceBgHex: "#FFFFFF",
      cardBorderColorHex: answerTokens.cardBorderColorHex,
      badgeBgColorHex: answerTokens.badgeBgColorHex,
      badgeGradientCss: answerTokens.badgeGradientCss,
      exampleRoleLabel: "إجابة معتمدة",
    };
  }

  const cardSurfaceBgHex = "#FFFFFF";

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
      ? "#059669"
      : "#0284C7"
    : palette.primaryHex;

  const badgeGradientCss = isBookletSolvedExample
    ? isOddQuestion
      ? "linear-gradient(135deg, #059669 0%, #10B981 100%)"
      : "linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)"
    : isBookletDrill
      ? "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)"
      : isBookletHomework
        ? "linear-gradient(135deg, #9D174D 0%, #BE185D 100%)"
        : palette.headerGradientCss;

  const exampleRoleLabel = isOddQuestion ? "تطبيقي" : "متقدم";

  return {
    cardSurfaceBgHex,
    cardBorderColorHex,
    badgeBgColorHex,
    badgeGradientCss,
    exampleRoleLabel,
  };
}
