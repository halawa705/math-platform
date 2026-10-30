/**
 * @file prep-grade2-congruence-shared-base-builder.ts
 * @description منشئ أشكال تطابق المثلثات المشتركة في قاعدة أو ضلع أو انعكاس (هندسة 2 إعدادي - درس التطابق):
 * - شكل الطائرة الورقية والانعكاس في DB مع زوايا 30° و 100° (مسألة 4).
 * - مثلث متساوي الساقين ABC مع D منتصف القاعدة BC وزاوية 63° (مسألة 10).
 * - طائرة ورقية ABCD مع تنصيف زاوية الرأس BAD وأطوال 3.6 و 2.4 (مسألة 13).
 * - رباعي مقسوم بقطر BD مع زوايا 110° و 40° و 30° وأطوال 7 سم (مسألة 14).
 * - مثلث متساوي الساقين مع قطعتين متساويتين BD = CE على القاعدة (مسألة 19).
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

export const MODULE_ID_PREP_GRADE2_CONGRUENCE_SHARED_BASE_BUILDER =
  "prep_grade2_congruence_shared_base_builder" as const;

export interface PrepGrade2FigureBuildOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 4: تطابق بالانعكاس في DB مع زوايا 30° و 100° وأطوال 30 و 20
 */
export function buildCongruenceReflectionInDBFigure(
  opts: PrepGrade2FigureBuildOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 5, y: 10 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 5, y: 1 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 1, y: 4.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 9, y: 4.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sDB`, fromVertexId: vD.id, toVertexId: vB.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id, lengthLabel: { value: 30, unit: "سم" } },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: 20, unit: "سم" } },
    { id: `${opts.figureId}_sCB`, fromVertexId: vC.id, toVertexId: vB.id, lengthLabel: { value: "X", unit: "سم" } },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aBDC`, vertexId: vD.id, arm1VertexId: vB.id, arm2VertexId: vC.id, degrees: 30, degreesLabel: "30°" },
    { id: `${opts.figureId}_aC`, vertexId: vC.id, arm1VertexId: vD.id, arm2VertexId: vB.id, degrees: 100, degreesLabel: "100°" },
    { id: `${opts.figureId}_aABD`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vD.id, degreesLabel: "(2y)°" },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_isosceles_equilateral",
    titleArabic: "تطابق بالانعكاس في محور DB لإيجاد قيمتي X و y",
    notationLanguage: notation,
    vertices: [vD, vB, vA, vC],
    segments,
    angles,
  };
}

/**
 * مسألة 10: مثلث متساوي الساقين ABC مع D منتصف BC وزاوية B = 63°
 */
export function buildCongruenceIsoscelesMidpointDFigure(
  opts: PrepGrade2FigureBuildOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 9.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 9, y: 1 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 5, y: 1 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 1 },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, tickMarks: 1 },
    { id: `${opts.figureId}_sBD`, fromVertexId: vB.id, toVertexId: vD.id, tickMarks: 2 },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id, tickMarks: 2 },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vD.id, degrees: 63, degreesLabel: "63°" },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_isosceles_equilateral",
    titleArabic: "تطابق مثلثي متساوي الساقين ABC مع D منتصف القاعدة BC",
    notationLanguage: notation,
    vertices: [vA, vB, vD, vC],
    segments,
    angles,
  };
}

/**
 * مسألة 13: طائرة ورقية ABCD مع تنصيف زاوية BAD وأطوال 3.6 و 2.4 سم
 */
export function buildCongruenceKiteBisectorACFigure(
  opts: PrepGrade2FigureBuildOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 9.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 5, y: 1 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 2, y: 4.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 8, y: 4.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: 3.6, unit: "سم" } },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, tickMarks: 1 },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id, lengthLabel: { value: 2.4, unit: "سم" } },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aBAC`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vC.id, markSymbol: "cross" },
    { id: `${opts.figureId}_aDAC`, vertexId: vA.id, arm1VertexId: vD.id, arm2VertexId: vC.id, markSymbol: "cross" },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_interior_exterior_bisector",
    titleArabic: "تطابق ΔACB ≅ ΔACD بمنصف الرأس AC لإيجاد محيط ABCD",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD],
    segments,
    angles,
  };
}

/**
 * مسألة 19: مثلث متساوي الساقين ABC مع قطعتين متساويتين BD = CE على القاعدة
 */
export function buildCongruenceIsoscelesWingsFigure(
  opts: PrepGrade2FigureBuildOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 9 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1, y: 1 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 3, y: 1 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 7, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 9, y: 1 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sAE`, fromVertexId: vA.id, toVertexId: vE.id },
    { id: `${opts.figureId}_sBD`, fromVertexId: vB.id, toVertexId: vD.id, tickMarks: 2 },
    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id },
    { id: `${opts.figureId}_sEC`, fromVertexId: vE.id, toVertexId: vC.id, tickMarks: 2 },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vD.id, markSymbol: "arc" },
    { id: `${opts.figureId}_aC`, vertexId: vC.id, arm1VertexId: vA.id, arm2VertexId: vE.id, markSymbol: "arc" },
    { id: `${opts.figureId}_aADE`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vE.id, markSymbol: "cross" },
    { id: `${opts.figureId}_aAED`, vertexId: vE.id, arm1VertexId: vA.id, arm2VertexId: vD.id, markSymbol: "cross" },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_isosceles_equilateral",
    titleArabic: "تطابق ΔABD ≅ ΔACE في المثلث متساوي الساقين مع BD = CE",
    notationLanguage: notation,
    vertices: [vA, vB, vD, vE, vC],
    segments,
    angles,
  };
}
