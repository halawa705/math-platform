/**
 * @file vector-svg-coordinate-grid-projector.ts
 * @description مصيّر متجهي نقي للشبكة الإحداثية الديكارتية (الربع الأول أو الأرباع الأربعة)،
 * المحاور المتعامدة، تدريجات الأعداد المعلّمة بـ data-furniture، ومنحنيات الدوال الملساء والمستقيمات.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 190 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../ssot/geometry-archetype-ssot";
import {
  formatNumeralsByModeSSOT,
  type MathNotationLanguage,
  type NumeralDisplayMode,
} from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_VECTOR_SVG_COORDINATE_GRID_PROJECTOR =
  "vector_svg_coordinate_grid_projector" as const;

export interface CoordinateGridProjectorOptions {
  readonly figure: CanonicalGeometryFigureIR;
  readonly toScreen: (x: number, y: number) => { readonly sx: number; readonly sy: number };
  readonly strokeColor: string;
  readonly accentColor: string;
  readonly numeralMode: NumeralDisplayMode;
  readonly notation: MathNotationLanguage;
}

function chooseCleanStep(span: number, explicitStep?: number): number {
  if (explicitStep && explicitStep > 0) return explicitStep;
  if (span <= 14) return 1;
  if (span <= 28) return 2;
  if (span <= 60) return 5;
  return Math.max(10, Math.ceil(span / 10 / 5) * 5);
}

export function resolveCoordinateGridBounds(figure: CanonicalGeometryFigureIR): {
  readonly xMin: number;
  readonly xMax: number;
  readonly yMin: number;
  readonly yMax: number;
  readonly isFirstQuadrant: boolean;
} {
  const grid = figure.coordinateGrid;
  const xs = [0, ...figure.vertices.map((v) => v.position.x)];
  const ys = [0, ...figure.vertices.map((v) => v.position.y)];
  for (const c of grid?.curves ?? []) {
    for (const pt of c.points) {
      xs.push(pt.x);
      ys.push(pt.y);
    }
  }
  const rawXMin = Math.min(...xs);
  const rawXMax = Math.max(...xs);
  const rawYMin = Math.min(...ys);
  const rawYMax = Math.max(...ys);
  const inferredFirst = grid?.quadrantMode === "first_quadrant" ||
    (grid?.quadrantMode === undefined && rawXMin >= 0 && rawYMin >= 0 && !grid?.xRange && !grid?.yRange);

  const xMin = grid?.xRange ? grid.xRange[0] : inferredFirst ? 0 : Math.floor(rawXMin - 1);
  const xMax = grid?.xRange ? grid.xRange[1] : Math.max(inferredFirst ? 5 : 4, Math.ceil(rawXMax + 1));
  const yMin = grid?.yRange ? grid.yRange[0] : inferredFirst ? 0 : Math.floor(rawYMin - 1);
  const yMax = grid?.yRange ? grid.yRange[1] : Math.max(inferredFirst ? 5 : 4, Math.ceil(rawYMax + 1));

  return { xMin, xMax, yMin, yMax, isFirstQuadrant: inferredFirst };
}

export function projectCoordinateGridAndCurvesSVGMarkup(
  opts: CoordinateGridProjectorOptions
): string {
  const grid = opts.figure.coordinateGrid;
  if (!grid?.enabled) return "";

  const { toScreen, numeralMode, notation, accentColor } = opts;
  const { xMin, xMax, yMin, yMax, isFirstQuadrant } = resolveCoordinateGridBounds(opts.figure);
  const stepX = chooseCleanStep(xMax - xMin, grid.step);
  const stepY = chooseCleanStep(yMax - yMin, grid.step);

  const showGrid = grid.showGridLines !== false;
  const showArrows = grid.showAxesArrows !== false;
  const showTicks = grid.showTickNumbers !== false;
  const axisStroke = "#475569";

  const xStartScreen = toScreen(xMin, 0);
  const xEndScreen = toScreen(xMax, 0);
  const yStartScreen = toScreen(0, yMin);
  const yEndScreen = toScreen(0, yMax);
  const originScreen = toScreen(0, 0);

  const parts: string[] = [];

  if (showGrid) {
    const startX = Math.ceil(xMin / stepX) * stepX;
    for (let x = startX; x <= xMax + 1e-6; x += stepX) {
      const rx = Math.round(x * 100) / 100;
      const p1 = toScreen(rx, yMin);
      const p2 = toScreen(rx, yMax);
      parts.push(`<line data-coord-grid="1" x1="${p1.sx}" y1="${p1.sy}" x2="${p2.sx}" y2="${p2.sy}" stroke="#E2E8F0" stroke-width="0.7" />`);
      if (showTicks && Math.abs(rx) > 1e-6) {
        const tickLbl = formatNumeralsByModeSSOT(rx, numeralMode);
        parts.push(
          `<line data-coord-grid="1" x1="${p1.sx}" y1="${(originScreen.sy - 2.5).toFixed(1)}" x2="${p1.sx}" y2="${(originScreen.sy + 2.5).toFixed(1)}" stroke="${axisStroke}" stroke-width="0.9" />` +
          `<text data-furniture="1" x="${p1.sx}" y="${(originScreen.sy + 10.5).toFixed(1)}" text-anchor="middle" font-size="7" font-weight="700" fill="#64748B">${tickLbl}</text>`
        );
      }
    }

    const startY = Math.ceil(yMin / stepY) * stepY;
    for (let y = startY; y <= yMax + 1e-6; y += stepY) {
      const ry = Math.round(y * 100) / 100;
      const p1 = toScreen(xMin, ry);
      const p2 = toScreen(xMax, ry);
      parts.push(`<line data-coord-grid="1" x1="${p1.sx}" y1="${p1.sy}" x2="${p2.sx}" y2="${p2.sy}" stroke="#E2E8F0" stroke-width="0.7" />`);
      if (showTicks && Math.abs(ry) > 1e-6) {
        const tickLbl = formatNumeralsByModeSSOT(ry, numeralMode);
        parts.push(
          `<line data-coord-grid="1" x1="${(originScreen.sx - 2.5).toFixed(1)}" y1="${p1.sy}" x2="${(originScreen.sx + 2.5).toFixed(1)}" y2="${p1.sy}" stroke="${axisStroke}" stroke-width="0.9" />` +
          `<text data-furniture="1" x="${(originScreen.sx - 5.5).toFixed(1)}" y="${(p1.sy + 2.5).toFixed(1)}" text-anchor="end" font-size="7" font-weight="700" fill="#64748B">${tickLbl}</text>`
        );
      }
    }
  }

  // محورا السينات والصادات
  parts.push(
    `<line data-coord-axis="x" x1="${xStartScreen.sx}" y1="${xStartScreen.sy}" x2="${xEndScreen.sx}" y2="${xEndScreen.sy}" stroke="${axisStroke}" stroke-width="1.4" />`,
    `<line data-coord-axis="y" x1="${yStartScreen.sx}" y1="${yStartScreen.sy}" x2="${yEndScreen.sx}" y2="${yEndScreen.sy}" stroke="${axisStroke}" stroke-width="1.4" />`
  );

  if (showArrows) {
    parts.push(
      `<polygon points="${xEndScreen.sx},${xEndScreen.sy} ${(xEndScreen.sx - 5.5).toFixed(1)},${(xEndScreen.sy - 2.5).toFixed(1)} ${(xEndScreen.sx - 5.5).toFixed(1)},${(xEndScreen.sy + 2.5).toFixed(1)}" fill="${axisStroke}" />`,
      `<polygon points="${yEndScreen.sx},${yEndScreen.sy} ${(yEndScreen.sx - 2.5).toFixed(1)},${(yEndScreen.sy + 5.5).toFixed(1)} ${(yEndScreen.sx + 2.5).toFixed(1)},${(yEndScreen.sy + 5.5).toFixed(1)}" fill="${axisStroke}" />`
    );
    if (!isFirstQuadrant) {
      parts.push(
        `<polygon points="${xStartScreen.sx},${xStartScreen.sy} ${(xStartScreen.sx + 5.5).toFixed(1)},${(xStartScreen.sy - 2.5).toFixed(1)} ${(xStartScreen.sx + 5.5).toFixed(1)},${(xStartScreen.sy + 2.5).toFixed(1)}" fill="${axisStroke}" />`,
        `<polygon points="${yStartScreen.sx},${yStartScreen.sy} ${(yStartScreen.sx - 2.5).toFixed(1)},${(yStartScreen.sy - 5.5).toFixed(1)} ${(yStartScreen.sx + 2.5).toFixed(1)},${(yStartScreen.sy - 5.5).toFixed(1)}" fill="${axisStroke}" />`
      );
    }
  }

  const xPosLbl = grid.xAxisLabel ?? (notation === "arabic" ? "س" : "X");
  const yPosLbl = grid.yAxisLabel ?? (notation === "arabic" ? "ص" : "Y");
  parts.push(
    `<text data-furniture="1" x="${(xEndScreen.sx - 2).toFixed(1)}" y="${(xEndScreen.sy - 6).toFixed(1)}" text-anchor="end" font-size="8.5" font-weight="800" fill="#0F172A">${xPosLbl}</text>`,
    `<text data-furniture="1" x="${(yEndScreen.sx + 7).toFixed(1)}" y="${(yEndScreen.sy + 6).toFixed(1)}" text-anchor="start" font-size="8.5" font-weight="800" fill="#0F172A">${yPosLbl}</text>`
  );
  if (showTicks) {
    const oLbl = formatNumeralsByModeSSOT(0, numeralMode);
    parts.push(
      `<text data-furniture="1" x="${(originScreen.sx - 5).toFixed(1)}" y="${(originScreen.sy + 9.5).toFixed(1)}" text-anchor="end" font-size="7" font-weight="700" fill="#64748B">${oLbl}</text>`
    );
  }

  // منحنيات الدوال والمعادلات الملساء
  for (const curve of grid.curves ?? []) {
    if (curve.points.length < 2) continue;
    const dAttr = curve.points
      .map((pt, i) => {
        const sc = toScreen(pt.x, pt.y);
        return `${i === 0 ? "M" : "L"} ${sc.sx} ${sc.sy}`;
      })
      .join(" ");
    const cStroke = curve.strokeColorHex ?? accentColor;
    const cWidth = curve.strokeWidth ?? 2.1;
    const dash = curve.strokeStyle === "dashed" ? ' stroke-dasharray="4,3"' : curve.strokeStyle === "dotted" ? ' stroke-dasharray="2,2"' : "";
    parts.push(`<path data-coord-curve="${curve.id}" d="${dAttr}" fill="none" stroke="${cStroke}" stroke-width="${cWidth}" stroke-linecap="round" stroke-linejoin="round"${dash} />`);
    if (curve.label && curve.labelPosition) {
      const lsc = toScreen(curve.labelPosition.x, curve.labelPosition.y);
      parts.push(`<text x="${lsc.sx}" y="${lsc.sy}" text-anchor="middle" font-size="8" font-weight="800" fill="${cStroke}" paint-order="stroke" stroke="#ffffff" stroke-width="2.2">${curve.label}</text>`);
    }
  }

  return `<g class="coordinate-grid-and-curves">${parts.join("")}</g>`;
}
