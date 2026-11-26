/**
 * @file polygon-winding-and-self-intersection-guard.ts
 * @description حارس طوبولوجي يمنع تقاطع أضلاع المضلع ذاتياً (Bowtie) ويحفظ تحدب/تقعر الرؤوس أثناء التحسين والتحقق.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 110 سطراً).
 */

import type { CanonicalGeometryFigureIR, Point2DCoordinate } from "@/core/ssot/geometry-archetype-ssot";

export const MODULE_ID_POLYGON_WINDING_AND_SELF_INTERSECTION_GUARD =
  "polygon_winding_and_self_intersection_guard" as const;

function ccwTurn(a: Point2DCoordinate, b: Point2DCoordinate, c: Point2DCoordinate): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

/** يفحص تقاطع قطعتين غير متجاورتين تقاطعاً داخلياً صريحاً. */
export function segmentsProperlyIntersect(
  a: Point2DCoordinate,
  b: Point2DCoordinate,
  c: Point2DCoordinate,
  d: Point2DCoordinate
): boolean {
  const d1 = ccwTurn(a, b, c);
  const d2 = ccwTurn(a, b, d);
  const d3 = ccwTurn(c, d, a);
  const d4 = ccwTurn(c, d, b);
  return ((d1 > 1e-6 && d2 < -1e-6) || (d1 < -1e-6 && d2 > 1e-6)) &&
    ((d3 > 1e-6 && d4 < -1e-6) || (d3 < -1e-6 && d4 > 1e-6));
}

/** يتحقق من خلو مصفوفة نقاط مضلع من أي تقاطع ذاتي بين أضلاعه غير المتجاورة. */
export function hasPolygonRingSelfIntersection(pts: readonly Point2DCoordinate[]): boolean {
  const n = pts.length;
  if (n < 4) return false;
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      const c = pts[j];
      const d = pts[(j + 1) % n];
      if (segmentsProperlyIntersect(a, b, c, d)) return true;
    }
  }
  return false;
}

/** يتحقق من خلو جميع المضلعات في الشكل من التقاطع الذاتي. */
export function hasFigurePolygonSelfIntersection(fig: CanonicalGeometryFigureIR): boolean {
  const pos = new Map(fig.vertices.map((v) => [v.id, v.position] as const));
  for (const poly of fig.polygons ?? []) {
    const pts = poly.map((id) => pos.get(id)).filter((p): p is Point2DCoordinate => Boolean(p));
    if (pts.length === poly.length && hasPolygonRingSelfIntersection(pts)) return true;
  }
  return false;
}

/** يحفظ إشارات الانعطاف (تحدب/تقعر) لكل رأس في المضلعات بين الشكل الأصلي والشكل المصقول. */
export function preservesPolygonConcavitySigns(
  orig: CanonicalGeometryFigureIR,
  cand: CanonicalGeometryFigureIR
): boolean {
  const origPos = new Map(orig.vertices.map((v) => [v.id, v.position] as const));
  const candPos = new Map(cand.vertices.map((v) => [v.id, v.position] as const));
  for (const poly of cand.polygons ?? []) {
    if (poly.length < 4) continue;
    const oPts = poly.map((id) => origPos.get(id)).filter((p): p is Point2DCoordinate => Boolean(p));
    const cPts = poly.map((id) => candPos.get(id)).filter((p): p is Point2DCoordinate => Boolean(p));
    if (oPts.length !== poly.length || cPts.length !== poly.length) continue;
    if (hasPolygonRingSelfIntersection(cPts)) return false;
    const n = poly.length;
    const areaSign = (pts: readonly Point2DCoordinate[]) =>
      pts.reduce((s, p, i) => s + (p.x * pts[(i + 1) % n].y - pts[(i + 1) % n].x * p.y), 0) >= 0 ? 1 : -1;
    const oOrient = areaSign(oPts);
    const cOrient = areaSign(cPts);
    for (let i = 0; i < n; i++) {
      const oTurn = ccwTurn(oPts[(i + n - 1) % n], oPts[i], oPts[(i + 1) % n]) * oOrient;
      const cTurn = ccwTurn(cPts[(i + n - 1) % n], cPts[i], cPts[(i + 1) % n]) * cOrient;
      if (Math.abs(oTurn) > 1e-4 && oTurn * cTurn <= 0) return false;
    }
  }
  return true;
}

export function figureHasReflexAngles(fig: CanonicalGeometryFigureIR): boolean {
  return fig.angles.some((a) => Boolean(a.isReflex) || (typeof a.degrees === "number" && a.degrees > 180));
}
