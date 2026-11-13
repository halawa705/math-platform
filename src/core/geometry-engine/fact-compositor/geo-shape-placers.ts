/**
 * @file geo-shape-placers.ts
 * @description يضع المضلعات المعلنة (مثلثات/رباعيات) على المستوى بأطوالها المعطاة، ويعيد النقاط والأضلاع.
 */
import type { GeoFact } from "./geo-fact-types";
import { pairKey } from "./geo-label-utils";
import {
  inferTriangleAngleOverridesFromComposites,
  tryPlaceIntersectingBowTieTriangles,
} from "./geo-composite-topology-placer";
import { placeTriangleFromKnowns, type TriVertexKey } from "./geo-triangle-placer";
import type { Vec2 } from "./geo-vector-math";

export const MODULE_ID_GEO_SHAPE_PLACERS = "geo_shape_placers" as const;

export type LengthMap = ReadonlyMap<string, { readonly text: string; readonly numeric?: number }>;
export interface PlacedPolygon { readonly labels: readonly string[]; readonly kind: string; readonly rightAt?: string }

const rad = (d: number) => (d * Math.PI) / 180;

export function placeDeclaredShapes(
  facts: readonly GeoFact[],
  lengths: LengthMap,
  points: Map<string, Vec2>
): PlacedPolygon[] {
  const num = (a: string, b: string): number | undefined => {
    const direct = lengths.get(pairKey(a, b))?.numeric;
    if (direct !== undefined) return direct;
    // استنتاج طول الضلع الكلي إذا كان مقسوماً بنقطة تنتمي إليه أو منتصفه (مثل AD = 4 و DB = 2 => AB = 6)
    for (const f of facts) {
      if ((f.k === "pointOn" || f.k === "midpoint") && pairKey(f.seg[0], f.seg[1]) === pairKey(a, b)) {
        const p1 = lengths.get(pairKey(a, f.p))?.numeric;
        const p2 = lengths.get(pairKey(f.p, b))?.numeric;
        if (p1 !== undefined && p2 !== undefined) return p1 + p2;
        if (f.k === "midpoint" && (p1 !== undefined || p2 !== undefined)) return 2 * (p1 ?? p2!);
      }
    }
    return undefined;
  };
  const angleOf = (v: string) => { const f = facts.find((x) => x.k === "angle" && x.vertex === v && x.deg !== undefined); return f && f.k === "angle" ? f.deg : undefined; };
  const polygons: PlacedPolygon[] = [];
  let cursorX = 0;

  if (tryPlaceIntersectingBowTieTriangles(facts, lengths, points, polygons, num, angleOf)) {
    return polygons;
  }

  // دعم تشابه وتطابق المضلعات والمثلثات المعلنة عبر حقيقة التشابه أو التطابق
  const effectiveFacts: GeoFact[] = [...facts];
  const hasShape = facts.some((f) => f.k === "triangle" || f.k === "quad");
  if (!hasShape) {
    for (const f of facts) {
      if ((f.k === "similarity" || f.k === "congruence") && f.tri1.length === 4 && f.tri2.length === 4) {
        effectiveFacts.push({ k: "quad", kind: "rectangle", labels: [f.tri1[0], f.tri1[1], f.tri1[2], f.tri1[3]] });
        effectiveFacts.push({ k: "quad", kind: "rectangle", labels: [f.tri2[0], f.tri2[1], f.tri2[2], f.tri2[3]] });
      } else if ((f.k === "similarity" || f.k === "congruence") && f.tri1.length === 3 && f.tri2.length === 3) {
        effectiveFacts.push({ k: "triangle", labels: [f.tri1[0], f.tri1[1], f.tri1[2]] });
        effectiveFacts.push({ k: "triangle", labels: [f.tri2[0], f.tri2[1], f.tri2[2]] });
      }
    }
  }

  for (const f of effectiveFacts) {
    if (f.k !== "triangle" && f.k !== "quad") continue;
    const labels = f.labels;
    let local: Vec2[];
    if (f.k === "triangle") {
      const [a, b, c] = labels;
      const keyOf = (l: string): TriVertexKey | undefined => (l === a ? "A" : l === b ? "B" : l === c ? "C" : undefined);
      const abVal = num(a, b);
      let bcVal = num(b, c);
      const caVal = num(c, a);
      // إذا كان هناك قاطع موازٍ للقاعدة BC (مثل DE // BC) معلوم الطول مع نسبة تقسيم معلومة، نستنتج طول BC المتناسب
      if (bcVal === undefined) {
        const par = facts.find((pf) => pf.k === "parallel" && (pairKey(pf.a[0], pf.a[1]) === pairKey(b, c) || pairKey(pf.b[0], pf.b[1]) === pairKey(b, c)));
        if (par && par.k === "parallel") {
          const cutSeg = pairKey(par.a[0], par.a[1]) === pairKey(b, c) ? par.b : par.a;
          const cutLen = lengths.get(pairKey(cutSeg[0], cutSeg[1]))?.numeric;
          if (cutLen !== undefined) {
            const dOnAB = lengths.get(pairKey(a, cutSeg[0]))?.numeric ?? lengths.get(pairKey(a, cutSeg[1]))?.numeric;
            const eOnAC = lengths.get(pairKey(a, cutSeg[1]))?.numeric ?? lengths.get(pairKey(a, cutSeg[0]))?.numeric;
            const r = dOnAB && abVal && abVal > dOnAB ? dOnAB / abVal : eOnAC && caVal && caVal > eOnAC ? eOnAC / caVal : undefined;
            if (r && r > 0.05 && r < 0.95) bcVal = cutLen / r;
          }
        }
      }
      const ov = inferTriangleAngleOverridesFromComposites(facts, labels);
      const tri = placeTriangleFromKnowns({
        ab: abVal, bc: bcVal, ca: caVal,
        angleDeg: { A: angleOf(a) ?? ov.get(a), B: angleOf(b) ?? ov.get(b), C: angleOf(c) ?? ov.get(c) },
        rightAt: f.right ? keyOf(f.right) : undefined,
        isoscelesApex: f.isoApex ? keyOf(f.isoApex) : undefined,
        equilateral: f.equilateral,
      });
      local = [tri.A, tri.B, tri.C];
    } else {
      const [a, b, c, d] = labels;
      const w = num(a, b) ?? num(c, d) ?? 6;
      const dPar = num(d, a) ?? num(b, c) ?? w * 0.6;
      const th = rad(angleOf(a) ?? 60);
      if (f.kind === "rectangle") local = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: dPar }, { x: 0, y: dPar }];
      else if (f.kind === "square") local = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: w }, { x: 0, y: w }];
      else if (f.kind === "rhombus") { const D = { x: w * Math.cos(th), y: w * Math.sin(th) }; local = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w + D.x, y: D.y }, D]; }
      else if (f.kind === "parallelogram") { const D = { x: dPar * Math.cos(th), y: dPar * Math.sin(th) }; local = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w + D.x, y: D.y }, D]; }
      else if (f.kind === "trapezoid") {
        const top = num(c, d) ?? w * 0.5;
        const isRightAtA = angleOf(a) === 90 || angleOf(d) === 90;
        const o = isRightAtA ? 0 : (w - top) / 2;
        const leg = num(d, a) ?? num(b, c);
        const h = isRightAtA ? (leg ?? w * 0.55) : leg && leg > Math.abs(o) ? Math.sqrt(leg * leg - o * o) : w * 0.55;
        local = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: o + top, y: h }, { x: o, y: h }];
      }
      else local = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w * 0.85, y: w * 0.7 }, { x: w * 0.1, y: w * 0.6 }];
    }
    if (f.k === "triangle" && labels.filter((l) => points.has(l)).length === 2) {
      const existing = labels.filter((l) => points.has(l));
      const missing = labels.find((l) => !points.has(l))!;
      const U = points.get(existing[0])!;
      const V = points.get(existing[1])!;
      const baseLen = Math.hypot(V.x - U.x, V.y - U.y);
      if (baseLen > 1e-6) {
        const uw = num(existing[0], missing) ?? baseLen * 0.85;
        const vw = num(existing[1], missing) ?? uw;
        const ex = { x: (V.x - U.x) / baseLen, y: (V.y - U.y) / baseLen };
        let ey = { x: -ex.y, y: ex.x };
        const otherPt = [...points.entries()].find(([k]) => k !== existing[0] && k !== existing[1])?.[1];
        if (otherPt && (otherPt.x - U.x) * ey.x + (otherPt.y - U.y) * ey.y > 0) {
          ey = { x: -ey.x, y: -ey.y };
        }
        const cosU = Math.max(-0.9, Math.min(0.9, (baseLen * baseLen + uw * uw - vw * vw) / (2 * baseLen * uw)));
        const sinU = Math.sqrt(Math.max(0.08, 1 - cosU * cosU));
        points.set(missing, {
          x: U.x + ex.x * uw * cosU + ey.x * uw * sinU,
          y: U.y + ex.y * uw * cosU + ey.y * uw * sinU,
        });
        polygons.push({ labels, kind: "triangle", rightAt: f.right });
        continue;
      }
    }
    const minX = Math.min(...local.map((p) => p.x));
    const maxX = Math.max(...local.map((p) => p.x));
    labels.forEach((l, i) => { if (!points.has(l)) points.set(l, { x: local[i].x - minX + cursorX, y: local[i].y }); });
    cursorX += maxX - minX + (maxX - minX) * 0.45;
    polygons.push({ labels, kind: f.k === "quad" ? f.kind : "triangle", rightAt: f.k === "triangle" ? f.right : undefined });
  }
  return polygons;
}
