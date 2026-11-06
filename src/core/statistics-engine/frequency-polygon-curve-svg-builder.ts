/**
 * @file frequency-polygon-curve-svg-builder.ts
 * @description مصيّر المضلع التكراري والمنحنى التكراري كمتجه SVG حتمي (المرحلة 4.5):
 * يحسب مراكز المجموعات ويرسم المضلع بخطوط منكسرة أو المنحنى التكراري بأقواس ممهدة ناعمة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (< 150 سطراً).
 */

import type { ParsedStatisticsSpec } from "./statistics-tag-parser";
import { formatNumeralsByModeSSOT, type NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_FREQUENCY_POLYGON_CURVE_SVG_BUILDER =
  "frequency_polygon_curve_svg_builder" as const;

export function buildFrequencyPolygonOrCurveSvgMarkup(
  spec: ParsedStatisticsSpec,
  numeralMode: NumeralDisplayMode = "western"
): string {
  const width = 280;
  const height = 190;
  const padLeft = 36;
  const padRight = 16;
  const padTop = 32;
  const padBottom = 32;

  const cats = spec.categories;
  const maxFreq = Math.max(...cats.map((c) => c.value), 5);
  const yMax = Math.ceil(maxFreq * 1.15);

  const spanW = width - padLeft - padRight;
  const spanH = height - padTop - padBottom;

  const sx = (idx: number) => padLeft + ((idx + 0.5) / cats.length) * spanW;
  const sy = (freq: number) => height - padBottom - (freq / yMax) * spanH;

  const gridSvg: string[] = [];
  const points: { x: number; y: number }[] = [];

  // عنوان الرسم
  gridSvg.push(
    `<text x="${(width / 2).toFixed(1)}" y="20" text-anchor="middle" font-size="11" font-weight="900" fill="#0F172A">${spec.titleArabic}</text>`
  );

  // شبكة المحاور الأفقية
  const ySteps = 4;
  for (let i = 0; i <= ySteps; i++) {
    const val = Math.round((yMax / ySteps) * i);
    const py = sy(val);
    gridSvg.push(
      `<line x1="${padLeft}" y1="${py.toFixed(1)}" x2="${(width - padRight).toFixed(1)}" y2="${py.toFixed(1)}" stroke="#E2E8F0" stroke-width="0.8" />
      <text x="${(padLeft - 5).toFixed(1)}" y="${(py + 3).toFixed(1)}" text-anchor="end" font-size="7" font-weight="700" fill="#64748B">${formatNumeralsByModeSSOT(val, numeralMode)}</text>`
    );
  }

  // المحورين
  gridSvg.push(
    `<line x1="${padLeft}" y1="${height - padBottom}" x2="${width - padRight}" y2="${height - padBottom}" stroke="#0F172A" stroke-width="1.2" />
    <line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${height - padBottom}" stroke="#0F172A" stroke-width="1.2" />`
  );

  // علامات المجموعات على محور السينات
  cats.forEach((cat, idx) => {
    const px = sx(idx);
    const py = sy(cat.value);
    points.push({ x: px, y: py });

    gridSvg.push(
      `<line x1="${px.toFixed(1)}" y1="${height - padBottom}" x2="${px.toFixed(1)}" y2="${height - padBottom + 4}" stroke="#0F172A" stroke-width="1.0" />
      <text x="${px.toFixed(1)}" y="${height - padBottom + 14}" text-anchor="middle" font-size="7.5" font-weight="700" fill="#334155">${cat.label}</text>`
    );
  });

  // رسم المضلع أو المنحنى
  const isPolygon = spec.chartType === "frequency_polygon";
  const strokeColor = "#2563EB";

  let pathD = "";
  if (isPolygon) {
    pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  } else {
    // منحنى ناعم باستخدام Bézier curves
    pathD = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx1 = p0.x + (p1.x - p0.x) / 2;
      const cy1 = p0.y;
      const cx2 = p0.x + (p1.x - p0.x) / 2;
      const cy2 = p1.y;
      pathD += ` C ${cx1.toFixed(1)} ${cy1.toFixed(1)}, ${cx2.toFixed(1)} ${cy2.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
    }
  }

  const curveSvg = `
    <path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="2.0" stroke-linecap="round" stroke-linejoin="round" />
  `;

  // نقاط المراكز
  const pointsSvg = points
    .map(
      (p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="#2563EB" stroke="#FFFFFF" stroke-width="1.2" />`
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-auto select-none">${gridSvg.join("")}${curveSvg}${pointsSvg}</svg>`;
}
