/**
 * @file geo-composite-quad-placer.ts
 * @description موضع الأشكال الرباعية المركبة وشبه المنحرف الموجّه والمربعين المتجاورين بدقة هندسية حتمية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 160 سطراً).
 */
import type { GeoFact } from "./geo-fact-types";
import { pairKey } from "./geo-label-utils";
import type { PlacedPolygon } from "./geo-shape-placers";
import { placeTriangleFromKnowns } from "./geo-triangle-placer";
import type { Vec2 } from "./geo-vector-math";

export const MODULE_ID_GEO_COMPOSITE_QUAD_PLACER = "geo_composite_quad_placer" as const;

type SideNumFn = (a: string, b: string) => number | undefined;
type AngleOfFn = (v: string, polySet?: ReadonlySet<string>) => number | undefined;

function hasExactVertexAngle(facts: readonly GeoFact[], v: string, arms?: readonly [string, string, string]): number | undefined {
  for (const f of facts) {
    if (f.k !== "angle" || f.vertex !== v) continue;
    const deg = f.right ? 90 : f.deg;
    if (deg === undefined) continue;
    if (!arms) return deg;
    if (f.arms && ((f.arms[0] === arms[0] && f.arms[2] === arms[2]) || (f.arms[0] === arms[2] && f.arms[2] === arms[0]))) {
      return deg;
    }
  }
  return undefined;
}

/** يضع مربعين متجاورين يشتركان في رأس واحد على خط مستقيم (مثل ABCD و DEFG عند D). */
export function tryPlaceAdjacentSquares(
  facts: readonly GeoFact[],
  num: SideNumFn,
  points: Map<string, Vec2>,
  polygons: PlacedPolygon[]
): boolean {
  const quads = facts.filter((f): f is Extract<GeoFact, { k: "quad" }> => f.k === "quad");
  if (quads.length !== 2 || quads[0].kind !== "square" || quads[1].kind !== "square") return false;
  const [q1, q2] = quads;
  const shared = q1.labels.filter((l) => q2.labels.includes(l));
  if (shared.length !== 1) return false;
  const sVertex = shared[0];
  const s1 = num(q1.labels[0], q1.labels[1]) ?? num(q1.labels[1], q1.labels[2]) ?? 10;
  const s2 = num(q2.labels[0], q2.labels[1]) ?? num(q2.labels[1], q2.labels[2]) ?? 5;
  const i1 = q1.labels.indexOf(sVertex);
  const i2 = q2.labels.indexOf(sVertex);
  const coords1: Vec2[] = [
    { x: s1, y: s1 },
    { x: 0, y: s1 },
    { x: 0, y: 0 },
    { x: s1, y: 0 },
  ];
  // تدوير مربع q1 ليصبح الرأس المشترك في (s1, 0) وضلع q1 المجاور على المحور السيني السالب
  q1.labels.forEach((lbl, k) => {
    const slot = (k - i1 + 3 + 4) % 4;
    points.set(lbl, coords1[slot]);
  });
  const coords2: Vec2[] = [
    { x: s1, y: 0 },
    { x: s1 + s2, y: 0 },
    { x: s1 + s2, y: s2 },
    { x: s1, y: s2 },
  ];
  q2.labels.forEach((lbl, k) => {
    const slot = (k - i2 + 4) % 4;
    points.set(lbl, coords2[slot]);
  });
  polygons.push({ labels: q1.labels, kind: "square" }, { labels: q2.labels, kind: "square" });
  return true;
}

/** يضع شبه المنحرف بمراعاة زوجي التوازي الحقيقيين (AD // BC أو AB // CD). */
export function placeOrientedTrapezoid(
  labels: readonly string[],
  facts: readonly GeoFact[],
  num: SideNumFn,
  angleOf: AngleOfFn
): Vec2[] {
  const [a, b, c, d] = labels;
  const adParallelBc = facts.some(
    (f) =>
      f.k === "parallel" &&
      ((pairKey(f.a[0], f.a[1]) === pairKey(d, a) && pairKey(f.b[0], f.b[1]) === pairKey(b, c)) ||
        (pairKey(f.b[0], f.b[1]) === pairKey(d, a) && pairKey(f.a[0], f.a[1]) === pairKey(b, c)))
  );
  if (adParallelBc) {
    const wBot = num(b, c) ?? 12;
    const wTop = num(a, d) ?? wBot * 0.5;
    const isRightLeft = angleOf(b) === 90 || angleOf(a) === 90;
    const offset = isRightLeft ? 0 : (wBot - wTop) / 2;
    const leg = num(a, b) ?? num(c, d);
    const h = isRightLeft ? (leg ?? wBot * 0.55) : leg && leg > Math.abs(offset) ? Math.sqrt(leg * leg - offset * offset) : wBot * 0.55;
    return [
      { x: offset, y: h },
      { x: 0, y: 0 },
      { x: wBot, y: 0 },
      { x: offset + wTop, y: h },
    ];
  }
  const w = num(a, b) ?? num(c, d) ?? 8;
  const top = num(c, d) ?? w * 0.5;
  const isRightAtA = angleOf(a) === 90 || angleOf(d) === 90;
  const o = isRightAtA ? 0 : (w - top) / 2;
  const leg = num(d, a) ?? num(b, c);
  const h = isRightAtA ? (leg ?? w * 0.55) : leg && leg > Math.abs(o) ? Math.sqrt(leg * leg - o * o) : w * 0.55;
  return [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: o + top, y: h },
    { x: o, y: h },
  ];
}

