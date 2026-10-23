/**
 * @file rational-piecewise-trig-curve-branch.ts
 * @description فرع منبثق من أصل الشبكة الديكارتية (`cartesian-plane-root-core.ts`):
 * يمثل منحنيات الدوال الكسرية والدوال المثلثية (جا، جتا) والدوال المتعددة التعريف.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 110 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";
import { createCartesianPlaneRootCore } from "./cartesian-plane-root-core";

export const MODULE_ID_RATIONAL_PIECEWISE_TRIG_CURVE_BRANCH =
  "rational_piecewise_trig_curve_branch" as const;

export function buildTrigAndRationalCurveFigure(params: {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}): CanonicalGeometryFigureIR {
  const plane = createCartesianPlaneRootCore({
    idPrefix: params.figureId,
    spanUnits: 5,
    notationLanguage: params.notationLanguage,
  });

  return {
    figureId: params.figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: "التمثيل البياني للدالة على الشبكة المتعامدة",
    notationLanguage: plane.notationLanguage,
    vertices: [
      plane.originO,
      plane.xMaxVertex,
      plane.xMinVertex,
      plane.yMaxVertex,
      plane.yMinVertex,
    ],
    segments: [...plane.axesSegments],
    angles: [],
  };
}
