/**
 * @file prep-similarity-geometry-catalog.ts
 * @description السجل المركزي لأشكال ورسومات درس التشابه والهندسة للمرحلة الإعدادية:
 * - مضلعان رباعيان متشابهان (ABCD ~ PQRS) بأبعاد وزوايا قياسية متطابقة مع الكتاب المدرسي.
 * - مضلعان خماسيان متشابهان (ABCDE ~ FGHIJ).
 * - إطار صورة مستطيل خشبي داخلي وخارجي (المسائل التطبيقية).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
} from "../../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  type MathNotationLanguage,
} from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_PREP_SIMILARITY_GEOMETRY_CATALOG =
  "prep_similarity_geometry_catalog" as const;

export interface SimilarityFigureBuildOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مضلعان رباعيان متشابهان جنباً إلى جنب (ABCD ~ PQRS)
 */
export function buildTwoSimilarQuadrilateralsFigure(
  opts: SimilarityFigureBuildOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  // المضلع 1 (ABCD): أبعاد أصغر
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 2, y: 7 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 5, y: 8 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 6, y: 2 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 1, y: 2 } };

  // المضلع 2 (PQRS): أبعاد أكبر بنسبة تشابه
  const vP: CanonicalVertexNode = { id: `${opts.figureId}_vP`, label: notation === "english" ? "P" : "س", position: { x: 9, y: 10 } };
  const vQ: CanonicalVertexNode = { id: `${opts.figureId}_vQ`, label: notation === "english" ? "Q" : "ص", position: { x: 14, y: 11.5 } };
  const vR: CanonicalVertexNode = { id: `${opts.figureId}_vR`, label: notation === "english" ? "R" : "ع", position: { x: 15.5, y: 2 } };
  const vS: CanonicalVertexNode = { id: `${opts.figureId}_vS`, label: notation === "english" ? "S" : "ل", position: { x: 8, y: 2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: 4, unit: "سم" } },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: 6, unit: "سم" } },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id },

    { id: `${opts.figureId}_sPQ`, fromVertexId: vP.id, toVertexId: vQ.id, lengthLabel: { value: 8, unit: "سم" } },
    { id: `${opts.figureId}_sQR`, fromVertexId: vQ.id, toVertexId: vR.id },
    { id: `${opts.figureId}_sRS`, fromVertexId: vR.id, toVertexId: vS.id, lengthLabel: { value: 10, unit: "سم" } },
    { id: `${opts.figureId}_sSP`, fromVertexId: vS.id, toVertexId: vP.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_hourglass_butterfly_similarity",
    titleArabic: "مضلعان رباعيان متشابهان ABCD ~ PQRS",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vP, vQ, vR, vS],
    segments,
    angles: [
      { id: `${opts.figureId}_aD`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degrees: 70 },
      { id: `${opts.figureId}_aS`, vertexId: vS.id, arm1VertexId: vP.id, arm2VertexId: vR.id, degrees: 70 },
    ],
  };
}

/**
 * مضلعان خماسيان متشابهان (ABCDE ~ FGHIJ)
 */
