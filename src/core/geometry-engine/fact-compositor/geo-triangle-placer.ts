/**
 * @file geo-triangle-placer.ts
 * @description يحسب إحداثيات رؤوس مثلث (A,B,C) من المعطيات المتاحة بقواعد ثابتة، ويعيد دائماً مثلثاً صالحاً.
 */
import type { Vec2 } from "./geo-vector-math";
import { vMid } from "./geo-vector-math";
import type { GeoFact, Seg } from "./geo-fact-types";
import { pairKey } from "./geo-label-utils";

export const MODULE_ID_GEO_TRIANGLE_PLACER = "geo_triangle_placer" as const;
export type TriVertexKey = "A" | "B" | "C";

export interface TriangleKnowns {
  readonly ab?: number; readonly bc?: number; readonly ca?: number;
  readonly angleDeg?: Partial<Record<TriVertexKey, number>>;
  readonly rightAt?: TriVertexKey;
  readonly isoscelesApex?: TriVertexKey;
  readonly equilateral?: boolean;
}
export interface TrianglePoints { readonly A: Vec2; readonly B: Vec2; readonly C: Vec2 }

const DEFAULT_SIDE = 6;
const rad = (d: number) => (d * Math.PI) / 180;

function fromThreeSides(ab: number, bc: number, ca: number): TrianglePoints | null {
  const x = (ab * ab + bc * bc - ca * ca) / (2 * bc);
  const y2 = ab * ab - x * x;
  if (y2 <= 1e-9) return null;
  return { A: { x, y: Math.sqrt(y2) }, B: { x: 0, y: 0 }, C: { x: bc, y: 0 } };
}

function placeRight(at: TriVertexKey, k: TriangleKnowns): TrianglePoints {
  const ang = k.angleDeg ?? {};
  const solveOtherLeg = (hyp?: number, leg?: number): number | undefined =>
    hyp !== undefined && leg !== undefined && hyp > leg + 1e-4 ? Math.sqrt(hyp * hyp - leg * leg) : undefined;

  if (at === "B") {
    const effA = ang.A !== undefined && ang.A > 5 && ang.A < 85 ? ang.A : ang.C !== undefined && ang.C > 5 && ang.C < 85 ? 90 - ang.C : undefined;
    let a = k.bc;
    let c = k.ab;
    if (effA !== undefined && a === undefined && c === undefined) {
      const tanA = Math.tan(rad(effA));
      if (tanA <= 1) { c = DEFAULT_SIDE; a = DEFAULT_SIDE * tanA; }
      else { a = DEFAULT_SIDE; c = DEFAULT_SIDE / tanA; }
    } else if (a === undefined && c === undefined && k.ca !== undefined) {
      a = k.ca * 0.8;
      c = k.ca * 0.6;
    }
    a = a ?? (effA !== undefined && c !== undefined ? c * Math.tan(rad(effA)) : solveOtherLeg(k.ca, c) ?? DEFAULT_SIDE);
    c = c ?? (effA !== undefined ? a / Math.tan(rad(effA)) : solveOtherLeg(k.ca, a) ?? a * 0.75);
    return { A: { x: 0, y: c }, B: { x: 0, y: 0 }, C: { x: a, y: 0 } };
  }
  if (at === "A") {
    const effB = ang.B !== undefined && ang.B > 5 && ang.B < 85 ? ang.B : ang.C !== undefined && ang.C > 5 && ang.C < 85 ? 90 - ang.C : undefined;
    let c = k.ab;
    let b = k.ca;
    if (effB !== undefined && c === undefined && b === undefined) {
      const tanB = Math.tan(rad(effB));
      if (tanB <= 1) { c = DEFAULT_SIDE; b = DEFAULT_SIDE * tanB; }
      else { b = DEFAULT_SIDE; c = DEFAULT_SIDE / tanB; }
    } else if (c === undefined && b === undefined && k.bc !== undefined) {
      c = k.bc * 0.8;
      b = k.bc * 0.6;
    }
    c = c ?? (effB !== undefined && b !== undefined ? b / Math.tan(rad(effB)) : solveOtherLeg(k.bc, b) ?? DEFAULT_SIDE * 0.8);
    b = b ?? (effB !== undefined ? c * Math.tan(rad(effB)) : solveOtherLeg(k.bc, c) ?? c * 0.75);
    return { A: { x: 0, y: 0 }, B: { x: c, y: 0 }, C: { x: 0, y: b } };
  }
  const effA = ang.A !== undefined && ang.A > 5 && ang.A < 85 ? ang.A : ang.B !== undefined && ang.B > 5 && ang.B < 85 ? 90 - ang.B : undefined;
  let a = k.bc;
  let b = k.ca;
  if (effA !== undefined && a === undefined && b === undefined) {
    const tanA = Math.tan(rad(effA));
    if (tanA <= 1) { b = DEFAULT_SIDE; a = DEFAULT_SIDE * tanA; }
    else { a = DEFAULT_SIDE; b = DEFAULT_SIDE / tanA; }
  } else if (a === undefined && b === undefined && k.ab !== undefined) {
    a = k.ab * 0.8;
    b = k.ab * 0.6;
  }
  a = a ?? (effA !== undefined && b !== undefined ? b * Math.tan(rad(effA)) : solveOtherLeg(k.ab, b) ?? DEFAULT_SIDE);
  b = b ?? (effA !== undefined ? a / Math.tan(rad(effA)) : solveOtherLeg(k.ab, a) ?? a * 0.75);
  return { A: { x: a, y: b }, B: { x: 0, y: 0 }, C: { x: a, y: 0 } };
}

