/**
 * @file math-inequality-number-line-svg-builder.ts
 * @description راسم متجهي حتمي لخط الأعداد الصحيحة وتمثيل المتباينات (نقطة مغلقة/مفتوحة وسهم ممتد يميناً أو يساراً)
 * بصيغة Vector SVG نقية شفافة متجاوبة مع نظام الأرقام.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 140 سطراً).
 */

import {
  formatNumeralsByModeSSOT,
  toWesternNumeralsSSOT,
  type NumeralDisplayMode,
} from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_MATH_INEQUALITY_NUMBER_LINE_SVG_BUILDER =
  "math_inequality_number_line_svg_builder" as const;

/** يبني SVG لتمثيل متباينة على خط الأعداد بنقطة مغلقة/مفتوحة وسهم شعاعي. */
export function tryBuildInequalityNumberLineSvg(
  description: string,
  numeralMode: NumeralDisplayMode = "western"
): string | null {
  const norm = toWesternNumeralsSSOT(description || "");
  if (!/خط\s*(?:ال)?أعداد/i.test(norm)) return null;
  if (!/مظلل|مغلقة|مفتوحة|يمين|يسار|سهم|متباينة|[<>≤≥]|\\le|\\ge/i.test(norm)) {
    return null;
  }

  let anchor = 0;
  const pointMatch = norm.match(
    /(?:النقطة|عند\s*(?:العدد)?|[xس]\s*(?:[<>≤≥]|\\le|\\ge)\s*)(-?\d+(?:\.\d+)?)/i
  );
  if (pointMatch?.[1] !== undefined) {
    anchor = Number(pointMatch[1]);
  } else {
    const anyNum = norm.match(/(-?\d+)/);
    if (anyNum?.[1] !== undefined) anchor = Number(anyNum[1]);
  }
  if (!Number.isFinite(anchor)) anchor = 0;

  const isOpen = /مفتوحة|غير\s*مظللة|دائرة\s*مفرغة|(?:^|\s)[xس]\s*[<>](?![=])/i.test(norm);
  const isLeft = /يسار|أصغر|أقل|[<≤]|\\le/i.test(norm) && !/يمين|أكبر/i.test(norm);
  const isIntegerSet = /صحيح|مظلل\s*عليه/i.test(norm);

  const startInt = isLeft ? Math.round(anchor) - 4 : Math.round(anchor) - 2;
  const endInt = isLeft ? Math.round(anchor) + 2 : Math.round(anchor) + 4;
  const leftX = 24;
  const rightX = 226;
  const lineY = 38;
  const stepX = (rightX - leftX) / Math.max(1, endInt - startInt);
  const xFor = (v: number) => leftX + (v - startInt) * stepX;

  const fmt = (s: string) => formatNumeralsByModeSSOT(s, numeralMode);
  const ticksSvg: string[] = [];
  for (let v = startInt; v <= endInt; v++) {
    const tx = xFor(v);
    const isSelectedInt =
      isIntegerSet && ((isLeft && (isOpen ? v < anchor : v <= anchor)) || (!isLeft && (isOpen ? v > anchor : v >= anchor)));
    ticksSvg.push(
      `<line x1="${tx.toFixed(1)}" y1="${lineY - 4.5}" x2="${tx.toFixed(1)}" y2="${lineY + 4.5}" stroke="#0F172A" stroke-width="1.3" />`
    );
    if (isSelectedInt && Math.abs(v - anchor) > 0.05) {
      ticksSvg.push(`<circle cx="${tx.toFixed(1)}" cy="${lineY}" r="3.2" fill="#C81E1E" />`);
    }
    ticksSvg.push(
      `<text x="${tx.toFixed(1)}" y="${lineY + 19}" text-anchor="middle" font-size="10.5" font-weight="800" font-family="system-ui, sans-serif" fill="#0F172A">${fmt(String(v))}</text>`
    );
  }

  const anchorX = Math.max(leftX, Math.min(rightX, xFor(anchor)));
  const rayEndX = isLeft ? 10 : 240;
  const rayY = lineY - 12;
  const arrowHead = isLeft
    ? `<polygon points="8,${rayY} 16,${rayY - 4} 16,${rayY + 4}" fill="#C81E1E" />`
    : `<polygon points="242,${rayY} 234,${rayY - 4} 234,${rayY + 4}" fill="#C81E1E" />`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 72" width="100%" height="100%" style="display:block;margin:auto;background:transparent;">
    <line x1="12" y1="${lineY}" x2="238" y2="${lineY}" stroke="#0F172A" stroke-width="1.6" />
    <polygon points="8,${lineY} 15,${lineY - 3.5} 15,${lineY + 3.5}" fill="#0F172A" />
    <polygon points="242,${lineY} 235,${lineY - 3.5} 235,${lineY + 3.5}" fill="#0F172A" />
    ${ticksSvg.join("")}
    <line x1="${anchorX.toFixed(1)}" y1="${lineY}" x2="${anchorX.toFixed(1)}" y2="${rayY}" stroke="#C81E1E" stroke-width="2" />
    <line x1="${anchorX.toFixed(1)}" y1="${rayY}" x2="${rayEndX}" y2="${rayY}" stroke="#C81E1E" stroke-width="2.4" stroke-linecap="round" />
    ${arrowHead}
    <circle cx="${anchorX.toFixed(1)}" cy="${lineY}" r="4.6" fill="${isOpen ? "#FFFFFF" : "#C81E1E"}" stroke="#C81E1E" stroke-width="2" />
  </svg>`;
}
