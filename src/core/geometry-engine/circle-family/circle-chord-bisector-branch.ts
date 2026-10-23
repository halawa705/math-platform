/**
 * @file circle-chord-bisector-branch.ts
 * @description فرع منبثق من أصل الدائرة (`circle-root-core.ts`):
 * يمثل نظرية: المستقيم المار بمركز الدائرة وبمنتصف أي وتر فيها يكون عمودياً على هذا الوتر.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";
import { createCircleRootCore } from "./circle-root-core";

export const MODULE_ID_CIRCLE_CHORD_BISECTOR_BRANCH =
  "circle_chord_bisector_branch" as const;

export function buildCircleChordBisectorFigure(params: {
  readonly figureId: string;
  readonly radiusCm?: number;
  readonly notationLanguage?: MathNotationLanguage;
}): CanonicalGeometryFigureIR {
  const root = createCircleRootCore({
    idPrefix: params.figureId,
    radiusCm: params.radiusCm ?? 5,
    notationLanguage: params.notationLanguage || "arabic",
  });

  const ptA = root.getPointOnCircumference(220, "أ");
  const ptB = root.getPointOnCircumference(320, "ب");
  const midD = root.getMidpointBetween(ptA, ptB, "د");

  return {
    figureId: params.figureId,
    familyId: "circle_family",
    branchId: "circle_perpendicular_from_center_to_chord",
    titleArabic: `الدائرة ${root.centerVertex.label} فيها ${midD.label} منتصف الوتر ${ptA.label}${ptB.label}، إذن ${root.centerVertex.label}${midD.label} ⊥ ${ptA.label}${ptB.label}`,
    notationLanguage: root.notationLanguage,
    vertices: [root.centerVertex, ptA, ptB, midD],
    segments: [
      {
        id: `${params.figureId}_chord_AD`,
        fromVertexId: ptA.id,
        toVertexId: midD.id,
        tickMarks: 1,
      },
      {
        id: `${params.figureId}_chord_DB`,
        fromVertexId: midD.id,
        toVertexId: ptB.id,
        tickMarks: 1,
      },
      {
        id: `${params.figureId}_perp_MD`,
        fromVertexId: root.centerVertex.id,
        toVertexId: midD.id,
        strokeStyle: "dashed",
      },
      {
        id: `${params.figureId}_rad_MA`,
        fromVertexId: root.centerVertex.id,
        toVertexId: ptA.id,
        lengthLabel: { value: root.radiusCm, unit: "سم" },
      },
    ],
    angles: [],
  };
}
