/**
 * @file general-and-concave-polygon-placer.ts
 * @description باني حتمي للمضلعات المحدبة والمقعرة (4 إلى 10 أضلاع) والصليب المتماثل:
 * يحل المقادير الجبرية للزوايا، قيود التوازي الداخلية، والزوايا المنعكسة (> 180°) لإنتاج مضلع مغلق بلا تقاطع ذاتي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 260 سطراً).
 */

import type { GeoFact } from "../fact-compositor/geo-fact-types";
import { pairKey } from "../fact-compositor/geo-label-utils";
import { hasPolygonRingSelfIntersection } from "../verification/polygon-winding-and-self-intersection-guard";
import type { Vec2 } from "../fact-compositor/geo-vector-math";

export const MODULE_ID_GENERAL_AND_CONCAVE_POLYGON_PLACER =
  "general_and_concave_polygon_placer" as const;

type AngleOfFn = (v: string, polySet?: ReadonlySet<string>) => number | undefined;

interface LinearExpr {
  readonly a: number;
  readonly b: number;
}

function parseLinearXExpr(raw: string): LinearExpr | null {
  const s = raw.replace(/°|درجة|\s+/g, "").replace(/[()]/g, "").replace(/س/g, "x").replace(/X/g, "x");
  if (!/^[+\-0-9.x]+$/.test(s) || !s.includes("x")) return null;
  let a = 0;
  let b = 0;
  const terms = s.match(/[+\-]?[^+\-]+/g) ?? [];
  for (const term of terms) {
    if (term.endsWith("x")) {
      const coeffStr = term.slice(0, -1);
      const c = coeffStr === "" || coeffStr === "+" ? 1 : coeffStr === "-" ? -1 : Number(coeffStr);
      if (!Number.isFinite(c)) return null;
      a += c;
    } else {
      const c = Number(term);
      if (!Number.isFinite(c)) return null;
      b += c;
    }
  }
  return { a, b };
}

function resolvePolygonInteriorAngles(
  labels: readonly string[],
  facts: readonly GeoFact[],
  angleOf: AngleOfFn,
  isConcave?: boolean
): number[] | null {
  const n = labels.length;
  const polySet = new Set(labels);
  const totalSum = (n - 2) * 180;
  const resolved: Array<number | null> = labels.map((v) => angleOf(v, polySet) ?? null);

  // 1. حل التعبيرات الجبرية مثل 4x, 5x, 7x, 20x أو (2x - 3)
  const exprs: Array<LinearExpr | null> = labels.map((v) => {
    const f = facts.find((x) => x.k === "angle" && x.vertex === v && x.text && (!x.arms || x.arms.every((ar) => polySet.has(ar))));
    return f && f.k === "angle" && f.text ? parseLinearXExpr(f.text) : null;
  });
  let sumA = 0;
  let sumB = 0;
  let exprCount = 0;
  for (let i = 0; i < n; i++) {
    if (resolved[i] !== null) sumB += resolved[i]!;
    else if (exprs[i]) { sumA += exprs[i]!.a; sumB += exprs[i]!.b; exprCount++; }
  }
  if (exprCount >= 2 && Math.abs(sumA) > 1e-6 && resolved.every((r, i) => r !== null || exprs[i] !== null)) {
    const xVal = (totalSum - sumB) / sumA;
    if (xVal > 0.5) {
      for (let i = 0; i < n; i++) {
        if (resolved[i] === null && exprs[i]) {
          resolved[i] = Math.max(15, Math.min(320, exprs[i]!.a * xVal + exprs[i]!.b));
        }
      }
    }
  }

  // 2. استنتاج قيود التوازي بين ضلعين متتاليين عبر قاطع (مثل AE // BC => ∠A + ∠B = 180°)
  for (const pf of facts) {
    if (pf.k !== "parallel") continue;
    for (let i = 0; i < n; i++) {
      const a = labels[i];
      const b = labels[(i + 1) % n];
      const prev = labels[(i + n - 1) % n];
      const next = labels[(i + 2) % n];
      const matchPair =
        (pairKey(pf.a[0], pf.a[1]) === pairKey(prev, a) && pairKey(pf.b[0], pf.b[1]) === pairKey(b, next)) ||
        (pairKey(pf.b[0], pf.b[1]) === pairKey(prev, a) && pairKey(pf.a[0], pf.a[1]) === pairKey(b, next));
      if (!matchPair) continue;
      if (resolved[i] !== null && resolved[(i + 1) % n] === null) resolved[(i + 1) % n] = Math.max(25, 180 - resolved[i]!);
      else if (resolved[(i + 1) % n] !== null && resolved[i] === null) resolved[i] = Math.max(25, 180 - resolved[(i + 1) % n]!);
      else if (resolved[i] === null && resolved[(i + 1) % n] === null) {
        resolved[i] = 100;
        resolved[(i + 1) % n] = 80;
      }
    }
  }

  // 3. استنتاج الزوايا غير المعلومة المتبقية
  const missingIdxs = resolved.map((v, i) => (v === null ? i : -1)).filter((i) => i >= 0);
  if (missingIdxs.length === 0) {
    const curSum = resolved.reduce((s, v) => s! + v!, 0)!;
    if (Math.abs(curSum - totalSum) > 5) return null;
    return resolved as number[];
  }
  if (missingIdxs.length === n && !isConcave) return null;

  const knownSum = resolved.reduce<number>((s, v) => s + (v ?? 0), 0);
  const rem = totalSum - knownSum;
  if (rem <= missingIdxs.length * 15) return null;
  const share = rem / missingIdxs.length;
  for (const idx of missingIdxs) resolved[idx] = share;
  return resolved as number[];
}

