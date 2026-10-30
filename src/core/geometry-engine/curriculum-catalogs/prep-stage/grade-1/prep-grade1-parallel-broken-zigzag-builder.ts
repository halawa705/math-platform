/**
 * @file prep-grade1-parallel-broken-zigzag-builder.ts
 * @description منشئ أشكال الزوايا المنكسرة بين مستقيمات متوازية (حرف M وحرف W وحرف سيجما) (1ع).
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

export interface PrepGrade1ParallelZigzagOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 5-1 ص 192: زاوية منكسرة بين مستقيمين متوازيين مع 40° و 55° لحساب زاوية الرأس X = 95°
 */
export function buildParallelBrokenZigzagClassicFigure(opts: PrepGrade1ParallelZigzagOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 7.5, y: 7.8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 2, y: 7.8 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 4.5, y: 5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 7.5, y: 5 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 7.5, y: 2.2 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: localizeGeometricVertexLabelSSOT("F", notation), position: { x: 2, y: 2.2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sTop`, fromVertexId: vB.id, toVertexId: vA.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCE`, fromVertexId: vC.id, toVertexId: vE.id },
    { id: `${opts.figureId}_sBot`, fromVertexId: vF.id, toVertexId: vE.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sAux`, fromVertexId: vC.id, toVertexId: vD.id, strokeStyle: "dashed" },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "زاوية منكسرة بين مستقيمين متوازيين مع زاويتي 40° و 55° لإيجاد الزاوية المنكسرة X = 95°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE, vF],
    segments,
    angles: [
      { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vC.id, degrees: 40, degreesLabel: "40°" },
      { id: `${opts.figureId}_angE`, vertexId: vE.id, arm1VertexId: vF.id, arm2VertexId: vC.id, degrees: 55, degreesLabel: "55°" },
      { id: `${opts.figureId}_angC`, vertexId: vC.id, arm1VertexId: vA.id, arm2VertexId: vE.id, degrees: 95, degreesLabel: "X°" },
    ],
  };
}

/**
 * مسألة 10 ص 194: AB // CD و EF // CD مع A = 70° و C = 120° لإيجاد AEC = 130°
 */
export function buildParallelBrokenThreeRaysAEC130Figure(opts: PrepGrade1ParallelZigzagOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 3, y: 8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 8.5, y: 8 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 5.5, y: 5 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: localizeGeometricVertexLabelSSOT("F", notation), position: { x: 1.5, y: 5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 3.5, y: 2 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 1.5, y: 2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sAE`, fromVertexId: vA.id, toVertexId: vE.id },
    { id: `${opts.figureId}_sEF`, fromVertexId: vE.id, toVertexId: vF.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sEC`, fromVertexId: vE.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, parallelArrows: 1 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "توازي ثلاثة أشعة AB // CD // EF مع A = 70° و C = 120° لإيجاد زاوية AEC = 130°",
    notationLanguage: notation,
    vertices: [vA, vB, vE, vF, vC, vD],
    segments,
    angles: [
      { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vE.id, degrees: 70, degreesLabel: "70°" },
      { id: `${opts.figureId}_angC`, vertexId: vC.id, arm1VertexId: vD.id, arm2VertexId: vE.id, degrees: 120, degreesLabel: "120°" },
      { id: `${opts.figureId}_angAEC`, vertexId: vE.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degrees: 130, degreesLabel: "130°" },
    ],
  };
}

/**
 * مسألة 14-3 ص 196: شعاعان متوازيان وزاوية منكسرة قائمة 90° مع زاوية 40° لإيجاد X = 50°
 */
export function buildParallelBrokenRightAngleFigure(opts: PrepGrade1ParallelZigzagOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 2, y: 7.8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 8, y: 7.8 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 5, y: 5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 2, y: 2.2 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 8, y: 2.2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sTop`, fromVertexId: vA.id, toVertexId: vB.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sBot`, fromVertexId: vD.id, toVertexId: vE.id, parallelArrows: 1 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "شعاعان متوازيان مع زاوية منكسرة قائمة 90° وزاوية 40° لإيجاد قيمة X = 50°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE],
    segments,
    angles: [
      { id: `${opts.figureId}_angTop`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vC.id, degrees: 40, degreesLabel: "40°" },
      { id: `${opts.figureId}_angC`, vertexId: vC.id, arm1VertexId: vA.id, arm2VertexId: vD.id, degrees: 90, degreesLabel: "90°" },
      { id: `${opts.figureId}_angBot`, vertexId: vD.id, arm1VertexId: vE.id, arm2VertexId: vC.id, degrees: 50, degreesLabel: "X°" },
    ],
  };
}

/**
 * مسألة 14-6 ص 196: AB // DE مع A = 30° و D = 50° والزاوية المنعكسة (6X+40)° = 280° لإيجاد X = 40°
 */
export function buildParallelBrokenReflexAlgebraicFigure(opts: PrepGrade1ParallelZigzagOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 2, y: 7.8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 8.5, y: 7.8 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 5.5, y: 5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 2, y: 2.2 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 8.5, y: 2.2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sTop`, fromVertexId: vA.id, toVertexId: vB.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sBot`, fromVertexId: vD.id, toVertexId: vE.id, parallelArrows: 1 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "AB // DE مع A = 30° و D = 50° وزاوية منعكسة (6X+40)° لحساب قيمة X = 40°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE],
    segments,
    angles: [
      { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vC.id, degrees: 30, degreesLabel: "30°" },
      { id: `${opts.figureId}_angD`, vertexId: vD.id, arm1VertexId: vE.id, arm2VertexId: vC.id, degrees: 50, degreesLabel: "50°" },
      { id: `${opts.figureId}_angC`, vertexId: vC.id, arm1VertexId: vA.id, arm2VertexId: vD.id, degrees: 280, degreesLabel: "(6X+40)°" },
    ],
  };
}
