/**
 * @file prep-similarity-general-quads-builder.ts
 * @description منشئ الأشكال الرباعية العامة المتشابهة المحتوية على جذور وزوايا وعلامات تطابق
 * وفق نماذج كتاب المعاصر لدرس «تشابه المضلعات» (الصف الأول الثانوي / الإعدادي).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
  CanonicalAngleNode,
} from "../../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  type MathNotationLanguage,
} from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_PREP_SIMILARITY_GENERAL_QUADS_BUILDER =
  "prep_similarity_general_quads_builder" as const;

export interface SimilarityGeneralQuadsOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مضلعان رباعيان متشابهان مع جذور وزاوية قائمة وزوايا 60° و 150° ومجاهيل x, y, z (مثال 2)
 */
export function buildSimilarQuadsWithRadicalsAndAnglesFigure(
  opts: SimilarityGeneralQuadsOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  // المضلع الأول ABCD
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 1, y: 1 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 7.5, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 5, y: 8 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 1, y: 4 } };

  // المضلع الثاني EFGH
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 16, y: 7 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: notation === "english" ? "F" : "و", position: { x: 10, y: 7 } };
  const vG: CanonicalVertexNode = { id: `${opts.figureId}_vG`, label: notation === "english" ? "G" : "ع", position: { x: 13.5, y: 1 } };
  const vH: CanonicalVertexNode = { id: `${opts.figureId}_vH`, label: notation === "english" ? "H" : "ح", position: { x: 16, y: 4.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: "6.5", unit: "سم" } },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: "8", unit: "سم" } },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, lengthLabel: { value: "5", unit: "سم" } },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id, lengthLabel: { value: "1.5√3", unit: "سم" } },

    { id: `${opts.figureId}_sEF`, fromVertexId: vE.id, toVertexId: vF.id, lengthLabel: { value: "(y - 1/3)", unit: "سم" } },
    { id: `${opts.figureId}_sFG`, fromVertexId: vF.id, toVertexId: vG.id, lengthLabel: { value: "z", unit: "سم" } },
    { id: `${opts.figureId}_sGH`, fromVertexId: vG.id, toVertexId: vH.id },
    { id: `${opts.figureId}_sHE`, fromVertexId: vH.id, toVertexId: vE.id, lengthLabel: { value: "√3", unit: "سم" } },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aA`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vD.id, isRightAngle: true },
    { id: `${opts.figureId}_aB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degreesLabel: "x°" },
    { id: `${opts.figureId}_aC`, vertexId: vC.id, arm1VertexId: vD.id, arm2VertexId: vB.id, degrees: 60 },

    { id: `${opts.figureId}_aE`, vertexId: vE.id, arm1VertexId: vF.id, arm2VertexId: vH.id, isRightAngle: true },
    { id: `${opts.figureId}_aH`, vertexId: vH.id, arm1VertexId: vE.id, arm2VertexId: vG.id, degrees: 150 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_hourglass_butterfly_similarity",
    titleArabic: "مضلعان رباعيان متشابهان ABCD ~ EFGH (جذور وزوايا خاصة)",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE, vF, vG, vH],
    segments,
    angles,
  };
}

/**
 * مضلعان رباعيان بزوايا 120° و 45° وأضلاع بها 10√3 و 10√2 (حاول بنفسك 2)
 */
