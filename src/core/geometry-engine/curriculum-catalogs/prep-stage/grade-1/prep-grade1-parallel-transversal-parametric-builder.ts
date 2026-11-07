/**
 * @file prep-grade1-parallel-transversal-parametric-builder.ts
 * @description منشئ بارامتري عام لمستقيمين متوازيين وقاطع يقطعهما في نقطتين: يقرأ الزوايا المعطاة (عددية/جبرية) من الوصف
 * ويحسب ميل القاطع هندسياً بحيث تتطابق كل زاوية مرسومة مع قياسها المعلن (تبادل/تناظر/تداخل/تقابل بالرأس).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import type { CanonicalAngleNode, CanonicalGeometryFigureIR, CanonicalSegmentNode, CanonicalVertexNode } from "../../../../ssot/geometry-archetype-ssot";
import { localizeGeometricVertexLabelSSOT, type MathNotationLanguage } from "../../../../ssot/numeral-and-unit-ssot";
import { extractParallelTransversalSpec, type ParallelAngleSpec } from "./prep-grade1-parallel-transversal-spec-parser";

type P = { x: number; y: number };
const TOP_Y = 7;
const BOT_Y = 3;
const rad = (deg: number): number => (deg * Math.PI) / 180;

function layout(beta: number): Record<"gx" | "hx" | "ex" | "ey" | "fx" | "fy", number> {
  const dx = 4 * Math.cos(rad(beta)) / Math.sin(rad(beta));
  const gx = 5 - dx / 2;
  const hx = gx + dx;
  const ux = Math.cos(rad(beta)); const uy = -Math.sin(rad(beta));
  return { gx, hx, ex: gx - 1.4 * ux, ey: TOP_Y - 1.4 * uy, fx: hx + 1.4 * ux, fy: BOT_Y + 1.4 * uy };
}

function angleAt(v: P, a: P, b: P): number {
  const u1 = { x: a.x - v.x, y: a.y - v.y }; const u2 = { x: b.x - v.x, y: b.y - v.y };
  const c = (u1.x * u2.x + u1.y * u2.y) / (Math.hypot(u1.x, u1.y) * Math.hypot(u2.x, u2.y));
  return (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
}

function pointsFor(spec: { top: readonly string[]; bottom: readonly string[]; g: string; h: string; e: string; f: string }, beta: number): Map<string, P> {
  const L = layout(beta);
  const m = new Map<string, P>();
  m.set(spec.top[0], { x: 0, y: TOP_Y }); m.set(spec.top[1], { x: 10, y: TOP_Y });
  m.set(spec.bottom[0], { x: 0, y: BOT_Y }); m.set(spec.bottom[1], { x: 10, y: BOT_Y });
  m.set(spec.g, { x: L.gx, y: TOP_Y }); m.set(spec.h, { x: L.hx, y: BOT_Y });
  m.set(spec.e, { x: L.ex, y: L.ey }); m.set(spec.f, { x: L.fx, y: L.fy });
  return m;
}

/** يحل ميل القاطع β من الزوايا المعطاة؛ يعيد undefined عند التعذر. */
function solveBeta(angles: readonly ParallelAngleSpec[], pts: (b: number) => Map<string, P>): { beta: number; vars: Map<string, number> } | undefined {
  const probe = pts(60);
  const eqs = angles.filter((x) => x.expr).map((x) => {
    const m = angleAt(probe.get(x.vertex)!, probe.get(x.arm1)!, probe.get(x.arm2)!);
    const sup = Math.abs(m - 120) < 1;
    return { a: x.expr!.a, b: x.expr!.b, v: x.expr!.v, s: sup ? -1 : 1, c: sup ? 180 : 0 };
  });
  const vars = new Map<string, number>();
  const numeric = eqs.find((e) => e.a === 0);
  if (numeric) {
    const beta = (numeric.b - numeric.c) / numeric.s;
    for (const e of eqs) if (e.a !== 0) vars.set(e.v, (e.s * beta + e.c - e.b) / e.a);
    return { beta, vars };
  }
  const [e1, e2] = eqs;
  if (!e1 || !e2) return undefined;
  const det = e1.a * -e2.s - -e1.s * e2.a;
  if (Math.abs(det) < 1e-9) return undefined;
  const r1 = e1.c - e1.b; const r2 = e2.c - e2.b;
  const u = (r1 * -e2.s - -e1.s * r2) / det;
  const beta = (e1.a * r2 - e2.a * r1) / det;
  vars.set(e1.v, u);
  return { beta, vars };
}

