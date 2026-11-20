/**
 * @file geo-subpolygon-autoconnect-helper.ts
 * @description موصّل تلقائي لأضلاع المثلثات والرباعيات والزوايا المذكورة في نص المسألة أو المطلوب
 * عندما تكون جميع رؤوسها موضوعة بالفعل على المستوى، لمنع ظهور رؤوس معلّقة دون أضلاعها.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 90 سطراً).
 */

import type { Vec2 } from "./geo-vector-math";

export const MODULE_ID_GEO_SUBPOLYGON_AUTOCONNECT_HELPER =
  "geo_subpolygon_autoconnect_helper" as const;

export function autoConnectReferencedSubPolygons(params: {
  readonly description: string;
  readonly points: ReadonlyMap<string, Vec2>;
  readonly isPolygonSide: (a: string, b: string) => boolean;
  readonly addExtra: (a: string, b: string, dashed?: boolean) => void;
}): void {
  const { description, points, isPolygonSide, addExtra } = params;
  if (!description || points.size < 3) return;

  const connectEdgeIfMissing = (u: string, v: string, dashed: boolean) => {
    if (u === v || !points.has(u) || !points.has(v)) return;
    if (isPolygonSide(u, v)) return;
    addExtra(u, v, dashed);
  };

  // 1. المثلثات المذكورة بالاسم (مثل: أثبت أن المثلث ACE قائم في C)
  for (const m of description.matchAll(/(?:ال)?(?:مثلث|Δ|△)\s*([A-Z]{3})\b/g)) {
    const [a, b, c] = m[1].split("");
    if (points.has(a) && points.has(b) && points.has(c)) {
      connectEdgeIfMissing(a, b, false);
      connectEdgeIfMissing(b, c, false);
      connectEdgeIfMissing(c, a, false);
    }
  }

  // 2. الأشكال الرباعية المذكورة بالاسم (مثل: أثبت أن BHCD متوازي أضلاع أو EBFD متوازي أضلاع)
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
      for (let i = 0; i < 4; i++) {
        connectEdgeIfMissing(verts[i], verts[(i + 1) % 4], false);
      }
    }
  }

  // 3. الزوايا الثلاثية المذكورة في الوصف أو المطلوب (مثل: احسب قياس ∠ADE أو ∠AEC)
  for (const m of description.matchAll(/∠\s*([A-Z]{3})\b/g)) {
    const [u, v, w] = m[1].split("");
    if (points.has(u) && points.has(v) && points.has(w)) {
      connectEdgeIfMissing(u, v, false);
      connectEdgeIfMissing(v, w, false);
    }
  }
}
