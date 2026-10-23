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
      primaryHex: "#064E3B",
      secondaryHex: "#065F46",
      accentHex: "#D97706",
      badgeBgHex: "#ECFDF5",
      borderHex: "#059669",
      softSurfaceHex: "#F0FDF4",
      ruleBgHex: "#FFFBEB",
      ruleBorderHex: "#F59E0B",
      solvedBgHex: "#ECFDF5",
      solvedBorderHex: "#6EE7B7",
      solvedTextHex: "#064E3B",
      headerGradientCss: "linear-gradient(135deg, #064E3B 0%, #047857 100%)",
    };
  }
  if (themeId === "math_teal") {
    return {
      primaryHex: "#134E4A",
      secondaryHex: "#0F766E",
      accentHex: "#0284C7",
      badgeBgHex: "#F0FDFA",
      borderHex: "#0D9488",
      softSurfaceHex: "#F0FDFA",
      ruleBgHex: "#F0F9FF",
      ruleBorderHex: "#38BDF8",
      solvedBgHex: "#F0FDFA",
      solvedBorderHex: "#5EEAD4",
      solvedTextHex: "#134E4A",
      headerGradientCss: "linear-gradient(135deg, #134E4A 0%, #0F766E 100%)",
    };
  }
  if (themeId === "amber_gold") {
    return {
      primaryHex: "#78350F",
      secondaryHex: "#92400E",
      accentHex: "#B45309",
      badgeBgHex: "#FFFBEB",
      borderHex: "#D97706",
      softSurfaceHex: "#FEF3C7",
      ruleBgHex: "#FFF7ED",
      ruleBorderHex: "#EA580C",
      solvedBgHex: "#FEFCE8",
      solvedBorderHex: "#FDE047",
      solvedTextHex: "#713F12",
      headerGradientCss: "linear-gradient(135deg, #78350F 0%, #B45309 100%)",
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
    primaryHex: "#1E1B4B",
    secondaryHex: "#312E81",
    accentHex: "#4F46E5",
    badgeBgHex: "#EEF2FF",
    borderHex: "#4338CA",
    softSurfaceHex: "#F5F3FF",
    ruleBgHex: "#EEF2FF",
    ruleBorderHex: "#6366F1",
    solvedBgHex: "#ECFDF5",
    solvedBorderHex: "#6EE7B7",
    solvedTextHex: "#064E3B",
    headerGradientCss: "linear-gradient(135deg, #1E1B4B 0%, #3730A3 100%)",
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
