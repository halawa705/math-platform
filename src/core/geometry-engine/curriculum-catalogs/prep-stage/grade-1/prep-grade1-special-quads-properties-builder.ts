/**
 * @file prep-grade1-special-quads-properties-builder.ts
 * @description منشئ أشكال خواص الحالات الخاصة لمتوازي الأضلاع: المستطيل والمعين والمربع جبرياً وهندسياً (1ع).
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

export interface PrepGrade1SpecialQuadsOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 3-2 ص 233 ومسألة 6-2 ص 234: قطرا المستطيل متساويان 4X - 5 = 3X لحساب X = 5
 */
export function buildRectangleDiagonalsEqualAlgebraicFigure(opts: PrepGrade1SpecialQuadsOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 1.5, y: 2.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 8.5, y: 2.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 8.5, y: 7.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 1.5, y: 7.5 } };
  const vM: CanonicalVertexNode = { id: `${opts.figureId}_vM`, label: localizeGeometricVertexLabelSSOT("M", notation), position: { x: 5, y: 5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sAM`, fromVertexId: vA.id, toVertexId: vM.id, lengthLabel: { value: "(4X - 5) سم" } },
    { id: `${opts.figureId}_sDM`, fromVertexId: vD.id, toVertexId: vM.id, lengthLabel: { value: "(3X) سم" } },
    { id: `${opts.figureId}_sMC`, fromVertexId: vM.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sMB`, fromVertexId: vM.id, toVertexId: vB.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: "مستطيل ABCD قطراه متساويان 4X - 5 = 3X لحساب قيمة X = 5",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vM],
    segments,
    angles: [
      { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vD.id, degrees: 90, degreesLabel: "90°" },
    ],
  };
}

/**
 * مسألة 3-3 ص 233: أضلاع المعين متساوية 7X - 11 = 5X + 1 لحساب X = 6
 */
export function buildRhombusEqualSidesAlgebraicFigure(opts: PrepGrade1SpecialQuadsOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 2, y: 2.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 6.5, y: 2.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 8, y: 7.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 3.5, y: 7.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 1 },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, tickMarks: 1 },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, lengthLabel: { value: "(7X - 11) سم" } },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id, lengthLabel: { value: "(5X + 1) سم" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: "معين ABCD أضلاعه متساوية 7X - 11 = 5X + 1 لحساب قيمة X = 6",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD],
    segments,
    angles: [],
  };
}

/**
 * مسألة 9 ص 235: معين ABCD فيه DBC = 62° لإيجاد زاوية الرأس A = 56°
 */
export function buildRhombusAngleDBC62Figure(opts: PrepGrade1SpecialQuadsOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 1.5, y: 2.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 6.5, y: 2.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 8.5, y: 7.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 3.5, y: 7.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 1 },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, tickMarks: 1 },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, tickMarks: 1 },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id, tickMarks: 1 },
    { id: `${opts.figureId}_sBD`, fromVertexId: vB.id, toVertexId: vD.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: "معين ABCD فيه زاوية DBC = 62° لحساب زاوية A = 56°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD],
    segments,
    angles: [
      { id: `${opts.figureId}_angDBC`, vertexId: vB.id, arm1VertexId: vC.id, arm2VertexId: vD.id, degrees: 62, degreesLabel: "62°" },
      { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vD.id, degrees: 56, degreesLabel: "؟" },
    ],
  };
}

/**
 * مسألة 7 ص 234: مربع ABCD فيه BD = 5a - 4 و MC = 2a - 1 لحساب a = 2 وطول AC = 6
 */
export function buildSquareDiagonalsRelationFigure(opts: PrepGrade1SpecialQuadsOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 2, y: 2.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 7.5, y: 2.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 7.5, y: 8 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 2, y: 8 } };
  const vM: CanonicalVertexNode = { id: `${opts.figureId}_vM`, label: localizeGeometricVertexLabelSSOT("M", notation), position: { x: 4.75, y: 5.25 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 1 },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, tickMarks: 1 },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, tickMarks: 1 },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id, tickMarks: 1 },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sBD`, fromVertexId: vB.id, toVertexId: vD.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: "مربع ABCD قطراه BD = 5a - 4 و MC = 2a - 1 لحساب a = 2 وطول AC = 6 وحدات طول",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vM],
    segments,
    angles: [
      { id: `${opts.figureId}_angM`, vertexId: vM.id, arm1VertexId: vA.id, arm2VertexId: vB.id, degrees: 90, degreesLabel: "90°" },
    ],
  };
}
