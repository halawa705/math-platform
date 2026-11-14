/**
 * @file geo-parallel-transversals-parser.ts
 * @description محلل معطيات نظرية المستقيمات المتوازية والقواطع (المتوازيات، سلاسل التساوي، الأطوال، والقواطع).
 * @invariant ملف ذري مستقل باسم فريد عالمياً (< 250 سطراً وفق AGENTS.md).
 */

export const MODULE_ID_GEO_PARALLEL_TRANSVERSALS_PARSER =
  "geo_parallel_transversals_parser" as const;

export interface TransversalSpec {
  points: string[];
  equalTicks: boolean;
  uniformSegValue?: string;
  segLabels: Map<number, string>;
  compositeSpans: { startIdx: number; endIdx: number; label: string }[];
}

export const FORBIDDEN_PARALLEL_POLYGON_RE =
  /(?:مثلث|متوازي\s*أضلاع|شبه\s*منحرف|مستطيل|معين|مربع|شكل\s*رباعي|دائرة|\\triangle)/;

const SUBSCRIPT_DIGITS: Record<string, string> = {
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
};

export function stripParallelLatexNoise(raw: string): string {
  return raw
    .replace(/\\overleftrightarrow\s*\{([^}]+)\}/g, "$1")
    .replace(/\\overrightarrow\s*\{([^}]+)\}/g, "$1")
    .replace(/\\overline\s*\{([^}]+)\}/g, "$1")
    .replace(/\\parallel/g, "//")
    .replace(/\$/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/([a-zA-Z])_\{?(\d+)\}?/g, "$1$2");
}

