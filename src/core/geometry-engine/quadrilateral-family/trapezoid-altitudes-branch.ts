/**
 * @file trapezoid-altitudes-branch.ts
 * @description فرع منبثق من أصل الرباعي (`quadrilateral-root-core.ts`):
 * يمثل شبه المنحرف المتساوي الساقين أو القائم وخواص القاعدتين المتوازيتين والقاعدة المتوسطة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 110 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";
import { createQuadrilateralRootCore } from "./quadrilateral-root-core";

export const MODULE_ID_TRAPEZOID_ALTITUDES_BRANCH =
  "trapezoid_altitudes_branch" as const;

export function buildTrapezoidAltitudesFigure(params: {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}): CanonicalGeometryFigureIR {
  const root = createQuadrilateralRootCore({
    idPrefix: params.figureId,
    baseWidthCm: 10,
    heightCm: 5,
    topSkewOffsetCm: -2,
    topWidthCm: 6,
    notationLanguage: params.notationLanguage,
  });

  return {
    figureId: params.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_trapezoid_with_altitudes",
    titleArabic: `شبه المنحرف ${root.vA.label}${root.vB.label}${root.vC.label}${root.vD.label} فيه ${root.vA.label}${root.vD.label} ∥ ${root.vB.label}${root.vC.label}`,
    notationLanguage: root.notationLanguage,
    vertices: [root.vA, root.vB, root.vC, root.vD],
    segments: root.perimeterSegments.map((seg, idx) =>
      idx === 1 || idx === 3 ? { ...seg, parallelArrows: 1 } : seg
    ),
    angles: [],
  };
}
