/**
 * @file figure-constraint-residual-builder.ts
 * @description يبني دالة المتبقيات من قيود الشكل: زوايا معطاة، أطوال عددية، شرطات تساوٍ، توازي معلَّم، وعلاقات مستنتجة من التخطيط الأصلي.
 */
import type { CanonicalGeometryFigureIR } from "@/core/ssot/geometry-archetype-ssot";
import type { ResidualFunction } from "./levenberg-marquardt-residual-minimizer";
import { inferFigureInvariants } from "./figure-invariant-inference-helper";
import { measureAngleDegrees, median, parseNumericLabel } from "../verification/figure-vector-measure-helpers";

export const MODULE_ID_FIGURE_CONSTRAINT_RESIDUAL_BUILDER = "figure_constraint_residual_builder" as const;

const RAD = Math.PI / 180;
type V = { x: number; y: number };

export function buildFigureResidualFunction(fig: CanonicalGeometryFigureIR): { fn: ResidualFunction; x0: number[] } {
  const idx = new Map(fig.vertices.map((v, i) => [v.id, i] as const));
  const x0 = fig.vertices.flatMap((v) => [v.position.x, v.position.y]);
  const xs = fig.vertices.map((v) => v.position.x); const ys = fig.vertices.map((v) => v.position.y);
  const diag = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) || 1;
  const inv = inferFigureInvariants(fig);
  const pt = (x: readonly number[], i: number): V => ({ x: x[2 * i], y: x[2 * i + 1] });
  const dist = (x: readonly number[], a: number, b: number) => Math.hypot(pt(x, a).x - pt(x, b).x, pt(x, a).y - pt(x, b).y);

  const angles = fig.angles.flatMap((a) => {
    const deg = a.isRightAngle ? 90 : a.degrees;
    const v = idx.get(a.vertexId); const p = idx.get(a.arm1VertexId); const q = idx.get(a.arm2VertexId);
    return typeof deg === "number" && deg > 0 && deg < 180 && v !== undefined && p !== undefined && q !== undefined ? [{ v, p, q, deg }] : [];
  });
  const lens = fig.segments.flatMap((s) => {
    const value = parseNumericLabel(s.lengthLabel?.value); const a = idx.get(s.fromVertexId); const b = idx.get(s.toVertexId);
    return value !== null && a !== undefined && b !== undefined ? [{ a, b, value }] : [];
  });
  const scale = lens.length ? median(lens.map((l) => dist(x0, l.a, l.b) / l.value)) : 1;
  const segIdx = (s: { fromVertexId: string; toVertexId: string }) => [idx.get(s.fromVertexId), idx.get(s.toVertexId)] as const;
  const group = (key: "tickMarks" | "parallelArrows", n: number) =>
    fig.segments.filter((s) => s[key] === n).map(segIdx).filter((s): s is readonly [number, number] => s[0] !== undefined && s[1] !== undefined);
  const tickGroups = ([1, 2, 3] as const).map((n) => group("tickMarks", n)).filter((g) => g.length > 1);
  const arrowGroups = ([1, 2] as const).map((n) => group("parallelArrows", n)).filter((g) => g.length > 1);
  const sine = (x: readonly number[], a: number, b: number, c: number, d: number) => {
    const u = { x: pt(x, b).x - pt(x, a).x, y: pt(x, b).y - pt(x, a).y }; const w = { x: pt(x, d).x - pt(x, c).x, y: pt(x, d).y - pt(x, c).y };
    return (u.x * w.y - u.y * w.x) / ((Math.hypot(u.x, u.y) * Math.hypot(w.x, w.y)) || 1);
  };
  const cosine = (x: readonly number[], a: number, b: number, c: number, d: number) => {
    const u = { x: pt(x, b).x - pt(x, a).x, y: pt(x, b).y - pt(x, a).y }; const w = { x: pt(x, d).x - pt(x, c).x, y: pt(x, d).y - pt(x, c).y };
    return (u.x * w.x + u.y * w.y) / ((Math.hypot(u.x, u.y) * Math.hypot(w.x, w.y)) || 1);
  };

  const fn: ResidualFunction = (x) => {
    const r: number[] = [];
    for (const a of angles) r.push(10 * (measureAngleDegrees(pt(x, a.v), pt(x, a.p), pt(x, a.q)) - a.deg) * RAD);
    for (const l of lens) r.push(10 * Math.log(Math.max(dist(x, l.a, l.b), 1e-9) / (scale * l.value)));
    for (const g of tickGroups) for (let i = 1; i < g.length; i++) r.push(10 * Math.log(Math.max(dist(x, g[i][0], g[i][1]), 1e-9) / Math.max(dist(x, g[0][0], g[0][1]), 1e-9)));
    for (const g of arrowGroups) for (let i = 1; i < g.length; i++) r.push(10 * sine(x, g[0][0], g[0][1], g[i][0], g[i][1]));
    for (const [p, a, b] of inv.collinear) r.push(20 * sine(x, a, b, a, p));
    for (const [a, b, c, d] of inv.parallel) r.push(5 * sine(x, a, b, c, d));
    for (const [a, b, c, d] of inv.perpendicular) r.push(5 * cosine(x, a, b, c, d));
    for (let k = 0; k < x.length; k++) r.push((0.02 * (x[k] - x0[k])) / diag);
    return r;
  };
  return { fn, x0 };
}
