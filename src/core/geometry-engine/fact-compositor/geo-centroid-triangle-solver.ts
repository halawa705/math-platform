/**
 * @file geo-centroid-triangle-solver.ts
 * @description محلّل هندسي تحليلي لإحداثيات رؤوس المثلث (A, B, C) بمعلومية أطوال المتوسطات أو أجزائها
 * أو تعامد متوسطين، باستخدام متطابقة المركز الثقلي (A + B + C = 3M) ونظرية أبولونيوس للمتوسطات.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 215 سطراً).
 */

import type { GeoFact } from "./geo-fact-types";
import { pairKey } from "./geo-label-utils";
import type { Vec2 } from "./geo-vector-math";

export const MODULE_ID_GEO_CENTROID_TRIANGLE_SOLVER =
  "geo_centroid_triangle_solver" as const;

export interface CentroidOrientationResult {
  readonly perpRightAngle?: {
    readonly meetVertex: string;
    readonly apex1: string;
    readonly apex2: string;
    readonly seg1Key: string;
    readonly seg2Key: string;
  };
  readonly notToScale?: boolean;
}

/**
 * يوجّه إحداثيات رؤوس المثلث (B في الأصل، BC أفقي، A للأعلى) مع الحفاظ التام على جميع المسافات الإقليدية.
 */
function orientTriangleRigidlyOnBaseBC(
  rawA: Vec2,
  rawB: Vec2,
  rawC: Vec2
): { A: Vec2; B: Vec2; C: Vec2 } {
  const dx = rawC.x - rawB.x;
  const dy = rawC.y - rawB.y;
  const bcLen = Math.hypot(dx, dy) || 1;
  const cos = dx / bcLen;
  const sin = dy / bcLen;
  const ax = (rawA.x - rawB.x) * cos + (rawA.y - rawB.y) * sin;
  const ay = -(rawA.x - rawB.x) * sin + (rawA.y - rawB.y) * cos;
  return {
    A: { x: ax, y: Math.abs(ay) || bcLen * 0.6 },
    B: { x: 0, y: 0 },
    C: { x: bcLen, y: 0 },
  };
}

function buildFromThreeSidesMap(
  AKey: string,
  BKey: string,
  CKey: string,
  ab: number,
  bc: number,
  ca: number
): { A: Vec2; B: Vec2; C: Vec2 } | null {
  if (ab + bc <= ca + 1e-3 || ab + ca <= bc + 1e-3 || bc + ca <= ab + 1e-3) return null;
  const x = (ab * ab + bc * bc - ca * ca) / (2 * bc);
  const y2 = ab * ab - x * x;
  if (y2 <= 1e-4) return null;
  return { A: { x, y: Math.sqrt(y2) }, B: { x: 0, y: 0 }, C: { x: bc, y: 0 } };
}

/**
 * يحل إحداثيات المثلث عند تعامد متوسطين أو عند إعطاء أطوال المتوسطات وأجزائها أو نظرية أبولونيوس.
 */
