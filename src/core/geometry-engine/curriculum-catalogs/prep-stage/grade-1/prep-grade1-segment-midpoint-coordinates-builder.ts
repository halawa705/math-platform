/**
 * @file prep-grade1-segment-midpoint-coordinates-builder.ts
 * @description منشئ أشكال إحداثيا منتصف قطعة مستقيمة في المستوى الإحداثي (1ع).
 * @invariant يلتزم بحدود الأسطر (< 200 سطر) وTypeScript الصارم وفق دستور المنصة (AGENTS.md).
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

export interface PrepGrade1MidpointOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * ص 253: القانون العام لإحداثيي منتصف قطعة مستقيمة M = ((x1+x2)/2, (y1+y2)/2)
 */
export function buildSegmentMidpointCoordinatesFigure(opts: PrepGrade1MidpointOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  // المحاور الإحداثية
  const vXneg: CanonicalVertexNode = { id: `${opts.figureId}_vXneg`, label: "", position: { x: 0.5, y: 7.5 } };
  const vXpos: CanonicalVertexNode = { id: `${opts.figureId}_vXpos`, label: notation === "english" ? "X" : "س", position: { x: 9.5, y: 7.5 } };
  const vYneg: CanonicalVertexNode = { id: `${opts.figureId}_vYneg`, label: "", position: { x: 2, y: 8.5 } };
  const vYpos: CanonicalVertexNode = { id: `${opts.figureId}_vYpos`, label: notation === "english" ? "y" : "ص", position: { x: 2, y: 0.5 } };
  const vO: CanonicalVertexNode = { id: `${opts.figureId}_vO`, label: localizeGeometricVertexLabelSSOT("و", notation), position: { x: 2, y: 7.5 } };

  // النقاط: A(x1, y1), B(x2, y2), M((x1+x2)/2, (y1+y2)/2)
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: "A(x₁, y₁)", position: { x: 3.5, y: 6 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: "B(x₂, y₂)", position: { x: 8.5, y: 2 } };
  const vM: CanonicalVertexNode = { id: `${opts.figureId}_vM`, label: "M", position: { x: 6, y: 4 } };

  // مساقط على المحاور
  const vProjAx: CanonicalVertexNode = { id: `${opts.figureId}_vPAx`, label: "x₁", position: { x: 3.5, y: 7.5 } };
  const vProjMx: CanonicalVertexNode = { id: `${opts.figureId}_vPMx`, label: "(x₁+x₂)/2", position: { x: 6, y: 7.5 } };
  const vProjBx: CanonicalVertexNode = { id: `${opts.figureId}_vPBx`, label: "x₂", position: { x: 8.5, y: 7.5 } };

  const vProjAy: CanonicalVertexNode = { id: `${opts.figureId}_vPAy`, label: "y₁", position: { x: 2, y: 6 } };
  const vProjMy: CanonicalVertexNode = { id: `${opts.figureId}_vPMy`, label: "(y₁+y₂)/2", position: { x: 2, y: 4 } };
  const vProjBy: CanonicalVertexNode = { id: `${opts.figureId}_vPBy`, label: "y₂", position: { x: 2, y: 2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAxisX`, fromVertexId: vXneg.id, toVertexId: vXpos.id },
    { id: `${opts.figureId}_sAxisY`, fromVertexId: vYneg.id, toVertexId: vYpos.id },
    { id: `${opts.figureId}_sAM`, fromVertexId: vA.id, toVertexId: vM.id, tickMarks: 1 },
    { id: `${opts.figureId}_sMB`, fromVertexId: vM.id, toVertexId: vB.id, tickMarks: 1 },
    // إسقاطات سينية منقطة
    { id: `${opts.figureId}_sProjAx`, fromVertexId: vA.id, toVertexId: vProjAx.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sProjMx`, fromVertexId: vM.id, toVertexId: vProjMx.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sProjBx`, fromVertexId: vB.id, toVertexId: vProjBx.id, strokeStyle: "dashed" },
    // إسقاطات صادية منقطة
    { id: `${opts.figureId}_sProjAy`, fromVertexId: vA.id, toVertexId: vProjAy.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sProjMy`, fromVertexId: vM.id, toVertexId: vProjMy.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sProjBy`, fromVertexId: vB.id, toVertexId: vProjBy.id, strokeStyle: "dashed" },
  ];

  return {
    figureId: opts.figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: "إحداثيا منتصف قطعة مستقيمة M = ((x1 + x2)/2 , (y1 + y2)/2)",
    notationLanguage: notation,
    vertices: [vXneg, vXpos, vYneg, vYpos, vO, vA, vB, vM, vProjAx, vProjMx, vProjBx, vProjAy, vProjMy, vProjBy],
    segments,
    angles: [],
  };
}

/**
 * مسألة عددية: إيجاد إحداثيي منتصف القطعة AB حيث A(1, 2) و B(5, 6) -> M(3, 4)
 */
export function buildSegmentMidpointNumericalFigure(opts: PrepGrade1MidpointOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vXneg: CanonicalVertexNode = { id: `${opts.figureId}_vXneg`, label: "", position: { x: 0.5, y: 7.5 } };
  const vXpos: CanonicalVertexNode = { id: `${opts.figureId}_vXpos`, label: notation === "english" ? "X" : "س", position: { x: 9.5, y: 7.5 } };
  const vYneg: CanonicalVertexNode = { id: `${opts.figureId}_vYneg`, label: "", position: { x: 1.5, y: 8.5 } };
  const vYpos: CanonicalVertexNode = { id: `${opts.figureId}_vYpos`, label: notation === "english" ? "y" : "ص", position: { x: 1.5, y: 0.5 } };
  const vO: CanonicalVertexNode = { id: `${opts.figureId}_vO`, label: localizeGeometricVertexLabelSSOT("و", notation), position: { x: 1.5, y: 7.5 } };

  // A(1, 2) و B(5, 6) و M(3, 4)
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: "A(1, 2)", position: { x: 2.7, y: 5.7 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: "B(5, 6)", position: { x: 7.5, y: 2.1 } };
  const vM: CanonicalVertexNode = { id: `${opts.figureId}_vM`, label: "M(3, 4)", position: { x: 5.1, y: 3.9 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAxisX`, fromVertexId: vXneg.id, toVertexId: vXpos.id },
    { id: `${opts.figureId}_sAxisY`, fromVertexId: vYneg.id, toVertexId: vYpos.id },
    { id: `${opts.figureId}_sAM`, fromVertexId: vA.id, toVertexId: vM.id, tickMarks: 1 },
    { id: `${opts.figureId}_sMB`, fromVertexId: vM.id, toVertexId: vB.id, tickMarks: 1 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: "منتصف القطعة المستقيمة AB: النقطتان A(1, 2) و B(5, 6) ونقطة المنتصف M(3, 4)",
    notationLanguage: notation,
    vertices: [vXneg, vXpos, vYneg, vYpos, vO, vA, vB, vM],
    segments,
    angles: [],
  };
}
