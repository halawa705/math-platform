/**
 * @file prep-grade2-congruence-parallelogram-diagonals-builder.ts
 * @description منشئ أشكال تطابق المثلثات في متوازي الأضلاع والأقطار والأعمدة (هندسة 2 إعدادي):
 * - متوازي أضلاع مقسوم بقطر مع توازي وتطابق AD = CB و AD // BC (مسألة 24).
 * - متوازي أضلاع ABCD مع عمودين متعاكسين DE ⊥ AC و BF ⊥ AC (مسألة 25).
 * - متوازي أضلاع بأطوال 5 سم و 4 سم مقسوم بقطر مشترك (مسألة 6-2).
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

export const MODULE_ID_PREP_GRADE2_CONGRUENCE_PARALLELOGRAM_DIAGONALS_BUILDER =
  "prep_grade2_congruence_parallelogram_diagonals_builder" as const;

export interface PrepGrade2ParallelogramOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 24: متوازي أضلاع مقسوم بقطر مع AD = CB و AD // BC
 */
export function buildCongruenceParallelogramSecantBDFigure(
  opts: PrepGrade2ParallelogramOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 1.5, y: 8 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 5, y: 5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1.5, y: 5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 5, y: 1 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, parallelArrows: 1, tickMarks: 1 },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, parallelArrows: 1, tickMarks: 1 },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sBD`, fromVertexId: vB.id, toVertexId: vD.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_parallelogram_diagonals",
    titleArabic: "تطابق ΔABD ≅ ΔCDB في متوازي الأضلاع المقسم بقطر BD",
    notationLanguage: notation,
    vertices: [vA, vD, vB, vC],
    segments,
    angles: [],
  };
}

/**
 * مسألة 25: متوازي أضلاع ABCD مع عمودين DE ⊥ AC و BF ⊥ AC
 */
export function buildCongruenceParallelogramAltitudesFigure(
  opts: PrepGrade2ParallelogramOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 2, y: 8 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 8, y: 8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 7, y: 2 } };

  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 5.8, y: 6.2 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: notation === "english" ? "F" : "و", position: { x: 3.2, y: 3.8 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 2 },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id, tickMarks: 2 },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id },
    { id: `${opts.figureId}_sBF`, fromVertexId: vB.id, toVertexId: vF.id },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aE`, vertexId: vE.id, arm1VertexId: vD.id, arm2VertexId: vA.id, isRightAngle: true },
    { id: `${opts.figureId}_aF`, vertexId: vF.id, arm1VertexId: vB.id, arm2VertexId: vC.id, isRightAngle: true },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_parallelogram_diagonals",
    titleArabic: "تطابق المثلثين القائمين في متوازي الأضلاع مع DE ⊥ AC و BF ⊥ AC",
    notationLanguage: notation,
    vertices: [vA, vD, vB, vC, vE, vF],
    segments,
    angles,
  };
}

/**
 * مسألة 6-2: متوازي أضلاع / مستطيل مقسوم بقطر بأطوال 5 سم و 4 سم
 */
export function buildCongruenceParallelogram5x4Figure(
  opts: PrepGrade2ParallelogramOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 2, y: 1 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 8, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 8, y: 6.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 2, y: 6.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: 5, unit: "سم" } },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id, lengthLabel: { value: 5, unit: "سم" } },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, lengthLabel: { value: 4, unit: "سم" } },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: 4, unit: "سم" } },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: "تطابق مثلثي المستطيل بقطر مشترك AC وأطوال 5 سم و 4 سم (SSS)",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD],
    segments,
    angles: [],
  };
}
