/**
 * @file prep-grade1-triangle-parallel-bisectors-builder.ts
 * @description منشئ أشكال المثلث المتداخل مع التوازي ومنصفات الزوايا (1ع).
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

export interface PrepGrade1TriangleParallelOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 8 ص 209: DE // CB مع D = 100° و C = 30° لحساب زاوية BAC = 70°
 */
export function buildTriangleParallelDE100Figure(opts: PrepGrade1TriangleParallelOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 5, y: 8.8 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 1.5, y: 8.8 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 5.5, y: 6.8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 6, y: 2.2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 2, y: 2.2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sDB`, fromVertexId: vD.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sCA`, fromVertexId: vC.id, toVertexId: vA.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "DE // CB مع D = 100° و C = 30° لحساب زاوية BAC = 70°",
    notationLanguage: notation,
    vertices: [vD, vE, vA, vB, vC],
    segments,
    angles: [
      { id: `${opts.figureId}_angD`, vertexId: vD.id, arm1VertexId: vE.id, arm2VertexId: vB.id, degrees: 100, degreesLabel: "100°" },
      { id: `${opts.figureId}_angC`, vertexId: vC.id, arm1VertexId: vA.id, arm2VertexId: vB.id, degrees: 30, degreesLabel: "30°" },
      { id: `${opts.figureId}_angBAC`, vertexId: vA.id, arm1VertexId: vC.id, arm2VertexId: vB.id, degrees: 70, degreesLabel: "؟" },
    ],
  };
}

/**
 * مسألة 9 ص 209: DE // FX // CB مع F = 135° و D = 120° لحساب زوايا المثلث ABC (75° و 60° و 45°)
 */
export function buildTriangleParallelDoubleFXDEFigure(opts: PrepGrade1TriangleParallelOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 5, y: 6.8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 7.8, y: 2.2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 2.2, y: 2.2 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 6.5, y: 8.5 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 8.8, y: 8.5 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: localizeGeometricVertexLabelSSOT("F", notation), position: { x: 3.5, y: 8.5 } };
  const vX: CanonicalVertexNode = { id: `${opts.figureId}_vX`, label: localizeGeometricVertexLabelSSOT("X", notation), position: { x: 1.2, y: 8.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sFX`, fromVertexId: vF.id, toVertexId: vX.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sAF`, fromVertexId: vA.id, toVertexId: vF.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "DE // FX // CB مع F = 135° و D = 120° لحساب زوايا المثلث ABC (75° و 60° و 45°)",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE, vF, vX],
    segments,
    angles: [
      { id: `${opts.figureId}_angD`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vE.id, degrees: 120, degreesLabel: "120°" },
      { id: `${opts.figureId}_angF`, vertexId: vF.id, arm1VertexId: vA.id, arm2VertexId: vX.id, degrees: 135, degreesLabel: "135°" },
    ],
  };
}

/**
 * مسألة 14-7 ص 210: منصفا زاويتي القاعدة يتقاطعان بزاوية 126° لحساب زاوية الرأس C = 72°
 */
export function buildTriangleBaseAngleBisectors126Figure(opts: PrepGrade1TriangleParallelOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 5, y: 8.5 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 1.5, y: 2.2 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 8.5, y: 2.2 } };
  const vI: CanonicalVertexNode = { id: `${opts.figureId}_vI`, label: localizeGeometricVertexLabelSSOT("I", notation), position: { x: 5, y: 4.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sCA`, fromVertexId: vC.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sCB`, fromVertexId: vC.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sAI`, fromVertexId: vA.id, toVertexId: vI.id },
    { id: `${opts.figureId}_sBI`, fromVertexId: vB.id, toVertexId: vI.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_interior_exterior_bisector",
    titleArabic: "مثلث ABC فيه منصفا زاويتي القاعدة يتقاطعان بزاوية 126° لإيجاد زاوية الرأس C = 72°",
    notationLanguage: notation,
    vertices: [vC, vA, vB, vI],
    segments,
    angles: [
      { id: `${opts.figureId}_angA1`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vI.id, degreesLabel: "*" },
      { id: `${opts.figureId}_angA2`, vertexId: vA.id, arm1VertexId: vI.id, arm2VertexId: vC.id, degreesLabel: "*" },
      { id: `${opts.figureId}_angB1`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vI.id, degreesLabel: "•" },
      { id: `${opts.figureId}_angB2`, vertexId: vB.id, arm1VertexId: vI.id, arm2VertexId: vC.id, degreesLabel: "•" },
      { id: `${opts.figureId}_angI`, vertexId: vI.id, arm1VertexId: vA.id, arm2VertexId: vB.id, degrees: 126, degreesLabel: "126°" },
      { id: `${opts.figureId}_angC`, vertexId: vC.id, arm1VertexId: vA.id, arm2VertexId: vB.id, degrees: 72, degreesLabel: "؟" },
    ],
  };
}

/**
 * مسألة 10 ص 209: ABC مثلث فيه B = 60° و A = 80° و ED // CB لحساب AED = 40° و DEC = 140°
 */
export function buildTriangleMidParallelEDFigure(opts: PrepGrade1TriangleParallelOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 5, y: 8.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 8.5, y: 2.2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 1.5, y: 2.2 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 6.8, y: 5.4 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 3.2, y: 5.4 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sCA`, fromVertexId: vC.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sED`, fromVertexId: vE.id, toVertexId: vD.id, parallelArrows: 1 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "مثلث ABC فيه B = 60° و A = 80° و ED // CB لحساب AED = 40° و DEC = 140°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE],
    segments,
    angles: [
      { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vC.id, arm2VertexId: vB.id, degrees: 80, degreesLabel: "80°" },
      { id: `${opts.figureId}_angB`, vertexId: vB.id, arm1VertexId: vC.id, arm2VertexId: vA.id, degrees: 60, degreesLabel: "60°" },
      { id: `${opts.figureId}_angAED`, vertexId: vE.id, arm1VertexId: vA.id, arm2VertexId: vD.id, degrees: 40, degreesLabel: "40°" },
      { id: `${opts.figureId}_angDEC`, vertexId: vE.id, arm1VertexId: vC.id, arm2VertexId: vD.id, degrees: 140, degreesLabel: "140°" },
    ],
  };
}