export function buildTwoSimilarPentagonsFigure(
  opts: SimilarityFigureBuildOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_pA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 3, y: 7 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_pB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 5.5, y: 5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_pC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 4.5, y: 1.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_pD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 1.5, y: 1.5 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_pE`, label: localizeGeometricVertexLabelSSOT("هـ", notation), position: { x: 0.5, y: 5 } };

  const vF: CanonicalVertexNode = { id: `${opts.figureId}_pF`, label: notation === "english" ? "F" : "س", position: { x: 11, y: 10 } };
  const vG: CanonicalVertexNode = { id: `${opts.figureId}_pG`, label: notation === "english" ? "G" : "ص", position: { x: 15, y: 7 } };
  const vH: CanonicalVertexNode = { id: `${opts.figureId}_pH`, label: notation === "english" ? "H" : "ع", position: { x: 13.5, y: 1.5 } };
  const vI: CanonicalVertexNode = { id: `${opts.figureId}_pI`, label: notation === "english" ? "I" : "ل", position: { x: 8.5, y: 1.5 } };
  const vJ: CanonicalVertexNode = { id: `${opts.figureId}_pJ`, label: notation === "english" ? "J" : "ن", position: { x: 7, y: 7 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: 3, unit: "سم" } },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: 4, unit: "سم" } },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, lengthLabel: { value: 5, unit: "سم" } },
    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id, lengthLabel: { value: 6, unit: "سم" } },
    { id: `${opts.figureId}_sEA`, fromVertexId: vE.id, toVertexId: vA.id, lengthLabel: { value: 7, unit: "سم" } },

    { id: `${opts.figureId}_sFG`, fromVertexId: vF.id, toVertexId: vG.id },
    { id: `${opts.figureId}_sGH`, fromVertexId: vG.id, toVertexId: vH.id },
    { id: `${opts.figureId}_sHI`, fromVertexId: vH.id, toVertexId: vI.id },
    { id: `${opts.figureId}_sIJ`, fromVertexId: vI.id, toVertexId: vJ.id },
    { id: `${opts.figureId}_sJF`, fromVertexId: vJ.id, toVertexId: vF.id, lengthLabel: { value: 9, unit: "سم" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_hourglass_butterfly_similarity",
    titleArabic: "مضلعان خماسيان متشابهان ABCDE ~ FGHIJ",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE, vF, vG, vH, vI, vJ],
    segments,
    angles: [],
  };
}

/**
 * إطار صورة خشبي مستطيل الشكل داخلي وخارجي
 */
export function buildNestedRectanglesFrameFigure(
  opts: SimilarityFigureBuildOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  // المستطيل الخارجي (30 × 20)
  const oA: CanonicalVertexNode = { id: `${opts.figureId}_oA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 0, y: 10 } };
  const oB: CanonicalVertexNode = { id: `${opts.figureId}_oB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 15, y: 10 } };
  const oC: CanonicalVertexNode = { id: `${opts.figureId}_oC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 15, y: 0 } };
  const oD: CanonicalVertexNode = { id: `${opts.figureId}_oD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 0, y: 0 } };

  // المستطيل الداخلي
  const iA: CanonicalVertexNode = { id: `${opts.figureId}_iA`, label: notation === "english" ? "A'" : "أ'", position: { x: 1.5, y: 8.5 } };
  const iB: CanonicalVertexNode = { id: `${opts.figureId}_iB`, label: notation === "english" ? "B'" : "ب'", position: { x: 13.5, y: 8.5 } };
  const iC: CanonicalVertexNode = { id: `${opts.figureId}_iC`, label: notation === "english" ? "C'" : "جـ'", position: { x: 13.5, y: 1.5 } };
  const iD: CanonicalVertexNode = { id: `${opts.figureId}_iD`, label: notation === "english" ? "D'" : "د'", position: { x: 1.5, y: 1.5 } };

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: "إطار خشبي مستطيل داخلي وخارجي",
    notationLanguage: notation,
    vertices: [oA, oB, oC, oD, iA, iB, iC, iD],
    segments: [
      { id: `${opts.figureId}_sAB`, fromVertexId: oA.id, toVertexId: oB.id, lengthLabel: { value: 30, unit: "سم" } },
      { id: `${opts.figureId}_sBC`, fromVertexId: oB.id, toVertexId: oC.id, lengthLabel: { value: 20, unit: "سم" } },
      { id: `${opts.figureId}_sCD`, fromVertexId: oC.id, toVertexId: oD.id },
      { id: `${opts.figureId}_sDA`, fromVertexId: oD.id, toVertexId: oA.id },

      { id: `${opts.figureId}_siAB`, fromVertexId: iA.id, toVertexId: iB.id, strokeStyle: "dashed" },
      { id: `${opts.figureId}_siBC`, fromVertexId: iB.id, toVertexId: iC.id, strokeStyle: "dashed" },
      { id: `${opts.figureId}_siCD`, fromVertexId: iC.id, toVertexId: iD.id, strokeStyle: "dashed" },
      { id: `${opts.figureId}_siDA`, fromVertexId: iD.id, toVertexId: iA.id, strokeStyle: "dashed" },
    ],
    angles: [{ id: `${opts.figureId}_aC`, vertexId: oC.id, arm1VertexId: oB.id, arm2VertexId: oD.id, isRightAngle: true }],
  };
}

/**
 * مطابقة أوصاف وأسئلة درس التشابه الإعدادي
 */
export function matchPrepSimilarityGeometryFigure(
  description: string,
  figureId = "prep_sim_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = description.trim();
  if (!d) return undefined;

  if (/إطار.*صورة|صورة.*خشب|مستطيل.*داخلي.*خارجي/i.test(d)) {
    return buildNestedRectanglesFrameFigure({ figureId, notationLanguage });
  }

  if (/خماسي/i.test(d) && /تشابه|متشابه/i.test(d)) {
    return buildTwoSimilarPentagonsFigure({ figureId, notationLanguage });
  }

  if (/مضلع.*رباعي|رباعي.*متشابه|مضلعان.*متشابهان|ABCD.*PQRS|ABCD.*XYZW/i.test(d)) {
    return buildTwoSimilarQuadrilateralsFigure({ figureId, notationLanguage });
  }

  if (/تشابه/i.test(d) && (/مضلعان/i.test(d) || /مضلعين/i.test(d))) {
    return buildTwoSimilarQuadrilateralsFigure({ figureId, notationLanguage });
  }

  return undefined;
}
