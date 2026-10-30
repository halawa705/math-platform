/**
 * @file prep-grade2-isosceles-axis-deltoid-proofs-builder.ts
 * @description منشئ أشكال محاور تماثل الدلتون والقاعدة المشتركة والمضلع الخماسي المتماثل (2ع).
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

export interface PrepGrade2IsoscelesDeltoidOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 10 ص 257: شكل دلتون XAYB بأضلاع 15 و 13 سم ومحور تماثل بأجزاء 10 سم و (5+n) لإيجاد n = 5
 */
export function buildDeltoidAxisOfSymmetryAlgebraicFigure(
  opts: PrepGrade2IsoscelesDeltoidOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vX: CanonicalVertexNode = { id: `${opts.figureId}_vX`, label: notation === "english" ? "X" : "س", position: { x: 5, y: 8.5 } };
  const vY: CanonicalVertexNode = { id: `${opts.figureId}_vY`, label: notation === "english" ? "Y" : "ص", position: { x: 5, y: 1 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 1.5, y: 4.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 8.5, y: 4.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 5, y: 4.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sXA`, fromVertexId: vX.id, toVertexId: vA.id, lengthLabel: { value: 15, unit: "سم" }, tickMarks: 1 },
    { id: `${opts.figureId}_sXB`, fromVertexId: vX.id, toVertexId: vB.id, lengthLabel: { value: 15, unit: "سم" }, tickMarks: 1 },
    { id: `${opts.figureId}_sAY`, fromVertexId: vA.id, toVertexId: vY.id, lengthLabel: { value: 13, unit: "سم" }, tickMarks: 2 },
    { id: `${opts.figureId}_sBY`, fromVertexId: vB.id, toVertexId: vY.id, lengthLabel: { value: 13, unit: "سم" }, tickMarks: 2 },
    // القطران المتعامدان
    { id: `${opts.figureId}_sXY`, fromVertexId: vX.id, toVertexId: vY.id },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, lengthLabel: { value: 10, unit: "سم" } },
    { id: `${opts.figureId}_sCB`, fromVertexId: vC.id, toVertexId: vB.id, lengthLabel: { value: "5 + n" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_hourglass_butterfly_similarity",
    titleArabic: "شكل دلتون XAYB بأضلاع 15 و 13 سم ومحور تماثل بأجزاء 10 و (5+n) لإيجاد n = 5",
    notationLanguage: notation,
    vertices: [vX, vA, vC, vB, vY],
    segments,
    angles: [
      { id: `${opts.figureId}_angXCA`, vertexId: vC.id, arm1VertexId: vX.id, arm2VertexId: vA.id, isRightAngle: true },
    ],
  };
}

/**
 * مسألة 13 ص 257: مثلثان متساويا الساقين ABC و DBC بقاعدة مشتركة لإثبات أن AD محور تماثل BC
 */
export function buildSharedBaseIsoscelesAxisProofFigure(
  opts: PrepGrade2IsoscelesDeltoidOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 8.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1.5, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 8.5, y: 2 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 5, y: 4.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 1 },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, tickMarks: 1 },
    { id: `${opts.figureId}_sDB`, fromVertexId: vD.id, toVertexId: vB.id, tickMarks: 2 },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id, tickMarks: 2 },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_isosceles_equilateral",
    titleArabic: "مثلثان متساويا الساقين ABC و DBC بقاعدة مشتركة لإثبات أن AD محور تماثل BC",
    notationLanguage: notation,
    vertices: [vA, vD, vB, vC],
    segments,
    angles: [],
  };
}

/**
 * مسألة 16 ص 258: خماسي ABCDE فيه AB = BC و AE = CD و F منتصف ED لإثبات تعامد BF ⊥ DE
 */
export function buildPentagonPerpendicularAxisProofFigure(
  opts: PrepGrade2IsoscelesDeltoidOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 8, y: 4 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 6, y: 7.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 6, y: 1 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 2, y: 7.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 2, y: 1 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: notation === "english" ? "F" : "و", position: { x: 2, y: 4.25 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sBA`, fromVertexId: vB.id, toVertexId: vA.id, tickMarks: 1 },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, tickMarks: 1 },
    { id: `${opts.figureId}_sAE`, fromVertexId: vA.id, toVertexId: vE.id, tickMarks: 2 },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, tickMarks: 2 },
    { id: `${opts.figureId}_sED`, fromVertexId: vE.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sBF`, fromVertexId: vB.id, toVertexId: vF.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_hourglass_butterfly_similarity",
    titleArabic: "خماسي متماثل ABCDE بضلعين متساويين ومنتصف F لإثبات تعامد BF ⊥ DE",
    notationLanguage: notation,
    vertices: [vB, vA, vE, vF, vD, vC],
    segments,
    angles: [],
  };
}
