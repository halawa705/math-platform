/**
 * @file coordinate-plane-polygon-plotter.ts
 * @description راسم عام للنقاط والقطع المستقيمة والمضلعات على المستوى الإحداثي الديكارتي (Phase 4 — الإحداثيات).
 * يلتزم بحدود الأسطر (< 200 سطر) وTypeScript الصارم وفق دستور المنصة (AGENTS.md).
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
 * استخراج أزواج الإحداثيات المعلومة من النص (مثل A(2, 3) أو أ(1، 4))
 */
export function extractCoordinatePointsFromText(rawText: string): ParsedCoordinatePoint[] {
  const text = toWesternNumeralsSSOT(rawText || "");
  if (!text) return [];

  const points: ParsedCoordinatePoint[] = [];
  const seen = new Set<string>();
  const re = /([A-Za-zأ-ي]+ـ*['′]?)\s*\(\s*(-?\d+(?:\.\d+)?)\s*[,،]\s*(-?\d+(?:\.\d+)?)\s*\)/g;
  for (const m of text.matchAll(re)) {
    const name = m[1].trim();
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
 * بناء شكل هندسي للمستوى الإحداثي يوقع النقاط ويربط بينها بقطع مستقيمة أو مضلع
 */
export function buildCoordinatePlanePolygonFigure(
  opts: CoordinatePlanePolygonOptions
): CanonicalGeometryFigureIR | undefined {
  const notation = opts.notationLanguage || "arabic";
  const points = extractCoordinatePointsFromText(opts.description || "");
  if (points.length === 0) return undefined;

  // حساب نطاق الإحداثيات لتحويلها إلى نظام [1..9] على اللوحة مع بقاء نقطة الأصل قريبة من المركز
  const maxAbsX = Math.max(5, ...points.map((p) => Math.abs(p.x) + 1));
  const maxAbsY = Math.max(5, ...points.map((p) => Math.abs(p.y) + 1));
  const scaleX = 4.0 / maxAbsX;
  const scaleY = 4.0 / maxAbsY;
  const scale = Math.min(scaleX, scaleY);

  const originX = 5;
  const originY = 5;

  const vXPos: CanonicalVertexNode = {
    id: `${opts.figureId}_x_pos`,
    label: notation === "arabic" ? "س" : "X",
    position: { x: 9.4, y: originY },
  };
  const vXNeg: CanonicalVertexNode = {
    id: `${opts.figureId}_x_neg`,
    label: notation === "arabic" ? "س'" : "X'",
    position: { x: 0.6, y: originY },
  };
  const vYPos: CanonicalVertexNode = {
    id: `${opts.figureId}_y_pos`,
    label: notation === "arabic" ? "ص" : "Y",
    position: { x: originX, y: 0.6 },
  };
  const vYNeg: CanonicalVertexNode = {
    id: `${opts.figureId}_y_neg`,
    label: notation === "arabic" ? "ص'" : "Y'",
    position: { x: originX, y: 9.4 },
  };
  const vO: CanonicalVertexNode = {
    id: `${opts.figureId}_origin`,
    label: localizeGeometricVertexLabelSSOT("و", notation),
    position: { x: originX, y: originY },
  };

  const plottedVertices: CanonicalVertexNode[] = points.map((pt, idx) => ({
    id: `${opts.figureId}_pt_${idx}`,
    label: `${pt.name}(${pt.x}, ${pt.y})`,
    position: {
      x: Number((originX + pt.x * scale).toFixed(2)),
      // ملاحظة: في بعض أفرع المستوى الإحداثي تُرسم الصادات للأعلى (y أصغر في SVG)
      y: Number((originY - pt.y * scale).toFixed(2)),
    },
  }));

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_axis_x`, fromVertexId: vXNeg.id, toVertexId: vXPos.id, strokeStyle: "solid" },
    { id: `${opts.figureId}_axis_y`, fromVertexId: vYNeg.id, toVertexId: vYPos.id, strokeStyle: "solid" },
  ];

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
    coordinateGrid: { enabled: true },
    vertices: [vXPos, vXNeg, vYPos, vYNeg, vO, ...plottedVertices],
    segments,
    angles: [],
    polygons,
  };
}
