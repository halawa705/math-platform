/**
 * @file prep-grade2-polygon-interior-angles-builder.ts
 * @description منشئ أشكال الزوايا الداخلة للمضلعات والمضلعات المنتظمة والمقترنة (2ع - تمارين 17).
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

export interface PrepGrade2PolygonInteriorOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 2-2 ص 272: مضلع خماسي بزوايا داخلة 120° و 120° و 95° و 96° لحساب الزاوية الخامسة X = 109°
 */
export function buildConvexPentagonInteriorAnglesFigure(
  opts: PrepGrade2PolygonInteriorOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const v1: CanonicalVertexNode = { id: `${opts.figureId}_v1`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 8.5 } };
  const v2: CanonicalVertexNode = { id: `${opts.figureId}_v2`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 8.5, y: 6.5 } };
  const v3: CanonicalVertexNode = { id: `${opts.figureId}_v3`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 7.5, y: 2 } };
  const v4: CanonicalVertexNode = { id: `${opts.figureId}_v4`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 2.5, y: 2 } };
  const v5: CanonicalVertexNode = { id: `${opts.figureId}_v5`, label: notation === "english" ? "E" : "هـ", position: { x: 1.5, y: 6.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_s12`, fromVertexId: v1.id, toVertexId: v2.id },
    { id: `${opts.figureId}_s23`, fromVertexId: v2.id, toVertexId: v3.id },
    { id: `${opts.figureId}_s34`, fromVertexId: v3.id, toVertexId: v4.id },
    { id: `${opts.figureId}_s45`, fromVertexId: v4.id, toVertexId: v5.id },
    { id: `${opts.figureId}_s51`, fromVertexId: v5.id, toVertexId: v1.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_trapezoid_with_altitudes",
    titleArabic: "مضلع خماسي بزوايا داخلة 120° و 120° و 95° و 96° لحساب الزاوية الخامسة X = 109°",
    notationLanguage: notation,
    vertices: [v1, v2, v3, v4, v5],
    segments,
    angles: [
      { id: `${opts.figureId}_a1`, vertexId: v1.id, arm1VertexId: v5.id, arm2VertexId: v2.id, degrees: 120, degreesLabel: "120°" },
      { id: `${opts.figureId}_a2`, vertexId: v2.id, arm1VertexId: v1.id, arm2VertexId: v3.id, degrees: 95, degreesLabel: "95°" },
      { id: `${opts.figureId}_a3`, vertexId: v3.id, arm1VertexId: v2.id, arm2VertexId: v4.id, degrees: 96, degreesLabel: "96°" },
      { id: `${opts.figureId}_a4`, vertexId: v4.id, arm1VertexId: v3.id, arm2VertexId: v5.id, degrees: 120, degreesLabel: "120°" },
      { id: `${opts.figureId}_a5`, vertexId: v5.id, arm1VertexId: v4.id, arm2VertexId: v1.id, degreesLabel: "X°" },
    ],
  };
}

/**
 * مسألة 2-3 ص 272: مضلع خماسي منتظم متساوي الأضلاع والزوايا لإيجاد قياس زاويته الداخلة X = 108°
 */
export function buildRegularPentagonFigure(
  opts: PrepGrade2PolygonInteriorOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const v1: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 8.5 } };
  const v2: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 8.5, y: 6 } };
  const v3: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 7, y: 1.5 } };
  const v4: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 3, y: 1.5 } };
  const v5: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 1.5, y: 6 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: v1.id, toVertexId: v2.id, tickMarks: 1 },
    { id: `${opts.figureId}_sBC`, fromVertexId: v2.id, toVertexId: v3.id, tickMarks: 1 },
    { id: `${opts.figureId}_sCD`, fromVertexId: v3.id, toVertexId: v4.id, tickMarks: 1 },
    { id: `${opts.figureId}_sDE`, fromVertexId: v4.id, toVertexId: v5.id, tickMarks: 1 },
    { id: `${opts.figureId}_sEA`, fromVertexId: v5.id, toVertexId: v1.id, tickMarks: 1 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_trapezoid_with_altitudes",
    titleArabic: "مضلع خماسي منتظم متساوي الأضلاع لإيجاد قياس زاويته الداخلة X = 108°",
    notationLanguage: notation,
    vertices: [v1, v2, v3, v4, v5],
    segments,
    angles: [
      { id: `${opts.figureId}_aE`, vertexId: v5.id, arm1VertexId: v4.id, arm2VertexId: v1.id, degrees: 108, degreesLabel: "X°" },
    ],
  };
}

/**
 * مسألة 6 ص 273: سداسي منتظم ABCDEF ملتصق برباعي CGHB بزوايا 110° و 135° لحساب قياس زاوية G = 55°
 */
export function buildHexagonAdjacentQuadFigure(
  opts: PrepGrade2PolygonInteriorOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  // سداسي منتظم ABCDEF
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 6, y: 8 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: notation === "english" ? "F" : "و", position: { x: 8, y: 8 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 9.5, y: 5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 8, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 6, y: 2 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 4.5, y: 5 } };

  // الشكل الرباعي الملتصق بالضلع BC: CGHB
  const vH: CanonicalVertexNode = { id: `${opts.figureId}_vH`, label: notation === "english" ? "H" : "ح", position: { x: 3, y: 2 } };
  const vG: CanonicalVertexNode = { id: `${opts.figureId}_vG`, label: notation === "english" ? "G" : "ط", position: { x: 2, y: 5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAF`, fromVertexId: vA.id, toVertexId: vF.id },
    { id: `${opts.figureId}_sFE`, fromVertexId: vF.id, toVertexId: vE.id },
    { id: `${opts.figureId}_sED`, fromVertexId: vE.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCB`, fromVertexId: vC.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBA`, fromVertexId: vB.id, toVertexId: vA.id },
    // أضلاع الشكل الرباعي الملتصق
    { id: `${opts.figureId}_sCH`, fromVertexId: vC.id, toVertexId: vH.id },
    { id: `${opts.figureId}_sHG`, fromVertexId: vH.id, toVertexId: vG.id },
    { id: `${opts.figureId}_sGB`, fromVertexId: vG.id, toVertexId: vB.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_trapezoid_with_altitudes",
    titleArabic: "سداسي منتظم ABCDEF ملتصق برباعي CGHB بزوايا 110° و 135° لحساب زاوية G = 55°",
    notationLanguage: notation,
    vertices: [vA, vF, vE, vD, vC, vB, vH, vG],
    segments,
    angles: [
      { id: `${opts.figureId}_angH`, vertexId: vH.id, arm1VertexId: vC.id, arm2VertexId: vG.id, degrees: 110, degreesLabel: "110°" },
      { id: `${opts.figureId}_angGBC`, vertexId: vB.id, arm1VertexId: vG.id, arm2VertexId: vC.id, degrees: 135, degreesLabel: "135°" },
    ],
  };
}

