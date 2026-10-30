/**
 * @file prep-grade2-triangle-medians-centroid-builder.ts
 * @description منشئ أشكال تقاطع متوسطات المثلث ونقطة التلاقي ونسبة 2:1 لدرس متوسطات المثلث (2ع).
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

export interface PrepGrade2MediansCentroidOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 3 و 4 ص 226، ومسألة 7 و 8 ص 227: متوسطان يتقاطعان في نقطة تلاقي M مع القطعة الواصلة DE
 */
export function buildMediansCentroidMidsegmentPerimeterFigure(
  opts: PrepGrade2MediansCentroidOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 8.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 9, y: 1 } };

  // E منتصف AC، D منتصف AB
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 7, y: 4.75 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 3, y: 4.75 } };

  // M نقطة تقاطع المتوسطين BE و CD (المركز الثقلي: ثلث من القاعدة، ثلثان من الرأس)
  const vM: CanonicalVertexNode = { id: `${opts.figureId}_vM`, label: notation === "english" ? "M" : "م", position: { x: 5, y: 3.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: 12, unit: "سم" } },
    // المتوسطان BE و CD
    { id: `${opts.figureId}_sBE`, fromVertexId: vB.id, toVertexId: vE.id, lengthLabel: { value: 9, unit: "سم" } },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    // القطعة الواصلة بين منتصفي ضلعين DE
    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id, lengthLabel: { value: 6, unit: "سم" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_medians_and_centroid",
    titleArabic: "متوسطان ونقطة تلاقي المتوسطات M مع القطعة الواصلة DE وأطوال 12 و 9 سم",
    notationLanguage: notation,
    vertices: [vA, vD, vB, vC, vE, vM],
    segments,
    angles: [],
  };
}

/**
 * مسألة 4 ص 226، ومسألة 5 ص 227: المتوسطات الثلاثة تلتقي في نقطة G (AP=21, GQ=5, BG=16)
 */
export function buildThreeMediansCentroidGFigure(
  opts: PrepGrade2MediansCentroidOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5.5, y: 8.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 9.5, y: 1 } };

  // المنتصفات: P منتصف BC، Q منتصف AB، R منتصف AC
  const vP: CanonicalVertexNode = { id: `${opts.figureId}_vP`, label: notation === "english" ? "P" : "د", position: { x: 5.25, y: 1 } };
  const vQ: CanonicalVertexNode = { id: `${opts.figureId}_vQ`, label: notation === "english" ? "Q" : "و", position: { x: 3.25, y: 4.75 } };
  const vR: CanonicalVertexNode = { id: `${opts.figureId}_vR`, label: notation === "english" ? "R" : "هـ", position: { x: 7.5, y: 4.75 } };

  // نقطة التلاقي G
  const vG: CanonicalVertexNode = { id: `${opts.figureId}_vG`, label: notation === "english" ? "G" : "م", position: { x: 5.33, y: 3.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    // المتوسطات الثلاثة
    { id: `${opts.figureId}_sAP`, fromVertexId: vA.id, toVertexId: vP.id, lengthLabel: { value: 21, unit: "سم" } },
    { id: `${opts.figureId}_sBQ`, fromVertexId: vB.id, toVertexId: vQ.id },
    { id: `${opts.figureId}_sCR`, fromVertexId: vC.id, toVertexId: vR.id },
    // جزء من المتوسط BG = 16
    { id: `${opts.figureId}_sBG`, fromVertexId: vB.id, toVertexId: vG.id, lengthLabel: { value: 16, unit: "سم" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_medians_and_centroid",
    titleArabic: "المتوسطات الثلاثة للمثلث ونقطة التلاقي G مع AP = 21 و BG = 16 و GQ = 5 سم",
    notationLanguage: notation,
    vertices: [vA, vQ, vB, vP, vC, vR, vG],
    segments,
    angles: [],
  };
}

/**
 * مسألة 22 ص 230: متوسطان متعامدان AD ⊥ BE مع CE = 15 و BG = 18 لحساب AD = 18 سم
 */
export function buildPerpendicularMediansADBEFigure(
  opts: PrepGrade2MediansCentroidOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 4, y: 8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 9, y: 2 } };

  // D منتصف BC، E منتصف AC
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 5, y: 2 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 6.5, y: 5 } };

  // G نقطة التقاطع
  const vG: CanonicalVertexNode = { id: `${opts.figureId}_vG`, label: notation === "english" ? "G" : "م", position: { x: 4.67, y: 4 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    // المتوسطان المتعامدان
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sBE`, fromVertexId: vB.id, toVertexId: vE.id },
    { id: `${opts.figureId}_sBG`, fromVertexId: vB.id, toVertexId: vG.id, lengthLabel: { value: 18, unit: "سم" } },
    { id: `${opts.figureId}_sCE`, fromVertexId: vC.id, toVertexId: vE.id, lengthLabel: { value: 15, unit: "سم" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_medians_and_centroid",
    titleArabic: "متوسطان متعامدان AD ⊥ BE مع CE = 15 و BG = 18 سم لحساب AD = 18 سم",
    notationLanguage: notation,
    vertices: [vA, vB, vD, vC, vE, vG],
    segments,
    angles: [
      { id: `${opts.figureId}_angAGB`, vertexId: vG.id, arm1VertexId: vA.id, arm2VertexId: vB.id, isRightAngle: true },
    ],
  };
}

/**
 * مسألة 8 ص 227: محيط المثلث AMC = 36 سم ومحيط المثلث MFD = 18 سم (بنسبة 1:2)
 */
export function buildMediansWithMidsegmentRatioPerimeterFigure(
  opts: PrepGrade2MediansCentroidOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 8.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 1, y: 1 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 9, y: 1 } };

  // D منتصف AB، F منتصف CB
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 7, y: 4.75 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: notation === "english" ? "F" : "و", position: { x: 5, y: 1 } };

  // M نقطة تقاطع المتوسطين CD و AF
  const vM: CanonicalVertexNode = { id: `${opts.figureId}_vM`, label: notation === "english" ? "M" : "م", position: { x: 5, y: 3.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sCB`, fromVertexId: vC.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sAF`, fromVertexId: vA.id, toVertexId: vF.id },
    { id: `${opts.figureId}_sFD`, fromVertexId: vF.id, toVertexId: vD.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_medians_and_centroid",
    titleArabic: "متوسطان CD و AF ومحيط المثلث AMC = 36 سم ومحيط MFD = 18 سم",
    notationLanguage: notation,
    vertices: [vA, vC, vF, vB, vD, vM],
    segments,
    angles: [],
  };
}
