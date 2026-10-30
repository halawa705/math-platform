/**
 * @file prep-grade1-complementary-right-angles-builder.ts
 * @description منشئ أشكال الزوايا المتتامة والمتعامدة (مجموعها 90°) للصف الأول الإعدادي.
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

export interface PrepGrade1ComplementaryOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 6-1 ص 163: زاويتان متتامتان AC ⊥ AB بإحدى الزاويتين 25° لإيجاد X = 65°
 */
export function buildComplementaryTwoAngles25Figure(
  opts: PrepGrade1ComplementaryOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 2, y: 2 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 8, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 2, y: 8 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 7.5, y: 4.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_right_pythagoras",
    titleArabic: "زاويتان متتامتان AC ⊥ AB بزاوية 25° لحساب الزاوية المتممة X = 65°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD],
    segments,
    angles: [
      { id: `${opts.figureId}_angBAC`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vC.id, isRightAngle: true },
      { id: `${opts.figureId}_angBAD`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vD.id, degrees: 25, degreesLabel: "25°" },
      { id: `${opts.figureId}_angDAC`, vertexId: vA.id, arm1VertexId: vD.id, arm2VertexId: vC.id, degreesLabel: "X°" },
    ],
  };
}

/**
 * مسألة 6-2 ص 163: زاوية قائمة AC ⊥ AB مقسمة إلى 3 زوايا متساوية لحساب ∠EAD = 30°
 */
export function buildRightAngleTrisectedFigure(
  opts: PrepGrade1ComplementaryOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 2, y: 2 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 8, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 2, y: 8 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 7.2, y: 5 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 5, y: 7.2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sAE`, fromVertexId: vA.id, toVertexId: vE.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_right_pythagoras",
    titleArabic: "زاوية قائمة مقسمة إلى ثلاث زوايا متطابقة لحساب قياس EAD = 30°",
    notationLanguage: notation,
    vertices: [vA, vB, vD, vE, vC],
    segments,
    angles: [
      { id: `${opts.figureId}_angBAC`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vC.id, isRightAngle: true },
      { id: `${opts.figureId}_angBAD`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vD.id, degrees: 30, degreesLabel: "30°" },
      { id: `${opts.figureId}_angDAE`, vertexId: vA.id, arm1VertexId: vD.id, arm2VertexId: vE.id, degrees: 30, degreesLabel: "30°" },
      { id: `${opts.figureId}_angEAC`, vertexId: vA.id, arm1VertexId: vE.id, arm2VertexId: vC.id, degrees: 30, degreesLabel: "30°" },
    ],
  };
}

/**
 * مسألة 7 ص 165: زاويتان متتامتان جبرياً (2X+2)° و (X+1)° لحساب قيمة X = 29°
 */
export function buildComplementaryAlgebraic2XFigure(
  opts: PrepGrade1ComplementaryOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 2, y: 2 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 8, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 2, y: 8 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 6.5, y: 6.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_right_pythagoras",
    titleArabic: "زاويتان متتامتان جبرياً (2X+2)° و (X+1)° لحساب قيمة X = 29°",
    notationLanguage: notation,
    vertices: [vA, vB, vD, vC],
    segments,
    angles: [
      { id: `${opts.figureId}_angBAC`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vC.id, isRightAngle: true },
      { id: `${opts.figureId}_angBAD`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vD.id, degreesLabel: "(X+1)°" },
      { id: `${opts.figureId}_angDAC`, vertexId: vA.id, arm1VertexId: vD.id, arm2VertexId: vC.id, degreesLabel: "(2X+2)°" },
    ],
  };
}

/**
 * مسألة 14 ص 165: ذراع بوابة العبور يتحرك 42° من الوضع الرأسي ليصبح أفقياً بزاوية (3X+3)° = 48° => X = 15
 */
export function buildCrossingBarrierGateFigure(
  opts: PrepGrade1ComplementaryOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vO: CanonicalVertexNode = { id: `${opts.figureId}_vO`, label: localizeGeometricVertexLabelSSOT("و", notation), position: { x: 2, y: 2 } };
  const vH: CanonicalVertexNode = { id: `${opts.figureId}_vH`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 8, y: 2 } };
  const vV: CanonicalVertexNode = { id: `${opts.figureId}_vV`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 2, y: 8 } };
  const vArm: CanonicalVertexNode = { id: `${opts.figureId}_vArm`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 6, y: 6.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sOH`, fromVertexId: vO.id, toVertexId: vH.id },
    { id: `${opts.figureId}_sOV`, fromVertexId: vO.id, toVertexId: vV.id },
    { id: `${opts.figureId}_sArm`, fromVertexId: vO.id, toVertexId: vArm.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_right_pythagoras",
    titleArabic: "ذراع بوابة العبور بزاوية 42° مع الرأسي و (3X+3)° مع الأفقي لحساب X = 15",
    notationLanguage: notation,
    vertices: [vO, vH, vArm, vV],
    segments,
    angles: [
      { id: `${opts.figureId}_angTotal`, vertexId: vO.id, arm1VertexId: vH.id, arm2VertexId: vV.id, isRightAngle: true },
      { id: `${opts.figureId}_angArmV`, vertexId: vO.id, arm1VertexId: vArm.id, arm2VertexId: vV.id, degrees: 42, degreesLabel: "42°" },
      { id: `${opts.figureId}_angArmH`, vertexId: vO.id, arm1VertexId: vH.id, arm2VertexId: vArm.id, degreesLabel: "(3X+3)°" },
    ],
  };
}
