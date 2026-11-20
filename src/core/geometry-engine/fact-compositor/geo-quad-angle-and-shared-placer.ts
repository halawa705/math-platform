/**
 * @file geo-quad-angle-and-shared-placer.ts
 * @description حلال تموضع الأشكال الرباعية والمثلثات المشتركة في ضلع أو رأس واستنتاج زوايا المعين ومتوازي الأضلاع.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 190 سطراً).
 */

import type { GeoFact } from "./geo-fact-types";
import { pairKey } from "./geo-label-utils";
import type { PlacedPolygon } from "./geo-shape-placers";
import { lineIntersection, vAdd, vDist, vScale, vSub, type Vec2 } from "./geo-vector-math";

export const MODULE_ID_GEO_QUAD_ANGLE_AND_SHARED_PLACER =
  "geo_quad_angle_and_shared_placer" as const;

/**
 * يتحقق مما إذا كانت هناك مساواة بين أحد أضلاع المستطيل وجزء من الضلع المجاور (مثل E ∈ BC و AB = BE)
 * لضبط نسبة الطول إلى العرض بحيث يكون الضلع الحاضن للنقطة أطول من الضلع المساوي.
 */
export function adjustRectangleDimsForPointOnEquality(
  labels: readonly string[],
  facts: readonly GeoFact[],
  w: number,
  h: number,
  hasExplicitW: boolean,
  hasExplicitH: boolean
): { w: number; h: number } {
  if (hasExplicitW || hasExplicitH) return { w, h };
  const [a, b, c, d] = labels;
  const horiz = (u: string, v: string) => pairKey(u, v) === pairKey(a, b) || pairKey(u, v) === pairKey(c, d);
  const vert = (u: string, v: string) => pairKey(u, v) === pairKey(b, c) || pairKey(u, v) === pairKey(d, a);
  for (const pf of facts) {
    if (pf.k !== "pointOn") continue;
    if (vert(pf.seg[0], pf.seg[1])) {
      const hasHorizEq = facts.some(
        (ef) => ef.k === "equal" && (
          ((ef.a.includes(pf.p) && horiz(ef.b[0], ef.b[1])) || (ef.b.includes(pf.p) && horiz(ef.a[0], ef.a[1])))
        )
      );
      if (hasHorizEq) return { w: 4, h: 6.5 };
    }
  }
  return { w, h };
}

/**
 * يستنتج نسبة موضع نقطة `p` على القطعة `[a, b]` إذا كانت هناك مساواة صريحة بين `[a, p]` أو `[p, b]` وضلع موضوع بالفعل (مثل AB = BE).
 */
export function resolveEqualSegmentRatioOnHost(
  facts: readonly GeoFact[],
  p: string,
  a: string,
  b: string,
  points: ReadonlyMap<string, Vec2>
): number | undefined {
  const A = points.get(a);
  const B = points.get(b);
  if (!A || !B) return undefined;
  const abLen = vDist(A, B);
  if (abLen < 1e-6) return undefined;
  for (const ef of facts) {
    if (ef.k !== "equal") continue;
    const pairs: Array<[readonly [string, string], readonly [string, string]]> = [[ef.a, ef.b], [ef.b, ef.a]];
    for (const [part, ref] of pairs) {
      const refA = points.get(ref[0]);
      const refB = points.get(ref[1]);
      if (!refA || !refB) continue;
      const refLen = vDist(refA, refB);
      if (refLen <= 1e-6 || refLen >= abLen * 0.96) continue;
      if (pairKey(part[0], part[1]) === pairKey(a, p)) return Math.min(0.92, Math.max(0.08, refLen / abLen));
      if (pairKey(part[0], part[1]) === pairKey(p, b)) return Math.min(0.92, Math.max(0.08, 1 - refLen / abLen));
    }
  }
  return undefined;
}

type SideNumFn = (a: string, b: string) => number | undefined;
type AngleOfFn = (v: string, polySet?: ReadonlySet<string>) => number | undefined;

const degToRad = (d: number) => (d * Math.PI) / 180;
const clampAngle = (d: number) => Math.max(25, Math.min(155, d));

/**
 * يستنتج زاوية الرأس الأول (A) لمتوازي الأضلاع أو المعين ABCD من أي زاوية معطاة:
 * - زاوية رأس مباشر (A أو C تساوي A؛ B أو D مكملة لـ A)
 * - في المعين: زاوية بين قطر وضلع (مثل ∠ACD = 60° ⇒ ∠C = 120° ⇒ ∠A = 120°)
 * - في متوازي الأضلاع: مجموع زاويتين مقسومتين بالقطر (مثل ∠BAC + ∠BCA)
 */
