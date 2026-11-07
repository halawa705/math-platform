/**
 * @file prep-grade1-parallel-basic-transversal-builder.ts
 * @description منشئ أشكال التوازي الأساسية مع القاطع: التبادل (Z) والتناظر (F) والتداخل (U) والجبر (1ع).
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

export interface PrepGrade1ParallelOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
  readonly deg?: number;
}

/**
 * شكل 3-1 و 4-3 ص 191: توازي وتناظر حرف F بزاوية 63° أو 60°
 */
export function buildParallelCorrespondingAnglesFigure(opts: PrepGrade1ParallelOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";
  const deg = opts.deg ?? 63;

  const vA1: CanonicalVertexNode = { id: `${opts.figureId}_vA1`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 1.5, y: 7 } };
  const vB1: CanonicalVertexNode = { id: `${opts.figureId}_vB1`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 8.5, y: 7 } };
  const vA2: CanonicalVertexNode = { id: `${opts.figureId}_vA2`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 1.5, y: 3.5 } };
  const vB2: CanonicalVertexNode = { id: `${opts.figureId}_vB2`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 8.5, y: 3.5 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 6.5, y: 7 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: localizeGeometricVertexLabelSSOT("F", notation), position: { x: 4.72, y: 3.5 } };
  const vTTop: CanonicalVertexNode = { id: `${opts.figureId}_vTTop`, label: "", position: { x: 6.91, y: 7.80 } };
  const vTBot: CanonicalVertexNode = { id: `${opts.figureId}_vTBot`, label: "", position: { x: 4.31, y: 2.70 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sL1`, fromVertexId: vA1.id, toVertexId: vB1.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sL2`, fromVertexId: vA2.id, toVertexId: vB2.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sTrans`, fromVertexId: vTTop.id, toVertexId: vTBot.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: `مستقيمان متوازيان وقاطع بحالة التناظر (حرف F) بزاوية ${deg}°`,
    notationLanguage: notation,
    vertices: [vA1, vB1, vA2, vB2, vE, vF, vTTop, vTBot],
    segments,
    angles: [
      { id: `${opts.figureId}_angTop`, vertexId: vE.id, arm1VertexId: vTTop.id, arm2VertexId: vB1.id, degrees: deg, degreesLabel: `${deg}°` },
      { id: `${opts.figureId}_angBot`, vertexId: vF.id, arm1VertexId: vE.id, arm2VertexId: vB2.id, degrees: deg, degreesLabel: "؟" },
    ],
  };
}

/**
 * شكل 3-3 و 4-2 ص 191: توازي وتبادل حرف Z بزاوية 64° أو 50°
 */
export function buildParallelAlternateAnglesFigure(opts: PrepGrade1ParallelOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA1: CanonicalVertexNode = { id: `${opts.figureId}_vA1`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 1.5, y: 7 } };
  const vB1: CanonicalVertexNode = { id: `${opts.figureId}_vB1`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 6.0, y: 7 } };
  const vA2: CanonicalVertexNode = { id: `${opts.figureId}_vA2`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 4.0, y: 2.9 } };
  const vB2: CanonicalVertexNode = { id: `${opts.figureId}_vB2`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 8.5, y: 2.9 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sTop`, fromVertexId: vA1.id, toVertexId: vB1.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sTrans`, fromVertexId: vB1.id, toVertexId: vA2.id },
    { id: `${opts.figureId}_sBot`, fromVertexId: vA2.id, toVertexId: vB2.id, parallelArrows: 1 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "مستقيمان متوازيان وقاطع بحالة التبادل (حرف Z) بزاوية 64° لإيجاد الزاوية المتبادلة X = 64°",
    notationLanguage: notation,
    vertices: [vA1, vB1, vA2, vB2],
    segments,
    angles: [
      { id: `${opts.figureId}_angA`, vertexId: vB1.id, arm1VertexId: vA1.id, arm2VertexId: vA2.id, degrees: 64, degreesLabel: "64°" },
      { id: `${opts.figureId}_angC`, vertexId: vA2.id, arm1VertexId: vB1.id, arm2VertexId: vB2.id, degreesLabel: "X°" },
    ],
  };
}

/**
 * شكل 3-2 و 4-1 ص 191: توازي وتداخل حرف U زاويتان داخلتان متكاملتان 70° و 110°
 */
export function buildParallelConsecutiveInteriorAnglesFigure(opts: PrepGrade1ParallelOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 6.8, y: 7.2 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 1.5, y: 7.2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 5.2, y: 3 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 1.5, y: 3 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sTop`, fromVertexId: vB.id, toVertexId: vA.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sTrans`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sBot`, fromVertexId: vC.id, toVertexId: vD.id, parallelArrows: 1 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "مستقيمان متوازيان وقاطع بحالة التداخل (حرف U) بزاوية 70° لإيجاد الزاوية المتكاملة 110°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD],
    segments,
    angles: [
      { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vC.id, degrees: 70, degreesLabel: "70°" },
      { id: `${opts.figureId}_angC`, vertexId: vC.id, arm1VertexId: vA.id, arm2VertexId: vD.id, degrees: 110, degreesLabel: "؟" },
    ],
  };
}

