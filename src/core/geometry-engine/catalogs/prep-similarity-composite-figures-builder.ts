/**
 * @file prep-similarity-composite-figures-builder.ts
 * @description منشئ الأشكال المركبة والمتداخلة لدرس تشابه المضلعات
 * (مضلعان على خط قاعدة مشترك يتقاطعان في O، خماسيان على شكل منزل، ومثلث مقطوع بمستقيم).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
  CanonicalAngleNode,
} from "../../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  type MathNotationLanguage,
} from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_PREP_SIMILARITY_COMPOSITE_FIGURES_BUILDER =
  "prep_similarity_composite_figures_builder" as const;

export interface SimilarityCompositeFiguresOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مضلعان على خط قاعدة مشترك H-E-A-D يتقاطعان في نقطة O (صورة 2 - مثال 3)
 */
export function buildCollinearBaseQuadsIntersectingAtOFigure(
  opts: SimilarityCompositeFiguresOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  // خط الأساس: H - E - A - D
  const vH: CanonicalVertexNode = { id: `${opts.figureId}_cbH`, label: notation === "english" ? "H" : "ح", position: { x: 1, y: 1 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_cbE`, label: notation === "english" ? "E" : "هـ", position: { x: 3.5, y: 1 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_cbA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 7, y: 1 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_cbD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 11, y: 1 } };

  // نقطة التقاطع O في المنتصف ورؤوس المضلعين
  const vO: CanonicalVertexNode = { id: `${opts.figureId}_cbO`, label: notation === "english" ? "O" : "م", position: { x: 5.25, y: 3.2 } };
  const vG: CanonicalVertexNode = { id: `${opts.figureId}_cbG`, label: notation === "english" ? "G" : "ع", position: { x: 2, y: 5.5 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_cbF`, label: notation === "english" ? "F" : "و", position: { x: 4.5, y: 4.8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_cbB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 6.5, y: 5.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_cbC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 9.5, y: 6.8 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sHE`, fromVertexId: vH.id, toVertexId: vE.id, lengthLabel: { value: 2, unit: "سم" } },
    { id: `${opts.figureId}_sEA`, fromVertexId: vE.id, toVertexId: vA.id, lengthLabel: { value: "x", unit: "سم" } },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, lengthLabel: { value: 4, unit: "سم" } },

    { id: `${opts.figureId}_sHG`, fromVertexId: vH.id, toVertexId: vG.id, lengthLabel: { value: 3, unit: "سم" } },
    { id: `${opts.figureId}_sGF`, fromVertexId: vG.id, toVertexId: vF.id },
    { id: `${opts.figureId}_sFE`, fromVertexId: vF.id, toVertexId: vE.id },

    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, lengthLabel: { value: 4.5, unit: "سم" } },

    // خطوط التقاطع المتجهة إلى O
    { id: `${opts.figureId}_sEO`, fromVertexId: vE.id, toVertexId: vO.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sAO`, fromVertexId: vA.id, toVertexId: vO.id, strokeStyle: "dashed" },
  ];

  const angles: CanonicalAngleNode[] = [];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_hourglass_butterfly_similarity",
    titleArabic: "مضلعان بقاعدة مشتركة H-E-A-D يتقاطعان في O",
    notationLanguage: notation,
    vertices: [vH, vE, vA, vD, vO, vG, vF, vB, vC],
    segments,
    angles,
  };
}

/**
 * مضلعان خماسيان على شكل منزل متطابقان مع المسألة (صورة 2 - حاول بنفسك 3)
 */