export function inferParallelogramOrRhombusAngleADeg(
  labels: readonly string[],
  kind: "rhombus" | "parallelogram",
  facts: readonly GeoFact[]
): number {
  const [a, b, c, d] = labels;
  const polySet = new Set(labels);

  const isSidePair = (u: string, v: string): boolean =>
    pairKey(u, v) === pairKey(a, b) ||
    pairKey(u, v) === pairKey(b, c) ||
    pairKey(u, v) === pairKey(c, d) ||
    pairKey(u, v) === pairKey(d, a);

  const isDiagPair = (u: string, v: string): boolean =>
    pairKey(u, v) === pairKey(a, c) || pairKey(u, v) === pairKey(b, d);

  const vertexAngles = new Map<string, number>();
  const diagHalfAngles: Array<{ vertex: string; deg: number }> = [];

  for (const f of facts) {
    if (f.k !== "angle" || !polySet.has(f.vertex)) continue;
    const deg = f.right ? 90 : f.deg;
    if (deg === undefined || deg <= 5 || deg >= 175) continue;

    if (!f.arms) {
      if (!vertexAngles.has(f.vertex)) vertexAngles.set(f.vertex, deg);
      continue;
    }
    const [arm1, v, arm2] = f.arms;
    if (!polySet.has(arm1) || !polySet.has(arm2)) continue;
    const s1 = isSidePair(v, arm1);
    const s2 = isSidePair(v, arm2);
    if (s1 && s2) {
      if (!vertexAngles.has(v)) vertexAngles.set(v, deg);
    } else if ((s1 && isDiagPair(v, arm2)) || (s2 && isDiagPair(v, arm1))) {
      diagHalfAngles.push({ vertex: v, deg });
    }
  }

  if (vertexAngles.has(a)) return clampAngle(vertexAngles.get(a)!);
  if (vertexAngles.has(c)) return clampAngle(vertexAngles.get(c)!);
  if (vertexAngles.has(b)) return clampAngle(180 - vertexAngles.get(b)!);
  if (vertexAngles.has(d)) return clampAngle(180 - vertexAngles.get(d)!);

  if (kind === "rhombus" && diagHalfAngles.length > 0) {
    const first = diagHalfAngles[0];
    const full = first.deg * 2;
    if (full > 15 && full < 165) {
      return first.vertex === a || first.vertex === c ? clampAngle(full) : clampAngle(180 - full);
    }
  }

  // في متوازي الأضلاع: إذا أُعطيت زاويتان عند نفس الرأس على جانبي القطر أو زاويتا مثلث القطر
  if (kind === "parallelogram" && diagHalfAngles.length >= 2) {
    const atA = diagHalfAngles.filter((h) => h.vertex === a);
    if (atA.length >= 2) return clampAngle(atA[0].deg + atA[1].deg);
    const atC = diagHalfAngles.filter((h) => h.vertex === c);
    if (atC.length >= 2) return clampAngle(atC[0].deg + atC[1].deg);
    const atA1 = diagHalfAngles.find((h) => h.vertex === a);
    const atC1 = diagHalfAngles.find((h) => h.vertex === c);
    if (atA1 && atC1) return clampAngle(atA1.deg + atC1.deg);
  }

  return 60;
}

/**
 * يضع مضلعاً رباعياً ثانياً يشترك في رأسين موجودين بالفعل (مثل: مستطيل ABCD تقاطع قطراه في M ؛ معين MBNE).
 */
export function tryPlaceSharedEdgeQuad(
  quadFact: Extract<GeoFact, { k: "quad" }>,
  facts: readonly GeoFact[],
  num: SideNumFn,
  points: Map<string, Vec2>,
  polygons: PlacedPolygon[]
): boolean {
  // إذا كان هناك تقاطع قطري مضلع سابق (diagonalsMeet) ولم تُوضع نقطته بعد، نضعها الآن لتسهيل ربط الرباعي الثاني بها
  for (const dm of facts) {
    if (dm.k === "diagonalsMeet" && !points.has(dm.p) && polygons.length > 0) {
      const prevQuad = polygons.find((pl) => pl.labels.length === 4);
      if (prevQuad) {
        const [pa, pb, pc, pd] = prevQuad.labels.map((l) => points.get(l));
        if (pa && pb && pc && pd) {
          const hit = lineIntersection(pa, pc, pb, pd);
          if (hit) points.set(dm.p, hit);
        }
      }
    }
  }

  const labels = quadFact.labels;
  const knownIdxs = labels.map((l, idx) => (points.has(l) ? idx : -1)).filter((i) => i >= 0);
  if (knownIdxs.length !== 2) return false;

  // التحقق من أن النقطتين المشتركتين متجاورتان في ترتيب رؤوس الرباعي
  const [i0, i1] = knownIdxs;
  const adjacentForward = (i0 + 1) % 4 === i1;
  const adjacentBackward = (i1 + 1) % 4 === i0;
  if (!adjacentForward && !adjacentBackward) return false;

  const startIdx = adjacentForward ? i0 : i1;
  const ordered = [0, 1, 2, 3].map((k) => labels[(startIdx + k) % 4]);
  const [uLbl, vLbl, wLbl, zLbl] = ordered;
  const U = points.get(uLbl)!;
  const V = points.get(vLbl)!;
  const baseLen = vDist(U, V);
  if (baseLen < 1e-6) return false;

  const ex = vScale(vSub(V, U), 1 / baseLen);
  let ey: Vec2 = { x: -ex.y, y: ex.x };
  const others = [...points.entries()].filter(([k]) => k !== uLbl && k !== vLbl).map(([, p]) => p);
  if (others.length > 0) {
    const cx = others.reduce((s, p) => s + p.x, 0) / others.length;
    const cy = others.reduce((s, p) => s + p.y, 0) / others.length;
    if ((cx - U.x) * ey.x + (cy - U.y) * ey.y > 0) ey = { x: -ey.x, y: -ey.y };
  }

  const sideLen =
    quadFact.kind === "square" || quadFact.kind === "rhombus"
      ? baseLen
      : (num(vLbl, wLbl) ?? num(uLbl, zLbl) ?? baseLen * 0.75);
  const angleDeg =
    quadFact.kind === "square" || quadFact.kind === "rectangle"
      ? 90
      : inferParallelogramOrRhombusAngleADeg(ordered, quadFact.kind === "rhombus" ? "rhombus" : "parallelogram", facts);
  const th = degToRad(angleDeg);
  const offset = vAdd(vScale(ex, sideLen * Math.cos(th)), vScale(ey, sideLen * Math.sin(th)));

  points.set(zLbl, vAdd(U, offset));
  points.set(wLbl, vAdd(V, offset));
  polygons.push({ labels, kind: quadFact.kind });
  return true;
}

