/**
 * @file prep-grade2-pythagoras-trapezoids-builder.ts
 * @description منشئ أشكال شبه المنحرف القائم وتطبيقات فيثاغورس (هندسة 2 إعدادي - نظرية فيثاغورس وعكسها):
 * - شبه منحرف قائم مع مثلث قائم سفلي ومجاهيل 3 و 4 و x (مسألة 4-1).
 * - شبه منحرف قائم بأبعاد 10 و 16 وساق 10 لحساب مساحته (مسألة 5-2).
 * - شبه منحرف قائم مع AB = 5 و AD = 13 و DC = 35 لإيجاد محيطه 90 سم (مسألة 7).
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

export const MODULE_ID_PREP_GRADE2_PYTHAGORAS_TRAPEZOIDS_BUILDER =
  "prep_grade2_pythagoras_trapezoids_builder" as const;

export interface PrepGrade2PythagorasOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 4-1: شبه منحرف قائم مع AD = 4 و BC = 4 و EC = 3 لإيجاد الوتر x
 */
export function buildPythagorasRightTrapezoidEC3Figure(
  opts: PrepGrade2PythagorasOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 7, y: 7 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 7, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 4, y: 1 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 1, y: 1 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 4, y: 7 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id, tickMarks: 1 },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: 4, unit: "سم" }, tickMarks: 1 },
    { id: `${opts.figureId}_sCE`, fromVertexId: vC.id, toVertexId: vE.id, lengthLabel: { value: 3, unit: "سم" } },
    { id: `${opts.figureId}_sED`, fromVertexId: vE.id, toVertexId: vD.id, lengthLabel: { value: "X", unit: "سم" } },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id, strokeStyle: "dashed" },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aA`, vertexId: vA.id, arm1VertexId: vD.id, arm2VertexId: vB.id, isRightAngle: true },
    { id: `${opts.figureId}_aC`, vertexId: vC.id, arm1VertexId: vD.id, arm2VertexId: vE.id, isRightAngle: true },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_trapezoid_with_altitudes",
    titleArabic: "شبه منحرف قائم لإيجاد قيمة الوتر X بنظرية فيثاغورس",
    notationLanguage: notation,
    vertices: [vE, vC, vB, vA, vD],
    segments,
    angles,
  };
}

/**
 * مسألة 5-2: شبه منحرف قائم بقاعدتين 10 و 16 وساق 10 لإيجاد مساحته
 */
export function buildPythagorasRightTrapezoidArea10x16Figure(
  opts: PrepGrade2PythagorasOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vTopRight: CanonicalVertexNode = { id: `${opts.figureId}_vTR`, label: "", position: { x: 7, y: 7 } };
  const vTopLeft: CanonicalVertexNode = { id: `${opts.figureId}_vTL`, label: "", position: { x: 3, y: 7 } };
  const vBotLeft: CanonicalVertexNode = { id: `${opts.figureId}_vBL`, label: "", position: { x: 1, y: 1 } };
  const vBotRight: CanonicalVertexNode = { id: `${opts.figureId}_vBR`, label: "", position: { x: 7, y: 1 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sTop`, fromVertexId: vTopLeft.id, toVertexId: vTopRight.id, lengthLabel: { value: 10, unit: "سم" } },
    { id: `${opts.figureId}_sRight`, fromVertexId: vTopRight.id, toVertexId: vBotRight.id },
    { id: `${opts.figureId}_sBot`, fromVertexId: vBotLeft.id, toVertexId: vBotRight.id, lengthLabel: { value: 16, unit: "سم" } },
    { id: `${opts.figureId}_sSlant`, fromVertexId: vBotLeft.id, toVertexId: vTopLeft.id, lengthLabel: { value: 10, unit: "سم" } },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aTR`, vertexId: vTopRight.id, arm1VertexId: vTopLeft.id, arm2VertexId: vBotRight.id, isRightAngle: true },
    { id: `${opts.figureId}_aBR`, vertexId: vBotRight.id, arm1VertexId: vBotLeft.id, arm2VertexId: vTopRight.id, isRightAngle: true },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_trapezoid_with_altitudes",
    titleArabic: "شبه منحرف قائم بأبعاد 10 و 16 سم وساق 10 سم لحساب المساحة",
    notationLanguage: notation,
    vertices: [vBotLeft, vBotRight, vTopRight, vTopLeft],
    segments,
    angles,
  };
}

/**
 * مسألة 7: شبه منحرف قائم مع AB = 5 و AD = 13 و DC = 35 لإيجاد محيطه
 */
export function buildPythagorasTrapezoidPerimeter90Figure(
  opts: PrepGrade2PythagorasOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 1.5, y: 6.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 3.5, y: 6.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 9.5, y: 1 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 1.5, y: 1 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: 5, unit: "سم" } },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id, lengthLabel: { value: 35, unit: "سم" } },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, lengthLabel: { value: 13, unit: "سم" } },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aA`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vD.id, isRightAngle: true },
    { id: `${opts.figureId}_aD`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_trapezoid_with_altitudes",
    titleArabic: "شبه منحرف قائم ABCD مع AB // DC لحساب المحيط = 90 سم",
    notationLanguage: notation,
    vertices: [vD, vC, vB, vA],
    segments,
    angles,
  };
}