export function buildSimilarQuadsWithObtuseAngleFigure(
  opts: SimilarityGeneralQuadsOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 3, y: 7 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 6.5, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 16.5, y: 1 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 9, y: 9.5 } };

  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 1, y: 4.5 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: notation === "english" ? "F" : "و", position: { x: 2.5, y: 1 } };
  const vG: CanonicalVertexNode = { id: `${opts.figureId}_vG`, label: notation === "english" ? "G" : "ع", position: { x: 8, y: 1 } };
  const vH: CanonicalVertexNode = { id: `${opts.figureId}_vH`, label: notation === "english" ? "H" : "ح", position: { x: 4.5, y: 6 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: "10√3", unit: "سم" } },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: "20", unit: "سم" } },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, lengthLabel: { value: "z", unit: "سم" } },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id },

    { id: `${opts.figureId}_sEF`, fromVertexId: vE.id, toVertexId: vF.id, lengthLabel: { value: "5√3", unit: "سم" } },
    { id: `${opts.figureId}_sFG`, fromVertexId: vF.id, toVertexId: vG.id, lengthLabel: { value: "y", unit: "سم" } },
    { id: `${opts.figureId}_sGH`, fromVertexId: vG.id, toVertexId: vH.id, lengthLabel: { value: "10√2", unit: "سم" } },
    { id: `${opts.figureId}_sHE`, fromVertexId: vH.id, toVertexId: vE.id },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degrees: 120 },
    { id: `${opts.figureId}_aD`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degreesLabel: "x°" },

    { id: `${opts.figureId}_aE`, vertexId: vE.id, arm1VertexId: vF.id, arm2VertexId: vH.id, isRightAngle: true },
    { id: `${opts.figureId}_aG`, vertexId: vG.id, arm1VertexId: vF.id, arm2VertexId: vH.id, degrees: 45 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_hourglass_butterfly_similarity",
    titleArabic: "مضلعان رباعيان متشابهان (زوايا 120° و 45° وجذور)",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE, vF, vG, vH],
    segments,
    angles,
  };
}

/**
 * مضلعان رباعيان بهما علامات زوايا متطابقة × و • مع زاوية 60° (حاول بنفسك 1)
 */
export function buildSimilarQuadsWithAngleMarksFigure(
  opts: SimilarityGeneralQuadsOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_mA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 7, y: 5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_mB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 10, y: 9 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_mC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 12.5, y: 5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_mD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 10, y: 1 } };

  const vE: CanonicalVertexNode = { id: `${opts.figureId}_mE`, label: notation === "english" ? "E" : "هـ", position: { x: 3, y: 1 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_mF`, label: notation === "english" ? "F" : "و", position: { x: 5.5, y: 4.5 } };
  const vG: CanonicalVertexNode = { id: `${opts.figureId}_mG`, label: notation === "english" ? "G" : "ع", position: { x: 2.5, y: 6.5 } };
  const vH: CanonicalVertexNode = { id: `${opts.figureId}_mH`, label: notation === "english" ? "H" : "ح", position: { x: 0.5, y: 4.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: 10, unit: "سم" } },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: 10, unit: "سم" } },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, lengthLabel: { value: 9, unit: "سم" } },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id, lengthLabel: { value: 8, unit: "سم" } },

    { id: `${opts.figureId}_sEF`, fromVertexId: vE.id, toVertexId: vF.id, lengthLabel: { value: 7.5, unit: "سم" } },
    { id: `${opts.figureId}_sFG`, fromVertexId: vF.id, toVertexId: vG.id, lengthLabel: { value: 7.5, unit: "سم" } },
    { id: `${opts.figureId}_sGH`, fromVertexId: vG.id, toVertexId: vH.id, lengthLabel: { value: 4.5, unit: "سم" } },
    { id: `${opts.figureId}_sHE`, fromVertexId: vH.id, toVertexId: vE.id, lengthLabel: { value: 6, unit: "سم" } },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degrees: 60 },
    { id: `${opts.figureId}_aA`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vD.id, markSymbol: "cross" },
    { id: `${opts.figureId}_aC`, vertexId: vC.id, arm1VertexId: vB.id, arm2VertexId: vD.id, markSymbol: "dot" },

    { id: `${opts.figureId}_aF`, vertexId: vF.id, arm1VertexId: vE.id, arm2VertexId: vG.id, degrees: 60 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_hourglass_butterfly_similarity",
    titleArabic: "مضلعان رباعيان متشابهان مع علامات زوايا متطابقة",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE, vF, vG, vH],
    segments,
    angles,
  };
}
