/**
 * @file vector-svg-explicit-constraints-overlay.ts
 * @description طبقة تصيير متجهية ذرية للقيود الصريحة (`explicitConstraints`) على SVG:
 * ترسم محور امتداد خفيفاً عند تلاقي ضلعين على استقامة واحدة (مثل الزوايا المتقابلة بالرأس)،
 * أو خط امتداد متقطعاً تلقائياً عند غياب أحد شطري الاستقامة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 90 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../ssot/geometry-archetype-ssot";

export const MODULE_ID_VECTOR_SVG_EXPLICIT_CONSTRAINTS_OVERLAY =
  "vector_svg_explicit_constraints_overlay" as const;

export interface ExplicitConstraintsOverlayParams {
  readonly figure: CanonicalGeometryFigureIR;
  readonly vertexMap: ReadonlyMap<string, { readonly screen: { readonly sx: number; readonly sy: number } }>;
  readonly strokeColor: string;
  readonly accentColor: string;
}

const segPairKey = (a: string, b: string): string => (a < b ? `${a}::${b}` : `${b}::${a}`);

export function projectExplicitConstraintsOverlaySVGMarkup(
  params: ExplicitConstraintsOverlayParams
): string {
  const { figure, vertexMap, strokeColor, accentColor } = params;
  const triples = figure.explicitConstraints?.collinearTriples;
  if (!triples || triples.length === 0) return "";

  const drawnPairs = new Set<string>();
  for (const s of figure.segments) {
    drawnPairs.add(segPairKey(s.fromVertexId, s.toVertexId));
  }

  const lines: string[] = [];
  for (const [e1Id, midId, e2Id] of triples) {
    const v1 = vertexMap.get(e1Id);
    const vm = vertexMap.get(midId);
    const v2 = vertexMap.get(e2Id);
    if (!v1 || !vm || !v2) continue;

    const dx1 = v1.screen.sx - vm.screen.sx;
    const dy1 = v1.screen.sy - vm.screen.sy;
    const dx2 = v2.screen.sx - vm.screen.sx;
    const dy2 = v2.screen.sy - vm.screen.sy;
    const l1 = Math.hypot(dx1, dy1);
    const l2 = Math.hypot(dx2, dy2);
    if (l1 < 1e-3 || l2 < 1e-3) continue;
    const dotUnit = (dx1 * dx2 + dy1 * dy2) / (l1 * l2);
    if (dotUnit > -0.95) continue;

    const has1 = drawnPairs.has(segPairKey(e1Id, midId));
    const has2 = drawnPairs.has(segPairKey(midId, e2Id));
    const hasFull = drawnPairs.has(segPairKey(e1Id, e2Id));

    if (has1 && has2) {
      lines.push(
        `<line x1="${v1.screen.sx}" y1="${v1.screen.sy}" x2="${v2.screen.sx}" y2="${v2.screen.sy}" stroke="${accentColor}" stroke-width="0.95" stroke-dasharray="3,3" opacity="0.32" data-explicit-collinear="axis" />`
      );
    } else if (has1 && !has2 && !hasFull) {
      lines.push(
        `<line x1="${vm.screen.sx}" y1="${vm.screen.sy}" x2="${v2.screen.sx}" y2="${v2.screen.sy}" stroke="${strokeColor}" stroke-width="1.3" stroke-dasharray="4,3" opacity="0.75" data-explicit-collinear="extension" />`
      );
    } else if (!has1 && has2 && !hasFull) {
      lines.push(
        `<line x1="${v1.screen.sx}" y1="${v1.screen.sy}" x2="${vm.screen.sx}" y2="${vm.screen.sy}" stroke="${strokeColor}" stroke-width="1.3" stroke-dasharray="4,3" opacity="0.75" data-explicit-collinear="extension" />`
      );
    }
  }

  return lines.join("");
}