/**
 * يضع مثلثاً خارجياً مشتركاً في ضلع مع مضلع سابق (مثل مربع ABCD + مثلث CDE متساوي الأضلاع أو متساوي الساقين بزاوية رأس معلومة).
 */
export function tryPlaceSharedEdgeTriangle(
  triFact: Extract<GeoFact, { k: "triangle" }>,
  facts: readonly GeoFact[],
  num: SideNumFn,
  angleOf: AngleOfFn,
  points: Map<string, Vec2>,
  polygons: PlacedPolygon[]
): boolean {
  const labels = triFact.labels;
  const existing = labels.filter((l) => points.has(l));
  if (existing.length !== 2) return false;

  const missing = labels.find((l) => !points.has(l))!;
  const U = points.get(existing[0])!;
  const V = points.get(existing[1])!;
  const baseLen = vDist(U, V);
  if (baseLen <= 1e-6) return false;

  const triSet = new Set(labels);
  const apexDeg = angleOf(missing, triSet);
  const isIsoAtMissing =
    triFact.equilateral ||
    triFact.isoApex === missing ||
    facts.some(
      (ef) =>
        ef.k === "equal" &&
        ((pairKey(ef.a[0], ef.a[1]) === pairKey(existing[0], missing) &&
          pairKey(ef.b[0], ef.b[1]) === pairKey(existing[1], missing)) ||
          (pairKey(ef.b[0], ef.b[1]) === pairKey(existing[0], missing) &&
            pairKey(ef.a[0], ef.a[1]) === pairKey(existing[1], missing)))
    );

  let uw = num(existing[0], missing);
  let vw = num(existing[1], missing);

  if (triFact.equilateral && uw === undefined && vw === undefined) {
    uw = baseLen;
    vw = baseLen;
  } else if (isIsoAtMissing && apexDeg !== undefined && apexDeg > 10 && apexDeg < 170 && uw === undefined && vw === undefined) {
    const leg = baseLen / (2 * Math.sin(degToRad(apexDeg / 2)));
    // تقييد الارتفاع البصري حتى لا يتمدد المثلث الحاد جداً خارج حدود الصفحة بشكل مفرط
    const cappedLeg = Math.min(leg, baseLen * 1.65);
    uw = cappedLeg;
    vw = cappedLeg;
  } else {
    uw = uw ?? baseLen * 0.85;
    vw = vw ?? uw;
  }

  const ex = { x: (V.x - U.x) / baseLen, y: (V.y - U.y) / baseLen };
  let ey = { x: -ex.y, y: ex.x };
  const otherPts = [...points.entries()].filter(([k]) => k !== existing[0] && k !== existing[1]).map(([, p]) => p);
  if (otherPts.length > 0) {
    const cx = otherPts.reduce((s, p) => s + p.x, 0) / otherPts.length;
    const cy = otherPts.reduce((s, p) => s + p.y, 0) / otherPts.length;
    if ((cx - U.x) * ey.x + (cy - U.y) * ey.y > 0) ey = { x: -ey.x, y: -ey.y };
  }

  const cosU = Math.max(-0.92, Math.min(0.92, (baseLen * baseLen + uw * uw - vw * vw) / (2 * baseLen * uw)));
  const sinU = Math.sqrt(Math.max(0.08, 1 - cosU * cosU));
  points.set(missing, {
    x: U.x + ex.x * uw * cosU + ey.x * uw * sinU,
    y: U.y + ex.y * uw * cosU + ey.y * uw * sinU,
  });
  polygons.push({ labels, kind: "triangle", rightAt: triFact.right });
  return true;
}
