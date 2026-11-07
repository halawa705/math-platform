/**
 * @file prep-grade1-parallel-transversal-parametric-builder.ts
 * @description منشئ بارامتري عام لمستقيمين متوازيين وقاطع: يدعم القاطع الممتد بنقطتي تقاطع (مثل EF يقطع AB و CD في G و H)
 * والقاطع المباشر بين طرفي المتوازيين (مثل AC أو BC قاطع لـ AB و CD بنمط Z أو U) مع حل المجهول الجبري هندسياً.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import type { CanonicalAngleNode, CanonicalGeometryFigureIR, CanonicalSegmentNode, CanonicalVertexNode } from "../../../../ssot/geometry-archetype-ssot";
import { localizeGeometricVertexLabelSSOT, type MathNotationLanguage } from "../../../../ssot/numeral-and-unit-ssot";
import { extractParallelTransversalSpec, type ParallelAngleSpec, type ParallelTransversalSpec } from "./prep-grade1-parallel-transversal-spec-parser";

type P = { x: number; y: number };
const TOP_Y = 7;
const BOT_Y = 3;
const rad = (deg: number): number => (deg * Math.PI) / 180;

function layout(beta: number): Record<"gx" | "hx" | "ex" | "ey" | "fx" | "fy", number> {
  const dx = (4 * Math.cos(rad(beta))) / Math.sin(rad(beta));
  const gx = 5 - dx / 2;
  const hx = gx + dx;
  const ux = Math.cos(rad(beta));
  const uy = -Math.sin(rad(beta));
  return { gx, hx, ex: gx - 1.4 * ux, ey: TOP_Y - 1.4 * uy, fx: hx + 1.4 * ux, fy: BOT_Y + 1.4 * uy };
}

function angleAt(v: P, a: P, b: P): number {
  const u1 = { x: a.x - v.x, y: a.y - v.y };
  const u2 = { x: b.x - v.x, y: b.y - v.y };
  const c = (u1.x * u2.x + u1.y * u2.y) / (Math.hypot(u1.x, u1.y) * Math.hypot(u2.x, u2.y));
  return (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
}

/** يحل ميل القاطع β من الزوايا المعطاة وعلاقتها (تبادل/تناظر = متساويتان، تداخل = متكاملتان 180°). */
function solveBeta(
  angles: readonly ParallelAngleSpec[],
  pts: (b: number) => Map<string, P>,
  relationHint?: "alternate" | "corresponding" | "consecutive_interior"
): { beta: number } | undefined {
  const probe = pts(60);
  const eqs = angles
    .filter((x) => x.expr)
    .map((x) => {
      const m = angleAt(probe.get(x.vertex)!, probe.get(x.arm1)!, probe.get(x.arm2)!);
      const sup = Math.abs(m - 120) < 1;
      return { a: x.expr!.a, b: x.expr!.b, s: sup ? -1 : 1, c: sup ? 180 : 0 };
    });
  const numeric = eqs.find((e) => e.a === 0);
  if (numeric) {
    return { beta: (numeric.b - numeric.c) / numeric.s };
  }
  const [e1, e2] = eqs;
  if (!e1 || !e2) return undefined;
  let u: number;
  if (relationHint === "consecutive_interior" || e1.s !== e2.s) {
    const sumA = e1.a + e2.a;
    if (Math.abs(sumA) < 1e-9) return undefined;
    u = (180 - e1.b - e2.b) / sumA;
  } else {
    const diffA = e1.a - e2.a;
    if (Math.abs(diffA) < 1e-9) return undefined;
    u = (e2.b - e1.b) / diffA;
  }
  const val1 = e1.a * u + e1.b;
  const beta = (val1 - e1.c) / e1.s;
  return { beta };
}

function dedupeAskedAnglesPerVertex(angles: readonly ParallelAngleSpec[]): ParallelAngleSpec[] {
  const hasAngleAt = new Set(angles.filter((a) => !a.asked).map((a) => a.vertex));
  const out: ParallelAngleSpec[] = [];
  for (const a of angles) {
    if (!a.asked) {
      out.push(a);
    } else if (!hasAngleAt.has(a.vertex)) {
      hasAngleAt.add(a.vertex);
      out.push(a);
    }
  }
  return out;
}

