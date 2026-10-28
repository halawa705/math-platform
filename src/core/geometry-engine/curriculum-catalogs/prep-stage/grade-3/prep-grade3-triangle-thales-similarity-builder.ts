/**
 * @file prep-grade3-triangle-thales-similarity-builder.ts
 * @description منشئ أشكال تشابه المثلثات القائمة على التوازي ونظرية طاليس:
 * - توازي مستقيم لقاعدة المثلث ينشئ مثلثاً مشابهاً ΔAXY ~ ΔABC (تمارين 5، 10).
 * - توازي على شكل حرف Z متبادل ΔABC ~ ΔCDE (حاول بنفسك 7 ومسألة 14).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
} from "../../../../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  type MathNotationLanguage,
} from "../../../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_PREP_GRADE3_TRIANGLE_THALES_SIMILARITY_BUILDER =
  "prep_grade3_triangle_thales_similarity_builder" as const;

export interface TriangleThalesSimilarityOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * توازي داخل المثلث ينشئ مثلثاً مشابهاً: XY || BC و ΔAXY ~ ΔABC (تمرين 5)
 */
export function buildTriangleThalesParallelSimilarityFigure(
  opts: TriangleThalesSimilarityOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 9 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 8.5, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 1, y: 1 } };

  const vX: CanonicalVertexNode = { id: `${opts.figureId}_vX`, label: notation === "english" ? "X" : "س", position: { x: 6.75, y: 5 } };
  const vY: CanonicalVertexNode = { id: `${opts.figureId}_vY`, label: notation === "english" ? "Y" : "ص", position: { x: 3, y: 5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAX`, fromVertexId: vA.id, toVertexId: vX.id },
    { id: `${opts.figureId}_sXB`, fromVertexId: vX.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sAY`, fromVertexId: vA.id, toVertexId: vY.id },
    { id: `${opts.figureId}_sYC`, fromVertexId: vY.id, toVertexId: vC.id },

    { id: `${opts.figureId}_sXY`, fromVertexId: vX.id, toVertexId: vY.id, parallelArrows: 1, lengthLabel: { value: 5, unit: "سم" } },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, parallelArrows: 1, lengthLabel: { value: 10, unit: "سم" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "توازي طاليس ينشئ مثلثاً مشابهاً XY || BC",
    notationLanguage: notation,
    vertices: [vA, vX, vB, vY, vC],
    segments,
    angles: [],
  };
}

/**
 * توازي متبادل على شكل حرف Z ينشئ مثلثين متشابهين ΔABC ~ ΔCDE (حاول بنفسك 7)
 */
export function buildTriangleZShapeParallelFigure(
  opts: TriangleThalesSimilarityOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  // المثلث الأول ABC
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 6, y: 8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1, y: 8 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 1, y: 1 } };

  // النقطتان D و E
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 3.5, y: 4.5 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 12, y: 1 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sBA`, fromVertexId: vB.id, toVertexId: vA.id, parallelArrows: 1, lengthLabel: { value: "7.5", unit: "سم" } },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: 12, unit: "سم" } },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, lengthLabel: { value: 5, unit: "سم" } },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id, lengthLabel: { value: 10, unit: "سم" } },
    { id: `${opts.figureId}_sCE`, fromVertexId: vC.id, toVertexId: vE.id, lengthLabel: { value: 20, unit: "سم" } },
    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id, parallelArrows: 1, lengthLabel: { value: "X", unit: "سم" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "توازي متبادل ينشئ مثلثين متشابهين ΔABC ~ ΔCDE",
    notationLanguage: notation,
    vertices: [vB, vA, vD, vC, vE],
    segments,
    angles: [],
  };
}
