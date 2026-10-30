/**
 * @file prep-grade1-vertically-opposite-followup-builder.ts
 * @description منشئ أشكال التقابل بالرأس المتقدمة وتطبيقاتها مثل مقص الورق والمنصفات الجبرية (1ع).
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

export interface PrepGrade1VertOppFollowupOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 8 ص 176 (تفكير ناقد - المقص): الزاوية بين ذراعي المقص (3X-18)° و (2X+12)° وتقليلها بمقدار (X+16)° لحساب y = 26°
 */
export function buildScissorsAngleProblemFigure(opts: PrepGrade1VertOppFollowupOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vCenter: CanonicalVertexNode = { id: `${opts.figureId}_vPivot`, label: localizeGeometricVertexLabelSSOT("م", notation), position: { x: 5, y: 5 } };
  const vBladeL1: CanonicalVertexNode = { id: `${opts.figureId}_vBL1`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 1.5, y: 7.2 } };
  const vBladeL2: CanonicalVertexNode = { id: `${opts.figureId}_vBL2`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1.5, y: 2.8 } };
  const vHandleR1: CanonicalVertexNode = { id: `${opts.figureId}_vHR1`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 8.5, y: 2.8 } };
  const vHandleR2: CanonicalVertexNode = { id: `${opts.figureId}_vHR2`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 8.5, y: 7.2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sArm1`, fromVertexId: vBladeL1.id, toVertexId: vHandleR1.id },
    { id: `${opts.figureId}_sArm2`, fromVertexId: vBladeL2.id, toVertexId: vHandleR2.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_hourglass_butterfly_similarity",
    titleArabic: "الزاوية بين ذراعي المقص (3X-18)° و (2X+12)° وتقليلها بمقدار (X+16)° لإيجاد y = 26°",
    notationLanguage: notation,
    vertices: [vCenter, vBladeL1, vBladeL2, vHandleR1, vHandleR2],
    segments,
    angles: [
      { id: `${opts.figureId}_angL`, vertexId: vCenter.id, arm1VertexId: vBladeL1.id, arm2VertexId: vBladeL2.id, degreesLabel: "(2X+12)°" },
      { id: `${opts.figureId}_angR`, vertexId: vCenter.id, arm1VertexId: vHandleR2.id, arm2VertexId: vHandleR1.id, degreesLabel: "(3X-18)°" },
    ],
  };
}

/**
 * مسألة 3 ص 175: AC ∩ BD = {M} مع CMD = 140° والشعاع MX ينصف AMB لحساب DMX = 110°
 */
export function buildBisectedVerticalOppositeCMDFigure(opts: PrepGrade1VertOppFollowupOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vM: CanonicalVertexNode = { id: `${opts.figureId}_vM`, label: localizeGeometricVertexLabelSSOT("M", notation), position: { x: 5, y: 5 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 8.5, y: 6.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 1.5, y: 3.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 2, y: 7 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 8, y: 3 } };
  const vX: CanonicalVertexNode = { id: `${opts.figureId}_vX`, label: localizeGeometricVertexLabelSSOT("X", notation), position: { x: 5, y: 8.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAC`, fromVertexId: vC.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sBD`, fromVertexId: vB.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sMX`, fromVertexId: vM.id, toVertexId: vX.id, strokeStyle: "solid" },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_hourglass_butterfly_similarity",
    titleArabic: "مستقيمان متقاطعان AC و BD مع CMD = 140° ومنصف MX للزاوية AMB لحساب DMX = 110°",
    notationLanguage: notation,
    vertices: [vM, vA, vC, vB, vD, vX],
    segments,
    angles: [
      { id: `${opts.figureId}_angCMD`, vertexId: vM.id, arm1VertexId: vC.id, arm2VertexId: vD.id, degrees: 140, degreesLabel: "140°" },
      { id: `${opts.figureId}_angBMX`, vertexId: vM.id, arm1VertexId: vB.id, arm2VertexId: vX.id, degreesLabel: "*" },
      { id: `${opts.figureId}_angAMX`, vertexId: vM.id, arm1VertexId: vX.id, arm2VertexId: vA.id, degreesLabel: "*" },
    ],
  };
}

/**
 * مسألة 7-3 ص 176: AB ∩ CD = {M} مع (5X+7)° و (3X+57)° متقابلتان بالرأس لحساب X = 25°
 */
export function buildVerticallyOppositeAlgebraic5X7Figure(opts: PrepGrade1VertOppFollowupOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vM: CanonicalVertexNode = { id: `${opts.figureId}_vM`, label: localizeGeometricVertexLabelSSOT("M", notation), position: { x: 5, y: 5 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 8.5, y: 6.8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 1.5, y: 3.2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 1.5, y: 6.8 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 8.5, y: 3.2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vB.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_hourglass_butterfly_similarity",
    titleArabic: "زاويتان متقابلتان بالرأس (5X+7)° و (3X+57)° لحساب قيمة X = 25°",
    notationLanguage: notation,
    vertices: [vM, vA, vB, vC, vD],
    segments,
    angles: [
      { id: `${opts.figureId}_angTop`, vertexId: vM.id, arm1VertexId: vC.id, arm2VertexId: vA.id, degreesLabel: "(5X+7)°" },
      { id: `${opts.figureId}_angBot`, vertexId: vM.id, arm1VertexId: vB.id, arm2VertexId: vD.id, degreesLabel: "(3X+57)°" },
    ],
  };
}

/**
 * مسألة 1-1 ص 174: AB ∩ CD = {M} مع AMC = 80° و DMB = 2X° لحساب X = 40°
 */
export function buildVerticallyOpposite2X80Figure(opts: PrepGrade1VertOppFollowupOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vM: CanonicalVertexNode = { id: `${opts.figureId}_vM`, label: localizeGeometricVertexLabelSSOT("M", notation), position: { x: 5, y: 5 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 1.8, y: 3 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 8.2, y: 7 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 8.2, y: 3 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 1.8, y: 7 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vD.id, toVertexId: vC.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_hourglass_butterfly_similarity",
    titleArabic: "زاويتان متقابلتان بالرأس AMC = 80° و DMB = 2X° لحساب X = 40°",
    notationLanguage: notation,
    vertices: [vM, vA, vB, vC, vD],
    segments,
    angles: [
      { id: `${opts.figureId}_angAMC`, vertexId: vM.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degrees: 80, degreesLabel: "80°" },
      { id: `${opts.figureId}_angDMB`, vertexId: vM.id, arm1VertexId: vD.id, arm2VertexId: vB.id, degreesLabel: "2X°" },
    ],
  };
}
