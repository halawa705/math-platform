/**
 * @file graph-svg-projector.ts
 * @description مصيّر الرسوم البيانية للدوال (Cartesian Graph SVG Projector v2):
 * يدعم رسم المنحنيات الخطية، التربيعية، المقياس، متعددة التعريف،
 * وتظليل نصفي المستوى للمتباينات، ومحور التماثل، والنقاط المصمتة والمفرغة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (< 200 سطر).
 */

import type {
  CartesianGraphSpec,
  GraphFunctionSpec,
  HalfPlaneShading,
} from "@/core/ssot/cartesian-graph-spec-ssot";
import {
  formatNumeralsByModeSSOT,
  localizeGeometricVertexLabelSSOT,
  type MathNotationLanguage,
  type NumeralDisplayMode,
} from "@/core/ssot/numeral-and-unit-ssot";

export const MODULE_ID_GRAPH_SVG_PROJECTOR = "graph_svg_projector" as const;

export interface GraphSVGProjectorOptions {
  readonly widthPx?: number;
  readonly heightPx?: number;
  readonly strokeColorHex?: string;
  readonly accentColorHex?: string;
  readonly backgroundColorHex?: string;
  readonly numeralMode?: NumeralDisplayMode;
  readonly notationLanguage?: MathNotationLanguage;
}

function evalGraphFn(fn: { a: number; b: number; c: number; kind: string }, x: number): number {
  if (fn.kind === "linear") return fn.a * x + fn.b;
  if (fn.kind === "quadratic") return fn.a * x * x + fn.b * x + fn.c;
  if (fn.kind === "absolute") return fn.a * Math.abs(x - fn.b) + fn.c;
  if (fn.kind === "horizontal_line") return fn.a;
  return fn.a;
}

function buildShadingSvg(
  fn: GraphFunctionSpec,
  shade: HalfPlaneShading,
  sx: (x: number) => number,
  sy: (y: number) => number,
  pad: number,
  w: number,
  h: number,
  xMin: number,
  xMax: number
): string {
  const fillColor = "rgba(59, 130, 246, 0.15)";
  if (fn.kind === "vertical_line") {
    const px = sx(fn.a);
    const x1 = shade === "right" ? px : pad;
    const x2 = shade === "right" ? w - pad : px;
    return `<rect x="${x1.toFixed(1)}" y="${pad}" width="${Math.max(0, x2 - x1).toFixed(1)}" height="${(h - 2 * pad).toFixed(1)}" fill="${fillColor}" />`;
  }
  if (fn.kind === "horizontal_line") {
    const py = sy(fn.a);
    const y1 = shade === "above" ? pad : py;
    const y2 = shade === "above" ? py : h - pad;
    return `<rect x="${pad}" y="${y1.toFixed(1)}" width="${(w - 2 * pad).toFixed(1)}" height="${Math.max(0, y2 - y1).toFixed(1)}" fill="${fillColor}" />`;
  }
  // دالة خطية
  const yLeft = evalGraphFn(fn, xMin);
  const yRight = evalGraphFn(fn, xMax);
  const p1 = `${sx(xMin).toFixed(1)},${sy(yLeft).toFixed(1)}`;
  const p2 = `${sx(xMax).toFixed(1)},${sy(yRight).toFixed(1)}`;
  if (shade === "above") {
    return `<polygon points="${p1} ${p2} ${(w - pad).toFixed(1)},${pad} ${pad},${pad}" fill="${fillColor}" />`;
  }
  return `<polygon points="${p1} ${p2} ${(w - pad).toFixed(1)},${(h - pad).toFixed(1)} ${pad},${(h - pad).toFixed(1)}" fill="${fillColor}" />`;
}

