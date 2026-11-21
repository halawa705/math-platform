/**
 * @file coordinate-plane-projections-and-midpoint-builder.ts
 * @description راسم بارامتري عام لإحداثيات منتصف قطعة مستقيمة ومساقط القطع المستقيمة على محوري X و Y
 * بالإحداثيات الرياضية الحقيقية على شبكة المصيّر الديكارتية الموحدة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 210 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
} from "../../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  toWesternNumeralsSSOT,
  type MathNotationLanguage,
} from "../../ssot/numeral-and-unit-ssot";
import { splitGivensAndAskedTail } from "../verification/geometry-solution-leak-guard";
import {
  extractCoordinatePointsFromText,
  type ParsedCoordinatePoint,
} from "./coordinate-plane-polygon-plotter";

export const MODULE_ID_COORDINATE_PLANE_PROJECTIONS_AND_MIDPOINT_BUILDER =
  "coordinate_plane_projections_and_midpoint_builder" as const;

function buildSymbolicMidpointFormulaFigure(
  figureId: string,
  notation: MathNotationLanguage
): CanonicalGeometryFigureIR {
  const vA: CanonicalVertexNode = { id: `${figureId}_vA`, label: "A(x₁, y₁)", position: { x: 1.5, y: 1.8 } };
  const vB: CanonicalVertexNode = { id: `${figureId}_vB`, label: "B(x₂, y₂)", position: { x: 5.2, y: 4.8 } };
  const vM: CanonicalVertexNode = { id: `${figureId}_vM`, label: "M", position: { x: 3.35, y: 3.3 } };
  return {
    figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: "إحداثيا منتصف قطعة مستقيمة M = ((x1 + x2)/2 , (y1 + y2)/2)",
    notationLanguage: notation,
    coordinateGrid: {
      enabled: true,
      quadrantMode: "first_quadrant",
      xRange: [0, 6.5],
      yRange: [0, 6],
      showGridLines: true,
      showAxesArrows: true,
      showTickNumbers: false,
    },
    vertices: [vA, vB, vM],
    segments: [
      { id: `${figureId}_sAM`, fromVertexId: vA.id, toVertexId: vM.id, tickMarks: 1 },
      { id: `${figureId}_sMB`, fromVertexId: vM.id, toVertexId: vB.id, tickMarks: 1 },
    ],
    angles: [],
  };
}

function resolveGridRange(pts: readonly { x: number; y: number }[]) {
  const isFirst = pts.every((p) => p.x >= 0 && p.y >= 0);
  const minX = isFirst ? 0 : Math.floor(Math.min(-2, ...pts.map((p) => p.x)) - 1);
  const maxX = Math.ceil(Math.max(4, ...pts.map((p) => p.x)) + 1);
  const minY = isFirst ? 0 : Math.floor(Math.min(-2, ...pts.map((p) => p.y)) - 1);
  const maxY = Math.ceil(Math.max(4, ...pts.map((p) => p.y)) + 1);
  return {
    quadrantMode: (isFirst ? "first_quadrant" : "four_quadrant") as "first_quadrant" | "four_quadrant",
    xRange: [minX, maxX] as readonly [number, number],
    yRange: [minY, maxY] as readonly [number, number],
  };
}

function buildNumericMidpointFigure(
  figureId: string,
  p1: ParsedCoordinatePoint,
  p2: ParsedCoordinatePoint,
  givensPart: string,
  notation: MathNotationLanguage
): CanonicalGeometryFigureIR {
  const mx = Number(((p1.x + p2.x) / 2).toFixed(2));
  const my = Number(((p1.y + p2.y) / 2).toFixed(2));
  const range = resolveGridRange([p1, p2, { x: mx, y: my }]);
  const usesArabicLetters = /^[\u0621-\u064A]/.test(p1.name) || /^[\u0621-\u064A]/.test(p2.name);
  const n1 = usesArabicLetters ? localizeGeometricVertexLabelSSOT(p1.name, notation) : p1.name;
  const n2 = usesArabicLetters ? localizeGeometricVertexLabelSSOT(p2.name, notation) : p2.name;
  const v1: CanonicalVertexNode = { id: `${figureId}_vp1`, label: `${n1}(${p1.x}, ${p1.y})`, position: { x: p1.x, y: p1.y } };
  const v2: CanonicalVertexNode = { id: `${figureId}_vp2`, label: `${n2}(${p2.x}, ${p2.y})`, position: { x: p2.x, y: p2.y } };
  const midGivenInPrompt = new RegExp(`M\\s*\\(\\s*${mx}\\s*[,،]\\s*${my}\\s*\\)`, "i").test(givensPart);
  const mName = usesArabicLetters ? localizeGeometricVertexLabelSSOT("M", notation) : "M";
  const vM: CanonicalVertexNode = {
    id: `${figureId}_vM`,
    label: midGivenInPrompt ? `${mName}(${mx}, ${my})` : `${mName}(؟, ؟)`,
    labelKind: midGivenInPrompt ? "given" : "unknown",
    position: { x: mx, y: my },
  };
  return {
    figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: `إحداثيا منتصف القطعة ${p1.name}${p2.name} حيث ${p1.name}(${p1.x}, ${p1.y}) و ${p2.name}(${p2.x}, ${p2.y})`,
    notationLanguage: notation,
    coordinateGrid: {
      enabled: true,
      ...range,
      showGridLines: true,
      showAxesArrows: true,
      showTickNumbers: true,
    },
    vertices: [v1, v2, vM],
    segments: [
      { id: `${figureId}_s1M`, fromVertexId: v1.id, toVertexId: vM.id, tickMarks: 1 },
      { id: `${figureId}_sM2`, fromVertexId: vM.id, toVertexId: v2.id, tickMarks: 1 },
    ],
    angles: [],
  };
}

function buildNumericProjectionFigure(
  figureId: string,
  p1: ParsedCoordinatePoint,
  p2: ParsedCoordinatePoint,
  desc: string,
  givensPart: string,
  notation: MathNotationLanguage
): CanonicalGeometryFigureIR {
  const onBoth = /المحورين/i.test(desc) || (/محور\s*(?:السينات|x|س)/i.test(desc) && /محور\s*(?:الصادات|y|ص)/i.test(desc));
  const onX = onBoth || /محور\s*(?:السينات|x|س)|المسقط\s*السيني/i.test(desc) || !/محور\s*(?:الصادات|y|ص)|المسقط\s*الصادي/i.test(desc);
  const onY = onBoth || /محور\s*(?:الصادات|y|ص)|المسقط\s*الصادي/i.test(desc);

  const range = resolveGridRange([p1, p2]);
  const usesArabicLetters = /^[\u0621-\u064A]/.test(p1.name) || /^[\u0621-\u064A]/.test(p2.name);
  const n1 = usesArabicLetters ? localizeGeometricVertexLabelSSOT(p1.name, notation) : p1.name;
  const n2 = usesArabicLetters ? localizeGeometricVertexLabelSSOT(p2.name, notation) : p2.name;
  const v1: CanonicalVertexNode = { id: `${figureId}_v1`, label: `${n1}(${p1.x}, ${p1.y})`, position: { x: p1.x, y: p1.y } };
  const v2: CanonicalVertexNode = { id: `${figureId}_v2`, label: `${n2}(${p2.x}, ${p2.y})`, position: { x: p2.x, y: p2.y } };
  const vertices: CanonicalVertexNode[] = [v1, v2];
  const segments: CanonicalSegmentNode[] = [
    { id: `${figureId}_sMain`, fromVertexId: v1.id, toVertexId: v2.id },
  ];

  const dx = Math.abs(p2.x - p1.x);
  const dy = Math.abs(p2.y - p1.y);
  const hasExplicitProjLen = (val: number) =>
    new RegExp(`(?:طول(?:ه|ها)?|المسقط[^\\d]{0,16})\\s*=?\\s*${val}(?:\\s*وحد(?:ة|ات))?`, "i").test(givensPart);

  if (onX) {
    const x1p: CanonicalVertexNode = { id: `${figureId}_vx1`, label: `${n1}'(${p1.x}, 0)`, position: { x: p1.x, y: 0 }, hideVertexDot: p1.y === 0 };
    const x2p: CanonicalVertexNode = { id: `${figureId}_vx2`, label: `${n2}'(${p2.x}, 0)`, position: { x: p2.x, y: 0 }, hideVertexDot: p2.y === 0 || p1.x === p2.x };
    vertices.push(x1p, x2p);
    if (p1.y !== 0) segments.push({ id: `${figureId}_sDx1`, fromVertexId: v1.id, toVertexId: x1p.id, strokeStyle: "dashed" });
    if (p2.y !== 0) segments.push({ id: `${figureId}_sDx2`, fromVertexId: v2.id, toVertexId: x2p.id, strokeStyle: "dashed" });
    if (dx > 0) {
      segments.push({
        id: `${figureId}_sProjX`,
        fromVertexId: x1p.id,
        toVertexId: x2p.id,
        ...(hasExplicitProjLen(dx) ? { lengthLabel: { value: `${dx} وحدات` } } : {}),
      });
    }
  }

  if (onY) {
    const suf = onX ? "''" : "'";
    const y1p: CanonicalVertexNode = { id: `${figureId}_vy1`, label: `${n1}${suf}(0, ${p1.y})`, position: { x: 0, y: p1.y }, hideVertexDot: p1.x === 0 };
    const y2p: CanonicalVertexNode = { id: `${figureId}_vy2`, label: `${n2}${suf}(0, ${p2.y})`, position: { x: 0, y: p2.y }, hideVertexDot: p2.x === 0 || p1.y === p2.y };
    vertices.push(y1p, y2p);
    if (p1.x !== 0) segments.push({ id: `${figureId}_sDy1`, fromVertexId: v1.id, toVertexId: y1p.id, strokeStyle: "dashed" });
    if (p2.x !== 0) segments.push({ id: `${figureId}_sDy2`, fromVertexId: v2.id, toVertexId: y2p.id, strokeStyle: "dashed" });
    if (dy > 0) {
      segments.push({
        id: `${figureId}_sProjY`,
        fromVertexId: y1p.id,
        toVertexId: y2p.id,
        ...(hasExplicitProjLen(dy) ? { lengthLabel: { value: `${dy} وحدات` } } : {}),
      });
    }
  }

  return {
    figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: `مسقط القطعة ${p1.name}${p2.name} في المستوى الإحداثي`,
    notationLanguage: notation,
    coordinateGrid: {
      enabled: true,
      ...range,
      showGridLines: true,
      showAxesArrows: true,
      showTickNumbers: true,
    },
    vertices,
    segments,
    angles: [],
  };
}

export function tryBuildParametricCoordinateAnalysisFigure(opts: {
  readonly figureId: string;
  readonly description: string;
  readonly notationLanguage?: MathNotationLanguage;
}): CanonicalGeometryFigureIR | undefined {
  const norm = toWesternNumeralsSSOT(opts.description || "").trim();
  if (!norm) return undefined;
  const notation = opts.notationLanguage || "english";
  const points = extractCoordinatePointsFromText(norm);
  const { givensPart } = splitGivensAndAskedTail(norm);

  if (/(?:إحداثي(?:ا|ي|ات)?\s*(?:نقطة\s*)?منتصف|منتصف\s*(?:ال)?قطعة|نقطة\s*منتصف|منتصف(?:هما|ها))/i.test(norm)) {
    if (points.length >= 2) {
      return buildNumericMidpointFigure(opts.figureId, points[0], points[1], givensPart, notation);
    }
    if (/(?:مستوى\s*إحداثي|إحداثي|\(\s*[xXyYسص])/i.test(norm)) {
      return buildSymbolicMidpointFormulaFigure(opts.figureId, notation);
    }
  }

  if (/(?:مسقط|إسقاط|اسقاط)/i.test(norm) && points.length >= 2) {
    return buildNumericProjectionFigure(opts.figureId, points[0], points[1], norm, givensPart, notation);
  }

  return undefined;
}
