/**
 * @file prep-grade1-parallel-proof-conditions-builder.ts
 * @description منشئ أشكال براهين وشروط إثبات التوازي وحساب المجاهيل المتعددة X و y (1ع).
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

export interface PrepGrade1ParallelProofOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 11 ص 194: AB // EF مع D = 100° و E = 115° و DAE = 35° لإثبات أن AB // DC
 */
export function buildParallelProofTransversalZFigure(opts: PrepGrade1ParallelProofOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 4.8, y: 2.2 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 8.8, y: 2.2 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 5.2, y: 7.8 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 8.8, y: 7.8 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 3.16, y: 4.95 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: localizeGeometricVertexLabelSSOT("F", notation), position: { x: 1.2, y: 4.95 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sAE`, fromVertexId: vA.id, toVertexId: vE.id },
    { id: `${opts.figureId}_sEF`, fromVertexId: vE.id, toVertexId: vF.id, parallelArrows: 1 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "AB // EF مع D = 100° و E = 115° و DAE = 35° لإثبات أن AB // DC بالتبادل",
    notationLanguage: notation,
    vertices: [vA, vB, vD, vC, vE, vF],
    segments,
    angles: [
      { id: `${opts.figureId}_angD`, vertexId: vD.id, arm1VertexId: vC.id, arm2VertexId: vA.id, degrees: 100, degreesLabel: "100°" },
      { id: `${opts.figureId}_angE`, vertexId: vE.id, arm1VertexId: vF.id, arm2VertexId: vA.id, degrees: 115, degreesLabel: "115°" },
      { id: `${opts.figureId}_angDAE`, vertexId: vA.id, arm1VertexId: vD.id, arm2VertexId: vE.id, degrees: 35, degreesLabel: "35°" },
    ],
  };
}

/**
 * مسألة 7-1 ص 193: إثبات AB // CD لأن مجموع الزاويتين الداخلتين 100° + 80° = 180°
 */
export function buildParallelProofConsecutiveInteriorFigure(opts: PrepGrade1ParallelProofOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 8.5, y: 7.2 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 1.5, y: 7.2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 8.5, y: 3.2 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 1.5, y: 3.2 } };
  const vP1: CanonicalVertexNode = { id: `${opts.figureId}_vP1`, label: "", position: { x: 5.5, y: 7.2 } };
  const vP2: CanonicalVertexNode = { id: `${opts.figureId}_vP2`, label: "", position: { x: 6.21, y: 3.2 } };
  const vM: CanonicalVertexNode = { id: `${opts.figureId}_vM`, label: localizeGeometricVertexLabelSSOT("M", notation), position: { x: 5.32, y: 8.2 } };
  const vN: CanonicalVertexNode = { id: `${opts.figureId}_vN`, label: localizeGeometricVertexLabelSSOT("N", notation), position: { x: 6.39, y: 2.2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vB.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vD.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sMN`, fromVertexId: vM.id, toVertexId: vN.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "إثبات AB // CD بزاويتين داخلتين وفي جهة واحدة من القاطع مجموعهما 100° + 80° = 180°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vP1, vP2, vM, vN],
    segments,
    angles: [
      { id: `${opts.figureId}_angTop`, vertexId: vP1.id, arm1VertexId: vP2.id, arm2VertexId: vB.id, degrees: 100, degreesLabel: "100°" },
      { id: `${opts.figureId}_angBot`, vertexId: vP2.id, arm1VertexId: vP1.id, arm2VertexId: vD.id, degrees: 80, degreesLabel: "80°" },
    ],
  };
}

/**
 * مسألة 9 ص 193: BA // CD مع B = 80° و C = 2y° و D = X° لحساب y = 50° و X = 80°
 */
