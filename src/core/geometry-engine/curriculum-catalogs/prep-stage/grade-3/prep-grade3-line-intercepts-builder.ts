/**
 * @file prep-grade3-line-intercepts-builder.ts
 * @description منشئ أشكال معادلة الخط المستقيم المعتمدة على الأجزاء المقطوعة ومساحة المثلث وزاوية الميل:
 * - مستقيم يقطع من المحورين جزأين متساويين ويمر بنقطة (مسألة 21).
 * - مستقيم يصنع مثلثاً AOB مساحته 9 وحدات مع المحورين (مسألة 36).
 * - مستقيم يقطع المحورين بزاوية ميل θ مع الاتجاه الموجب للسينات (مسألة 35).
 * - مستقيم يقطع الصادات في A(0,8) وظل زاوية ميله معلوم (مسألة 25).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
  CanonicalAngleNode,
} from "../../../../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  type MathNotationLanguage,
} from "../../../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_PREP_GRADE3_LINE_INTERCEPTS_BUILDER =
  "prep_grade3_line_intercepts_builder" as const;

export interface PrepGrade3LineFigureOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 21: مستقيم يقطع من محوري الإحداثيات جزأين متساويين ويمر بالنقطة (2، 3)
 */
export function buildLineEqualInterceptsAOBFigure(
  opts: PrepGrade3LineFigureOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vO: CanonicalVertexNode = { id: `${opts.figureId}_vO`, label: localizeGeometricVertexLabelSSOT("و", notation), position: { x: 0, y: 0 } };
  const vX: CanonicalVertexNode = { id: `${opts.figureId}_vX`, label: notation === "english" ? "X" : "س", position: { x: 8, y: 0 } };
  const vXneg: CanonicalVertexNode = { id: `${opts.figureId}_vXneg`, label: "", position: { x: -2, y: 0 } };
  const vY: CanonicalVertexNode = { id: `${opts.figureId}_vY`, label: notation === "english" ? "y" : "ص", position: { x: 0, y: 8 } };
  const vYneg: CanonicalVertexNode = { id: `${opts.figureId}_vYneg`, label: "", position: { x: 0, y: -2 } };

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 0, y: 5.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 5.5, y: 0 } };
  const vLineTop: CanonicalVertexNode = { id: `${opts.figureId}_vTop`, label: "", position: { x: -1, y: 6.5 } };
  const vLineBottom: CanonicalVertexNode = { id: `${opts.figureId}_vBottom`, label: "", position: { x: 6.8, y: -1.3 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sX`, fromVertexId: vXneg.id, toVertexId: vX.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sY`, fromVertexId: vYneg.id, toVertexId: vY.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sAB`, fromVertexId: vLineTop.id, toVertexId: vLineBottom.id },
    { id: `${opts.figureId}_sOA`, fromVertexId: vO.id, toVertexId: vA.id, tickMarks: 1 },
    { id: `${opts.figureId}_sOB`, fromVertexId: vO.id, toVertexId: vB.id, tickMarks: 1 },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aO`, vertexId: vO.id, arm1VertexId: vA.id, arm2VertexId: vB.id, isRightAngle: true },
  ];

  return {
    figureId: opts.figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: "مستقيم يقطع من المحورين جزأين متساويين ويمر بالنقطة (2، 3)",
    notationLanguage: notation,
    vertices: [vXneg, vO, vB, vX, vYneg, vA, vY, vLineTop, vLineBottom],
    segments,
    angles,
  };
}

/**
 * مسألة 36: مساحة المثلث AOB تساوي 9 وحدات مربعة مع النقطة A(0, 6)
 */
