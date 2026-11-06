/**
 * @file piecewise-function-parser.ts
 * @description محلل الدوال متعددة التعريف والدوال الدرجية (المرحلة 3.1 + 3.5):
 * - ص = f1 عندما س ≥ c
 * - ص = f2 عندما س < c
 * - يستخرج القواعد والمجالات الخاصة بكل فرع ويدمجها في دالة متكاملة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (< 150 سطراً).
 */

import type {
  DomainIntervalSpec,
  GraphFunctionSpec,
  PiecewiseBranchSpec,
} from "@/core/ssot/cartesian-graph-spec-ssot";
import { parseLinearFunctionOrInequality } from "./linear-function-parser";

export const MODULE_ID_PIECEWISE_FUNCTION_PARSER = "piecewise_function_parser" as const;

export function parseDomainCondition(rawCondition: string): DomainIntervalSpec {
  const s = rawCondition
    .replace(/\s+/g, "")
    .replace(/x/gi, "س")
    .replace(/≥/g, ">=")
    .replace(/≤/g, "<=");

  let m: RegExpMatchArray | null;

  // س >= c
  if ((m = s.match(/س>=([+-]?\d+(?:\.\d+)?)/))) {
    return { min: Number(m[1]), includeMin: true };
  }
  // س > c
  if ((m = s.match(/س>([+-]?\d+(?:\.\d+)?)/))) {
    return { min: Number(m[1]), includeMin: false };
  }
  // س <= c
  if ((m = s.match(/س<=([+-]?\d+(?:\.\d+)?)/))) {
    return { max: Number(m[1]), includeMax: true };
  }
  // س < c
  if ((m = s.match(/س<([+-]?\d+(?:\.\d+)?)/))) {
    return { max: Number(m[1]), includeMax: false };
  }
  // a <= س <= b أو a < س < b
  if ((m = s.match(/([+-]?\d+(?:\.\d+)?)(<=|<)س(<=|<)([+-]?\d+(?:\.\d+)?)/))) {
    return {
      min: Number(m[1]),
      includeMin: m[2] === "<=",
      max: Number(m[4]),
      includeMax: m[3] === "<=",
    };
  }

  return {};
}

export function parsePiecewiseBranch(rawBranch: string): PiecewiseBranchSpec | null {
  // فصل صيغة الدالة عن شرط المجال: «ص = 2س عندما س ≥ 0» أو «2س حيث س > 1»
  const parts = rawBranch.split(/(?:عندما|حيث|لكل|if)\s+/i);
  if (parts.length < 2) return null;

  const exprPart = parts[0].trim();
  const condPart = parts[1].trim();

  const domain = parseDomainCondition(condPart);
  // إذا لم يكن مكتوباً كـ ص = ... نضيف ص = لتسهيل التحليل
  const formula = /^ص\s*=|^(?:د\(س\)|f\(x\)|y)\s*=/i.test(exprPart) ? exprPart : `ص = ${exprPart}`;
  const baseFn = parseLinearFunctionOrInequality(formula);

  if (!baseFn) return null;

  return {
    kind: baseFn.kind as "linear" | "horizontal_line",
    a: baseFn.a,
    b: baseFn.b,
    c: baseFn.c,
    domain,
    label: rawBranch.trim(),
  };
}

export function assemblePiecewiseFunction(
  branches: readonly PiecewiseBranchSpec[],
  label = "دالة متعددة التعريف"
): GraphFunctionSpec {
  return {
    kind: "piecewise",
    a: 0,
    b: 0,
    c: 0,
    label,
    branches,
  };
}
