/**
 * @file prep-similarity-deltoids-kites-builder.ts
 * @description منشئ أشكال الطائرة الورقية (الدالتون) المتشابهة بزوايا 92° وأبعاد متناسبة (كتاب المعاصر صورة 5 - تمرين 10).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
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

export const MODULE_ID_PREP_SIMILARITY_DELTOIDS_KITES_BUILDER =
  "prep_similarity_deltoids_kites_builder" as const;

export interface SimilarityDeltoidsKitesOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مضلعان على شكل طائرة ورقية (دالتون) بزوايا 92° وأبعاد متناسبة (صورة 5 - تمرين 10)
 */
export function buildSimilarKitesDeltoidsFigure(
  opts: SimilarityDeltoidsKitesOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_ktA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 3, y: 8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_ktB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 5, y: 5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_ktC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 3, y: 2 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_ktD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 1, y: 5 } };

  const vH: CanonicalVertexNode = { id: `${opts.figureId}_ktH`, label: notation === "english" ? "H" : "ح", position: { x: 11, y: 9.5 } };
  const vL: CanonicalVertexNode = { id: `${opts.figureId}_ktL`, label: notation === "english" ? "L" : "ل", position: { x: 15, y: 5 } };
  const vK: CanonicalVertexNode = { id: `${opts.figureId}_ktK`, label: notation === "english" ? "K" : "ك", position: { x: 11, y: 1 } };
  const vJ: CanonicalVertexNode = { id: `${opts.figureId}_ktJ`, label: notation === "english" ? "J" : "ن", position: { x: 8, y: 5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: 5, unit: "سم" } },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: 2.5, unit: "سم" } },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, lengthLabel: { value: 2.5, unit: "سم" } },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id, lengthLabel: { value: 5, unit: "سم" } },

    { id: `${opts.figureId}_sHL`, fromVertexId: vH.id, toVertexId: vL.id, lengthLabel: { value: 10, unit: "سم" } },
    { id: `${opts.figureId}_sLK`, fromVertexId: vL.id, toVertexId: vK.id, lengthLabel: { value: 5, unit: "سم" } },
    { id: `${opts.figureId}_sKJ`, fromVertexId: vK.id, toVertexId: vJ.id, lengthLabel: { value: 5, unit: "سم" } },
    { id: `${opts.figureId}_sJH`, fromVertexId: vJ.id, toVertexId: vH.id, lengthLabel: { value: 10, unit: "سم" } },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degrees: 92 },
    { id: `${opts.figureId}_aD`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degrees: 92 },
    { id: `${opts.figureId}_aL`, vertexId: vL.id, arm1VertexId: vH.id, arm2VertexId: vK.id, degrees: 92 },
    { id: `${opts.figureId}_aJ`, vertexId: vJ.id, arm1VertexId: vH.id, arm2VertexId: vK.id, degrees: 92 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: "طائرتان ورقيتان متشابهتان (دالتون) بزوايا 92°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vH, vL, vK, vJ],
    segments,
    angles,
  };
}
