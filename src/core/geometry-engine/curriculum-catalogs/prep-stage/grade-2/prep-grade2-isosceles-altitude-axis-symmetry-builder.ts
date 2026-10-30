/**
 * @file prep-grade2-isosceles-altitude-axis-symmetry-builder.ts
 * @description منشئ أشكال نتائج المثلث المتساوي الساقين ومحور التماثل وخواص الارتفاع (2ع).
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

export interface PrepGrade2IsoscelesAltitudeOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 4 ص 256: مثلث ABC قائم في C ومتساوي الساقين، عمود CD ⊥ AB مع AD = 20 سم لحساب AB = 40 سم و ∠DCB = 45°
 */
export function buildRightIsoscelesAltitudeToHypotenuseFigure(
  opts: PrepGrade2IsoscelesAltitudeOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 5, y: 7.5 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 1, y: 2 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 9, y: 2 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 5, y: 2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sCA`, fromVertexId: vC.id, toVertexId: vA.id, tickMarks: 1 },
    { id: `${opts.figureId}_sCB`, fromVertexId: vC.id, toVertexId: vB.id, tickMarks: 1 },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, lengthLabel: { value: 20, unit: "سم" } },
    { id: `${opts.figureId}_sDB`, fromVertexId: vD.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_isosceles_equilateral",
    titleArabic: "مثلث قائم في C ومتساوي الساقين بارتفاع CD ⊥ AB مع AD = 20 سم لحساب AB = 40 سم وزاوية DCB = 45°",
    notationLanguage: notation,
    vertices: [vA, vD, vB, vC],
    segments,
    angles: [
      { id: `${opts.figureId}_angC`, vertexId: vC.id, arm1VertexId: vA.id, arm2VertexId: vB.id, isRightAngle: true },
      { id: `${opts.figureId}_angCDA`, vertexId: vD.id, arm1VertexId: vC.id, arm2VertexId: vA.id, isRightAngle: true },
    ],
  };
}

/**
 * مسألة 6 ص 256: متساوي الساقين AB = AC = 15 سم مع BC = 18 سم وارتفاع AD لحساب BD = 9 و AD = 12 سم
 */
export function buildIsoscelesAltitudePythagoras12Figure(
  opts: PrepGrade2IsoscelesAltitudeOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1.5, y: 1.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 8.5, y: 1.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 5, y: 1.5 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 5, y: 4.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: 15, unit: "سم" }, tickMarks: 1 },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, lengthLabel: { value: 15, unit: "سم" }, tickMarks: 1 },
    { id: `${opts.figureId}_sBD`, fromVertexId: vB.id, toVertexId: vD.id, lengthLabel: { value: 9, unit: "سم" } },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, lengthLabel: { value: 12, unit: "سم" } },
    { id: `${opts.figureId}_sEB`, fromVertexId: vE.id, toVertexId: vB.id, tickMarks: 2 },
    { id: `${opts.figureId}_sEC`, fromVertexId: vE.id, toVertexId: vC.id, tickMarks: 2 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_isosceles_equilateral",
    titleArabic: "مثلث متساوي الساقين AB = AC = 15 سم وقاعدة 18 سم وارتفاع AD = 12 سم",
    notationLanguage: notation,
    vertices: [vA, vE, vB, vD, vC],
    segments,
    angles: [
      { id: `${opts.figureId}_angADB`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vB.id, isRightAngle: true },
    ],
  };
}

/**
 * مسألة 17 ص 258: برج اتصالات متساوي الساقين بسلكين متساويين وزاوية 50° و y° وقاعدة 19 م و (2X-3) م
 */
export function buildTowerSymmetricCablesFigure(
  opts: PrepGrade2IsoscelesAltitudeOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vTop: CanonicalVertexNode = { id: `${opts.figureId}_vTop`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1.5, y: 1.5 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 8.5, y: 1.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 5, y: 1.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sLeftCable`, fromVertexId: vTop.id, toVertexId: vB.id, tickMarks: 1 },
    { id: `${opts.figureId}_sRightCable`, fromVertexId: vTop.id, toVertexId: vA.id, tickMarks: 1 },
    { id: `${opts.figureId}_sBD`, fromVertexId: vB.id, toVertexId: vD.id, lengthLabel: { value: 19, unit: "م" } },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id, lengthLabel: { value: "2X - 3", unit: "م" } },
    { id: `${opts.figureId}_sTowerMast`, fromVertexId: vTop.id, toVertexId: vD.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_isosceles_equilateral",
    titleArabic: "برج اتصالات متماثل بسلكين متساويين وقاعدة 19 م و (2X-3) م لحساب X = 11 وزاوية y = 50°",
    notationLanguage: notation,
    vertices: [vTop, vB, vD, vA],
    segments,
    angles: [
      { id: `${opts.figureId}_angMast`, vertexId: vD.id, arm1VertexId: vTop.id, arm2VertexId: vA.id, isRightAngle: true },
    ],
  };
}

/**
 * مسألة 15 ص 258: شبه منحرف / فراشة ABCD بتوازي AD // BC و MB = MC لإثبات محور تماثل مشترك
 */
export function buildTrapezoidButterflyCommonAxisFigure(
  opts: PrepGrade2IsoscelesAltitudeOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 2.5, y: 7.5 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 7.5, y: 7.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 1, y: 1.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 9, y: 1.5 } };
  const vM: CanonicalVertexNode = { id: `${opts.figureId}_vM`, label: notation === "english" ? "M" : "م", position: { x: 5, y: 4.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sCB`, fromVertexId: vC.id, toVertexId: vB.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sDB`, fromVertexId: vD.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sMC`, fromVertexId: vM.id, toVertexId: vC.id, tickMarks: 1 },
    { id: `${opts.figureId}_sMB`, fromVertexId: vM.id, toVertexId: vB.id, tickMarks: 1 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_trapezoid_with_altitudes",
    titleArabic: "شبه منحرف ABCD بتوازي AD // BC و MB = MC لإثبات أن AMD متساوي الساقين بمحور تماثل مشترك",
    notationLanguage: notation,
    vertices: [vD, vA, vM, vC, vB],
    segments,
    angles: [],
  };
}
