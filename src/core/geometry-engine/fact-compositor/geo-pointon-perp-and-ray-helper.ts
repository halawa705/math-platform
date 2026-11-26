/**
 * @file geo-pointon-perp-and-ray-helper.ts
 * @description مساعدات ذرية لحل التعامد المقيد بنقطة على ضلع، امتداد الشعاع بالتساوي، وحارس المنتصف، وزوايا المثلثات القائمة الفرعية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import type { CanonicalAngleNode } from "@/core/ssot/geometry-archetype-ssot";
import type { LinearEntityKindMap } from "../description-intake/linear-entity-kind-extractor";
import type { GeoFact, Seg } from "./geo-fact-types";
import { pairKey } from "./geo-label-utils";
import { lineIntersection, vAdd, vDist, vScale, vSub, type Vec2 } from "./geo-vector-math";

export const MODULE_ID_GEO_POINTON_PERP_AND_RAY_HELPER =
  "geo_pointon_perp_and_ray_helper" as const;

export function tryResolveConstrainedPerpWithPointOn(params: {
  fact: Extract<GeoFact, { k: "perp" }>;
  facts: readonly GeoFact[];
  points: Map<string, Vec2>;
  host: Map<string, Seg>;
  addExtra: (a: string, b: string, dashed?: boolean) => void;
  addAngle: (v: string, a1: string, a2: string, extra?: Partial<CanonicalAngleNode>) => void;
}): boolean {
  const { fact, facts, points, host, addExtra, addAngle } = params;
  const P = (k: string) => points.get(k);
  const [a0, a1] = fact.a;
  const [b0, b1] = fact.b;
  if (Boolean(P(a0)) === Boolean(P(a1)) || !P(b0) || !P(b1)) return false;

  const anchor = P(a0) ? a0 : a1;
  const miss = P(a0) ? a1 : a0;
  const hostFact = facts.find(
    (hf): hf is Extract<GeoFact, { k: "pointOn" }> =>
      hf.k === "pointOn" && hf.p === miss && Boolean(P(hf.seg[0]) && P(hf.seg[1]))
  );
  if (!hostFact) return false;

  const PA = P(anchor)!;
  const PB0 = P(b0)!;
  const PB1 = P(b1)!;
  const refVec = vSub(PB1, PB0);
  const len = Math.hypot(refVec.x, refVec.y);
  if (len < 1e-6) return false;

  // التحقق من وجود نقطة الارتكاز على المستقيم المرجعي
  const cross = Math.abs((PA.x - PB0.x) * refVec.y - (PA.y - PB0.y) * refVec.x) / len;
  if (cross > 0.15) return false;

  const perpDir: Vec2 = { x: -refVec.y, y: refVec.x };
  const hit = lineIntersection(PA, vAdd(PA, perpDir), P(hostFact.seg[0])!, P(hostFact.seg[1])!);
  if (!hit) return false;

  points.set(miss, hit);
  host.set(miss, hostFact.seg);
  addExtra(anchor, miss);
  const farEnd = vDist(PA, PB1) >= vDist(PA, PB0) ? b1 : b0;
  addAngle(anchor, miss, farEnd, { isRightAngle: true, degrees: 90 });
  return true;
}

export function tryResolveRayExtensionEqualityPoint(params: {
  fact: Extract<GeoFact, { k: "pointOn" }>;
  facts: readonly GeoFact[];
  points: Map<string, Vec2>;
  linearKindMap?: LinearEntityKindMap;
  isPolygonSide: (a: string, b: string) => boolean;
  addExtra: (a: string, b: string, dashed?: boolean) => void;
}): boolean {
  const { fact, facts, points, linearKindMap, isPolygonSide, addExtra } = params;
  const [a, b] = fact.seg;
  const PA = points.get(a);
  const PB = points.get(b);
  if (!PA || !PB || points.has(fact.p)) return false;

  const eqFact = facts.find((ef): ef is Extract<GeoFact, { k: "equal" }> => {
    if (ef.k !== "equal") return false;
    const ka = pairKey(ef.a[0], ef.a[1]);
    const kb = pairKey(ef.b[0], ef.b[1]);
    if (ka === pairKey(a, b) && (ef.b[0] === fact.p || ef.b[1] === fact.p)) return true;
    if (kb === pairKey(a, b) && (ef.a[0] === fact.p || ef.a[1] === fact.p)) return true;
    return false;
  });
  if (!eqFact) return false;

  const pSeg = pairKey(eqFact.a[0], eqFact.a[1]) === pairKey(a, b) ? eqFact.b : eqFact.a;
  const shared = pSeg[0] === fact.p ? pSeg[1] : pSeg[0];
  if (shared !== a && shared !== b) return false;

  const kindInfo = linearKindMap?.get(pairKey(a, b));
  const isRayOrPolygonExt = kindInfo?.kind === "ray" || isPolygonSide(a, b);
  if (!isRayOrPolygonExt) return false;

  const other = shared === a ? b : a;
  const POther = points.get(other)!;
  const PShared = points.get(shared)!;
  const dist = vDist(POther, PShared);
  if (dist < 1e-6) return false;

  // تمديد من الجهة الأخرى عبر الرأس المشترك بنفس المسافة (AB = AH)
  points.set(fact.p, vAdd(PShared, vSub(PShared, POther)));
  addExtra(shared, fact.p);
  return true;
}

export function shouldSkipOverloadedMidpointFact(
  fact: Extract<GeoFact, { k: "midpoint" }>,
  facts: readonly GeoFact[],
  points: ReadonlyMap<string, Vec2>
): boolean {
  if (!points.has(fact.p)) return false;
  // لا تستبدل نقطة تقاطع متوسطة/مركزية موضوعة أو رأساً قائماً بمثلث آخر على نفس الوتر بنقطة منتصف
  if (facts.some((xf) => xf.k === "intersect" && xf.p === fact.p)) return true;
  return facts.some(
    (tf) =>
      tf.k === "triangle" &&
      tf.right === fact.p &&
      tf.labels.includes(fact.seg[0]) &&
      tf.labels.includes(fact.seg[1])
  );
}

export function allocateDedupParallelGroup(
  pf: Extract<GeoFact, { k: "parallel" }>,
  pairGroupMap: Map<string, number>,
  nextGroupCounter: () => number
): number {
  const k1 = pairKey(pf.a[0], pf.a[1]);
  const k2 = pairKey(pf.b[0], pf.b[1]);
  const pairId = k1 < k2 ? `${k1}|${k2}` : `${k2}|${k1}`;
  const existing = pairGroupMap.get(pairId);
  if (existing !== undefined) return existing;
  const grp = nextGroupCounter();
  pairGroupMap.set(pairId, grp);
  return grp;
}

export function emitSubTriangleRightAngles(params: {
  facts: readonly GeoFact[];
  points: ReadonlyMap<string, Vec2>;
  addAngle: (v: string, a1: string, a2: string, extra?: Partial<CanonicalAngleNode>) => void;
}): void {
  const { facts, points, addAngle } = params;
  for (const f of facts) {
    if (f.k !== "triangle" || !f.right) continue;
    if (!f.labels.every((l) => points.has(l))) continue;
    const others = f.labels.filter((l) => l !== f.right);
    if (others.length === 2) {
      addAngle(f.right, others[0], others[1], { isRightAngle: true, degrees: 90 });
    }
  }
}

export function addScaleToPoint(p: Vec2, dir: Vec2, dist: number): Vec2 {
  const m = Math.hypot(dir.x, dir.y) || 1;
  return vAdd(p, vScale(dir, dist / m));
}
