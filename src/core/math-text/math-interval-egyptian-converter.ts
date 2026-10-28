/**
 * @file math-interval-egyptian-converter.ts
 * @description المرحلة 2: الفترات بالاصطلاح المصري: `[a, b)` ← `[a, b[` و`(a, b]` ← `]a, b]` و`(-∞, b)` ← `]-∞, b[`.
 * الأزواج المرتبة `(x, y)` لا تُمس، والفترة المكتوبة في النص الخارجي تُغلَّف بمقطع رياضي معزول LTR.
 */

import { replaceOutsideMath, splitDollarSegments } from "./math-dollar-segment-utils";

export const MODULE_ID_MATH_INTERVAL_EGYPTIAN_CONVERTER =
  "math_interval_egyptian_converter" as const;

const BODY = "[^\\[\\]()$\\n]{1,30}?";
const INFINITY = "(?:\\\\infty|∞)";
const PLAIN_ENDPOINT = `-?\\s*(?:\\d+(?:\\.\\d+)?|${INFINITY}|[A-Za-z]|[أبجسص])`;
const INTERVAL_KEYWORDS =
  /(?:الفترة(?:\s+المفتوحة)?|فترة|تنتمي(?:\s+إلى)?|ينتمي(?:\s+إلى)?|مجال(?:\s+الدالة)?|المدى|مدى(?:\s+الدالة)?|\\in|∈)\s*$/;

function convertInsideMath(inner: string): string {
  return inner
    .replace(new RegExp(`\\[\\s*(${BODY})\\s*[,،]\\s*(${BODY})\\s*\\)`, "g"), (_m, a: string, b: string) => `[${a.trim()}, ${b.trim()}[`)
    .replace(new RegExp(`\\(\\s*(${BODY})\\s*[,،]\\s*(${BODY})\\s*\\]`, "g"), (_m, a: string, b: string) => `]${a.trim()}, ${b.trim()}]`)
    .replace(new RegExp(`\\(\\s*(-\\s*${INFINITY})\\s*[,،]\\s*(${BODY})\\s*\\)`, "g"), (_m, a: string, b: string) => `]${a.trim()}, ${b.trim()}[`)
    .replace(new RegExp(`\\(\\s*(${BODY})\\s*[,،]\\s*(\\+?\\s*${INFINITY})\\s*\\)`, "g"), (_m, a: string, b: string) => `]${a.trim()}, ${b.trim()}[`)
    .replace(new RegExp(`(\\\\in|∈|\\\\cup|\\\\cap|∪|∩)\\s*\\(\\s*(${BODY})\\s*[,،]\\s*(${BODY})\\s*\\)`, "g"),
      (_m, op: string, a: string, b: string) => `${op} ]${a.trim()}, ${b.trim()}[`);
}

export function convertEgyptianIntervals(line: string): string {
  const segs = splitDollarSegments(line);
  const pair = new RegExp(`^\\(\\s*(${BODY})\\s*[,،]\\s*(${BODY})\\s*\\)$`);
  for (let i = 1; i < segs.length; i += 2) {
    const inner = segs[i].slice(1, -1).trim();
    const keywordPair = INTERVAL_KEYWORDS.test(segs[i - 1]) ? inner.match(pair) : null;
    segs[i] = keywordPair
      ? `$]${keywordPair[1].trim()}, ${keywordPair[2].trim()}[$`
      : `$${convertInsideMath(inner)}$`;
  }
  return replaceOutsideMath(
    segs.join(""),
    new RegExp(`([\\[(])\\s*(${PLAIN_ENDPOINT})\\s*[,،]\\s*(${PLAIN_ENDPOINT})\\s*([\\])])`, "g"),
    (m, left: string, a: string, b: string, right: string) => {
      if (left === "(" && right === ")") return m;
      const open = left === "(" ? "]" : "[";
      const close = right === ")" ? "[" : "]";
      return ` $${open}${a.replace(/\s/g, "")}, ${b.replace(/\s/g, "")}${close}$ `;
    }
  );
}
