/**
 * @file math-dot-array-svg-builder.ts
 * @description مصيّر مصفوفة النقاط (Dot Array / Distributive Multiplication Matrix) للمرحلة الابتدائية مع أقواس حتمية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 175 سطراً).
 */

import {
  formatNumeralsByModeSSOT,
  type NumeralDisplayMode,
} from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_MATH_DOT_ARRAY_SVG_BUILDER =
  "math_dot_array_svg_builder" as const;

export interface MathDotArrayOptions {
  readonly rows: number;
  readonly cols: number;
  readonly splitCols?: readonly number[];
  readonly width?: number;
  readonly height?: number;
  readonly numeralMode?: NumeralDisplayMode;
  readonly showRowBrace?: boolean;
  readonly showColBraces?: boolean;
}

function buildHorizontalBracePath(x1: number, x2: number, y: number, h = 10): string {
  const left = Math.min(x1, x2);
  const right = Math.max(x1, x2);
  const w = right - left;
  const xc = left + w / 2;
  const r = Math.min(6, w / 4);
  const dy = -h;
  return [
    `M ${left},${y}`,
    `Q ${left},${y + dy / 2} ${left + r},${y + dy / 2}`,
    `L ${xc - r},${y + dy / 2}`,
    `Q ${xc},${y + dy / 2} ${xc},${y + dy}`,
    `Q ${xc},${y + dy / 2} ${xc + r},${y + dy / 2}`,
    `L ${right - r},${y + dy / 2}`,
    `Q ${right},${y + dy / 2} ${right},${y}`,
  ].join(" ");
}

function buildVerticalBracePath(y1: number, y2: number, x: number, w = 10): string {
  const top = Math.min(y1, y2);
  const bottom = Math.max(y1, y2);
  const h = bottom - top;
  const yc = top + h / 2;
  const r = Math.min(6, h / 4);
  const dx = -w;
  return [
    `M ${x},${top}`,
    `Q ${x + dx / 2},${top} ${x + dx / 2},${top + r}`,
    `L ${x + dx / 2},${yc - r}`,
    `Q ${x + dx / 2},${yc} ${x + dx},${yc}`,
    `Q ${x + dx / 2},${yc} ${x + dx / 2},${yc + r}`,
    `L ${x + dx / 2},${bottom - r}`,
    `Q ${x + dx / 2},${bottom} ${x},${bottom}`,
  ].join(" ");
}

export function renderMathDotArraySVG(options: MathDotArrayOptions): string {
  const rows = Math.max(1, Math.min(15, options.rows || 1));
  const cols = Math.max(1, Math.min(25, options.cols || 1));
  const numeralMode = options.numeralMode ?? "western";
  const showRowBrace = options.showRowBrace !== false;
  const showColBraces = options.showColBraces !== false;

  const subColWidths: number[] =
    options.splitCols && options.splitCols.length > 0 && options.splitCols.reduce((a, b) => a + b, 0) === cols
      ? [...options.splitCols]
      : [cols];

  const dotRadius = 3.5;
  const dotPitch = 16;
  const boxPad = 10;
  const gap = 12;
  const braceSize = 10;

  const rowMargin = showRowBrace ? 30 : 10;
  const topMargin = showColBraces ? 32 : 10;
  const boxH = (rows - 1) * dotPitch + boxPad * 2;
  const boxWidths = subColWidths.map((sc) => (sc - 1) * dotPitch + boxPad * 2);
  const totalBoxesW = boxWidths.reduce((a, b) => a + b, 0) + (subColWidths.length - 1) * gap;

  const totalW = options.width ?? rowMargin + totalBoxesW + 10;
  const totalH = options.height ?? topMargin + boxH + 10;
  const svgParts: string[] = [];

  if (showRowBrace) {
    const braceX = rowMargin - 8;
    const bTop = topMargin + 2;
    const bBottom = topMargin + boxH - 2;
    svgParts.push(
      `<path d="${buildVerticalBracePath(bTop, bBottom, braceX, braceSize)}" fill="none" stroke="#334155" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>`,
      `<text x="${braceX - braceSize - 6}" y="${(bTop + bBottom) / 2 + 5}" font-family="Cairo, Arial, sans-serif" font-size="14" font-weight="bold" fill="#0f172a" text-anchor="middle">${formatNumeralsByModeSSOT(rows, numeralMode)}</text>`
    );
  }

  let curX = rowMargin;
  subColWidths.forEach((bCols, bIdx) => {
    const bw = boxWidths[bIdx];
    svgParts.push(`<rect x="${curX}" y="${topMargin}" width="${bw}" height="${boxH}" rx="4" fill="#ffffff" stroke="#1e293b" stroke-width="1.2"/>`);
    for (let r = 0; r < rows; r++) {
      const cy = topMargin + boxPad + r * dotPitch;
      for (let c = 0; c < bCols; c++) {
        svgParts.push(`<circle cx="${curX + boxPad + c * dotPitch}" cy="${cy}" r="${dotRadius}" fill="#0f172a"/>`);
      }
    }
    if (showColBraces) {
      const by = topMargin - 6;
      svgParts.push(
        `<path d="${buildHorizontalBracePath(curX + 2, curX + bw - 2, by, braceSize)}" fill="none" stroke="#334155" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>`,
        `<text x="${curX + bw / 2}" y="${by - braceSize - 2}" font-family="Cairo, Arial, sans-serif" font-size="14" font-weight="bold" fill="#0f172a" text-anchor="middle">${formatNumeralsByModeSSOT(bCols, numeralMode)}</text>`
      );
    }
    curX += bw + gap;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" class="w-full h-auto select-none" style="background:#ffffff">${svgParts.join("")}</svg>`;
}
