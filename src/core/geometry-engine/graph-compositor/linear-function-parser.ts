/**
 * @file linear-function-parser.ts
 * @description محلل المعادلات والمتباينات الخطية على المستوى الإحداثي (المرحلة 3.1 + 3.2 + 3.3):
 * - ص = aس + b
 * - خطوط أفقية (ص = c) ورأسية (س = a)
 * - متباينات خطية (ص > aس + b، ص ≤ c، س ≥ a) مع تحديد تظليل نصف المستوى ونمط الخط (منقط/متصل).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (< 150 سطراً).
 */

import type {
  GraphFunctionSpec,
  InequalityOperator,
  HalfPlaneShading,
} from "@/core/ssot/cartesian-graph-spec-ssot";

export const MODULE_ID_LINEAR_FUNCTION_PARSER = "linear_function_parser" as const;

export function parseSignedCoeff(raw: string | undefined, defaultIfEmpty = 1): number {
  if (!raw || raw.trim() === "" || raw.trim() === "+") return defaultIfEmpty;
  if (raw.trim() === "-") return -defaultIfEmpty;
  const n = Number(raw.replace(/\s+/g, ""));
  return Number.isFinite(n) ? n : defaultIfEmpty;
}

function normalizeLinearSyntax(raw: string): string {
  return raw
    .replace(/\s+/g, "")
    .replace(/د\(س\)|f\(x\)|y/gi, "ص")
    .replace(/x/gi, "س")
    .replace(/≥/g, ">=")
    .replace(/≤/g, "<=");
}

export function parseLinearFunctionOrInequality(rawLine: string): GraphFunctionSpec | null {
  const s = normalizeLinearSyntax(rawLine);
  let m: RegExpMatchArray | null;

  // 1. متباينات خطية بدلالة ص: ص (>=|>|<=|<) aس + b
  if ((m = s.match(/^ص(>=|>|<=|<)([+-]?\d*(?:\.\d+)?)?س([+-]\d+(?:\.\d+)?)?$/u))) {
    const op = m[1] as InequalityOperator;
    const a = parseSignedCoeff(m[2], 1);
    const b = m[3] !== undefined ? Number(m[3]) : 0;
    const isStrict = op === ">" || op === "<";
    const shade: HalfPlaneShading = op.startsWith(">") ? "above" : "below";
    return {
      kind: "linear",
      a,
      b,
      c: 0,
      label: rawLine.trim(),
      inequalityOp: op,
      dashed: isStrict,
      shadeHalfPlane: shade,
    };
  }

  // 2. متباينات أفقية: ص (>=|>|<=|<) c
  if ((m = s.match(/^ص(>=|>|<=|<)([+-]?\d+(?:\.\d+)?)$/u))) {
    const op = m[1] as InequalityOperator;
    const c = Number(m[2]);
    const isStrict = op === ">" || op === "<";
    const shade: HalfPlaneShading = op.startsWith(">") ? "above" : "below";
    return {
      kind: "horizontal_line",
      a: c,
      b: 0,
      c: 0,
      label: rawLine.trim(),
      inequalityOp: op,
      dashed: isStrict,
      shadeHalfPlane: shade,
    };
  }

  // 3. متباينات رأسية: س (>=|>|<=|<) a
  if ((m = s.match(/^س(>=|>|<=|<)([+-]?\d+(?:\.\d+)?)$/u))) {
    const op = m[1] as InequalityOperator;
    const a = Number(m[2]);
    const isStrict = op === ">" || op === "<";
    const shade: HalfPlaneShading = op.startsWith(">") ? "right" : "left";
    return {
      kind: "vertical_line",
      a,
      b: 0,
      c: 0,
      label: rawLine.trim(),
      inequalityOp: op,
      dashed: isStrict,
      shadeHalfPlane: shade,
    };
  }

  // 4. معادلة خطية قياسية: ص = aس + b
  if ((m = s.match(/^ص=([+-]?\d*(?:\.\d+)?)?س([+-]\d+(?:\.\d+)?)?$/u))) {
    const a = parseSignedCoeff(m[1], 1);
    const b = m[2] !== undefined ? Number(m[2]) : 0;
    return { kind: "linear", a, b, c: 0, label: rawLine.trim() };
  }

  // 5. خط أفقي: ص = c
  if ((m = s.match(/^ص=([+-]?\d+(?:\.\d+)?)$/u))) {
    return { kind: "horizontal_line", a: Number(m[1]), b: 0, c: 0, label: rawLine.trim() };
  }

  // 6. خط رأسي: س = a
  if ((m = s.match(/^س=([+-]?\d+(?:\.\d+)?)$/u))) {
    return { kind: "vertical_line", a: Number(m[1]), b: 0, c: 0, label: rawLine.trim() };
  }

  return null;
}
