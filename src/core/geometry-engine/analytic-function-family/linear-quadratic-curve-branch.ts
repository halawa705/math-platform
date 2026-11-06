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
import { toWesternNumeralsSSOT, type MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";
import { createCartesianPlaneRootCore } from "./cartesian-plane-root-core";

export const MODULE_ID_LINEAR_QUADRATIC_CURVE_BRANCH =
  "linear_quadratic_curve_branch" as const;

export function buildQuadraticParabolaCurveFigure(params: {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
  readonly description?: string;
  readonly vertexX?: number;
  readonly vertexY?: number;
}): CanonicalGeometryFigureIR {
  const plane = createCartesianPlaneRootCore({
    idPrefix: params.figureId,
    spanUnits: 5,
    notationLanguage: params.notationLanguage,
  });

  const cleanDesc = params.description ? toWesternNumeralsSSOT(params.description) : "";
  const vertexCoordMatch = cleanDesc.match(/رأس\s*المنحنى\s*[A-Za-zأ-ي]?\s*\(\s*(-?\d+(?:\.\d+)?)\s*[,،]\s*(-?\d+(?:\.\d+)?)\s*\)/);
  const shiftConstMatch = !vertexCoordMatch ? cleanDesc.match(/(?:س²|x\^2|س\^2)\s*([+-])\s*(\d+(?:\.\d+)?)/i) : null;

  const hasExplicitVertex = Boolean(vertexCoordMatch || shiftConstMatch || params.vertexX !== undefined || params.vertexY !== undefined);
  const vx = params.vertexX ?? (vertexCoordMatch ? Number(vertexCoordMatch[1]) : 0);
  const vy = params.vertexY ?? (vertexCoordMatch ? Number(vertexCoordMatch[2]) : shiftConstMatch ? (shiftConstMatch[1] === "-" ? -Number(shiftConstMatch[2]) : Number(shiftConstMatch[2])) : -3);

  const rootDist = vy < 0 ? Math.sqrt(-vy) : 2;
  const pNegRoot: CanonicalVertexNode = {
    id: `${params.figureId}_p_neg2`,
    label: "",
    position: { x: Number((vx - rootDist).toFixed(2)), y: 0 },
  };
  const vertexV: CanonicalVertexNode = {
    id: `${params.figureId}_vertex_V`,
    label: hasExplicitVertex
      ? vertexCoordMatch
        ? `(${vx}, ${vy})`
        : `${Math.abs(vy)}`
      : plane.notationLanguage === "english"
        ? "V"
        : "ن",
    position: { x: vx, y: vy },
  };
  const pPosRoot: CanonicalVertexNode = {
    id: `${params.figureId}_p_pos2`,
    label: "",
    position: { x: Number((vx + rootDist).toFixed(2)), y: 0 },
  };
  const pLeftTop: CanonicalVertexNode = {
    id: `${params.figureId}_p_lt`,
    label: "",
    position: { x: Number((vx - rootDist - 1.2).toFixed(2)), y: 3.5 },
  };
  const pRightTop: CanonicalVertexNode = {
    id: `${params.figureId}_p_rt`,
    label: "",
    position: { x: Number((vx + rootDist + 1.2).toFixed(2)), y: 3.5 },
  };

  return {
    figureId: params.figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: "التمثيل البياني لمنحنى الدالة التربيعية ورأس المنحنى ومحور التماثل",
    notationLanguage: plane.notationLanguage,
    coordinateGrid: { enabled: true, step: 1, showAxesArrows: true },
    vertices: [
      plane.originO,
      plane.xMaxVertex,
      plane.xMinVertex,
      plane.yMaxVertex,
      plane.yMinVertex,
      pLeftTop,
      pNegRoot,
      vertexV,
      pPosRoot,
      pRightTop,
    ],
    segments: [
      ...plane.axesSegments,
      { id: `${params.figureId}_c1`, fromVertexId: pLeftTop.id, toVertexId: pNegRoot.id },
      { id: `${params.figureId}_c2`, fromVertexId: pNegRoot.id, toVertexId: vertexV.id },
      { id: `${params.figureId}_c3`, fromVertexId: vertexV.id, toVertexId: pPosRoot.id },
      { id: `${params.figureId}_c4`, fromVertexId: pPosRoot.id, toVertexId: pRightTop.id },
    ],
    angles: [],
  };
}
