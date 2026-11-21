/**
 * @file coordinate-linear-systems-and-inequalities-plotter.ts
 * @description راسم نظام معادلتين خطيتين ومتباينات الدرجة الأولى والبرمجة الخطية مع تظليل منطقة الحل المتاحة (Sutherland-Hodgman).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 245 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalShadedRegionNode,
  CanonicalVertexNode,
} from "../../ssot/geometry-archetype-ssot";
import { toWesternNumeralsSSOT, type MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";
import type { Point2DCoordinate } from "../../ssot/geometry-archetype-ssot";
import type { CanonicalCoordinateCurveNode } from "./coordinate-grid-and-curve-types";
import { splitGivensAndAskedTail } from "../verification/geometry-solution-leak-guard";

export const MODULE_ID_COORDINATE_LINEAR_SYSTEMS_AND_INEQUALITIES_PLOTTER =
  "coordinate_linear_systems_and_inequalities_plotter" as const;

type CompOp = "=" | "<=" | ">=" | "<" | ">";

interface LinearConstraint {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly op: CompOp;
}

const PALETTE = ["#2563EB", "#D97706", "#059669", "#7C3AED"] as const;

function parseLinearSide(raw: string): { readonly cx: number; readonly cy: number; readonly k: number } | null {
  let s = toWesternNumeralsSSOT(raw)
    .replace(/\s+/g, "")
    .replace(/[−–—]/g, "-")
    .replace(/د\s*\(\s*س\s*\)|f\s*\(\s*x\s*\)/gi, "y")
    .replace(/س/g, "x")
    .replace(/ص/g, "y")
    .replace(/^\+/, "");
  if (!s || /\^|²/.test(s)) return null;
  s = s.replace(/(?<!^)-/g, "+-");
  let cx = 0;
  let cy = 0;
  let k = 0;
  for (const term of s.split("+").filter(Boolean)) {
    const xm = term.match(/^(-?\d*\.?\d*)\*?x$/i);
    if (xm) { cx += xm[1] === "" ? 1 : xm[1] === "-" ? -1 : Number(xm[1]); continue; }
    const ym = term.match(/^(-?\d*\.?\d*)\*?y$/i);
    if (ym) { cy += ym[1] === "" ? 1 : ym[1] === "-" ? -1 : Number(ym[1]); continue; }
    if (/^-?\d+(?:\.\d+)?$/.test(term)) { k += Number(term); continue; }
    return null;
  }
  return Number.isFinite(cx) && Number.isFinite(cy) && Number.isFinite(k) ? { cx, cy, k } : null;
}

function parseLinearConstraint(clause: string): LinearConstraint | null {
  const norm = toWesternNumeralsSSOT(clause).replace(/≤/g, "<=").replace(/≥/g, ">=").trim();
  if (!norm || /س²|س\^2|x²|x\^2|تربيعية/i.test(norm)) return null;
  const cleaned = norm
    .replace(/^.*:\s*/, "")
    .replace(/^(?:[\u0621-\u065F]{2,}\s+)+/g, "")
    .trim();
  const m = cleaned.match(/([^<>=]+?)\s*(<=|>=|<|>|=)\s*([^<>=]+)/);
  if (!m) return null;
  const lhs = parseLinearSide(m[1]);
  const rhs = parseLinearSide(m[3]);
  if (!lhs || !rhs) return null;
  const a = lhs.cx - rhs.cx;
  const b = lhs.cy - rhs.cy;
  const c = rhs.k - lhs.k;
  if (Math.abs(a) < 1e-9 && Math.abs(b) < 1e-9) return null;
  return { a, b, c, op: m[2] as CompOp };
}

function clipLineToBox(
  line: LinearConstraint,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number
): [Point2DCoordinate, Point2DCoordinate] | null {
  const pts: Point2DCoordinate[] = [];
  const push = (x: number, y: number) => {
    if (x < xMin - 1e-4 || x > xMax + 1e-4 || y < yMin - 1e-4 || y > yMax + 1e-4) return;
    if (!pts.some((p) => Math.hypot(p.x - x, p.y - y) < 1e-3)) {
      pts.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
    }
  };
  if (Math.abs(line.b) > 1e-9) {
    push(xMin, (line.c - line.a * xMin) / line.b);
    push(xMax, (line.c - line.a * xMax) / line.b);
  }
  if (Math.abs(line.a) > 1e-9) {
    push((line.c - line.b * yMin) / line.a, yMin);
    push((line.c - line.b * yMax) / line.a, yMax);
  }
  if (pts.length < 2) return null;
  pts.sort((p, q) => (Math.abs(p.x - q.x) > 1e-3 ? p.x - q.x : p.y - q.y));
  return [pts[0], pts[pts.length - 1]];
}

