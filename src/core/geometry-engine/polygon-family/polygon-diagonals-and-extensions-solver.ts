/**
 * @file polygon-diagonals-and-extensions-solver.ts
 * @description حلال أقطار المضلعات المتقاطعة وامتدادات أضلاع المضلعات المنتظمة التي تتلاقى خارج المضلع أو تحيط به.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 195 سطراً).
 */

import type { GeoFact, Seg } from "../fact-compositor/geo-fact-types";
import { pairKey } from "../fact-compositor/geo-label-utils";
import type { PlacedPolygon } from "../fact-compositor/geo-shape-placers";
import { lineIntersection, vAdd, vDist, vLerp, vScale, vSub, type Vec2 } from "../fact-compositor/geo-vector-math";

export const MODULE_ID_POLYGON_DIAGONALS_AND_EXTENSIONS_SOLVER =
  "polygon_diagonals_and_extensions_solver" as const;

const vNorm = (v: Vec2): Vec2 => {
  const m = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / m, y: v.y / m };
};

/**
 * يمنع معاملة مثلث ناتج عن أقطار أو امتدادات مضلع أكبر كشكل مستقل خارج المضلع.
 */
export function isSubTriangleFromDiagonalsOrExtensions(
  labels: readonly string[],
  facts: readonly GeoFact[],
  points: ReadonlyMap<string, Vec2>,
  polygons: readonly PlacedPolygon[]
): boolean {
  if (labels.length !== 3 || polygons.length === 0) return false;
  const basePolyVerts = new Set(polygons.flatMap((p) => p.labels));
  const placedCount = labels.filter((l) => points.has(l)).length;
  const hasDiagMeetPt =
    polygons.some((p) => p.labels.length >= 5) &&
    labels.some((l) => facts.some((f) => f.k === "diagonalsMeet" && f.p === l));
  if (hasDiagMeetPt) return true;
  if (placedCount >= 2 && labels.some((l) => facts.some((f) => (f.k === "diagonalsMeet" || f.k === "intersect" || f.k === "extend") && (f.k === "extend" ? f.to === l : f.p === l)))) {
    return true;
  }
  const hasAlternatingExt = facts.filter((f) => f.k === "intersect" && labels.includes(f.p)).length >= 2;
  if (hasAlternatingExt && basePolyVerts.size >= 5) return true;
  return false;
}

/**
 * يعالج تقاطع القطرين داخل أي مضلع (رباعي أو خماسي أو سداسي)، وتقاطع امتدادات ضلعين أو ثلاث أضلاع خارج المضلع.
 */
export function solvePolygonDiagonalsAndExtensions(params: {
  readonly facts: readonly GeoFact[];
  readonly polygons: readonly PlacedPolygon[];
  readonly points: Map<string, Vec2>;
  readonly isPolygonSide: (a: string, b: string) => boolean;
  readonly addExtra: (a: string, b: string, dashed?: boolean) => void;
}): void {
  const { facts, polygons, points, isPolygonSide, addExtra } = params;
  if (polygons.length === 0) return;

  // 1. تقاطع قطرين في أي مضلع (بما فيه الخماسي والسداسي مثل AC ∩ BD = {M})
  for (const dm of facts) {
    if (dm.k !== "diagonalsMeet" || points.has(dm.p)) continue;
    let d1: Seg | undefined = dm.diag1;
    let d2: Seg | undefined = dm.diag2;
    if (!d1 || !d2) {
      const targetPoly = polygons.find((pl) => pl.labels.length >= 4);
      if (targetPoly) {
        d1 = [targetPoly.labels[0], targetPoly.labels[2]];
        d2 = [targetPoly.labels[1], targetPoly.labels[3]];
      }
    }
    if (d1 && d2) {
      const p1 = points.get(d1[0]); const p2 = points.get(d1[1]);
      const p3 = points.get(d2[0]); const p4 = points.get(d2[1]);
      if (p1 && p2 && p3 && p4) {
        const hit = lineIntersection(p1, p2, p3, p4);
        if (hit) {
          points.set(dm.p, hit);
          addExtra(d1[0], d1[1]);
          addExtra(d2[0], d2[1]);
        }
      }
    }
  }

  // 2. تقاطع امتدادات أضلاع المضلع في نقطة خارجية (مثل نمد ED و BC ليتقاطعا في G، أو AB -> X و DC -> Y يتقاطعان في Z)
  const extFacts = facts.filter((f): f is Extract<GeoFact, { k: "extend" }> => f.k === "extend");
  const interFacts = facts.filter((f): f is Extract<GeoFact, { k: "intersect" }> => f.k === "intersect");

  for (const inf of interFacts) {
    const a0 = points.get(inf.a[0]); const a1 = points.get(inf.a[1]);
    const b0 = points.get(inf.b[0]); const b1 = points.get(inf.b[1]);
    if (!a0 || !a1 || !b0 || !b1) continue;
    const hit = lineIntersection(a0, a1, b0, b1);
    if (!hit) continue;

    if (!points.has(inf.p)) points.set(inf.p, hit);
    const pHit = points.get(inf.p)!;

    // ربط كل امتداد من أقرب نهاية في الضلع الأصلي إلى نقطة التقاطع الخارجية
    const nearA = vDist(a0, pHit) <= vDist(a1, pHit) ? inf.a[0] : inf.a[1];
    const nearB = vDist(b0, pHit) <= vDist(b1, pHit) ? inf.b[0] : inf.b[1];
    addExtra(nearA, inf.p, true);
    addExtra(nearB, inf.p, true);

    // وضع علامات الأشعة الوسيطة فقط عند الحاجة مع تجنب تكرار قطعة متراكبة فوق الامتداد
    for (const ef of extFacts) {
      if (ef.to === inf.p || points.has(ef.to)) continue;
      const matchesA = pairKey(ef.from, ef.through) === pairKey(inf.a[0], inf.a[1]);
      const matchesB = pairKey(ef.from, ef.through) === pairKey(inf.b[0], inf.b[1]);
      if (!matchesA && !matchesB) continue;
      const nearEnd = matchesA ? nearA : nearB;
      const pNear = points.get(nearEnd)!;
      const pFar = points.get(ef.from === nearEnd ? ef.through : ef.from)!;
      const dir = vNorm(vSub(pHit, pFar));
      const dHit = vDist(pNear, pHit);
      const ptPos = dHit > 0.4 ? vAdd(pHit, vScale(dir, Math.max(0.9, dHit * 0.28))) : vLerp(pNear, pHit, 0.65);
      points.set(ef.to, ptPos);
      addExtra(inf.p, ef.to, true);
    }
  }

  // 3. ربط الأقطار المطلوب رسمها إن وُجدت كل نقاطها ولم تكن أضلاعاً
  for (const f of facts) {
    if (f.k === "draw" && points.has(f.seg[0]) && points.has(f.seg[1]) && !isPolygonSide(f.seg[0], f.seg[1])) {
      addExtra(f.seg[0], f.seg[1], false);
    }
  }
}
