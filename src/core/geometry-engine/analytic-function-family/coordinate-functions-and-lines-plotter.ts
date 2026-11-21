/**
 * @file coordinate-functions-and-lines-plotter.ts
 * @description راسم الدوال التربيعية والخطية ومعادلات الخط المستقيم على الشبكة الإحداثية الديكارتية:
 * يدعم f(x) = ax² + bx + c، ورأس المنحنى (h, k)، ومعادلات المستقيم y = mx + c و ax + by + c = 0
 * والمثلث المحصور مع المحورين OAB.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 260 سطراً).
 */

import type { CanonicalGeometryFigureIR, CanonicalShadedRegionNode, CanonicalVertexNode } from "../../ssot/geometry-archetype-ssot";
import { localizeGeometricVertexLabelSSOT, toWesternNumeralsSSOT, type MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";
import { extractCoordinatePointsFromText } from "./coordinate-plane-polygon-plotter";
import type { CanonicalCoordinateCurveNode } from "./coordinate-grid-and-curve-types";
import { tryBuildLinearSystemOrInequalityFigure } from "./coordinate-linear-systems-and-inequalities-plotter";

export const MODULE_ID_COORDINATE_FUNCTIONS_AND_LINES_PLOTTER =
  "coordinate_functions_and_lines_plotter" as const;

interface QuadraticCoeffs {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly interval?: readonly [number, number];
}

function parsePolyTerms(rhsRaw: string): { a: number; b: number; c: number } | undefined {
  let s = rhsRaw
    .replace(/\s+/g, "")
    .replace(/س²|س\^2/g, "x^2")
    .replace(/x²/gi, "x^2")
    .replace(/س/g, "x")
    .replace(/[−–—]/g, "-")
    .replace(/^\+/, "");
  if (!s || !/x/.test(s)) return undefined;
  s = s.replace(/(?<!^)-/g, "+-");
  let a = 0; let b = 0; let c = 0;
  for (const term of s.split("+").filter(Boolean)) {
    const qm = term.match(/^(-?\d*\.?\d*)\*?x\^2$/i);
    if (qm) { a += qm[1] === "" ? 1 : qm[1] === "-" ? -1 : Number(qm[1]); continue; }
    const lm = term.match(/^(-?\d*\.?\d*)\*?x$/i);
    if (lm) { b += lm[1] === "" ? 1 : lm[1] === "-" ? -1 : Number(lm[1]); continue; }
    if (/^-?\d+(?:\.\d+)?$/.test(term)) { c += Number(term); continue; }
    return undefined;
  }
  return Number.isFinite(a) && Number.isFinite(b) && Number.isFinite(c) ? { a, b, c } : undefined;
}

export function extractQuadraticEquation(desc: string): QuadraticCoeffs | undefined {
  const clean = toWesternNumeralsSSOT(desc);
  const ivM = clean.match(/(?:س|x)\s*[∈في]*\s*[\[\]]\s*(-?\d+(?:\.\d+)?)\s*[,،]\s*(-?\d+(?:\.\d+)?)\s*[\[\]]/i);
  const interval: readonly [number, number] | undefined = ivM ? [Number(ivM[1]), Number(ivM[2])] : undefined;

  const eqM = clean.match(/(?:د\s*\(\s*س\s*\)|f\s*\(\s*x\s*\)|ص|y)\s*=\s*([^،؛;\n]+?)(?=\s*(?:متخذاً|متخذا|حيث|في|على|،|؛|$))/i);
  if (eqM) {
    const poly = parsePolyTerms(eqM[1]);
    if (poly && Math.abs(poly.a) > 1e-9) return { ...poly, interval };
  }
  const vM = clean.match(/رأس\s*المنحنى\s*[A-Za-zأ-ي]?\s*\(\s*(-?\d+(?:\.\d+)?)\s*[,،]\s*(-?\d+(?:\.\d+)?)\s*\)/i);
  if (vM) {
    const h = Number(vM[1]); const k = Number(vM[2]);
    const a = /مفتوح\s*لأسفل|لأسفل/.test(clean) ? -1 : 1;
    return { a, b: -2 * a * h, c: a * h * h + k, interval };
  }
  if (/منحنى|دالة\s*تربيعية/i.test(clean)) {
    const looseQuad = clean.match(/(-?\d*\.?\d*\s*(?:س²|س\^2|x²|x\^2)[^،؛;\n]*)/i);
    if (looseQuad) {
      const poly = parsePolyTerms(looseQuad[1]);
      if (poly && Math.abs(poly.a) > 1e-9) return { ...poly, interval };
    }
    return { a: 1, b: 0, c: -3, interval };
  }
  return undefined;
}

export function buildQuadraticFunctionCurveFigure(params: {
  readonly figureId: string;
  readonly description?: string;
  readonly notationLanguage?: MathNotationLanguage;
  readonly vertexX?: number;
  readonly vertexY?: number;
}): CanonicalGeometryFigureIR {
  const notation = params.notationLanguage ?? "arabic";
  const parsed = extractQuadraticEquation(params.description || "") ?? { a: 1, b: 0, c: params.vertexY ?? -3 };
  const { a, b, c } = parsed;
  const h = params.vertexX ?? Number((-b / (2 * a)).toFixed(3));
  const k = params.vertexY ?? Number((a * h * h + b * h + c).toFixed(3));
  const xLow = parsed.interval ? Math.min(parsed.interval[0], parsed.interval[1]) : Math.floor(h - 3);
  const xHigh = parsed.interval ? Math.max(parsed.interval[0], parsed.interval[1]) : Math.ceil(h + 3);
  const spanHalf = Math.max(2.5, (xHigh - xLow) / 2);

  const curvePts: { x: number; y: number }[] = [];
  for (let i = 0; i < 41; i++) {
    const x = xLow + ((xHigh - xLow) * i) / 40;
    curvePts.push({ x: Number(x.toFixed(2)), y: Number((a * x * x + b * x + c).toFixed(2)) });
  }
  const allY = curvePts.map((p) => p.y);
  const yMin = Math.min(-2, Math.floor(Math.min(...allY) - 1));
  const yMax = Math.max(3, Math.ceil(Math.max(...allY) + 1));
  const xMin = Math.min(-2, Math.floor(xLow - 1));
  const xMax = Math.max(2, Math.ceil(xHigh + 1));

  const cleanDesc = toWesternNumeralsSSOT(params.description || "");
  const vertexLabel = /رأس\s*المنحنى/.test(cleanDesc) ? `(${h}, ${k})` : notation === "english" ? "V" : "ن";
  const vertexV: CanonicalVertexNode = { id: `${params.figureId}_vertex`, label: vertexLabel, position: { x: h, y: k } };
  const curves: CanonicalCoordinateCurveNode[] = [
    { id: "parabola", points: curvePts, strokeColorHex: "#0D9488", strokeWidth: 2.2 },
    { id: "symmetry_axis", points: [{ x: h, y: yMin }, { x: h, y: yMax }], strokeColorHex: "#94A3B8", strokeWidth: 1.2, strokeStyle: "dashed" },
  ];

  return {
    figureId: params.figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: "التمثيل البياني للدالة التربيعية ورأس المنحنى",
    notationLanguage: notation,
    coordinateGrid: {
      enabled: true, quadrantMode: "four_quadrant",
      xRange: [xMin, Math.max(xMax, h + spanHalf)], yRange: [yMin, yMax],
      step: 1, showGridLines: true, showAxesArrows: true, showTickNumbers: true, curves,
    },
    vertices: [vertexV],
    segments: [],
    angles: [],
  };
}

interface LinearEquationSpec {
  readonly slope: number;
  readonly yIntercept: number;
  readonly xIntercept?: number;
  readonly givenPoints: readonly { readonly name: string; readonly x: number; readonly y: number }[];
}

function parseLinearEquationSpec(desc: string): LinearEquationSpec | undefined {
  const clean = toWesternNumeralsSSOT(desc);
  if (/س²|س\^2|x²|x\^2|تربيعية/i.test(clean)) return undefined;

  const yEqM = clean.match(/(?:د\s*\(\s*س\s*\)|f\s*\(\s*x\s*\)|ص|y)\s*=\s*([^،؛;\n]+?)(?=\s*(?:،|؛|$|\s+حيث|\s+يقطع|\s+أوجد|\s+احسب))/i);
  if (yEqM) {
    const poly = parsePolyTerms(yEqM[1]);
    if (poly && poly.a === 0 && Math.abs(poly.b) > 1e-9) {
      return { slope: poly.b, yIntercept: poly.c, xIntercept: Number((-poly.c / poly.b).toFixed(2)), givenPoints: [] };
    }
  }

  const stdM = clean.match(/(-?\d*\.?\d*)\s*(?:س|x)\s*([+-]\s*\d*\.?\d*)\s*(?:ص|y)\s*(?:=\s*(-?\d+(?:\.\d+)?)|([+-]\s*\d+(?:\.\d+)?)\s*=\s*0)/i);
  if (stdM) {
    const aCoef = stdM[1] === "" ? 1 : stdM[1] === "-" ? -1 : Number(stdM[1]);
    const bRaw = stdM[2].replace(/\s+/g, "");
    const bCoef = bRaw === "+" ? 1 : bRaw === "-" ? -1 : Number(bRaw);
    const rhsConst = stdM[3] !== undefined ? Number(stdM[3]) : -Number(stdM[4].replace(/\s+/g, ""));
    if (Number.isFinite(aCoef) && Number.isFinite(bCoef) && Number.isFinite(rhsConst) && Math.abs(bCoef) > 1e-9) {
      return {
        slope: -aCoef / bCoef,
        yIntercept: Number((rhsConst / bCoef).toFixed(2)),
        xIntercept: Math.abs(aCoef) > 1e-9 ? Number((rhsConst / aCoef).toFixed(2)) : undefined,
        givenPoints: [],
      };
    }
  }

  const pts = extractCoordinatePointsFromText(clean);
  if (/معادلة\s*(?:ال)?مستقيم|يقطع\s*(?:من\s*)?محور/i.test(clean) && pts.length === 1 && pts[0].x !== 0 && pts[0].y !== 0) {
    const yIntercept = pts[0].y + pts[0].x;
    return { slope: -1, yIntercept, xIntercept: yIntercept, givenPoints: pts };
  }
  return undefined;
}

export function tryBuildCoordinateFunctionOrLineFigure(opts: {
  readonly figureId: string;
  readonly description: string;
  readonly notationLanguage?: MathNotationLanguage;
}): CanonicalGeometryFigureIR | undefined {
  const desc = opts.description || "";
  const notation = opts.notationLanguage ?? "arabic";

  const quadSpec = extractQuadraticEquation(desc);
  if (quadSpec || /دالة\s*تربيعية|منحنى\s*(?:ال)?دالة|رأس\s*المنحنى|شبكة\s*بيانية/i.test(desc)) {
    return buildQuadraticFunctionCurveFigure({ figureId: opts.figureId, description: desc, notationLanguage: notation });
  }

  const systemOrIneq = tryBuildLinearSystemOrInequalityFigure({ figureId: opts.figureId, description: desc, notationLanguage: notation });
  if (systemOrIneq) return systemOrIneq;

  const lin = parseLinearEquationSpec(desc);
  if (!lin) return undefined;

  const xi = lin.xIntercept; const yi = lin.yIntercept;
  const xMin = Math.min(-3, xi !== undefined ? Math.floor(xi - 2) : -3, ...lin.givenPoints.map((p) => p.x - 1));
  const xMax = Math.max(4, xi !== undefined ? Math.ceil(xi + 2) : 4, ...lin.givenPoints.map((p) => p.x + 1));
  const yAtMin = lin.slope * xMin + yi;
  const yAtMax = lin.slope * xMax + yi;
  const yMin = Math.min(-3, Math.floor(Math.min(yAtMin, yAtMax, yi) - 1));
  const yMax = Math.max(4, Math.ceil(Math.max(yAtMin, yAtMax, yi) + 1));

  const vertices: CanonicalVertexNode[] = [];
  const shadedRegions: CanonicalShadedRegionNode[] = [];

  if (lin.givenPoints.length > 0) {
    lin.givenPoints.forEach((pt, i) => vertices.push({
      id: `${opts.figureId}_g${i}`,
      label: `${localizeGeometricVertexLabelSSOT(pt.name, notation)}(${pt.x}, ${pt.y})`,
      position: { x: pt.x, y: pt.y },
    }));
  } else {
    const vY: CanonicalVertexNode = { id: `${opts.figureId}_yInt`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 0, y: yi } };
    vertices.push(vY);
    if (xi !== undefined) {
      const vX: CanonicalVertexNode = { id: `${opts.figureId}_xInt`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: xi, y: 0 } };
      vertices.push(vX);
      if (/مثلث|AOB|أ\s*و\s*ب|مساحة/i.test(desc)) {
        const vO: CanonicalVertexNode = { id: `${opts.figureId}_o`, label: localizeGeometricVertexLabelSSOT("و", notation), position: { x: 0, y: 0 }, hideVertexDot: true };
        vertices.push(vO);
        shadedRegions.push({ id: `${opts.figureId}_tri`, vertexIds: [vO.id, vX.id, vY.id], fillColorHex: "#0D9488", fillOpacity: 0.14 });
      }
    }
  }

  return {
    figureId: opts.figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: "التمثيل البياني لمعادلة الخط المستقيم",
    notationLanguage: notation,
    coordinateGrid: {
      enabled: true, quadrantMode: "four_quadrant", xRange: [xMin, xMax], yRange: [yMin, yMax],
      step: Math.max(1, Math.ceil(Math.max(xMax - xMin, yMax - yMin) / 10)),
      showGridLines: true, showAxesArrows: true, showTickNumbers: true,
      curves: [{ id: "line_main", points: [{ x: xMin, y: Number(yAtMin.toFixed(2)) }, { x: xMax, y: Number(yAtMax.toFixed(2)) }], strokeColorHex: "#2563EB", strokeWidth: 2.2 }],
    },
    vertices,
    segments: [],
    angles: [],
    ...(shadedRegions.length > 0 ? { shadedRegions } : {}),
  };
}
