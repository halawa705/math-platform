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
import {
  placeGeneralCompositeQuad,
  placeOrientedTrapezoid,
  reorderKiteLabelsIfSymmetric,
  tryPlaceAdjacentSquares,
} from "./geo-composite-quad-placer";
import {
  adjustRectangleDimsForPointOnEquality,
  inferParallelogramOrRhombusAngleADeg,
  tryPlaceSharedEdgeQuad,
  tryPlaceSharedEdgeTriangle,
} from "./geo-quad-angle-and-shared-placer";
import { placeTriangleFromKnowns, type TriVertexKey } from "./geo-triangle-placer";
import {
  placeRegularOrGeneralPolygon,
  tryPlaceSharedVertexCompositePolygon,
} from "./geo-shared-vertex-and-vertical-angle-placer";
import { tryPlaceGeneralOrConcavePolygon } from "../polygon-family/general-and-concave-polygon-placer";
import { tryPlaceSharedEdgePolygon } from "../polygon-family/adjacent-shared-polygons-placer";
import { isSubTriangleFromDiagonalsOrExtensions } from "../polygon-family/polygon-diagonals-and-extensions-solver";
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
    for (const f of facts) {
      if (f.k === "areaOnSide" && pairKey(f.seg[0], f.seg[1]) === pairKey(a, b)) {
        return Math.sqrt(f.area);
      }
    }
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
  const angleOf = (v: string, polySet?: ReadonlySet<string>) => {
    const f = facts.find(
      (x) =>
        x.k === "angle" &&
        x.vertex === v &&
        x.deg !== undefined &&
        (!polySet || !x.arms || x.arms.every((arm) => polySet.has(arm)))
    );
    return f && f.k === "angle" ? f.deg : undefined;
  };
  const polygons: PlacedPolygon[] = [];
  let cursorX = 0;

  if (tryPlaceIntersectingBowTieTriangles(facts, lengths, points, polygons, num, angleOf)) {
    return polygons;
  }
  if (tryPlaceAdjacentSquares(facts, num, points, polygons)) {
    return polygons;
  }

  // دعم تشابه وتطابق المضلعات والمثلثات المعلنة عبر حقيقة التشابه أو التطابق
  const effectiveFacts: GeoFact[] = [];
  const mergedTriBySet = new Map<string, Extract<GeoFact, { k: "triangle" }>>();
  for (const f of facts) {
    if (f.k !== "triangle") { effectiveFacts.push(f); continue; }
    const key = [...f.labels].sort().join("|");
    const prev = mergedTriBySet.get(key);
    if (!prev) {
      mergedTriBySet.set(key, f);
    } else {
      mergedTriBySet.set(key, {
        k: "triangle",
        labels: f.right || f.isoApex || f.equilateral ? f.labels : prev.labels,
        right: prev.right ?? f.right,
        isoApex: prev.isoApex ?? f.isoApex,
        equilateral: prev.equilateral ?? f.equilateral,
      });
    }
  }
  effectiveFacts.push(...mergedTriBySet.values());

  const hasShape = effectiveFacts.some((f) => f.k === "triangle" || f.k === "quad" || f.k === "polygon");
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

  // ترتيب المضلعات طوبولوجياً: الرباعيات الأساسية أولاً، ثم المثلثات الخارجية، ثم المثلثات الفرعية ذات الرؤوس المشتقة (مثل EMD داخل ABC)
  const diagMeetPts = new Set(facts.filter((x): x is Extract<GeoFact, { k: "diagonalsMeet" }> => x.k === "diagonalsMeet").map((x) => x.p));
  const derivedPts = new Set<string>();
  for (const x of facts) {
    if (x.k === "midpoint" || x.k === "pointOn" || x.k === "intersect") derivedPts.add(x.p);
  }
  const polyPriority = (f: GeoFact): number => {
    if (f.k === "polygon") return 0;
    if (f.k === "quad") return f.labels.some((l) => diagMeetPts.has(l)) ? 1.5 : 1;
    if (f.k === "triangle") return f.labels.some((l) => derivedPts.has(l)) ? 2.5 : 2;
    return 3;
  };
  effectiveFacts.sort((a, b) => polyPriority(a) - polyPriority(b));

  const isDerivedFromPlacedVertex = (v: string) =>
    derivedPts.has(v) ||
    facts.some((mf) => mf.k === "median" && ((mf.seg[0] === v && points.has(mf.seg[1])) || (mf.seg[1] === v && points.has(mf.seg[0]))));

  for (const f of effectiveFacts) {
    if (f.k !== "triangle" && f.k !== "quad" && f.k !== "polygon") continue;
    const labels = f.k === "quad" && f.kind === "general" ? reorderKiteLabelsIfSymmetric(f.labels, facts) : f.labels;
    if (f.k === "triangle" && labels.every((l) => points.has(l))) continue;
    const unplaced = labels.filter((l) => !points.has(l));
    if (f.k === "triangle" && polygons.length > 0 && unplaced.length >= 2 && unplaced.every((l) => isDerivedFromPlacedVertex(l))) {
      continue;
    }
    if (f.k === "triangle" && points.size >= 4 && labels.filter((l) => points.has(l)).length === 2 && facts.some((pf) => (pf.k === "pointOn" || pf.k === "diagonalsMeet") && labels.includes(pf.p))) {
      continue;
    }
    if (f.k === "triangle" && isSubTriangleFromDiagonalsOrExtensions(labels, facts, points, polygons)) {
      continue;
    }
    let local: Vec2[];
    if (f.k === "polygon") {
      local =
        tryPlaceGeneralOrConcavePolygon({
          labels,
          kind: "polygon",
          isRegular: f.regular,
          isConcave: f.concave,
          facts,
          angleOf,
        }) ?? placeRegularOrGeneralPolygon(labels, num);
      if (tryPlaceSharedEdgePolygon({ fact: f, localCoords: local, points, polygons })) continue;
    } else if (f.k === "triangle") {
      const [a, b, c] = labels;
      const keyOf = (l: string): TriVertexKey | undefined => (l === a ? "A" : l === b ? "B" : l === c ? "C" : undefined);
      let abVal = num(a, b);
      let bcVal = num(b, c);
      let caVal = num(c, a);
      // استنتاج طول الوتر من متوسط رأس القائمة أو من مثلث قائم شريك على نفس الوتر
      const inferHypFromMedianOrPartner = (v0: string, v1: string, rightV: string): number | undefined => {
        const midF = facts.find((mf): mf is Extract<GeoFact, { k: "midpoint" }> => mf.k === "midpoint" && pairKey(mf.seg[0], mf.seg[1]) === pairKey(v0, v1));
        const medLen = midF ? num(rightV, midF.p) : undefined;
        if (medLen !== undefined) return medLen * 2;
        const partner = effectiveFacts.find(
          (tf): tf is Extract<GeoFact, { k: "triangle" }> =>
            tf.k === "triangle" && tf !== f && Boolean(tf.right) && tf.labels.includes(v0) && tf.labels.includes(v1) && tf.right !== v0 && tf.right !== v1
        );
        if (partner && partner.right) {
          const l0 = num(partner.right, v0);
          const l1 = num(partner.right, v1);
          if (l0 && l1) return Math.hypot(l0, l1);
        }
        return undefined;
      };
      if (f.right === b && caVal === undefined) caVal = inferHypFromMedianOrPartner(a, c, b);
      else if (f.right === a && bcVal === undefined) bcVal = inferHypFromMedianOrPartner(b, c, a);
      else if (f.right === c && abVal === undefined) abVal = inferHypFromMedianOrPartner(a, b, c);
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
      const triSet = new Set(labels);
      const ov = inferTriangleAngleOverridesFromComposites(facts, labels);
      const tri = placeTriangleFromKnowns({
        ab: abVal, bc: bcVal, ca: caVal,
        angleDeg: { A: angleOf(a, triSet) ?? ov.get(a), B: angleOf(b, triSet) ?? ov.get(b), C: angleOf(c, triSet) ?? ov.get(c) },
        rightAt: f.right ? keyOf(f.right) : undefined,
        isoscelesApex: f.isoApex ? keyOf(f.isoApex) : undefined,
        equilateral: f.equilateral,
      });
      local = [tri.A, tri.B, tri.C];
    } else {
      if (tryPlaceSharedEdgeQuad(f, facts, num, points, polygons)) continue;
      const [a, b, c, d] = labels;
      const rawW = num(a, b) ?? num(c, d);
      const rawH = num(d, a) ?? num(b, c);
      const dims = f.kind === "rectangle"
        ? adjustRectangleDimsForPointOnEquality(labels, facts, rawW ?? 6, rawH ?? (rawW ?? 6) * 0.6, rawW !== undefined, rawH !== undefined)
        : { w: rawW ?? 6, h: rawH ?? (rawW ?? 6) * 0.6 };
      const w = dims.w;
      const dPar = dims.h;
      const th = rad(
        f.kind === "rhombus" || f.kind === "parallelogram"
          ? inferParallelogramOrRhombusAngleADeg(labels, f.kind, facts)
          : (angleOf(a) ?? 60)
      );
      const heightFact = facts.find((hf): hf is Extract<GeoFact, { k: "height" }> => hf.k === "height");
      if (f.kind === "rectangle") local = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: dPar }, { x: 0, y: dPar }];
      else if (f.kind === "square") local = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: w }, { x: 0, y: w }];
      else if (f.kind === "rhombus") { const D = { x: w * Math.cos(th), y: w * Math.sin(th) }; local = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w + D.x, y: D.y }, D]; }
      else if (f.kind === "parallelogram") {
        const effSide = !rawH && heightFact ? heightFact.value / Math.max(0.35, Math.sin(th)) : dPar;
        const D = { x: effSide * Math.cos(th), y: effSide * Math.sin(th) };
        local = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w + D.x, y: D.y }, D];
      }
      else if (f.kind === "trapezoid") local = placeOrientedTrapezoid(labels, facts, num, angleOf);
      else local =
        tryPlaceGeneralOrConcavePolygon({
          labels,
          kind: f.kind,
          isConcave: f.concave,
          facts,
          angleOf,
        }) ?? placeGeneralCompositeQuad(labels, facts, num, angleOf);
    }
    if (f.k === "triangle" && tryPlaceSharedEdgeTriangle(f, facts, num, angleOf, points, polygons)) {
      continue;
    }
    if (
      labels.filter((l) => points.has(l)).length === 1 &&
      tryPlaceSharedVertexCompositePolygon({ fact: f, localCoords: local, facts, num, angleOf, points, polygons })
    ) {
      continue;
    }
    const minX = Math.min(...local.map((p) => p.x));
    const maxX = Math.max(...local.map((p) => p.x));
    labels.forEach((l, i) => { if (!points.has(l)) points.set(l, { x: local[i].x - minX + cursorX, y: local[i].y }); });
    cursorX += maxX - minX + (maxX - minX) * 0.45;
    polygons.push({
      labels,
      kind: f.k === "quad" ? f.kind : f.k === "polygon" ? "polygon" : "triangle",
      rightAt: f.k === "triangle" ? f.right : undefined,
    });
  }
  return polygons;
}
