/**
 * @file prep-grade2-thales-parallel-intercepts-builder.ts
 * @description منشئ أشكال نظرية طاليس الخاصة والمستقيمات المتوازية المتعددة والقواطع المتساوية (هندسة 2 إعدادي):
 * - عدة مستقيمات متوازية XA // YB // EC // FD مع أجزاء قاطع متساوية ومجهول m (مسألة 8 ص 210).
 * - قاطعان لأربعة مستقيمات متوازية بأجزاء متساوية ومجاهيل x و y (مسألة 3 ص 210).
 * - شبه منحرف بمستقيمات متوازية وأجزاء متساوية مع 2x+7 و 4x+1 (مسألة 2-3 ص 210).
 * - توازيات متعددة داخل مثلث مع أجزاء متساوية AG = GF = FB و GK = 8 سم (مسألة 18 ص 214).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
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

export const MODULE_ID_PREP_GRADE2_THALES_PARALLEL_INTERCEPTS_BUILDER =
  "prep_grade2_thales_parallel_intercepts_builder" as const;

export interface PrepGrade2ThalesOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 8 ص 210: أربعة مستقيمات متوازية مع XE = 6 سم و EF = m + 2
 */
export function buildThalesFourParallelsXE6Figure(
  opts: PrepGrade2ThalesOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vX: CanonicalVertexNode = { id: `${opts.figureId}_vX`, label: notation === "english" ? "X" : "س", position: { x: 3, y: 9.5 } };
  const vY: CanonicalVertexNode = { id: `${opts.figureId}_vY`, label: notation === "english" ? "Y" : "ص", position: { x: 2.3, y: 7 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 1.6, y: 4.5 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: notation === "english" ? "F" : "و", position: { x: 1, y: 1 } };

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 7, y: 9.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 7.6, y: 7 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 8.3, y: 4.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 9, y: 1 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sXA`, fromVertexId: vX.id, toVertexId: vA.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sYB`, fromVertexId: vY.id, toVertexId: vB.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sEC`, fromVertexId: vE.id, toVertexId: vC.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sFD`, fromVertexId: vF.id, toVertexId: vD.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sXY`, fromVertexId: vX.id, toVertexId: vY.id, tickMarks: 1 },
    { id: `${opts.figureId}_sYE`, fromVertexId: vY.id, toVertexId: vE.id, tickMarks: 1, lengthLabel: { value: 6, unit: "سم" } },
    { id: `${opts.figureId}_sEF`, fromVertexId: vE.id, toVertexId: vF.id, lengthLabel: { value: "m+2", unit: "سم" } },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 2 },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, tickMarks: 2 },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, tickMarks: 2 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "نظرية طاليس الخاصة بأربعة مستقيمات متوازية لإيجاد قيمة m",
    notationLanguage: notation,
    vertices: [vX, vY, vE, vF, vA, vB, vC, vD],
    segments,
    angles: [],
  };
}

/**
 * مسألة 3 ص 210: قاطعان لأربعة مستقيمات متوازية L1 // L2 // L3 // L4 مع أجزاء 4x و 8 و y+1
 */
export function buildThalesTransversals4x8yFigure(
  opts: PrepGrade2ThalesOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vL1L: CanonicalVertexNode = { id: `${opts.figureId}_vL1L`, label: "", position: { x: 1, y: 9 } };
  const vL1R: CanonicalVertexNode = { id: `${opts.figureId}_vL1R`, label: "", position: { x: 9, y: 9 } };
  const vL2L: CanonicalVertexNode = { id: `${opts.figureId}_vL2L`, label: "", position: { x: 1, y: 6.5 } };
  const vL2R: CanonicalVertexNode = { id: `${opts.figureId}_vL2R`, label: "", position: { x: 9, y: 6.5 } };
  const vL3L: CanonicalVertexNode = { id: `${opts.figureId}_vL3L`, label: "", position: { x: 1, y: 4 } };
  const vL3R: CanonicalVertexNode = { id: `${opts.figureId}_vL3R`, label: "", position: { x: 9, y: 4 } };
  const vL4L: CanonicalVertexNode = { id: `${opts.figureId}_vL4L`, label: "", position: { x: 1, y: 1 } };
  const vL4R: CanonicalVertexNode = { id: `${opts.figureId}_vL4R`, label: "", position: { x: 9, y: 1 } };

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 3.5, y: 9 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 3.3, y: 6.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 3.1, y: 4 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 2.8, y: 1 } };

  const vM: CanonicalVertexNode = { id: `${opts.figureId}_vM`, label: "", position: { x: 5.5, y: 9 } };
  const vN: CanonicalVertexNode = { id: `${opts.figureId}_vN`, label: "", position: { x: 6.3, y: 6.5 } };
  const vO: CanonicalVertexNode = { id: `${opts.figureId}_vO`, label: "", position: { x: 7.1, y: 4 } };
  const vP: CanonicalVertexNode = { id: `${opts.figureId}_vP`, label: "", position: { x: 8, y: 1 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sL1`, fromVertexId: vL1L.id, toVertexId: vL1R.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sL2`, fromVertexId: vL2L.id, toVertexId: vL2R.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sL3`, fromVertexId: vL3L.id, toVertexId: vL3R.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sL4`, fromVertexId: vL4L.id, toVertexId: vL4R.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 1 },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, tickMarks: 1 },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, tickMarks: 1 },
    { id: `${opts.figureId}_sMN`, fromVertexId: vM.id, toVertexId: vN.id, lengthLabel: { value: "4X", unit: "سم" } },
    { id: `${opts.figureId}_sNO`, fromVertexId: vN.id, toVertexId: vO.id, lengthLabel: { value: 8, unit: "سم" } },
    { id: `${opts.figureId}_sOP`, fromVertexId: vO.id, toVertexId: vP.id, lengthLabel: { value: "y+1", unit: "سم" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "قاطعان لمستقيمات متوازية بأجزاء متساوية لإيجاد قيمتي X و y",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vM, vN, vO, vP],
    segments,
    angles: [],
  };
}

/**
 * مسألة 18 ص 214: توازيات متعددة FD // GE مع AG = GF = FB و GK = 8 سم
 */
export function buildThalesMultipleParallelsGK8Figure(
  opts: PrepGrade2ThalesOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 3.5, y: 9.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 8.5, y: 1 } };

  const vG: CanonicalVertexNode = { id: `${opts.figureId}_vG`, label: notation === "english" ? "G" : "و", position: { x: 2.7, y: 6.7 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: notation === "english" ? "F" : "هـ", position: { x: 1.8, y: 3.8 } };

  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 3.5, y: 1 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "ي", position: { x: 5.5, y: 1 } };
  const vK: CanonicalVertexNode = { id: `${opts.figureId}_vK`, label: notation === "english" ? "K" : "ك", position: { x: 3.5, y: 7.2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAG`, fromVertexId: vA.id, toVertexId: vG.id, tickMarks: 1 },
    { id: `${opts.figureId}_sGF`, fromVertexId: vG.id, toVertexId: vF.id, tickMarks: 1 },
    { id: `${opts.figureId}_sFB`, fromVertexId: vF.id, toVertexId: vB.id, tickMarks: 1 },
    { id: `${opts.figureId}_sFD`, fromVertexId: vF.id, toVertexId: vD.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sGE`, fromVertexId: vG.id, toVertexId: vE.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sGK`, fromVertexId: vG.id, toVertexId: vK.id, lengthLabel: { value: 8, unit: "سم" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "توازيات متعددة FD // GE مع أجزاء متساوية لإيجاد طول KE = 24 سم",
    notationLanguage: notation,
    vertices: [vA, vG, vF, vB, vD, vE, vC, vK],
    segments,
    angles: [],
  };
}
