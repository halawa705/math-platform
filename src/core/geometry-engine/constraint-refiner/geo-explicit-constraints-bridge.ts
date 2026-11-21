/**
 * @file geo-explicit-constraints-bridge.ts
 * @description جسر تحويل الحقائق الهندسية الصريحة (`collinear`، `extend`، `intersect`، `parallel`، `perp`)
 * إلى قيود معرفات رؤوس ثابتة يلتزم بها المحسّن العددي (Levenberg-Marquardt) دون تشويه الاستقامة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 120 سطراً).
 */

import type { GeoFact } from "../fact-compositor/geo-fact-types";
import type { Vec2 } from "../fact-compositor/geo-vector-math";
import type { CanonicalExplicitGeometryConstraints } from "./explicit-geometry-constraints-types";

export const MODULE_ID_GEO_EXPLICIT_CONSTRAINTS_BRIDGE =
  "geo_explicit_constraints_bridge" as const;

function orderCollinearTripleByLayout(
  u: string,
  midCandidate: string,
  v: string,
  points: ReadonlyMap<string, Vec2>
): [string, string, string] {
  const pu = points.get(u);
  const pm = points.get(midCandidate);
  const pv = points.get(v);
  if (!pu || !pm || !pv) return [u, midCandidate, v];

  // نختار الرأس الأوسط الذي تكون عنده المتجهتان نحو الطرفين متعاكستين (الجداء القياسي سالب)
  const dot = (a: Vec2, m: Vec2, b: Vec2) =>
    (a.x - m.x) * (b.x - m.x) + (a.y - m.y) * (b.y - m.y);
  if (dot(pu, pm, pv) <= 0) return [u, midCandidate, v];
  if (dot(pm, pu, pv) <= 0) return [midCandidate, u, v];
  return [u, v, midCandidate];
}

export function buildExplicitConstraintsFromGeoFacts(
  facts: readonly GeoFact[],
  figureId: string,
  points: ReadonlyMap<string, Vec2>
): CanonicalExplicitGeometryConstraints | undefined {
  const keyId = (k: string) => `${figureId}_v_${k}`;
  const collinearTriples: Array<readonly [string, string, string]> = [];
  const parallelPairs: Array<readonly [string, string, string, string]> = [];
  const perpendicularPairs: Array<readonly [string, string, string, string]> = [];
  const seenTriples = new Set<string>();

  const pushTriple = (e1: string, mid: string, e2: string) => {
    if (!points.has(e1) || !points.has(mid) || !points.has(e2)) return;
    if (e1 === mid || mid === e2 || e1 === e2) return;
    const [o1, om, o2] = orderCollinearTripleByLayout(e1, mid, e2, points);
    const sig = o1 < o2 ? `${o1}|${om}|${o2}` : `${o2}|${om}|${o1}`;
    if (seenTriples.has(sig)) return;
    seenTriples.add(sig);
    collinearTriples.push([keyId(o1), keyId(om), keyId(o2)]);
  };

  for (const f of facts) {
    if (f.k === "collinear") {
      for (let i = 0; i <= f.labels.length - 3; i++) {
        pushTriple(f.labels[i], f.labels[i + 1], f.labels[i + 2]);
      }
    } else if (f.k === "extend") {
      pushTriple(f.from, f.through, f.to);
    } else if (f.k === "intersect") {
      if (f.a[0] !== f.p && f.a[1] !== f.p) pushTriple(f.a[0], f.p, f.a[1]);
      if (f.b[0] !== f.p && f.b[1] !== f.p) pushTriple(f.b[0], f.p, f.b[1]);
    } else if (f.k === "parallel") {
      const [a0, a1] = f.a;
      const [b0, b1] = f.b;
      if (points.has(a0) && points.has(a1) && points.has(b0) && points.has(b1)) {
        parallelPairs.push([keyId(a0), keyId(a1), keyId(b0), keyId(b1)]);
      }
    } else if (f.k === "perp") {
      const [a0, a1] = f.a;
      const [b0, b1] = f.b;
      if (points.has(a0) && points.has(a1) && points.has(b0) && points.has(b1)) {
        perpendicularPairs.push([keyId(a0), keyId(a1), keyId(b0), keyId(b1)]);
      }
    }
  }

  if (collinearTriples.length === 0 && parallelPairs.length === 0 && perpendicularPairs.length === 0) {
    return undefined;
  }
  return { collinearTriples, parallelPairs, perpendicularPairs };
}
