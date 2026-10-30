/**
 * @file graph-svg-projector.ts
 * @description مصيّر الرسوم البيانية للدوال (Cartesian Graph SVG Projector) بدون أي مكتبات خارجية.
 */
import type { CartesianGraphSpec, GraphFunctionSpec } from "@/core/ssot/cartesian-graph-spec-ssot";
import { formatNumeralsByModeSSOT, type NumeralDisplayMode } from "@/core/ssot/numeral-and-unit-ssot";

export const MODULE_ID_GRAPH_SVG_PROJECTOR = "graph_svg_projector" as const;

export interface GraphSVGProjectorOptions {
  readonly widthPx?: number;
  readonly heightPx?: number;
  readonly strokeColorHex?: string;
  readonly accentColorHex?: string;
  readonly numeralMode?: NumeralDisplayMode;
}

function evalGraphFn(fn: GraphFunctionSpec, x: number): number {
  if (fn.kind === "linear") return fn.a * x + fn.b;
  if (fn.kind === "quadratic") return fn.a * x * x + fn.b * x + fn.c;
  if (fn.kind === "absolute") return fn.a * Math.abs(x - fn.b) + fn.c;
  return fn.a;
}

export function projectCartesianGraphToSVGMarkup(
  spec: CartesianGraphSpec,
  options: GraphSVGProjectorOptions = {}
): string {
  const width = options.widthPx ?? 210;
  const height = options.heightPx ?? 160;
  const strokeColor = options.strokeColorHex ?? "#1E293B";
  const accentColor = options.accentColorHex ?? "#2563EB";
  const numeralMode = options.numeralMode ?? "western";
  const pad = 16;

  const { xMin, xMax, yMin, yMax } = spec;
  const spanX = Math.max(1, xMax - xMin);
  const spanY = Math.max(1, yMax - yMin);
  const sx = (x: number) => pad + ((x - xMin) / spanX) * (width - pad * 2);
  const sy = (y: number) => height - pad - ((y - yMin) / spanY) * (height - pad * 2);

  const stepX = spanX > 12 ? 2 : 1;
  const stepY = spanY > 12 ? 2 : 1;
  const gridLines: string[] = [];
  const tickLabels: string[] = [];
  const originX = Math.min(width - pad, Math.max(pad, sx(0)));
  const originY = Math.min(height - pad, Math.max(pad, sy(0)));

  for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += stepX) {
    const px = sx(x);
    gridLines.push(`<line x1="${px.toFixed(1)}" y1="${pad}" x2="${px.toFixed(1)}" y2="${height - pad}" stroke="#E2E8F0" stroke-width="0.6" />`);
    if (x !== 0) {
      tickLabels.push(`<text x="${px.toFixed(1)}" y="${(originY + 9).toFixed(1)}" text-anchor="middle" font-size="6.5" font-weight="700" fill="#64748B">${formatNumeralsByModeSSOT(x, numeralMode)}</text>`);
    }
  }
  for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y += stepY) {
    const py = sy(y);
    gridLines.push(`<line x1="${pad}" y1="${py.toFixed(1)}" x2="${width - pad}" y2="${py.toFixed(1)}" stroke="#E2E8F0" stroke-width="0.6" />`);
    if (y !== 0) {
      tickLabels.push(`<text x="${(originX - 4).toFixed(1)}" y="${(py + 2).toFixed(1)}" text-anchor="end" font-size="6.5" font-weight="700" fill="#64748B">${formatNumeralsByModeSSOT(y, numeralMode)}</text>`);
    }
  }

  const axesSvg = `
    <line x1="${pad}" y1="${originY.toFixed(1)}" x2="${width - pad}" y2="${originY.toFixed(1)}" stroke="${strokeColor}" stroke-width="1.2" />
    <line x1="${originX.toFixed(1)}" y1="${pad}" x2="${originX.toFixed(1)}" y2="${height - pad}" stroke="${strokeColor}" stroke-width="1.2" />
    <text x="${(width - pad + 4).toFixed(1)}" y="${(originY + 3).toFixed(1)}" font-size="8" font-weight="900" fill="${strokeColor}">س</text>
    <text x="${(originX + 4).toFixed(1)}" y="${(pad - 3).toFixed(1)}" font-size="8" font-weight="900" fill="${strokeColor}">ص</text>
  `;

  const curvesSvg = spec.functions
    .map((fn, idx) => {
      const color = idx === 0 ? accentColor : strokeColor;
      const dash = fn.dashed ? `stroke-dasharray="4,3"` : "";
      if (fn.kind === "vertical_line") {
        const px = sx(fn.a);
        return `<line x1="${px.toFixed(1)}" y1="${pad}" x2="${px.toFixed(1)}" y2="${height - pad}" stroke="${color}" stroke-width="1.8" ${dash} />`;
      }
      const samples = 80;
      const pts: string[] = [];
      for (let i = 0; i <= samples; i++) {
        const x = xMin + (i / samples) * spanX;
        const y = evalGraphFn(fn, x);
        if (y >= yMin - 0.5 && y <= yMax + 0.5) {
          pts.push(`${sx(x).toFixed(1)},${sy(y).toFixed(1)}`);
        }
      }
      return pts.length >= 2
        ? `<polyline points="${pts.join(" ")}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" ${dash} />`
        : "";
    })
    .join("");

  const pointsSvg = spec.points
    .map((pt) => {
      const px = sx(pt.x);
      const py = sy(pt.y);
      const lbl = pt.label ? `${pt.label}(${formatNumeralsByModeSSOT(pt.x, numeralMode)},${formatNumeralsByModeSSOT(pt.y, numeralMode)})` : `(${formatNumeralsByModeSSOT(pt.x, numeralMode)},${formatNumeralsByModeSSOT(pt.y, numeralMode)})`;
      return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="2.6" fill="${accentColor}" stroke="#FFFFFF" stroke-width="0.9" />
      <text x="${(px + 4).toFixed(1)}" y="${(py - 4).toFixed(1)}" font-size="7" font-weight="800" fill="${strokeColor}">${lbl}</text>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-auto select-none">${gridLines.join("")}${axesSvg}${tickLabels.join("")}${curvesSvg}${pointsSvg}</svg>`;
}
