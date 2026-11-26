/**
 * @file geo-shared-vertex-and-vertical-angle-placer.ts
 * @description موضع المضلعات المركّبة المتصلة عبر رأس واحد مشترك (زوايا متقابلة بالرأس، امتداد ضلعين، أو دوران للخارج)
 * بالإضافة إلى باني المضلعات المنتظمة/العامة (خماسي، سداسي، سباعي، ثماني).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 240 سطراً).
 */

import type { GeoFact } from "./geo-fact-types";
import type { PlacedPolygon } from "./geo-shape-placers";
import { vAdd, vDist, vScale, vSub, type Vec2 } from "./geo-vector-math";
import { tryPlaceTranslatedParallelSharedVertexTriangle } from "../polygon-family/adjacent-shared-polygons-placer";

export const MODULE_ID_GEO_SHARED_VERTEX_AND_VERTICAL_ANGLE_PLACER =
  "geo_shared_vertex_and_vertical_angle_placer" as const;

type SideNumFn = (a: string, b: string) => number | undefined;
type AngleOfFn = (v: string, polySet?: ReadonlySet<string>) => number | undefined;

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const vNorm = (v: Vec2): Vec2 => {
  const m = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / m, y: v.y / m };
};

function computeExistingCentroid(points: ReadonlyMap<string, Vec2>, excludeKey: string): Vec2 | null {
  const others = [...points.entries()].filter(([k]) => k !== excludeKey).map(([, p]) => p);
  if (others.length === 0) return null;
  return {
    x: others.reduce((s, p) => s + p.x, 0) / others.length,
    y: others.reduce((s, p) => s + p.y, 0) / others.length,
  };
}

function estimateDefaultSpan(points: ReadonlyMap<string, Vec2>): number {
  const vals = [...points.values()];
  if (vals.length < 2) return 5;
  const xs = vals.map((p) => p.x);
  const ys = vals.map((p) => p.y);
  const span = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  return Math.max(3.5, Math.min(8, span * 0.55));
}

function collectCollinearRaysThroughVertex(
  sharedV: string,
  targetLabels: ReadonlySet<string>,
  facts: readonly GeoFact[],
  points: ReadonlyMap<string, Vec2>
): Map<string, Vec2> {
  const rays = new Map<string, Vec2>();
  const PShared = points.get(sharedV);
  if (!PShared) return rays;

  const registerOpposite = (placedK: string, unplacedU: string, sameDirection = false) => {
    if (!targetLabels.has(unplacedU) || points.has(unplacedU) || rays.has(unplacedU)) return;
    const PK = points.get(placedK);
    if (!PK || vDist(PShared, PK) < 1e-6) return;
    const dir = sameDirection ? vNorm(vSub(PK, PShared)) : vNorm(vSub(PShared, PK));
    rays.set(unplacedU, dir);
  };

  for (const f of facts) {
    if (f.k === "collinear" && f.labels.includes(sharedV)) {
      const idxS = f.labels.indexOf(sharedV);
      for (let i = 0; i < f.labels.length; i++) {
        const k = f.labels[i];
        if (k === sharedV || !points.has(k)) continue;
        for (let j = 0; j < f.labels.length; j++) {
          const u = f.labels[j];
          if (u === sharedV || points.has(u)) continue;
          const sameSide = (i < idxS && j < idxS) || (i > idxS && j > idxS);
          registerOpposite(k, u, sameSide);
        }
      }
    } else if (f.k === "intersect" && f.p === sharedV) {
      for (const seg of [f.a, f.b]) {
        if (points.has(seg[0]) && !points.has(seg[1])) registerOpposite(seg[0], seg[1], false);
        else if (points.has(seg[1]) && !points.has(seg[0])) registerOpposite(seg[1], seg[0], false);
      }
    } else if (f.k === "extend" && f.through === sharedV && points.has(f.from)) {
      registerOpposite(f.from, f.to, false);
    } else if (f.k === "pointOn" && f.p === sharedV) {
      if (points.has(f.seg[0]) && !points.has(f.seg[1])) registerOpposite(f.seg[0], f.seg[1], false);
      else if (points.has(f.seg[1]) && !points.has(f.seg[0])) registerOpposite(f.seg[1], f.seg[0], false);
    }
  }
  return rays;
}

