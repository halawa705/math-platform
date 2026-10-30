/**
 * @file prep-grade2-pythagoras-triangles-altitude-builder.ts
 * @description منشئ أشكال المثلثات المقسمة بعمود ونظرية فيثاغورس وعكسها (هندسة 2 إعدادي):
 * - مثلث ABC فيه AD ⊥ BC وأطوال 12 و 13 و 15 سم لحساب المساحة 84 سم² (مسألة 6).
 * - مثلث مقسوم بعمود ارتفاعه 3 سم وقاعدة 11 سم (مسألة 4-2).
 * - مثلث مقسوم بعمود ارتفاعه 6 سم وقاعدة 12 سم (مسألة 4-3).
 * - مثلث مقسوم بعمود AD ⊥ BC بأبعاد 2 و 1 و 4 سم لإثبات زاوية BAC قائمة (مسألة 25).
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

export const MODULE_ID_PREP_GRADE2_PYTHAGORAS_TRIANGLES_ALTITUDE_BUILDER =
  "prep_grade2_pythagoras_triangles_altitude_builder" as const;

export interface PrepGrade2AltitudeTriangleOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 6: مثلث ABC فيه AD ⊥ BC و AD = 12 و AC = 15 و AB = 13 لإيجاد المساحة 84 سم²
 */
export function buildPythagorasAltitudeArea84Figure(
  opts: PrepGrade2AltitudeTriangleOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 9.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 1, y: 1 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 8, y: 1 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 5, y: 1 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id, lengthLabel: { value: 15, unit: "سم" } },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: 13, unit: "سم" } },
    { id: `${opts.figureId}_sCB`, fromVertexId: vC.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, lengthLabel: { value: 12, unit: "سم" } },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aADB`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vB.id, isRightAngle: true },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: "مثلث ABC مع عمود AD ⊥ BC لحساب مساحة المثلث = 84 سم²",
    notationLanguage: notation,
    vertices: [vC, vD, vB, vA],
    segments,
    angles,
  };
}

/**
 * مسألة 4-2: مثلث مقسوم بعمود ارتفاعه 3 وضلع 5 وقاعدة 11 لإيجاد X
 */
export function buildPythagorasAltitude3Base11Figure(
  opts: PrepGrade2AltitudeTriangleOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vApex: CanonicalVertexNode = { id: `${opts.figureId}_vApex`, label: "", position: { x: 4, y: 6 } };
  const vLeft: CanonicalVertexNode = { id: `${opts.figureId}_vLeft`, label: "", position: { x: 1, y: 1 } };
  const vRight: CanonicalVertexNode = { id: `${opts.figureId}_vRight`, label: "", position: { x: 9.5, y: 1 } };
  const vFoot: CanonicalVertexNode = { id: `${opts.figureId}_vFoot`, label: "", position: { x: 4, y: 1 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sLeft`, fromVertexId: vLeft.id, toVertexId: vApex.id, lengthLabel: { value: 5 } },
    { id: `${opts.figureId}_sRight`, fromVertexId: vApex.id, toVertexId: vRight.id, lengthLabel: { value: "X" } },
    { id: `${opts.figureId}_sBase`, fromVertexId: vLeft.id, toVertexId: vRight.id, lengthLabel: { value: 11 } },
    { id: `${opts.figureId}_sAlt`, fromVertexId: vApex.id, toVertexId: vFoot.id, lengthLabel: { value: 3 } },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aRight`, vertexId: vFoot.id, arm1VertexId: vApex.id, arm2VertexId: vRight.id, isRightAngle: true },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: "مثلث مقسوم بعمود ارتفاعه 3 وقاعدة 11 لحساب X بفيثاغورس",
    notationLanguage: notation,
    vertices: [vLeft, vFoot, vRight, vApex],
    segments,
    angles,
  };
}

/**
 * مسألة 4-3: مثلث مقسوم بعمود ارتفاعه 6 وضلع 10 وقاعدة 12 لإيجاد X
 */
export function buildPythagorasAltitude6Base12Figure(
  opts: PrepGrade2AltitudeTriangleOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vApex: CanonicalVertexNode = { id: `${opts.figureId}_vApex`, label: "", position: { x: 3.5, y: 7.5 } };
  const vLeft: CanonicalVertexNode = { id: `${opts.figureId}_vLeft`, label: "", position: { x: 1, y: 1 } };
  const vRight: CanonicalVertexNode = { id: `${opts.figureId}_vRight`, label: "", position: { x: 9, y: 1 } };
  const vFoot: CanonicalVertexNode = { id: `${opts.figureId}_vFoot`, label: "", position: { x: 3.5, y: 1 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sLeft`, fromVertexId: vLeft.id, toVertexId: vApex.id, lengthLabel: { value: "X" } },
    { id: `${opts.figureId}_sRight`, fromVertexId: vApex.id, toVertexId: vRight.id, lengthLabel: { value: 10 } },
    { id: `${opts.figureId}_sBase`, fromVertexId: vLeft.id, toVertexId: vRight.id, lengthLabel: { value: 12 } },
    { id: `${opts.figureId}_sAlt`, fromVertexId: vApex.id, toVertexId: vFoot.id, lengthLabel: { value: 6 } },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aRight`, vertexId: vFoot.id, arm1VertexId: vApex.id, arm2VertexId: vRight.id, isRightAngle: true },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: "مثلث مقسوم بعمود ارتفاعه 6 وقاعدة 12 لحساب X بفيثاغورس",
    notationLanguage: notation,
    vertices: [vLeft, vFoot, vRight, vApex],
    segments,
    angles,
  };
}

/**
 * مسألة 25: عكس فيثاغورس مع AD ⊥ BC و AD = 2 و BD = 1 و DC = 4 لإثبات زاوية BAC قائمة
 */
export function buildPythagorasConverseBACRightFigure(
  opts: PrepGrade2AltitudeTriangleOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 3, y: 6.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 9, y: 1 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 3, y: 1 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sBD`, fromVertexId: vB.id, toVertexId: vD.id, lengthLabel: { value: 1, unit: "سم" } },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id, lengthLabel: { value: 4, unit: "سم" } },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, lengthLabel: { value: 2, unit: "سم" } },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aADB`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_right_pythagoras",
    titleArabic: "مثلث ABC مع عمود 2 سم وأجزاء 1 و 4 سم لإثبات زاوية BAC قائمة",
    notationLanguage: notation,
    vertices: [vB, vD, vC, vA],
    segments,
    angles,
  };
}
