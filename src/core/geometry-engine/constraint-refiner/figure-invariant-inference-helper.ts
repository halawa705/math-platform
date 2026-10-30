/**
 * @file figure-invariant-inference-helper.ts
 * @description يستنتج من تخطيط الشكل الأصلي العلاقات التي يجب الحفاظ عليها: نقاط على قطع (استقامة)، توازي، تعامد.
 */
import type { CanonicalGeometryFigureIR } from "@/core/ssot/geometry-archetype-ssot";

export const MODULE_ID_FIGURE_INVARIANT_INFERENCE_HELPER = "figure_invariant_inference_helper" as const;

export interface InferredFigureInvariants {
  /** [p, a, b]: النقطة p تقع على المستقيم ab (فهارس رؤوس). */
  readonly collinear: readonly (readonly [number, number, number])[];
  readonly parallel: readonly (readonly [number, number, number, number])[];
  readonly perpendicular: readonly (readonly [number, number, number, number])[];
}

export function inferFigureInvariants(fig: CanonicalGeometryFigureIR): InferredFigureInvariants {
  const idx = new Map(fig.vertices.map((v, i) => [v.id, i] as const));
  const P = fig.vertices.map((v) => v.position);
  const segs = fig.segments
    .map((s) => [idx.get(s.fromVertexId), idx.get(s.toVertexId)] as const)
    .filter((s): s is readonly [number, number] => s[0] !== undefined && s[1] !== undefined);
  const collinear: [number, number, number][] = [];
  for (const [a, b] of segs) {
    const len = Math.hypot(P[b].x - P[a].x, P[b].y - P[a].y);
    if (len === 0) continue;
    for (let p = 0; p < P.length; p++) {
      if (p === a || p === b) continue;
      const cross = ((P[b].x - P[a].x) * (P[p].y - P[a].y) - (P[b].y - P[a].y) * (P[p].x - P[a].x)) / len;
      const t = ((P[p].x - P[a].x) * (P[b].x - P[a].x) + (P[p].y - P[a].y) * (P[b].y - P[a].y)) / (len * len);
      if (Math.abs(cross) < 1e-6 * len && t > -1e-6 && t < 1 + 1e-6) collinear.push([p, a, b]);
    }
  }
  const parallel: [number, number, number, number][] = [];
  const perpendicular: [number, number, number, number][] = [];
  for (let i = 0; i < segs.length; i++) for (let j = i + 1; j < segs.length; j++) {
    const [a, b] = segs[i]; const [c, d] = segs[j];
    const u = { x: P[b].x - P[a].x, y: P[b].y - P[a].y }; const w = { x: P[d].x - P[c].x, y: P[d].y - P[c].y };
    const lu = Math.hypot(u.x, u.y); const lw = Math.hypot(w.x, w.y);
    if (!lu || !lw) continue;
    const sin = Math.abs(u.x * w.y - u.y * w.x) / (lu * lw); const cos = Math.abs(u.x * w.x + u.y * w.y) / (lu * lw);
    const shared = a === c || a === d || b === c || b === d;
    if (sin < 1e-6 && !shared) parallel.push([a, b, c, d]);
    if (cos < 1e-6) perpendicular.push([a, b, c, d]);
  }
  return { collinear, parallel, perpendicular };
}
