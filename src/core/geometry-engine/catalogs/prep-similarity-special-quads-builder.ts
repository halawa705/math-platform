/**
 * @file prep-similarity-special-quads-builder.ts
 * @description منشئ الأشكال الرباعية الخاصة المتشابهة (شبه منحرف قائم بمجاهيل، متوازي أضلاع، معين، طائرة ورقية)
 * المستوحاة من تمارين وتشابه المضلعات في كتاب المعاصر (صور 3 و 4 و 5).
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

export const MODULE_ID_PREP_SIMILARITY_SPECIAL_QUADS_BUILDER =
  "prep_similarity_special_quads_builder" as const;

export interface SimilaritySpecialQuadsOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * شبه منحرف قائم الزاوية بمجاهيل جبرية (X - 3) و (Y + 1) وزوايا قائمة (صورة 4 - تمرين 4)
 */
export function buildSimilarRightTrapezoidsWithVariablesFigure(
  opts: SimilaritySpecialQuadsOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  // شبه المنحرف الأصغر (اليمين)
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_rtA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 1, y: 1 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_rtB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 7, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_rtC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 4.5, y: 5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_rtD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 1, y: 5 } };

  // شبه المنحرف الأكبر (اليسار)
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_rtE`, label: notation === "english" ? "E" : "هـ", position: { x: 9, y: 1 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_rtF`, label: notation === "english" ? "F" : "و", position: { x: 17, y: 1 } };
  const vG: CanonicalVertexNode = { id: `${opts.figureId}_rtG`, label: notation === "english" ? "G" : "ع", position: { x: 14, y: 7 } };
  const vH: CanonicalVertexNode = { id: `${opts.figureId}_rtH`, label: notation === "english" ? "H" : "ح", position: { x: 9, y: 7 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: 16, unit: "سم" } },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: 10, unit: "سم" } },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, lengthLabel: { value: 10, unit: "سم" } },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id, lengthLabel: { value: 8, unit: "سم" } },

    { id: `${opts.figureId}_sEF`, fromVertexId: vE.id, toVertexId: vF.id, lengthLabel: { value: "(X - 3)", unit: "سم" } },
    { id: `${opts.figureId}_sFG`, fromVertexId: vF.id, toVertexId: vG.id, lengthLabel: { value: "(1 + Y)", unit: "سم" } },
    { id: `${opts.figureId}_sGH`, fromVertexId: vG.id, toVertexId: vH.id, lengthLabel: { value: "(Y + 1)", unit: "سم" } },
    { id: `${opts.figureId}_sHE`, fromVertexId: vH.id, toVertexId: vE.id, lengthLabel: { value: 12, unit: "سم" } },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aA`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vD.id, isRightAngle: true },
    { id: `${opts.figureId}_aD`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true },
    { id: `${opts.figureId}_aE`, vertexId: vE.id, arm1VertexId: vF.id, arm2VertexId: vH.id, isRightAngle: true },
    { id: `${opts.figureId}_aH`, vertexId: vH.id, arm1VertexId: vE.id, arm2VertexId: vG.id, isRightAngle: true },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_trapezoid_with_altitudes",
    titleArabic: "شبه منحرف قائم الزاوية متشابه بمجاهيل جبرية",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE, vF, vG, vH],
    segments,
    angles,
  };
}

/**
 * متوازيا أضلاع متشابهان بزاوية 110° وأبعاد متناسبة (صورة 3 - تمرين 4)
 */
export function buildSimilarParallelogramsFigure(
  opts: SimilaritySpecialQuadsOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  // متوازي الأضلاع ABCD (24 × 48)
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_pA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 1, y: 1 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_pB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 6, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_pC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 4.5, y: 6 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_pD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: -0.5, y: 6 } };

  // متوازي الأضلاع XYZL (20 × 40)
  const vX: CanonicalVertexNode = { id: `${opts.figureId}_pX`, label: notation === "english" ? "X" : "س", position: { x: 8.5, y: 1 } };
  const vY: CanonicalVertexNode = { id: `${opts.figureId}_pY`, label: notation === "english" ? "Y" : "ص", position: { x: 13, y: 1 } };
  const vZ: CanonicalVertexNode = { id: `${opts.figureId}_pZ`, label: notation === "english" ? "Z" : "ع", position: { x: 11.8, y: 5 } };
  const vL: CanonicalVertexNode = { id: `${opts.figureId}_pL`, label: notation === "english" ? "L" : "ل", position: { x: 7.3, y: 5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: 24, unit: "سم" } },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: 48, unit: "سم" } },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id },

    { id: `${opts.figureId}_sXY`, fromVertexId: vX.id, toVertexId: vY.id, lengthLabel: { value: 20, unit: "سم" } },
    { id: `${opts.figureId}_sYZ`, fromVertexId: vY.id, toVertexId: vZ.id, lengthLabel: { value: 40, unit: "سم" } },
    { id: `${opts.figureId}_sZL`, fromVertexId: vZ.id, toVertexId: vL.id },
    { id: `${opts.figureId}_sLX`, fromVertexId: vL.id, toVertexId: vX.id },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aA`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vD.id, degrees: 110 },
    { id: `${opts.figureId}_aX`, vertexId: vX.id, arm1VertexId: vY.id, arm2VertexId: vL.id, degrees: 110 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_parallelogram_diagonals",
    titleArabic: "متوازيا أضلاع متشابهان بزاوية 110°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vX, vY, vZ, vL],
    segments,
    angles,
  };
}