export function buildParallelTwoVariablesXYFigure(opts: PrepGrade1ParallelProofOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 1.5, y: 7.8 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 7.5, y: 7.8 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 2.2, y: 3.2 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 8, y: 3.2 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 2.8, y: 1.2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sBA`, fromVertexId: vB.id, toVertexId: vA.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sCE`, fromVertexId: vC.id, toVertexId: vE.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "BA // CD مع B = 80° و C = 2y° و D = X° لحساب قيمة y = 50° و X = 80°",
    notationLanguage: notation,
    vertices: [vB, vA, vC, vD, vE],
    segments,
    angles: [
      { id: `${opts.figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degrees: 80, degreesLabel: "80°" },
      { id: `${opts.figureId}_ang2y`, vertexId: vC.id, arm1VertexId: vB.id, arm2VertexId: vD.id, degreesLabel: "2y°" },
      { id: `${opts.figureId}_angX`, vertexId: vC.id, arm1VertexId: vD.id, arm2VertexId: vE.id, degreesLabel: "X°" },
    ],
  };
}

/**
 * مسألة 6-1 ص 193: اختبار هل p // q أم لا مع الزاويتين 57° و 122° (غير متوازيين لأن 57 + 122 ≠ 180)
 */
export function buildParallelNonParallelCheckFigure(opts: PrepGrade1ParallelProofOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vP1: CanonicalVertexNode = { id: `${opts.figureId}_vP1`, label: localizeGeometricVertexLabelSSOT("P1", notation), position: { x: 1.5, y: 6.8 } };
  const vP2: CanonicalVertexNode = { id: `${opts.figureId}_vP2`, label: localizeGeometricVertexLabelSSOT("P2", notation), position: { x: 8.5, y: 6.8 } };
  const vQ1: CanonicalVertexNode = { id: `${opts.figureId}_vQ1`, label: localizeGeometricVertexLabelSSOT("Q1", notation), position: { x: 1.5, y: 3.2 } };
  const vQ2: CanonicalVertexNode = { id: `${opts.figureId}_vQ2`, label: localizeGeometricVertexLabelSSOT("Q2", notation), position: { x: 8.5, y: 3.2 } };
  const vI1: CanonicalVertexNode = { id: `${opts.figureId}_vI1`, label: "", position: { x: 6.0, y: 6.8 } };
  const vI2: CanonicalVertexNode = { id: `${opts.figureId}_vI2`, label: "", position: { x: 3.75, y: 3.2 } };
  const vNTop: CanonicalVertexNode = { id: `${opts.figureId}_vNTop`, label: localizeGeometricVertexLabelSSOT("N1", notation), position: { x: 6.6, y: 7.76 } };
  const vNBot: CanonicalVertexNode = { id: `${opts.figureId}_vNBot`, label: localizeGeometricVertexLabelSSOT("N2", notation), position: { x: 3.15, y: 2.24 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sLineP`, fromVertexId: vP1.id, toVertexId: vP2.id },
    { id: `${opts.figureId}_sLineQ`, fromVertexId: vQ1.id, toVertexId: vQ2.id },
    { id: `${opts.figureId}_sTransN`, fromVertexId: vNTop.id, toVertexId: vNBot.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "اختبار هل p // q مع زاويتين 57° و 122° (غير متوازيين لأن مجموعهما 179° ≠ 180°)",
    notationLanguage: notation,
    vertices: [vP1, vP2, vQ1, vQ2, vI1, vI2, vNTop, vNBot],
    segments,
    angles: [
      { id: `${opts.figureId}_ang57`, vertexId: vI1.id, arm1VertexId: vI2.id, arm2VertexId: vP1.id, degrees: 57, degreesLabel: "57°" },
      { id: `${opts.figureId}_ang122`, vertexId: vI2.id, arm1VertexId: vI1.id, arm2VertexId: vQ1.id, degrees: 122, degreesLabel: "122°" },
    ],
  };
}

/**
 * مثال 5 ص 3: CA // BE مع C = 125° و B = 55° و A = 55° لإثبات أن AB // CD
 */
export function buildParallelProofAlternate55And125Figure(
  opts: PrepGrade1ParallelProofOptions & {
    readonly degC?: number;
    readonly degB?: number;
    readonly degA?: number;
  }
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 3.5, y: 6.0 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 1.49, y: 8.87 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 6.55, y: 6.0 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 4.1, y: 2.5 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 8.8, y: 2.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sCA`, fromVertexId: vC.id, toVertexId: vA.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBE`, fromVertexId: vB.id, toVertexId: vE.id, parallelArrows: 1 },
  ];

  const cDeg = opts.degC ?? 125;
  const bDeg = opts.degB ?? 55;
  const aDeg = opts.degA ?? 55;
  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "CA // BE مع C = 125° و B = 55° و A = 55° لإثبات أن AB // CD",
    notationLanguage: notation,
    vertices: [vC, vD, vA, vB, vE],
    segments,
    angles: [
      { id: `${opts.figureId}_angC`, vertexId: vC.id, arm1VertexId: vD.id, arm2VertexId: vA.id, degrees: cDeg, degreesLabel: `${cDeg}°` },
      { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vC.id, arm2VertexId: vB.id, degrees: aDeg, degreesLabel: `${aDeg}°` },
      { id: `${opts.figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vE.id, degrees: bDeg, degreesLabel: `${bDeg}°` },
    ],
  };
}

/**
 * مثال 6 ص 4: قاطع EC يقطع AB و CD في B و C مع EBA = 110° و BCD = 110° بالتناظر لإثبات AB // CD
 */
export function buildParallelProofCorresponding110Figure(
  opts: PrepGrade1ParallelProofOptions & {
    readonly degEBA?: number;
    readonly degBCD?: number;
  }
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 5.91, y: 9.0 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 5.0, y: 6.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 3.54, y: 2.5 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: "", position: { x: 2.63, y: 0.0 } };

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 1.5, y: 6.5 } };
  const vB2: CanonicalVertexNode = { id: `${opts.figureId}_vB2`, label: "", position: { x: 8.8, y: 6.5 } };

  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 0.5, y: 2.5 } };
  const vD2: CanonicalVertexNode = { id: `${opts.figureId}_vD2`, label: "", position: { x: 7.8, y: 2.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB2.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vD.id, toVertexId: vD2.id },
    { id: `${opts.figureId}_sTrans`, fromVertexId: vE.id, toVertexId: vF.id },
  ];

  const ebaDeg = opts.degEBA ?? 110;
  const bcdDeg = opts.degBCD ?? 110;
  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "قاطع EC يقطع AB و CD في B و C مع EBA = 110° و BCD = 110° لإثبات أن AB // CD",
    notationLanguage: notation,
    vertices: [vE, vB, vC, vF, vA, vB2, vD, vD2],
    segments,
    angles: [
      { id: `${opts.figureId}_angEBA`, vertexId: vB.id, arm1VertexId: vE.id, arm2VertexId: vA.id, degrees: ebaDeg, degreesLabel: `${ebaDeg}°` },
      { id: `${opts.figureId}_angBCD`, vertexId: vC.id, arm1VertexId: vB.id, arm2VertexId: vD.id, degrees: bcdDeg, degreesLabel: `${bcdDeg}°` },
    ],
  };
}
