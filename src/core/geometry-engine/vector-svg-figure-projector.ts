/**
 * @file vector-svg-figure-projector.ts
 * @description المصير المتجهي النقي (Pure Vector SVG Projector) الذي يحول CanonicalGeometryFigureIR
 * المنبثقة من أصول العائلات الهندسية (`triangle-root-core.ts` وغيرها) إلى رسم SVG متجهي فائق الدقة
 * للشاشة والطباعة الورقية مع دعم علامات التساوي (Ticks)، أسهم التوازي، والأرقام العربية/المشرقية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import type { CanonicalGeometryFigureIR } from "../ssot/geometry-archetype-ssot";
import {
  formatNumeralsByModeSSOT,
  type NumeralDisplayMode,
} from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_VECTOR_SVG_FIGURE_PROJECTOR =
  "vector_svg_figure_projector" as const;

export interface SVGProjectorOptions {
  readonly widthPx?: number;
  readonly heightPx?: number;
  readonly strokeColorHex?: string;
  readonly accentColorHex?: string;
  readonly numeralMode?: NumeralDisplayMode;
}

export function projectGeometryFigureToSVGMarkup(
  figure: CanonicalGeometryFigureIR,
  options: SVGProjectorOptions = {}
): string {
  const width = options.widthPx ?? 230;
  const height = options.heightPx ?? 165;
  const strokeColor = options.strokeColorHex ?? "#1E293B";
  const accentColor = options.accentColorHex ?? "#0D9488";
  const numeralMode = options.numeralMode ?? "eastern";
  const padding = Math.max(9, Math.min(13, Math.round(Math.min(width, height) * 0.1)));

  if (figure.vertices.length === 0) {
    return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="100%"></svg>`;
  }

  const xs = figure.vertices.map((v) => v.position.x);
  const ys = figure.vertices.map((v) => v.position.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const spanX = Math.max(maxX - minX, 1);
  const spanY = Math.max(maxY - minY, 1);
  const scale = Math.min(
    (width - padding * 2) / spanX,
    (height - padding * 2) / spanY
  );

  const toScreen = (x: number, y: number) => ({
    sx: Number((padding + (x - minX) * scale).toFixed(1)),
    sy: Number((height - padding - (y - minY) * scale).toFixed(1)),
  });

  const vertexMap = new Map(
    figure.vertices.map((v) => [
      v.id,
      { ...v, screen: toScreen(v.position.x, v.position.y) },
    ])
  );

  // حساب مركز ثقل الشكل لإزاحة تسميات الرؤوس للخارج بعيداً عن الأضلاع
  const centerSx =
    Array.from(vertexMap.values()).reduce((acc, v) => acc + v.screen.sx, 0) /
    figure.vertices.length;
  const centerSy =
    Array.from(vertexMap.values()).reduce((acc, v) => acc + v.screen.sy, 0) /
    figure.vertices.length;

  // إذا كان الشكل من عائلة الدائرة، نرسم محيط الدائرة المتجهي حول المركز
  let circleRimSvg = "";
  if (figure.familyId === "circle_family") {
    const centerNode =
      Array.from(vertexMap.values()).find((v) => v.id.includes("center")) ||
      Array.from(vertexMap.values())[0];
    const rimPoint = Array.from(vertexMap.values()).find(
      (v) => v.id !== centerNode?.id
    );
    if (centerNode && rimPoint) {
      const rPx = Math.hypot(
        rimPoint.screen.sx - centerNode.screen.sx,
        rimPoint.screen.sy - centerNode.screen.sy
      );
      circleRimSvg = `<circle cx="${centerNode.screen.sx}" cy="${
        centerNode.screen.sy
      }" r="${rPx.toFixed(
        1
      )}" fill="none" stroke="${strokeColor}" stroke-width="1.8" />`;
    }
  }

  const segmentsSvg = figure.segments
    .map((seg) => {
      const fromV = vertexMap.get(seg.fromVertexId);
      const toV = vertexMap.get(seg.toVertexId);
      if (!fromV || !toV) return "";

      const x1 = fromV.screen.sx;
      const y1 = fromV.screen.sy;
      const x2 = toV.screen.sx;
      const y2 = toV.screen.sy;
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;

      const dashAttr =
        seg.strokeStyle === "dashed"
          ? `stroke-dasharray="4,3"`
          : seg.strokeStyle === "dotted"
          ? `stroke-dasharray="2,2"`
          : "";

      let decorations = "";

      // علامات تساوي الأضلاع (Tick Marks)
      if (seg.tickMarks) {
        const count = seg.tickMarks;
        for (let i = 0; i < count; i++) {
          const offset = (i - (count - 1) / 2) * 4;
          const tx = mx + (dx / len) * offset;
          const ty = my + (dy / len) * offset;
          decorations += `<line x1="${(tx - nx * 4).toFixed(1)}" y1="${(
            ty -
            ny * 4
          ).toFixed(1)}" x2="${(tx + nx * 4).toFixed(1)}" y2="${(
            ty +
            ny * 4
          ).toFixed(1)}" stroke="${accentColor}" stroke-width="1.5" />`;
        }
      }

      // أسهم التوازي (Parallel Arrows)
      if (seg.parallelArrows) {
        const ux = dx / len;
        const uy = dy / len;
        const ax = mx - ux * 3;
        const ay = my - uy * 3;
        decorations += `<path d="M ${(ax - ux * 4 + nx * 3).toFixed(1)} ${(
          ay -
          uy * 4 +
          ny * 3
        ).toFixed(1)} L ${(ax + ux * 2.5).toFixed(1)} ${(ay + uy * 2.5).toFixed(
          1
        )} L ${(ax - ux * 4 - nx * 3).toFixed(1)} ${(
          ay -
          uy * 4 -
          ny * 3
        ).toFixed(
          1
        )}" fill="none" stroke="${accentColor}" stroke-width="1.5" stroke-linecap="round"/>`;
      }

      // تسمية طول الضلع بالوحدة العربية بصياغة متناسبة وخط رشيق
      if (seg.lengthLabel) {
        const formattedVal = formatNumeralsByModeSSOT(
          seg.lengthLabel.value,
          numeralMode
        );
        const lx = mx + nx * 7;
        const ly = my + ny * 7 + 2.5;
        decorations += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(
          1
        )}" text-anchor="middle" font-size="8.5" font-weight="700" fill="${accentColor}">${formattedVal} ${
          seg.lengthLabel.unit
        }</text>`;
      }

      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${strokeColor}" stroke-width="1.7" stroke-linecap="round" ${dashAttr} />${decorations}`;
    })
    .join("");

  const verticesSvg = Array.from(vertexMap.values())
    .map((v) => {
      const vx = v.screen.sx - centerSx;
      const vy = v.screen.sy - centerSy;
      const vLen = Math.hypot(vx, vy) || 1;
      const labelX = v.screen.sx + (vx / vLen) * 8;
      const labelY = v.screen.sy + (vy / vLen) * 8 + 3;

      return `<circle cx="${v.screen.sx}" cy="${v.screen.sy}" r="2.2" fill="${strokeColor}" />
      <text x="${labelX.toFixed(1)}" y="${labelY.toFixed(
        1
      )}" text-anchor="middle" font-size="9.5" font-weight="800" fill="${strokeColor}">${
        v.label
      }</text>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-auto select-none">${circleRimSvg}${segmentsSvg}${verticesSvg}</svg>`;
}
