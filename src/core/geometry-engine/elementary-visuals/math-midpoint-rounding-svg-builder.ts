/**
 * @file math-midpoint-rounding-svg-builder.ts
 * @description مصيّر استراتيجية نقطة المنتصف للتقريب (Midpoint Rounding Number Line) للمرحلة الابتدائية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 115 سطراً).
 */

import {
  formatNumeralsByModeSSOT,
  toWesternNumeralsSSOT,
  type NumeralDisplayMode,
} from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_MATH_MIDPOINT_ROUNDING_SVG_BUILDER =
  "math_midpoint_rounding_svg_builder" as const;

export interface MathMidpointRoundingOptions {
  readonly lowerBound: number | string;
  readonly upperBound: number | string;
  readonly midpoint?: number | string;
  readonly targetValue: number | string;
  readonly width?: number;
  readonly height?: number;
  readonly numeralMode?: NumeralDisplayMode;
  readonly showDashedGuide?: boolean;
}

function toNumericValue(v: number | string, fallback: number): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : fallback;
  const parsed = parseFloat(toWesternNumeralsSSOT(v).replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function renderMathMidpointRoundingSVG(options: MathMidpointRoundingOptions): string {
  const width = options.width ?? 280;
  const height = options.height ?? 260;
  const numeralMode = options.numeralMode ?? "western";
  const showDashedGuide = options.showDashedGuide !== false;

  const numLower = toNumericValue(options.lowerBound, 0);
  const numUpper = toNumericValue(options.upperBound, 100);
  const numMid = options.midpoint !== undefined ? toNumericValue(options.midpoint, (numLower + numUpper) / 2) : (numLower + numUpper) / 2;
  const numTarget = toNumericValue(options.targetValue, numMid);

  const lineX = width * 0.38;
  const topY = 32;
  const bottomY = height - 32;
  const midY = (topY + bottomY) / 2;

  let targetY = midY;
  if (numUpper !== numLower) {
    const frac = Math.max(0.08, Math.min(0.92, (numTarget - numLower) / (numUpper - numLower)));
    targetY = bottomY - frac * (bottomY - topY);
  }

  const roundsUp = numTarget >= numMid;
  const arrowDestY = roundsUp ? topY + 8 : bottomY - 8;
  const fmt = (v: number | string) => formatNumeralsByModeSSOT(v, numeralMode);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-auto select-none" style="background:#ffffff">
  <defs>
    <marker id="midpoint-arrow-up" viewBox="0 0 10 10" refX="5" refY="3" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 6 L 5 0 L 10 6 z" fill="#334155"/></marker>
    <marker id="midpoint-arrow-down" viewBox="0 0 10 10" refX="5" refY="7" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 4 L 5 10 L 10 4 z" fill="#334155"/></marker>
  </defs>
  <line x1="${lineX}" y1="${bottomY + 12}" x2="${lineX}" y2="${topY - 12}" stroke="#334155" stroke-width="2.5" marker-start="url(#midpoint-arrow-down)" marker-end="url(#midpoint-arrow-up)"/>
  <line x1="${lineX - 10}" y1="${topY}" x2="${lineX + 10}" y2="${topY}" stroke="#334155" stroke-width="2"/>
  <text x="${lineX - 18}" y="${topY + 5}" font-family="Cairo, Arial, sans-serif" font-size="14" font-weight="bold" fill="#0f172a" text-anchor="end">${fmt(options.upperBound)}</text>
  <line x1="${lineX - 10}" y1="${bottomY}" x2="${lineX + 10}" y2="${bottomY}" stroke="#334155" stroke-width="2"/>
  <text x="${lineX - 18}" y="${bottomY + 5}" font-family="Cairo, Arial, sans-serif" font-size="14" font-weight="bold" fill="#0f172a" text-anchor="end">${fmt(options.lowerBound)}</text>
  ${showDashedGuide ? `<line x1="${lineX - 14}" y1="${midY}" x2="${width - 16}" y2="${midY}" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="4 3"/>` : ""}
  <line x1="${lineX - 12}" y1="${midY}" x2="${lineX + 12}" y2="${midY}" stroke="#0284c7" stroke-width="2.5"/>
  <text x="${lineX - 18}" y="${midY + 5}" font-family="Cairo, Arial, sans-serif" font-size="13" font-weight="bold" fill="#0284c7" text-anchor="end">${fmt(options.midpoint !== undefined ? options.midpoint : numMid)} (المنتصف)</text>
  <circle cx="${lineX}" cy="${targetY}" r="5" fill="${roundsUp ? "#16a34a" : "#ea580c"}" stroke="#ffffff" stroke-width="1.5"/>
  <text x="${lineX + 18}" y="${targetY + 5}" font-family="Cairo, Arial, sans-serif" font-size="14" font-weight="800" fill="${roundsUp ? "#15803d" : "#c2410c"}">${fmt(options.targetValue)}</text>
  <path d="M ${lineX + 12},${targetY} Q ${lineX + 32},${(targetY + arrowDestY) / 2} ${lineX + 6},${arrowDestY}" fill="none" stroke="${roundsUp ? "#16a34a" : "#ea580c"}" stroke-width="1.8" stroke-dasharray="3 2" marker-end="${roundsUp ? "url(#midpoint-arrow-up)" : "url(#midpoint-arrow-down)"}"/>
</svg>`;
}
