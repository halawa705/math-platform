/**
 * @file a4-vector-html-sheet-renderer.ts
 * @description مصير صفحات A4 HTML/SVG بالطابع الوزاري المصري الفاخر (المعاصر / الفارس المطوّر)
 * والخلفية البيضاء الناصعة (#ffffff).
 * يوفر نظام السمات اللونية الخمس الفاخرة وعقد العناصر القابلة للطباعة (بما يشمل كبسولات المفاهيم،
 * القوانين المؤطرة، خطوات الحل المرقمة، شارات المحافظات، وجدول مفاتيح الإجابة).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import type { QuestionAssessmentIR } from "../ir/question-assessment-ir";
import type { CanonicalGeometryFigureIR } from "../ssot/geometry-archetype-ssot";
import type { PrintColorThemeId } from "../ssot/pdf-print-settings-ssot";

export const MODULE_ID_A4_VECTOR_HTML_SHEET_RENDERER =
  "a4_vector_html_sheet_renderer" as const;

export interface PrintableMathQuestionItem {
  readonly id: string;
  readonly questionNumber: number;
  readonly kind: "mcq" | "essay_geometry" | "essay_algebra";
  readonly branchBadgeAr: string;
  readonly marks: number;
  readonly promptAr: string;
  readonly mcqChoicesAr?: readonly [string, string, string, string];
  readonly correctMcqIndex?: 0 | 1 | 2 | 3;
  readonly modelAnswerAr: string;
  readonly solutionStepsAr?: readonly string[];
  readonly givenDataAr?: string;
  readonly requiredToFindAr?: string;
  readonly citationBadgeAr?: string;
  readonly geometryFigure?: CanonicalGeometryFigureIR;
  /** حقول إضافية اختيارية خاصة بالمذكرات التعليمية والمراجعات النهائية */
  readonly ideaBannerTitleAr?: string;
  readonly conceptExplanationAr?: string;
  readonly framedRuleAr?: string;
  readonly studentDrillPromptAr?: string;
}

export interface PrintThemePaletteTokens {
  readonly primaryHex: string;
  readonly secondaryHex: string;
  readonly accentHex: string;
  readonly badgeBgHex: string;
  readonly borderHex: string;
  readonly softSurfaceHex: string;
  readonly ruleBgHex: string;
  readonly ruleBorderHex: string;
  readonly solvedBgHex: string;
  readonly solvedBorderHex: string;
  readonly solvedTextHex: string;
  readonly headerGradientCss: string;
}

export function resolvePrintThemePalette(
  themeId: PrintColorThemeId
): PrintThemePaletteTokens {
  if (themeId === "emerald_moasser") {
    return {
      primaryHex: "#3B0764",
      secondaryHex: "#6B21A8",
      accentHex: "#9333EA",
      badgeBgHex: "#F3E8FF",
      borderHex: "#7E22CE",
      softSurfaceHex: "#FAF5FF",
      ruleBgHex: "#FDF4FF",
      ruleBorderHex: "#A855F7",
      solvedBgHex: "#FAF5FF",
      solvedBorderHex: "#C084FC",
      solvedTextHex: "#3B0764",
      headerGradientCss:
        "linear-gradient(135deg, #2E1065 0%, #581C87 55%, #7E22CE 100%)",
    };
  }
  if (themeId === "math_teal") {
    return {
      primaryHex: "#0F172A",
      secondaryHex: "#0369A1",
      accentHex: "#0284C7",
      badgeBgHex: "#F0F9FF",
      borderHex: "#0284C7",
      softSurfaceHex: "#F8FAFC",
      ruleBgHex: "#F0F9FF",
      ruleBorderHex: "#38BDF8",
      solvedBgHex: "#F0F9FF",
      solvedBorderHex: "#7DD3FC",
      solvedTextHex: "#0C4A6E",
      headerGradientCss:
        "linear-gradient(135deg, #0F172A 0%, #1E3A8A 55%, #0284C7 100%)",
    };
  }
  if (themeId === "amber_gold") {
    return {
      primaryHex: "#451A03",
      secondaryHex: "#92400E",
      accentHex: "#D97706",
      badgeBgHex: "#FFFBEB",
      borderHex: "#B45309",
      softSurfaceHex: "#FEF3C7",
      ruleBgHex: "#FFF7ED",
      ruleBorderHex: "#EA580C",
      solvedBgHex: "#FFFBEB",
      solvedBorderHex: "#FCD34D",
      solvedTextHex: "#451A03",
      headerGradientCss:
        "linear-gradient(135deg, #451A03 0%, #78350F 55%, #B45309 100%)",
    };
  }
  if (themeId === "photocopy_black") {
    return {
      primaryHex: "#000000",
      secondaryHex: "#1E293B",
      accentHex: "#334155",
      badgeBgHex: "#F8FAFC",
      borderHex: "#0F172A",
      softSurfaceHex: "#F8FAFC",
      ruleBgHex: "#F8FAFC",
      ruleBorderHex: "#334155",
      solvedBgHex: "#F8FAFC",
      solvedBorderHex: "#64748B",
      solvedTextHex: "#0F172A",
      headerGradientCss: "linear-gradient(135deg, #000000 0%, #1E293B 100%)",
    };
  }
  return {
    primaryHex: "#2E1065",
    secondaryHex: "#4C1D95",
    accentHex: "#7C3AED",
    badgeBgHex: "#F5F3FF",
    borderHex: "#6D28D9",
    softSurfaceHex: "#FAF5FF",
    ruleBgHex: "#F3E8FF",
    ruleBorderHex: "#8B5CF6",
    solvedBgHex: "#F5F3FF",
    solvedBorderHex: "#C4B5FD",
    solvedTextHex: "#2E1065",
    headerGradientCss:
      "linear-gradient(135deg, #1E1B4B 0%, #3B0764 52%, #6D28D9 100%)",
  };
}

/**
 * يحول عنصر `QuestionAssessmentIR` القياسي إلى عنصر مطبعي غني بكافة البيانات (`PrintableMathQuestionItem`).
 */
export function convertQuestionAssessmentIRToPrintableItem(
  q: QuestionAssessmentIR,
  branchNameAr: string
): PrintableMathQuestionItem {
  const isGeo = Boolean(q.attachedGeometryFigure);
  return {
    id: q.questionId,
    questionNumber: q.displayOrderNumber,
    kind: q.patternKind === "mcq" ? "mcq" : isGeo ? "essay_geometry" : "essay_algebra",
    branchBadgeAr: branchNameAr,
    marks: q.allocatedMarks,
    promptAr: q.promptArabic,
    mcqChoicesAr: q.mcqChoicesArabic,
    correctMcqIndex: q.correctMcqChoiceIndex,
    modelAnswerAr:
      q.modelSolutionStepsArabic.length > 0
        ? q.modelSolutionStepsArabic.join(" ⇐ ")
        : q.finalCanonicalAnswerArabic,
    solutionStepsAr:
      q.modelSolutionStepsArabic.length > 0
        ? q.modelSolutionStepsArabic
        : [q.finalCanonicalAnswerArabic],
    givenDataAr:
      q.givenDataArabic && q.givenDataArabic.length > 0
        ? q.givenDataArabic.join(" ، ")
        : undefined,
    requiredToFindAr: q.requiredToProveOrFindArabic,
    citationBadgeAr: q.authenticCitation?.governorateNameArabic,
    geometryFigure: q.attachedGeometryFigure,
  };
}