export function tryOrientCentroidAndPerpMediansTriangle(params: {
  facts: readonly GeoFact[];
  polygons: readonly { labels: readonly string[]; rightAt?: string }[];
  lengths: ReadonlyMap<string, { numeric?: number }>;
  points: Map<string, Vec2>;
}): CentroidOrientationResult {
  const { facts, polygons, lengths, points } = params;
  const tri = polygons.find((p) => p.labels.length === 3);
  if (!tri) return {};
  const [AKey, BKey, CKey] = tri.labels;

  const medianFootByApex = new Map<string, string>();
  for (const f of facts) {
    if (f.k === "median") {
      const a = tri.labels.includes(f.seg[0]) ? f.seg[0] : f.seg[1];
      const d = a === f.seg[0] ? f.seg[1] : f.seg[0];
      if (tri.labels.includes(a) && !tri.labels.includes(d)) medianFootByApex.set(a, d);
    }
  }
  for (const f of facts) {
    if (f.k === "midpoint") {
      const opp = tri.labels.find((v) => !f.seg.includes(v));
      if (opp && tri.labels.includes(f.seg[0]) && tri.labels.includes(f.seg[1]) && !medianFootByApex.has(opp)) {
        medianFootByApex.set(opp, f.p);
      }
    }
  }

  let meetV = "M";
  for (const f of facts) {
    if (f.k === "intersect" && !tri.labels.includes(f.p)) {
      meetV = f.p;
      break;
    }
    if (f.k === "pointOn" && !tri.labels.includes(f.p) && (tri.labels.includes(f.seg[0]) || tri.labels.includes(f.seg[1]))) {
      meetV = f.p;
    }
  }

  const getCentroidRadius = (apex: string): number | undefined => {
    const direct = lengths.get(pairKey(apex, meetV))?.numeric;
    if (direct && direct > 0) return direct;
    const foot = medianFootByApex.get(apex);
    if (foot) {
      const tail = lengths.get(pairKey(meetV, foot))?.numeric;
      if (tail && tail > 0) return tail * 2;
      const full = lengths.get(pairKey(apex, foot))?.numeric;
      if (full && full > 0) return (full * 2) / 3;
    }
    return undefined;
  };

  const getOuterSide = (u: string, v: string): number | undefined => {
    const direct = lengths.get(pairKey(u, v))?.numeric;
    if (direct && direct > 0) return direct;
    for (const f of facts) {
      if (f.k === "midpoint" && pairKey(f.seg[0], f.seg[1]) === pairKey(u, v)) {
        const half = lengths.get(pairKey(u, f.p))?.numeric ?? lengths.get(pairKey(v, f.p))?.numeric;
        if (half && half > 0) return half * 2;
      }
    }
    return undefined;
  };

  // الحالة 1: تعامد متوسطين (مثل AD ⊥ BE عند M أو BE ⊥ CD عند M)
  const perpFact = facts.find(
    (f): f is Extract<GeoFact, { k: "perp" }> =>
      f.k === "perp" &&
      tri.labels.some((v) => f.a.includes(v)) &&
      tri.labels.some((v) => f.b.includes(v)) &&
      pairKey(f.a[0], f.a[1]) !== pairKey(f.b[0], f.b[1])
  );
  if (perpFact) {
    const apex1 = tri.labels.find((v) => perpFact.a.includes(v));
    const apex2 = tri.labels.find((v) => perpFact.b.includes(v));
    if (apex1 && apex2 && apex1 !== apex2 && medianFootByApex.has(apex1) && medianFootByApex.has(apex2)) {
      const foot1 = perpFact.a[0] === apex1 ? perpFact.a[1] : perpFact.a[0];
      const foot2 = perpFact.b[0] === apex2 ? perpFact.b[1] : perpFact.b[0];
      const third = tri.labels.find((v) => v !== apex1 && v !== apex2)!;
      const side12 = getOuterSide(apex1, apex2);
      let r1 = getCentroidRadius(apex1);
      let r2 = getCentroidRadius(apex2);
      if (r1 && !r2 && side12 && side12 > r1 + 1e-3) r2 = Math.sqrt(side12 * side12 - r1 * r1);
      if (r2 && !r1 && side12 && side12 > r2 + 1e-3) r1 = Math.sqrt(side12 * side12 - r2 * r2);
      const eff1 = r1 ?? 6;
      const eff2 = r2 ?? 5;
      points.set(apex1, { x: 0, y: eff1 });
      points.set(apex2, { x: eff2, y: 0 });
      points.set(third, { x: -eff2, y: -eff1 });
      points.set(meetV, { x: 0, y: 0 });
      return {
        perpRightAngle: {
          meetVertex: meetV,
          apex1,
          apex2,
          seg1Key: pairKey(apex1, foot1),
          seg2Key: pairKey(apex2, foot2),
        },
      };
    }
  }

  const isEquilateral = facts.some((f) => f.k === "triangle" && f.equilateral);
  if (tri.rightAt || isEquilateral) return {};

  // الحالة 2: مثلث معلوم فيه متوسط واحد وضلع أو ضلعان (نظرية أبولونيوس مثل حاول 40 و 42 ومثال 37)
  for (const [apex, foot] of medianFootByApex.entries()) {
    const rApex = getCentroidRadius(apex);
    if (!rApex) continue;
    const medLen = rApex * 1.5;
    const [u, v] = tri.labels.filter((x) => x !== apex);
    const sOpp = getOuterSide(u, v);
    if (!sOpp) continue;
    const sumSq = 2 * (medLen * medLen + (sOpp / 2) * (sOpp / 2));
    let sideU = getOuterSide(apex, u);
    let sideV = getOuterSide(apex, v);
    if (sideU && sideV && Math.abs(sideU * sideU + sideV * sideV - sumSq) > 0.15 * sumSq) {
      return { notToScale: true };
    }
    if (sideU && !sideV && sumSq > sideU * sideU + 0.04) sideV = Math.sqrt(sumSq - sideU * sideU);
    else if (sideV && !sideU && sumSq > sideV * sideV + 0.04) sideU = Math.sqrt(sumSq - sideV * sideV);
    else if (!sideU && !sideV) {
      sideU = 0.6 * Math.sqrt(sumSq);
      sideV = 0.8 * Math.sqrt(sumSq);
    }
    if (sideU && sideV) {
      const sideByPair = new Map<string, number>([
        [pairKey(u, v), sOpp],
        [pairKey(apex, u), sideU],
        [pairKey(apex, v), sideV],
      ]);
      const placed = buildFromThreeSidesMap(
        AKey, BKey, CKey,
        sideByPair.get(pairKey(AKey, BKey))!,
        sideByPair.get(pairKey(BKey, CKey))!,
        sideByPair.get(pairKey(CKey, AKey))!
      );
      if (placed) {
        points.set(AKey, placed.A);
        points.set(BKey, placed.B);
        points.set(CKey, placed.C);
        return {};
      }
    }
  }

  // الحالة 3: معطيات أطوال على متوسطين أو جزأيهما (A + B + C = 3M)
  const rMap = new Map<string, number>();
  for (const v of tri.labels) {
    const rv = getCentroidRadius(v);
    if (rv !== undefined) rMap.set(v, rv);
  }
  if (rMap.size < 2) return {};

  const [u, v] = [...rMap.keys()];
  const w = tri.labels.find((x) => x !== u && x !== v)!;
  const ru = rMap.get(u)!;
  const rv = rMap.get(v)!;
  const suv = getOuterSide(u, v);

  if (suv !== undefined) {
    if (ru + rv <= suv + 1e-3 || Math.abs(ru - rv) >= suv - 1e-3) return { notToScale: true };
    const xm = (ru * ru + suv * suv - rv * rv) / (2 * suv);
    const ym = Math.sqrt(Math.max(0.04, ru * ru - xm * xm));
    const rawPts: Record<string, Vec2> = { [u]: { x: 0, y: 0 }, [v]: { x: suv, y: 0 }, [w]: { x: 3 * xm - suv, y: 3 * ym } };
    const oriented = orientTriangleRigidlyOnBaseBC(rawPts[AKey], rawPts[BKey], rawPts[CKey]);
    points.set(AKey, oriented.A); points.set(BKey, oriented.B); points.set(CKey, oriented.C);
    return {};
  }

  const angRad = (102 * Math.PI) / 180;
  const rawPts: Record<string, Vec2> = {
    [u]: { x: ru, y: 0 },
    [v]: { x: rv * Math.cos(angRad), y: rv * Math.sin(angRad) },
    [w]: { x: -(ru + rv * Math.cos(angRad)), y: -rv * Math.sin(angRad) },
  };
  const oriented = orientTriangleRigidlyOnBaseBC(rawPts[AKey], rawPts[BKey], rawPts[CKey]);
  points.set(AKey, oriented.A); points.set(BKey, oriented.B); points.set(CKey, oriented.C);
  return {};
}
