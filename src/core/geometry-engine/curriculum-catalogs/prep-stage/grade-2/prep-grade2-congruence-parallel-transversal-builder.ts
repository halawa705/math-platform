/**
 * @file prep-grade2-congruence-parallel-transversal-builder.ts
 * @description منشئ أشكال تطابق المثلثات بالتوازي والقواطع المتتالية ومنصفات الزوايا (هندسة 2 إعدادي):
 * - مثلثان متتاليان على استقامة واحدة مع توازيات مزدوجة AB // DC و AC // DE و BC = CE (مسألة 15).
 * - مثلثان متداخلان على قاعدة واحدة مع BA // ED و CA // FD و BE = FC (مسألة 23).
 * - مثلث منصف الزوايا برأس 30° وزاوية 78° عند E لإيجاد x = 36° (مسألة 27).
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

export const MODULE_ID_PREP_GRADE2_CONGRUENCE_PARALLEL_TRANSVERSAL_BUILDER =
  "prep_grade2_congruence_parallel_transversal_builder" as const;

export interface PrepGrade2ParallelTransversalOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 15: مثلثان على استقامة واحدة BC = CE مع AB // DC و AC // DE
 */
export function buildCongruenceCollinearParallelTransversalFigure(
  opts: PrepGrade2ParallelTransversalOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 5, y: 1 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 9, y: 1 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 3.5, y: 6 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 7.5, y: 6 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, tickMarks: 1 },
    { id: `${opts.figureId}_sCE`, fromVertexId: vC.id, toVertexId: vE.id, tickMarks: 1 },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, parallelArrows: 2 },
    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id, parallelArrows: 2 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "تطابق ΔABC ≅ ΔDCE على استقامة واحدة بتوازيات متناظرة",
    notationLanguage: notation,
    vertices: [vB, vC, vE, vA, vD],
    segments,
    angles: [],
  };
}

/**
 * مسألة 23: مثلثان متداخلان على قاعدة واحدة مع BA // ED و CA // FD و BE = FC
 */
export function buildCongruenceNestedParallelSharedLineFigure(
  opts: PrepGrade2ParallelTransversalOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1, y: 1 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 3.5, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 6.5, y: 1 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: notation === "english" ? "F" : "و", position: { x: 9, y: 1 } };

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 4, y: 8 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 6.5, y: 8 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sBE`, fromVertexId: vB.id, toVertexId: vE.id, tickMarks: 1 },
    { id: `${opts.figureId}_sEC`, fromVertexId: vE.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sCF`, fromVertexId: vC.id, toVertexId: vF.id, tickMarks: 1 },
    { id: `${opts.figureId}_sBA`, fromVertexId: vB.id, toVertexId: vA.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sED`, fromVertexId: vE.id, toVertexId: vD.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, parallelArrows: 2 },
    { id: `${opts.figureId}_sDF`, fromVertexId: vD.id, toVertexId: vF.id, parallelArrows: 2 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "تطابق ΔABC ≅ ΔDEF بتوازيات متناظرة و BE = FC",
    notationLanguage: notation,
    vertices: [vB, vE, vC, vF, vA, vD],
    segments,
    angles: [],
  };
}

/**
 * مسألة 27: مثلث كبير ABC برأس 30° وزاوية 78° عند E ومنصف زاوية B
 */
export function buildCongruenceAngleBisector78Figure(
  opts: PrepGrade2ParallelTransversalOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 4.5, y: 9.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1.5, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 6.5, y: 1 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 2.8, y: 4.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 5.8, y: 4 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, tickMarks: 2 },
    { id: `${opts.figureId}_sED`, fromVertexId: vE.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sBD`, fromVertexId: vB.id, toVertexId: vD.id },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aA`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vC.id, degrees: 30, degreesLabel: "30°" },
    { id: `${opts.figureId}_aBED`, vertexId: vE.id, arm1VertexId: vB.id, arm2VertexId: vD.id, degrees: 78, degreesLabel: "78°" },
    { id: `${opts.figureId}_aB1`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vD.id, degreesLabel: "X°" },
    { id: `${opts.figureId}_aB2`, vertexId: vB.id, arm1VertexId: vD.id, arm2VertexId: vC.id, degreesLabel: "X°" },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_interior_exterior_bisector",
    titleArabic: "تطابق ΔBCD ≅ ΔBED بمنصف الزاوية X وزاوية 78° لإيجاد X = 36°",
    notationLanguage: notation,
    vertices: [vA, vE, vB, vC, vD],
    segments,
    angles,
  };
}
