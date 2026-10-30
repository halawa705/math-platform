/**
 * @file prep-grade1-concurrent-angles-around-point-builder.ts
 * @description منشئ أشكال الزوايا المتجمعة حول نقطة (مجموع قياساتها 360°) وحساب المجاهيل جبرياً (1ع).
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

export interface PrepGrade1ConcurrentAnglesOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 1-6 ص 174: أربع زوايا متجمعة حول M: 70° و 100° و 80° و 10X° لإيجاد X = 11°
 */
export function buildConcurrentAnglesFourWith10XFigure(opts: PrepGrade1ConcurrentAnglesOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vM: CanonicalVertexNode = { id: `${opts.figureId}_vM`, label: localizeGeometricVertexLabelSSOT("M", notation), position: { x: 5, y: 5 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 5, y: 1.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 8.5, y: 6.2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 2.8, y: 8.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 1.5, y: 4.8 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sMA`, fromVertexId: vM.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sMB`, fromVertexId: vM.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sMC`, fromVertexId: vM.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sMD`, fromVertexId: vM.id, toVertexId: vD.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_exterior_angle_extension",
    titleArabic: "زوايا متجمعة حول نقطة M: 70° و 100° و 80° و 10X° لإيجاد X = 11°",
    notationLanguage: notation,
    vertices: [vM, vA, vB, vC, vD],
    segments,
    angles: [
      { id: `${opts.figureId}_angDMC`, vertexId: vM.id, arm1VertexId: vD.id, arm2VertexId: vC.id, degrees: 70, degreesLabel: "70°" },
      { id: `${opts.figureId}_angBMC`, vertexId: vM.id, arm1VertexId: vC.id, arm2VertexId: vB.id, degrees: 100, degreesLabel: "100°" },
      { id: `${opts.figureId}_angBMA`, vertexId: vM.id, arm1VertexId: vB.id, arm2VertexId: vA.id, degreesLabel: "10X°" },
      { id: `${opts.figureId}_angDMA`, vertexId: vM.id, arm1VertexId: vA.id, arm2VertexId: vD.id, degrees: 80, degreesLabel: "80°" },
    ],
  };
}

/**
 * مسألة 1-8 ص 174: زاوية 140° وزاويتان متساويتان X° و X° متجمعة حول M لإيجاد X = 110°
 */
export function buildConcurrentAnglesThreeWith140Figure(opts: PrepGrade1ConcurrentAnglesOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vM: CanonicalVertexNode = { id: `${opts.figureId}_vM`, label: localizeGeometricVertexLabelSSOT("M", notation), position: { x: 5, y: 5 } };
  const v1: CanonicalVertexNode = { id: `${opts.figureId}_v1`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 8.8, y: 5 } };
  const v2: CanonicalVertexNode = { id: `${opts.figureId}_v2`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 2.2, y: 8.2 } };
  const v3: CanonicalVertexNode = { id: `${opts.figureId}_v3`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 2.5, y: 2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sM1`, fromVertexId: vM.id, toVertexId: v1.id },
    { id: `${opts.figureId}_sM2`, fromVertexId: vM.id, toVertexId: v2.id },
    { id: `${opts.figureId}_sM3`, fromVertexId: vM.id, toVertexId: v3.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_exterior_angle_extension",
    titleArabic: "ثلاث زوايا متجمعة حول نقطة M إحداها 140° واثنتان متساويتان X° لإيجاد X = 110°",
    notationLanguage: notation,
    vertices: [vM, v1, v2, v3],
    segments,
    angles: [
      { id: `${opts.figureId}_ang140`, vertexId: vM.id, arm1VertexId: v1.id, arm2VertexId: v2.id, degrees: 140, degreesLabel: "140°" },
      { id: `${opts.figureId}_angX1`, vertexId: vM.id, arm1VertexId: v2.id, arm2VertexId: v3.id, degreesLabel: "X°" },
      { id: `${opts.figureId}_angX2`, vertexId: vM.id, arm1VertexId: v3.id, arm2VertexId: v1.id, degreesLabel: "X°" },
    ],
  };
}

/**
 * مسألة 5 ص 175: BMC = 2 AMB مع AMB = 48° و DMC = 115° لحساب AMD = 101°
 */
export function buildConcurrentAnglesDoubleAngle101Figure(opts: PrepGrade1ConcurrentAnglesOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vM: CanonicalVertexNode = { id: `${opts.figureId}_vM`, label: localizeGeometricVertexLabelSSOT("M", notation), position: { x: 5, y: 5 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 8.8, y: 5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 7.2, y: 8 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 1.8, y: 6.2 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 3.5, y: 1.8 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sMA`, fromVertexId: vM.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sMB`, fromVertexId: vM.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sMC`, fromVertexId: vM.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sMD`, fromVertexId: vM.id, toVertexId: vD.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_exterior_angle_extension",
    titleArabic: "زوايا متجمعة حول M: AMB = 48° و BMC = 96° و DMC = 115° لحساب AMD = 101°",
    notationLanguage: notation,
    vertices: [vM, vA, vB, vC, vD],
    segments,
    angles: [
      { id: `${opts.figureId}_angAMB`, vertexId: vM.id, arm1VertexId: vA.id, arm2VertexId: vB.id, degrees: 48, degreesLabel: "48°" },
      { id: `${opts.figureId}_angBMC`, vertexId: vM.id, arm1VertexId: vB.id, arm2VertexId: vC.id, degrees: 96, degreesLabel: "2×48°" },
      { id: `${opts.figureId}_angDMC`, vertexId: vM.id, arm1VertexId: vC.id, arm2VertexId: vD.id, degrees: 115, degreesLabel: "115°" },
      { id: `${opts.figureId}_angAMD`, vertexId: vM.id, arm1VertexId: vD.id, arm2VertexId: vA.id, degreesLabel: "؟" },
    ],
  };
}

/**
 * مسألة 7-5 ص 176: زاوية قائمة 90° مع (3X-5)° و (4X+2)° و (3X+63)° لإيجاد X = 21°
 */
export function buildConcurrentAnglesAlgebraicWithRightAngleFigure(opts: PrepGrade1ConcurrentAnglesOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vM: CanonicalVertexNode = { id: `${opts.figureId}_vM`, label: localizeGeometricVertexLabelSSOT("M", notation), position: { x: 5, y: 5 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 8.8, y: 5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 5, y: 8.8 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 1.5, y: 6.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 2.8, y: 1.8 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sMA`, fromVertexId: vM.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sMB`, fromVertexId: vM.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sMC`, fromVertexId: vM.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sMD`, fromVertexId: vM.id, toVertexId: vD.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_exterior_angle_extension",
    titleArabic: "زوايا متجمعة حول M بزاوية قائمة 90° و (3X-5)° و (4X+2)° و (3X+63)° لحساب X = 21°",
    notationLanguage: notation,
    vertices: [vM, vA, vB, vC, vD],
    segments,
    angles: [
      { id: `${opts.figureId}_angBMA`, vertexId: vM.id, arm1VertexId: vA.id, arm2VertexId: vB.id, degrees: 90, degreesLabel: "90°" },
      { id: `${opts.figureId}_angBMC`, vertexId: vM.id, arm1VertexId: vB.id, arm2VertexId: vC.id, degreesLabel: "(3X-5)°" },
      { id: `${opts.figureId}_angCMD`, vertexId: vM.id, arm1VertexId: vC.id, arm2VertexId: vD.id, degreesLabel: "(4X+2)°" },
      { id: `${opts.figureId}_angDMA`, vertexId: vM.id, arm1VertexId: vD.id, arm2VertexId: vA.id, degreesLabel: "(3X+63)°" },
    ],
  };
}