/** يضع الشكل الرباعي العام ABCD بتقسيمه عبر قطره الفعلي (AC أو BD) إلى مثلثين متلاصقين. */
export function placeGeneralCompositeQuad(
  labels: readonly string[],
  facts: readonly GeoFact[],
  num: SideNumFn,
  angleOf: AngleOfFn
): Vec2[] {
  const [a, b, c, d] = labels;
  const bdDiagonal =
    facts.some((f) => f.k === "draw" && pairKey(f.seg[0], f.seg[1]) === pairKey(b, d)) ||
    angleOf(c) === 90 ||
    hasExactVertexAngle(facts, b, [a, b, d]) === 90 ||
    hasExactVertexAngle(facts, d, [a, d, b]) === 90;
  const useBD = bdDiagonal && angleOf(b) !== 90 && hasExactVertexAngle(facts, c, [a, c, d]) !== 90;

  if (!useBD) {
    // القطر AC: مثلث ABC ثم المثلث ADC على الجهة المقابلة
    const angB = angleOf(b);
    const tri1 = placeTriangleFromKnowns({
      ab: num(a, b),
      bc: num(b, c),
      ca: num(a, c),
      angleDeg: { A: hasExactVertexAngle(facts, a, [b, a, c]), B: angB, C: hasExactVertexAngle(facts, c, [a, c, b]) },
      rightAt: angB === 90 ? "B" : undefined,
    });
    const A = tri1.A;
    const B = tri1.B;
    const C = tri1.C;
    const acLen = Math.hypot(C.x - A.x, C.y - A.y) || 6;
    const ux = (C.x - A.x) / acLen;
    const uy = (C.y - A.y) / acLen;
    let nx = -uy;
    let ny = ux;
    if ((B.x - A.x) * nx + (B.y - A.y) * ny > 0) {
      nx = -nx;
      ny = -ny;
    }
    let ad = num(a, d);
    let cd = num(c, d);
    const rightAtC = hasExactVertexAngle(facts, c, [a, c, d]) === 90;
    const rightAtA = hasExactVertexAngle(facts, a, [c, a, d]) === 90;
    const rightAtD = angleOf(d) === 90;
    let xLocal = acLen * 0.5;
    let yLocal = acLen * 0.6;
    if (rightAtC) {
      cd = cd ?? (ad && ad > acLen ? Math.sqrt(ad * ad - acLen * acLen) : acLen * 0.75);
      xLocal = acLen;
      yLocal = cd;
    } else if (rightAtA) {
      ad = ad ?? (cd && cd > acLen ? Math.sqrt(cd * cd - acLen * acLen) : acLen * 0.75);
      xLocal = 0;
      yLocal = ad;
    } else if (ad && cd && ad + cd > acLen && ad + acLen > cd && cd + acLen > ad) {
      xLocal = (acLen * acLen + ad * ad - cd * cd) / (2 * acLen);
      yLocal = Math.sqrt(Math.max(ad * ad - xLocal * xLocal, 0.25));
    } else if (rightAtD && (ad || cd)) {
      const known = ad ?? cd!;
      const other = Math.sqrt(Math.max(acLen * acLen - known * known, 1));
      const aLen = ad ?? other;
      xLocal = (aLen * aLen) / acLen;
      yLocal = Math.sqrt(Math.max(aLen * aLen - xLocal * xLocal, 0.25));
    }
    const D: Vec2 = { x: A.x + ux * xLocal + nx * yLocal, y: A.y + uy * xLocal + ny * yLocal };
    return [A, B, C, D];
  }

  // القطر BD: مثلث BCD ثم مثلث BAD على الجهة المقابلة
  const angC = angleOf(c);
  const tri1 = placeTriangleFromKnowns({
    ab: num(b, c),
    bc: num(c, d),
    ca: num(b, d),
    angleDeg: { B: angC },
    rightAt: angC === 90 ? "B" : undefined,
  });
  const B = tri1.A;
  const C = tri1.B;
  const D = tri1.C;
  const bdLen = Math.hypot(D.x - B.x, D.y - B.y) || 6;
  const ux = (D.x - B.x) / bdLen;
  const uy = (D.y - B.y) / bdLen;
  let nx = -uy;
  let ny = ux;
  if ((C.x - B.x) * nx + (C.y - B.y) * ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  const ab = num(a, b);
  const ad = num(a, d);
  let xLocal = bdLen * 0.5;
  let yLocal = bdLen * 0.6;
  if (ab && ad && ab + ad > bdLen && ab + bdLen > ad && ad + bdLen > ab) {
    xLocal = (bdLen * bdLen + ab * ab - ad * ad) / (2 * bdLen);
    yLocal = Math.sqrt(Math.max(ab * ab - xLocal * xLocal, 0.25));
  }
  const A: Vec2 = { x: B.x + ux * xLocal + nx * yLocal, y: B.y + uy * xLocal + ny * yLocal };
  return [A, B, C, D];
}
