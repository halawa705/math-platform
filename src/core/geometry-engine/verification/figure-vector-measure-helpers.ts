/**
 * @file figure-vector-measure-helpers.ts
 * @description قياسات هندسية خالصة (مسافة، زاوية عند رأس) تُستخدم في قواعد التحقق.
 */
import type { CanonicalGeometryFigureIR, Point2DCoordinate } from "@/core/ssot/geometry-archetype-ssot";

export const MODULE_ID_FIGURE_VECTOR_MEASURE_HELPERS = "figure_vector_measure_helpers" as const;

export function buildVertexPositionMap(fig: CanonicalGeometryFigureIR): Map<string, Point2DCoordinate> {
  return new Map(fig.vertices.map((v) => [v.id, v.position] as const));
}

export function measureDistance(a: Point2DCoordinate, b: Point2DCoordinate): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** الزاوية بالدرجات (0..180) عند الرأس `v` بين الذراعين. */
export function measureAngleDegrees(v: Point2DCoordinate, p: Point2DCoordinate, q: Point2DCoordinate): number {
  const a1 = Math.atan2(p.y - v.y, p.x - v.x);
  const a2 = Math.atan2(q.y - v.y, q.x - v.x);
  let d = Math.abs(a1 - a2) * (180 / Math.PI);
  if (d > 180) d = 360 - d;
  return d;
}

/** قيمة عددية من نص طول أو رقم؛ تعيد null للقيم الرمزية (س، 2س+1). */
export function parseNumericLabel(value: number | string | undefined): number | null {
  if (typeof value === "number") return Number.isFinite(value) && value > 0 ? value : null;
  if (typeof value !== "string") return null;
  const t = value.trim().replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  return /^\d+(\.\d+)?$/.test(t) && Number(t) > 0 ? Number(t) : null;
}

export function median(values: readonly number[]): number {
  const s = [...values].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
