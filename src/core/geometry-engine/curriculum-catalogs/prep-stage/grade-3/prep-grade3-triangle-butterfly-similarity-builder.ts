/**
 * @file prep-grade3-triangle-butterfly-similarity-builder.ts
 * @description منشئ أشكال تشابه المثلثات المتقابلة بالرأس (المقص / الفراشة):
 * - مثلثان يتقاطعان في رأس مشترك مع زوايا متقابلة بالرأس (مثل حاول بنفسك 6 ومسائل 1، 7، 8 من تمارين 10).
 * - مثلثان متشابهان ناتجان عن تقاطع قاطع مع متوازي أضلاع (مسألة 12 من كتاب المعاصر).
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

export const MODULE_ID_PREP_GRADE3_TRIANGLE_BUTTERFLY_SIMILARITY_BUILDER =
  "prep_grade3_triangle_butterfly_similarity_builder" as const;

export interface TriangleButterflySimilarityOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مثلثان متقابلان بالرأس عند A (شكل المقص / الفراشة): ΔABC ~ ΔADE (حاول بنفسك 6)
 */
export function buildTriangleButterflyAtApexAFigure(
  opts: TriangleButterflySimilarityOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  // نقطة التقاطع المشتركة A
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 7, y: 5 } };

  // المثلث الأيمن ABC
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 12, y: 8.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 13, y: 4.5 } };

  // المثلث الأيسر ADE
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 2, y: 7.5 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 1, y: 1.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: 10, unit: "سم" } },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: 8, unit: "سم" } },
    { id: `${opts.figureId}_sCA`, fromVertexId: vC.id, toVertexId: vA.id, lengthLabel: { value: 12, unit: "سم" } },

    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, lengthLabel: { value: 8, unit: "سم" } },
    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id, lengthLabel: { value: 12, unit: "سم" } },
    { id: `${opts.figureId}_sEA`, fromVertexId: vE.id, toVertexId: vA.id, lengthLabel: { value: 18, unit: "سم" } },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aBAC`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vC.id, markSymbol: "cross" },
    { id: `${opts.figureId}_aDAE`, vertexId: vA.id, arm1VertexId: vD.id, arm2VertexId: vE.id, markSymbol: "cross" },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: "تشابه مثلثين متقابلين بالرأس عند A (شكل مقص ΔABC ~ ΔADE)",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE],
    segments,
    angles,
  };
}

/**
 * مثلثان متشابهان ناتجان عن تقاطع قاطع مع متوازي أضلاع ABCD (تمرين 12 صفحة 143)
 */
export function buildParallelogramSecantButterflyFigure(
  opts: TriangleButterflySimilarityOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  // متوازي الأضلاع ABCD مع امتداد CD إلى E وقاطع يقطع BC في F
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_pA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 9, y: 8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_pB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 3, y: 8 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_pC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 1, y: 1 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_pD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 7, y: 1 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_pE`, label: notation === "english" ? "E" : "هـ", position: { x: 11, y: 1 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_pF`, label: notation === "english" ? "F" : "و", position: { x: 8, y: 4.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: 15, unit: "سم" } },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id, lengthLabel: { value: 6, unit: "سم" } },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id },

    { id: `${opts.figureId}_sAE`, fromVertexId: vA.id, toVertexId: vF.id, lengthLabel: { value: 7, unit: "سم" } },
    { id: `${opts.figureId}_sEF`, fromVertexId: vF.id, toVertexId: vE.id, lengthLabel: { value: 5, unit: "سم" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_parallelogram_diagonals",
    titleArabic: "تشابه مثلثين متقابلين بالرأس مع متوازي أضلاع ΔABF ~ ΔDEF",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE, vF],
    segments,
    angles: [],
  };
}
