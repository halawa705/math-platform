/**
 * @file geo-composite-constraint-helpers.ts
 * @description مساعدات القيود الهندسية المركبة: منع تكرار المضلعات، حل التوازي المقيد بانتماء نقطة على ضلع،
 * امتداد الأشعة المتقاطعة على أضلاع الشكل، نسب الأضلاع (مثل AD = 1/3 AB)، وشارات المحيط والمساحة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 150 سطراً).
 */

import type { CanonicalInteriorBadgeNode } from "@/core/ssot/geometry-archetype-ssot";
import type { GeoFact, Seg } from "./geo-fact-types";
import { pairKey } from "./geo-label-utils";
import type { PlacedPolygon } from "./geo-shape-placers";
import {
  lineIntersection,
  vAdd,
  vLerp,
  vSub,
  type Vec2,
} from "./geo-vector-math";

export const MODULE_ID_GEO_COMPOSITE_CONSTRAINT_HELPERS =
  "geo_composite_constraint_helpers" as const;

export function deduplicatePlacedPolygons(
  rawPolygons: readonly PlacedPolygon[]
): PlacedPolygon[] {
  const seen = new Set<string>();
  const out: PlacedPolygon[] = [];
  for (const poly of rawPolygons) {
    const key = [...poly.labels].sort().join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(poly);
  }
  return out;
}

export function tryPlaceSegmentRatioVertex(params: {
  fact: Extract<GeoFact, { k: "segmentRatio" }>;
  points: Map<string, Vec2>;
  host: Map<string, Seg>;
}): boolean {
  const { fact, points, host } = params;
  const [p0, p1] = fact.part;
  const [w0, w1] = fact.whole;
  const ratio = fact.num / fact.den;
  if (!Number.isFinite(ratio) || ratio <= 0 || ratio >= 1) return false;

  // إيجاد الرأس المشترك بين الجزء والضلع الكلي (مثل A في AD = 1/3 AB)
  const shared =
    p0 === w0 || p0 === w1 ? p0 : p1 === w0 || p1 === w1 ? p1 : null;
  if (!shared) return false;

  const target = shared === p0 ? p1 : p0;
  const otherEnd = shared === w0 ? w1 : w0;
  const PShared = points.get(shared);
  const POther = points.get(otherEnd);
  if (!PShared || !POther || points.has(target)) return false;

  points.set(target, vLerp(PShared, POther, ratio));
  host.set(target, fact.whole);
  return true;
}

export function tryPlaceParallelConstrainedByPointOn(params: {
  parallelFact: Extract<GeoFact, { k: "parallel" }>;
  facts: readonly GeoFact[];
  points: Map<string, Vec2>;
  host: Map<string, Seg>;
  addExtra: (a: string, b: string, dashed?: boolean) => void;
  addParallelMark: (a: string, b: string, grp: number) => void;
  nextGroup: () => number;
}): boolean {
  const {
    parallelFact,
    facts,
    points,
    host,
    addExtra,
    addParallelMark,
    nextGroup,
  } = params;
  const [a0, a1] = parallelFact.a;
  const [b0, b1] = parallelFact.b;

  const aKnown = [points.has(a0), points.has(a1)];
  const bKnown = [points.has(b0), points.has(b1)];

  let anchorKey: string | null = null;
  let missKey: string | null = null;
  let refSeg: Seg | null = null;

  if (aKnown[0] !== aKnown[1] && bKnown[0] && bKnown[1]) {
    anchorKey = aKnown[0] ? a0 : a1;
    missKey = aKnown[0] ? a1 : a0;
    refSeg = [b0, b1];
  } else if (bKnown[0] !== bKnown[1] && aKnown[0] && aKnown[1]) {
    anchorKey = bKnown[0] ? b0 : b1;
    missKey = bKnown[0] ? b1 : b0;
    refSeg = [a0, a1];
  }

  if (!anchorKey || !missKey || !refSeg) return false;

  const hostFact = facts.find(
    (hf): hf is Extract<GeoFact, { k: "pointOn" }> =>
      hf.k === "pointOn" &&
      hf.p === missKey &&
      points.has(hf.seg[0]) &&
      points.has(hf.seg[1])
  );
  if (!hostFact) return false;

  const PA = points.get(anchorKey)!;
  const PR0 = points.get(refSeg[0])!;
  const PR1 = points.get(refSeg[1])!;
  const PS0 = points.get(hostFact.seg[0])!;
  const PS1 = points.get(hostFact.seg[1])!;

  const dir = vSub(PR1, PR0);
  const hit = lineIntersection(PA, vAdd(PA, dir), PS0, PS1);
  if (!hit) return false;

  points.set(missKey, hit);
  host.set(missKey, hostFact.seg);
  const grp = nextGroup();
  addParallelMark(a0, a1, grp);
  addParallelMark(b0, b1, grp);
  addExtra(anchorKey, missKey);
  return true;
}

