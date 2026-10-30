/**
 * @file prep-grade2-compound-medians-quadrilaterals-builder.ts
 * @description منشئ أشكال المسائل المركبة للمتوسطات مع متوازي الأضلاع والأشكال الرباعية والمثلثات المشتركة (2ع).
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

export interface PrepGrade2CompoundMediansOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 12 ص 228: مثلث قائم ABC في B بمتوسط BH وشكل رباعي ABCD بقطعة واصلة EF لإثبات BH = EF
 */
export function buildTwoTrianglesMedianMidsegmentBHEFFigure(
  opts: PrepGrade2CompoundMediansOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 2, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 7, y: 1 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 2, y: 5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 7, y: 8 } };

  // H منتصف AC (المتوسط BH)
  const vH: CanonicalVertexNode = { id: `${opts.figureId}_vH`, label: notation === "english" ? "H" : "هـ", position: { x: 4.5, y: 3 } };
  // E منتصف AD، F منتصف CD
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "س", position: { x: 4.5, y: 6.5 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: notation === "english" ? "F" : "ص", position: { x: 7, y: 4.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id },
    // المتوسط BH
    { id: `${opts.figureId}_sBH`, fromVertexId: vB.id, toVertexId: vH.id },
    // القطعة الواصلة EF
    { id: `${opts.figureId}_sEF`, fromVertexId: vE.id, toVertexId: vF.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_parallelogram_diagonals",
    titleArabic: "مثلث قائم بمتوسط BH وشكل رباعي بقطعة واصلة EF لإثبات BH = EF",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vH, vE, vF],
    segments,
    angles: [
      { id: `${opts.figureId}_angABC`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true },
    ],
  };
}

/**
 * مسألة 13 ص 228: مثلث ADC قائم في D بنقطة تلاقي متوسطات M ومثلث ABC بقطعة EF = 9 لحساب AC = 18 و DM = 6 سم
 */
export function buildTwoRightTrianglesMediansDMACFigure(
  opts: PrepGrade2CompoundMediansOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 2, y: 1 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 7, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 2, y: 6 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 7, y: 8 } };

  // E منتصف BC، F منتصف AB، القطعة EF = 9 سم
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "س", position: { x: 4.5, y: 7 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: notation === "english" ? "F" : "ص", position: { x: 7, y: 4.5 } };
  // G منتصف الوتر المشترك AC
  const vG: CanonicalVertexNode = { id: `${opts.figureId}_vG`, label: notation === "english" ? "G" : "هـ", position: { x: 4.5, y: 3.5 } };
  // M نقطة تلاقي المتوسطات للمثلث ADC على المتوسط DG
  const vM: CanonicalVertexNode = { id: `${opts.figureId}_vM`, label: notation === "english" ? "M" : "م", position: { x: 3.67, y: 2.67 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, lengthLabel: { value: 18, unit: "سم" } },
    { id: `${opts.figureId}_sCB`, fromVertexId: vC.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sEF`, fromVertexId: vE.id, toVertexId: vF.id, lengthLabel: { value: 9, unit: "سم" } },
    { id: `${opts.figureId}_sDG`, fromVertexId: vD.id, toVertexId: vG.id },
    { id: `${opts.figureId}_sDM`, fromVertexId: vD.id, toVertexId: vM.id, lengthLabel: { value: 6, unit: "سم" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "triangle_medians_and_centroid",
    titleArabic: "مثلث قائم ADC بمركز متوسطات M وقطعة EF = 9 لحساب AC = 18 و DM = 6 سم",
    notationLanguage: notation,
    vertices: [vD, vA, vC, vB, vE, vF, vG, vM],
    segments,
    angles: [
      { id: `${opts.figureId}_angADC`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true },
    ],
  };
}

/**
 * مسألة 21 ص 230: متوازي أضلاع ABCD تقاطع قطراه في M، مع DE = 2 EM لإثبات تنصيف AF = FD
 */
export function buildParallelogramCentroidDiagonalsMFigure(
  opts: PrepGrade2CompoundMediansOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 7, y: 7 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 5, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 1, y: 2 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 3, y: 7 } };

  // M نقطة تقاطع القطرين AC و BD
  const vM: CanonicalVertexNode = { id: `${opts.figureId}_vM`, label: notation === "english" ? "M" : "م", position: { x: 4, y: 4.5 } };
  // E نقطة على القطر BD بحيث DE = 2 EM
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 3.67, y: 5.33 } };
  // F منتصف الضلع AD حيث يمر الشعاع CE
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: notation === "english" ? "F" : "و", position: { x: 5, y: 7 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCB`, fromVertexId: vC.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBA`, fromVertexId: vB.id, toVertexId: vA.id },
    // القطران
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sBD`, fromVertexId: vB.id, toVertexId: vD.id },
    // الشعاع الواصل من C عبر E إلى F
    { id: `${opts.figureId}_sCF`, fromVertexId: vC.id, toVertexId: vF.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_parallelogram_diagonals",
    titleArabic: "متوازي أضلاع ABCD بتقاطع قطري M و DE = 2 EM لإثبات AF = FD",
    notationLanguage: notation,
    vertices: [vA, vD, vC, vB, vM, vE, vF],
    segments,
    angles: [],
  };
}

/**
 * مسألة 15 ص 229: مثلث ABC فيه AD ⊥ BC و E, F منتصفا AB, AC لإثبات محيط EFD = 1/2 محيط ABC
 */
export function buildRightTriangleAltitudeMidsegmentEFDFigure(
  opts: PrepGrade2CompoundMediansOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 9, y: 2 } };

  // D مسقط A على BC (ارتفاع AD ⊥ BC)
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 5, y: 2 } };
  // E منتصف AB، F منتصف AC
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 3, y: 5 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: notation === "english" ? "F" : "و", position: { x: 7, y: 5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    // الارتفاع AD
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id },
    // مثلث المنصفات والمتوسطات EFD
    { id: `${opts.figureId}_sEF`, fromVertexId: vE.id, toVertexId: vF.id },
    { id: `${opts.figureId}_sED`, fromVertexId: vE.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sFD`, fromVertexId: vF.id, toVertexId: vD.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_midsegment_joining_midpoints",
    titleArabic: "مثلث ABC بارتفاع AD ⊥ BC ومنصفات E و F لإثبات محيط EFD = 1/2 محيط ABC",
    notationLanguage: notation,
    vertices: [vA, vE, vB, vD, vC, vF],
    segments,
    angles: [
      { id: `${opts.figureId}_angADB`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vB.id, isRightAngle: true },
    ],
  };
}