function solveThirdVertexFromBase(params: {
  pS: Vec2; pU: Vec2; sLbl: string; uLbl: string; vLbl: string;
  triFact: Extract<GeoFact, { k: "triangle" }>;
  facts: readonly GeoFact[]; num: SideNumFn; angleOf: AngleOfFn; centroid: Vec2 | null;
}): Vec2 {
  const { pS, pU, sLbl, uLbl, vLbl, triFact, facts, num, angleOf, centroid } = params;
  const su = vDist(pS, pU) || 4;
  const ex = vNorm(vSub(pU, pS));
  let ey: Vec2 = { x: -ex.y, y: ex.x };
  if (centroid && (centroid.x - pS.x) * ey.x + (centroid.y - pS.y) * ey.y > 0) ey = { x: -ey.x, y: -ey.y };

  const triSet = new Set(triFact.labels);
  const angS = angleOf(sLbl, triSet) ?? (triFact.right === sLbl ? 90 : undefined);
  const angU = angleOf(uLbl, triSet) ?? (triFact.right === uLbl ? 90 : undefined);
  const angV = angleOf(vLbl, triSet) ?? (triFact.right === vLbl ? 90 : undefined);
  const sv = num(sLbl, vLbl);
  const uv = num(uLbl, vLbl);
  const hasIsoEq = facts.some((f) => f.k === "equal" && (f.a.includes(vLbl) || f.b.includes(vLbl)));

  let xL = su * 0.48;
  let yL = Math.max(2.5, su * 0.78);

  if (triFact.equilateral) {
    xL = su * 0.5;
    yL = (su * Math.sqrt(3)) / 2;
  } else if (sv && uv && sv + uv > su && sv + su > uv && uv + su > sv) {
    xL = (su * su + sv * sv - uv * uv) / (2 * su);
    yL = Math.sqrt(Math.max(0.25, sv * sv - xL * xL));
  } else if (angS !== undefined && angS > 5 && angS < 175) {
    const effU = angU ?? (angV !== undefined && angS + angV < 178 ? 180 - angS - angV : undefined);
    const effV = angV ?? (effU !== undefined && angS + effU < 178 ? 180 - angS - effU : undefined);
    const svEff = sv ?? (effU && effV ? (su * Math.sin(rad(effU))) / Math.max(0.08, Math.sin(rad(effV))) : su * 0.88);
    xL = svEff * Math.cos(rad(angS));
    yL = svEff * Math.sin(rad(angS));
  } else if (angU !== undefined && angU > 5 && angU < 175) {
    const effV = angV ?? (angS !== undefined && angU + angS < 178 ? 180 - angU - angS : undefined);
    const uvEff = uv ?? (effV ? (su * Math.sin(rad(180 - angU - effV))) / Math.max(0.08, Math.sin(rad(effV))) : su * 0.85);
    xL = su - uvEff * Math.cos(rad(angU));
    yL = uvEff * Math.sin(rad(angU));
  } else if (triFact.isoApex === sLbl || (hasIsoEq && sv)) {
    const leg = sv ?? su;
    xL = su * 0.5;
    yL = Math.sqrt(Math.max(0.25, leg * leg - xL * xL));
  }
  return vAdd(pS, vAdd(vScale(ex, xL), vScale(ey, yL)));
}

export function placeRegularOrGeneralPolygon(
  labels: readonly string[],
  num: SideNumFn
): Vec2[] {
  const n = labels.length;
  let side = 5;
  for (let i = 0; i < n; i++) {
    const val = num(labels[i], labels[(i + 1) % n]);
    if (val && val > 0) { side = val; break; }
  }
  const radius = side / (2 * Math.sin(Math.PI / n));
  const start = -Math.PI / 2 - Math.PI / n;
  return labels.map((_, i) => {
    const a = start + (2 * Math.PI * i) / n;
    return { x: radius * Math.cos(a), y: radius * Math.sin(a) };
  });
}