export function registerIntersectingRaySegments(params: {
  s: Seg;
  p: string;
  points: Map<string, Vec2>;
  host: Map<string, Seg>;
  isPolygonSide: (a: string, b: string) => boolean;
  addExtra: (a: string, b: string, dashed?: boolean) => void;
}): void {
  const { s, p, points, host, isPolygonSide, addExtra } = params;
  const A = points.get(s[0]);
  const B = points.get(s[1]);
  const P = points.get(p);
  if (!A || !B || !P) return;

  const ab = vSub(B, A);
  const len2 = ab.x * ab.x + ab.y * ab.y;
  const pa = vSub(P, A);
  const t = len2 > 1e-6 ? (pa.x * ab.x + pa.y * ab.y) / len2 : 0.5;

  if (isPolygonSide(s[0], s[1])) {
    if (t > 0.02 && t < 0.98 && !host.has(p)) host.set(p, s);
    return;
  }

  const alreadySplit = isPolygonSide(s[0], p) && isPolygonSide(p, s[1]);
  if (alreadySplit) return;

  if (t > 1.02) {
    addExtra(s[0], s[1]);
    addExtra(s[1], p);
  } else if (t < -0.02) {
    addExtra(p, s[0]);
    addExtra(s[0], s[1]);
  } else {
    addExtra(s[0], s[1]);
  }
}

export function buildPerimeterAndAreaBadges(params: {
  facts: readonly GeoFact[];
  polygons: readonly PlacedPolygon[];
  points: Map<string, Vec2>;
  figureId: string;
}): CanonicalInteriorBadgeNode[] {
  const { facts, polygons, points, figureId } = params;
  const primary = polygons[0];
  if (!primary || primary.labels.length < 3) return [];

  const coords = primary.labels
    .map((l) => points.get(l))
    .filter((v): v is Vec2 => Boolean(v));
  if (coords.length < 3) return [];

  const cx = coords.reduce((s, c) => s + c.x, 0) / coords.length;
  const cy = coords.reduce((s, c) => s + c.y, 0) / coords.length;

  const badges: CanonicalInteriorBadgeNode[] = [];
  const seenTexts = new Set<string>();
  let idx = 0;
  for (const f of facts) {
    if (f.k === "perimeter") {
      const text = `المحيط = ${f.value} ${f.unit ?? "سم"}`;
      if (seenTexts.has(text)) continue;
      seenTexts.add(text);
      badges.push({
        id: `${figureId}_badge_perim_${idx++}`,
        text,
        position: { x: Number(cx.toFixed(2)), y: Number(cy.toFixed(2)) },
        labelKind: "given",
      });
    } else if (f.k === "area") {
      const text = `المساحة = ${f.value} ${f.unit ?? "سم²"}`;
      if (seenTexts.has(text)) continue;
      seenTexts.add(text);
      badges.push({
        id: `${figureId}_badge_area_${idx++}`,
        text,
        position: { x: Number(cx.toFixed(2)), y: Number(cy.toFixed(2)) },
        labelKind: "given",
      });
    }
  }
  return badges;
}

export function resolveParallelConstraintFact(params: {
  parallelFact: Extract<GeoFact, { k: "parallel" }>;
  facts: readonly GeoFact[];
  polygons: readonly PlacedPolygon[];
  points: Map<string, Vec2>;
  host: Map<string, Seg>;
  addExtra: (a: string, b: string, dashed?: boolean) => void;
  addParallelMark: (a: string, b: string, grp: number) => void;
  nextGroup: () => number;
  tryComposite: () => boolean;
  warnings: string[];
}): void {
  const { parallelFact, facts, polygons, points, host, addExtra, addParallelMark, nextGroup, tryComposite, warnings } = params;
  const [x, y] = parallelFact.a;
  const [p, q] = parallelFact.b;
  const basePoly = polygons.find((pl) => pl.labels.length === 3 && pl.labels.includes(p) && pl.labels.includes(q));
  if (!points.has(x) && !points.has(y) && basePoly) {
    const apex = basePoly.labels.find((l) => l !== p && l !== q);
    const passesThroughApex =
      Boolean(apex) &&
      (facts.some((pf) => pf.k === "pointOn" && pf.p === apex && pairKey(pf.seg[0], pf.seg[1]) === pairKey(x, y)) ||
        facts.some((af) => af.k === "angle" && af.vertex === apex && (af.arms?.includes(x) || af.arms?.includes(y))));
    if (apex && !passesThroughApex) {
      points.set(x, vLerp(points.get(apex)!, points.get(p)!, 0.48));
      host.set(x, [apex, p]);
      points.set(y, vLerp(points.get(apex)!, points.get(q)!, 0.48));
      host.set(y, [apex, q]);
    }
  }
  if (tryPlaceParallelConstrainedByPointOn({ parallelFact, facts, points, host, addExtra, addParallelMark, nextGroup })) return;
  if (tryComposite()) return;
  if (!points.has(x) || !points.has(y) || !points.has(p) || !points.has(q)) {
    warnings.push("توازي بنقاط غير معرّفة");
    return;
  }
  const d = vSub(points.get(q)!, points.get(p)!);
  const hy = host.get(y);
  const hx = host.get(x);
  if (hy) {
    const r = lineIntersection(points.get(x)!, vAdd(points.get(x)!, d), points.get(hy[0])!, points.get(hy[1])!);
    if (r) points.set(y, r);
  } else if (hx) {
    const r = lineIntersection(points.get(y)!, vAdd(points.get(y)!, d), points.get(hx[0])!, points.get(hx[1])!);
    if (r) points.set(x, r);
  }
  const grp = nextGroup();
  addParallelMark(x, y, grp);
  addParallelMark(p, q, grp);
  addExtra(x, y);
}
