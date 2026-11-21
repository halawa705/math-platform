/**
 * @file coordinate-plane-polygon-plotter.ts
 * @description راسم عام للنقاط والقطع المستقيمة والمضلعات على المستوى الإحداثي الديكارتي (الإحداثيات الكاملة والربع الأول)
 * بإحداثيات رياضية حقيقية (بدون انعكاس محور الصادات) مع مساقط منقطة على المحورين.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 175 سطراً).
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

export const MODULE_ID_COORDINATE_PLANE_POLYGON_PLOTTER =
  "coordinate_plane_polygon_plotter" as const;

export interface CoordinatePlanePolygonOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
  readonly description?: string;
}

export interface ParsedCoordinatePoint {
  readonly name: string;
  readonly x: number;
  readonly y: number;
}

/**
 * استخراج أزواج الإحداثيات المعلومة من النص (مثل A(2, 3) أو أ(1، 4) أو جـ(3، 4))
 */
export function extractCoordinatePointsFromText(rawText: string): ParsedCoordinatePoint[] {
  const text = toWesternNumeralsSSOT(rawText || "");
  if (!text) return [];

  const points: ParsedCoordinatePoint[] = [];
  const seen = new Set<string>();
  const re = /([A-Za-zأ-ي]ـ?(?:[A-Za-z0-9]?['′])?)\s*\(\s*(-?\d+(?:\.\d+)?)\s*[,،]\s*(-?\d+(?:\.\d+)?)\s*\)/g;
  for (const m of text.matchAll(re)) {
    const rawName = m[1].trim();
    const name = rawName === "ج" ? "جـ" : rawName === "ه" ? "هـ" : rawName;
    const x = Number.parseFloat(m[2]);
    const y = Number.parseFloat(m[3]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    const key = `${name}:${x},${y}`;
    if (!seen.has(key)) {
      seen.add(key);
      points.push({ name, x, y });
    }
  }
  return points;
}

/**
 * بناء شكل هندسي للمستوى الإحداثي يوقع النقاط بإحداثياتها الرياضية الحقيقية ويربط بينها
 */
export function buildCoordinatePlanePolygonFigure(
  opts: CoordinatePlanePolygonOptions
): CanonicalGeometryFigureIR | undefined {
  const notation = opts.notationLanguage || "arabic";
  const desc = opts.description || "";
  const points = extractCoordinatePointsFromText(desc);
  if (points.length === 0) return undefined;

  const allNonNegative = points.every((p) => p.x >= 0 && p.y >= 0);
  const explicitFirstQuad = /الربع\s*الأول/.test(desc);
  const explicitFourQuad = /الأرباع|ربع\s*(?:ثان|ثالث|رابع)|سالب/i.test(desc);
  const hasArabicPointNames = points.every((p) => /[أ-ي]/.test(p.name));
  const quadrantMode: "first_quadrant" | "four_quadrant" =
    !allNonNegative || explicitFourQuad
      ? "four_quadrant"
      : explicitFirstQuad || hasArabicPointNames
        ? "first_quadrant"
        : "four_quadrant";

  const maxX = Math.max(...points.map((p) => p.x), quadrantMode === "first_quadrant" ? 5 : 4);
  const maxY = Math.max(...points.map((p) => p.y), quadrantMode === "first_quadrant" ? 5 : 4);
  const minX = quadrantMode === "first_quadrant" ? 0 : Math.min(-4, ...points.map((p) => p.x));
  const minY = quadrantMode === "first_quadrant" ? 0 : Math.min(-4, ...points.map((p) => p.y));

  const xRange: readonly [number, number] = [
    quadrantMode === "first_quadrant" ? 0 : Math.floor(minX - 1),
    Math.ceil(maxX + 1.5),
  ];
  const yRange: readonly [number, number] = [
    quadrantMode === "first_quadrant" ? 0 : Math.floor(minY - 1),
    Math.ceil(maxY + 1.5),
  ];

  const plottedVertices: CanonicalVertexNode[] = points.map((pt, idx) => ({
    id: `${opts.figureId}_pt_${idx}`,
    label: `${localizeGeometricVertexLabelSSOT(pt.name, notation)}(${pt.x}, ${pt.y})`,
    position: { x: pt.x, y: pt.y },
  }));

  const feet: CanonicalVertexNode[] = [];
  const segments: CanonicalSegmentNode[] = [];

  // مساقط منقطة على المحورين عند عدد نقاط <= 4 لتوضيح قراءة الإحداثيين
  if (points.length <= 4) {
    plottedVertices.forEach((pv, i) => {
      const p = points[i];
      if (Math.abs(p.y) > 1e-6) {
        const fx: CanonicalVertexNode = {
          id: `${opts.figureId}_fx_${i}`,
          label: "",
          hideVertexDot: true,
          position: { x: p.x, y: 0 },
        };
        feet.push(fx);
        segments.push({
          id: `${opts.figureId}_dx_${i}`,
          fromVertexId: pv.id,
          toVertexId: fx.id,
          strokeStyle: "dashed",
        });
      }
      if (Math.abs(p.x) > 1e-6) {
        const fy: CanonicalVertexNode = {
          id: `${opts.figureId}_fy_${i}`,
          label: "",
          hideVertexDot: true,
          position: { x: 0, y: p.y },
        };
        feet.push(fy);
        segments.push({
          id: `${opts.figureId}_dy_${i}`,
          fromVertexId: pv.id,
          toVertexId: fy.id,
          strokeStyle: "dashed",
        });
      }
    });
  }

  if (plottedVertices.length === 2) {
    segments.push({
      id: `${opts.figureId}_seg_0_1`,
      fromVertexId: plottedVertices[0].id,
      toVertexId: plottedVertices[1].id,
      strokeStyle: "solid",
    });
  } else if (plottedVertices.length >= 3) {
    for (let i = 0; i < plottedVertices.length; i += 1) {
      const next = (i + 1) % plottedVertices.length;
      segments.push({
        id: `${opts.figureId}_edge_${i}`,
        fromVertexId: plottedVertices[i].id,
        toVertexId: plottedVertices[next].id,
        strokeStyle: "solid",
      });
    }
  }

  const polygons: readonly (readonly string[])[] =
    plottedVertices.length >= 3 ? [plottedVertices.map((v) => v.id)] : [];

  return {
    figureId: opts.figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: `التمثيل البياني في المستوى الإحداثي للنقاط ${points.map((p) => `${p.name}(${p.x}, ${p.y})`).join("، ")}`,
    notationLanguage: notation,
    coordinateGrid: {
      enabled: true,
      quadrantMode,
      xRange,
      yRange,
      step: 1,
      showGridLines: true,
      showAxesArrows: true,
      showTickNumbers: true,
    },
    vertices: [...plottedVertices, ...feet],
    segments,
    angles: [],
    polygons,
  };
}
