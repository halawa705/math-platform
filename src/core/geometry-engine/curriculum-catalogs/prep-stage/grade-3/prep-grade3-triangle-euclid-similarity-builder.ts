/**
 * @file prep-grade3-triangle-euclid-similarity-builder.ts
 * @description منشئ أشكال تشابه المثلثات القائمة الناتجة عن إسقاط عمود من رأس القائمة (نظرية إقليدس):
 * - مثلث ABC قائم الزاوية مع عمود ساقط على الوتر ينشئ مثلثين متشابهين ΔADB ~ ΔBDC ~ ΔABC (مسائل 15، 16).
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

export const MODULE_ID_PREP_GRADE3_TRIANGLE_EUCLID_SIMILARITY_BUILDER =
  "prep_grade3_triangle_euclid_similarity_builder" as const;

export interface TriangleEuclidSimilarityOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مثلث قائم في B مع عمود ساقط BD ⟂ AC: ΔADB ~ ΔBDC (مسألة 15 من كتاب المعاصر)
 */
export function buildTriangleEuclidSimilarityAltitudeFigure(
  opts: TriangleEuclidSimilarityOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  // الوتر AC على الخط الأفقي والعمود BD
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 1, y: 1 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 6, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 13, y: 1 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 6, y: 7.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, lengthLabel: { value: "6.4", unit: "سم" } },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sBD`, fromVertexId: vB.id, toVertexId: vD.id, lengthLabel: { value: "4.8", unit: "سم" } },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true },
    { id: `${opts.figureId}_aD`, vertexId: vD.id, arm1VertexId: vB.id, arm2VertexId: vC.id, isRightAngle: true },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_euclid_right_altitude",
    titleArabic: "تشابه المثلثات القائمة بإسقاط عمود من رأس القائمة (إقليدس ΔADB ~ ΔBDC)",
    notationLanguage: notation,
    vertices: [vA, vD, vC, vB],
    segments,
    angles,
  };
}
