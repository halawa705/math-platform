/**
 * @file linear-quadratic-curve-branch.ts
 * @description واجهة فرع الدالة التربيعية (تفوّض إلى راسم الدوال الإحداثي المتطور `coordinate-functions-and-lines-plotter.ts`).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 30 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";
import { buildQuadraticFunctionCurveFigure } from "./coordinate-functions-and-lines-plotter";

export const MODULE_ID_LINEAR_QUADRATIC_CURVE_BRANCH =
  "linear_quadratic_curve_branch" as const;

export function buildQuadraticParabolaCurveFigure(params: {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
  readonly description?: string;
  readonly vertexX?: number;
  readonly vertexY?: number;
}): CanonicalGeometryFigureIR {
  return buildQuadraticFunctionCurveFigure(params);
}
