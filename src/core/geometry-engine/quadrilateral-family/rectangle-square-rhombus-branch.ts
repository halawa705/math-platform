/**
 * @file rectangle-square-rhombus-branch.ts
 * @description فرع منبثق من أصل الرباعي (`quadrilateral-root-core.ts`):
 * يمثل المستطيل والمربع والمعين وخواص تساوي أو تعامد القطرين.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 110 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";
import { createQuadrilateralRootCore } from "./quadrilateral-root-core";

export const MODULE_ID_RECTANGLE_SQUARE_RHOMBUS_BRANCH =
  "rectangle_square_rhombus_branch" as const;

export function buildRectangleSquareRhombusFigure(params: {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}): CanonicalGeometryFigureIR {
  const root = createQuadrilateralRootCore({
    idPrefix: params.figureId,
    baseWidthCm: 8,
    heightCm: 5,
    topSkewOffsetCm: 0,
    notationLanguage: params.notationLanguage,
  });

  return {
    figureId: params.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: `المستطيل ${root.vA.label}${root.vB.label}${root.vC.label}${root.vD.label} قطراه متساويان في الطول وينصف كل منهما الآخر`,
    notationLanguage: root.notationLanguage,
    vertices: [root.vA, root.vB, root.vC, root.vD, root.centerM],
    segments: [
      ...root.perimeterSegments,
      {
        id: `${params.figureId}_AC`,
        fromVertexId: root.vA.id,
        toVertexId: root.vC.id,
        strokeStyle: "dashed",
      },
      {
        id: `${params.figureId}_BD`,
        fromVertexId: root.vB.id,
        toVertexId: root.vD.id,
        strokeStyle: "dashed",
      },
    ],
    angles: [],
  };
}
