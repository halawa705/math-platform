/**
 * @file prep-grade2-isosceles-proof-quadrilaterals-builder.ts
 * @description منشئ أشكال براهين المثلث المتساوي الساقين والأشكال الرباعية ومنصفات الزوايا (2ع).
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

export interface PrepGrade2IsoscelesProofOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 8 ص 242: شكل رباعي ABCD فيه DA // CB و AB = AD مع زاوية A = 120° و BDC = 65° لإيجاد ∠ADB = 30° و ∠C = 85°
 */
export function buildIsoscelesInTrapezoidDABCBFigure(
  opts: PrepGrade2IsoscelesProofOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 1, y: 7 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5.5, y: 7 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 8, y: 1.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 1, y: 1.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id, parallelArrows: 1, tickMarks: 1 },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 1 },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDB`, fromVertexId: vD.id, toVertexId: vB.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_trapezoid_with_altitudes",
    titleArabic: "شكل رباعي ABCD فيه DA // CB و AB = AD وزوايا 120° و 65° لحساب زاوية C = 85°",
    notationLanguage: notation,
    vertices: [vD, vA, vB, vC],
    segments,
    angles: [
      { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vD.id, arm2VertexId: vB.id, degrees: 120, degreesLabel: "120°" },
      { id: `${opts.figureId}_angBDC`, vertexId: vD.id, arm1VertexId: vB.id, arm2VertexId: vC.id, degrees: 65, degreesLabel: "65°" },
    ],
  };
}

/**
 * مسألة 17 ص 244: مثلث متساوي الساقين ABC (AB=AC, ∠A=72°) ومنصفا زاويتي القاعدة BD و CD لإثبات أن DBC متساوي الساقين
 */
export function buildIsoscelesBaseAngleBisectorsFigure(
  opts: PrepGrade2IsoscelesProofOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1.5, y: 1.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 8.5, y: 1.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 5, y: 3.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 1 },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, tickMarks: 1 },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sBD`, fromVertexId: vB.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_isosceles_equilateral",
    titleArabic: "مثلث متساوي الساقين ABC بزاوية رأس 72° ومنصفا زاويتي القاعدة لإثبات DBC متساوي الساقين",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD],
    segments,
    angles: [
      { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vC.id, degrees: 72, degreesLabel: "72°" },
    ],
  };
}

/**
 * مسألة 19 ص 244: مثلثان قائمان ACB و ADB مشتركان في الوتر AB مع منتصف E لإثبات أن المثلث DEC متساوي الساقين
 */
export function buildTwoRightTrianglesSharedHypotenuseDECFigure(
  opts: PrepGrade2IsoscelesProofOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 1, y: 1.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 9, y: 1.5 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 5, y: 1.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 3, y: 7.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 7, y: 7.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDB`, fromVertexId: vD.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCB`, fromVertexId: vC.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id },
    // متوسطا المثلثين القائمين
    { id: `${opts.figureId}_sED`, fromVertexId: vE.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sEC`, fromVertexId: vE.id, toVertexId: vC.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_isosceles_equilateral",
    titleArabic: "مثلثان قائمان بوتر مشترك AB ومنتصف E لإثبات أن المثلث DEC متساوي الساقين",
    notationLanguage: notation,
    vertices: [vA, vE, vB, vC, vD],
    segments,
    angles: [
      { id: `${opts.figureId}_angADB`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vB.id, isRightAngle: true },
      { id: `${opts.figureId}_angACB`, vertexId: vC.id, arm1VertexId: vA.id, arm2VertexId: vB.id, isRightAngle: true },
    ],
  };
}

/**
 * مسألة 10 ص 242: مثلث ABC فيه BD = DC و AB = AD لإثبات أن ∠ABC = 3 ∠C
 */
export function buildTriangleTripleAngleProofFigure(
  opts: PrepGrade2IsoscelesProofOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 7, y: 7.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 8, y: 1.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 1, y: 1.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 4.5, y: 4.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 1 },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, tickMarks: 1 },
    { id: `${opts.figureId}_sBD`, fromVertexId: vB.id, toVertexId: vD.id, tickMarks: 2 },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id, tickMarks: 2 },
    { id: `${opts.figureId}_sCB`, fromVertexId: vC.id, toVertexId: vB.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_isosceles_equilateral",
    titleArabic: "مثلث ABC فيه BD = DC و AB = AD لإثبات أن قياس ABC = 3 قياس C",
    notationLanguage: notation,
    vertices: [vA, vD, vC, vB],
    segments,
    angles: [],
  };
}
