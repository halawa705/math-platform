/**
 * @file prep-grade2-parallel-quadrilaterals-builder.ts
 * @description منشئ أشكال تطبيقات التوازي في الأشكال الرباعية ومتوازي الأضلاع (هندسة 2 إعدادي):
 * - رباعي ABCD مع منصفين وتوازي ZY // DC و YC = 4 سم (مسألة 7 ص 211).
 * - رباعي مع FE = 10 سم واصلة بين منتصفين وأطوال 12 و 16 سم لإثبات زاوية D قائمة (مسألة 12 ص 212).
 * - متوازي أضلاع ABCD مع منتصفين E و F على ضلعين متقابلين لإثبات AC = 3 AG (مسألة 19 ص 214).
 * - رباعي ABCD قائم في D مع E و F منتصفين لحساب مساحة المثلث BEF = 15 سم² (مسألة 22 ص 214).
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

export const MODULE_ID_PREP_GRADE2_PARALLEL_QUADRILATERALS_BUILDER =
  "prep_grade2_parallel_quadrilaterals_builder" as const;

export interface PrepGrade2ParallelQuadOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 7 ص 211: رباعي ABCD مع Z و X منتصفين و ZY // DC و YC = 4 سم
 */
export function buildParallelQuadMidpointsZYDCFigure(
  opts: PrepGrade2ParallelQuadOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 1.5, y: 8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 7.5, y: 7.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 5.5, y: 1.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 1.5, y: 1 } };

  const vX: CanonicalVertexNode = { id: `${opts.figureId}_vX`, label: notation === "english" ? "X" : "س", position: { x: 4.5, y: 7.75 } };
  const vZ: CanonicalVertexNode = { id: `${opts.figureId}_vZ`, label: notation === "english" ? "Z" : "ع", position: { x: 1.5, y: 4.5 } };
  const vY: CanonicalVertexNode = { id: `${opts.figureId}_vY`, label: notation === "english" ? "Y" : "ص", position: { x: 3.5, y: 4.75 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: 10, unit: "سم" } },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: 6, unit: "سم" } },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sZY`, fromVertexId: vZ.id, toVertexId: vY.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sXY`, fromVertexId: vX.id, toVertexId: vY.id },
    { id: `${opts.figureId}_sYC`, fromVertexId: vY.id, toVertexId: vC.id, lengthLabel: { value: 4, unit: "سم" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_parallelogram_diagonals",
    titleArabic: "رباعي ABCD مع منتصفين Z و X وتوازي ZY // DC لحساب محيط AXY",
    notationLanguage: notation,
    vertices: [vA, vX, vB, vC, vD, vZ, vY],
    segments,
    angles: [],
  };
}

/**
 * مسألة 12 ص 212: رباعي مع FE = 10 سم واصلة بين منتصفين و AD = 12 و DC = 16 لإثبات زاوية D قائمة
 */
export function buildParallelQuadFE10RightAngleDFigure(
  opts: PrepGrade2ParallelQuadOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 1.5, y: 1 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 7.5, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 7.5, y: 7.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 1.5, y: 6.5 } };

  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: notation === "english" ? "F" : "و", position: { x: 4.5, y: 1 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 7.5, y: 4.25 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, lengthLabel: { value: 16, unit: "سم" } },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id, lengthLabel: { value: 12, unit: "سم" } },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sFE`, fromVertexId: vF.id, toVertexId: vE.id, lengthLabel: { value: 10, unit: "سم" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: "رباعي ABCD مع قطعة FE = 10 سم وأبعاد 12 و 16 سم لإثبات زاوية D قائمة",
    notationLanguage: notation,
    vertices: [vA, vF, vB, vE, vC, vD],
    segments,
    angles: [],
  };
}

/**
 * مسألة 19 ص 214: متوازي أضلاع ABCD مع منتصفي BC و AD لإثبات AC = 3 AG
 */
export function buildParallelogramTrisectionACFigure(
  opts: PrepGrade2ParallelQuadOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 3, y: 8 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 9, y: 8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 7, y: 2 } };

  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: notation === "english" ? "F" : "و", position: { x: 6, y: 8 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 4, y: 2 } };

  const vG: CanonicalVertexNode = { id: `${opts.figureId}_vG`, label: notation === "english" ? "G" : "ي", position: { x: 4.33, y: 6 } };
  const vH: CanonicalVertexNode = { id: `${opts.figureId}_vH`, label: notation === "english" ? "H" : "ك", position: { x: 5.67, y: 4 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sBF`, fromVertexId: vB.id, toVertexId: vF.id },
    { id: `${opts.figureId}_sED`, fromVertexId: vE.id, toVertexId: vD.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_parallelogram_diagonals",
    titleArabic: "متوازي أضلاع ABCD مع منتصفين E و F لإثبات أن AC = 3 AG",
    notationLanguage: notation,
    vertices: [vA, vF, vD, vB, vE, vC, vG, vH],
    segments,
    angles: [],
  };
}

/**
 * مسألة 22 ص 214: رباعي ABCD قائم في D مع أطوال 9 و 12 و 4 سم لحساب مساحة المثلث BEF = 15 سم²
 */
export function buildParallelQuadAreaBEF15Figure(
  opts: PrepGrade2ParallelQuadOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 5.5, y: 9 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 2.5, y: 7 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 8.5, y: 2 } };

  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 1.75, y: 4.5 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: notation === "english" ? "F" : "و", position: { x: 4.75, y: 2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, lengthLabel: { value: 9, unit: "سم" } },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id, lengthLabel: { value: 12, unit: "سم" } },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: 4, unit: "سم" } },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sEF`, fromVertexId: vE.id, toVertexId: vF.id },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aD`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: "رباعي ABCD قائم في D مع منصفين E و F لحساب مساحة BEF = 15 سم²",
    notationLanguage: notation,
    vertices: [vA, vD, vC, vB, vE, vF],
    segments,
    angles,
  };
}
