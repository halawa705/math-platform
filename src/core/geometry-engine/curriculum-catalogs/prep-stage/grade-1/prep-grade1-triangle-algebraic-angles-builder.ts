/**
 * @file prep-grade1-triangle-algebraic-angles-builder.ts
 * @description منشئ أشكال الزوايا الخارجة والداخلة المعبر عنها جبرياً (معادلات الدرجة الأولى) (1ع).
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

export interface PrepGrade1TriangleAlgebraicOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 14-1 ص 210: زاوية خارجة (3X+10)° = 60° + 70° = 130° لإيجاد X = 40°
 */
export function buildTriangleExteriorAlgebraic3X10Figure(opts: PrepGrade1TriangleAlgebraicOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 7, y: 8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 8.5, y: 3 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 4.5, y: 3 } };
  const vExt: CanonicalVertexNode = { id: `${opts.figureId}_vExt`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 1.5, y: 3 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCA`, fromVertexId: vC.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sExt`, fromVertexId: vC.id, toVertexId: vExt.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_exterior_angle_extension",
    titleArabic: "زاوية خارجة لمثلث (3X+10)° مع زاويتين داخلتين 60° و 70° لإيجاد X = 40°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vExt],
    segments,
    angles: [
      { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vC.id, arm2VertexId: vB.id, degrees: 60, degreesLabel: "60°" },
      { id: `${opts.figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degrees: 70, degreesLabel: "70°" },
      { id: `${opts.figureId}_angExt`, vertexId: vC.id, arm1VertexId: vA.id, arm2VertexId: vExt.id, degreesLabel: "(3X+10)°" },
    ],
  };
}

/**
 * مسألة 14-2 ص 210: زاويتان داخلتان (2X-2)° و (3X+7)° والزاوية الخارجة 125° لإيجاد X = 24°
 */
export function buildTriangleExteriorTwoUnknowns125Figure(opts: PrepGrade1TriangleAlgebraicOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 3.5, y: 8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 2, y: 3 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 6.5, y: 3 } };
  const vExt: CanonicalVertexNode = { id: `${opts.figureId}_vExt`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 9.5, y: 3 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCA`, fromVertexId: vC.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sExt`, fromVertexId: vC.id, toVertexId: vExt.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_exterior_angle_extension",
    titleArabic: "زاويتان داخلتان (2X-2)° و (3X+7)° والزاوية الخارجة 125° لإيجاد X = 24°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vExt],
    segments,
    angles: [
      { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vC.id, degreesLabel: "(2X-2)°" },
      { id: `${opts.figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degreesLabel: "(3X+7)°" },
      { id: `${opts.figureId}_angExt`, vertexId: vC.id, arm1VertexId: vA.id, arm2VertexId: vExt.id, degrees: 125, degreesLabel: "125°" },
    ],
  };
}

/**
 * مسألة 14-3 ص 210: زاوية خارجة (2X+16)° = (X+1)° + 80° لإيجاد X = 65°
 */
export function buildTriangleExteriorAlgebraic2X16Figure(opts: PrepGrade1TriangleAlgebraicOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 7, y: 7.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 8, y: 3 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 4, y: 3 } };
  const vExt: CanonicalVertexNode = { id: `${opts.figureId}_vExt`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 1.2, y: 3 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCA`, fromVertexId: vC.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sExt`, fromVertexId: vC.id, toVertexId: vExt.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_exterior_angle_extension",
    titleArabic: "زاوية خارجة (2X+16)° مع داخلتين (X+1)° و 80° لحساب X = 65°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vExt],
    segments,
    angles: [
      { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vC.id, arm2VertexId: vB.id, degreesLabel: "(X+1)°" },
      { id: `${opts.figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degrees: 80, degreesLabel: "80°" },
      { id: `${opts.figureId}_angExt`, vertexId: vC.id, arm1VertexId: vA.id, arm2VertexId: vExt.id, degreesLabel: "(2X+16)°" },
    ],
  };
}

/**
 * مسألة 14-4 ص 210: زوايا المثلث الداخلة (2X-5)° و (3X+4)° و (4X-8)° لحساب B = 76°
 */
export function buildTriangleThreeAlgebraicAnglesFigure(opts: PrepGrade1TriangleAlgebraicOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 5, y: 8.5 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 2, y: 2.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 8, y: 2.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sCA`, fromVertexId: vC.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: "مثلث زواياه الداخلة (2X-5)° و (3X+4)° و (4X-8)° لحساب B = 76°",
    notationLanguage: notation,
    vertices: [vC, vA, vB],
    segments,
    angles: [
      { id: `${opts.figureId}_angC`, vertexId: vC.id, arm1VertexId: vA.id, arm2VertexId: vB.id, degreesLabel: "(2X-5)°" },
      { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vC.id, arm2VertexId: vB.id, degreesLabel: "(3X+4)°" },
      { id: `${opts.figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degreesLabel: "(4X-8)°" },
    ],
  };
}
