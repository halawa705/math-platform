/**
 * @file prep-grade2-isosceles-compound-triangles-builder.ts
 * @description منشئ أشكال المثلث المتساوي الساقين المقترن بالمثلث المتساوي الأضلاع أو مثلث مجاور (2ع).
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

export interface PrepGrade2IsoscelesCompoundOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 3 ص 241: مثلث متساوي الساقين ABC (AB=AC, ∠A=40°) ومثلث متساوي الأضلاع DBE لإيجاد ∠CBD = 130°
 */
export function buildIsoscelesSharingVertexWithEquilateralFigure(
  opts: PrepGrade2IsoscelesCompoundOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 8.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 3.5, y: 3 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 6.5, y: 3 } };

  // مثلث متساوي الأضلاع DBE يشترك في B
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 1, y: 5 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 4, y: 5.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 1 },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, tickMarks: 1 },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    // أضلاع المثلث DBE المتساوي الأضلاع
    { id: `${opts.figureId}_sDB`, fromVertexId: vD.id, toVertexId: vB.id, tickMarks: 2 },
    { id: `${opts.figureId}_sBE`, fromVertexId: vB.id, toVertexId: vE.id, tickMarks: 2 },
    { id: `${opts.figureId}_sED`, fromVertexId: vE.id, toVertexId: vD.id, tickMarks: 2 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_isosceles_equilateral",
    titleArabic: "مثلث متساوي الساقين ABC بزاوية 40° ومثلث متساوي الأضلاع DBE لإيجاد زاوية CBD = 130°",
    notationLanguage: notation,
    vertices: [vA, vD, vE, vB, vC],
    segments,
    angles: [
      { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vC.id, degrees: 40, degreesLabel: "40°" },
    ],
  };
}

/**
 * مسألة 4 ص 241: مثلث متساوي الساقين ABC (AB=AC, ∠A=50°) ومثلث متساوي الأضلاع EBD على امتداد القاعدة لحساب ∠ABE = 55°
 */
export function buildIsoscelesAdjacentToEquilateralOnBaseFigure(
  opts: PrepGrade2IsoscelesCompoundOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 6.5, y: 8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 4.5, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 8.5, y: 2 } };

  // D على امتداد CB، E رأس المثلث المتساوي الأضلاع EBD
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 1.5, y: 2 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 3, y: 5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 1 },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, tickMarks: 1 },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sDB`, fromVertexId: vD.id, toVertexId: vB.id, tickMarks: 2 },
    { id: `${opts.figureId}_sBE`, fromVertexId: vB.id, toVertexId: vE.id, tickMarks: 2 },
    { id: `${opts.figureId}_sED`, fromVertexId: vE.id, toVertexId: vD.id, tickMarks: 2 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_isosceles_equilateral",
    titleArabic: "مثلث متساوي الساقين ABC برأس 50° ومثلث متساوي الأضلاع EBD لحساب زاوية ABE = 55°",
    notationLanguage: notation,
    vertices: [vA, vE, vD, vB, vC],
    segments,
    angles: [
      { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vC.id, degrees: 50, degreesLabel: "50°" },
    ],
  };
}

/**
 * مسألة 5 ص 241: مثلث ABC (30°, 40°) مجاور لمثلث متساوي الساقين CAD (AC=AD) لحساب ∠D = 70° و ∠CAD = 40°
 */
export function buildIsoscelesAdjacentCADFigure(
  opts: PrepGrade2IsoscelesCompoundOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 3.5, y: 7.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 9, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 4.5, y: 2 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 1, y: 2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vC.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vD.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, tickMarks: 1 },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, tickMarks: 1 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_isosceles_equilateral",
    titleArabic: "مثلث ABC بزوايا 30° و 40° مجاور للمتساوي الساقين CAD لحساب زاوية D = 70° و CAD = 40°",
    notationLanguage: notation,
    vertices: [vA, vD, vC, vB],
    segments,
    angles: [
      { id: `${opts.figureId}_angBAC`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vC.id, degrees: 30, degreesLabel: "30°" },
      { id: `${opts.figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degrees: 40, degreesLabel: "40°" },
    ],
  };
}

/**
 * مسألة 7 ص 241: مثلث متساوي الأضلاع ABC مع C منتصف BD (BC=CD) لإثبات AD ⊥ BA
 */
export function buildEquilateralWithExtendedBaseRightAngleFigure(
  opts: PrepGrade2IsoscelesCompoundOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 7.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 8, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 4.5, y: 2 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 1, y: 2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 1 },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, tickMarks: 1 },
    { id: `${opts.figureId}_sBC`, fromVertexId: vC.id, toVertexId: vB.id, tickMarks: 1 },
    { id: `${opts.figureId}_sCD`, fromVertexId: vD.id, toVertexId: vC.id, tickMarks: 1 },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_isosceles_equilateral",
    titleArabic: "مثلث متساوي الأضلاع ABC مع BC = CD لإثبات تعامد AD ⊥ BA",
    notationLanguage: notation,
    vertices: [vA, vD, vC, vB],
    segments,
    angles: [],
  };
}