/**
 * شكل 4-7 ص 192: توازي وتبادل جبري (3X+15)° = 75° لإيجاد X = 20°
 */
export function buildParallelAlgebraicAlternate3X15Figure(opts: PrepGrade1ParallelOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 5.2, y: 7.8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 8.5, y: 7.8 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 3.9, y: 3 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 8.5, y: 3 } };
  const vTTop: CanonicalVertexNode = { id: `${opts.figureId}_vTTop`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 5.5, y: 8.9 } };
  const vTBot: CanonicalVertexNode = { id: `${opts.figureId}_vTBot`, label: localizeGeometricVertexLabelSSOT("F", notation), position: { x: 3.5, y: 1.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sTop`, fromVertexId: vA.id, toVertexId: vB.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sBot`, fromVertexId: vD.id, toVertexId: vC.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sTrans`, fromVertexId: vTTop.id, toVertexId: vTBot.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "توازي وتبادل جبري (3X+15)° = 75° لحساب قيمة X = 20°",
    notationLanguage: notation,
    vertices: [vA, vB, vD, vC, vTTop, vTBot],
    segments,
    angles: [
      { id: `${opts.figureId}_angTop`, vertexId: vA.id, arm1VertexId: vTBot.id, arm2VertexId: vB.id, degreesLabel: "(3X+15)°" },
      { id: `${opts.figureId}_angBot`, vertexId: vD.id, arm1VertexId: vTTop.id, arm2VertexId: vC.id, degrees: 75, degreesLabel: "75°" },
    ],
  };
}

/**
 * شكل 4-8 ص 192: توازي وتناظر جبري (9X-5)° = (5X+15)° لإيجاد X = 5°
 */
export function buildParallelAlgebraicCorresponding9XFigure(opts: PrepGrade1ParallelOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA1: CanonicalVertexNode = { id: `${opts.figureId}_vA1`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 1.5, y: 6.8 } };
  const vB1: CanonicalVertexNode = { id: `${opts.figureId}_vB1`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 8.5, y: 6.8 } };
  const vA2: CanonicalVertexNode = { id: `${opts.figureId}_vA2`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 1.5, y: 3.2 } };
  const vB2: CanonicalVertexNode = { id: `${opts.figureId}_vB2`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 8.5, y: 3.2 } };
  const vTTop: CanonicalVertexNode = { id: `${opts.figureId}_vTTop`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 7.5, y: 8.8 } };
  const vTBot: CanonicalVertexNode = { id: `${opts.figureId}_vTBot`, label: localizeGeometricVertexLabelSSOT("F", notation), position: { x: 3.5, y: 1.5 } };
  const vG: CanonicalVertexNode = { id: `${opts.figureId}_vG`, label: localizeGeometricVertexLabelSSOT("G", notation), position: { x: 6.4, y: 6.8 } };
  const vH: CanonicalVertexNode = { id: `${opts.figureId}_vH`, label: localizeGeometricVertexLabelSSOT("H", notation), position: { x: 4.4, y: 3.2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sL1`, fromVertexId: vA1.id, toVertexId: vB1.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sL2`, fromVertexId: vA2.id, toVertexId: vB2.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sTrans`, fromVertexId: vTTop.id, toVertexId: vTBot.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "توازي وتناظر جبري (9X-5)° = (5X+15)° لحساب قيمة X = 5°",
    notationLanguage: notation,
    vertices: [vA1, vB1, vA2, vB2, vTTop, vTBot, vG, vH],
    segments,
    angles: [
      { id: `${opts.figureId}_angTop`, vertexId: vG.id, arm1VertexId: vTTop.id, arm2VertexId: vB1.id, degreesLabel: "(5X+15)°" },
      { id: `${opts.figureId}_angBot`, vertexId: vH.id, arm1VertexId: vTTop.id, arm2VertexId: vB2.id, degreesLabel: "(9X-5)°" },
    ],
  };
}