function placeIsosceles(apex: TriVertexKey, k: TriangleKnowns): TrianglePoints {
  const legs = apex === "A" ? (k.ab ?? k.ca) : apex === "B" ? (k.ab ?? k.bc) : (k.bc ?? k.ca);
  const base = apex === "A" ? k.bc : apex === "B" ? k.ca : k.ab;
  const s = legs ?? DEFAULT_SIDE; const w = base ?? s * 0.8;
  const h = Math.sqrt(Math.max(s * s - (w / 2) ** 2, 0.25));
  const top = { x: w / 2, y: h }; const L = { x: 0, y: 0 }; const R = { x: w, y: 0 };
  return apex === "A" ? { A: top, B: L, C: R } : apex === "B" ? { A: L, B: top, C: R } : { A: L, B: R, C: top };
}

/** يعيد دائماً مثلثاً (أقرب شكل معقول إن كانت المعطيات ناقصة أو متناقضة). */
export function placeTriangleFromKnowns(k: TriangleKnowns): TrianglePoints {
  if (k.ab && k.bc && k.ca) { const t = fromThreeSides(k.ab, k.bc, k.ca); if (t) return t; }
  if (k.equilateral) { const s = k.ab ?? k.bc ?? k.ca ?? DEFAULT_SIDE; return { A: { x: s / 2, y: (s * Math.sqrt(3)) / 2 }, B: { x: 0, y: 0 }, C: { x: s, y: 0 } }; }
  const right = k.rightAt ?? (["A", "B", "C"] as const).find((v) => k.angleDeg?.[v] === 90);
  if (right) return placeRight(right, k);
  if (k.isoscelesApex) return placeIsosceles(k.isoscelesApex, k);
  const ang = k.angleDeg ?? {};
  const knownCount = [ang.A, ang.B, ang.C].filter((v) => v !== undefined).length;
  let effB = ang.B;
  let effC = ang.C;
  if (ang.A !== undefined && ang.B !== undefined && ang.A + ang.B < 179 && effC === undefined) {
    effC = 180 - ang.A - ang.B;
  } else if (ang.A !== undefined && ang.C !== undefined && ang.A + ang.C < 179 && effB === undefined) {
    effB = 180 - ang.A - ang.C;
  } else if (knownCount === 1) {
    if (ang.A !== undefined && ang.A > 5 && ang.A < 175) {
      effB = (180 - ang.A) * 0.56;
      effC = 180 - ang.A - effB;
    } else if (ang.B !== undefined && ang.B > 5 && ang.B < 175) {
      effC = (180 - ang.B) * 0.46;
    } else if (ang.C !== undefined && ang.C > 5 && ang.C < 175) {
      effB = (180 - ang.C) * 0.54;
    }
  }
  if (k.ab && k.bc && ang.B !== undefined) return { A: { x: k.ab * Math.cos(rad(ang.B)), y: k.ab * Math.sin(rad(ang.B)) }, B: { x: 0, y: 0 }, C: { x: k.bc, y: 0 } };
  if (k.ab && k.ca && ang.A !== undefined) return { A: { x: 0, y: 0 }, B: { x: k.ab, y: 0 }, C: { x: k.ca * Math.cos(rad(ang.A)), y: k.ca * Math.sin(rad(ang.A)) } };
  if (k.bc && k.ca && ang.C !== undefined) return { A: { x: k.bc - k.ca * Math.cos(rad(ang.C)), y: k.ca * Math.sin(rad(ang.C)) }, B: { x: 0, y: 0 }, C: { x: k.bc, y: 0 } };
  // SSA via Law of Cosines when angle + adjacent side + opposite side are known
  const solveThirdSideSSA = (adj: number, opp: number, deg: number): number | undefined => {
    const c = Math.cos(rad(deg));
    const disc = (2 * adj * c) ** 2 - 4 * (adj * adj - opp * opp);
    if (disc < 0) return undefined;
    const root1 = adj * c + Math.sqrt(disc) / 2;
    const root2 = adj * c - Math.sqrt(disc) / 2;
    return root1 > 1e-4 ? root1 : root2 > 1e-4 ? root2 : undefined;
  };
  if (k.ab && k.bc && ang.C !== undefined) {
    const ca = solveThirdSideSSA(k.bc, k.ab, ang.C);
    if (ca) return { A: { x: k.bc - ca * Math.cos(rad(ang.C)), y: ca * Math.sin(rad(ang.C)) }, B: { x: 0, y: 0 }, C: { x: k.bc, y: 0 } };
  }
  if (k.ab && k.bc && ang.A !== undefined) {
    const ca = solveThirdSideSSA(k.ab, k.bc, ang.A);
    if (ca) return { A: { x: 0, y: 0 }, B: { x: k.ab, y: 0 }, C: { x: ca * Math.cos(rad(ang.A)), y: ca * Math.sin(rad(ang.A)) } };
  }
  if (k.ab && k.ca && ang.B !== undefined) {
    const bc = solveThirdSideSSA(k.ab, k.ca, ang.B);
    if (bc) return { A: { x: k.ab * Math.cos(rad(ang.B)), y: k.ab * Math.sin(rad(ang.B)) }, B: { x: 0, y: 0 }, C: { x: bc, y: 0 } };
  }
  if (k.bc && k.ca && ang.B !== undefined) {
    const ab = solveThirdSideSSA(k.bc, k.ca, ang.B);
    if (ab) return { A: { x: ab * Math.cos(rad(ang.B)), y: ab * Math.sin(rad(ang.B)) }, B: { x: 0, y: 0 }, C: { x: k.bc, y: 0 } };
  }
  if (effB !== undefined && effC !== undefined && effB > 1 && effC > 1 && effB + effC < 179) {
    const a = k.bc ?? (k.ab ? (k.ab * Math.sin(rad(180 - effB - effC))) / Math.sin(rad(effC)) : k.ca ? (k.ca * Math.sin(rad(180 - effB - effC))) / Math.sin(rad(effB)) : DEFAULT_SIDE);
    const aAng = 180 - effB - effC; const c = (a * Math.sin(rad(effC))) / Math.sin(rad(aAng));
    return { A: { x: c * Math.cos(rad(effB)), y: c * Math.sin(rad(effB)) }, B: { x: 0, y: 0 }, C: { x: a, y: 0 } };
  }
  const a = k.bc ?? DEFAULT_SIDE; const c = k.ab ?? a * 0.8; const b = k.ca ?? a * 0.9;
  return fromThreeSides(c, a, b) ?? { A: { x: a * 0.4, y: a * 0.8 }, B: { x: 0, y: 0 }, C: { x: a, y: 0 } };
}