export function formatParallelExpressionValue(raw: string): string {
  return raw
    .replace(/\s*سم\s*$/u, "")
    .replace(/x\^2/gi, "x²")
    .replace(/y\^2/gi, "y²")
    .replace(/a\^2/gi, "a²")
    .replace(/([a-zA-Z])\s*\^\s*2/g, "$1²")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractParallelEqualChains(
  text: string
): { chain: string[]; value?: string }[] {
  const results: { chain: string[]; value?: string }[] = [];
  const re = /\b([A-Z]{2})(?:\s*=\s*([A-Z]{2}))+(?:\s*=\s*([0-9]+(?:\.[0-9]+)?))?/g;
  for (const m of text.matchAll(re)) {
    const parts = m[0].split(/\s*=\s*/).map((s) => s.trim());
    const segs = parts.filter((p) => /^[A-Z]{2}$/.test(p));
    const valPart = parts.find((p) => /^[0-9]+(?:\.[0-9]+)?$/.test(p));
    if (segs.length < 2) continue;
    const chain: string[] = [segs[0][0], segs[0][1]];
    for (let i = 1; i < segs.length; i++) {
      const s = segs[i];
      const last = chain[chain.length - 1];
      if (s[0] === last) chain.push(s[1]);
      else if (s[1] === last) chain.push(s[0]);
      else if (i === 1 && s[0] === segs[0][0]) {
        chain.reverse();
        chain.push(s[1]);
      } else if (i === 1 && s[1] === segs[0][0]) {
        chain.reverse();
        chain.push(s[0]);
      }
    }
    if (chain.length >= 3) results.push({ chain, value: valPart });
  }
  return results;
}

export function extractParallelNamedSegLengths(text: string): Map<string, string> {
  const map = new Map<string, string>();
  const re = /\b([A-Z]{2})\s*=\s*([^;؛\n،]+?)(?=\s*(?:سم|متر|؛|;|،|\n|$))/g;
  for (const m of text.matchAll(re)) {
    const seg = m[1];
    const rhs = m[2].trim();
    if (/^[A-Z]{2}(?:\s*=|$)/.test(rhs)) continue;
    if (!/[0-9xyaXYA]/.test(rhs)) continue;
    const cleanVal = formatParallelExpressionValue(rhs);
    if (cleanVal) {
      map.set(`${seg[0]}|${seg[1]}`, cleanVal);
      map.set(`${seg[1]}|${seg[0]}`, cleanVal);
    }
  }
  return map;
}

export function extractCommaVertexListAfterMarker(
  text: string,
  marker: RegExp
): string[] | null {
  const m = marker.exec(text);
  if (!m) return null;
  const tail = text.slice(m.index + m[0].length, m.index + m[0].length + 60);
  const ptsMatch = /^[:\s]*([A-Z](?:\s*[;,،؛و]\s*[A-Z]){2,4})\b/.exec(tail);
  if (!ptsMatch) return null;
  return ptsMatch[1]
    .split(/\s*[;,،؛و]\s*/)
    .map((s) => s.trim())
    .filter((s) => /^[A-Z]$/.test(s));
}

export function detectParallelLineCountAndNames(givens: string): {
  count: number;
  namedPairs: [string, string][] | null;
  lineLabels: string[];
} | null {
  const namedChain = givens.match(/\b[A-Z]{2}(?:\s*\/\/\s*[A-Z]{2}){2,4}\b/);
  if (namedChain) {
    const tokens = namedChain[0].split(/\s*\/\/\s*/).map((s) => s.trim());
    return {
      count: tokens.length,
      namedPairs: tokens.map((t) => [t[0], t[1]] as [string, string]),
      lineLabels: [],
    };
  }

  const numChain = givens.match(/\bl\s*[1-5](?:\s*\/\/\s*l\s*[1-5]){2,4}\b/i);
  if (numChain) {
    const nums = numChain[0].split(/\s*\/\/\s*/).map((s) => s.replace(/[^1-5]/g, ""));
    return {
      count: nums.length,
      namedPairs: null,
      lineLabels: nums.map((d) => `l${SUBSCRIPT_DIGITS[d] ?? d}`),
    };
  }

  const countMap: Record<string, number> = {
    ثلاثة: 3, ثلاث: 3, أربعة: 4, أربع: 4, خمسة: 5, خمس: 5,
  };
  const arMatch = givens.match(/(ثلاثة|ثلاث|أربعة|أربع|خمسة|خمس)\s+مستقيمات\s+متوازية/);
  if (arMatch) {
    return { count: countMap[arMatch[1]] ?? 4, namedPairs: null, lineLabels: [] };
  }
  return null;
}

export function mapVertexChainFromLines(
  pairs: [string, string][],
  givens: string,
  eqChains: { chain: string[]; value?: string }[],
  namedLens: Map<string, string>
): {
  t1: string[];
  t2: string[];
  sharedApex: boolean;
  extraTipOnLine0?: string;
} {
  const n = pairs.length;
  let t1: string[] =
    eqChains.length > 0 && eqChains[0].chain.length === n
      ? [...eqChains[0].chain]
      : pairs.map((p) => p[0]);

  const q2Match = givens.match(/القاطع\s*(?:الثاني|الآخر)\s*([A-Z]{2})\b/);
  const otherLetters = pairs.map((p, idx) => (p[0] === t1[idx] ? p[1] : p[0]));

  const p0 = t1[0];
  const r1 = otherLetters[1];
  const connectsApexToOther =
    namedLens.has(`${p0}|${r1}`) ||
    Boolean(q2Match && q2Match[1][0] === p0 && q2Match[1][1] === otherLetters[n - 1]) ||
    new RegExp(`\\b${p0}\\s*${r1}\\b`).test(givens) ||
    new RegExp(`تنتميان\\s*إلى\\s*${p0}${otherLetters[n - 1]}`).test(givens);

  if (connectsApexToOther) {
    return {
      t1,
      t2: [p0, ...otherLetters.slice(1)],
      sharedApex: true,
      extraTipOnLine0: otherLetters[0],
    };
  }
  return { t1, t2: otherLetters, sharedApex: false };
}

export function applyLengthsToTransversal(
  spec: TransversalSpec,
  namedLens: Map<string, string>,
  n: number
): void {
  const pts = spec.points;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = pts[i];
      const b = pts[j];
      if (!a || !b) continue;
      const val = namedLens.get(`${a}|${b}`);
      if (!val) continue;
      if (j === i + 1) spec.segLabels.set(i, val);
      else spec.compositeSpans.push({ startIdx: i, endIdx: j, label: val });
    }
  }
}
