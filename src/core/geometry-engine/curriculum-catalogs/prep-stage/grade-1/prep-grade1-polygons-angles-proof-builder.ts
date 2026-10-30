/**
 * @file prep-grade1-polygons-angles-proof-builder.ts
 * @description منشئ أشكال براهين ومسائل زوايا المضلعات (السداسي والخماسي) للصف الأول الإعدادي (1ع ص 252).
 * @invariant يلتزم بحدود الأسطر (< 200 سطر) وTypeScript الصارم وفق دستور المنصة (AGENTS.md).
 */

import type {
  CanonicalAngleNode,
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
} from "../../../../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  type MathNotationLanguage,
} from "../../../../ssot/numeral-and-unit-ssot";

export interface PrepGrade1PolygonsProofOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 12 ص 252: سداسي منتظم ABCDEF مع امتداد الضلع AB إلى G وعمود HG ⊥ AG لإيجاد m(∠H) = 60°
 */
export function buildRegularHexagonExternalRightTriangleFigure(opts: PrepGrade1PolygonsProofOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 2, y: 7.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 4.5, y: 7.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 5.75, y: 5.3 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 4.5, y: 3.2 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 2, y: 3.2 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: localizeGeometricVertexLabelSSOT("F", notation), position: { x: 0.75, y: 5.3 } };
  const vG: CanonicalVertexNode = { id: `${opts.figureId}_vG`, label: localizeGeometricVertexLabelSSOT("G", notation), position: { x: 8, y: 7.5 } };
  const vH: CanonicalVertexNode = { id: `${opts.figureId}_vH`, label: localizeGeometricVertexLabelSSOT("H", notation), position: { x: 8, y: 4.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 1 },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, tickMarks: 1 },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, tickMarks: 1 },
    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id, tickMarks: 1 },
    { id: `${opts.figureId}_sEF`, fromVertexId: vE.id, toVertexId: vF.id, tickMarks: 1 },
    { id: `${opts.figureId}_sFA`, fromVertexId: vF.id, toVertexId: vA.id, tickMarks: 1 },
    { id: `${opts.figureId}_sBG`, fromVertexId: vB.id, toVertexId: vG.id },
    { id: `${opts.figureId}_sGH`, fromVertexId: vG.id, toVertexId: vH.id },
    { id: `${opts.figureId}_sBH`, fromVertexId: vB.id, toVertexId: vH.id },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_angG`, vertexId: vG.id, arm1VertexId: vB.id, arm2VertexId: vH.id, isRightAngle: true },
    { id: `${opts.figureId}_angH`, vertexId: vH.id, arm1VertexId: vG.id, arm2VertexId: vB.id, degreesLabel: "؟" },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_trapezoid_with_altitudes",
    titleArabic: "سداسي منتظم ABCDEF مع امتداد ضلع ومثلث قائم لإيجاد قياس زاوية H = 60°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE, vF, vG, vH],
    segments,
    angles,
  };
}

/**
 * مسألة 14 ص 252: خماسي ABCDE فيه CB ⊥ AB و BC ⊥ CD و EDC = 130° و EAB = 112° لحساب DEA = 118°
 */
export function buildPentagonTwoRightAnglesEDC130Figure(opts: PrepGrade1PolygonsProofOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 2, y: 7.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 7.5, y: 7.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 7.5, y: 2.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 3, y: 2.5 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 1, y: 5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id },
    { id: `${opts.figureId}_sEA`, fromVertexId: vE.id, toVertexId: vA.id },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true },
    { id: `${opts.figureId}_angC`, vertexId: vC.id, arm1VertexId: vB.id, arm2VertexId: vD.id, isRightAngle: true },
    { id: `${opts.figureId}_angD`, vertexId: vD.id, arm1VertexId: vC.id, arm2VertexId: vE.id, degreesLabel: "130°" },
    { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vE.id, arm2VertexId: vB.id, degreesLabel: "112°" },
    { id: `${opts.figureId}_angE`, vertexId: vE.id, arm1VertexId: vD.id, arm2VertexId: vA.id, degreesLabel: "؟" },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_trapezoid_with_altitudes",
    titleArabic: "خماسي ABCDE بزوايا قائمة و EDC = 130° و EAB = 112° لإيجاد DEA = 118°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE],
    segments,
    angles,
  };
}

/**
 * مسألة 13-5 ص 252: خماسي ABCDE زواياه E = 100° و D = 110° و C = 120° ومنصفا A و B يلتقيان في F لحساب AFB = 75°
 */
export function buildPentagonBaseBisectorsAFBFigure(opts: PrepGrade1PolygonsProofOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 1.5, y: 7.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 6.5, y: 7.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 8, y: 4.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 6, y: 1.8 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 2.5, y: 1.8 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: localizeGeometricVertexLabelSSOT("F", notation), position: { x: 4, y: 5.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id },
    { id: `${opts.figureId}_sEA`, fromVertexId: vE.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sAF`, fromVertexId: vA.id, toVertexId: vF.id },
    { id: `${opts.figureId}_sBF`, fromVertexId: vB.id, toVertexId: vF.id },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_angE`, vertexId: vE.id, arm1VertexId: vD.id, arm2VertexId: vA.id, degreesLabel: "100°" },
    { id: `${opts.figureId}_angD`, vertexId: vD.id, arm1VertexId: vC.id, arm2VertexId: vE.id, degreesLabel: "110°" },
    { id: `${opts.figureId}_angC`, vertexId: vC.id, arm1VertexId: vB.id, arm2VertexId: vD.id, degreesLabel: "120°" },
    { id: `${opts.figureId}_angF`, vertexId: vF.id, arm1VertexId: vA.id, arm2VertexId: vB.id, degreesLabel: "X°" },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_trapezoid_with_altitudes",
    titleArabic: "خماسي ABCDE فيه زوايا 100° و 110° و 120° ومنصفا زاويتين لإيجاد X = 75°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE, vF],
    segments,
    angles,
  };
}

/**
 * مسألة 13-1 ص 252: سداسي بزوايا قائمة وزوايا جبرية x و (x+24)°
 */
export function buildHexagonAlgebraicTwoRightAnglesFigure(opts: PrepGrade1PolygonsProofOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 2, y: 7 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 6.5, y: 7 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 8, y: 5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 6.5, y: 2 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 2, y: 2 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: localizeGeometricVertexLabelSSOT("F", notation), position: { x: 0.8, y: 4.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id },
    { id: `${opts.figureId}_sEF`, fromVertexId: vE.id, toVertexId: vF.id },
    { id: `${opts.figureId}_sFA`, fromVertexId: vF.id, toVertexId: vA.id },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_angC`, vertexId: vC.id, arm1VertexId: vB.id, arm2VertexId: vD.id, isRightAngle: true },
    { id: `${opts.figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degreesLabel: "X°" },
    { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vF.id, arm2VertexId: vB.id, degreesLabel: "(X + 24)°" },
    { id: `${opts.figureId}_angE`, vertexId: vE.id, arm1VertexId: vF.id, arm2VertexId: vD.id, degreesLabel: "X°" },
    { id: `${opts.figureId}_angD`, vertexId: vD.id, arm1VertexId: vE.id, arm2VertexId: vC.id, degreesLabel: "(X + 24)°" },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_trapezoid_with_altitudes",
    titleArabic: "سداسي بزوايا قائمة وزوايا جبرية X و (X + 24)° لحساب قيمة X",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE, vF],
    segments,
    angles,
  };
}