export function projectCartesianGraphToSVGMarkup(
  spec: CartesianGraphSpec,
  options: GraphSVGProjectorOptions = {}
): string {
  const width = options.widthPx ?? 210;
  const height = options.heightPx ?? 160;
  const strokeColor = options.strokeColorHex ?? "#1E293B";
  const accentColor = options.accentColorHex ?? "#2563EB";
  const backgroundColor = options.backgroundColorHex ?? "#FFFFFF";
  const numeralMode = options.numeralMode ?? "western";
  const notation = options.notationLanguage ?? "arabic";
  const pad = 16;
  const bgRectSvg =
    backgroundColor && backgroundColor !== "transparent"
      ? `<rect x="0" y="0" width="${width}" height="${height}" rx="8" fill="${backgroundColor}" />`
      : "";

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

  const xAxisLabel = notation === "english" ? "X" : "س";
  const yAxisLabel = notation === "english" ? "Y" : "ص";
  const axesSvg = `
    <line x1="${pad}" y1="${originY.toFixed(1)}" x2="${width - pad}" y2="${originY.toFixed(1)}" stroke="${strokeColor}" stroke-width="1.2" />
    <line x1="${originX.toFixed(1)}" y1="${pad}" x2="${originX.toFixed(1)}" y2="${height - pad}" stroke="${strokeColor}" stroke-width="1.2" />
    <text x="${(width - pad + 4).toFixed(1)}" y="${(originY + 3).toFixed(1)}" font-size="8" font-weight="900" fill="${strokeColor}">${xAxisLabel}</text>
    <text x="${(originX + 4).toFixed(1)}" y="${(pad - 3).toFixed(1)}" font-size="8" font-weight="900" fill="${strokeColor}">${yAxisLabel}</text>
  `;

  // 1. تظليل المتباينات أولاً تحت الشبكة
  const shadingSvg = spec.functions
    .filter((fn) => fn.shadeHalfPlane)
    .map((fn) => buildShadingSvg(fn, fn.shadeHalfPlane!, sx, sy, pad, width, height, xMin, xMax))
    .join("");

  // 2. محاور التماثل
  const axesSymSvg = spec.functions
    .filter((fn) => fn.axisOfSymmetry !== undefined)
    .map((fn) => {
      const px = sx(fn.axisOfSymmetry!);
      return `<line x1="${px.toFixed(1)}" y1="${pad}" x2="${px.toFixed(1)}" y2="${height - pad}" stroke="#94A3B8" stroke-width="1.0" stroke-dasharray="3,3" />`;
    })
    .join("");

  // 3. المنحنيات
  const curvesSvg = spec.functions
    .map((fn, idx) => {
      const color = idx === 0 ? accentColor : strokeColor;
      const dash = fn.dashed ? `stroke-dasharray="4,3"` : "";

      if (fn.kind === "piecewise" && fn.branches) {
        return fn.branches
          .map((br) => {
            const bMin = br.domain.min ?? xMin;
            const bMax = br.domain.max ?? xMax;
            const pts: string[] = [];
            const samples = 40;
            for (let i = 0; i <= samples; i++) {
              const x = bMin + (i / samples) * (bMax - bMin);
              const y = evalGraphFn(br, x);
              if (y >= yMin - 0.5 && y <= yMax + 0.5) {
                pts.push(`${sx(x).toFixed(1)},${sy(y).toFixed(1)}`);
              }
            }
            return pts.length >= 2
              ? `<polyline points="${pts.join(" ")}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" />`
              : "";
          })
          .join("");
      }

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

  // 4. النقاط
  const allPoints = [...spec.points];
  for (const fn of spec.functions) {
    if (fn.vertexPoint) allPoints.push(fn.vertexPoint);
  }

  const pointsSvg = allPoints
    .map((pt) => {
      const px = sx(pt.x);
      const py = sy(pt.y);
      const locPtLabel = pt.label ? localizeGeometricVertexLabelSSOT(pt.label, notation) : "";
      const lbl = locPtLabel
        ? `${locPtLabel}(${formatNumeralsByModeSSOT(pt.x, numeralMode)},${formatNumeralsByModeSSOT(pt.y, numeralMode)})`
        : `(${formatNumeralsByModeSSOT(pt.x, numeralMode)},${formatNumeralsByModeSSOT(pt.y, numeralMode)})`;

      const fill = pt.style === "hollow" ? "#FFFFFF" : accentColor;
      const strokeW = pt.style === "hollow" ? "1.4" : "0.9";
      const stroke = pt.style === "hollow" ? accentColor : "#FFFFFF";

      return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="2.6" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}" />
      <text x="${(px + 4).toFixed(1)}" y="${(py - 4).toFixed(1)}" font-size="7" font-weight="800" fill="${strokeColor}">${lbl}</text>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-auto select-none">${bgRectSvg}${shadingSvg}${gridLines.join("")}${axesSvg}${axesSymSvg}${tickLabels.join("")}${curvesSvg}${pointsSvg}</svg>`;
}