/**
 * مثال 1 ص 1: توازي وتبادل جبري AB // CD وقاطع EF يقطعهما في G و H
 * الزاويتان المتبادلتان داخلياً: m(∠AGH) = (9x - 5)° و m(∠GHD) = (5x + 15)°
 */
export function buildParallelTransversalAlternateGHFigure(
  opts: PrepGrade1ParallelOptions & {
    readonly angTopLabel?: string;
    readonly angBotLabel?: string;
  }
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 1.5, y: 7.2 } };
  const vG: CanonicalVertexNode = { id: `${opts.figureId}_vG`, label: localizeGeometricVertexLabelSSOT("G", notation), position: { x: 5.5, y: 7.2 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 9.0, y: 7.2 } };

  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 1.5, y: 2.8 } };
  const vH: CanonicalVertexNode = { id: `${opts.figureId}_vH`, label: localizeGeometricVertexLabelSSOT("H", notation), position: { x: 4.5, y: 2.8 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 9.0, y: 2.8 } };

  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 6.0, y: 8.8 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: localizeGeometricVertexLabelSSOT("F", notation), position: { x: 4.0, y: 1.2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sL1`, fromVertexId: vA.id, toVertexId: vB.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sL2`, fromVertexId: vC.id, toVertexId: vD.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sTrans`, fromVertexId: vE.id, toVertexId: vF.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "مستقيمان متوازيان AB // CD وقاطع EF في G و H مع زاويتين متبادلتين داخلياً (حرف Z)",
    notationLanguage: notation,
    vertices: [vA, vG, vB, vC, vH, vD, vE, vF],
    segments,
    angles: [
      { id: `${opts.figureId}_angAGH`, vertexId: vG.id, arm1VertexId: vA.id, arm2VertexId: vH.id, degreesLabel: opts.angTopLabel || "(9x - 5)°" },
      { id: `${opts.figureId}_angGHD`, vertexId: vH.id, arm1VertexId: vG.id, arm2VertexId: vD.id, degreesLabel: opts.angBotLabel || "(5x + 15)°" },
    ],
  };
}

/**
 * مثال 2 ص 2: توازي وتداخل حرف U: مستقيمان BA // CD وقاطع BC
 * الزاوية الداخلة m(∠C) = 60° لحساب الزاوية الداخلة m(∠B)
 */
export function buildParallelConsecutiveInteriorBCFigure(
  opts: PrepGrade1ParallelOptions & {
    readonly degC?: number;
    readonly angBLabel?: string;
  }
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 9.0, y: 7.2 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 5.54, y: 7.2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 3.0, y: 2.8 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 9.0, y: 2.8 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sTop`, fromVertexId: vB.id, toVertexId: vA.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sTrans`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sBot`, fromVertexId: vC.id, toVertexId: vD.id, parallelArrows: 1 },
  ];

  const cDeg = opts.degC ?? 60;
  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "مستقيمان متوازيان BA // CD وقاطع BC بحالة تداخل زاويتان داخلتان (حرف U)",
    notationLanguage: notation,
    vertices: [vB, vA, vC, vD],
    segments,
    angles: [
      { id: `${opts.figureId}_angC`, vertexId: vC.id, arm1VertexId: vB.id, arm2VertexId: vD.id, degrees: cDeg, degreesLabel: `${cDeg}°` },
      { id: `${opts.figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degreesLabel: opts.angBLabel || "؟" },
    ],
  };
}
