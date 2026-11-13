/**
 * @file geo-composite-topology-placer.ts
 * @description موضع الأشكال الهندسية المركبة في التركيب الحتمي:
 * 1. استنتاج الزوايا الداخلة من الزوايا الخارجة على امتداد الأضلاع (`نمد CB إلى X ; ق(∠ABX) = 140°`).
 * 2. تموضع المثلثين المتقاطعين في رأس مشترك (`BD ∩ CE = {A}` أو `AE ∩ BD = {C}`) باستقامة حقيقية وزوايا دقيقة.
 * 3. رسم المستقيم/الشعاع الموازي لضلع المثلث من رأس (`XY // BC ; A ∈ XY` أو `CD // BA`).
 * @invariant ملف ذري مستقل باسم فريد عالمياً (< 250 سطراً وفق AGENTS.md).
 */

import type { GeoFact } from "./geo-fact-types";
import { inferTriangleAngleOverridesFromComposites } from "./geo-composite-angle-override-helper";
import { pairKey } from "./geo-label-utils";
import type { LengthMap, PlacedPolygon } from "./geo-shape-placers";
import { placeTriangleFromKnowns, type TriVertexKey } from "./geo-triangle-placer";
import { vAdd, vDist, vScale, vSub, type Vec2 } from "./geo-vector-math";

export { inferTriangleAngleOverridesFromComposites };

export const MODULE_ID_GEO_COMPOSITE_TOPOLOGY_PLACER =
  "geo_composite_topology_placer" as const;

const degToRad = (d: number) => (d * Math.PI) / 180;
const vNorm = (v: Vec2): Vec2 => {
  const m = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / m, y: v.y / m };
};

/**
 * يضع مثلثين يشتركان في نقطة تقاطع وحيدة (`BD ∩ CE = {A}` أو `AE ∩ BD = {C}`) باستقامة دقيقة وزوايا منسجمة.
 */
