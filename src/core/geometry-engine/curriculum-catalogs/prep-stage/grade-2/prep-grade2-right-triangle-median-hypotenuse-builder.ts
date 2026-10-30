/**
 * @file prep-grade2-right-triangle-median-hypotenuse-builder.ts
 * @description منشئ أشكال متوسط المثلث القائم الزاوية الخارج من رأس القائمة وعكس النظرية (2ع).
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

export interface PrepGrade2RightTriangleMedianOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 9 ص 227 ومسألة 10 ص 228: متوسط المثلث القائم من رأس القائمة AD = 1/2 BC بمجاهيل جبرية
 */
export function buildRightTriangleMedianHypotenuseAlgebraicFigure(
  opts: PrepGrade2RightTriangleMedianOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  // مثلث قائم في A: A=(2, 7), B=(2, 2), C=(9, 2)
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 2.5, y: 7.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 9.5, y: 2 } };

  // D منتصف الوتر BC
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 5.25, y: 2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sBD`, fromVertexId: vB.id, toVertexId: vD.id, lengthLabel: { value: "2X - 3" } },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id, lengthLabel: { value: "3X - 8" } },
    // المتوسط AD = 7 سم (نصف الوتر 14 سم)
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, lengthLabel: { value: 7, unit: "سم" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_medians_and_centroid",
    titleArabic: "متوسط المثلث القائم من رأس القائمة AD = 7 سم مع أجزاء الوتر 2X-3 و 3X-8",
    notationLanguage: notation,
    vertices: [vA, vB, vD, vC],
    segments,
    angles: [
      { id: `${opts.figureId}_angBAC`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vC.id, isRightAngle: true },
    ],
  };
}

/**
 * مسألة 11 ص 228: مثلث قائم في A بأضلاع 24 و 18 سم ونقطة تلاقي المتوسطات G لإيجاد AG = 10 سم
 */
export function buildRightTriangleMedianWithCentroidGFigure(
  opts: PrepGrade2RightTriangleMedianOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1, y: 1.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 9.5, y: 1.5 } };

  // D منتصف الوتر BC
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 5.25, y: 1.5 } };

  // G نقطة تلاقي المتوسطات تقع على المتوسط AD بنسبة 2:1 (AG = 2/3 AD = 10 سم حيث AD = 15 سم)
  const vG: CanonicalVertexNode = { id: `${opts.figureId}_vG`, label: notation === "english" ? "G" : "م", position: { x: 5.08, y: 3.67 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: 24, unit: "سم" } },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, lengthLabel: { value: 18, unit: "سم" } },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sAG`, fromVertexId: vA.id, toVertexId: vG.id, lengthLabel: { value: 10, unit: "سم" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_medians_and_centroid",
    titleArabic: "مثلث قائم في A بأضلاع 24 و 18 سم ونقطة تلاقي متوسطات G وطول AG = 10 سم",
    notationLanguage: notation,
    vertices: [vA, vB, vD, vC, vG],
    segments,
    angles: [
      { id: `${opts.figureId}_angBAC`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vC.id, isRightAngle: true },
    ],
  };
}

/**
 * مسألة 17 و 18 ص 229: عكس النظرية (المتوسط AD = 17 سم ونصف الضلع المقابل 34 سم لإثبات القائمة ومساحة 240)
 */
export function buildConverseRightTriangleMedianFigure(
  opts: PrepGrade2RightTriangleMedianOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 3.5, y: 7.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 9.5, y: 2 } };

  // D منتصف BC
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 5.25, y: 2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: 16, unit: "سم" } },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: 34, unit: "سم" } },
    // المتوسط AD = 17 سم (نصف BC = 34 سم)
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, lengthLabel: { value: 17, unit: "سم" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_medians_and_centroid",
    titleArabic: "عكس نظرية المتوسط: متوسط AD = 17 سم مع BC = 34 و AB = 16 لإثبات زاوية A قائمة ومساحة 240 سم²",
    notationLanguage: notation,
    vertices: [vA, vB, vD, vC],
    segments,
    angles: [],
  };
}

/**
 * مسألة 20 ص 229: مثلث قائم في A، مركز تلاقي المتوسطات M، مع ME ⊥ DC و DE = 3 و ME = 4 لحساب BC = 30 سم
 */
export function buildRightTriangleMedianWithPerpendicularMEFigure(
  opts: PrepGrade2RightTriangleMedianOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 3, y: 7.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 1, y: 2 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 9.5, y: 2 } };

  // D منتصف الوتر BC
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 5.25, y: 2 } };
  // M نقطة تلاقي المتوسطات على AD
  const vM: CanonicalVertexNode = { id: `${opts.figureId}_vM`, label: notation === "english" ? "M" : "م", position: { x: 4.5, y: 3.83 } };
  // E مسقط M على BC
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 4.5, y: 2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sCB`, fromVertexId: vC.id, toVertexId: vB.id, lengthLabel: { value: 30, unit: "سم" } },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sME`, fromVertexId: vM.id, toVertexId: vE.id, lengthLabel: { value: 4, unit: "سم" } },
    { id: `${opts.figureId}_sED`, fromVertexId: vE.id, toVertexId: vD.id, lengthLabel: { value: 3, unit: "سم" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_medians_and_centroid",
    titleArabic: "مثلث قائم في A مع مركز المتوسطات M وعمود ME = 4 و DE = 3 لحساب الوتر BC = 30 سم",
    notationLanguage: notation,
    vertices: [vA, vC, vE, vD, vB, vM],
    segments,
    angles: [
      { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vC.id, arm2VertexId: vB.id, isRightAngle: true },
      { id: `${opts.figureId}_angMED`, vertexId: vE.id, arm1VertexId: vM.id, arm2VertexId: vD.id, isRightAngle: true },
    ],
  };
}
