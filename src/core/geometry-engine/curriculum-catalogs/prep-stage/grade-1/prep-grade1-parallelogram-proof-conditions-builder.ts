/**
 * @file prep-grade1-parallelogram-proof-conditions-builder.ts
 * @description منشئ أشكال شروط وبراهين إثبات متوازي الأضلاع وتطبيقات المثلثات المتصلة (1ع).
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

export interface PrepGrade1ParallelogramProofOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 5 ص 221: متوازي أضلاع ABCD مع مثلث خارجي EGB فيه D = 75° و G = 35° و GBA = 70° لحساب E = 110°
 */
export function buildParallelogramExternalTriangleEGBFigure(opts: PrepGrade1ParallelogramProofOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 5.5, y: 7.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 8.5, y: 7.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 7.5, y: 3 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 4.5, y: 3 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 1.5, y: 3 } };
  const vG: CanonicalVertexNode = { id: `${opts.figureId}_vG`, label: localizeGeometricVertexLabelSSOT("G", notation), position: { x: 1, y: 6.8 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id, parallelArrows: 2 },
    { id: `${opts.figureId}_sEC`, fromVertexId: vE.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, parallelArrows: 2 },
    { id: `${opts.figureId}_sGE`, fromVertexId: vG.id, toVertexId: vE.id },
    { id: `${opts.figureId}_sGB`, fromVertexId: vG.id, toVertexId: vB.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_parallelogram_diagonals",
    titleArabic: "متوازي أضلاع ABCD مع مثلث خارجي EGB فيه D = 75° و G = 35° و GBA = 70° لحساب E = 110°",
    notationLanguage: notation,
    vertices: [vA, vD, vC, vB, vE, vG],
    segments,
    angles: [
      { id: `${opts.figureId}_angD`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degrees: 75, degreesLabel: "75°" },
      { id: `${opts.figureId}_angG`, vertexId: vG.id, arm1VertexId: vE.id, arm2VertexId: vB.id, degrees: 35, degreesLabel: "35°" },
      { id: `${opts.figureId}_angGBA`, vertexId: vB.id, arm1VertexId: vG.id, arm2VertexId: vA.id, degrees: 70, degreesLabel: "70°" },
      { id: `${opts.figureId}_angE`, vertexId: vE.id, arm1VertexId: vG.id, arm2VertexId: vB.id, degrees: 110, degreesLabel: "؟" },
    ],
  };
}

/**
 * مسألة 7 ص 222: شكل رباعي تقاطع قطراه في M مع ABD = 34° و DCA = 31° و CMB = 65° لإثبات متوازي الأضلاع
 */
export function buildParallelogramProofDiagonalsCMBFigure(opts: PrepGrade1ParallelogramProofOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 1.5, y: 3 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 7.5, y: 3 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 8.5, y: 7.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 2.5, y: 7.5 } };
  const vM: CanonicalVertexNode = { id: `${opts.figureId}_vM`, label: localizeGeometricVertexLabelSSOT("M", notation), position: { x: 5, y: 5.25 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sBD`, fromVertexId: vB.id, toVertexId: vD.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_parallelogram_diagonals",
    titleArabic: "شكل رباعي قطراه متقاطعان مع ABD = 34° و DCA = 31° و CMB = 65° لإثبات أنه متوازي أضلاع",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vM],
    segments,
    angles: [
      { id: `${opts.figureId}_angABD`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vM.id, degrees: 34, degreesLabel: "34°" },
      { id: `${opts.figureId}_angDCA`, vertexId: vC.id, arm1VertexId: vD.id, arm2VertexId: vM.id, degrees: 31, degreesLabel: "31°" },
      { id: `${opts.figureId}_angCMB`, vertexId: vM.id, arm1VertexId: vC.id, arm2VertexId: vB.id, degrees: 65, degreesLabel: "65°" },
    ],
  };
}

/**
 * مسألة 10 ص 222: إثبات أن ABCD متوازي أضلاع بزوايا D = 65° و C = 115° و E = 70° و A = 45°
 */
export function buildParallelogramProofConsecutiveAngles65115Figure(opts: PrepGrade1ParallelogramProofOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 7, y: 8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 8.5, y: 3 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 3, y: 3 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 1.5, y: 8 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 5, y: 3 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sAE`, fromVertexId: vA.id, toVertexId: vE.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_parallelogram_diagonals",
    titleArabic: "إثبات أن ABCD متوازي أضلاع بزوايا D = 65° و C = 115° و E = 70° و A = 45°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE],
    segments,
    angles: [
      { id: `${opts.figureId}_angD`, vertexId: vD.id, arm1VertexId: vC.id, arm2VertexId: vA.id, degrees: 65, degreesLabel: "65°" },
      { id: `${opts.figureId}_angC`, vertexId: vC.id, arm1VertexId: vD.id, arm2VertexId: vB.id, degrees: 115, degreesLabel: "115°" },
      { id: `${opts.figureId}_angAEB`, vertexId: vE.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degrees: 70, degreesLabel: "70°" },
      { id: `${opts.figureId}_angEAB`, vertexId: vA.id, arm1VertexId: vE.id, arm2VertexId: vB.id, degrees: 45, degreesLabel: "45°" },
    ],
  };
}

/**
 * مسألة 11 ص 222: إيجاد قيم a و b التي تجعل الشكل متوازي أضلاع (a - 11 = 32 و 2b - 5 = b - 1)
 */
export function buildParallelogramAlgebraicParametersABFigure(opts: PrepGrade1ParallelogramProofOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 2, y: 3 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 6.5, y: 3 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 8, y: 7.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 3.5, y: 7.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: "(2b - 5) سم" } },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id, lengthLabel: { value: "(b - 1) سم" } },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_parallelogram_diagonals",
    titleArabic: "قيم a و b التي تجعل الشكل متوازي أضلاع: a = 43 و b = 4",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD],
    segments,
    angles: [
      { id: `${opts.figureId}_angBAC`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vC.id, degrees: 32, degreesLabel: "32°" },
      { id: `${opts.figureId}_angDCA`, vertexId: vC.id, arm1VertexId: vD.id, arm2VertexId: vA.id, degreesLabel: "(a - 11)°" },
    ],
  };
}
