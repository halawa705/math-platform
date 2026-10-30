/**
 * @file prep-grade2-congruence-right-triangles-builder.ts
 * @description منشئ أشكال تطابق المثلثات القائمة (RHS وتر وضلع) (هندسة 2 إعدادي - درس التطابق):
 * - مثلثان قائمان متجاوران ABC ≅ HAD مع مجاهيل x و y وأطوال 25 و 15 (مسألة 5).
 * - مثلثان قائمان متعامدان ACB ≅ BDE مع زوايا 55° و x° (مسألة 16).
 * - مثلثان قائمان متداخلان في وتر مشترك AD مع زوايا 30° و x° (مسألة 18).
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

export const MODULE_ID_PREP_GRADE2_CONGRUENCE_RIGHT_TRIANGLES_BUILDER =
  "prep_grade2_congruence_right_triangles_builder" as const;

export interface PrepGrade2RightTriangleOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 5: مثلثان قائمان ΔABC ≅ ΔHAD مع أطوال 25 سم و 15 سم ومجاهيل x و y
 */
export function buildCongruenceRightTrianglesAdjacentFigure(
  opts: PrepGrade2RightTriangleOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 5, y: 8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1.5, y: 8 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 5, y: 6.5 } };
  const vH: CanonicalVertexNode = { id: `${opts.figureId}_vH`, label: notation === "english" ? "H" : "هـ", position: { x: 9.5, y: 6.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, lengthLabel: { value: 15, unit: "سم" } },
    { id: `${opts.figureId}_sCB`, fromVertexId: vC.id, toVertexId: vB.id, lengthLabel: { value: "3y-6", unit: "سم" } },
    { id: `${opts.figureId}_sBA`, fromVertexId: vB.id, toVertexId: vA.id, lengthLabel: { value: 25, unit: "سم" } },
    { id: `${opts.figureId}_sDH`, fromVertexId: vD.id, toVertexId: vH.id },
    { id: `${opts.figureId}_sAH`, fromVertexId: vA.id, toVertexId: vH.id, lengthLabel: { value: "5X", unit: "سم" } },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aC`, vertexId: vC.id, arm1VertexId: vB.id, arm2VertexId: vA.id, isRightAngle: true },
    { id: `${opts.figureId}_aD`, vertexId: vD.id, arm1VertexId: vH.id, arm2VertexId: vA.id, isRightAngle: true },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_right_pythagoras",
    titleArabic: "تطابق المثلثين القائمين ΔABC ≅ ΔHAD لإيجاد قيمة X + y",
    notationLanguage: notation,
    vertices: [vA, vC, vB, vD, vH],
    segments,
    angles,
  };
}

/**
 * مسألة 16: مثلثان قائمان متعامدان ACB ≅ BDE مع زاوية 55° عند E و x° عند A
 */
export function buildCongruencePerpendicularRightPairFigure(
  opts: PrepGrade2RightTriangleOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1.5, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 5.5, y: 1 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 7.5, y: 1 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5.5, y: 9 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 7.5, y: 6 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, tickMarks: 2 },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sCA`, fromVertexId: vC.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id, tickMarks: 2 },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 1 },
    { id: `${opts.figureId}_sEB`, fromVertexId: vE.id, toVertexId: vB.id, tickMarks: 1 },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aC`, vertexId: vC.id, arm1VertexId: vB.id, arm2VertexId: vA.id, isRightAngle: true },
    { id: `${opts.figureId}_aD`, vertexId: vD.id, arm1VertexId: vC.id, arm2VertexId: vE.id, isRightAngle: true },
    { id: `${opts.figureId}_aE`, vertexId: vE.id, arm1VertexId: vD.id, arm2VertexId: vB.id, degrees: 55, degreesLabel: "55°" },
    { id: `${opts.figureId}_aA`, vertexId: vA.id, arm1VertexId: vC.id, arm2VertexId: vB.id, degreesLabel: "X°" },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_right_pythagoras",
    titleArabic: "تطابق المثلثين القائمين ΔACB ≅ ΔBDE لإيجاد قيمة X = 35°",
    notationLanguage: notation,
    vertices: [vB, vC, vD, vA, vE],
    segments,
    angles,
  };
}

/**
 * مسألة 18: مثلثان قائمان يشتركان في الوتر AD مع زاوية 30° عند A
 */
export function buildCongruenceRightTrianglesSharedHypotenuseFigure(
  opts: PrepGrade2RightTriangleOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 1, y: 1 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 9, y: 1 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 3.5, y: 5.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 6.5, y: 5.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 2 },
    { id: `${opts.figureId}_sBD`, fromVertexId: vB.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id, tickMarks: 2 },
    { id: `${opts.figureId}_sCA`, fromVertexId: vC.id, toVertexId: vA.id },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vD.id, isRightAngle: true },
    { id: `${opts.figureId}_aC`, vertexId: vC.id, arm1VertexId: vD.id, arm2VertexId: vA.id, isRightAngle: true },
    { id: `${opts.figureId}_aCAD`, vertexId: vA.id, arm1VertexId: vC.id, arm2VertexId: vD.id, degrees: 30, degreesLabel: "30°" },
    { id: `${opts.figureId}_aBDA`, vertexId: vD.id, arm1VertexId: vB.id, arm2VertexId: vA.id, degreesLabel: "X°" },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_right_pythagoras",
    titleArabic: "تطابق مثلثين قائمين في وتر مشترك AD لإيجاد قيمة X = 30°",
    notationLanguage: notation,
    vertices: [vA, vD, vB, vC],
    segments,
    angles,
  };
}
