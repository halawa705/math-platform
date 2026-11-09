/**
 * @file question-card-palette-resolver.ts
 * @description محلل ألوان وحواف وتدرجات بطاقة المسألة والإجابة في الـ PDF:
 * يولد لوحة ألوان وتدرجات جراديانت راقية لشارات الإجابة تتناغم فريداً مع كل سمة لونية.
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
 * تضمن التنوع الجمالي والتكامل البصري بدون تكرار لون الأسئلة بشكل باهت أو جاف.
 */
export function resolveAnswerThemeTokens(
  themeId: PrintColorThemeId | undefined,
  isOddQuestion: boolean
): AnswerThemeTokens {
  switch (themeId) {
    case "emerald_moasser": // أرجواني المعاصر -> إجابات بأزرق فيروزي مشرق أو زمردي نضر
      return isOddQuestion
        ? {
            badgeBgColorHex: "#0284C7",
            badgeGradientCss: "linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)",
            cardBorderColorHex: "#38BDF8",
            accentStepBorderHex: "#0284C7",
          }
        : {
            badgeBgColorHex: "#059669",
            badgeGradientCss: "linear-gradient(135deg, #059669 0%, #34D399 100%)",
            cardBorderColorHex: "#34D399",
            accentStepBorderHex: "#059669",
          };

    case "amber_gold": // ذهبي المراجعات -> إجابات بأزرق ياقوتي أو وردي عقيق فاخر
      return isOddQuestion
        ? {
            badgeBgColorHex: "#1D4ED8",
            badgeGradientCss: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)",
            cardBorderColorHex: "#60A5FA",
            accentStepBorderHex: "#1D4ED8",
          }
        : {
            badgeBgColorHex: "#BE123C",
            badgeGradientCss: "linear-gradient(135deg, #9F1239 0%, #FB7185 100%)",
            cardBorderColorHex: "#FB7185",
            accentStepBorderHex: "#BE123C",
          };

    case "navy_gold": // كحلي وذهبي -> إجابات بكهرماني نحاسي دافئ أو أخضر ملكي متدرج
      return isOddQuestion
        ? {
            badgeBgColorHex: "#C2410C",
            badgeGradientCss: "linear-gradient(135deg, #C2410C 0%, #FB923C 100%)",
            cardBorderColorHex: "#FB923C",
            accentStepBorderHex: "#C2410C",
          }
        : {
            badgeBgColorHex: "#047857",
            badgeGradientCss: "linear-gradient(135deg, #047857 0%, #34D399 100%)",
            cardBorderColorHex: "#34D399",
            accentStepBorderHex: "#047857",
          };

    case "royal_indigo": // زمردي المعاصر الأصيل -> إجابات بنيلي كحلي أو قرمزي دافئ
      return isOddQuestion
        ? {
            badgeBgColorHex: "#4338CA",
            badgeGradientCss: "linear-gradient(135deg, #4338CA 0%, #818CF8 100%)",
            cardBorderColorHex: "#818CF8",
            accentStepBorderHex: "#4338CA",
          }
        : {
            badgeBgColorHex: "#B91C1C",
            badgeGradientCss: "linear-gradient(135deg, #B91C1C 0%, #F87171 100%)",
            cardBorderColorHex: "#F87171",
            accentStepBorderHex: "#B91C1C",
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

    case "math_teal": // الأزرق الملكي (الافتراضي) -> تيل زمردي مشرق أو بنفسجي ملكي عصري
    default:
      return isOddQuestion
        ? {
            badgeBgColorHex: "#0D9488",
            badgeGradientCss: "linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)",
            cardBorderColorHex: "#14B8A6",
            accentStepBorderHex: "#0D9488",
          }
        : {
            badgeBgColorHex: "#4F46E5",
            badgeGradientCss: "linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)",
            cardBorderColorHex: "#818CF8",
            accentStepBorderHex: "#4F46E5",
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