function solveClosedPolygon(anglesDeg: readonly number[], baseLenScale = 5): Vec2[] | null {
  const n = anglesDeg.length;
  const dirs: Vec2[] = [];
  let theta = 0;
  for (let i = 0; i < n; i++) {
    dirs.push({ x: Math.cos(theta), y: Math.sin(theta) });
    const turn = (180 - anglesDeg[(i + 1) % n]) * (Math.PI / 180);
    theta += turn;
  }

  const lengthProfiles: Array<(i: number) => number> = [
    () => baseLenScale,
    (i) => (anglesDeg[i] > 180 || anglesDeg[(i + 1) % n] > 180 ? baseLenScale * 0.6 : baseLenScale * 1.4),
    (i) => (anglesDeg[i] < 50 || anglesDeg[(i + 1) % n] < 50 ? baseLenScale * 1.6 : baseLenScale * 0.8),
  ];

  for (const profile of lengthProfiles) {
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const det = dirs[p].x * dirs[q].y - dirs[p].y * dirs[q].x;
        if (Math.abs(det) < 0.14) continue;
        let rx = 0;
        let ry = 0;
        const lengths = Array.from({ length: n }, (_, i) => profile(i));
        for (let i = 0; i < n; i++) {
          if (i === p || i === q) continue;
          rx -= lengths[i] * dirs[i].x;
          ry -= lengths[i] * dirs[i].y;
        }
        const lp = (rx * dirs[q].y - ry * dirs[q].x) / det;
        const lq = (dirs[p].x * ry - dirs[p].y * rx) / det;
        if (lp < 0.9 || lq < 0.9 || lp > baseLenScale * 6 || lq > baseLenScale * 6) continue;
        lengths[p] = lp;
        lengths[q] = lq;

        const pts: Vec2[] = [{ x: 0, y: 0 }];
        for (let i = 0; i < n - 1; i++) {
          const prev = pts[pts.length - 1];
          pts.push({ x: prev.x + lengths[i] * dirs[i].x, y: prev.y + lengths[i] * dirs[i].y });
        }
        if (!hasPolygonRingSelfIntersection(pts)) return pts;
      }
    }
  }
  return null;
}

export function tryPlaceGeneralOrConcavePolygon(params: {
  readonly labels: readonly string[];
  readonly kind: string;
  readonly isRegular?: boolean;
  readonly isConcave?: boolean;
  readonly facts: readonly GeoFact[];
  readonly angleOf: AngleOfFn;
}): Vec2[] | null {
  const { labels, kind, isRegular, isConcave, facts, angleOf } = params;
  const n = labels.length;
  if (n < 4 || n > 10 || isRegular) return null;

  // 1. صليب متماثل ذو 8 أضلاع (90° و 270°)
  const has270 = facts.filter((f) => f.k === "angle" && f.deg === 270).length >= 2;
  if (n === 8 && has270) {
    return [
      { x: 0, y: 0 }, { x: 6, y: 0 }, { x: 6, y: 2 }, { x: 4, y: 2 },
      { x: 4, y: 6 }, { x: 2, y: 6 }, { x: 2, y: 2 }, { x: 0, y: 2 },
    ];
  }

  // 2. حل الزوايا الداخلية للمضلع
  const polySet = new Set(labels);
  const hasAnyAngleOrPar =
    Boolean(isConcave) ||
    facts.some((f) => (f.k === "angle" && polySet.has(f.vertex)) || f.k === "parallel");
  if (!hasAnyAngleOrPar) return null;

  if (n === 4 && (kind === "rectangle" || kind === "square" || kind === "rhombus" || kind === "parallelogram")) {
    return null;
  }

  const angles = resolvePolygonInteriorAngles(labels, facts, angleOf, isConcave);
  if (!angles) return null;

  const hasReflex = angles.some((a) => a > 180.5);
  const allLinearXAngles = labels.every((v) =>
    facts.some((f) => f.k === "angle" && f.vertex === v && Boolean(f.text) && parseLinearXExpr(f.text!) !== null)
  );
  const hasSideLengths = facts.some(
    (f) => f.k === "length" && polySet.has(f.seg[0]) && polySet.has(f.seg[1])
  );
  if (n === 4 && !isConcave && !hasReflex && !(allLinearXAngles && !hasSideLengths)) {
    return null;
  }
  const hasParallelOrCustom = n >= 5 || hasReflex || allLinearXAngles || Boolean(isConcave);
  if (!hasParallelOrCustom) return null;

  const solved = solveClosedPolygon(angles);
  if (solved) return solved;

  // احتياطي لمضلع مقعر برأس واحد غائر إذا فشل التوازن العام
  if (hasReflex) {
    const rIdx = angles.findIndex((a) => a > 180.5);
    const radius = 5.5;
    return labels.map((_, i) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
      const r = i === rIdx ? radius * 0.25 : radius;
      return { x: r * Math.cos(a), y: r * Math.sin(a) };
    });
  }
  return null;
}
