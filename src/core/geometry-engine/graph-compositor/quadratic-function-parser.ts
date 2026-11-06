/**
 * @file quadratic-function-parser.ts
 * @description محلل الدوال والمنحنيات التربيعية على المستوى الإحداثي (المرحلة 3.1 + 3.4):
 * - ص = aس² + bس + c
 * - صيغة الرأس: ص = a(س - h)² + k
 * - استخراج إحداثيات الرأس ومحور التماثل تلقائياً بدقة هندسية حتمية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (< 150 سطراً).
 */

import type { GraphFunctionSpec, GraphPointSpec } from "@/core/ssot/cartesian-graph-spec-ssot";
import { parseSignedCoeff } from "./linear-function-parser";

export const MODULE_ID_QUADRATIC_FUNCTION_PARSER = "quadratic_function_parser" as const;

function normalizeQuadraticSyntax(raw: string): string {
  return raw
    .replace(/\s+/g, "")
    .replace(/د\(س\)|f\(x\)|y/gi, "ص")
    .replace(/x/gi, "س")
    .replace(/\^2|²/g, "²");
}

export function parseQuadraticFunction(
  rawLine: string,
  contextText = ""
): GraphFunctionSpec | null {
  const s = normalizeQuadraticSyntax(rawLine);
  let m: RegExpMatchArray | null;

  let a = 0;
  let b = 0;
  let c = 0;
  let matched = false;

  // 1. صيغة الرأس: ص = a(س [+-] h)² [+-] k
  if ((m = s.match(/^ص=([+-]?\d*(?:\.\d+)?)?\(س([+-]\d+(?:\.\d+)?)?\)(?:²|\^2)([+-]\d+(?:\.\d+)?)?$/u))) {
    a = parseSignedCoeff(m[1], 1);
    const negH = m[2] ? Number(m[2]) : 0;
    const h = -negH;
    const k = m[3] ? Number(m[3]) : 0;
    // تحويل الرأس إلى الصورة القياسية: a(س - h)² + k = a(س² - 2hx + h²) + k = aس² - 2ahس + (ah² + k)
    b = -2 * a * h;
    c = a * h * h + k;
    matched = true;
  }
  // 2. الصورة العامة القياسية: ص = aس² + bس + c
  else if ((m = s.match(/^ص=([+-]?\d*(?:\.\d+)?)?س²(?:([+-]\d*(?:\.\d+)?)س)?([+-]\d+(?:\.\d+)?)?$/u))) {
    a = parseSignedCoeff(m[1], 1);
    b = m[2] !== undefined ? parseSignedCoeff(m[2], 1) : 0;
    c = m[3] !== undefined ? Number(m[3]) : 0;
    matched = true;
  }

  if (!matched || a === 0) return null;

  // حساب الرأس ومحور التماثل
  const vx = -b / (2 * a);
  const vy = a * vx * vx + b * vx + c;

  const showVertex = /(?:رأس|نقطة\s*الرأس|القيمة\s*العظمى|القيمة\s*الصغرى)/i.test(contextText);
  const showAxis = /(?:محور\s*التماثل|خط\s*التماثل)/i.test(contextText);

  const vertexPoint: GraphPointSpec | undefined = showVertex
    ? { x: Number(vx.toFixed(2)), y: Number(vy.toFixed(2)), label: "رأس المنحنى", style: "solid" }
    : undefined;

  const axisOfSymmetry = showAxis ? Number(vx.toFixed(2)) : undefined;

  return {
    kind: "quadratic",
    a,
    b,
    c,
    label: rawLine.trim(),
    vertexPoint,
    axisOfSymmetry,
  };
}