export function resolveRatioFractionOnSegment(
  facts: readonly GeoFact[],
  p: string,
  a: string,
  b: string
): number | undefined {
  const rf = facts.find(
    (x): x is Extract<GeoFact, { k: "ratio" }> =>
      x.k === "ratio" &&
      ((pairKey(x.a[0], x.a[1]) === pairKey(a, p) && pairKey(x.b[0], x.b[1]) === pairKey(p, b)) ||
        (pairKey(x.b[0], x.b[1]) === pairKey(a, p) && pairKey(x.a[0], x.a[1]) === pairKey(p, b)))
  );
  if (!rf || !(rf.num > 0) || !(rf.den > 0)) return undefined;
  const isApFirst = pairKey(rf.a[0], rf.a[1]) === pairKey(a, p);
  const frac = (isApFirst ? rf.num : rf.den) / (rf.num + rf.den);
  return Math.max(0.08, Math.min(0.92, frac));
}

export function applyMedianFactOnTriangle(params: {
  seg: Seg;
  trianglesSides: (apex: string) => Seg | null;
  points: Map<string, Vec2>;
  host: Map<string, Seg>;
  ticks: Map<string, number>;
  nextTick: () => number;
  addExtra: (a: string, b: string) => void;
}): void {
  const { seg, trianglesSides, points, host, ticks, nextTick, addExtra } = params;
  const apex = trianglesSides(seg[0]) ? seg[0] : trianglesSides(seg[1]) ? seg[1] : seg[0];
  const d = apex === seg[0] ? seg[1] : seg[0];
  const opp = trianglesSides(apex);
  if (!opp) return;
  const p0 = points.get(opp[0]);
  const p1 = points.get(opp[1]);
  if (!points.get(d) && p0 && p1) points.set(d, vMid(p0, p1));
  host.set(d, opp);
  addExtra(apex, d);
  if (!ticks.has(pairKey(opp[0], d))) {
    const g = nextTick();
    ticks.set(pairKey(opp[0], d), g);
    ticks.set(pairKey(d, opp[1]), g);
  }
}

export function sortComposerFactsTopologically(facts: readonly GeoFact[]): GeoFact[] {
  const diags = facts.filter((f) => f.k === "diagonalsMeet");
  const rest = facts.filter((f) => f.k !== "diagonalsMeet");
  return [...diags, ...rest];
}
