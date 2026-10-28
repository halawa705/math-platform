/**
 * @file prep-grade3-triangle-separate-similarity-builder.ts
 * @description منشئ أشكال تشابه مثلثين منفصلين بأبعاد وزوايا خاصة:
 * - مثلثان منفصلان متشابهان بزاوية منفرجة 120° (مثال 6 من كتاب المعاصر).
 * - مثلثان منفصلان متشابهان بأطوال أضلاع متناسبة (تمارين 1، 2).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
  CanonicalAngleNode,
} from "../../../../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  type MathNotationLanguage,
} from "../../../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_PREP_GRADE3_TRIANGLE_SEPARATE_SIMILARITY_BUILDER =
  "prep_grade3_triangle_separate_similarity_builder" as const;

export interface TriangleSeparateSimilarityOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مثلثان منفصلان متشابهان بزاوية 120°: ΔABC ~ ΔDEF (مثال 6)
 */
export function buildTwoSeparateSimilarTrianglesWithAngle120Figure(
  opts: TriangleSeparateSimilarityOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  // المثلث الأول ABC (الأكبر)
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 1, y: 1 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 5, y: 4.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 8, y: 1 } };

  // المثلث الثاني DEF (الأصغر)
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: notation === "english" ? "D" : "د", position: { x: 10, y: 1 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 13, y: 5 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: notation === "english" ? "F" : "و", position: { x: 16, y: 4 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: "7.5", unit: "سم" } },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: "4.5", unit: "سم" } },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, lengthLabel: { value: "10.5", unit: "سم" } },

    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id, lengthLabel: { value: 5, unit: "سم" } },
    { id: `${opts.figureId}_sEF`, fromVertexId: vE.id, toVertexId: vF.id, lengthLabel: { value: 3, unit: "سم" } },
    { id: `${opts.figureId}_sDF`, fromVertexId: vD.id, toVertexId: vF.id },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degrees: 120 },
    { id: `${opts.figureId}_aE`, vertexId: vE.id, arm1VertexId: vD.id, arm2VertexId: vF.id, degrees: 120 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: "تشابه مثلثين منفصلين بزاوية 120° ΔABC ~ ΔDEF",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE, vF],
    segments,
    angles,
  };
}