export function tryPlaceIntersectingBowTieTriangles(
  facts: readonly GeoFact[],
  lengths: LengthMap,
  points: Map<string, Vec2>,
  polygons: PlacedPolygon[],
  numSide: (a: string, b: string) => number | undefined,
  angleOf: (v: string) => number | undefined
): boolean {
  const rawTris = facts.filter((f): f is Extract<GeoFact, { k: "triangle" }> => f.k === "triangle");
  const seenTri = new Set<string>();
  const tris: Array<Extract<GeoFact, { k: "triangle" }>> = rawTris.filter((t) => {
    const key = [...t.labels].sort().join("|");
    if (seenTri.has(key)) return false;
    seenTri.add(key);
    return true;
  });
  if (tris.length === 1) {
    const tOnly = tris[0];
    const interSingle = facts.find(
      (f): f is Extract<GeoFact, { k: "intersect" }> => f.k === "intersect" && tOnly.labels.includes(f.p)
    );
    if (interSingle) {
      const s = interSingle.p;
      const aOther = interSingle.a.find((v) => v !== s);
      const bOther = interSingle.b.find((v) => v !== s);
      if (aOther && bOther && !tOnly.labels.includes(aOther) && !tOnly.labels.includes(bOther)) {
        tris.push({ k: "triangle", labels: [s, aOther, bOther] });
      }
    }
  }
  if (tris.length !== 2) return false;
  const [t1, t2] = tris;
  const shared = t1.labels.filter((l) => t2.labels.includes(l));
  if (shared.length !== 1) return false;
  const s = shared[0];

  const inter = facts.find((f): f is Extract<GeoFact, { k: "intersect" }> => f.k === "intersect" && f.p === s);
  if (!inter) return false;

  const t1Others = t1.labels.filter((l) => l !== s);
  const t2Others = t2.labels.filter((l) => l !== s);
  if (t1Others.length !== 2 || t2Others.length !== 2) return false;

  const lineA = new Set([inter.a[0], inter.a[1]]);
  const lineB = new Set([inter.b[0], inter.b[1]]);
  const u1 = t1Others.find((l) => lineA.has(l) && !lineB.has(l));
  const v1 = t1Others.find((l) => lineB.has(l) && !lineA.has(l));
  const u2 = t2Others.find((l) => lineA.has(l) && !lineB.has(l));
  const v2 = t2Others.find((l) => lineB.has(l) && !lineA.has(l));
  if (!u1 || !v1 || !u2 || !v2) return false;

  const keyOf = (l: string): TriVertexKey | undefined =>
    l === t1.labels[0] ? "A" : l === t1.labels[1] ? "B" : l === t1.labels[2] ? "C" : undefined;

  const isParallelBases = facts.some(
    (pf) =>
      pf.k === "parallel" &&
      ((pairKey(pf.a[0], pf.a[1]) === pairKey(u1, v1) && pairKey(pf.b[0], pf.b[1]) === pairKey(u2, v2)) ||
        (pairKey(pf.b[0], pf.b[1]) === pairKey(u1, v1) && pairKey(pf.a[0], pf.a[1]) === pairKey(u2, v2)))
  );

  const ov1 = inferTriangleAngleOverridesFromComposites(facts, t1.labels);
  // عند التوازي (AB // DE)، الزوايا المتبادلة داخلياً في المثلث الثاني تُوجّه رسم المثلث الأول
  if (isParallelBases) {
    const u2Ang = angleOf(u2) ?? (t2.right === u2 ? 90 : undefined);
    const v2Ang = angleOf(v2) ?? (t2.right === v2 ? 90 : undefined);
    if (u2Ang !== undefined && angleOf(u1) === undefined && !ov1.has(u1)) ov1.set(u1, u2Ang);
    if (v2Ang !== undefined && angleOf(v1) === undefined && !ov1.has(v1)) ov1.set(v1, v2Ang);
  }
  const tri1Placed = placeTriangleFromKnowns({
    ab: numSide(t1.labels[0], t1.labels[1]),
    bc: numSide(t1.labels[1], t1.labels[2]),
    ca: numSide(t1.labels[2], t1.labels[0]),
    angleDeg: {
      A: angleOf(t1.labels[0]) ?? ov1.get(t1.labels[0]),
      B: angleOf(t1.labels[1]) ?? ov1.get(t1.labels[1]),
      C: angleOf(t1.labels[2]) ?? ov1.get(t1.labels[2]),
    },
    rightAt: t1.right ? keyOf(t1.right) : undefined,
    isoscelesApex: t1.isoApex ? keyOf(t1.isoApex) : undefined,
    equilateral: t1.equilateral,
  });

  const localPts = [tri1Placed.A, tri1Placed.B, tri1Placed.C];
  const minX = Math.min(...localPts.map((p) => p.x));
  t1.labels.forEach((lbl, idx) => points.set(lbl, { x: localPts[idx].x - minX, y: localPts[idx].y }));

  const pS = points.get(s)!;
  const pU1 = points.get(u1)!;
  const pV1 = points.get(v1)!;
  const dU1 = vDist(pS, pU1) || 1;
  const dV1 = vDist(pS, pV1) || 1;
  const dirU2 = vNorm(vSub(pS, pU1));
  const dirV2 = vNorm(vSub(pS, pV1));
  const dotS = dirU2.x * dirV2.x + dirU2.y * dirV2.y;
  const angleSdeg = (Math.acos(Math.max(-0.99, Math.min(0.99, dotS))) * 180) / Math.PI;

  const givenU2Len = lengths.get(pairKey(s, u2))?.numeric;
  const givenV2Len = lengths.get(pairKey(s, v2))?.numeric;
  let angU2 = angleOf(u2) ?? (t2.right === u2 ? 90 : undefined);
  let angV2 = angleOf(v2) ?? (t2.right === v2 ? 90 : undefined);
  if (angU2 !== undefined && angV2 === undefined && angleSdeg + angU2 < 175) angV2 = 180 - angleSdeg - angU2;
  if (angV2 !== undefined && angU2 === undefined && angleSdeg + angV2 < 175) angU2 = 180 - angleSdeg - angV2;

  let kU = givenU2Len ?? dU1 * 0.82;
  let kV = givenV2Len ?? dV1 * 0.82;
  if (!isParallelBases && angU2 !== undefined && angV2 !== undefined && angU2 > 5 && angV2 > 5) {
    const ratio = Math.sin(degToRad(angU2)) / Math.max(0.08, Math.sin(degToRad(angV2)));
    if (givenU2Len !== undefined && givenV2Len === undefined) kV = givenU2Len * ratio;
    else if (givenV2Len !== undefined && givenU2Len === undefined) kU = givenV2Len / Math.max(0.08, ratio);
    else if (givenU2Len === undefined && givenV2Len === undefined) kV = kU * ratio;
  }

  points.set(u2, vAdd(pS, vScale(dirU2, kU)));
  points.set(v2, vAdd(pS, vScale(dirV2, kV)));
  polygons.push({ labels: t1.labels, kind: "triangle", rightAt: t1.right });
  polygons.push({ labels: t2.labels, kind: "triangle", rightAt: t2.right });
  return true;
}

