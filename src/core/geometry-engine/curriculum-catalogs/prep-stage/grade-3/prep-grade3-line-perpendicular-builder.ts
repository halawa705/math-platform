/**
 * @file prep-grade3-line-perpendicular-builder.ts
 * @description منشئ أشكال المستقيمات المتعامدة والمثلثات القائمة في المستوى الإحداثي للصف الثالث الإعدادي:
 * - مستقيمان متعامدان L1 ⊥ L2 مع معادلة 2X - y + 2 = 0 (مسألة 24).
 * - مثلث قائم الزاوية في B حيث AB ⊥ BC والنقطة C على محور السينات (مسألة 26).
 * - مثلث OAB قائم في A مع OB = 6 و AB = 3 في المستوى الإحداثي (مسألة 38).
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

export const MODULE_ID_PREP_GRADE3_LINE_PERPENDICULAR_BUILDER =
  "prep_grade3_line_perpendicular_builder" as const;

export interface PrepGrade3LinePerpendicularOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 24: مستقيمان متعامدان L1 ⊥ L2 عند النقطة A(0, 2)
 */
export function buildPerpendicularLinesAtYAxisFigure(
  opts: PrepGrade3LinePerpendicularOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vO: CanonicalVertexNode = { id: `${opts.figureId}_vO`, label: localizeGeometricVertexLabelSSOT("و", notation), position: { x: 0, y: 0 } };
  const vX: CanonicalVertexNode = { id: `${opts.figureId}_vX`, label: notation === "english" ? "X" : "س", position: { x: 6, y: 0 } };
  const vXneg: CanonicalVertexNode = { id: `${opts.figureId}_vXneg`, label: "", position: { x: -2.5, y: 0 } };
  const vY: CanonicalVertexNode = { id: `${opts.figureId}_vY`, label: notation === "english" ? "y" : "ص", position: { x: 0, y: 5 } };
  const vYneg: CanonicalVertexNode = { id: `${opts.figureId}_vYneg`, label: "", position: { x: 0, y: -1.5 } };

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 0, y: 2 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: -1, y: 0 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 4, y: 0 } };

  const vL1Top: CanonicalVertexNode = { id: `${opts.figureId}_vL1T`, label: notation === "english" ? "L1" : "ل١", position: { x: 0.5, y: 3 } };
  const vL1Bot: CanonicalVertexNode = { id: `${opts.figureId}_vL1B`, label: "", position: { x: -1.5, y: -1 } };
  const vL2Top: CanonicalVertexNode = { id: `${opts.figureId}_vL2T`, label: notation === "english" ? "L2" : "ل٢", position: { x: -1.8, y: 2.9 } };
  const vL2Bot: CanonicalVertexNode = { id: `${opts.figureId}_vL2B`, label: "", position: { x: 5.2, y: -0.6 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sX`, fromVertexId: vXneg.id, toVertexId: vX.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sY`, fromVertexId: vYneg.id, toVertexId: vY.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sL1`, fromVertexId: vL1Bot.id, toVertexId: vL1Top.id },
    { id: `${opts.figureId}_sL2`, fromVertexId: vL2Top.id, toVertexId: vL2Bot.id },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aPerpA`, vertexId: vA.id, arm1VertexId: vL1Top.id, arm2VertexId: vC.id, isRightAngle: true },
  ];

  return {
    figureId: opts.figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: "مستقيمان متعامدان L1 ⊥ L2 ومعادلة L1 هي 2X - y + 2 = 0",
    notationLanguage: notation,
    vertices: [vXneg, vB, vO, vC, vX, vYneg, vA, vY, vL1Top, vL1Bot, vL2Top, vL2Bot],
    segments,
    angles,
  };
}

/**
 * مسألة 26: مثلث قائم في B حيث A(-4, -3) و B(2, 3) و C على محور السينات و AB ⊥ BC
 */
