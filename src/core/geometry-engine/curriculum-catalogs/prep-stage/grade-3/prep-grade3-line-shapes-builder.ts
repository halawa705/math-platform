/**
 * @file prep-grade3-line-shapes-builder.ts
 * @description منشئ أشكال الأشكال الهندسية المنتظمة في المستوى الإحداثي (مثلث متساوي الأضلاع، معين، مربع):
 * - مثلث متساوي الأضلاع ABO مع C منتصف AB ومعادلة OC (مسألة 22).
 * - معين OADB رؤوسه O(0,0) و A(2,6) و B(6,2) و D(8,8) والقطر OD (مسألة 23).
 * - مربع OABC طول ضلعه 4 لإيجاد معادلة القطر AC (مسألة 37).
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

export const MODULE_ID_PREP_GRADE3_LINE_SHAPES_BUILDER =
  "prep_grade3_line_shapes_builder" as const;

export interface PrepGrade3LineShapesOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 22: مثلث متساوي الأضلاع ABO في المستوى الإحداثي مع C منتصف AB
 */
export function buildEquilateralTriangleOnAxisFigure(
  opts: PrepGrade3LineShapesOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vO: CanonicalVertexNode = { id: `${opts.figureId}_vO`, label: localizeGeometricVertexLabelSSOT("و", notation), position: { x: 0, y: 0 } };
  const vX: CanonicalVertexNode = { id: `${opts.figureId}_vX`, label: notation === "english" ? "X" : "س", position: { x: 8, y: 0 } };
  const vXneg: CanonicalVertexNode = { id: `${opts.figureId}_vXneg`, label: "", position: { x: -1.5, y: 0 } };
  const vY: CanonicalVertexNode = { id: `${opts.figureId}_vY`, label: notation === "english" ? "y" : "ص", position: { x: 0, y: 7 } };
  const vYneg: CanonicalVertexNode = { id: `${opts.figureId}_vYneg`, label: "", position: { x: 0, y: -1.5 } };

  // الضلع OB على محور السينات بطول 6، والرأس A بزاوية 60°
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 6, y: 0 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 3, y: 5.2 } };
  // النقطة C منتصف AB: (4.5, 2.6)
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 4.5, y: 2.6 } };
  const vRayEnd: CanonicalVertexNode = { id: `${opts.figureId}_vRayEnd`, label: "", position: { x: 6.75, y: 3.9 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sX`, fromVertexId: vXneg.id, toVertexId: vX.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sY`, fromVertexId: vYneg.id, toVertexId: vY.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sOA`, fromVertexId: vO.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sOB`, fromVertexId: vO.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, tickMarks: 2 },
    { id: `${opts.figureId}_sCB`, fromVertexId: vC.id, toVertexId: vB.id, tickMarks: 2 },
    { id: `${opts.figureId}_sOC`, fromVertexId: vO.id, toVertexId: vRayEnd.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: "مثلث متساوي الأضلاع ABO في المستوى مع C منتصف AB ومعادلة OC",
    notationLanguage: notation,
    vertices: [vXneg, vO, vB, vX, vYneg, vA, vY, vC, vRayEnd],
    segments,
    angles: [],
  };
}

/**
 * مسألة 23: معين OADB رؤوسه O(0,0) و A(2,6) و B(6,2) و D(8,8) والقطر OD
 */
export function buildRhombusInCoordinatePlaneFigure(
  opts: PrepGrade3LineShapesOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vO: CanonicalVertexNode = { id: `${opts.figureId}_vO`, label: localizeGeometricVertexLabelSSOT("و", notation), position: { x: 0, y: 0 } };
  const vX: CanonicalVertexNode = { id: `${opts.figureId}_vX`, label: notation === "english" ? "X" : "س", position: { x: 10, y: 0 } };
  const vH: CanonicalVertexNode = { id: `${opts.figureId}_vH`, label: notation === "english" ? "H" : "هـ", position: { x: -2.5, y: 0 } };
  const vY: CanonicalVertexNode = { id: `${opts.figureId}_vY`, label: notation === "english" ? "y" : "ص", position: { x: 0, y: 10 } };
  const vYneg: CanonicalVertexNode = { id: `${opts.figureId}_vYneg`, label: "", position: { x: 0, y: -2 } };

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: notation === "english" ? "A(2,6)" : "أ(٢، ٦)", position: { x: 2, y: 6 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: notation === "english" ? "B(6,2)" : "ب(٦، ٢)", position: { x: 6, y: 2 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 8, y: 8 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sX`, fromVertexId: vH.id, toVertexId: vX.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sY`, fromVertexId: vYneg.id, toVertexId: vY.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sOA`, fromVertexId: vO.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDB`, fromVertexId: vD.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBO`, fromVertexId: vB.id, toVertexId: vO.id },
    { id: `${opts.figureId}_sOD`, fromVertexId: vO.id, toVertexId: vD.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: "معين OADB رؤوسه O(0,0) و A(2,6) و B(6,2) و D لإيجاد معادلة OD",
    notationLanguage: notation,
    vertices: [vH, vO, vX, vYneg, vA, vB, vD, vY],
    segments,
    angles: [],
  };
}

/**
 * مسألة 37: مربع OABC طول ضلعه 4 سم ومعادلة القطر AC
 */
export function buildSquareDiagonalLineFigure(
  opts: PrepGrade3LineShapesOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vO: CanonicalVertexNode = { id: `${opts.figureId}_vO`, label: localizeGeometricVertexLabelSSOT("و", notation), position: { x: 0, y: 0 } };
  const vX: CanonicalVertexNode = { id: `${opts.figureId}_vX`, label: notation === "english" ? "X" : "س", position: { x: 6.5, y: 0 } };
  const vXneg: CanonicalVertexNode = { id: `${opts.figureId}_vXneg`, label: "", position: { x: -1.5, y: 0 } };
  const vY: CanonicalVertexNode = { id: `${opts.figureId}_vY`, label: notation === "english" ? "y" : "ص", position: { x: 0, y: 6.5 } };
  const vYneg: CanonicalVertexNode = { id: `${opts.figureId}_vYneg`, label: "", position: { x: 0, y: -1.5 } };

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 4, y: 0 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 0, y: 4 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 4, y: 4 } };

  const vLineTop: CanonicalVertexNode = { id: `${opts.figureId}_vLT`, label: "", position: { x: -1, y: 5 } };
  const vLineBot: CanonicalVertexNode = { id: `${opts.figureId}_vLB`, label: "", position: { x: 5, y: -1 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sX`, fromVertexId: vXneg.id, toVertexId: vX.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sY`, fromVertexId: vYneg.id, toVertexId: vY.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sOA`, fromVertexId: vO.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCO`, fromVertexId: vC.id, toVertexId: vO.id },
    { id: `${opts.figureId}_sACLine`, fromVertexId: vLineTop.id, toVertexId: vLineBot.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: "مربع OABC طول ضلعه 4 سم ومعادلة القطر AC",
    notationLanguage: notation,
    vertices: [vXneg, vO, vA, vX, vYneg, vC, vY, vB, vLineTop, vLineBot],
    segments,
    angles: [
      { id: `${opts.figureId}_aO`, vertexId: vO.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true },
    ],
  };
}
