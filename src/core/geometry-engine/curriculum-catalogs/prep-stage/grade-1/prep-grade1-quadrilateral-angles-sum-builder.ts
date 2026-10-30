/**
 * @file prep-grade1-quadrilateral-angles-sum-builder.ts
 * @description منشئ أشكال مجموع زوايا الشكل الرباعي (360°) والزاوية الخارجة وشبه المنحرف (1ع).
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

export interface PrepGrade1QuadAnglesOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 1-1 ص 220: شكل رباعي زواياه 120° و 2X° و 2X° و X° ومجموعها 360° لإيجاد X = 48°
 */
export function buildQuadAnglesSum120With5XFigure(opts: PrepGrade1QuadAnglesOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 2, y: 2.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 8, y: 2.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 8.5, y: 7.2 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 4.5, y: 8 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_trapezoid_with_altitudes",
    titleArabic: "شكل رباعي ABCD زواياه 120° و 2X° و 2X° و X° لحساب قيمة X = 48°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD],
    segments,
    angles: [
      { id: `${opts.figureId}_angD`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degrees: 120, degreesLabel: "120°" },
      { id: `${opts.figureId}_angC`, vertexId: vC.id, arm1VertexId: vD.id, arm2VertexId: vB.id, degreesLabel: "2X°" },
      { id: `${opts.figureId}_angB`, vertexId: vB.id, arm1VertexId: vC.id, arm2VertexId: vA.id, degreesLabel: "2X°" },
      { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vD.id, degreesLabel: "X°" },
    ],
  };
}

/**
 * مسألة 1-4 ص 220: شكل رباعي بزاوية خارجة 4X° وزوايا داخلة 70° و 100° و 110° لحساب X = 25°
 */
export function buildQuadExteriorAngle4XFigure(opts: PrepGrade1QuadAnglesOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 3.5, y: 2.8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 8, y: 2.8 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 8.8, y: 6.8 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 4.8, y: 8.5 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 1, y: 2.8 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sEA`, fromVertexId: vE.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_trapezoid_with_altitudes",
    titleArabic: "شكل رباعي بزاوية خارجة 4X° وزوايا داخلة 70° و 100° و 110° لإيجاد X = 25°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE],
    segments,
    angles: [
      { id: `${opts.figureId}_angExt`, vertexId: vA.id, arm1VertexId: vE.id, arm2VertexId: vD.id, degreesLabel: "4X°" },
      { id: `${opts.figureId}_angD`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degrees: 70, degreesLabel: "70°" },
      { id: `${opts.figureId}_angC`, vertexId: vC.id, arm1VertexId: vD.id, arm2VertexId: vB.id, degrees: 100, degreesLabel: "100°" },
      { id: `${opts.figureId}_angB`, vertexId: vB.id, arm1VertexId: vC.id, arm2VertexId: vA.id, degrees: 110, degreesLabel: "110°" },
    ],
  };
}

/**
 * مسألة 6 ص 222: شكل رباعي ABCD مع B = 60° و D = 130° و A = 110° ومنصف CF لحساب توازي BA // CF
 */
export function buildQuadAngleBisectorParallelProofFigure(opts: PrepGrade1QuadAnglesOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 5.8, y: 8.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 8.5, y: 3 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 3.5, y: 3 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 2.8, y: 7.5 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 1, y: 3 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: localizeGeometricVertexLabelSSOT("F", notation), position: { x: 1.5, y: 6.2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCE`, fromVertexId: vC.id, toVertexId: vE.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sCF`, fromVertexId: vC.id, toVertexId: vF.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_trapezoid_with_altitudes",
    titleArabic: "شكل رباعي ABCD فيه B = 60° و D = 130° و A = 110° ومنصف CF لإثبات BA // CF",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE, vF],
    segments,
    angles: [
      { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vD.id, arm2VertexId: vB.id, degrees: 110, degreesLabel: "110°" },
      { id: `${opts.figureId}_angD`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degrees: 130, degreesLabel: "130°" },
      { id: `${opts.figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degrees: 60, degreesLabel: "60°" },
      { id: `${opts.figureId}_angFC1`, vertexId: vC.id, arm1VertexId: vD.id, arm2VertexId: vF.id, degreesLabel: "*" },
      { id: `${opts.figureId}_angFC2`, vertexId: vC.id, arm1VertexId: vF.id, arm2VertexId: vE.id, degreesLabel: "*" },
    ],
  };
}

/**
 * مسألة 2-2 ص 220: شبه منحرف متساوي الساقين (3X-55)° = 2X° لحساب X = 55° و D = 70°
 */
export function buildTrapezoidIsoscelesAlgebraicFigure(opts: PrepGrade1QuadAnglesOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 2, y: 2.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 8, y: 2.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 6.5, y: 7.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 3.5, y: 7.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, tickMarks: 1 },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id, tickMarks: 1 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_trapezoid_with_altitudes",
    titleArabic: "شبه منحرف متساوي الساقين (3X-55)° = 2X° لحساب X = 55° وزاوية D = 70°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD],
    segments,
    angles: [
      { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vD.id, arm2VertexId: vB.id, degreesLabel: "(3X-55)°" },
      { id: `${opts.figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degreesLabel: "2X°" },
      { id: `${opts.figureId}_angD`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degrees: 70, degreesLabel: "؟" },
    ],
  };
}
