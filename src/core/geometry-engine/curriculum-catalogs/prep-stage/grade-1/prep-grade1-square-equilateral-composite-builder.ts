/**
 * @file prep-grade1-square-equilateral-composite-builder.ts
 * @description منشئ أشكال المربع الملتصق بمثلث متساوي الأضلاع والمستطيل ذي الزوايا المتكاملة والمعين المدمج (1ع).
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

export interface PrepGrade1CompositeSquareOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 6-1 ص 234: مربع ABCD ملتصق بمثلث متساوي الأضلاع DCE لحساب زاوية ACE = 105°
 */
export function buildSquareEquilateralCompositeFigure(opts: PrepGrade1CompositeSquareOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 2, y: 2.2 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 7, y: 2.2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 7, y: 6.8 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 2, y: 6.8 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 4.5, y: 9.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 1 },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, tickMarks: 1 },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, tickMarks: 1 },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id, tickMarks: 1 },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id, tickMarks: 1 },
    { id: `${opts.figureId}_sCE`, fromVertexId: vC.id, toVertexId: vE.id, tickMarks: 1 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: "مربع ABCD ملتصق بمثلث متساوي الأضلاع DCE لحساب زاوية ACE = 105°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE],
    segments,
    angles: [
      { id: `${opts.figureId}_angE`, vertexId: vE.id, arm1VertexId: vD.id, arm2VertexId: vC.id, degrees: 60, degreesLabel: "60°" },
      { id: `${opts.figureId}_angDCE`, vertexId: vD.id, arm1VertexId: vC.id, arm2VertexId: vE.id, degrees: 60, degreesLabel: "60°" },
      { id: `${opts.figureId}_angACE`, vertexId: vC.id, arm1VertexId: vA.id, arm2VertexId: vE.id, degrees: 105, degreesLabel: "X°" },
    ],
  };
}

/**
 * مسألة 8 ص 234: مستطيل ABCD مع E ∈ AB وزاويتي AED = 46° و ECB = 44° لحساب CED = 88°
 */
export function buildRectangleInternalAngleCED88Figure(opts: PrepGrade1CompositeSquareOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 1.5, y: 2.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 8.5, y: 2.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 8.5, y: 7.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 1.5, y: 7.5 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 4.8, y: 2.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAE`, fromVertexId: vA.id, toVertexId: vE.id },
    { id: `${opts.figureId}_sEB`, fromVertexId: vE.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sED`, fromVertexId: vE.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sEC`, fromVertexId: vE.id, toVertexId: vC.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: "مستطيل ABCD فيه AED = 46° و ECB = 44° لحساب زاوية CED = 88°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE],
    segments,
    angles: [
      { id: `${opts.figureId}_angAED`, vertexId: vE.id, arm1VertexId: vA.id, arm2VertexId: vD.id, degrees: 46, degreesLabel: "46°" },
      { id: `${opts.figureId}_angECB`, vertexId: vC.id, arm1VertexId: vB.id, arm2VertexId: vE.id, degrees: 44, degreesLabel: "44°" },
      { id: `${opts.figureId}_angCED`, vertexId: vE.id, arm1VertexId: vD.id, arm2VertexId: vC.id, degrees: 88, degreesLabel: "؟" },
    ],
  };
}

/**
 * مسألة 12 ص 235: مستطيل ABCD ومربع ABFE متداخلان مع FDC = 52° لحساب AFD = 97°
 */
export function buildRectangleSquareCompositeAFD97Figure(opts: PrepGrade1CompositeSquareOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 8.5, y: 7.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 8.5, y: 2.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 1.5, y: 2.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 1.5, y: 7.5 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 5, y: 7.5 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: localizeGeometricVertexLabelSSOT("F", notation), position: { x: 5, y: 2.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBF`, fromVertexId: vB.id, toVertexId: vF.id },
    { id: `${opts.figureId}_sFC`, fromVertexId: vF.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id },
    { id: `${opts.figureId}_sEA`, fromVertexId: vE.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sEF`, fromVertexId: vE.id, toVertexId: vF.id },
    { id: `${opts.figureId}_sDF`, fromVertexId: vD.id, toVertexId: vF.id },
    { id: `${opts.figureId}_sAF`, fromVertexId: vA.id, toVertexId: vF.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: "مستطيل ABCD يحوي مربعاً ABFE مع زاوية FDC = 52° لحساب AFD = 97°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE, vF],
    segments,
    angles: [
      { id: `${opts.figureId}_angFDC`, vertexId: vD.id, arm1VertexId: vC.id, arm2VertexId: vF.id, degrees: 52, degreesLabel: "52°" },
      { id: `${opts.figureId}_angAFD`, vertexId: vF.id, arm1VertexId: vA.id, arm2VertexId: vD.id, degrees: 97, degreesLabel: "؟" },
    ],
  };
}

/**
 * مسألة 13 ص 235: مربع ABCD وبداخله معين EBFD على القطر AC مع EA = FC
 */
export function buildSquareInscribedRhombusFigure(opts: PrepGrade1CompositeSquareOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 5, y: 8.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 8.5, y: 5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 5, y: 1.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 1.5, y: 5 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 5, y: 7.2 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: localizeGeometricVertexLabelSSOT("F", notation), position: { x: 5, y: 2.8 } };
  const vM: CanonicalVertexNode = { id: `${opts.figureId}_vM`, label: localizeGeometricVertexLabelSSOT("M", notation), position: { x: 5, y: 5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sBD`, fromVertexId: vB.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sEB`, fromVertexId: vE.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBF`, fromVertexId: vB.id, toVertexId: vF.id },
    { id: `${opts.figureId}_sFD`, fromVertexId: vF.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: "مربع ABCD بداخله معين EBFD على القطر AC مع EA = FC",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE, vF, vM],
    segments,
    angles: [
      { id: `${opts.figureId}_angM`, vertexId: vM.id, arm1VertexId: vE.id, arm2VertexId: vB.id, degrees: 90, degreesLabel: "90°" },
    ],
  };
}
