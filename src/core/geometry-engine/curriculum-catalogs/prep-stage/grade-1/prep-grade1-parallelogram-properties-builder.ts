/**
 * @file prep-grade1-parallelogram-properties-builder.ts
 * @description منشئ أشكال خواص متوازي الأضلاع: الزوايا المتقابلة والمتتالية وتناصف القطرين (1ع).
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

export interface PrepGrade1ParallelogramOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 3-1 ص 221: متوازي أضلاع ABCD فيه A = 50° لحساب X = 50° و y = 130°
 */
export function buildParallelogramAnglesOppositeConsecutiveFigure(opts: PrepGrade1ParallelogramOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 2, y: 3 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 7.5, y: 3 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 8.5, y: 7.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 3, y: 7.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, parallelArrows: 2 },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id, parallelArrows: 2 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_parallelogram_diagonals",
    titleArabic: "متوازي أضلاع ABCD فيه A = 50° لحساب الزاوية المقابلة X = 50° والمتتالية y = 130°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD],
    segments,
    angles: [
      { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vD.id, arm2VertexId: vB.id, degrees: 50, degreesLabel: "50°" },
      { id: `${opts.figureId}_angC`, vertexId: vC.id, arm1VertexId: vD.id, arm2VertexId: vB.id, degrees: 50, degreesLabel: "X°" },
      { id: `${opts.figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degrees: 130, degreesLabel: "y°" },
    ],
  };
}

/**
 * مسألة 3-2 ص 221: أضلاع متوازي الأضلاع المتقابلة متساوية X - 2 = 10 و 2y - 7 = y لحساب X = 12 و y = 7
 */
export function buildParallelogramOppositeSidesAlgebraicFigure(opts: PrepGrade1ParallelogramOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 2, y: 3 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 7.5, y: 3 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 8.5, y: 7.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 3, y: 7.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: "10 سم" } },
    { id: `${opts.figureId}_sCD`, fromVertexId: vD.id, toVertexId: vC.id, lengthLabel: { value: "(X - 2) سم" } },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, lengthLabel: { value: "(y) سم" } },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: "(2y - 7) سم" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_parallelogram_diagonals",
    titleArabic: "متوازي أضلاع ABCD أضلاعه المتقابلة متساوية X - 2 = 10 و 2y - 7 = y لإيجاد X = 12 و y = 7",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD],
    segments,
    angles: [],
  };
}

/**
 * مسألة 3-3 ص 221: قطرا متوازي الأضلاع ينصف كل منهما الآخر 3y - 4 = 2y و X + y = 10 لحساب y = 4 و X = 6
 */
export function buildParallelogramDiagonalsBisectFigure(opts: PrepGrade1ParallelogramOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 1.5, y: 3 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 7.5, y: 3 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 8.5, y: 7.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 2.5, y: 7.5 } };
  const vM: CanonicalVertexNode = { id: `${opts.figureId}_vM`, label: localizeGeometricVertexLabelSSOT("M", notation), position: { x: 5, y: 5.25 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sAM`, fromVertexId: vA.id, toVertexId: vM.id, lengthLabel: { value: "X + y" } },
    { id: `${opts.figureId}_sMC`, fromVertexId: vM.id, toVertexId: vC.id, lengthLabel: { value: "10 سم" } },
    { id: `${opts.figureId}_sDM`, fromVertexId: vD.id, toVertexId: vM.id, lengthLabel: { value: "2y" } },
    { id: `${opts.figureId}_sMB`, fromVertexId: vM.id, toVertexId: vB.id, lengthLabel: { value: "3y - 4" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_parallelogram_diagonals",
    titleArabic: "قطرا متوازي الأضلاع ينصف كل منهما الآخر 3y - 4 = 2y و X + y = 10 لحساب y = 4 و X = 6",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vM],
    segments,
    angles: [],
  };
}

/**
 * مسألة 3-4 ص 221: أضلاع وزوايا جبرية 5X - 11 = 2X + 1 و (6y+3)° + (10y+1)° = 180° لحساب X = 4 و y = 11
 */
export function buildParallelogramSidesAndAnglesEquationsFigure(opts: PrepGrade1ParallelogramOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 2, y: 3 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 7.5, y: 3 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 8.5, y: 7.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 3, y: 7.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: "(2X + 1) سم" } },
    { id: `${opts.figureId}_sCD`, fromVertexId: vD.id, toVertexId: vC.id, lengthLabel: { value: "(5X - 11) سم" } },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_parallelogram_diagonals",
    titleArabic: "متوازي أضلاع بمعادلات أضلاع 5X - 11 = 2X + 1 وزوايا متتالية لحساب X = 4 و y = 11",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD],
    segments,
    angles: [
      { id: `${opts.figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degreesLabel: "(10y+1)°" },
      { id: `${opts.figureId}_angC`, vertexId: vC.id, arm1VertexId: vD.id, arm2VertexId: vB.id, degreesLabel: "(6y+3)°" },
    ],
  };
}
