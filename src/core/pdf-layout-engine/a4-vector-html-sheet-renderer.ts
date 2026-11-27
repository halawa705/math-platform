/**
 * @file a4-vector-html-sheet-renderer.ts
 * @description مصير صفحات A4 HTML/SVG بالطابع الوزاري المصري الفاخر (المعاصر / الفارس المطوّر)
 * والخلفية البيضاء الناصعة (#ffffff).
 * يوفر نظام السمات اللونية الخمس الفاخرة وعقد العناصر القابلة للطباعة (بما يشمل كبسولات المفاهيم،
 * القوانين المؤطرة، خطوات الحل المرقمة، شارات المحافظات، وجدول مفاتيح الإجابة).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import type { MathQuestionCognitiveDepth, QuestionAssessmentIR } from "../ir/question-assessment-ir";
import type { CanonicalGeometryFigureIR } from "../ssot/geometry-archetype-ssot";
import type { CartesianGraphSpec } from "../ssot/cartesian-graph-spec-ssot";
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
  /** فهارس البدائل التي كانت فارغة في المصدر وملأها النظام تلقائياً بقيمة مشابهة خاطئة (تُلوّن بالأخضر) */
  readonly synthesizedMcqIndices?: readonly number[];
  readonly modelAnswerAr: string;
  readonly solutionStepsAr?: readonly string[];
  readonly givenDataAr?: string;
  readonly requiredToFindAr?: string;
  readonly citationBadgeAr?: string;
  readonly ideaIndex?: number;
  readonly geometryFigure?: CanonicalGeometryFigureIR;
  readonly graphSpec?: CartesianGraphSpec;
  readonly rawSvgMarkup?: string;
  readonly figureDiagnosticsAr?: readonly string[];
  readonly answerLinesCount?: number;
  readonly hasCustomAnswerLines?: boolean;
  readonly hasDottedDivider?: boolean;
  /** حقول إضافية اختيارية خاصة بالمذكرات التعليمية والمراجعات النهائية */
  readonly ideaBannerTitleAr?: string;
  readonly conceptExplanationAr?: string;
  readonly framedRuleAr?: string;
  readonly studentDrillPromptAr?: string;
  readonly isWorkedExample?: boolean;
  readonly cognitiveDepth?: MathQuestionCognitiveDepth;
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
  // ٠. سماوي المذكرات (الافتراضي: ألوان المذكرة المرجعية — أزرق سماوي صريح مع بنفسجي أنديجو وقرمزي هادئ)
  if (themeId === "sky_editorial") {
    return {
      primaryHex: "#0284C7",
      secondaryHex: "#5B3E96",
      accentHex: "#C81E1E",
      badgeBgHex: "#E3F2F8",
      borderHex: "#2998D0",
      softSurfaceHex: "#ECE9F5",
      ruleBgHex: "#F0F8FC",
      ruleBorderHex: "#0284C7",
      solvedBgHex: "#F0FDF4",
      solvedBorderHex: "#15803D",
      solvedTextHex: "#064E3B",
      headerGradientCss:
        "linear-gradient(135deg, #0369A1 0%, #0284C7 55%, #0EA5E9 100%)",
    };
  }
  // ١. أرجواني المعاصر (باذنجاني ملكي مطفأ ومتناغم مطبعياً)
  if (themeId === "emerald_moasser") {
    return {
      primaryHex: "#331459",
      secondaryHex: "#4C227E",
      accentHex: "#6B38A6",
      badgeBgHex: "#F4EFFA",
      borderHex: "#6E4F9E",
      softSurfaceHex: "#FAF8FD",
      ruleBgHex: "#F7F3FC",
      ruleBorderHex: "#7C58B0",
      solvedBgHex: "#F5F3FA",
      solvedBorderHex: "#9F87C4",
      solvedTextHex: "#2D124F",
      headerGradientCss:
        "linear-gradient(135deg, #240D40 0%, #3B1866 55%, #552789 100%)",
    };
  }
  // ٢. أزرق ملكي (الافتراضي: ياقوتي ملكي عميق مع كحلي فولاذي هادئ)
  if (themeId === "math_teal") {
    return {
      primaryHex: "#172B5E",
      secondaryHex: "#23427C",
      accentHex: "#2B5B9E",
      badgeBgHex: "#EEF3FA",
      borderHex: "#4A6FA5",
      softSurfaceHex: "#F7F9FC",
      ruleBgHex: "#F2F6FC",
      ruleBorderHex: "#3B629B",
      solvedBgHex: "#F4F8F6",
      solvedBorderHex: "#6DA88E",
      solvedTextHex: "#134030",
      headerGradientCss:
        "linear-gradient(135deg, #112046 0%, #1B356B 55%, #284E8F 100%)",
    };
  }
  // ٣. ذهبي المراجعات (برونزي إسبرسو دافئ مع عنبري مطفأ)
  if (themeId === "amber_gold") {
    return {
      primaryHex: "#422008",
      secondaryHex: "#6B3710",
      accentHex: "#9C5A25",
      badgeBgHex: "#FBF5EE",
      borderHex: "#94663B",
      softSurfaceHex: "#FCF9F4",
      ruleBgHex: "#FAF4EC",
      ruleBorderHex: "#A66A32",
      solvedBgHex: "#FAF6F0",
      solvedBorderHex: "#C49A6C",
      solvedTextHex: "#3E1E07",
      headerGradientCss:
        "linear-gradient(135deg, #331805 0%, #592D0C 55%, #824618 100%)",
    };
  }
  // ٤. أسود نقي (تصوير ليزري حاد وعالي التباين)
  if (themeId === "photocopy_black") {
    return {
      primaryHex: "#000000",
      secondaryHex: "#1E293B",
      accentHex: "#334155",
      badgeBgHex: "#F8FAFC",
      borderHex: "#1E293B",
      softSurfaceHex: "#FFFFFF",
      ruleBgHex: "#FFFFFF",
      ruleBorderHex: "#334155",
      solvedBgHex: "#FFFFFF",
      solvedBorderHex: "#475569",
      solvedTextHex: "#000000",
      headerGradientCss: "linear-gradient(135deg, #000000 0%, #1E293B 100%)",
    };
  }
  // ٤ب. كحلي وذهبي فاخر (كحلي أكسفورد عميق مع لمسات ذهبية عتيقة مطفأة)
  if (themeId === "navy_gold") {
    return {
      primaryHex: "#0F1E36",
      secondaryHex: "#1C3358",
      accentHex: "#9A7828",
      badgeBgHex: "#F8F4EA",
      borderHex: "#344D73",
      softSurfaceHex: "#FAF8F3",
      ruleBgHex: "#FBF8F0",
      ruleBorderHex: "#B08D3A",
      solvedBgHex: "#F4F7F4",
      solvedBorderHex: "#7A9E84",
      solvedTextHex: "#193824",
      headerGradientCss:
        "linear-gradient(135deg, #0A1526 0%, #132644 58%, #1E3A63 100%)",
    };
  }
  // ٥. زمردي المعاصر الأصيل (زمردي غابي عميق وحواف ميرمية هادئة)
  return {
    primaryHex: "#0A4736",
    secondaryHex: "#115E49",
    accentHex: "#1B7A62",
    badgeBgHex: "#EDF7F4",
    borderHex: "#3D7A68",
    softSurfaceHex: "#F6FBF9",
    ruleBgHex: "#F2F9F6",
    ruleBorderHex: "#2E705C",
    solvedBgHex: "#EEF8F4",
    solvedBorderHex: "#6EB09B",
    solvedTextHex: "#0A4736",
    headerGradientCss:
      "linear-gradient(135deg, #073629 0%, #0D523E 55%, #166B54 100%)",
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
    synthesizedMcqIndices: q.synthesizedMcqIndices,
    modelAnswerAr:
      q.modelSolutionStepsArabic.length > 0
        ? q.modelSolutionStepsArabic.join(" ⇐ ")
        : q.finalCanonicalAnswerArabic,
    solutionStepsAr:
      q.modelSolutionStepsArabic.length > 0
        ? q.modelSolutionStepsArabic
        : q.finalCanonicalAnswerArabic?.trim().length > 0
          ? [q.finalCanonicalAnswerArabic]
          : undefined,
    givenDataAr:
      q.givenDataArabic && q.givenDataArabic.length > 0
        ? q.givenDataArabic.join(" ، ")
        : undefined,
    requiredToFindAr: q.requiredToProveOrFindArabic,
    citationBadgeAr: q.authenticCitation?.governorateNameArabic,
    geometryFigure: q.attachedGeometryFigure,
    graphSpec: q.graphSpec,
    rawSvgMarkup: q.rawSvgMarkup,
    figureDiagnosticsAr: q.figureDiagnosticsAr,
    answerLinesCount: q.answerLinesCount,
    hasCustomAnswerLines: q.hasCustomAnswerLines,
    hasDottedDivider: q.hasDottedDivider,
    cognitiveDepth: q.cognitiveDepth,
  };
}
