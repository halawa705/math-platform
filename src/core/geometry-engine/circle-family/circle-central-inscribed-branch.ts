/**
 * @file circle-central-inscribed-branch.ts
 * @description فرع منبثق من أصل الدائرة (`circle-root-core.ts`):
 * يمثل نظرية الزاوية المحيطية تساوي نصف قياس الزاوية المركزية المشتركة معها في القوس.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";
import { createCircleRootCore } from "./circle-root-core";

export const MODULE_ID_CIRCLE_CENTRAL_INSCRIBED_BRANCH =
  "circle_central_inscribed_branch" as const;

export function buildCircleCentralInscribedFigure(params: {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}): CanonicalGeometryFigureIR {
  const root = createCircleRootCore({
    idPrefix: params.figureId,
    radiusCm: 5,
    notationLanguage: params.notationLanguage || "arabic",
  });

  const ptA = root.getPointOnCircumference(90, "أ");
  const ptB = root.getPointOnCircumference(225, "ب");
  const ptC = root.getPointOnCircumference(315, "جـ");

  return {
    figureId: params.figureId,
    familyId: "circle_family",
    branchId: "circle_central_and_inscribed_angles",
    titleArabic: `الزاوية المحيطية ∠${ptB.label}${ptA.label}${ptC.label} والزاوية المركزية ∠${ptB.label}${root.centerVertex.label}${ptC.label} المشتركتان في القوس`,
    notationLanguage: root.notationLanguage,
    vertices: [root.centerVertex, ptA, ptB, ptC],
    segments: [
      { id: `${params.figureId}_AB`, fromVertexId: ptA.id, toVertexId: ptB.id },
      { id: `${params.figureId}_AC`, fromVertexId: ptA.id, toVertexId: ptC.id },
      {
        id: `${params.figureId}_MB`,
        fromVertexId: root.centerVertex.id,
        toVertexId: ptB.id,
        strokeStyle: "dashed",
      },
      {
        id: `${params.figureId}_MC`,
        fromVertexId: root.centerVertex.id,
        toVertexId: ptC.id,
        strokeStyle: "dashed",
      },
    ],
    angles: [],
  };
}
