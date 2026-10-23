/**
 * @file parallelogram-diagonals-branch.ts
 * @description فرع منبثق من أصل الرباعي (`quadrilateral-root-core.ts`):
 * يمثل متوازي الأضلاع وخواص القطرين ينصف كل منهما الآخر في النقطة م.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 110 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";
import { createQuadrilateralRootCore } from "./quadrilateral-root-core";

export const MODULE_ID_PARALLELOGRAM_DIAGONALS_BRANCH =
  "parallelogram_diagonals_branch" as const;

export function buildParallelogramDiagonalsFigure(params: {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}): CanonicalGeometryFigureIR {
  const root = createQuadrilateralRootCore({
    idPrefix: params.figureId,
    baseWidthCm: 8,
    heightCm: 5,
    topSkewOffsetCm: 2,
    notationLanguage: params.notationLanguage,
  });

  return {
    figureId: params.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_parallelogram_diagonals",
    titleArabic: `متوازي الأضلاع ${root.vA.label}${root.vB.label}${root.vC.label}${root.vD.label} تقاطع قطراه في ${root.centerM.label}`,
    notationLanguage: root.notationLanguage,
    vertices: [root.vA, root.vB, root.vC, root.vD, root.centerM],
    segments: [
      ...root.perimeterSegments,
      {
        id: `${params.figureId}_diag_AC`,
        fromVertexId: root.vA.id,
        toVertexId: root.vC.id,
        strokeStyle: "dashed",
      },
      {
        id: `${params.figureId}_diag_BD`,
        fromVertexId: root.vB.id,
        toVertexId: root.vD.id,
        strokeStyle: "dashed",
      },
    ],
    angles: [],
  };
}
