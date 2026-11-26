/**
 * @file adjacent-shared-polygons-placer.ts
 * @description موضع المضلعات المنتظمة والعامة المتجاورة (المشتركة في ضلع كامل أو رأس واحد) على الجهة الخارجية المقابلة دون تداخل.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 175 سطراً).
 */

import type { GeoFact } from "../fact-compositor/geo-fact-types";
import { pairKey } from "../fact-compositor/geo-label-utils";
import type { PlacedPolygon } from "../fact-compositor/geo-shape-placers";
import { vAdd, vDist, vScale, vSub, type Vec2 } from "../fact-compositor/geo-vector-math";

export const MODULE_ID_ADJACENT_SHARED_POLYGONS_PLACER =
  "adjacent_shared_polygons_placer" as const;

/**
 * يضع مضلعاً (خماسي/سداسي/ثماني أو رباعي) يشترك في ضلع كامل `(u, v)` مع مضلع موضوع مسبقاً.
 * يضمن تدوير وتقييس المضلع الجديد بحيث يقع بالكامل في نصف المستوى المقابل للمضلع القائم.
 */
export function tryPlaceSharedEdgePolygon(params: {
  readonly fact: Extract<GeoFact, { k: "polygon" }>;
  readonly localCoords: readonly Vec2[];
  readonly points: Map<string, Vec2>;
  readonly polygons: PlacedPolygon[];
}): boolean {
  const { fact, localCoords, points, polygons } = params;
  const labels = fact.labels;
  const n = labels.length;
  const knownIdxs = labels.map((l, i) => (points.has(l) ? i : -1)).filter((i) => i >= 0);
  if (knownIdxs.length !== 2) return false;

  const [i0, i1] = knownIdxs;
  const adjForward = (i0 + 1) % n === i1;
  const adjBackward = (i1 + 1) % n === i0;
  if (!adjForward && !adjBackward) return false;

  const uIdx = adjForward ? i0 : i1;
  const vIdx = adjForward ? i1 : i0;
  const uLbl = labels[uIdx];
  const vLbl = labels[vIdx];
  const U = points.get(uLbl)!;
  const V = points.get(vLbl)!;
  const targetEdgeLen = vDist(U, V);
  if (targetEdgeLen < 1e-6) return false;

  const lU = localCoords[uIdx];
  const lV = localCoords[vIdx];
  const localEdgeLen = vDist(lU, lV);
  if (localEdgeLen < 1e-6) return false;

  const scale = targetEdgeLen / localEdgeLen;
  const exWorld = vScale(vSub(V, U), 1 / targetEdgeLen);
  const eyWorld: Vec2 = { x: -exWorld.y, y: exWorld.x };

  const exLocal = vScale(vSub(lV, lU), 1 / localEdgeLen);
  const eyLocal: Vec2 = { x: -exLocal.y, y: exLocal.x };

  // نحدد جهة المضلع القائم على الخط UV لنضع المضلع الجديد في النصف المقابل
  const others = [...points.entries()].filter(([k]) => k !== uLbl && k !== vLbl).map(([, p]) => p);
  let worldFlip = 1;
  if (others.length > 0) {
    const cx = others.reduce((s, p) => s + p.x, 0) / others.length;
    const cy = others.reduce((s, p) => s + p.y, 0) / others.length;
    const existingSide = (cx - U.x) * eyWorld.x + (cy - U.y) * eyWorld.y;
    if (existingSide > 0) worldFlip = -1;
  }

  // متوسط الإحداثي العمودي لباقي رؤوس المضلع المحلي على المحور العمودي للضلع
  const localOthers = localCoords.filter((_, idx) => idx !== uIdx && idx !== vIdx);
  const avgLocalY =
    localOthers.reduce((s, pt) => s + (pt.x - lU.x) * eyLocal.x + (pt.y - lU.y) * eyLocal.y, 0) /
    Math.max(1, localOthers.length);
  const localFlip = avgLocalY >= 0 ? 1 : -1;
  const effSign = worldFlip * localFlip;

  labels.forEach((lbl, idx) => {
    if (points.has(lbl)) return;
    const d = vSub(localCoords[idx], lU);
    const along = (d.x * exLocal.x + d.y * exLocal.y) * scale;
    const perp = (d.x * eyLocal.x + d.y * eyLocal.y) * scale * effSign;
    points.set(lbl, vAdd(U, vAdd(vScale(exWorld, along), vScale(eyWorld, perp))));
  });

  polygons.push({ labels, kind: "polygon" });
  return true;
}

/**
 * يضع مثلثاً متطابقاً وموازياً لمثلث سابق يشترك معه في رأس واحد `sharedV` (مثل `BC ≅ CE` مع `AB // DC` و `AC // DE`)
 * عبر إزاحة متجهية تحفظ التوازي والاستقامة والتطابق بدقة حتى تنبعث أسهم التوازي تلقائياً.
 */
export function tryPlaceTranslatedParallelSharedVertexTriangle(params: {
  readonly fact: Extract<GeoFact, { k: "triangle" }>;
  readonly sharedV: string;
  readonly facts: readonly GeoFact[];
  readonly points: Map<string, Vec2>;
  readonly polygons: PlacedPolygon[];
}): boolean {
  const { fact, sharedV, facts, points, polygons } = params;
  const baseTri = polygons.find((p) => p.labels.length === 3 && p.labels.includes(sharedV));
  if (!baseTri) return false;
  const pShared = points.get(sharedV);
  if (!pShared) return false;

  const newOthers = fact.labels.filter((l) => l !== sharedV);
  const baseOthers = baseTri.labels.filter((l) => l !== sharedV);
  if (newOthers.length !== 2 || baseOthers.length !== 2) return false;

  let baseEnd: string | undefined;
  let extEnd: string | undefined;
  for (const bo of baseOthers) {
    for (const no of newOthers) {
      const k1 = pairKey(bo, sharedV);
      const k2 = pairKey(sharedV, no);
      if (facts.some((f) => f.k === "equal" && ((pairKey(f.a[0], f.a[1]) === k1 && pairKey(f.b[0], f.b[1]) === k2) || (pairKey(f.b[0], f.b[1]) === k1 && pairKey(f.a[0], f.a[1]) === k2)))) {
        baseEnd = bo; extEnd = no;
        break;
      }
    }
    if (baseEnd) break;
  }
  if (!baseEnd || !extEnd) return false;

  const baseSet = new Set(baseTri.labels);
  const newSet = new Set(fact.labels);
  const hasParallelBetween = facts.some(
    (f) => f.k === "parallel" && ((baseSet.has(f.a[0]) && baseSet.has(f.a[1]) && newSet.has(f.b[0]) && newSet.has(f.b[1])) || (baseSet.has(f.b[0]) && baseSet.has(f.b[1]) && newSet.has(f.a[0]) && newSet.has(f.a[1])))
  );
  if (!hasParallelBetween) return false;

  const baseApex = baseOthers.find((l) => l !== baseEnd);
  const newApex = newOthers.find((l) => l !== extEnd);
  const pBaseEnd = points.get(baseEnd);
  const pBaseApex = baseApex ? points.get(baseApex) : undefined;
  if (!baseApex || !newApex || !pBaseEnd || !pBaseApex) return false;

  const shift = vSub(pShared, pBaseEnd);
  points.set(extEnd, vAdd(pShared, shift));
  points.set(newApex, vAdd(pBaseApex, shift));
  polygons.push({ labels: fact.labels, kind: "triangle", rightAt: fact.right });
  return true;
}
