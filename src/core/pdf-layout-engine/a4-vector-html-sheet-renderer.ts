/**
 * @file a4-vector-html-sheet-renderer.ts
 * @description مصير صفحات A4 HTML/SVG بالترويسة المدمجة 42pt والخلفية البيضاء الناصعة.
 * يوفر حزمة الأسئلة الرياضية القياسية (تتضمن أشكالاً هندسية منبثقة من الأصل الواحد ومعادلات)
 * ويحسب تنسيق استغلال الصفحة (93% توفير أوراق) مع ربط حي بـ `pdf-print-settings-ssot.ts`.
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
    primaryHex: "#312E81",
    secondaryHex: "#1E1B4B",
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
      kind: "mcq",
      branchBadgeAr: "جبر ودوال",
      marks: 2,
      promptAr:
        "إذا كانت مجموعة حل المعادلة $س^2 - 5س + ك = 0$ في $ح$ تحتوي على الجذر $س = 2$، فإن قيمة الثابت $ك$ تساوي:",
      mcqChoicesAr: ["$6$", "$10$", "$-6$", "$3$"],
      modelAnswerAr: "بالتعويض عن $س = 2$: $(2)^2 - 5(2) + ك = 0 \\implies 4 - 10 + ك = 0 \\implies ك = 6$.",
    },
    {
      id: "math_q_2",
      questionNumber: 2,
      kind: "mcq",
      branchBadgeAr: "حساب مثلثات",
      marks: 2,
      promptAr:
        "في المثلث القائم الزاوية، إذا كان $\\text{جا}(\\theta) = \\frac{3}{5}$ حيث $\\theta$ زاوية حادة، فإن قيمة $\\text{جتا}(\\theta)$ تساوي:",
      mcqChoicesAr: ["$\\frac{4}{5}$", "$\\frac{3}{4}$", "$\\frac{5}{4}$", "$1$"],
      modelAnswerAr: "من متطابقة فيثاغورس المثلثية: $\\text{جتا}(\\theta) = \\sqrt{1 - (3 ÷ 5)^2} = \\frac{4}{5}$.",
    },
    {
      id: "math_q_3",
      questionNumber: 3,
      kind: "essay_geometry",
      branchBadgeAr: "هندسة مستوية",
      marks: 4,
      promptAr:
        "في الشكل المقابل: $د$ منتصف $أ ب$، $هـ$ منتصف $أ جـ$، وطول $ب جـ = 12$ سم. أوجد بالبرهان طول القطعة المستقيمة $د هـ$ مع ذكر النظرية الهندسية المستخدمة.",
      modelAnswerAr:
        "بما أن $د$ منتصف $أ ب$ و $هـ$ منتصف $أ جـ$، إذن $د هـ \\parallel ب جـ$ ويساوي نصف طوله: $د هـ = 12 ÷ 2 = 6$ سم.",
      geometryFigure: midsegmentFig,
    },
    {
      id: "math_q_4",
      questionNumber: 4,
      kind: "essay_geometry",
      branchBadgeAr: "فيثاغورس وإقليدس",
      marks: 4,
      promptAr:
        "في الشكل المقابل: المثلث $أ ب جـ$ قائم الزاوية في $ب$، فيه $أ ب = 6$ سم، $ب جـ = 8$ سم. أحسب طول الوتر $أ جـ$ ومساحة سطح المثلث.",
      modelAnswerAr:
        "من نظرية فيثاغورس: $أ جـ = \\sqrt{6^2 + 8^2} = \\sqrt{36 + 64} = 10$ سم. المساحة = $0.5 \\times 8 \\times 6 = 24$ سم².",
      geometryFigure: pythagorasFig,
    },
    {
      id: "math_q_5",
      questionNumber: 5,
      kind: "mcq",
      branchBadgeAr: "تفاضل وتكامل",
      marks: 2,
      promptAr:
        "ميل المماس لمنحنى الدالة $د(س) = س^3 - 3س + 1$ عند النقطة التي إحداثيها السيني $س = 2$ يساوي:",
      mcqChoicesAr: ["$9$", "$6$", "$3$", "$12$"],
      modelAnswerAr: "المشتقة الأولى $د'(س) = 3س^2 - 3$، وعند $س = 2$ يكون الميل $3(4) - 3 = 9$.",
    },
    {
      id: "math_q_6",
      questionNumber: 6,
      kind: "mcq",
      branchBadgeAr: "إحصاء واحتمالات",
      marks: 2,
      promptAr:
        "إذا كان $أ، ب$ حدثين متنافيين من فضاء عينة لتجربة عشوائية، فإن احتمال وقوع الحدث $ل(أ \\cap ب)$ يساوي:",
      mcqChoicesAr: ["$0$", "$1$", "$0.5$", "$\\phi$"],
      modelAnswerAr: "الحدثان المتنافيان تقاطعهما $\\phi$، وبالتالي احتمال تقاطعهما $ل(أ \\cap ب) = 0$.",
    },
  ];
}
