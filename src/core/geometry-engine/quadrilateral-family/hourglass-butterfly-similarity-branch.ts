/**
 * @file hourglass-butterfly-similarity-branch.ts
 * @description فرع منبثق من أصل الرباعي (`quadrilateral-root-core.ts`):
 * يمثل شكل الساعة الرملية (الفراشة) لتشابه مثلثين متقابلين بالرأس م مع توازي القاعدتين.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 110 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";
import { createQuadrilateralRootCore } from "./quadrilateral-root-core";

export const MODULE_ID_HOURGLASS_BUTTERFLY_SIMILARITY_BRANCH =
  "hourglass_butterfly_similarity_branch" as const;

export function buildHourglassButterflySimilarityFigure(params: {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}): CanonicalGeometryFigureIR {
  const root = createQuadrilateralRootCore({
    idPrefix: params.figureId,
    baseWidthCm: 9,
    heightCm: 6,
    topSkewOffsetCm: -1.5,
    topWidthCm: 6,
    notationLanguage: params.notationLanguage,
  });

  return {
    figureId: params.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_hourglass_butterfly_similarity",
    titleArabic: `تشابه المثلثين ${root.vA.label}${root.centerM.label}${root.vD.label}، ${root.vC.label}${root.centerM.label}${root.vB.label} بالتوازي والتقابل بالرأس`,
    notationLanguage: root.notationLanguage,
    vertices: [root.vA, root.vB, root.vC, root.vD, root.centerM],
    segments: [
      {
        id: `${params.figureId}_top_AD`,
        fromVertexId: root.vA.id,
        toVertexId: root.vD.id,
        parallelArrows: 1,
      },
      {
        id: `${params.figureId}_bot_BC`,
        fromVertexId: root.vB.id,
        toVertexId: root.vC.id,
        parallelArrows: 1,
      },
      {
        id: `${params.figureId}_cross_AC`,
        fromVertexId: root.vA.id,
        toVertexId: root.vC.id,
      },
      {
        id: `${params.figureId}_cross_BD`,
        fromVertexId: root.vB.id,
        toVertexId: root.vD.id,
      },
    ],
    angles: [],
  };
}
