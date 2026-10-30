/**
 * @file prep-grade2-pythagoras-quadrilaterals-builder.ts
 * @description منشئ أشكال الأشكال الرباعية المكونة من مثلثين قائمين وتطبيقات عكس فيثاغورس (هندسة 2 إعدادي):
 * - رباعي ABCD فيه زاوية B قائمة وأطوال 7 و 24 و 20 و 15 لإثبات AD ⊥ CD (مسألة 23).
 * - رباعي ABCD فيه زاوية B قائمة وأطوال 9 و 12 و 8 و 17 لحساب المساحة 114 سم² (مسألة 28).
 * - مثلثان متعامدان XYZ و CDX مع D منتصف XZ وأطوال 3 و 4 و 6 و 6.5 (مسألة 27).
 * - رباعي ABCD بأبعاد 32 و 24 و 9 و 45 لإثبات أن مثلث ACD منفرج الزاوية (مسألة 29).
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

export const MODULE_ID_PREP_GRADE2_PYTHAGORAS_QUADRILATERALS_BUILDER =
  "prep_grade2_pythagoras_quadrilaterals_builder" as const;

export interface PrepGrade2PythQuadOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 23: رباعي ABCD فيه B قائمة وأطوال 7 و 24 و 20 و 15 سم لإثبات AD ⊥ CD
 */
export function buildPythagorasQuad7x24x20x15Figure(
  opts: PrepGrade2PythQuadOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 7, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 1, y: 1 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 7, y: 3.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 4, y: 7.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sBC`, fromVertexId: vC.id, toVertexId: vB.id, lengthLabel: { value: 24, unit: "سم" } },
    { id: `${opts.figureId}_sAB`, fromVertexId: vB.id, toVertexId: vA.id, lengthLabel: { value: 7, unit: "سم" } },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, lengthLabel: { value: 15, unit: "سم" } },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, lengthLabel: { value: 20, unit: "سم" } },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, strokeStyle: "dashed" },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aB`, vertexId: vB.id, arm1VertexId: vC.id, arm2VertexId: vA.id, isRightAngle: true },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: "رباعي ABCD فيه B قائمة وأطوال 7 و 24 و 20 و 15 سم لإثبات AD ⊥ CD",
    notationLanguage: notation,
    vertices: [vC, vB, vA, vD],
    segments,
    angles,
  };
}

/**
 * مسألة 28: رباعي ABCD فيه B قائمة وأطوال 9 و 12 و 8 و 17 سم لحساب المساحة 114 سم²
 */
export function buildPythagorasQuadArea114Figure(
  opts: PrepGrade2PythQuadOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 7, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 1, y: 1 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 7, y: 5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 4.5, y: 8.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sBC`, fromVertexId: vC.id, toVertexId: vB.id, lengthLabel: { value: 12, unit: "سم" } },
    { id: `${opts.figureId}_sAB`, fromVertexId: vB.id, toVertexId: vA.id, lengthLabel: { value: 9, unit: "سم" } },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, lengthLabel: { value: 8, unit: "سم" } },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, lengthLabel: { value: 17, unit: "سم" } },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, strokeStyle: "dashed" },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aB`, vertexId: vB.id, arm1VertexId: vC.id, arm2VertexId: vA.id, isRightAngle: true },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: "رباعي ABCD مع زاوية B قائمة وأطوال 9 و 12 و 8 و 17 سم لمساحة 114 سم²",
    notationLanguage: notation,
    vertices: [vC, vB, vA, vD],
    segments,
    angles,
  };
}

/**
 * مسألة 27: مثلثان متعامدان XYZ و CDX مع D منتصف XZ وأطوال 3 و 4 و 6 و 6.5 سم
 */
export function buildPythagorasDoubleTrianglesCXDFigure(
  opts: PrepGrade2PythQuadOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vY: CanonicalVertexNode = { id: `${opts.figureId}_vY`, label: notation === "english" ? "Y" : "ص", position: { x: 3, y: 1 } };
  const vX: CanonicalVertexNode = { id: `${opts.figureId}_vX`, label: notation === "english" ? "X" : "س", position: { x: 1.5, y: 3.5 } };
  const vZ: CanonicalVertexNode = { id: `${opts.figureId}_vZ`, label: notation === "english" ? "Z" : "ع", position: { x: 5.5, y: 3.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 3.5, y: 3.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 1, y: 9.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sYX`, fromVertexId: vY.id, toVertexId: vX.id, lengthLabel: { value: 3, unit: "سم" } },
    { id: `${opts.figureId}_sYZ`, fromVertexId: vY.id, toVertexId: vZ.id, lengthLabel: { value: 4, unit: "سم" } },
    { id: `${opts.figureId}_sXD`, fromVertexId: vX.id, toVertexId: vD.id, tickMarks: 2 },
    { id: `${opts.figureId}_sDZ`, fromVertexId: vD.id, toVertexId: vZ.id, tickMarks: 2 },
    { id: `${opts.figureId}_sXC`, fromVertexId: vX.id, toVertexId: vC.id, lengthLabel: { value: 6, unit: "سم" } },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, lengthLabel: { value: 6.5, unit: "سم" } },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aY`, vertexId: vY.id, arm1VertexId: vX.id, arm2VertexId: vZ.id, isRightAngle: true },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_right_pythagoras",
    titleArabic: "مثلثان متعامدان XYZ و CDX مع D منتصف XZ لإثبات زاوية CXD قائمة",
    notationLanguage: notation,
    vertices: [vY, vX, vZ, vD, vC],
    segments,
    angles,
  };
}

/**
 * مسألة 29: رباعي ABCD بأبعاد 32 و 24 و 9 و 45 لإثبات أن مثلث ACD منفرج الزاوية
 */
export function buildPythagorasObtuseTriangleACDFigure(
  opts: PrepGrade2PythQuadOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 7, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 3, y: 1 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 1, y: 1 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 7, y: 8 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sBC`, fromVertexId: vC.id, toVertexId: vB.id, lengthLabel: { value: 24, unit: "سم" } },
    { id: `${opts.figureId}_sCD`, fromVertexId: vD.id, toVertexId: vC.id, lengthLabel: { value: 9, unit: "سم" } },
    { id: `${opts.figureId}_sAB`, fromVertexId: vB.id, toVertexId: vA.id, lengthLabel: { value: 32, unit: "سم" } },
    { id: `${opts.figureId}_sAD`, fromVertexId: vD.id, toVertexId: vA.id, lengthLabel: { value: 45, unit: "سم" } },
    { id: `${opts.figureId}_sAC`, fromVertexId: vC.id, toVertexId: vA.id, strokeStyle: "dashed" },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aB`, vertexId: vB.id, arm1VertexId: vC.id, arm2VertexId: vA.id, isRightAngle: true },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: "رباعي ABCD بأبعاد 32 و 24 و 9 و 45 سم لإثبات أن مثلث ACD منفرج",
    notationLanguage: notation,
    vertices: [vD, vC, vB, vA],
    segments,
    angles,
  };
}
