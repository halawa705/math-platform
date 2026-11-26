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
    case "emerald_moasser": // أرجواني المعاصر -> باذنجاني ملكي هادئ مع أنديجو رصين
      return isOddQuestion
        ? {
            badgeBgColorHex: "#331459",
            badgeGradientCss: "linear-gradient(135deg, #240D40 0%, #4C227E 100%)",
            cardBorderColorHex: "#6E4F9E",
            accentStepBorderHex: "#4C227E",
          }
        : {
            badgeBgColorHex: "#24194A",
            badgeGradientCss: "linear-gradient(135deg, #1E153F 0%, #3E2D75 100%)",
            cardBorderColorHex: "#65589E",
            accentStepBorderHex: "#332563",
          };

    case "amber_gold": // ذهبي المراجعات -> برونزي إسبرسو مع عنبري مطفأ
      return isOddQuestion
        ? {
            badgeBgColorHex: "#422008",
            badgeGradientCss: "linear-gradient(135deg, #331805 0%, #6B3710 100%)",
            cardBorderColorHex: "#94663B",
            accentStepBorderHex: "#6B3710",
          }
        : {
            badgeBgColorHex: "#592D0C",
            badgeGradientCss: "linear-gradient(135deg, #472409 0%, #824618 100%)",
            cardBorderColorHex: "#A66A32",
            accentStepBorderHex: "#6B3710",
          };

    case "navy_gold": // كحلي وذهبي -> كحلي أكسفورد عميق مع برونزي ذهبي عتيق مطفأ
      return isOddQuestion
        ? {
            badgeBgColorHex: "#0F1E36",
            badgeGradientCss: "linear-gradient(135deg, #0A1526 0%, #1C3358 100%)",
            cardBorderColorHex: "#344D73",
            accentStepBorderHex: "#1C3358",
          }
        : {
            badgeBgColorHex: "#594312",
            badgeGradientCss: "linear-gradient(135deg, #47350D 0%, #7C5F1C 100%)",
            cardBorderColorHex: "#B08D3A",
            accentStepBorderHex: "#9A7828",
          };

    case "royal_indigo": // زمردي المعاصر -> زمردي غابي عميق مع ميرمية هادئة
      return isOddQuestion
        ? {
            badgeBgColorHex: "#0A4736",
            badgeGradientCss: "linear-gradient(135deg, #073629 0%, #115E49 100%)",
            cardBorderColorHex: "#3D7A68",
            accentStepBorderHex: "#115E49",
          }
        : {
            badgeBgColorHex: "#12423D",
            badgeGradientCss: "linear-gradient(135deg, #0C332F 0%, #195E57 100%)",
            cardBorderColorHex: "#467E77",
            accentStepBorderHex: "#12423D",
          };

    case "photocopy_black": // تصوير ليزري -> فحمي وأسود عالي التباين
      return isOddQuestion
        ? {
            badgeBgColorHex: "#0F172A",
            badgeGradientCss: "linear-gradient(135deg, #000000 0%, #1E293B 100%)",
            cardBorderColorHex: "#334155",
            accentStepBorderHex: "#0F172A",
          }
        : {
            badgeBgColorHex: "#1E293B",
            badgeGradientCss: "linear-gradient(135deg, #0F172A 0%, #334155 100%)",
            cardBorderColorHex: "#475569",
            accentStepBorderHex: "#1E293B",
          };

    case "math_teal": // الأزرق الملكي -> ياقوتي ملكي هادئ مع كحلي فولاذي رصين
    default:
      return isOddQuestion
        ? {
            badgeBgColorHex: "#172B5E",
            badgeGradientCss: "linear-gradient(135deg, #112046 0%, #23427C 100%)",
            cardBorderColorHex: "#4A6FA5",
            accentStepBorderHex: "#23427C",
          }
        : {
            badgeBgColorHex: "#1C3B5E",
            badgeGradientCss: "linear-gradient(135deg, #142B47 0%, #2B5B8A 100%)",
            cardBorderColorHex: "#4E78A0",
            accentStepBorderHex: "#1C3B5E",
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

  const isPhotocopy = themeId === "photocopy_black";
  const cardSurfaceBgHex = isPhotocopy
    ? "#FFFFFF"
    : isBookletSolvedExample
      ? palette.softSurfaceHex
      : "#FFFFFF";

  const cardBorderColorHex = isPhotocopy
    ? "#334155"
    : isBookletSolvedExample
      ? isOddQuestion
        ? palette.borderHex
        : palette.ruleBorderHex
      : isBookletDrill
        ? palette.secondaryHex
        : isBookletHomework
          ? palette.accentHex
          : palette.borderHex;

  const badgeBgColorHex = isPhotocopy
    ? "#0F172A"
    : isBookletSolvedExample
      ? isOddQuestion
        ? palette.primaryHex
        : palette.secondaryHex
      : isBookletDrill
        ? palette.secondaryHex
        : isBookletHomework
          ? palette.accentHex
          : palette.primaryHex;

  const badgeGradientCss = isPhotocopy
    ? "linear-gradient(135deg, #0F172A 0%, #334155 100%)"
    : isBookletSolvedExample
      ? isOddQuestion
        ? palette.headerGradientCss
        : `linear-gradient(135deg, ${palette.secondaryHex} 0%, ${palette.accentHex} 100%)`
      : isBookletDrill
        ? `linear-gradient(135deg, ${palette.primaryHex} 0%, ${palette.secondaryHex} 100%)`
        : isBookletHomework
          ? `linear-gradient(135deg, ${palette.secondaryHex} 0%, ${palette.accentHex} 100%)`
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
