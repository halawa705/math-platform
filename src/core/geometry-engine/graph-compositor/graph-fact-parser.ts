/**
 * @file graph-fact-parser.ts
 * @description منسق تحليل وسوم الرسوم البيانية [رسم بياني: ...] إلى CartesianGraphSpec v2 (المرحلة 3):
 * يربط المحللات الذرية (الخطي، التربيعي، المقياس، متعدد التعريف، النقاط والمدى)
 * مع التحقق الصارم من الاتساق الرياضي وتفادي التناقض.
 * @invariant ملف ذري منسق باسم فريد عالمياً وفق دستور المنصة (< 150 سطراً).
 */

import type {
  CartesianGraphSpec,
  GraphFunctionSpec,
  GraphPointSpec,
  PiecewiseBranchSpec,
} from "@/core/ssot/cartesian-graph-spec-ssot";
import { normalizeGeometryText } from "../fact-compositor/geo-fact-splitter";
import { parseLinearFunctionOrInequality } from "./linear-function-parser";
import { parseQuadraticFunction } from "./quadratic-function-parser";
import { parseAbsoluteValueFunction } from "./absolute-value-function-parser";
import { parsePiecewiseBranch, assemblePiecewiseFunction } from "./piecewise-function-parser";
import { parseDomainRangeClause, parseCoordinatePoint } from "./graph-points-and-domain-parser";
import { checkCartesianGraphConsistency } from "./cartesian-consistency-checker";

export const MODULE_ID_GRAPH_FACT_PARSER = "graph_fact_parser" as const;

export function parseCartesianGraphDescription(rawDescription: string): CartesianGraphSpec | null {
  const cleaned = normalizeGeometryText(rawDescription)
    .replace(/^\[?\s*رسم\s*بياني\s*:\s*/u, "")
    .replace(/\]$/u, "");
  const parts = cleaned.split(/[;؛\n]/).map((s) => s.trim()).filter(Boolean);

  const functions: GraphFunctionSpec[] = [];
  const points: GraphPointSpec[] = [];
  const piecewiseBranches: PiecewiseBranchSpec[] = [];

  let xMin = -5;
  let xMax = 5;
  let yMin = -5;
  let yMax = 5;
  let explicitLimits = false;

  for (const part of parts) {
    // 1. نطاق المحاور الصريح
    const limits = parseDomainRangeClause(part);
    if (limits) {
      xMin = limits.xMin;
      xMax = limits.xMax;
      if (limits.yMin !== undefined && limits.yMax !== undefined) {
        yMin = limits.yMin;
        yMax = limits.yMax;
      }
      explicitLimits = true;
      continue;
    }

    // 2. النقاط الإحداثية
    const pt = parseCoordinatePoint(part);
    if (pt) {
      points.push(pt);
      continue;
    }

    // 3. فرع دالة متعددة التعريف
    const branch = parsePiecewiseBranch(part);
    if (branch) {
      piecewiseBranches.push(branch);
      continue;
    }

    // 4. دالة تربيعية
    const quad = parseQuadraticFunction(part, cleaned);
    if (quad) {
      functions.push(quad);
      continue;
    }

    // 5. دالة مقياس (قيمة مطلقة)
    const abs = parseAbsoluteValueFunction(part, cleaned);
    if (abs) {
      functions.push(abs);
      continue;
    }

    // 6. دالة أو متباينة خطية
    const lin = parseLinearFunctionOrInequality(part);
    if (lin) {
      functions.push(lin);
      continue;
    }
  }

  // تجميع الفروع متعددة التعريف إن وُجدت
  if (piecewiseBranches.length > 0) {
    functions.push(assemblePiecewiseFunction(piecewiseBranches));
  }

  if (functions.length === 0 && points.length === 0) return null;

  // توسيع المدى تلقائياً إن لم يُحدد صراحة ليشمل جميع النقاط الحرجة
  if (!explicitLimits) {
    for (const pt of points) {
      xMin = Math.min(xMin, Math.floor(pt.x) - 1);
      xMax = Math.max(xMax, Math.ceil(pt.x) + 1);
      yMin = Math.min(yMin, Math.floor(pt.y) - 1);
      yMax = Math.max(yMax, Math.ceil(pt.y) + 1);
    }
    for (const fn of functions) {
      if (fn.kind === "quadratic" && fn.a !== 0) {
        const vx = -fn.b / (2 * fn.a);
        const vy = fn.a * vx * vx + fn.b * vx + fn.c;
        xMin = Math.min(xMin, Math.floor(vx) - 3);
        xMax = Math.max(xMax, Math.ceil(vx) + 3);
        yMin = Math.min(yMin, Math.floor(vy) - 2);
        yMax = Math.max(yMax, Math.ceil(vy) + 2);
      } else if (fn.kind === "absolute") {
        xMin = Math.min(xMin, Math.floor(fn.b) - 3);
        xMax = Math.max(xMax, Math.ceil(fn.b) + 3);
        yMin = Math.min(yMin, Math.floor(fn.c) - 2);
        yMax = Math.max(yMax, Math.ceil(fn.c) + 2);
      }
    }
  }

  const spec: CartesianGraphSpec = { xMin, xMax, yMin, yMax, functions, points };

  // فحص الاتساق: رفض التناقض الرياضي الصريح
  const report = checkCartesianGraphConsistency(spec);
  if (!report.isValid) {
    return null;
  }

  return spec;
}