function buildDirectFourVertexTransversalFigure(
  spec: ParallelTransversalSpec,
  figureId: string,
  notationLanguage: MathNotationLanguage
): CanonicalGeometryFigureIR | undefined {
  const topSet = new Set(spec.top);
  const botSet = new Set(spec.bottom);
  const g = spec.angles.map((a) => a.vertex).find((v) => topSet.has(v)) ?? spec.transversal?.find((v) => topSet.has(v));
  const h = spec.angles.map((a) => a.vertex).find((v) => botSet.has(v)) ?? spec.transversal?.find((v) => botSet.has(v));
  if (!g || !h) return undefined;
  const topOther = spec.top[0] === g ? spec.top[1] : spec.top[0];
  const botOther = spec.bottom[0] === h ? spec.bottom[1] : spec.bottom[0];

  const givenNumeric = spec.angles.filter((a) => a.expr && a.expr.a === 0).map((a) => a.expr!.b);
  const isUShape =
    spec.relationHint === "consecutive_interior" ||
    (givenNumeric.length === 2 && Math.abs(givenNumeric[0] + givenNumeric[1] - 180) < 1);

  const ptsFor = (beta: number): Map<string, P> => {
    const L = layout(beta);
    const m = new Map<string, P>();
    m.set(g, { x: L.gx, y: TOP_Y });
    m.set(topOther, { x: L.gx + 4.2, y: TOP_Y });
    m.set(h, { x: L.hx, y: BOT_Y });
    m.set(botOther, { x: isUShape ? L.hx + 4.2 : L.hx - 4.2, y: BOT_Y });
    return m;
  };

  const filteredAngles = dedupeAskedAnglesPerVertex(spec.angles).filter(
    (a) => topSet.has(a.vertex) || botSet.has(a.vertex)
  );
  if (filteredAngles.some((a) => ![g, topOther, h, botOther].includes(a.arm1) || ![g, topOther, h, botOther].includes(a.arm2))) {
    return undefined;
  }
  const solved = solveBeta(filteredAngles, ptsFor, spec.relationHint);
  if (!solved || solved.beta < 18 || solved.beta > 162) return undefined;

  const pts = ptsFor(solved.beta);
  const loc = (k: string): string => localizeGeometricVertexLabelSSOT(k, notationLanguage);
  const vid = (k: string): string => `${figureId}_v${k}`;
  const vertices: CanonicalVertexNode[] = [...pts.entries()].map(([k, p]) => ({ id: vid(k), label: loc(k), position: p }));
  const arrows: 1 | undefined = spec.isProofGoal ? undefined : 1;
  const segments: CanonicalSegmentNode[] = [
    { id: `${figureId}_sTop`, fromVertexId: vid(g), toVertexId: vid(topOther), ...(arrows ? { parallelArrows: arrows } : {}) },
    { id: `${figureId}_sBot`, fromVertexId: vid(h), toVertexId: vid(botOther), ...(arrows ? { parallelArrows: arrows } : {}) },
    { id: `${figureId}_sTrans`, fromVertexId: vid(g), toVertexId: vid(h) },
  ];
  const angles: CanonicalAngleNode[] = filteredAngles.map((x, i) => {
    const deg = angleAt(pts.get(x.vertex)!, pts.get(x.arm1)!, pts.get(x.arm2)!);
    return {
      id: `${figureId}_ang${i}`,
      vertexId: vid(x.vertex),
      arm1VertexId: vid(x.arm1),
      arm2VertexId: vid(x.arm2),
      degrees: Math.round(deg * 10) / 10,
      degreesLabel: x.label,
      ...(Math.abs(deg - 90) < 0.5 ? { isRightAngle: true } : {}),
    };
  });
  return {
    figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: `مستقيمان ${spec.top.join("")} و ${spec.bottom.join("")} وقاطع ${g}${h}`,
    notationLanguage,
    vertices,
    segments,
    angles,
  };
}

