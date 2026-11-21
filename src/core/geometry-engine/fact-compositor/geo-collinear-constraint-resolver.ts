/**
 * @file geo-collinear-constraint-resolver.ts
 * @description حلال حقيقة الاستقامة الواحدة (`collinear`) داخل المركّب الهندسي:
 * يكمل أي نقطة ناقصة على امتداد المستقيم أو بين نقطتين، ويرسم القطع الموصلة الناقصة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 140 سطراً).
 */

import type { GeoFact, Seg } from "./geo-fact-types";
import { pairKey } from "./geo-label-utils";
import { vAdd, vDist, vLerp, vScale, vSub, type Vec2 } from "./geo-vector-math";

export const MODULE_ID_GEO_COLLINEAR_CONSTRAINT_RESOLVER =
  "geo_collinear_constraint_resolver" as const;

const vNorm = (v: Vec2): Vec2 => {
  const m = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / m, y: v.y / m };
};

export function resolveCollinearFactInComposer(params: {
  readonly fact: Extract<GeoFact, { k: "collinear" }>;
  readonly points: Map<string, Vec2>;
  readonly host: Map<string, Seg>;
  readonly lengths: ReadonlyMap<string, { numeric?: number }>;
  readonly isPolygonSide: (a: string, b: string) => boolean;
  readonly addExtra: (a: string, b: string, dashed?: boolean) => void;
}): boolean {
  const { fact, points, host, lengths, isPolygonSide, addExtra } = params;
  const labels = fact.labels;
  if (labels.length < 3) return true;

  const placedCount = labels.filter((l) => points.has(l)).length;
  if (placedCount < 2) return false;

  // تموضع النقاط الناقصة عبر نوافذ ثلاثية متتابعة (حتى تكتمل جميع النقاط على الخط)
  let changed = true;
  let guard = 0;
  while (changed && guard++ < labels.length * 2) {
    changed = false;
    for (let i = 0; i <= labels.length - 3; i++) {
      const a = labels[i];
      const b = labels[i + 1];
      const c = labels[i + 2];
      const pA = points.get(a);
      const pB = points.get(b);
      const pC = points.get(c);

      if (pA && pB && !pC) {
        const ab = vDist(pA, pB) || 1;
        const dir = vNorm(vSub(pB, pA));
        const bcLen = lengths.get(pairKey(b, c))?.numeric ?? ab * 0.65;
        points.set(c, vAdd(pB, vScale(dir, bcLen)));
        changed = true;
      } else if (pB && pC && !pA) {
        const bc = vDist(pB, pC) || 1;
        const dir = vNorm(vSub(pB, pC));
        const abLen = lengths.get(pairKey(a, b))?.numeric ?? bc * 0.65;
        points.set(a, vAdd(pB, vScale(dir, abLen)));
        changed = true;
      } else if (pA && pC && !pB) {
        const abLen = lengths.get(pairKey(a, b))?.numeric;
        const bcLen = lengths.get(pairKey(b, c))?.numeric;
        const acLen = lengths.get(pairKey(a, c))?.numeric;
        let t = 0.5;
        if (abLen && bcLen) t = abLen / (abLen + bcLen);
        else if (abLen && acLen && acLen > abLen) t = abLen / acLen;
        else if (bcLen && acLen && acLen > bcLen) t = 1 - bcLen / acLen;
        const clampedT = Math.min(0.92, Math.max(0.08, t));
        points.set(b, vLerp(pA, pC, clampedT));
        host.set(b, [a, c]);
        changed = true;
      }
    }
  }

  // إن بقيت أي نقاط ناقصة، لم تحن دورتها بعد
  if (labels.some((l) => !points.has(l))) return false;

  for (let i = 0; i + 1 < labels.length; i++) {
    const u = labels[i];
    const v = labels[i + 1];
    if (!isPolygonSide(u, v)) addExtra(u, v);
  }
  return true;
}
