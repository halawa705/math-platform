/**
 * @file linear-quadratic-curve-branch.ts
 * @description فرع منبثق من أصل الشبكة الديكارتية (`cartesian-plane-root-core.ts`):
 * يمثل منحنى الدالة التربيعية د(س) = س² - 4 ورأس المنحنى ونقاط التقاطع مع المحورين.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalVertexNode,
} from "../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";
import { createCartesianPlaneRootCore } from "./cartesian-plane-root-core";

export const MODULE_ID_LINEAR_QUADRATIC_CURVE_BRANCH =
  "linear_quadratic_curve_branch" as const;

export function buildQuadraticParabolaCurveFigure(params: {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}): CanonicalGeometryFigureIR {
  const plane = createCartesianPlaneRootCore({
    idPrefix: params.figureId,
    spanUnits: 5,
    notationLanguage: params.notationLanguage,
  });

  const pNeg2: CanonicalVertexNode = {
    id: `${params.figureId}_p_neg2`,
    label: "(-٢، ٠)",
    position: { x: -2.5, y: 0 },
  };
  const vertexV: CanonicalVertexNode = {
    id: `${params.figureId}_vertex_V`,
    label: "ن (٠، -٣)",
    position: { x: 0, y: -3 },
  };
  const pPos2: CanonicalVertexNode = {
    id: `${params.figureId}_p_pos2`,
    label: "(٢، ٠)",
    position: { x: 2.5, y: 0 },
  };
  const pLeftTop: CanonicalVertexNode = {
    id: `${params.figureId}_p_lt`,
    label: "أ",
    position: { x: -4, y: 3.5 },
  };
  const pRightTop: CanonicalVertexNode = {
    id: `${params.figureId}_p_rt`,
    label: "ب",
    position: { x: 4, y: 3.5 },
  };

  return {
    figureId: params.figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: "التمثيل البياني لمنحنى الدالة التربيعية ورأس المنحنى ومحور التماثل",
    notationLanguage: plane.notationLanguage,
    vertices: [
      plane.originO,
      plane.xMaxVertex,
      plane.xMinVertex,
      plane.yMaxVertex,
      plane.yMinVertex,
      pLeftTop,
      pNeg2,
      vertexV,
      pPos2,
      pRightTop,
    ],
    segments: [
      ...plane.axesSegments,
      { id: `${params.figureId}_c1`, fromVertexId: pLeftTop.id, toVertexId: pNeg2.id },
      { id: `${params.figureId}_c2`, fromVertexId: pNeg2.id, toVertexId: vertexV.id },
      { id: `${params.figureId}_c3`, fromVertexId: vertexV.id, toVertexId: pPos2.id },
      { id: `${params.figureId}_c4`, fromVertexId: pPos2.id, toVertexId: pRightTop.id },
    ],
    angles: [],
  };
}