/**
 * مسألة 2-9 ص 272: مضلعان خماسيان منتظمان مشتركان في ضلع لإيجاد الزاوية بينهما X = 144°
 */
export function buildTwoSharedEdgePentagonsFigure(
  opts: PrepGrade2PolygonInteriorOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vTop: CanonicalVertexNode = { id: `${opts.figureId}_vT`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 7.5 } };
  const vBot: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 5, y: 2.5 } };

  // خماسي أيمن
  const vR1: CanonicalVertexNode = { id: `${opts.figureId}_vR1`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 7.5, y: 8.5 } };
  const vR2: CanonicalVertexNode = { id: `${opts.figureId}_vR2`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 9.5, y: 5 } };
  const vR3: CanonicalVertexNode = { id: `${opts.figureId}_vR3`, label: notation === "english" ? "E" : "هـ", position: { x: 7.5, y: 1.5 } };

  // خماسي أيسر
  const vL1: CanonicalVertexNode = { id: `${opts.figureId}_vL1`, label: notation === "english" ? "F" : "و", position: { x: 2.5, y: 8.5 } };
  const vL2: CanonicalVertexNode = { id: `${opts.figureId}_vL2`, label: notation === "english" ? "G" : "ط", position: { x: 0.5, y: 5 } };
  const vL3: CanonicalVertexNode = { id: `${opts.figureId}_vL3`, label: notation === "english" ? "H" : "ح", position: { x: 2.5, y: 1.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sShared`, fromVertexId: vTop.id, toVertexId: vBot.id, tickMarks: 1 },
    { id: `${opts.figureId}_sTR1`, fromVertexId: vTop.id, toVertexId: vR1.id, tickMarks: 1 },
    { id: `${opts.figureId}_sR1R2`, fromVertexId: vR1.id, toVertexId: vR2.id, tickMarks: 1 },
    { id: `${opts.figureId}_sR2R3`, fromVertexId: vR2.id, toVertexId: vR3.id, tickMarks: 1 },
    { id: `${opts.figureId}_sR3B`, fromVertexId: vR3.id, toVertexId: vBot.id, tickMarks: 1 },
    { id: `${opts.figureId}_sTL1`, fromVertexId: vTop.id, toVertexId: vL1.id, tickMarks: 1 },
    { id: `${opts.figureId}_sL1L2`, fromVertexId: vL1.id, toVertexId: vL2.id, tickMarks: 1 },
    { id: `${opts.figureId}_sL2L3`, fromVertexId: vL2.id, toVertexId: vL3.id, tickMarks: 1 },
    { id: `${opts.figureId}_sL3B`, fromVertexId: vL3.id, toVertexId: vBot.id, tickMarks: 1 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_trapezoid_with_altitudes",
    titleArabic: "خماسيان منتظمان مشتركان في ضلع لحساب الزاوية بينهما X = 144°",
    notationLanguage: notation,
    vertices: [vTop, vR1, vR2, vR3, vBot, vL3, vL2, vL1],
    segments,
    angles: [
      { id: `${opts.figureId}_aX`, vertexId: vBot.id, arm1VertexId: vR3.id, arm2VertexId: vL3.id, degreesLabel: "X°" },
    ],
  };
}
