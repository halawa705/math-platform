/**
 * @file coordinate-plane-projections-and-midpoint-builder.ts
 * @description راسم بارامتري عام لإحداثيات منتصف قطعة مستقيمة ومساقط القطع المستقيمة على محوري X و Y
 * لأي نقطتين إحداثيتين في المستوى الديكارتي دون الاعتماد على أي كتالوج ثابت.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 230 سطراً).
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

interface PlaneMapper {
  readonly ox: number;
  readonly oy: number;
  readonly scale: number;
  readonly map: (x: number, y: number) => { readonly x: number; readonly y: number };
}

function createCoordinatePlaneMapper(pts: readonly { x: number; y: number }[]): PlaneMapper {
  const xs = [0, ...pts.map((p) => p.x)];
  const ys = [0, ...pts.map((p) => p.y)];
  const minX = Math.min(...xs) - 1;
  const maxX = Math.max(...xs) + 1;
  const minY = Math.min(...ys) - 1;
  const maxY = Math.max(...ys) + 1;
  const spanX = Math.max(4, maxX - minX);
  const spanY = Math.max(4, maxY - minY);
  const scale = Math.min(8.2 / spanX, 8.2 / spanY);
  const padX = (9 - spanX * scale) / 2;
  const padY = (9 - spanY * scale) / 2;
  const ox = Number((0.5 + padX + (0 - minX) * scale).toFixed(2));
  const oy = Number((0.5 + padY + (0 - minY) * scale).toFixed(2));
  return {
    ox,
    oy,
    scale,
    map: (x, y) => ({
      x: Number((ox + x * scale).toFixed(2)),
      y: Number((oy + y * scale).toFixed(2)),
    }),
  };
}

function createAxesNodes(
  figureId: string,
  mapper: PlaneMapper,
  notation: MathNotationLanguage
): { readonly vertices: CanonicalVertexNode[]; readonly segments: CanonicalSegmentNode[] } {
  const xMin = Math.min(0.4, mapper.ox - 1.2);
  const xMax = Math.max(9.6, mapper.ox + 1.2);
  const yMin = Math.min(0.4, mapper.oy - 1.2);
  const yMax = Math.max(9.6, mapper.oy + 1.2);
  const vXneg: CanonicalVertexNode = { id: `${figureId}_vXneg`, label: "", position: { x: xMin, y: mapper.oy }, hideVertexDot: true };
  const vXpos: CanonicalVertexNode = { id: `${figureId}_vXpos`, label: notation === "arabic" ? "س" : "X", position: { x: xMax, y: mapper.oy }, hideVertexDot: true };
  const vYneg: CanonicalVertexNode = { id: `${figureId}_vYneg`, label: "", position: { x: mapper.ox, y: yMin }, hideVertexDot: true };
  const vYpos: CanonicalVertexNode = { id: `${figureId}_vYpos`, label: notation === "arabic" ? "ص" : "y", position: { x: mapper.ox, y: yMax }, hideVertexDot: true };
  const vO: CanonicalVertexNode = { id: `${figureId}_vO`, label: localizeGeometricVertexLabelSSOT("و", notation), position: { x: mapper.ox, y: mapper.oy } };
  return {
    vertices: [vXneg, vXpos, vYneg, vYpos, vO],
    segments: [
      { id: `${figureId}_sAxisX`, fromVertexId: vXneg.id, toVertexId: vXpos.id },
      { id: `${figureId}_sAxisY`, fromVertexId: vYneg.id, toVertexId: vYpos.id },
    ],
  };
}

function buildSymbolicMidpointFormulaFigure(
  figureId: string,
  notation: MathNotationLanguage
): CanonicalGeometryFigureIR {
  const mapper = createCoordinatePlaneMapper([{ x: 1, y: 1 }, { x: 5, y: 5 }]);
  const axes = createAxesNodes(figureId, mapper, notation);
  const vA: CanonicalVertexNode = { id: `${figureId}_vA`, label: "A(x₁, y₁)", position: mapper.map(1.5, 1.8) };
  const vB: CanonicalVertexNode = { id: `${figureId}_vB`, label: "B(x₂, y₂)", position: mapper.map(5.2, 4.8) };
  const vM: CanonicalVertexNode = { id: `${figureId}_vM`, label: "M", position: mapper.map(3.35, 3.3) };
  return {
    figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: "إحداثيا منتصف قطعة مستقيمة M = ((x1 + x2)/2 , (y1 + y2)/2)",
    notationLanguage: notation,
    coordinateGrid: { enabled: true },
    vertices: [...axes.vertices, vA, vB, vM],
    segments: [
      ...axes.segments,
      { id: `${figureId}_sAM`, fromVertexId: vA.id, toVertexId: vM.id, tickMarks: 1 },
      { id: `${figureId}_sMB`, fromVertexId: vM.id, toVertexId: vB.id, tickMarks: 1 },
    ],
    angles: [],
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
  const mapper = createCoordinatePlaneMapper([p1, p2, { x: mx, y: my }]);
  const axes = createAxesNodes(figureId, mapper, notation);
  const v1: CanonicalVertexNode = { id: `${figureId}_vp1`, label: `${p1.name}(${p1.x}, ${p1.y})`, position: mapper.map(p1.x, p1.y) };
  const v2: CanonicalVertexNode = { id: `${figureId}_vp2`, label: `${p2.name}(${p2.x}, ${p2.y})`, position: mapper.map(p2.x, p2.y) };
  const midGivenInPrompt = new RegExp(`M\\s*\\(\\s*${mx}\\s*[,،]\\s*${my}\\s*\\)`, "i").test(givensPart);
  const vM: CanonicalVertexNode = {
    id: `${figureId}_vM`,
    label: midGivenInPrompt ? `M(${mx}, ${my})` : "M(؟, ؟)",
    labelKind: midGivenInPrompt ? "given" : "unknown",
    position: mapper.map(mx, my),
  };
  return {
    figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: `إحداثيا منتصف القطعة ${p1.name}${p2.name} حيث ${p1.name}(${p1.x}, ${p1.y}) و ${p2.name}(${p2.x}, ${p2.y})`,
    notationLanguage: notation,
    coordinateGrid: { enabled: true },
    vertices: [...axes.vertices, v1, v2, vM],
    segments: [
      ...axes.segments,
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

  const mapper = createCoordinatePlaneMapper([p1, p2]);
  const axes = createAxesNodes(figureId, mapper, notation);
  const v1: CanonicalVertexNode = { id: `${figureId}_v1`, label: `${p1.name}(${p1.x}, ${p1.y})`, position: mapper.map(p1.x, p1.y) };
  const v2: CanonicalVertexNode = { id: `${figureId}_v2`, label: `${p2.name}(${p2.x}, ${p2.y})`, position: mapper.map(p2.x, p2.y) };
  const vertices: CanonicalVertexNode[] = [...axes.vertices, v1, v2];
  const segments: CanonicalSegmentNode[] = [
    ...axes.segments,
    { id: `${figureId}_sMain`, fromVertexId: v1.id, toVertexId: v2.id },
  ];

  const dx = Math.abs(p2.x - p1.x);
  const dy = Math.abs(p2.y - p1.y);
  const hasExplicitProjLen = (val: number) =>
    new RegExp(`(?:طول(?:ه|ها)?|المسقط[^\\d]{0,16})\\s*=?\\s*${val}(?:\\s*وحد(?:ة|ات))?`, "i").test(givensPart);

  if (onX) {
    const x1p: CanonicalVertexNode = { id: `${figureId}_vx1`, label: `${p1.name}'(${p1.x}, 0)`, position: mapper.map(p1.x, 0), hideVertexDot: p1.y === 0 };
    const x2p: CanonicalVertexNode = { id: `${figureId}_vx2`, label: `${p2.name}'(${p2.x}, 0)`, position: mapper.map(p2.x, 0), hideVertexDot: p2.y === 0 || p1.x === p2.x };
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
    const y1p: CanonicalVertexNode = { id: `${figureId}_vy1`, label: `${p1.name}${suf}(0, ${p1.y})`, position: mapper.map(0, p1.y), hideVertexDot: p1.x === 0 };
    const y2p: CanonicalVertexNode = { id: `${figureId}_vy2`, label: `${p2.name}${suf}(0, ${p2.y})`, position: mapper.map(0, p2.y), hideVertexDot: p2.x === 0 || p1.y === p2.y };
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
    coordinateGrid: { enabled: true },
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