export function tryPlaceSharedVertexCompositePolygon(params: {
  fact: Extract<GeoFact, { k: "triangle" | "quad" | "polygon" }>;
  localCoords: readonly Vec2[];
  facts: readonly GeoFact[];
  num: SideNumFn;
  angleOf: AngleOfFn;
  points: Map<string, Vec2>;
  polygons: PlacedPolygon[];
}): boolean {
  const { fact, localCoords, facts, num, angleOf, points, polygons } = params;
  const labels = fact.labels;
  const known = labels.filter((l) => points.has(l));
  if (known.length !== 1) return false;

  const sharedV = known[0];
  const pS = points.get(sharedV)!;
  const labelSet = new Set(labels);
  const rays = collectCollinearRaysThroughVertex(sharedV, labelSet, facts, points);
  const defSpan = estimateDefaultSpan(points);
  const centroid = computeExistingCentroid(points, sharedV);

  if (fact.k === "triangle") {
    if (tryPlaceTranslatedParallelSharedVertexTriangle({ fact, sharedV, facts, points, polygons })) return true;
    const others = labels.filter((l) => l !== sharedV);
    const [u, v] = others;
    const dirU = rays.get(u);
    const dirV = rays.get(v);
    if (dirU && dirV && Math.abs(dirU.x * dirV.y - dirU.y * dirV.x) > 0.04) {
      const triSet = new Set(labels);
      const cosS = Math.max(-0.98, Math.min(0.98, dirU.x * dirV.x + dirU.y * dirV.y));
      const angSdeg = deg(Math.acos(cosS));
      let kU = num(sharedV, u);
      let kV = num(sharedV, v);
      const uvLen = num(u, v);
      let angU = angleOf(u, triSet) ?? (fact.right === u ? 90 : undefined);
      let angV = angleOf(v, triSet) ?? (fact.right === v ? 90 : undefined);
      if (angU !== undefined && angV === undefined && angSdeg + angU < 176) angV = 180 - angSdeg - angU;
      if (angV !== undefined && angU === undefined && angSdeg + angV < 176) angU = 180 - angSdeg - angV;

      if (uvLen !== undefined && kU !== undefined && kV === undefined) {
        const b = -2 * kU * cosS;
        const disc = b * b - 4 * (kU * kU - uvLen * uvLen);
        if (disc >= 0) {
          const r1 = (-b + Math.sqrt(disc)) / 2;
          if (r1 > 0.3) kV = r1;
        }
      } else if (angU !== undefined && angV !== undefined && angU > 4 && angV > 4) {
        const sinRatio = Math.sin(rad(angV)) / Math.max(0.08, Math.sin(rad(angU)));
        if (kU !== undefined && kV === undefined) kV = kU * sinRatio;
        else if (kV !== undefined && kU === undefined) kU = kV / Math.max(0.08, sinRatio);
        else if (kU === undefined && kV === undefined) {
          kU = uvLen ? (uvLen * Math.sin(rad(angV))) / Math.max(0.08, Math.sin(rad(angSdeg))) : defSpan;
          kV = kU * sinRatio;
        }
      }
      points.set(u, vAdd(pS, vScale(dirU, kU ?? defSpan)));
      points.set(v, vAdd(pS, vScale(dirV, kV ?? defSpan)));
      polygons.push({ labels, kind: "triangle", rightAt: fact.right });
      return true;
    }

    if (dirU || dirV) {
      const anchored = dirU ? u : v;
      const free = dirU ? v : u;
      const dirA = (dirU ?? dirV)!;
      const pAnch = vAdd(pS, vScale(dirA, num(sharedV, anchored) ?? defSpan));
      points.set(anchored, pAnch);
      points.set(free, solveThirdVertexFromBase({
        pS, pU: pAnch, sLbl: sharedV, uLbl: anchored, vLbl: free,
        triFact: fact, facts, num, angleOf, centroid,
      }));
      polygons.push({ labels, kind: "triangle", rightAt: fact.right });
      return true;
    }
  }

  // الحالة العامة (رباعي أو مضلع برأس مشترك: دعم شعاعي تقابل بالرأس للرباعي أو التدوير للخارج)
  const sIdx = labels.indexOf(sharedV);
  const prevIdx = (sIdx + labels.length - 1) % labels.length;
  const nextIdx = (sIdx + 1) % labels.length;
  const rayNext = rays.get(labels[nextIdx]);
  const rayPrev = rays.get(labels[prevIdx]);

  if (fact.k === "quad" && rayNext && rayPrev && Math.abs(rayNext.x * rayPrev.y - rayNext.y * rayPrev.x) > 0.04) {
    const oppIdx = (sIdx + 2) % 4;
    const lenNext = num(sharedV, labels[nextIdx]) ?? defSpan;
    const lenPrev = num(sharedV, labels[prevIdx]) ?? (fact.kind === "square" || fact.kind === "rhombus" ? lenNext : defSpan * 0.8);
    const pNext = vAdd(pS, vScale(rayNext, lenNext));
    const pPrev = vAdd(pS, vScale(rayPrev, lenPrev));
    points.set(labels[nextIdx], pNext);
    points.set(labels[prevIdx], pPrev);
    points.set(labels[oppIdx], vAdd(pNext, vSub(pPrev, pS)));
    polygons.push({ labels, kind: fact.kind });
    return true;
  }

  const localS = localCoords[sIdx];
  const othersLocal = localCoords.filter((_, i) => i !== sIdx);
  const avgOther = {
    x: othersLocal.reduce((s, p) => s + p.x, 0) / Math.max(1, othersLocal.length),
    y: othersLocal.reduce((s, p) => s + p.y, 0) / Math.max(1, othersLocal.length),
  };
  let curDir = vNorm(vSub(avgOther, localS));
  let targetDir = centroid ? vNorm(vSub(pS, centroid)) : curDir;

  if (rayNext) {
    curDir = vNorm(vSub(localCoords[nextIdx], localS));
    targetDir = rayNext;
  } else if (rayPrev) {
    curDir = vNorm(vSub(localCoords[prevIdx], localS));
    targetDir = rayPrev;
  }

  const cosT = curDir.x * targetDir.x + curDir.y * targetDir.y;
  const sinT = curDir.x * targetDir.y - curDir.y * targetDir.x;
  let placed = localCoords.map((pt) => {
    const rel = vSub(pt, localS);
    return vAdd(pS, { x: rel.x * cosT - rel.y * sinT, y: rel.x * sinT + rel.y * cosT });
  });
  if ((rayNext || rayPrev) && centroid) {
    const reflectAcrossTarget = (pt: Vec2): Vec2 => {
      const d = vSub(pt, pS);
      const proj = d.x * targetDir.x + d.y * targetDir.y;
      return vAdd(pS, vSub(vScale(targetDir, 2 * proj), d));
    };
    const placedFlipped = placed.map(reflectAcrossTarget);
    const avgDist = (pts: readonly Vec2[]) =>
      pts.filter((_, i) => i !== sIdx).reduce((s, p) => s + vDist(p, centroid), 0);
    if (avgDist(placedFlipped) > avgDist(placed)) placed = placedFlipped;
  }
  labels.forEach((lbl, i) => {
    if (!points.has(lbl)) points.set(lbl, placed[i]);
  });

  polygons.push({
    labels,
    kind: fact.k === "quad" ? fact.kind : fact.k === "polygon" ? "polygon" : "triangle",
    rightAt: fact.k === "triangle" ? fact.right : undefined,
  });
  return true;
}