export function buildParallelTransversalParametricFromDescription(
  description: string, figureId: string, notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const spec = extractParallelTransversalSpec(description);
  if (!spec) return undefined;
  const lineEnds = new Set([...spec.top, ...spec.bottom]);
  const verts = [...new Set(spec.angles.map((x) => x.vertex))];
  if (verts.length !== 2 || verts.some((v) => lineEnds.has(v))) return undefined;
  const arm = (x: ParallelAngleSpec): string[] => [x.arm1, x.arm2];
  const hasEnd = (v: string, ends: readonly string[]): boolean => spec.angles.some((x) => x.vertex === v && arm(x).some((a) => ends.includes(a)));
  let [g, h] = verts;
  if (hasEnd(h, spec.top) || hasEnd(g, spec.bottom)) [g, h] = [h, g];
  if (!hasEnd(g, spec.top) || !hasEnd(h, spec.bottom)) return undefined;
  const used = new Set([...lineEnds, g, h]);
  let e = spec.transversal?.[0]; let f = spec.transversal?.[1];
  const extras = [...new Set(spec.angles.flatMap(arm).filter((a) => !used.has(a)))];
  for (const a of extras) {
    const atG = spec.angles.some((x) => x.vertex === g && arm(x).includes(a));
    if (!e && atG && a !== f) e = a; else if (!f && a !== e) f = a;
  }
  if ((e && used.has(e)) || (f && used.has(f))) return undefined;
  e = e ?? "\u0000e"; f = f ?? "\u0000f";
  if (e === f) return undefined;
  const base = { top: spec.top, bottom: spec.bottom, g, h, e, f };
  const known = pointsFor(base, 60);
  if (spec.angles.some((x) => !known.has(x.arm1) || !known.has(x.arm2))) return undefined;
  const solved = solveBeta(spec.angles, (b) => pointsFor(base, b));
  if (!solved || solved.beta < 15 || solved.beta > 165) return undefined;
  const pts = pointsFor(base, solved.beta);
  const loc = (k: string): string => (k.startsWith("\u0000") ? "" : localizeGeometricVertexLabelSSOT(k, notationLanguage));
  const vertices: CanonicalVertexNode[] = [...pts.entries()].map(([k, p]) => ({ id: `${figureId}_v${k.startsWith("\u0000") ? k.slice(1) : k}`, label: loc(k), position: p }));
  const vid = (k: string): string => `${figureId}_v${k.startsWith("\u0000") ? k.slice(1) : k}`;
  const seg = (id: string, a: string, b: string, arrows?: 1 | 2): CanonicalSegmentNode => ({ id: `${figureId}_${id}`, fromVertexId: vid(a), toVertexId: vid(b), ...(arrows ? { parallelArrows: arrows } : {}) });
  const segments = [seg("sTop", spec.top[0], spec.top[1], 1), seg("sBot", spec.bottom[0], spec.bottom[1], 1), seg("sTrans", e, f)];
  const angles: CanonicalAngleNode[] = spec.angles.map((x, i) => {
    const deg = angleAt(pts.get(x.vertex)!, pts.get(x.arm1)!, pts.get(x.arm2)!);
    return { id: `${figureId}_ang${i}`, vertexId: vid(x.vertex), arm1VertexId: vid(x.arm1), arm2VertexId: vid(x.arm2), degrees: Math.round(deg * 10) / 10, degreesLabel: x.label, ...(Math.abs(deg - 90) < 0.5 ? { isRightAngle: true } : {}) };
  });
  return {
    figureId, familyId: "triangle_family", branchId: "triangle_thales_parallel_line",
    titleArabic: `مستقيمان متوازيان ${spec.top.join("")} // ${spec.bottom.join("")} وقاطع يقطعهما في ${g} و ${h}`,
    notationLanguage, vertices, segments, angles,
  };
}
