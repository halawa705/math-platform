/**
 * @file geo-subpolygon-autoconnect-helper.ts
 * @description موصّل تلقائي لأضلاع المثلثات والرباعيات والزوايا المذكورة في نص المسألة أو المطلوب
 * عندما تكون جميع رؤوسها موضوعة بالفعل على المستوى، لمنع ظهور رؤوس معلّقة دون أضلاعها.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 90 سطراً).
 */

import type { CanonicalAngleNode } from "@/core/ssot/geometry-archetype-ssot";
import type { GeoFact } from "./geo-fact-types";
import { pairKey } from "./geo-label-utils";
import type { PlacedPolygon } from "./geo-shape-placers";
import { footOfPerpendicular, vDist, type Vec2 } from "./geo-vector-math";

export const MODULE_ID_GEO_SUBPOLYGON_AUTOCONNECT_HELPER =
  "geo_subpolygon_autoconnect_helper" as const;

function areCollinearPoints(A: Vec2, B: Vec2, C: Vec2): boolean {
  const ab = vDist(A, B);
  const bc = vDist(B, C);
  const ac = vDist(A, C);
  const maxSpan = Math.max(ab, bc, ac);
  if (maxSpan < 1e-6) return true;
  const cross = Math.abs((B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x));
  return cross / (maxSpan * maxSpan) < 0.015;
}

export function autoConnectReferencedSubPolygons(params: {
  readonly description: string;
  readonly facts?: readonly GeoFact[];
  readonly polygons?: readonly PlacedPolygon[];
  readonly points: Map<string, Vec2>;
  readonly lengths?: Map<string, { text: string; numeric?: number; symbolic?: boolean; unit?: string }>;
  readonly parallelMarks?: Map<string, number>;
  readonly isPolygonSide: (a: string, b: string) => boolean;
  readonly addExtra: (a: string, b: string, dashed?: boolean) => void;
  readonly addAngle?: (v: string, a1: string, a2: string, extra?: Partial<CanonicalAngleNode>) => void;
}): void {
  const { description, facts, polygons, points, lengths, parallelMarks, isPolygonSide, addExtra, addAngle } = params;
  if (!description || points.size < 3) return;

  const connectEdgeIfMissing = (u: string, v: string, dashed: boolean) => {
    if (u === v || !points.has(u) || !points.has(v)) return;
    if (isPolygonSide(u, v)) return;
    addExtra(u, v, dashed);
  };

  // 1. المثلثات المذكورة بالاسم (مع حارس الاستقامة الخطية لمنع توصيل ثلاث نقاط مستقيمة)
  for (const m of description.matchAll(/(?:ال)?(?:مثلث|Δ|△)\s*([A-Z]{3})\b/g)) {
    const [a, b, c] = m[1].split("");
    const pa = points.get(a); const pb = points.get(b); const pc = points.get(c);
    if (pa && pb && pc && !areCollinearPoints(pa, pb, pc)) {
      connectEdgeIfMissing(a, b, false);
      connectEdgeIfMissing(b, c, false);
      connectEdgeIfMissing(c, a, false);
    }
  }

  // 2. الأشكال الرباعية المذكورة بالاسم
  const quadRefs: string[] = [];
  for (const m of description.matchAll(
    /(?:متوازي\s*(?:ال)?أضلاع|مستطيل|مربع|معين|شبه\s*(?:ال)?منحرف|(?:ال)?شكل\s*(?:الرباعي)?)\s*([A-Z]{4})\b/g
  )) {
    quadRefs.push(m[1]);
  }
  for (const m of description.matchAll(
    /\b([A-Z]{4})\s+(?:متوازي\s*(?:ال)?أضلاع|مستطيل|مربع|معين|شبه\s*(?:ال)?منحرف)/g
  )) {
    quadRefs.push(m[1]);
  }
  for (const q of quadRefs) {
    const verts = q.split("");
    if (verts.every((v) => points.has(v))) {
      for (let i = 0; i < 4; i++) connectEdgeIfMissing(verts[i], verts[(i + 1) % 4], false);
    }
  }

  // 3. الزوايا الثلاثية المذكورة في الوصف أو المطلوب (مع حارس الاستقامة الخطية)
  for (const m of description.matchAll(/∠\s*([A-Z]{3})\b/g)) {
    const [u, v, w] = m[1].split("");
    const pu = points.get(u); const pv = points.get(v); const pw = points.get(w);
    if (pu && pv && pw && !areCollinearPoints(pu, pv, pw)) {
      connectEdgeIfMissing(u, v, false);
      connectEdgeIfMissing(v, w, false);
    }
  }

  // 4. إضافة أسهم التوازي التلقائية لمتوازيي أضلاع مشتركين في قاعدة (مثل ABCD و ABEF في واجب 13)
  if (polygons && parallelMarks && polygons.length >= 2) {
    const pars = polygons.filter((p) => p.kind === "parallelogram" && p.labels.length === 4);
    if (pars.length >= 2 && parallelMarks.size === 0) {
      const [p1, p2] = pars;
      const sharedEdge = [0, 1, 2, 3].find((i) => {
        const k = pairKey(p1.labels[i], p1.labels[(i + 1) % 4]);
        return [0, 1, 2, 3].some((j) => pairKey(p2.labels[j], p2.labels[(j + 1) % 4]) === k);
      });
      if (sharedEdge !== undefined) {
        const opp1 = (sharedEdge + 2) % 4;
        parallelMarks.set(pairKey(p1.labels[sharedEdge], p1.labels[(sharedEdge + 1) % 4]), 1);
        parallelMarks.set(pairKey(p1.labels[opp1], p1.labels[(opp1 + 1) % 4]), 1);
        const s2 = [0, 1, 2, 3].find((j) => pairKey(p2.labels[j], p2.labels[(j + 1) % 4]) === pairKey(p1.labels[sharedEdge], p1.labels[(sharedEdge + 1) % 4]));
        if (s2 !== undefined) {
          const opp2 = (s2 + 2) % 4;
          parallelMarks.set(pairKey(p2.labels[opp2], p2.labels[(opp2 + 1) % 4]), 1);
        }
      }
    }
  }

  // 5. تمثيل الارتفاع h = 9 م كعمود متقطع فعلي مع علامة زاوية قائمة ووسم الطول على العمود
  const heightFact = facts?.find((f): f is Extract<GeoFact, { k: "height" }> => f.k === "height");
  const primaryQuad = polygons?.find((p) => (p.kind === "parallelogram" || p.kind === "trapezoid") && p.labels.length === 4);
  if (heightFact && primaryQuad && lengths && addAngle) {
    const [a, b, , d] = primaryQuad.labels;
    const pA = points.get(a); const pB = points.get(b); const pD = points.get(d);
    if (pA && pB && pD) {
      const foot = footOfPerpendicular(pD, pA, pB);
      const footKey = ["H", "K", "P", "Q"].find((k) => !points.has(k)) ?? "H";
      points.set(footKey, foot);
      addExtra(d, footKey, true);
      lengths.set(pairKey(d, footKey), { text: String(heightFact.value), numeric: heightFact.value, unit: heightFact.unit ?? "سم" });
      addAngle(footKey, d, vDist(foot, pB) >= vDist(foot, pA) ? b : a, { isRightAngle: true, degrees: 90 });
    }
  }
}