export function buildPerpendicularSegmentsABCFigure(
  opts: PrepGrade3LinePerpendicularOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vO: CanonicalVertexNode = { id: `${opts.figureId}_vO`, label: localizeGeometricVertexLabelSSOT("و", notation), position: { x: 0, y: 0 } };
  const vX: CanonicalVertexNode = { id: `${opts.figureId}_vX`, label: notation === "english" ? "X" : "س", position: { x: 7, y: 0 } };
  const vXneg: CanonicalVertexNode = { id: `${opts.figureId}_vXneg`, label: "", position: { x: -5.5, y: 0 } };
  const vY: CanonicalVertexNode = { id: `${opts.figureId}_vY`, label: notation === "english" ? "y" : "ص", position: { x: 0, y: 4.5 } };
  const vYneg: CanonicalVertexNode = { id: `${opts.figureId}_vYneg`, label: "", position: { x: 0, y: -4.5 } };

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: notation === "english" ? "A(-4,-3)" : "أ(-٤، -٣)", position: { x: -4, y: -3 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: notation === "english" ? "B(2,3)" : "ب(٢، ٣)", position: { x: 2, y: 3 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 5, y: 0 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sX`, fromVertexId: vXneg.id, toVertexId: vX.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sY`, fromVertexId: vYneg.id, toVertexId: vY.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true },
  ];

  return {
    figureId: opts.figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: "مثلث ABC قائم في B مع A(-4,-3) و B(2,3) و C على محور السينات",
    notationLanguage: notation,
    vertices: [vXneg, vA, vO, vC, vX, vYneg, vB, vY],
    segments,
    angles,
  };
}

/**
 * مسألة 38: مثلث OAB قائم في A مع OB = 6 و AB = 3 في المستوى الإحداثي
 */
export function buildRightTriangleOnAxesFigure(
  opts: PrepGrade3LinePerpendicularOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vO: CanonicalVertexNode = { id: `${opts.figureId}_vO`, label: localizeGeometricVertexLabelSSOT("و", notation), position: { x: 0, y: 0 } };
  const vX: CanonicalVertexNode = { id: `${opts.figureId}_vX`, label: notation === "english" ? "X" : "س", position: { x: 8, y: 0 } };
  const vXneg: CanonicalVertexNode = { id: `${opts.figureId}_vXneg`, label: "", position: { x: -1.5, y: 0 } };
  const vY: CanonicalVertexNode = { id: `${opts.figureId}_vY`, label: notation === "english" ? "y" : "ص", position: { x: 0, y: 5 } };
  const vYneg: CanonicalVertexNode = { id: `${opts.figureId}_vYneg`, label: "", position: { x: 0, y: -1.5 } };

  // النقطة B على محور السينات عند x = 6
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 6, y: 0 } };
  // في المثلث القائم 30-60: الزاوية عند O قياسها 30°، الوتر OB = 6 والضلع المقابل AB = 3
  // إذن A(3√3 / 2 * something): x = 6 * cos^2(30°) = 4.5, y = 6 * cos(30°)*sin(30°) = 2.598 ≈ 2.6
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 4.5, y: 2.6 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sX`, fromVertexId: vXneg.id, toVertexId: vX.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sY`, fromVertexId: vYneg.id, toVertexId: vY.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sOA`, fromVertexId: vO.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: 3 } },
    { id: `${opts.figureId}_sOB`, fromVertexId: vO.id, toVertexId: vB.id, lengthLabel: { value: 6 } },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aA`, vertexId: vA.id, arm1VertexId: vO.id, arm2VertexId: vB.id, isRightAngle: true },
  ];

  return {
    figureId: opts.figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: "مثلث OAB قائم في A حيث BO = 6 و AB = 3 لإيجاد معادلة AO",
    notationLanguage: notation,
    vertices: [vXneg, vO, vA, vB, vX, vYneg, vY],
    segments,
    angles,
  };
}