function clipPolygonHalfPlane(poly: readonly Point2DCoordinate[], plane: LinearConstraint): Point2DCoordinate[] {
  if (poly.length === 0) return [];
  const flip = plane.op === ">=" || plane.op === ">" ? -1 : 1;
  const nx = plane.a * flip;
  const ny = plane.b * flip;
  const nc = plane.c * flip;
  const inside = (p: Point2DCoordinate) => nx * p.x + ny * p.y <= nc + 1e-6;
  const intersect = (p1: Point2DCoordinate, p2: Point2DCoordinate): Point2DCoordinate => {
    const f1 = nx * p1.x + ny * p1.y - nc;
    const f2 = nx * p2.x + ny * p2.y - nc;
    const t = f1 / (f1 - f2);
    return {
      x: Number((p1.x + t * (p2.x - p1.x)).toFixed(2)),
      y: Number((p1.y + t * (p2.y - p1.y)).toFixed(2)),
    };
  };

  const out: Point2DCoordinate[] = [];
  for (let i = 0; i < poly.length; i += 1) {
    const cur = poly[i];
    const prev = poly[(i + poly.length - 1) % poly.length];
    const curIn = inside(cur);
    const prevIn = inside(prev);
    if (curIn) {
      if (!prevIn) out.push(intersect(prev, cur));
      out.push(cur);
    } else if (prevIn) {
      out.push(intersect(prev, cur));
    }
  }
  return out;
}

