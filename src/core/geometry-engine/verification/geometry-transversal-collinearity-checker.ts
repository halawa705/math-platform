/**
 * @file geometry-transversal-collinearity-checker.ts
 * @description حارس استقامة القواطع: يتحقق رياضياً من أن كل قاطع مقسم إلى قطع متتالية
 * (`seg_trans_*`) في أشكال المستقيمات المتوازية يقع بالكامل على خط مستقيم واحد دون أي انكسار.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 100 سطر).
 */

import type { CanonicalGeometryFigureIR, CanonicalVertexNode } from "../../ssot/geometry-archetype-ssot";

type Point2D = CanonicalVertexNode["position"];

export const MODULE_ID_GEOMETRY_TRANSVERSAL_COLLINEARITY_CHECKER =
  "geometry_transversal_collinearity_checker" as const;

export interface TransversalCollinearityCheckResult {
  readonly isCollinear: boolean;
  readonly bentChains: readonly string[];
}

/**
 * يفحص استقامة جميع سلاسل القواطع (`seg_trans_*` أو `*_s_trans_*`) في الشكل الهندسي.
 * يرفض أي سلسلة يزيد انحراف حاصل الضرب الاتجاهي المعياري فيها عن `1e-3`.
 */
export function assertTransversalCollinearity(
  figure: CanonicalGeometryFigureIR
): TransversalCollinearityCheckResult {
  const transSegments = figure.segments.filter(
    (s) => s.id.startsWith("seg_trans_") || s.id.includes("_s_trans_")
  );
  if (transSegments.length < 2) {
    return { isCollinear: true, bentChains: [] };
  }

  const vertexMap = new Map<string, Point2D>();
  for (const v of figure.vertices) {
    vertexMap.set(v.id, v.position);
  }

  // بناء السلاسل المتصلة من القطع المتتالية (A -> B -> C -> D)
  const nextMap = new Map<string, string>();
  const prevSet = new Set<string>();
  for (const seg of transSegments) {
    nextMap.set(seg.fromVertexId, seg.toVertexId);
    prevSet.add(seg.toVertexId);
  }

  const heads: string[] = [];
  for (const seg of transSegments) {
    if (!prevSet.has(seg.fromVertexId)) {
      heads.push(seg.fromVertexId);
    }
  }

  const bentChains: string[] = [];
  for (const head of heads) {
    const chainIds: string[] = [head];
    let cur: string | undefined = head;
    const visited = new Set<string>([head]);
    while (cur && nextMap.has(cur)) {
      const nxt: string = nextMap.get(cur)!;
      if (visited.has(nxt)) break;
      visited.add(nxt);
      chainIds.push(nxt);
      cur = nxt;
    }

    if (chainIds.length < 3) continue;

    for (let i = 1; i < chainIds.length - 1; i++) {
      const p0 = vertexMap.get(chainIds[i - 1]);
      const p1 = vertexMap.get(chainIds[i]);
      const p2 = vertexMap.get(chainIds[i + 1]);
      if (!p0 || !p1 || !p2) continue;

      const ux = p1.x - p0.x;
      const uy = p1.y - p0.y;
      const vx = p2.x - p1.x;
      const vy = p2.y - p1.y;
      const lenU = Math.hypot(ux, uy);
      const lenV = Math.hypot(vx, vy);
      if (lenU < 1e-6 || lenV < 1e-6) continue;

      const sinAngle = Math.abs(ux * vy - uy * vx) / (lenU * lenV);
      const cosAngle = (ux * vx + uy * vy) / (lenU * lenV);
      if (sinAngle > 1e-3 || cosAngle <= 0) {
        bentChains.push(chainIds.join("->"));
        break;
      }
    }
  }

  return {
    isCollinear: bentChains.length === 0,
    bentChains,
  };
}
