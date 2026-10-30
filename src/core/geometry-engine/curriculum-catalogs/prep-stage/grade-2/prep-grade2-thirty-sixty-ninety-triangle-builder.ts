/**
 * @file prep-grade2-thirty-sixty-ninety-triangle-builder.ts
 * @description منشئ أشكال المثلث الثلاثيني الستيني 30°-60°-90° والضلع المقابل لزاوية 30° ومسائله (2ع).
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

export interface PrepGrade2ThirtySixtyOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 19 ص 259: مثلث ثلاثيني ستيني قائم في B بزاوية 30° ووتر 16 سم وضلع (5X-2) لإيجاد X = 2 ومساحة 32√3
 */
export function buildThirtySixtyNinetyAlgebraicHypotenuseFigure(
  opts: PrepGrade2ThirtySixtyOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 2, y: 7.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 2, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 9.5, y: 2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: "5X - 2" } },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, lengthLabel: { value: 16, unit: "سم" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_right_pythagoras",
    titleArabic: "مثلث ثلاثيني ستيني قائم في B بزاوية 30° ووتر 16 سم لإيجاد X = 2 ومساحة 32√3 سم²",
    notationLanguage: notation,
    vertices: [vA, vB, vC],
    segments,
    angles: [
      { id: `${opts.figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true },
      { id: `${opts.figureId}_angC`, vertexId: vC.id, arm1VertexId: vA.id, arm2VertexId: vB.id, degrees: 30, degreesLabel: "30°" },
    ],
  };
}

/**
 * مسألة 20 ص 259: مثلث ثلاثيني ستيني ABC قائم في B بزاوية 30° ومثلث ADC بقطعة FE = 6 سم لإيجاد BC = 6 سم
 */
export function buildThirtySixtyNinetySharedHypotenuseMidsegmentFigure(
  opts: PrepGrade2ThirtySixtyOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 2, y: 2 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 8, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 8, y: 5.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 2, y: 8 } };

  // E منتصف DC، F منتصف DA
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 5, y: 6.75 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: notation === "english" ? "F" : "و", position: { x: 2, y: 5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: 6, unit: "سم" } },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sFE`, fromVertexId: vF.id, toVertexId: vE.id, lengthLabel: { value: 6, unit: "سم" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_right_pythagoras",
    titleArabic: "مثلث ثلاثيني ستيني ABC بزاوية 30° ومثلث ADC بقطعة FE = 6 سم لحساب BC = 6 سم",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vE, vD, vF],
    segments,
    angles: [
      { id: `${opts.figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true },
      { id: `${opts.figureId}_angCAB`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vC.id, degrees: 30, degreesLabel: "30°" },
    ],
  };
}

/**
 * مسألة 23 ص 259: مثلث ثلاثيني ستيني ABC فيه C = 30° و AC = 12 سم والمتوسطان يلتقيان في G لإيجاد AB = 6 و EG = 2 سم
 */
export function buildThirtySixtyNinetyMediansGFigure(
  opts: PrepGrade2ThirtySixtyOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 8, y: 8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 8, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 1.5, y: 2 } };

  // D منتصف BC، E منتصف AC
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 4.75, y: 2 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 4.75, y: 5 } };
  // G نقطة تقاطع المتوسطين
  const vG: CanonicalVertexNode = { id: `${opts.figureId}_vG`, label: notation === "english" ? "G" : "م", position: { x: 5.83, y: 4 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: 6, unit: "سم" } },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, lengthLabel: { value: 12, unit: "سم" } },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sBE`, fromVertexId: vB.id, toVertexId: vE.id },
    { id: `${opts.figureId}_sEG`, fromVertexId: vE.id, toVertexId: vG.id, lengthLabel: { value: 2, unit: "سم" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_right_pythagoras",
    titleArabic: "مثلث ثلاثيني ستيني بوتر 12 سم ومتوسطين يلتقيان في G لإيجاد AB = 6 و EG = 2 سم",
    notationLanguage: notation,
    vertices: [vA, vE, vC, vD, vB, vG],
    segments,
    angles: [
      { id: `${opts.figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true },
      { id: `${opts.figureId}_angC`, vertexId: vC.id, arm1VertexId: vA.id, arm2VertexId: vB.id, degrees: 30, degreesLabel: "30°" },
    ],
  };
}

/**
 * مسألة 22 ص 259: متساوي الساقين AB = AC مع ارتفاع AD ⊥ BC وزاوية BAD = 30° و BC = 9 سم لإيجاد AD = 9/2 √3
 */
export function buildIsoscelesAltitudeThirtyDegreeFigure(
  opts: PrepGrade2ThirtySixtyOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 8.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 1.5, y: 1.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 8.5, y: 1.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 5, y: 1.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 1 },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, tickMarks: 1 },
    { id: `${opts.figureId}_sCB`, fromVertexId: vC.id, toVertexId: vB.id, lengthLabel: { value: 9, unit: "سم" } },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_isosceles_equilateral",
    titleArabic: "مثلث متساوي الساقين بارتفاع AD ⊥ BC وزاوية 30° وقاعدة 9 سم لحساب الارتفاع 9/2 √3 سم",
    notationLanguage: notation,
    vertices: [vA, vC, vD, vB],
    segments,
    angles: [
      { id: `${opts.figureId}_angADB`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vB.id, isRightAngle: true },
      { id: `${opts.figureId}_angBAD`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vD.id, degrees: 30, degreesLabel: "30°" },
    ],
  };
}