/**
 * يعالج رسم مستقيم/شعاع موازٍ يمر برأس مثلث (`XY // BC ; A ∈ XY`) أو ينطلق من رأس واحد (`CD // BA`).
 */
export function tryPlaceParallelWithMissingEndpoints(params: {
  readonly parallelFact: Extract<GeoFact, { k: "parallel" }>;
  readonly facts: readonly GeoFact[];
  readonly points: Map<string, Vec2>;
  readonly host: Map<string, readonly [string, string]>;
  readonly lengths: LengthMap;
  readonly addExtra: (a: string, b: string, dashed?: boolean) => void;
  readonly addParallelMark: (a: string, b: string, group: number) => void;
  readonly nextGroup: () => number;
}): boolean {
  const { parallelFact, facts, points, lengths, addExtra, addParallelMark, nextGroup } = params;
  const P = (k: string) => points.get(k);
  const [x, y] = parallelFact.a;
  const [p, q] = parallelFact.b;

  // الحالة 1: المستقيم XY // PQ ويمر بالرأس V الموجود (A ∈ XY أو زوايا معطاة عند V مثل ∠XAB و ∠YAC)
  const findHostForLine = (line: readonly [string, string]): { p: string; seg: readonly [string, string] } | undefined => {
    const explicit = facts.find(
      (f): f is Extract<GeoFact, { k: "pointOn" }> =>
        f.k === "pointOn" && P(f.p) !== undefined && pairKey(f.seg[0], f.seg[1]) === pairKey(line[0], line[1])
    );
    if (explicit) return explicit;
    const byAngle = facts.find(
      (af): af is Extract<GeoFact, { k: "angle" }> =>
        af.k === "angle" && P(af.vertex) !== undefined && Boolean(af.arms?.includes(line[0]) || af.arms?.includes(line[1]))
    );
    return byAngle ? { p: byAngle.vertex, seg: line } : undefined;
  };
  const hostLine = !P(x) && !P(y) && P(p) && P(q)
    ? findHostForLine([x, y])
    : !P(p) && !P(q) && P(x) && P(y)
      ? findHostForLine([p, q])
      : undefined;

  if (hostLine) {
    const through = hostLine.p;
    const [lineA, lineB] = hostLine.seg;
    const [baseA, baseB] = pairKey(lineA, lineB) === pairKey(x, y) ? [p, q] : [x, y];
    const pV = P(through)!;
    const pA = P(baseA)!;
    const pB = P(baseB)!;
    const u = vNorm(vSub(pB, pA));
    const span = Math.max(2.2, vDist(pA, pB) * 0.55);
    // محاذاة X جهة baseA و Y جهة baseB ما لم يذكر قياس زاوية معاكسة
    const dotVAtoA = (pA.x - pV.x) * u.x + (pA.y - pV.y) * u.y;
    const dirToA = dotVAtoA >= 0 ? u : vScale(u, -1);
    const dirToB = vScale(dirToA, -1);
    const ptLeft = lengths.get(pairKey(through, lineA))?.numeric ?? span;
    const ptRight = lengths.get(pairKey(through, lineB))?.numeric ?? span;
    points.set(lineA, vAdd(pV, vScale(dirToA, ptLeft)));
    points.set(lineB, vAdd(pV, vScale(dirToB, ptRight)));
    const grp = nextGroup();
    addParallelMark(lineA, through, grp);
    addParallelMark(through, lineB, grp);
    addParallelMark(baseA, baseB, grp);
    addExtra(lineA, through);
    addExtra(through, lineB);
    return true;
  }

  // الحالة 2: إحدى نقطتي القطعة الموازية غير موضوعة (مثل CD // BA مع وجود A, B, C وغياب D)
  const trySingleMissing = (k1: string, k2: string, ref1: string, ref2: string): boolean => {
    const has1 = Boolean(P(k1));
    const has2 = Boolean(P(k2));
    if (has1 === has2 || !P(ref1) || !P(ref2)) return false;
    const anchorKey = has1 ? k1 : k2;
    const missingKey = has1 ? k2 : k1;
    const pAnchor = P(anchorKey)!;
    const dirRaw = vSub(P(ref2)!, P(ref1)!);
    const centroid = [...points.values()].reduce((acc, v) => ({ x: acc.x + v.x / points.size, y: acc.y + v.y / points.size }), { x: 0, y: 0 });
    const candA = vAdd(pAnchor, vScale(dirRaw, 0.85));
    const candB = vAdd(pAnchor, vScale(dirRaw, -0.85));
    let chosen = vDist(candA, centroid) >= vDist(candB, centroid) ? candA : candB;
    const angHint = facts.find(
      (af): af is Extract<GeoFact, { k: "angle" }> =>
        af.k === "angle" &&
        af.vertex === anchorKey &&
        af.deg !== undefined &&
        (!af.arms || af.arms.includes(missingKey))
    );
    const otherArmKey = angHint?.arms
      ? angHint.arms.find((k) => k !== anchorKey && k !== missingKey)
      : params.host.get(anchorKey)?.[0] === anchorKey
        ? params.host.get(anchorKey)?.[1]
        : params.host.get(anchorKey)?.[0] ??
          facts.find((pt): pt is Extract<GeoFact, { k: "pointOn" }> => pt.k === "pointOn" && (pt.seg[0] === anchorKey || pt.seg[1] === anchorKey))?.p;
    const pOther = otherArmKey ? P(otherArmKey) : undefined;
    if (angHint?.deg !== undefined && pOther) {
      const angBetween = (cand: Vec2) => {
        const u = vNorm(vSub(pOther, pAnchor)), v = vNorm(vSub(cand, pAnchor));
        return (Math.acos(Math.max(-1, Math.min(1, u.x * v.x + u.y * v.y))) * 180) / Math.PI;
      };
      chosen = Math.abs(angBetween(candA) - angHint.deg) <= Math.abs(angBetween(candB) - angHint.deg) ? candA : candB;
    }
    const len = lengths.get(pairKey(anchorKey, missingKey))?.numeric;
    points.set(missingKey, len !== undefined ? vAdd(pAnchor, vScale(vNorm(vSub(chosen, pAnchor)), len)) : chosen);
    const grp = nextGroup();
    addParallelMark(k1, k2, grp); addParallelMark(ref1, ref2, grp); addExtra(k1, k2);
    return true;
  };
  return trySingleMissing(x, y, p, q) || trySingleMissing(p, q, x, y);
}

/** يعالج الانتماء العكسي عندما تكون p وإحدى نهايتي [a,b] موضوعتين (مثل `A ∈ CD` أو `C ∈ BE`). */
export function tryPlacePointOnWithCollinearExtension(params: {
  readonly p: string; readonly seg: readonly [string, string]; readonly points: Map<string, Vec2>;
  readonly lengths: LengthMap; readonly addExtra: (a: string, b: string, dashed?: boolean) => void;
}): boolean {
  const { p, seg, points, lengths, addExtra } = params;
  const [a, b] = seg;
  const pCenter = points.get(p);
  if (!pCenter) return false;
  const hasA = points.has(a), hasB = points.has(b);
  if (hasA === hasB) return false;
  const knownEnd = hasA ? a : b, missingEnd = hasA ? b : a;
  const pKnown = points.get(knownEnd)!;
  const d = vDist(pKnown, pCenter) || 1;
  const dir = vNorm(vSub(pCenter, pKnown));
  const targetLen = lengths.get(pairKey(p, missingEnd))?.numeric ?? d * 0.65;
  points.set(missingEnd, vAdd(pCenter, vScale(dir, targetLen)));
  addExtra(p, missingEnd);
  return true;
}
