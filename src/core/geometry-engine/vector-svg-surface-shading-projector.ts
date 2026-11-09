/**
 * @file vector-svg-surface-shading-projector.ts
 * @description مصير تظليل الأسطح والمضلعات المغلقة المتجهي النقي (Chroma Surface Shading):
 * - يظلل فقط المضلعات المغلقة الصريحة (`figure.polygons`) التي تتصل جميع رؤوسها المتتالية بأضلاع فعلية في `figure.segments`.
 * - لا يخمن مضلعات عشوائية من مصفوفة الرؤوس ولا يرسم أي خطوط أو حواف إضافية (`stroke="none"`).
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
  { fill: "#6366F1", opacity: "0.06" }, // Indigo / Sapphire
  { fill: "#0D9488", opacity: "0.07" }, // Teal / Emerald
  { fill: "#D97706", opacity: "0.06" }, // Warm Amber
  { fill: "#E11D48", opacity: "0.05" }, // Rose
] as const;

/** يتحقق من وجود مسار ضلعي فعلي (مباشر أو عبر نقطة منتصف على نفس الضلع) بين رأسين في الشكل. */
function areVerticesConnectedBySegments(
  fromId: string,
  toId: string,
  adjacency: ReadonlyMap<string, ReadonlySet<string>>
): boolean {
  const direct = adjacency.get(fromId);
  if (!direct) return false;
  if (direct.has(toId)) return true;
  for (const midId of direct) {
    if (adjacency.get(midId)?.has(toId)) return true;
  }
  return false;
}

export function projectGeometrySurfaceShadingSVGMarkup(
  opts: SurfaceShadingOptions
): string {
  const { figure, vertexMap } = opts;
  if (figure.familyId === "circle_family") {
    return "";
  }

  const explicitPolygons = figure.polygons;
  if (!explicitPolygons || explicitPolygons.length === 0) {
    return "";
  }

  const adjacency = new Map<string, Set<string>>();
  for (const seg of figure.segments) {
    if (!adjacency.has(seg.fromVertexId)) adjacency.set(seg.fromVertexId, new Set());
    if (!adjacency.has(seg.toVertexId)) adjacency.set(seg.toVertexId, new Set());
    adjacency.get(seg.fromVertexId)!.add(seg.toVertexId);
    adjacency.get(seg.toVertexId)!.add(seg.fromVertexId);
  }

  const validPolygonGroups = explicitPolygons.filter((vIds) => {
    if (vIds.length < 3) return false;
    for (let i = 0; i < vIds.length; i++) {
      const a = vIds[i];
      const b = vIds[(i + 1) % vIds.length];
      if (!areVerticesConnectedBySegments(a, b, adjacency)) {
        return false;
      }
    }
    return true;
  });

  if (validPolygonGroups.length === 0) return "";

  const elements: string[] = [];

  validPolygonGroups.forEach((vIds, idx) => {
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
        `<polygon points="${pointsStr}" fill="${palette.fill}" fill-opacity="${palette.opacity}" stroke="none" />`
      );
    }
  });

  return elements.length > 0 ? `<g class="geometry-surface-tints">${elements.join("")}</g>` : "";
}
