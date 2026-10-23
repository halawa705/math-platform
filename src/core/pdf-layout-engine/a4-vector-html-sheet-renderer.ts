/**
 * @file a4-vector-html-sheet-renderer.ts
 * @description مصير صفحات A4 HTML/SVG بالطابع الوزاري المصري الفاخر (المعاصر / الفارس المطوّر)
 * والخلفية البيضاء الناصعة (#ffffff).
 * يوفر حزمة الأمثلة والأسئلة الرياضية القياسية (تتضمن كسوراً جبرية وأشكالاً هندسية متجهية SVG مدمجة)
 * بدون أي تسرب لرموز LaTeX أو ازدواجية في الأرقام.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import type { CanonicalGeometryFigureIR } from "../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../ssot/numeral-and-unit-ssot";
import type { PrintColorThemeId } from "../ssot/pdf-print-settings-ssot";
import { buildTriangleMidsegmentFigure } from "../geometry-engine/triangle-family/triangle-midsegment-branch";
import { createTriangleRootCore } from "../geometry-engine/triangle-family/triangle-root-core";

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
  readonly modelAnswerAr: string;
  readonly geometryFigure?: CanonicalGeometryFigureIR;
}

export function resolvePrintThemePalette(themeId: PrintColorThemeId) {
  if (themeId === "math_teal") {
    return {
      primaryHex: "#0F766E",
      secondaryHex: "#115E59",
      badgeBgHex: "#F0FDFA",
      borderHex: "#0D9488",
    };
  }
  if (themeId === "photocopy_black") {
    return {
      primaryHex: "#000000",
      secondaryHex: "#1E293B",
      badgeBgHex: "#F8FAFC",
      borderHex: "#000000",
    };
  }
  return {
    primaryHex: "#1E1B4B",
    secondaryHex: "#312E81",
    badgeBgHex: "#EEF2FF",
    borderHex: "#4338CA",
  };
}

export function buildSampleHighDensityMathSheetQuestions(
  notationLanguage: MathNotationLanguage = "arabic"
): readonly PrintableMathQuestionItem[] {
  const midsegmentFig = buildTriangleMidsegmentFigure({
    figureId: "q_midseg_1",
    thirdSideLengthCm: 12,
    notationLanguage,
  });

  const rightTriRoot = createTriangleRootCore({
    idPrefix: "q_right_2",
    kind: "right",
    notationLanguage,
    baseLengthCm: 8,
    heightLengthCm: 6,
  });

  const pythagorasFig: CanonicalGeometryFigureIR = {
    figureId: "q_right_2",
    familyId: "triangle_family",
    branchId: "triangle_right_pythagoras",
    titleArabic: "مثلث قائم الزاوية في ب",
    notationLanguage,
    vertices: [
      rightTriRoot.vertexTop,
      rightTriRoot.vertexRight,
      rightTriRoot.vertexLeft,
    ],
    segments: [
      {
        id: "seg_ab_r",
        fromVertexId: rightTriRoot.vertexTop.id,
        toVertexId: rightTriRoot.vertexRight.id,
        lengthLabel: { value: 6, unit: "سم" },
      },
      {
        id: "seg_bc_r",
        fromVertexId: rightTriRoot.vertexRight.id,
        toVertexId: rightTriRoot.vertexLeft.id,
        lengthLabel: { value: 8, unit: "سم" },
      },
      {
        id: "seg_ac_r",
        fromVertexId: rightTriRoot.vertexTop.id,
        toVertexId: rightTriRoot.vertexLeft.id,
        strokeStyle: "dashed",
      },
    ],
    angles: [],
  };

  return [
    {
      id: "math_q_1",
      questionNumber: 1,
      kind: "essay_algebra",
      branchBadgeAr: "تطبيقي • كسور جبرية",
      marks: 3,
      promptAr:
        "أوجد ناتج جمع الكسرين الجبريين $\\frac{2س + 1}{س + 1} + \\frac{س + 2}{س + 1}$ في أبسط صورة موضحاً المجال.",
      modelAnswerAr:
        "الخطوة ١: المقامات متماثلة وهو المقدار الخطي $(س + 1)$، والمجال $= ح - \\{-1\\}$. | الخطوة ٢: نجمع البسطين فوق المقام المشترك: $\\frac{(2س + 1) + (س + 2)}{س + 1} = \\frac{3س + 3}{س + 1} = \\frac{3(س + 1)}{س + 1} = 3$. | الناتج النهائي: $3$",
    },
    {
      id: "math_q_2",
      questionNumber: 2,
      kind: "essay_algebra",
      branchBadgeAr: "متقدم • كسور جبرية",
      marks: 3,
      promptAr:
        "أوجد ناتج طرح الكسرين الجبريين $\\frac{5س - 8}{س - 3} - \\frac{2س + 1}{س - 3}$ في أبسط صورة موضحاً المجال.",
      modelAnswerAr:
        "الخطوة ١: المقام الموحد هو $(س - 3)$، والمجال $= ح - \\{3\\}$. | الخطوة ٢: نطرح البسط الثاني مع توزيع إشارة السالب: $\\frac{5س - 8 - 2س - 1}{س - 3} = \\frac{3س - 9}{س - 3} = \\frac{3(س - 3)}{س - 3} = 3$. | الناتج النهائي: $3$",
    },
    {
      id: "math_q_3",
      questionNumber: 3,
      kind: "essay_geometry",
      branchBadgeAr: "هندسة مستوية • برهان",
      marks: 4,
      promptAr:
        "في الشكل المقابل: $د$ منتصف $أ ب$، $هـ$ منتصف $أ جـ$، وطول $ب جـ = 12$ سم. أوجد بالبرهان طول القطعة المستقيمة $د هـ$.",
      modelAnswerAr:
        "الخطوة ١: بما أن $د$ منتصف $أ ب$ و $هـ$ منتصف $أ جـ$ في المثلث $أ ب جـ$. | الخطوة ٢: إذن $د هـ \\parallel ب جـ$ ويساوي نصف طوله: $د هـ = \\frac{12}{2} = 6$ سم. | الناتج النهائي: $6$ سم",
      geometryFigure: midsegmentFig,
    },
    {
      id: "math_q_4",
      questionNumber: 4,
      kind: "essay_geometry",
      branchBadgeAr: "فيثاغورس وإقليدس",
      marks: 4,
      promptAr:
        "في الشكل المقابل: المثلث $أ ب جـ$ قائم الزاوية في $ب$، فيه $أ ب = 6$ سم، $ب جـ = 8$ سم. احسب طول الوتر $أ جـ$ ومساحة المثلث.",
      modelAnswerAr:
        "الخطوة ١: من نظرية فيثاغورس: $أ جـ = \\sqrt{6^2 + 8^2} = \\sqrt{36 + 64} = 10$ سم. | الخطوة ٢: مساحة المثلث $= \\frac{1}{2} \\times 8 \\times 6 = 24$ سم². | الناتج النهائي: $10$ سم ، $24$ سم²",
      geometryFigure: pythagorasFig,
    },
    {
      id: "math_q_5",
      questionNumber: 5,
      kind: "mcq",
      branchBadgeAr: "اختر • معكوس جمعي",
      marks: 2,
      promptAr:
        "المعكوس الجمعي للكسر الجبري $\\frac{س - 5}{س + 2}$ في أبسط صورة هو:",
      mcqChoicesAr: [
        "$\\frac{5 - س}{س + 2}$",
        "$\\frac{س + 5}{س + 2}$",
        "$\\frac{س + 2}{س - 5}$",
        "$\\frac{5 - س}{-س - 2}$",
      ],
      modelAnswerAr:
        "الخطوة ١: المعكوس الجمعي ينتج بتغيير إشارة البسط فقط ليصبح $\\frac{5 - س}{س + 2}$. | الناتج النهائي: (أ)",
    },
    {
      id: "math_q_6",
      questionNumber: 6,
      kind: "mcq",
      branchBadgeAr: "اختر • حساب مثلثات",
      marks: 2,
      promptAr:
        "في المثلث القائم الزاوية، إذا كان $\\text{جا}(\\theta) = \\frac{3}{5}$ حيث $\\theta$ زاوية حادة، فإن قيمة $\\text{جتا}(\\theta)$ تساوي:",
      mcqChoicesAr: [
        "$\\frac{4}{5}$",
        "$\\frac{3}{4}$",
        "$\\frac{5}{4}$",
        "$1$",
      ],
      modelAnswerAr:
        "الخطوة ١: من متطابقة فيثاغورس المثلثية: $\\text{جتا}(\\theta) = \\sqrt{1 - (\\frac{3}{5})^2} = \\frac{4}{5}$. | الناتج النهائي: (أ)",
    },
  ];
}
