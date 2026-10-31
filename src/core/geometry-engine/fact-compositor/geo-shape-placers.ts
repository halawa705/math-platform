/**
 * @file geo-shape-placers.ts
 * @description يضع المضلعات المعلنة (مثلثات/رباعيات) على المستوى بأطوالها المعطاة، ويعيد النقاط والأضلاع.
 */
import type { GeoFact } from "./geo-fact-types";
import { pairKey } from "./geo-label-utils";
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
  const num = (a: string, b: string) => lengths.get(pairKey(a, b))?.numeric;
  const angleOf = (v: string) => { const f = facts.find((x) => x.k === "angle" && x.vertex === v && x.deg !== undefined); return f && f.k === "angle" ? f.deg : undefined; };
  const polygons: PlacedPolygon[] = [];
  let cursorX = 0;

  // دعم تشابه المضلعات الرباعية والمستطيلات المعلنة عبر حقيقة التشابه
  const effectiveFacts: GeoFact[] = [...facts];
  const hasShape = facts.some((f) => f.k === "triangle" || f.k === "quad");
  if (!hasShape) {
    const simQuad = facts.find((f) => f.k === "similarity" && f.tri1.length === 4 && f.tri2.length === 4);
    if (simQuad && simQuad.k === "similarity") {
      effectiveFacts.push({ k: "quad", kind: "rectangle", labels: [simQuad.tri1[0], simQuad.tri1[1], simQuad.tri1[2], simQuad.tri1[3]] });
      effectiveFacts.push({ k: "quad", kind: "rectangle", labels: [simQuad.tri2[0], simQuad.tri2[1], simQuad.tri2[2], simQuad.tri2[3]] });
    }
  }

  for (const f of effectiveFacts) {
    if (f.k !== "triangle" && f.k !== "quad") continue;
    const labels = f.labels;
    let local: Vec2[];
    if (f.k === "triangle") {
      const [a, b, c] = labels;
      const keyOf = (l: string): TriVertexKey | undefined => (l === a ? "A" : l === b ? "B" : l === c ? "C" : undefined);
      const tri = placeTriangleFromKnowns({
        ab: num(a, b), bc: num(b, c), ca: num(c, a),
        angleDeg: { A: angleOf(a), B: angleOf(b), C: angleOf(c) },
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
      else if (f.kind === "trapezoid") { const top = num(c, d) ?? w * 0.5; const h = w * 0.55; const o = (w - top) / 2; local = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: o + top, y: h }, { x: o, y: h }]; }
      else local = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w * 0.85, y: w * 0.7 }, { x: w * 0.1, y: w * 0.6 }];
    }
    const minX = Math.min(...local.map((p) => p.x));
    const maxX = Math.max(...local.map((p) => p.x));
    labels.forEach((l, i) => { if (!points.has(l)) points.set(l, { x: local[i].x - minX + cursorX, y: local[i].y }); });
    cursorX += maxX - minX + (maxX - minX) * 0.45;
    polygons.push({ labels, kind: f.k === "quad" ? f.kind : "triangle", rightAt: f.k === "triangle" ? f.right : undefined });
  }
  return polygons;
}
