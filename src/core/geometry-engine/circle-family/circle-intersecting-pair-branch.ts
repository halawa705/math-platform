/**
 * @file circle-intersecting-pair-branch.ts
 * @description فرع منبثق من أصل الدائرة (`circle-root-core.ts`):
 * يمثل نظرية خط المركزين لدائرتين متقاطعتين يكون عمودياً على الوتر المشترك وينصفه.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";
import { createCircleRootCore } from "./circle-root-core";

export const MODULE_ID_CIRCLE_INTERSECTING_PAIR_BRANCH =
  "circle_intersecting_pair_branch" as const;

export function buildCircleIntersectingPairFigure(params: {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}): CanonicalGeometryFigureIR {
  const rootM = createCircleRootCore({
    idPrefix: `${params.figureId}_M`,
    radiusCm: 4.5,
    centerLabelArabic: "م",
    notationLanguage: params.notationLanguage || "arabic",
  });

  const centerN = rootM.getExternalPoint(6, 0, "ن");
  const ptA = rootM.getPointOnCircumference(48, "أ");
  const ptB = rootM.getPointOnCircumference(312, "ب");
  const midC = rootM.getMidpointBetween(ptA, ptB, "جـ");

  return {
    figureId: params.figureId,
    familyId: "circle_family",
    branchId: "circle_two_intersecting_or_touching",
    titleArabic: `الدائرتان المتقاطعتان ${rootM.centerVertex.label}، ${centerN.label} وخط المركزين عمودي على الوتر المشترك ${ptA.label}${ptB.label}`,
    notationLanguage: rootM.notationLanguage,
    vertices: [rootM.centerVertex, centerN, ptA, ptB, midC],
    segments: [
      {
        id: `${params.figureId}_MN`,
        fromVertexId: rootM.centerVertex.id,
        toVertexId: centerN.id,
      },
      {
        id: `${params.figureId}_AC`,
        fromVertexId: ptA.id,
        toVertexId: midC.id,
        tickMarks: 1,
      },
      {
        id: `${params.figureId}_CB`,
        fromVertexId: midC.id,
        toVertexId: ptB.id,
        tickMarks: 1,
      },
    ],
    angles: [],
  };
}
