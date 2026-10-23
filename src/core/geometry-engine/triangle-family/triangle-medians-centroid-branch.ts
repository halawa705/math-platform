/**
 * @file triangle-medians-centroid-branch.ts
 * @description فرع منبثق من الأصل الواحد للمثلث (`triangle-root-core.ts`):
 * يمثل نظرية متوسطات المثلث المتقاطعة في نقطة واحدة (م) تقسم كلاً منها بنسبة 1 : 2 من جهة القاعدة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";
import { createTriangleRootCore } from "./triangle-root-core";

export const MODULE_ID_TRIANGLE_MEDIANS_CENTROID_BRANCH =
  "triangle_medians_centroid_branch" as const;

export function buildTriangleMediansCentroidFigure(params: {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}): CanonicalGeometryFigureIR {
  const root = createTriangleRootCore({
    idPrefix: params.figureId,
    kind: "isosceles",
    notationLanguage: params.notationLanguage || "arabic",
    baseLengthCm: 9,
    heightLengthCm: 6.5,
  });

  const midBC = root.getEdgeMidpoint("BC", "د");
  const midAC = root.getEdgeMidpoint("AC", "هـ");
  const centroidM = root.getCentroidPoint("م");

  return {
    figureId: params.figureId,
    familyId: "triangle_family",
    branchId: "triangle_medians_and_centroid",
    titleArabic: `متوسطات المثلث ${root.vertexTop.label}${root.vertexRight.label}${root.vertexLeft.label} المتقاطعة في النقطة ${centroidM.label} بنسبة ١ : ٢ من جهة القاعدة`,
    notationLanguage: root.notationLanguage,
    vertices: [
      root.vertexTop,
      root.vertexRight,
      root.vertexLeft,
      midBC,
      midAC,
      centroidM,
    ],
    segments: [
      ...root.baseSegments,
      {
        id: `${params.figureId}_median_AD`,
        fromVertexId: root.vertexTop.id,
        toVertexId: midBC.id,
        strokeStyle: "dashed",
      },
      {
        id: `${params.figureId}_median_BE`,
        fromVertexId: root.vertexRight.id,
        toVertexId: midAC.id,
        strokeStyle: "dashed",
      },
    ],
    angles: [],
  };
}
