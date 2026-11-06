/**
 * @file absolute-value-function-parser.ts
 * @description محلل دوال القيمة المطلقة (المقياس) على المستوى الإحداثي (المرحلة 3.1 + 3.5):
 * - ص = a|س - h| + k
 * - ص = a|bس - h| + k (دوال المقياس المركبة)
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (< 150 سطراً).
 */

import type { GraphFunctionSpec, GraphPointSpec } from "@/core/ssot/cartesian-graph-spec-ssot";
import { parseSignedCoeff } from "./linear-function-parser";

export const MODULE_ID_ABSOLUTE_VALUE_FUNCTION_PARSER = "absolute_value_function_parser" as const;

function normalizeAbsoluteSyntax(raw: string): string {
  return raw
    .replace(/\s+/g, "")
    .replace(/د\(س\)|f\(x\)|y/gi, "ص")
    .replace(/x/gi, "س");
}

export function parseAbsoluteValueFunction(
  rawLine: string,
  contextText = ""
): GraphFunctionSpec | null {
  const s = normalizeAbsoluteSyntax(rawLine);
  let m: RegExpMatchArray | null;

  // 1. صيغة المقياس: ص = a | bس [+-] h | [+-] k
  if ((m = s.match(/^ص=([+-]?\d*(?:\.\d+)?)?\|([+-]?\d*(?:\.\d+)?)?س([+-]\d+(?:\.\d+)?)?\|([+-]\d+(?:\.\d+)?)?$/u))) {
    const a = parseSignedCoeff(m[1], 1);
    const bCoeff = parseSignedCoeff(m[2], 1);
    const negH = m[3] ? Number(m[3]) : 0;
    const k = m[4] ? Number(m[4]) : 0;

    // تحويل bس - h = 0 => س = h / b
    const h = -negH;
    const apexX = bCoeff !== 0 ? h / bCoeff : 0;
    const effectiveA = a * Math.abs(bCoeff);

    const showVertex = /(?:رأس|نقطة\s*التماثل|قمة)/i.test(contextText);
    const vertexPoint: GraphPointSpec | undefined = showVertex
      ? { x: Number(apexX.toFixed(2)), y: Number(k.toFixed(2)), label: "رأس الدالة", style: "solid" }
      : undefined;

    return {
      kind: "absolute",
      a: effectiveA,
      b: Number(apexX.toFixed(2)),
      c: k,
      label: rawLine.trim(),
      vertexPoint,
      axisOfSymmetry: Number(apexX.toFixed(2)),
    };
  }

  return null;
}
