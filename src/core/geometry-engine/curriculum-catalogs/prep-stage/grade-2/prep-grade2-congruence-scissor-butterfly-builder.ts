/**
 * @file prep-grade2-congruence-scissor-butterfly-builder.ts
 * @description منشئ أشكال تطابق المثلثات المتقابلة بالرأس والمقص والمتقاطعة في منتصف القطع (هندسة 2 إعدادي):
 * - E منتصف كل من AB و CD وبرهان ΔAEC ≅ ΔBED و AC // DB (مسألة 11).
 * - O منتصف BD مع OA = OC وزاوية 34° لإيجاد m(∠AOC) = 112° (مسألة 12).
 * - مثلثان يشتركان في الرأس A بأطوال 3 و 4 سم (مسألة 22).
 * - مثلثان متعامدان متقابلان في الرأس E مع أطوال 7 و 8 و 15 سم (مسألة 26).
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

export const MODULE_ID_PREP_GRADE2_CONGRUENCE_SCISSOR_BUTTERFLY_BUILDER =
  "prep_grade2_congruence_scissor_butterfly_builder" as const;

export interface PrepGrade2ScissorOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 11: E منتصف كل من AB و CD وبرهان ΔAEC ≅ ΔBED
 */
export function buildCongruenceScissorMidpointEFigure(
  opts: PrepGrade2ScissorOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 5, y: 5 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 1, y: 8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 9, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 1.5, y: 2 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 8.5, y: 8 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAE`, fromVertexId: vA.id, toVertexId: vE.id, tickMarks: 2 },
    { id: `${opts.figureId}_sEB`, fromVertexId: vE.id, toVertexId: vB.id, tickMarks: 2 },
    { id: `${opts.figureId}_sCE`, fromVertexId: vC.id, toVertexId: vE.id, tickMarks: 1 },
    { id: `${opts.figureId}_sED`, fromVertexId: vE.id, toVertexId: vD.id, tickMarks: 1 },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sDB`, fromVertexId: vD.id, toVertexId: vB.id },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aAEC`, vertexId: vE.id, arm1VertexId: vA.id, arm2VertexId: vC.id, markSymbol: "cross" },
    { id: `${opts.figureId}_aBED`, vertexId: vE.id, arm1VertexId: vB.id, arm2VertexId: vD.id, markSymbol: "cross" },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: "تطابق ΔAEC ≅ ΔBED بتنصيف E للقطعتين AB و CD",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE],
    segments,
    angles,
  };
}

/**
 * مسألة 12: O منتصف BD مع OA = OC وزاوية 34° عند D
 */
export function buildCongruenceCenterOMidpointBDFigure(
  opts: PrepGrade2ScissorOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vO: CanonicalVertexNode = { id: `${opts.figureId}_vO`, label: localizeGeometricVertexLabelSSOT("و", notation), position: { x: 5, y: 2 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1.5, y: 2 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 8.5, y: 2 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 2.5, y: 6.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 7.5, y: 6.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sBO`, fromVertexId: vB.id, toVertexId: vO.id, tickMarks: 1 },
    { id: `${opts.figureId}_sOD`, fromVertexId: vO.id, toVertexId: vD.id, tickMarks: 1 },
    { id: `${opts.figureId}_sOA`, fromVertexId: vO.id, toVertexId: vA.id, tickMarks: 3 },
    { id: `${opts.figureId}_sOC`, fromVertexId: vO.id, toVertexId: vC.id, tickMarks: 3 },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 2 },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, tickMarks: 2 },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aD`, vertexId: vD.id, arm1VertexId: vC.id, arm2VertexId: vO.id, degrees: 34, degreesLabel: "34°" },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: "تطابق ΔOAB ≅ ΔOCD مع O منتصف BD لإيجاد قياس AOC",
    notationLanguage: notation,
    vertices: [vB, vO, vD, vA, vC],
    segments,
    angles,
  };
}

/**
 * مسألة 22: مثلثان يشتركان في الرأس A بأطوال AB = 3 و AD = 3 و AE = 4 و AC = 4
 */
export function buildCongruenceSharedApexAFigure(
  opts: PrepGrade2ScissorOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 4, y: 7.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 2, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 7, y: 1 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 5.5, y: 3.5 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 8.5, y: 9.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: 3, unit: "سم" } },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, lengthLabel: { value: 3, unit: "سم" } },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAE`, fromVertexId: vA.id, toVertexId: vE.id, lengthLabel: { value: 4, unit: "سم" } },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id, lengthLabel: { value: 1, unit: "سم" } },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aBAC`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vC.id, markSymbol: "dot" },
    { id: `${opts.figureId}_aDAE`, vertexId: vA.id, arm1VertexId: vD.id, arm2VertexId: vE.id, markSymbol: "dot" },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: "تطابق ΔABC ≅ ΔADE باشتراك الرأس A وأطوال 3 و 4 سم",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE],
    segments,
    angles,
  };
}

/**
 * مسألة 26: مثلثان متقابلان عند E و F مع أطوال 7 و 8 و 15 سم
 */
export function buildCongruencePerpendicularApexFigure(
  opts: PrepGrade2ScissorOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 3, y: 9.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 3, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 1, y: 1 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 8, y: 1 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 3, y: 4.5 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: notation === "english" ? "F" : "و", position: { x: 1.5, y: 6 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAE`, fromVertexId: vA.id, toVertexId: vE.id, lengthLabel: { value: 7, unit: "سم" } },
    { id: `${opts.figureId}_sEB`, fromVertexId: vE.id, toVertexId: vB.id, lengthLabel: { value: 8, unit: "سم" } },
    { id: `${opts.figureId}_sCB`, fromVertexId: vC.id, toVertexId: vB.id, lengthLabel: { value: 8, unit: "سم" } },
    { id: `${opts.figureId}_sBD`, fromVertexId: vB.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sED`, fromVertexId: vE.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sCF`, fromVertexId: vC.id, toVertexId: vF.id },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vD.id, isRightAngle: true },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_right_pythagoras",
    titleArabic: "تطابق مثلثين لإيجاد طول BD = 15 سم في الشكل القائم",
    notationLanguage: notation,
    vertices: [vA, vE, vB, vC, vD, vF],
    segments,
    angles,
  };
}
