/**
 * @file graph-fact-parser.ts
 * @description يحلل وسم [رسم بياني: ...] بسطور مفصولة بـ ; إلى CartesianGraphSpec.
 */
import type { CartesianGraphSpec, GraphFunctionSpec, GraphPointSpec } from "@/core/ssot/cartesian-graph-spec-ssot";
import { normalizeGeometryText } from "../fact-compositor/geo-fact-splitter";

export const MODULE_ID_GRAPH_FACT_PARSER = "graph_fact_parser" as const;

function parseSignedCoeff(raw: string | undefined, defaultIfEmpty = 1): number {
  if (!raw || raw.trim() === "" || raw.trim() === "+") return defaultIfEmpty;
  if (raw.trim() === "-") return -defaultIfEmpty;
  const n = Number(raw.replace(/\s+/g, ""));
  return Number.isFinite(n) ? n : defaultIfEmpty;
}

function parseSingleGraphFunction(line: string): GraphFunctionSpec | null {
  const s = line.replace(/\s+/g, "").replace(/د\(س\)|f\(x\)|y/gi, "ص").replace(/x/gi, "س").replace(/\^2|²/g, "²");
  let m: RegExpMatchArray | null;

  // دالة القيمة المطلقة: ص = a|س - h| + k
  if ((m = s.match(/^ص=([+-]?\d*(?:\.\d+)?)?\|س([+-]\d+(?:\.\d+)?)?\|([+-]\d+(?:\.\d+)?)?$/u))) {
    const a = parseSignedCoeff(m[1], 1);
    const negB = m[2] ? Number(m[2]) : 0;
    const c = m[3] ? Number(m[3]) : 0;
    return { kind: "absolute", a, b: -negB, c, label: line.trim() };
  }

  // دالة تربيعية: ص = aس² + bس + c
  if ((m = s.match(/^ص=([+-]?\d*(?:\.\d+)?)?س²(?:([+-]\d*(?:\.\d+)?)س)?([+-]\d+(?:\.\d+)?)?$/u))) {
    const a = parseSignedCoeff(m[1], 1);
    const b = m[2] !== undefined ? parseSignedCoeff(m[2], 1) : 0;
    const c = m[3] !== undefined ? Number(m[3]) : 0;
    return { kind: "quadratic", a, b, c, label: line.trim() };
  }

  // دالة خطية: ص = aس + b
  if ((m = s.match(/^ص=([+-]?\d*(?:\.\d+)?)?س([+-]\d+(?:\.\d+)?)?$/u))) {
    const a = parseSignedCoeff(m[1], 1);
    const b = m[2] !== undefined ? Number(m[2]) : 0;
    return { kind: "linear", a, b, c: 0, label: line.trim() };
  }

  // خط أفقي: ص = c
  if ((m = s.match(/^ص=([+-]?\d+(?:\.\d+)?)$/u))) {
    return { kind: "horizontal_line", a: Number(m[1]), b: 0, c: 0, label: line.trim() };
  }

  // خط رأسي: س = a
  if ((m = s.match(/^س=([+-]?\d+(?:\.\d+)?)$/u))) {
    return { kind: "vertical_line", a: Number(m[1]), b: 0, c: 0, label: line.trim() };
  }

  return null;
}

export function parseCartesianGraphDescription(rawDescription: string): CartesianGraphSpec | null {
  const cleaned = normalizeGeometryText(rawDescription)
    .replace(/^\[?\s*رسم\s*بياني\s*:\s*/u, "")
    .replace(/\]$/u, "");
  const parts = cleaned.split(/[;؛\n]/).map((s) => s.trim()).filter(Boolean);
  const functions: GraphFunctionSpec[] = [];
  const points: GraphPointSpec[] = [];
  let xMin = -5;
  let xMax = 5;
  let yMin = -5;
  let yMax = 5;

  for (const part of parts) {
    let m: RegExpMatchArray | null;
    if ((m = part.match(/المدى\s*س\s*من\s*([+-]?\d+(?:\.\d+)?)\s*إلى\s*([+-]?\d+(?:\.\d+)?)(?:\s*[،,]\s*ص\s*من\s*([+-]?\d+(?:\.\d+)?)\s*إلى\s*([+-]?\d+(?:\.\d+)?))?/u))) {
      xMin = Number(m[1]);
      xMax = Number(m[2]);
      if (m[3] && m[4]) {
        yMin = Number(m[3]);
        yMax = Number(m[4]);
      }
      continue;
    }
    if ((m = part.match(/^(?:نقطة\s*)?\(\s*([+-]?\d+(?:\.\d+)?)\s*[،,]\s*([+-]?\d+(?:\.\d+)?)\s*\)\s*(.*)$/u))) {
      points.push({ x: Number(m[1]), y: Number(m[2]), label: m[3]?.trim() || undefined });
      continue;
    }
    const fn = parseSingleGraphFunction(part);
    if (fn) functions.push(fn);
  }

  if (functions.length === 0 && points.length === 0) return null;

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
      yMin = Math.min(yMin, Math.floor(vy) - 1);
      yMax = Math.max(yMax, Math.ceil(vy) + 1);
    } else if (fn.kind === "absolute") {
      yMin = Math.min(yMin, Math.floor(fn.c) - 1);
      yMax = Math.max(yMax, Math.ceil(fn.c) + 1);
    }
  }

  return { xMin, xMax, yMin, yMax, functions, points };
}