export function buildSimilarHousePentagonsFigure(
  opts: SimilarityCompositeFiguresOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  // الخماسي الصغير ABCDE
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_hA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 3.5, y: 1 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_hB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_hC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 1, y: 3.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_hD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 2.25, y: 4.8 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_hE`, label: localizeGeometricVertexLabelSSOT("هـ", notation), position: { x: 3.5, y: 3.5 } };

  // الخماسي الكبير KFGHJ
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_hF`, label: notation === "english" ? "F" : "و", position: { x: 6.5, y: 1 } };
  const vG: CanonicalVertexNode = { id: `${opts.figureId}_hG`, label: notation === "english" ? "G" : "ع", position: { x: 12.5, y: 1 } };
  const vH: CanonicalVertexNode = { id: `${opts.figureId}_hH`, label: notation === "english" ? "H" : "ح", position: { x: 15.5, y: 5.5 } };
  const vJ: CanonicalVertexNode = { id: `${opts.figureId}_hJ`, label: notation === "english" ? "J" : "ن", position: { x: 12.5, y: 9.5 } };
  const vK: CanonicalVertexNode = { id: `${opts.figureId}_hK`, label: notation === "english" ? "K" : "ك", position: { x: 6.5, y: 9.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vB.id, toVertexId: vA.id, lengthLabel: { value: 6, unit: "سم" } },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id },
    { id: `${opts.figureId}_sEA`, fromVertexId: vE.id, toVertexId: vA.id },

    { id: `${opts.figureId}_sFG`, fromVertexId: vF.id, toVertexId: vG.id, lengthLabel: { value: 15, unit: "سم" } },
    { id: `${opts.figureId}_sGH`, fromVertexId: vG.id, toVertexId: vH.id, lengthLabel: { value: 12, unit: "سم" } },
    { id: `${opts.figureId}_sHJ`, fromVertexId: vH.id, toVertexId: vJ.id, lengthLabel: { value: 9, unit: "سم" } },
    { id: `${opts.figureId}_sJK`, fromVertexId: vJ.id, toVertexId: vK.id, lengthLabel: { value: 15, unit: "سم" } },
    { id: `${opts.figureId}_sKF`, fromVertexId: vK.id, toVertexId: vF.id, lengthLabel: { value: 18, unit: "سم" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_hourglass_butterfly_similarity",
    titleArabic: "مضلعان خماسيان متشابهان ABCDE ~ KFGHJ (شكل منزل)",
    notationLanguage: notation,
    vertices: [vB, vA, vE, vD, vC, vF, vG, vH, vJ, vK],
    segments,
    angles: [],
  };
}

/**
 * مثلث مقطوع بمستقيم ينشئ مضلعاً رباعياً مشابهاً ABCD ~ EBGF (صورة 5 - تمرين 8)
 */
export function buildTriangleSecantSimilarQuadsFigure(
  opts: SimilarityCompositeFiguresOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vB: CanonicalVertexNode = { id: `${opts.figureId}_tsB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1, y: 1 } };
  const vG: CanonicalVertexNode = { id: `${opts.figureId}_tsG`, label: notation === "english" ? "G" : "ع", position: { x: 6, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_tsC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 13, y: 1 } };

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_tsA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 6, y: 7.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_tsD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 9, y: 7.5 } };

  const vE: CanonicalVertexNode = { id: `${opts.figureId}_tsE`, label: notation === "english" ? "E" : "هـ", position: { x: 3, y: 4 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_tsF`, label: notation === "english" ? "F" : "و", position: { x: 7.5, y: 5.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sBE`, fromVertexId: vB.id, toVertexId: vE.id, lengthLabel: { value: 6, unit: "سم" } },
    { id: `${opts.figureId}_sEA`, fromVertexId: vE.id, toVertexId: vA.id, lengthLabel: { value: 9, unit: "سم" } },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, lengthLabel: { value: 6, unit: "سم" } },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id, lengthLabel: { value: 7.5, unit: "سم" } },
    { id: `${opts.figureId}_sCG`, fromVertexId: vC.id, toVertexId: vG.id, lengthLabel: { value: "x", unit: "سم" } },
    { id: `${opts.figureId}_sGB`, fromVertexId: vG.id, toVertexId: vB.id },

    { id: `${opts.figureId}_sEF`, fromVertexId: vE.id, toVertexId: vF.id, lengthLabel: { value: "y", unit: "سم" } },
    { id: `${opts.figureId}_sFG`, fromVertexId: vF.id, toVertexId: vG.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_hourglass_butterfly_similarity",
    titleArabic: "مضلعان رباعيان متداخلان ABCD ~ EBGF",
    notationLanguage: notation,
    vertices: [vB, vG, vC, vA, vD, vE, vF],
    segments,
    angles: [],
  };
}