/**
 * معينان متشابهان بزوايا 110° و 70° (صورة 3 - تمرين 5 وصورة 4 - تمرين 3)
 */
export function buildSimilarRhombusesFigure(
  opts: SimilaritySpecialQuadsOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  // معين ABCD (أضلاع 8 سم وزاوية 110°)
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_rhA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 1, y: 4.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_rhB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 4.5, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_rhC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 7.5, y: 4.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_rhD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 4.5, y: 8 } };

  // معين EFGH (أضلاع 10 سم وزاوية 70°)
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_rhE`, label: notation === "english" ? "E" : "هـ", position: { x: 9.5, y: 4.5 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_rhF`, label: notation === "english" ? "F" : "و", position: { x: 13.5, y: 1 } };
  const vG: CanonicalVertexNode = { id: `${opts.figureId}_rhG`, label: notation === "english" ? "G" : "ع", position: { x: 17.5, y: 4.5 } };
  const vH: CanonicalVertexNode = { id: `${opts.figureId}_rhH`, label: notation === "english" ? "H" : "ح", position: { x: 13.5, y: 8 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: 8, unit: "سم" } },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: 8, unit: "سم" } },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, lengthLabel: { value: 8, unit: "سم" } },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id, lengthLabel: { value: 8, unit: "سم" } },

    { id: `${opts.figureId}_sEF`, fromVertexId: vE.id, toVertexId: vF.id, lengthLabel: { value: 10, unit: "سم" } },
    { id: `${opts.figureId}_sFG`, fromVertexId: vF.id, toVertexId: vG.id, lengthLabel: { value: 10, unit: "سم" } },
    { id: `${opts.figureId}_sGH`, fromVertexId: vG.id, toVertexId: vH.id, lengthLabel: { value: 10, unit: "سم" } },
    { id: `${opts.figureId}_sHE`, fromVertexId: vH.id, toVertexId: vE.id, lengthLabel: { value: 10, unit: "سم" } },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aA`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vD.id, degrees: 110 },
    { id: `${opts.figureId}_aE`, vertexId: vE.id, arm1VertexId: vF.id, arm2VertexId: vH.id, degrees: 70 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: "معينان متشابهان بزوايا 110° و 70°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE, vF, vG, vH],
    segments,
    angles,
  };
}
