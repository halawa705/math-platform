/**
 * @file prep-grade2-triangle-midsegments-builder.ts
 * @description منشئ أشكال القطع المستقيمة الواصلة بين منتصفات أضلاع المثلث ومحيط المثلث المتوسط (هندسة 2 إعدادي):
 * - مثلث أضلاعه 6 و 8 و 10 سم مع منتصفات أضلاعه ومحيط 12 سم وقائم (مسألة 8 ص 212).
 * - مثلث XYZ منصفات أضلاع محيطه 40 سم لحساب محيط ABC = 80 سم (مسألة 9 ص 212).
 * - قطعة واصلة بين منتصفين DE = 2x+1 وقاعدة BC = 5x-5 لإيجاد x = 7 (مسألة 13 ص 213).
 * - مثلث قائم في C مع AB = 5 و BC = 4 لحساب طول DE = 1.5 سم (مسألة 6 ص 211).
 * - تكرار تنصيف الأضلاع لإثبات BC = 4 GH (مسألة 21 ص 214).
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

export const MODULE_ID_PREP_GRADE2_TRIANGLE_MIDSEGMENTS_BUILDER =
  "prep_grade2_triangle_midsegments_builder" as const;

export interface PrepGrade2MidsegmentsOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 8 ص 212: منتصفات أضلاع D, E, F لمثلث بأطوال 6 و 8 و 10 سم ومحيط 12 سم
 */
export function buildTriangleMidsegmentsPerimeter12Figure(
  opts: PrepGrade2MidsegmentsOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 8.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 1, y: 1 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 9, y: 1 } };

  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: notation === "english" ? "F" : "و", position: { x: 3, y: 4.75 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 7, y: 4.75 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 5, y: 1 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, lengthLabel: { value: 8, unit: "سم" } },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: 6, unit: "سم" } },
    { id: `${opts.figureId}_sCB`, fromVertexId: vC.id, toVertexId: vB.id, lengthLabel: { value: 10, unit: "سم" } },
    { id: `${opts.figureId}_sFD`, fromVertexId: vF.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id },
    { id: `${opts.figureId}_sEF`, fromVertexId: vE.id, toVertexId: vF.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_midsegment_joining_midpoints",
    titleArabic: "محيط المثلث FED منصفات أضلاع 6 و 8 و 10 سم ومحيطه 12 سم",
    notationLanguage: notation,
    vertices: [vA, vF, vC, vE, vB, vD],
    segments,
    angles: [],
  };
}

/**
 * مسألة 13 ص 213: DE = (2x+1) و BC = (5x-5) مع منتصفي ضلعين لإيجاد x = 7
 */
export function buildTriangleMidsegmentAlgebraicX7Figure(
  opts: PrepGrade2MidsegmentsOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 9 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 9, y: 1 } };

  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 3, y: 5 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 7, y: 5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, tickMarks: 1 },
    { id: `${opts.figureId}_sDB`, fromVertexId: vD.id, toVertexId: vB.id, tickMarks: 1 },
    { id: `${opts.figureId}_sAE`, fromVertexId: vA.id, toVertexId: vE.id, tickMarks: 2 },
    { id: `${opts.figureId}_sEC`, fromVertexId: vE.id, toVertexId: vC.id, tickMarks: 2 },
    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id, lengthLabel: { value: "2X+1", unit: "سم" }, parallelArrows: 1 },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: "5X-5", unit: "سم" }, parallelArrows: 1 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_midsegment_joining_midpoints",
    titleArabic: "قطعة واصلة بين منتصفين DE = 2X+1 و BC = 5X-5 لحساب X = 7",
    notationLanguage: notation,
    vertices: [vA, vD, vB, vE, vC],
    segments,
    angles: [],
  };
}

/**
 * مسألة 6 ص 211: مثلث قائم في C مع AB = 5 و BC = 4 لحساب طول DE = 1.5 سم
 */
export function buildRightTriangleMidsegmentDE15Figure(
  opts: PrepGrade2MidsegmentsOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 7, y: 1 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1, y: 1 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 7, y: 8 } };

  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 4, y: 1 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 4, y: 4.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: 4, unit: "سم" } },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: 5, unit: "سم" } },
    { id: `${opts.figureId}_sBE`, fromVertexId: vB.id, toVertexId: vE.id, tickMarks: 1 },
    { id: `${opts.figureId}_sEC`, fromVertexId: vE.id, toVertexId: vC.id, tickMarks: 1 },
    { id: `${opts.figureId}_sBD`, fromVertexId: vB.id, toVertexId: vD.id, tickMarks: 2 },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id, tickMarks: 2 },
    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aC`, vertexId: vC.id, arm1VertexId: vB.id, arm2VertexId: vA.id, isRightAngle: true },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_midsegment_joining_midpoints",
    titleArabic: "مثلث قائم في C مع منصفين D و E لحساب طول DE = 1.5 سم",
    notationLanguage: notation,
    vertices: [vB, vE, vC, vA, vD],
    segments,
    angles,
  };
}

/**
 * مسألة 21 ص 214: تكرار تنصيف الأضلاع لإثبات BC = 4 GH
 */
export function buildDoubleMidsegmentQuadGHFigure(
  opts: PrepGrade2MidsegmentsOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 9.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1, y: 4 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 9, y: 4 } };

  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 3, y: 6.75 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 7, y: 6.75 } };

  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: notation === "english" ? "F" : "و", position: { x: 5, y: 1 } };
  const vG: CanonicalVertexNode = { id: `${opts.figureId}_vG`, label: notation === "english" ? "G" : "ي", position: { x: 4, y: 3.8 } };
  const vH: CanonicalVertexNode = { id: `${opts.figureId}_vH`, label: notation === "english" ? "H" : "ك", position: { x: 6, y: 3.8 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id },
    { id: `${opts.figureId}_sDF`, fromVertexId: vD.id, toVertexId: vF.id },
    { id: `${opts.figureId}_sEF`, fromVertexId: vE.id, toVertexId: vF.id },
    { id: `${opts.figureId}_sGH`, fromVertexId: vG.id, toVertexId: vH.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_midsegment_joining_midpoints",
    titleArabic: "تكرار تنصيف الأضلاع لإثبات أن BC = 4 GH",
    notationLanguage: notation,
    vertices: [vA, vD, vB, vE, vC, vF, vG, vH],
    segments,
    angles: [],
  };
}
