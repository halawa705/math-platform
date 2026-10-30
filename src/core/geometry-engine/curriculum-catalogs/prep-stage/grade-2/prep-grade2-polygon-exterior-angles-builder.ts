/**
 * @file prep-grade2-polygon-exterior-angles-builder.ts
 * @description منشئ أشكال الزوايا الخارجة للمضلعات (مجموعها 360°) للمثلث والرباعي والخماسي والسداسي (2ع).
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

export interface PrepGrade2PolygonExteriorOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 3-1 ص 273: مثلث بزوايا خارجة (X+31)° و (2X+32)° و (3X-3)° لإيجاد X = 50°
 */
export function buildTriangleExteriorAnglesAlgebraicFigure(
  opts: PrepGrade2PolygonExteriorOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 7.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 8.5, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 2, y: 2 } };

  // امتدادات الأشعة للزوايا الخارجة
  const vExtA: CanonicalVertexNode = { id: `${opts.figureId}_vExtA`, label: "", position: { x: 6.5, y: 9.5 } };
  const vExtB: CanonicalVertexNode = { id: `${opts.figureId}_vExtB`, label: "", position: { x: 10.5, y: 0.5 } };
  const vExtC: CanonicalVertexNode = { id: `${opts.figureId}_vExtC`, label: "", position: { x: 0, y: 2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCA`, fromVertexId: vC.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sExtA`, fromVertexId: vA.id, toVertexId: vExtA.id },
    { id: `${opts.figureId}_sExtB`, fromVertexId: vB.id, toVertexId: vExtB.id },
    { id: `${opts.figureId}_sExtC`, fromVertexId: vC.id, toVertexId: vExtC.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_exterior_angle_extension",
    titleArabic: "مثلث بزوايا خارجة (X+31)° و (2X+32)° و (3X-3)° لحساب قيمة X = 50°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vExtA, vExtB, vExtC],
    segments,
    angles: [
      { id: `${opts.figureId}_aExtA`, vertexId: vA.id, arm1VertexId: vC.id, arm2VertexId: vExtA.id, degreesLabel: "(X+31)°" },
      { id: `${opts.figureId}_aExtB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vExtB.id, degreesLabel: "(2X+32)°" },
      { id: `${opts.figureId}_aExtC`, vertexId: vC.id, arm1VertexId: vB.id, arm2VertexId: vExtC.id, degreesLabel: "(3X-3)°" },
    ],
  };
}

/**
 * مسألة 3-2 ص 273: شكل رباعي بزوايا خارجة 2X° و 3X° و 4X° و X° لحساب قيمة X = 36°
 */
export function buildQuadrilateralExteriorAngles2X3X4XFigure(
  opts: PrepGrade2PolygonExteriorOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 3, y: 7 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 8, y: 7 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 9, y: 2 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 2, y: 2 } };

  // امتدادات
  const vExtA: CanonicalVertexNode = { id: `${opts.figureId}_vExtA`, label: "", position: { x: 1, y: 7 } };
  const vExtB: CanonicalVertexNode = { id: `${opts.figureId}_vExtB`, label: "", position: { x: 8, y: 9 } };
  const vExtC: CanonicalVertexNode = { id: `${opts.figureId}_vExtC`, label: "", position: { x: 11, y: 2 } };
  const vExtD: CanonicalVertexNode = { id: `${opts.figureId}_vExtD`, label: "", position: { x: 2, y: 0.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sExtA`, fromVertexId: vA.id, toVertexId: vExtA.id },
    { id: `${opts.figureId}_sExtB`, fromVertexId: vB.id, toVertexId: vExtB.id },
    { id: `${opts.figureId}_sExtC`, fromVertexId: vC.id, toVertexId: vExtC.id },
    { id: `${opts.figureId}_sExtD`, fromVertexId: vD.id, toVertexId: vExtD.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_trapezoid_with_altitudes",
    titleArabic: "شكل رباعي بزوايا خارجة 2X° و 3X° و 4X° و X° لحساب قيمة X = 36°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vExtA, vExtB, vExtC, vExtD],
    segments,
    angles: [
      { id: `${opts.figureId}_aA`, vertexId: vA.id, arm1VertexId: vD.id, arm2VertexId: vExtA.id, degreesLabel: "2X°" },
      { id: `${opts.figureId}_aB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vExtB.id, degreesLabel: "3X°" },
      { id: `${opts.figureId}_aC`, vertexId: vC.id, arm1VertexId: vB.id, arm2VertexId: vExtC.id, degreesLabel: "4X°" },
      { id: `${opts.figureId}_aD`, vertexId: vD.id, arm1VertexId: vC.id, arm2VertexId: vExtD.id, degreesLabel: "X°" },
    ],
  };
}

/**
 * مسألة 3-4 ص 273 ومسألة 8 ص 276: خماسي بزوايا خارجة (X+19)° و 79° و 2X° و 55° و 84° لإيجاد X = 41°
 */
export function buildPentagonExteriorAnglesAlgebraicFigure(
  opts: PrepGrade2PolygonExteriorOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const v1: CanonicalVertexNode = { id: `${opts.figureId}_v1`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 4, y: 7.5 } };
  const v2: CanonicalVertexNode = { id: `${opts.figureId}_v2`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 8, y: 6.5 } };
  const v3: CanonicalVertexNode = { id: `${opts.figureId}_v3`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 7.5, y: 2 } };
  const v4: CanonicalVertexNode = { id: `${opts.figureId}_v4`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 3, y: 2 } };
  const v5: CanonicalVertexNode = { id: `${opts.figureId}_v5`, label: notation === "english" ? "E" : "هـ", position: { x: 1.5, y: 5 } };

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
    titleArabic: "خماسي بزوايا خارجة (X+19)° و 79° و 2X° و 55° و 84° لحساب قيمة X = 41°",
    notationLanguage: notation,
    vertices: [v1, v2, v3, v4, v5],
    segments,
    angles: [
      { id: `${opts.figureId}_a1`, vertexId: v1.id, arm1VertexId: v5.id, arm2VertexId: v2.id, degreesLabel: "(X+19)°" },
      { id: `${opts.figureId}_a2`, vertexId: v2.id, arm1VertexId: v1.id, arm2VertexId: v3.id, degrees: 79, degreesLabel: "79°" },
      { id: `${opts.figureId}_a3`, vertexId: v3.id, arm1VertexId: v2.id, arm2VertexId: v4.id, degreesLabel: "(2X)°" },
      { id: `${opts.figureId}_a4`, vertexId: v4.id, arm1VertexId: v3.id, arm2VertexId: v5.id, degrees: 55, degreesLabel: "55°" },
      { id: `${opts.figureId}_a5`, vertexId: v5.id, arm1VertexId: v4.id, arm2VertexId: v1.id, degrees: 84, degreesLabel: "84°" },
    ],
  };
}

/**
 * مسألة 4 ص 273: سداسي بزوايا خارجة 2a° و 4a° و 3a° و 2a° و 2a° و 5a° لحساب a = 20 وقيمة زاوية BCD = 120°
 */
export function buildHexagonExteriorAnglesWithVariablesFigure(
  opts: PrepGrade2PolygonExteriorOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 3, y: 7.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 7, y: 7.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 9, y: 4.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 7, y: 1.5 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 3, y: 1.5 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: notation === "english" ? "F" : "و", position: { x: 1, y: 4.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id },
    { id: `${opts.figureId}_sEF`, fromVertexId: vE.id, toVertexId: vF.id },
    { id: `${opts.figureId}_sFA`, fromVertexId: vF.id, toVertexId: vA.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_trapezoid_with_altitudes",
    titleArabic: "سداسي بزوايا خارجة 2a و 4a و 3a و 2a و 2a و 5a لحساب a = 20 وزاوية BCD = 120°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE, vF],
    segments,
    angles: [
      { id: `${opts.figureId}_aA`, vertexId: vA.id, arm1VertexId: vF.id, arm2VertexId: vB.id, degreesLabel: "2a°" },
      { id: `${opts.figureId}_aB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degreesLabel: "4a°" },
      { id: `${opts.figureId}_aC`, vertexId: vC.id, arm1VertexId: vB.id, arm2VertexId: vD.id, degreesLabel: "3a°" },
      { id: `${opts.figureId}_aD`, vertexId: vD.id, arm1VertexId: vC.id, arm2VertexId: vE.id, degreesLabel: "2a°" },
      { id: `${opts.figureId}_aE`, vertexId: vE.id, arm1VertexId: vD.id, arm2VertexId: vF.id, degreesLabel: "2a°" },
      { id: `${opts.figureId}_aF`, vertexId: vF.id, arm1VertexId: vE.id, arm2VertexId: vA.id, degreesLabel: "5a°" },
    ],
  };
}
