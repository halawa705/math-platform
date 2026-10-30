/**
 * @file vector-svg-surface-shading-projector.ts
 * @description مصير تظليل الأسطح والمضلعات المتجهي الفاخر (Chroma Surface Shading):
 * - يكتشف المضلعات والمثلثات والأشكال المتشابهة ويمنحها تظليلات لونية شبه شفافة راقية (Soft Pastel Tints).
 * - يميز المضلع الأول بلون نيلي هادئ والمضلع المناظر بلون زمردي أو عنبري مما يضفي عمقاً وحيوية بصرية استثنائية.
 * - خفيف للغاية (Zero-Bloat Vector Markup)، مجاني بالكامل 100%، ولا يثقل حجم الصفحة أو الـ PDF إطلاقاً.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../ssot/geometry-archetype-ssot";

export const MODULE_ID_VECTOR_SVG_SURFACE_SHADING_PROJECTOR =
  "vector_svg_surface_shading_projector" as const;

export interface SurfaceShadingOptions {
  readonly figure: CanonicalGeometryFigureIR;
  readonly vertexMap: Map<string, { readonly screen: { readonly sx: number; readonly sy: number } }>;
  readonly primaryColorHex?: string;
  readonly accentColorHex?: string;
}

const TINT_PALETTES = [
  { fill: "#6366F1", stroke: "#4F46E5", opacity: "0.08" }, // Indigo / Sapphire
  { fill: "#0D9488", stroke: "#0F766E", opacity: "0.09" }, // Teal / Emerald
  { fill: "#D97706", stroke: "#B45309", opacity: "0.08" }, // Warm Amber
  { fill: "#E11D48", stroke: "#BE123C", opacity: "0.07" }, // Rose
] as const;

export function projectGeometrySurfaceShadingSVGMarkup(
  opts: SurfaceShadingOptions
): string {
  const { figure, vertexMap } = opts;
  const vertices = figure.vertices;
  if (vertices.length < 3) return "";

  // استبعاد عائلة الدائرة من التظليل المضلعي
  if (figure.familyId === "circle_family") {
    return "";
  }

  const polygonGroups: string[][] = [];

  if (figure.polygons && figure.polygons.length > 0) {
    figure.polygons.forEach((ids) => polygonGroups.push([...ids]));
  } else if (vertices.length === 6) {
    polygonGroups.push(vertices.slice(0, 3).map((v) => v.id));
    polygonGroups.push(vertices.slice(3, 6).map((v) => v.id));
  } else if (vertices.length === 8) {
    polygonGroups.push(vertices.slice(0, 4).map((v) => v.id));
    polygonGroups.push(vertices.slice(4, 8).map((v) => v.id));
  } else if (vertices.length === 10) {
    polygonGroups.push(vertices.slice(0, 5).map((v) => v.id));
    polygonGroups.push(vertices.slice(5, 10).map((v) => v.id));
  } else if (vertices.length === 3 || vertices.length === 4 || vertices.length === 5) {
    polygonGroups.push(vertices.map((v) => v.id));
  } else if (figure.segments.length >= 3) {
    // محاولة تجميع الحلقات المغلقة من الأضلاع
    const firstGroup = vertices.slice(0, Math.min(vertices.length, 4)).map((v) => v.id);
    polygonGroups.push(firstGroup);
  }

  if (polygonGroups.length === 0) return "";

  const elements: string[] = [];

  polygonGroups.forEach((vIds, idx) => {
    const palette = TINT_PALETTES[idx % TINT_PALETTES.length];
    const pointsStr = vIds
      .map((id) => {
        const v = vertexMap.get(id);
        return v ? `${v.screen.sx.toFixed(1)},${v.screen.sy.toFixed(1)}` : "";
      })
      .filter(Boolean)
      .join(" ");

    if (pointsStr) {
      elements.push(
        `<polygon points="${pointsStr}" fill="${palette.fill}" fill-opacity="${palette.opacity}" stroke="${palette.stroke}" stroke-opacity="0.25" stroke-width="0.8" stroke-linejoin="round" />`
      );
    }
  });

  return `<g class="geometry-surface-tints">${elements.join("")}</g>`;
}
