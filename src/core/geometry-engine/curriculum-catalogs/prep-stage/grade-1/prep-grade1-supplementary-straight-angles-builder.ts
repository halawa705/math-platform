/**
 * @file prep-grade1-supplementary-straight-angles-builder.ts
 * @description منشئ أشكال الزوايا المتكاملة والزوايا المتجاورة على خط مستقيم (مجموعها 180°) (1ع).
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

export interface PrepGrade1SupplementaryOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 7-1 ص 163: زاويتان متكاملتان على خط مستقيم A ∈ BC بإحدى الزاويتين 35° لإيجاد X = 145°
 */
export function buildSupplementaryTwoAngles35Figure(
  opts: PrepGrade1SupplementaryOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 2 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 9, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 1, y: 2 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 8, y: 6 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sCB`, fromVertexId: vC.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_exterior_angle_extension",
    titleArabic: "زاويتان متكاملتان على خط مستقيم بزاوية 35° لحساب الزاوية المكملة X = 145°",
    notationLanguage: notation,
    vertices: [vC, vA, vB, vD],
    segments,
    angles: [
      { id: `${opts.figureId}_angDAB`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vD.id, degrees: 35, degreesLabel: "35°" },
      { id: `${opts.figureId}_angDAC`, vertexId: vA.id, arm1VertexId: vD.id, arm2VertexId: vC.id, degreesLabel: "X°" },
    ],
  };
}

/**
 * مسألة 12-1 ص 164: التحقق من استقامة الشعاعين OA و OB بزاويتين 144° و 36° (مجموعهما 180°)
 */
export function buildCollinearRaysTest144Figure(
  opts: PrepGrade1SupplementaryOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vO: CanonicalVertexNode = { id: `${opts.figureId}_vO`, label: localizeGeometricVertexLabelSSOT("و", notation), position: { x: 5, y: 2 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 9, y: 2 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 8, y: 6 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sOB`, fromVertexId: vO.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sOA`, fromVertexId: vO.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sOC`, fromVertexId: vO.id, toVertexId: vC.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_exterior_angle_extension",
    titleArabic: "استقامة الشعاعين OA و OB بزاويتين 144° و 36° على خط مستقيم",
    notationLanguage: notation,
    vertices: [vB, vO, vA, vC],
    segments,
    angles: [
      { id: `${opts.figureId}_angAOC`, vertexId: vO.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degrees: 36, degreesLabel: "36°" },
      { id: `${opts.figureId}_angCOB`, vertexId: vO.id, arm1VertexId: vC.id, arm2VertexId: vB.id, degrees: 144, degreesLabel: "144°" },
    ],
  };
}

/**
 * مسألة 8 ص 165: زاويتان متكاملتان جبرياً (5X+2)° و (4X-2)° على خط مستقيم لحساب X = 20°
 */
export function buildSupplementaryAlgebraic5X4XFigure(
  opts: PrepGrade1SupplementaryOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 5, y: 2 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 1, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 9, y: 2 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 6.5, y: 7.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sBD`, fromVertexId: vB.id, toVertexId: vD.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_exterior_angle_extension",
    titleArabic: "زاويتان متكاملتان جبرياً (5X+2)° و (4X-2)° على خط مستقيم لإيجاد X = 20°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD],
    segments,
    angles: [
      { id: `${opts.figureId}_angABD`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vD.id, degreesLabel: "(5X+2)°" },
      { id: `${opts.figureId}_angDBC`, vertexId: vB.id, arm1VertexId: vD.id, arm2VertexId: vC.id, degreesLabel: "(4X-2)°" },
    ],
  };
}

/**
 * مسألة 11 ص 165: ثلاث زوايا متجاورة على خط مستقيم 5X° و 3X° و 2X° لحساب X = 18°
 */
export function buildThreeAnglesOnStraightLineFigure(
  opts: PrepGrade1SupplementaryOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 1, y: 2 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 9, y: 2 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 5, y: 8 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 7.5, y: 6.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sCB`, fromVertexId: vC.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sAE`, fromVertexId: vA.id, toVertexId: vE.id },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_exterior_angle_extension",
    titleArabic: "ثلاث زوايا متجاورة على خط مستقيم 5X° و 3X° و 2X° لإيجاد X = 18°",
    notationLanguage: notation,
    vertices: [vC, vA, vB, vE, vD],
    segments,
    angles: [
      { id: `${opts.figureId}_angCAE`, vertexId: vA.id, arm1VertexId: vC.id, arm2VertexId: vE.id, degreesLabel: "5X°" },
      { id: `${opts.figureId}_angEAD`, vertexId: vA.id, arm1VertexId: vE.id, arm2VertexId: vD.id, degreesLabel: "3X°" },
      { id: `${opts.figureId}_angDAB`, vertexId: vA.id, arm1VertexId: vD.id, arm2VertexId: vB.id, degreesLabel: "2X°" },
    ],
  };
}