export function buildLineTriangleAreaAOBFigure(
  opts: PrepGrade3LineFigureOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vO: CanonicalVertexNode = { id: `${opts.figureId}_vO`, label: localizeGeometricVertexLabelSSOT("و", notation), position: { x: 0, y: 0 } };
  const vX: CanonicalVertexNode = { id: `${opts.figureId}_vX`, label: notation === "english" ? "X" : "س", position: { x: 6, y: 0 } };
  const vXneg: CanonicalVertexNode = { id: `${opts.figureId}_vXneg`, label: "", position: { x: -1.5, y: 0 } };
  const vY: CanonicalVertexNode = { id: `${opts.figureId}_vY`, label: notation === "english" ? "y" : "ص", position: { x: 0, y: 8 } };
  const vYneg: CanonicalVertexNode = { id: `${opts.figureId}_vYneg`, label: "", position: { x: 0, y: -1.5 } };

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: notation === "english" ? "A(0,6)" : "أ(٠، ٦)", position: { x: 0, y: 6 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 3, y: 0 } };
  const vTop: CanonicalVertexNode = { id: `${opts.figureId}_vTop`, label: "", position: { x: -0.6, y: 7.2 } };
  const vBottom: CanonicalVertexNode = { id: `${opts.figureId}_vBottom`, label: "", position: { x: 4, y: -2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sX`, fromVertexId: vXneg.id, toVertexId: vX.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sY`, fromVertexId: vYneg.id, toVertexId: vY.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sLine`, fromVertexId: vTop.id, toVertexId: vBottom.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: "مستقيم يقطع المحورين ومساحة المثلث AOB تساوي 9 وحدات",
    notationLanguage: notation,
    vertices: [vXneg, vO, vB, vX, vYneg, vA, vY, vTop, vBottom],
    segments,
    angles: [
      { id: `${opts.figureId}_aO`, vertexId: vO.id, arm1VertexId: vA.id, arm2VertexId: vB.id, isRightAngle: true },
    ],
  };
}

/**
 * مسألة 35: مستقيم يقطع المحورين بزاوية θ مع الاتجاه الموجب للسينات (2y = X - 4)
 */
export function buildLineAngleThetaFigure(
  opts: PrepGrade3LineFigureOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vO: CanonicalVertexNode = { id: `${opts.figureId}_vO`, label: localizeGeometricVertexLabelSSOT("و", notation), position: { x: 0, y: 0 } };
  const vX: CanonicalVertexNode = { id: `${opts.figureId}_vX`, label: notation === "english" ? "X" : "س", position: { x: 7, y: 0 } };
  const vXneg: CanonicalVertexNode = { id: `${opts.figureId}_vXneg`, label: "", position: { x: -2, y: 0 } };
  const vY: CanonicalVertexNode = { id: `${opts.figureId}_vY`, label: notation === "english" ? "y" : "ص", position: { x: 0, y: 3.5 } };
  const vYneg: CanonicalVertexNode = { id: `${opts.figureId}_vYneg`, label: "", position: { x: 0, y: -4 } };

  const vInterceptX: CanonicalVertexNode = { id: `${opts.figureId}_vIntX`, label: "", position: { x: 4, y: 0 } };
  const vInterceptY: CanonicalVertexNode = { id: `${opts.figureId}_vIntY`, label: "", position: { x: 0, y: -2 } };
  const vLineStart: CanonicalVertexNode = { id: `${opts.figureId}_vL1`, label: notation === "english" ? "L" : "ل", position: { x: 6, y: 1 } };
  const vLineEnd: CanonicalVertexNode = { id: `${opts.figureId}_vL2`, label: "", position: { x: -1.5, y: -2.75 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sX`, fromVertexId: vXneg.id, toVertexId: vX.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sY`, fromVertexId: vYneg.id, toVertexId: vY.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sLine`, fromVertexId: vLineEnd.id, toVertexId: vLineStart.id },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aTheta`, vertexId: vInterceptX.id, arm1VertexId: vX.id, arm2VertexId: vLineStart.id, degreesLabel: "θ", markSymbol: "arc" },
  ];

  return {
    figureId: opts.figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: "مستقيم 2y = X - 4 وزاوية ميله θ مع الاتجاه الموجب لمحور السينات",
    notationLanguage: notation,
    vertices: [vXneg, vO, vInterceptX, vX, vYneg, vInterceptY, vY, vLineStart, vLineEnd],
    segments,
    angles,
  };
}

/**
 * مسألة 25: مستقيم AB يقطع الصادات في A(0,8) وظل الزاوية ABO = 4/3
 */
export function buildLineTangentAngleABOFigure(
  opts: PrepGrade3LineFigureOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vO: CanonicalVertexNode = { id: `${opts.figureId}_vO`, label: localizeGeometricVertexLabelSSOT("و", notation), position: { x: 0, y: 0 } };
  const vX: CanonicalVertexNode = { id: `${opts.figureId}_vX`, label: notation === "english" ? "x" : "س", position: { x: 8, y: 0 } };
  const vXneg: CanonicalVertexNode = { id: `${opts.figureId}_vXneg`, label: "", position: { x: -1.5, y: 0 } };
  const vY: CanonicalVertexNode = { id: `${opts.figureId}_vY`, label: notation === "english" ? "y" : "ص", position: { x: 0, y: 9.5 } };
  const vYneg: CanonicalVertexNode = { id: `${opts.figureId}_vYneg`, label: "", position: { x: 0, y: -1.5 } };

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: notation === "english" ? "A(0,8)" : "أ(٠، ٨)", position: { x: 0, y: 8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 6, y: 0 } };
  const vTop: CanonicalVertexNode = { id: `${opts.figureId}_vTop`, label: "", position: { x: -0.7, y: 8.9 } };
  const vBottom: CanonicalVertexNode = { id: `${opts.figureId}_vBottom`, label: "", position: { x: 7.2, y: -1.6 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sX`, fromVertexId: vXneg.id, toVertexId: vX.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sY`, fromVertexId: vYneg.id, toVertexId: vY.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sAB`, fromVertexId: vTop.id, toVertexId: vBottom.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: "مستقيم AB يقطع الصادات في A(0,8) وظل الزاوية ABO يساوي 4/3",
    notationLanguage: notation,
    vertices: [vXneg, vO, vB, vX, vYneg, vA, vY, vTop, vBottom],
    segments,
    angles: [
      { id: `${opts.figureId}_aO`, vertexId: vO.id, arm1VertexId: vA.id, arm2VertexId: vB.id, isRightAngle: true },
      { id: `${opts.figureId}_aB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vO.id, markSymbol: "arc" },
    ],
  };
}
