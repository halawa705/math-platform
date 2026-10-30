/**
 * @file prep-grade2-isosceles-angles-algebraic-builder.ts
 * @description منشئ أشكال المثلث المتساوي الساقين بالزوايا والمجاهيل الجبرية ومنصف الزاوية الخارجة (2ع).
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

export interface PrepGrade2IsoscelesAnglesOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 11 ص 242: مثلث متساوي الساقين AB = AC بزوايا جبرية (2X+13)° و (3X-17)° لحساب 73° و 34°
 */
export function buildIsoscelesAlgebraicAnglesFigure(
  opts: PrepGrade2IsoscelesAnglesOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 8.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 2, y: 1.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 8, y: 1.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 1 },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, tickMarks: 1 },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_isosceles_equilateral",
    titleArabic: "مثلث متساوي الساقين بزوايا جبرية (2X+13)° و (3X-17)° وزوايا 73° و 73° و 34°",
    notationLanguage: notation,
    vertices: [vA, vB, vC],
    segments,
    angles: [
      { id: `${opts.figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degreesLabel: "(2X+13)°" },
      { id: `${opts.figureId}_angC`, vertexId: vC.id, arm1VertexId: vA.id, arm2VertexId: vB.id, degreesLabel: "(3X-17)°" },
    ],
  };
}

/**
 * مسألة 9 ص 242: منصف الزاوية الخارجة عند الرأس AE // BC لمثلث متساوي الساقين AB = AC
 */
export function buildIsoscelesExteriorBisectorFigure(
  opts: PrepGrade2IsoscelesAnglesOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 7, y: 1.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 3, y: 1.5 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 5.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 3.5, y: 8.5 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 1, y: 5.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 1 },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, tickMarks: 1 },
    { id: `${opts.figureId}_sBC`, fromVertexId: vC.id, toVertexId: vB.id, parallelArrows: 1 },
    // الامتداد BD
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id },
    // الشعاع الموازي AE // BC
    { id: `${opts.figureId}_sAE`, fromVertexId: vA.id, toVertexId: vE.id, parallelArrows: 1 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_isosceles_equilateral",
    titleArabic: "مثلث متساوي الساقين AB = AC وشعاع AE // BC ينصف الزاوية الخارجة DAC",
    notationLanguage: notation,
    vertices: [vB, vC, vA, vD, vE],
    segments,
    angles: [],
  };
}

/**
 * مسألة 15-3 ص 243: متساوي الساقين مع زاوية خارجية 120° وضلعين متساويين 12 سم و 4X سم (X = 3)
 */
export function buildIsoscelesExteriorAngle120Figure(
  opts: PrepGrade2IsoscelesAnglesOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 7.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 3.5, y: 2 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 8, y: 2 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 1, y: 2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, tickMarks: 1 },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: 12, unit: "سم" }, tickMarks: 1 },
    { id: `${opts.figureId}_sCB`, fromVertexId: vC.id, toVertexId: vB.id, lengthLabel: { value: "4X" } },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_isosceles_equilateral",
    titleArabic: "مثلث متساوي الساقين بزاوية خارجية 120° وضلعين 12 سم و 4X لإيجاد X = 3",
    notationLanguage: notation,
    vertices: [vA, vC, vB, vD],
    segments,
    angles: [
      { id: `${opts.figureId}_angExt120`, vertexId: vC.id, arm1VertexId: vD.id, arm2VertexId: vA.id, degrees: 120, degreesLabel: "120°" },
    ],
  };
}

/**
 * مسألة 15-9 ص 243: مثلث قائم متساوي الساقين 45°-45°-90° بوتر 5√2 سم لإيجاد الضلع X = 5 سم
 */
export function buildRightIsosceles45DegreeFigure(
  opts: PrepGrade2IsoscelesAnglesOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vT: CanonicalVertexNode = { id: `${opts.figureId}_vT`, label: notation === "english" ? "T" : "جـ", position: { x: 8, y: 2 } };
  const vS: CanonicalVertexNode = { id: `${opts.figureId}_vS`, label: notation === "english" ? "S" : "ب", position: { x: 2, y: 2 } };
  const vR: CanonicalVertexNode = { id: `${opts.figureId}_vR`, label: notation === "english" ? "R" : "أ", position: { x: 8, y: 8 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sST`, fromVertexId: vS.id, toVertexId: vT.id, lengthLabel: { value: "X" } },
    { id: `${opts.figureId}_sTR`, fromVertexId: vT.id, toVertexId: vR.id },
    { id: `${opts.figureId}_sSR`, fromVertexId: vS.id, toVertexId: vR.id, lengthLabel: { value: "5√2", unit: "سم" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_isosceles_equilateral",
    titleArabic: "مثلث قائم متساوي الساقين بزاوية 45° ووتر 5√2 سم لحساب الضلع X = 5 سم",
    notationLanguage: notation,
    vertices: [vS, vT, vR],
    segments,
    angles: [
      { id: `${opts.figureId}_angT`, vertexId: vT.id, arm1VertexId: vS.id, arm2VertexId: vR.id, isRightAngle: true },
      { id: `${opts.figureId}_angS`, vertexId: vS.id, arm1VertexId: vT.id, arm2VertexId: vR.id, degrees: 45, degreesLabel: "45°" },
    ],
  };
}
