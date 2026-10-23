/**
 * @file circle-cyclic-quad-branch.ts
 * @description فرع منبثق من أصل الدائرة (`circle-root-core.ts`):
 * يمثل الشكل الرباعي الدائري وخواص الزوايا المتقابلة المتكاملة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";
import { createCircleRootCore } from "./circle-root-core";

export const MODULE_ID_CIRCLE_CYCLIC_QUAD_BRANCH =
  "circle_cyclic_quad_branch" as const;

export function buildCircleCyclicQuadFigure(params: {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}): CanonicalGeometryFigureIR {
  const root = createCircleRootCore({
    idPrefix: params.figureId,
    radiusCm: 5,
    notationLanguage: params.notationLanguage || "arabic",
  });

  const ptA = root.getPointOnCircumference(60, "أ");
  const ptB = root.getPointOnCircumference(320, "ب");
  const ptC = root.getPointOnCircumference(215, "جـ");
  const ptD = root.getPointOnCircumference(130, "د");

  return {
    figureId: params.figureId,
    familyId: "circle_family",
    branchId: "circle_inscribed_cyclic_quadrilateral",
    titleArabic: `الشكل الرباعي الدائري ${ptA.label}${ptB.label}${ptC.label}${ptD.label} المرسوم داخل الدائرة ${root.centerVertex.label}`,
    notationLanguage: root.notationLanguage,
    vertices: [root.centerVertex, ptA, ptB, ptC, ptD],
    segments: [
      { id: `${params.figureId}_AB`, fromVertexId: ptA.id, toVertexId: ptB.id },
      { id: `${params.figureId}_BC`, fromVertexId: ptB.id, toVertexId: ptC.id },
      { id: `${params.figureId}_CD`, fromVertexId: ptC.id, toVertexId: ptD.id },
      { id: `${params.figureId}_DA`, fromVertexId: ptD.id, toVertexId: ptA.id },
    ],
    angles: [],
  };
}