export function tryBuildLinearSystemOrInequalityFigure(opts: {
  readonly figureId: string;
  readonly description: string;
  readonly notationLanguage?: MathNotationLanguage;
}): CanonicalGeometryFigureIR | undefined {
  const raw = toWesternNumeralsSSOT(opts.description || "");
  if (!raw || /س²|س\^2|x²|x\^2|مثلث\s*[A-Zأ-ي]|متوازي|شبه\s*منحرف/i.test(raw)) return undefined;

  const clauses = raw
    .split(/[\n؛;،,]+|\s+و(?=\s*[\-\d()]*\s*(?:س|ص|x|y))/i)
    .map((s) => s.trim())
    .filter(Boolean);
  const constraints = clauses.map(parseLinearConstraint).filter((c): c is LinearConstraint => c !== null);
  const inequalities = constraints.filter((c) => c.op !== "=");
  const equations = constraints.filter((c) => c.op === "=");
  const notation = opts.notationLanguage ?? "arabic";

  if (inequalities.length >= 1) {
    const hasXNonNeg = inequalities.some((c) => c.a > 0 && Math.abs(c.b) < 1e-6 && c.c >= 0 && (c.op === ">=" || c.op === ">"));
    const hasYNonNeg = inequalities.some((c) => c.b > 0 && Math.abs(c.a) < 1e-6 && c.c >= 0 && (c.op === ">=" || c.op === ">"));
    const isFirstQuad = hasXNonNeg && hasYNonNeg;

    const intercepts: number[] = [];
    for (const c of inequalities) {
      if (Math.abs(c.a) > 1e-6) intercepts.push(c.c / c.a);
      if (Math.abs(c.b) > 1e-6) intercepts.push(c.c / c.b);
    }
    const maxPos = Math.max(4, ...intercepts.filter((n) => Number.isFinite(n) && Math.abs(n) <= 20));
    const minNeg = Math.min(-2, ...intercepts.filter((n) => Number.isFinite(n) && Math.abs(n) <= 20));
    const xMin = isFirstQuad ? 0 : Math.floor(minNeg - 1);
    const yMin = isFirstQuad ? 0 : Math.floor(minNeg - 1);
    const xMax = Math.ceil(maxPos + 1.5);
    const yMax = Math.ceil(maxPos + 1.5);

    let poly: Point2DCoordinate[] = [
      { x: xMin, y: yMin },
      { x: xMax, y: yMin },
      { x: xMax, y: yMax },
      { x: xMin, y: yMax },
    ];
    for (const ineq of inequalities) poly = clipPolygonHalfPlane(poly, ineq);

    const curves: CanonicalCoordinateCurveNode[] = [];
    inequalities.forEach((ineq, idx) => {
      const seg = clipLineToBox(ineq, xMin, xMax, yMin, yMax);
      if (seg) {
        curves.push({
          id: `ineq_${idx}`,
          points: seg,
          strokeColorHex: PALETTE[idx % PALETTE.length],
          strokeWidth: 2,
          strokeStyle: ineq.op === "<" || ineq.op === ">" ? "dashed" : "solid",
        });
      }
    });

    const vertices: CanonicalVertexNode[] = poly.map((pt, i) => ({
      id: `${opts.figureId}_hp_${i}`,
      label: "",
      hideVertexDot: true,
      position: pt,
    }));
    const shadedRegions: CanonicalShadedRegionNode[] =
      poly.length >= 3
        ? [{ id: `${opts.figureId}_feasible`, vertexIds: vertices.map((v) => v.id), fillColorHex: "#0D9488", fillOpacity: 0.18 }]
        : [];

    return {
      figureId: opts.figureId,
      familyId: "analytic_coordinate_family",
      branchId: "triangle_base_general",
      titleArabic: "التمثيل البياني لمتباينات الدرجة الأولى وتظليل منطقة الحل",
      notationLanguage: notation,
      coordinateGrid: {
        enabled: true,
        quadrantMode: isFirstQuad ? "first_quadrant" : "four_quadrant",
        xRange: [xMin, xMax],
        yRange: [yMin, yMax],
        step: Math.max(1, Math.ceil(Math.max(xMax - xMin, yMax - yMin) / 10)),
        showGridLines: true,
        showAxesArrows: true,
        showTickNumbers: true,
        curves,
      },
      vertices,
      segments: [],
      angles: [],
      ...(shadedRegions.length > 0 ? { shadedRegions } : {}),
    };
  }

  if (equations.length >= 2) {
    const [e1, e2] = equations;
    const det = e1.a * e2.b - e2.a * e1.b;
    const hasInter = Math.abs(det) > 1e-6;
    const ix = hasInter ? Number(((e1.c * e2.b - e2.c * e1.b) / det).toFixed(2)) : 0;
    const iy = hasInter ? Number(((e1.a * e2.c - e2.a * e1.c) / det).toFixed(2)) : 0;
    const valsX = [0, ...(hasInter ? [ix] : [])];
    const valsY = [0, ...(hasInter ? [iy] : [])];
    for (const eq of [e1, e2]) {
      if (Math.abs(eq.a) > 1e-6 && Math.abs(eq.c / eq.a) <= 20) valsX.push(eq.c / eq.a);
      if (Math.abs(eq.b) > 1e-6 && Math.abs(eq.c / eq.b) <= 20) valsY.push(eq.c / eq.b);
    }
    const xMin = Math.floor(Math.min(-3, ...valsX) - 1);
    const xMax = Math.ceil(Math.max(4, ...valsX) + 1);
    const yMin = Math.floor(Math.min(-3, ...valsY) - 1);
    const yMax = Math.ceil(Math.max(4, ...valsY) + 1);

    const curves: CanonicalCoordinateCurveNode[] = [];
    [e1, e2].forEach((eq, idx) => {
      const seg = clipLineToBox(eq, xMin, xMax, yMin, yMax);
      if (seg) {
        curves.push({
          id: `line_${idx + 1}`,
          points: seg,
          strokeColorHex: PALETTE[idx],
          strokeWidth: 2.1,
          label: notation === "arabic" ? `ل${idx + 1}` : `L${idx + 1}`,
          labelPosition: seg[1],
        });
      }
    });

    const { givensPart } = splitGivensAndAskedTail(raw);
    const interGiven = hasInter && new RegExp(`\\(\\s*${ix}\\s*[,،]\\s*${iy}\\s*\\)`).test(givensPart);
    const vertices: CanonicalVertexNode[] = hasInter
      ? [{
          id: `${opts.figureId}_inter`,
          label: interGiven ? `${notation === "arabic" ? "م" : "P"}(${ix}, ${iy})` : notation === "arabic" ? "م" : "P",
          position: { x: ix, y: iy },
        }]
      : [];

    return {
      figureId: opts.figureId,
      familyId: "analytic_coordinate_family",
      branchId: "triangle_base_general",
      titleArabic: "التمثيل البياني لنظام معادلتين خطيتين في متغيرين",
      notationLanguage: notation,
      coordinateGrid: {
        enabled: true,
        quadrantMode: "four_quadrant",
        xRange: [xMin, xMax],
        yRange: [yMin, yMax],
        step: Math.max(1, Math.ceil(Math.max(xMax - xMin, yMax - yMin) / 10)),
        showGridLines: true,
        showAxesArrows: true,
        showTickNumbers: true,
        curves,
      },
      vertices,
      segments: [],
      angles: [],
    };
  }

  return undefined;
}
