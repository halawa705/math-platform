/**
 * @file prep-grade3-triangle-nested-similarity-builder.ts
 * @description منشئ أشكال تشابه المثلثات المتداخلة بزاوية مشتركة وقاطع داخلي أو قاطع عكسي:
 * - مثلث داخل مثلث بزاوية مشتركة B وقاطع AD (مثال 7 من كتاب المعاصر).
 * - مثلث مقطوع بقاطع عكسي غير موازي (تمارين 2، 4، 9، 11، 17).
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

export const MODULE_ID_PREP_GRADE3_TRIANGLE_NESTED_SIMILARITY_BUILDER =
  "prep_grade3_triangle_nested_similarity_builder" as const;

export interface TriangleNestedSimilarityOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مثلثان متداخلان بزاوية مشتركة B وقاطع داخلي AD: ΔABC ~ ΔDBA (مثال 7)
 */
export function buildTriangleNestedWithCommonAngleBFigure(
  opts: TriangleNestedSimilarityOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1, y: 1 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 5, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 16, y: 1 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 7, y: 8 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sBD`, fromVertexId: vB.id, toVertexId: vD.id, lengthLabel: { value: 9, unit: "سم" } },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id, lengthLabel: { value: 27, unit: "سم" } },
    { id: `${opts.figureId}_sBA`, fromVertexId: vB.id, toVertexId: vA.id, lengthLabel: { value: 18, unit: "سم" } },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id, lengthLabel: { value: 12, unit: "سم" } },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, lengthLabel: { value: "X", unit: "سم" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: "تشابه مثلثين بزاوية مشتركة B وقاطع داخلي ΔABC ~ ΔDBA",
    notationLanguage: notation,
    vertices: [vB, vD, vC, vA],
    segments,
    angles: [],
  };
}

/**
 * مثلث مقطوع بقاطع عكسي غير موازي ΔABC ~ ΔADH مع زاوية C تطابق زاوية ADH (تمرين 2 و 9 و 11)
 */
export function buildTriangleAntiparallelSecantFigure(
  opts: TriangleNestedSimilarityOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 9 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 9.5, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 1, y: 1 } };

  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 3, y: 5 } };
  const vH: CanonicalVertexNode = { id: `${opts.figureId}_vH`, label: notation === "english" ? "H" : "هـ", position: { x: 7, y: 5.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, lengthLabel: { value: 7, unit: "سم" } },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAH`, fromVertexId: vA.id, toVertexId: vH.id, lengthLabel: { value: 6, unit: "سم" } },
    { id: `${opts.figureId}_sHB`, fromVertexId: vH.id, toVertexId: vB.id, lengthLabel: { value: 8, unit: "سم" } },
    { id: `${opts.figureId}_sDH`, fromVertexId: vD.id, toVertexId: vH.id },
    { id: `${opts.figureId}_sCB`, fromVertexId: vC.id, toVertexId: vB.id },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aC`, vertexId: vC.id, arm1VertexId: vA.id, arm2VertexId: vB.id, markSymbol: "arc" },
    { id: `${opts.figureId}_aADH`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vH.id, markSymbol: "arc" },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: "تشابه مثلثين بقاطع عكسي غير موازي ΔABC ~ ΔADH",
    notationLanguage: notation,
    vertices: [vA, vD, vC, vH, vB],
    segments,
    angles,
  };
}