export function buildParallelTransversalParametricFromDescription(
  description: string,
  figureId: string,
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const spec = extractParallelTransversalSpec(description);
  if (!spec) return undefined;
  const lineEnds = new Set([...spec.top, ...spec.bottom]);
  const angleVerts = [...new Set(spec.angles.map((x) => x.vertex))];

  // إذا كانت جميع رؤوس الزوايا من أطراف المستقيمين المتوازيين (مثل AC أو BC قاطع لـ AB // CD)
  if (angleVerts.every((v) => lineEnds.has(v)) && !spec.intersections) {
    return buildDirectFourVertexTransversalFigure(spec, figureId, notationLanguage);
  }

  const arm = (x: ParallelAngleSpec): string[] => [x.arm1, x.arm2];
  const isTopVertex = (v: string): boolean =>
    spec.top.includes(v) || spec.angles.some((x) => x.vertex === v && arm(x).some((a) => spec.top.includes(a)));
  const isBotVertex = (v: string): boolean =>
    spec.bottom.includes(v) || spec.angles.some((x) => x.vertex === v && arm(x).some((a) => spec.bottom.includes(a)));

  const g = angleVerts.find(isTopVertex) ?? spec.intersections?.[0];
  const h = angleVerts.find((v) => v !== g && isBotVertex(v)) ?? spec.intersections?.[1];
  if (!g || !h || g === h) return undefined;

  const topLeft = spec.top.includes(g) ? "\u0000tL" : spec.top[0];
  const topRight = spec.top.includes(g) ? (spec.top[0] === g ? spec.top[1] : spec.top[0]) : spec.top[1];
  const botLeft = spec.bottom.includes(h) ? "\u0000bL" : spec.bottom[0];
  const botRight = spec.bottom.includes(h) ? (spec.bottom[0] === h ? spec.bottom[1] : spec.bottom[0]) : spec.bottom[1];

  const used = new Set([topLeft, topRight, botLeft, botRight, g, h]);
  const extArmsAtG = spec.angles.filter((x) => x.vertex === g).flatMap(arm).filter((a) => !used.has(a));
  const extArmsAtH = spec.angles.filter((x) => x.vertex === h).flatMap(arm).filter((a) => !used.has(a));
  let e = extArmsAtG[0];
  let f = extArmsAtH.find((a) => a !== e);
  for (const t of spec.transversal ?? []) {
    if (!used.has(t) && t !== e && t !== f) {
      if (!e) e = t;
      else if (!f) f = t;
    }
  }
  e = e ?? "\u0000e";
  f = f ?? "\u0000f";
  if (e === f || used.has(e) || used.has(f)) return undefined;

  const ptsFor = (beta: number): Map<string, P> => {
    const L = layout(beta);
    const m = new Map<string, P>();
    m.set(topLeft, { x: 0, y: TOP_Y });
    m.set(topRight, { x: 10, y: TOP_Y });
    m.set(botLeft, { x: 0, y: BOT_Y });
    m.set(botRight, { x: 10, y: BOT_Y });
    m.set(g, { x: L.gx, y: TOP_Y });
    m.set(h, { x: L.hx, y: BOT_Y });
    m.set(e, { x: L.ex, y: L.ey });
    m.set(f, { x: L.fx, y: L.fy });
    return m;
  };

  const filteredAngles = dedupeAskedAnglesPerVertex(spec.angles);
  const probe = ptsFor(60);
  if (filteredAngles.some((x) => !probe.has(x.vertex) || !probe.has(x.arm1) || !probe.has(x.arm2))) return undefined;
  const solved = solveBeta(filteredAngles, ptsFor, spec.relationHint);
  if (!solved || solved.beta < 18 || solved.beta > 162) return undefined;

  const pts = ptsFor(solved.beta);
  const loc = (k: string): string => (k.startsWith("\u0000") ? "" : localizeGeometricVertexLabelSSOT(k, notationLanguage));
  const vid = (k: string): string => `${figureId}_v${k.startsWith("\u0000") ? k.slice(1) : k}`;
  const vertices: CanonicalVertexNode[] = [...pts.entries()].map(([k, p]) => ({ id: vid(k), label: loc(k), position: p }));
  const arrows: 1 | undefined = spec.isProofGoal ? undefined : 1;
  const seg = (id: string, a: string, b: string, ar?: 1 | 2): CanonicalSegmentNode => ({
    id: `${figureId}_${id}`,
    fromVertexId: vid(a),
    toVertexId: vid(b),
    ...(ar ? { parallelArrows: ar } : {}),
  });
  const segments = [seg("sTop", topLeft, topRight, arrows), seg("sBot", botLeft, botRight, arrows), seg("sTrans", e, f)];
  const angles: CanonicalAngleNode[] = filteredAngles.map((x, i) => {
    const deg = angleAt(pts.get(x.vertex)!, pts.get(x.arm1)!, pts.get(x.arm2)!);
    return {
      id: `${figureId}_ang${i}`,
      vertexId: vid(x.vertex),
      arm1VertexId: vid(x.arm1),
      arm2VertexId: vid(x.arm2),
      degrees: Math.round(deg * 10) / 10,
      degreesLabel: x.label,
      ...(Math.abs(deg - 90) < 0.5 ? { isRightAngle: true } : {}),
    };
  });
  return {
    figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: `مستقيمان متوازيان ${spec.top.join("")} // ${spec.bottom.join("")} وقاطع يقطعهما في ${g} و ${h}`,
    notationLanguage,
    vertices,
    segments,
    angles,
  };
}
