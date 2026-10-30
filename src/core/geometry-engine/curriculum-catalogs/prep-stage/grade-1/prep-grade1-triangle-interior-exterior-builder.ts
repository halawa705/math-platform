/**
 * @file prep-grade1-triangle-interior-exterior-builder.ts
 * @description منشئ أشكال الزوايا الداخلة للمثلث (180°) والزاوية الخارجة والمتساوي الأضلاع (1ع).
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

export interface PrepGrade1TriangleOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 2-3 ص 207: زوايا المثلث a° و 3a° و 5a° ومجموعها 180° لإيجاد a = 20°
 */
export function buildTriangleInteriorAnglesRatioFigure(opts: PrepGrade1TriangleOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 5, y: 8.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 1.5, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 8.5, y: 2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCA`, fromVertexId: vC.id, toVertexId: vA.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: "مثلث زواياه الداخلة a° و 3a° و 5a° لحساب قيمة a = 20°",
    notationLanguage: notation,
    vertices: [vA, vB, vC],
    segments,
    angles: [
      { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vC.id, degreesLabel: "5a°" },
      { id: `${opts.figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degreesLabel: "a°" },
      { id: `${opts.figureId}_angC`, vertexId: vC.id, arm1VertexId: vA.id, arm2VertexId: vB.id, degreesLabel: "3a°" },
    ],
  };
}

/**
 * مسألة 2-5 ص 207: زاوية خارجة للمثلث مع زاويتين داخلتين 22° و 82° لحساب الخارجة X = 104°
 */
export function buildTriangleExteriorSum2282Figure(opts: PrepGrade1TriangleOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 5.5, y: 8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 1.5, y: 3 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 6.5, y: 3 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 9.5, y: 3 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCA`, fromVertexId: vC.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_exterior_angle_extension",
    titleArabic: "زاوية خارجة لمثلث مع زاويتين داخلتين 22° و 82° لإيجاد الزاوية الخارجة X = 104°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD],
    segments,
    angles: [
      { id: `${opts.figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degrees: 22, degreesLabel: "22°" },
      { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vC.id, degrees: 82, degreesLabel: "82°" },
      { id: `${opts.figureId}_angExt`, vertexId: vC.id, arm1VertexId: vA.id, arm2VertexId: vD.id, degrees: 104, degreesLabel: "X°" },
    ],
  };
}

/**
 * مسألة 2-7 ص 207: مثلث متساوي الأضلاع والزاوية الخارجة عنه = 120°
 */
export function buildTriangleEquilateralExterior120Figure(opts: PrepGrade1TriangleOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 5, y: 8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 2, y: 3 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 7, y: 3 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 9.5, y: 3 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 1 },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, tickMarks: 1 },
    { id: `${opts.figureId}_sCA`, fromVertexId: vC.id, toVertexId: vA.id, tickMarks: 1 },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_exterior_angle_extension",
    titleArabic: "مثلث متساوي الأضلاع والزاوية الخارجة عنه X = 120°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD],
    segments,
    angles: [
      { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vC.id, degreesLabel: "*" },
      { id: `${opts.figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degreesLabel: "*" },
      { id: `${opts.figureId}_angC`, vertexId: vC.id, arm1VertexId: vA.id, arm2VertexId: vB.id, degreesLabel: "*" },
      { id: `${opts.figureId}_angExt`, vertexId: vC.id, arm1VertexId: vA.id, arm2VertexId: vD.id, degrees: 120, degreesLabel: "X°" },
    ],
  };
}

/**
 * مسألة 2-9 ص 207: زاويتان خارجتان 110° و 104° لحساب زاوية الرأس X = 34°
 */
export function buildTriangleTwoExteriors110104Figure(opts: PrepGrade1TriangleOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 4.8, y: 8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 3, y: 3 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 7, y: 3 } };
  const vExtB: CanonicalVertexNode = { id: `${opts.figureId}_vExtB`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 1, y: 3 } };
  const vExtA: CanonicalVertexNode = { id: `${opts.figureId}_vExtA`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 9.5, y: 3 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sExtB`, fromVertexId: vExtB.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBA`, fromVertexId: vB.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sExtA`, fromVertexId: vA.id, toVertexId: vExtA.id },
    { id: `${opts.figureId}_sCB`, fromVertexId: vC.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sCA`, fromVertexId: vC.id, toVertexId: vA.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_exterior_angle_extension",
    titleArabic: "مثلث بزاويتين خارجتين 110° و 104° لحساب زاوية الرأس X = 34°",
    notationLanguage: notation,
    vertices: [vC, vB, vA, vExtB, vExtA],
    segments,
    angles: [
      { id: `${opts.figureId}_angExt1`, vertexId: vB.id, arm1VertexId: vExtB.id, arm2VertexId: vC.id, degrees: 110, degreesLabel: "110°" },
      { id: `${opts.figureId}_angExt2`, vertexId: vA.id, arm1VertexId: vExtA.id, arm2VertexId: vC.id, degrees: 104, degreesLabel: "104°" },
      { id: `${opts.figureId}_angHead`, vertexId: vC.id, arm1VertexId: vB.id, arm2VertexId: vA.id, degrees: 34, degreesLabel: "X°" },
    ],
  };
}
