/**
 * @file pie-chart-svg-builder.ts
 * @description مصيّر القطاعات الدائرية كمتجه SVG حتمي للطباعة (المرحلة 4.4):
 * يحسب زوايا القطاعات بدقة 360° ويرسم أقواس الدائرة مع ملصقات النسب المئوية ودليل الألوان.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (< 150 سطراً).
 */

import type { ParsedStatisticsSpec } from "./statistics-tag-parser";
import { formatNumeralsByModeSSOT, type NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_PIE_CHART_SVG_BUILDER = "pie_chart_svg_builder" as const;

const SLICE_COLORS = [
  "#2563EB", // أزرق
  "#059669", // زمردي
  "#D97706", // كهرماني
  "#7C3AED", // بنفسجي
  "#E11D48", // ياقوتي
  "#0891B2", // سماوي
  "#475569", // أردوازي
];

export function buildPieChartSvgMarkup(
  spec: ParsedStatisticsSpec,
  numeralMode: NumeralDisplayMode = "western"
): string {
  const width = 280;
  const height = 200;
  const cx = 95;
  const cy = 105;
  const r = 70;

  const totalSum = spec.categories.reduce((acc, c) => acc + c.value, 0) || 1;
  const slicesSvg: string[] = [];
  const legendSvg: string[] = [];

  let currentAngle = -Math.PI / 2; // البدء من أعلى الدائرة (12:00)

  // عنوان الرسم
  slicesSvg.push(
    `<text x="${(width / 2).toFixed(1)}" y="20" text-anchor="middle" font-size="11" font-weight="900" fill="#0F172A">${spec.titleArabic}</text>`
  );

  spec.categories.forEach((cat, idx) => {
    const fraction = cat.percentage !== undefined
      ? cat.percentage / 100
      : cat.angleDeg !== undefined
      ? cat.angleDeg / 360
      : cat.value / totalSum;

    const angleSweep = fraction * 2 * Math.PI;
    const endAngle = currentAngle + angleSweep;

    const x1 = cx + r * Math.cos(currentAngle);
    const y1 = cy + r * Math.sin(currentAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);

    const largeArc = angleSweep > Math.PI ? 1 : 0;
    const color = SLICE_COLORS[idx % SLICE_COLORS.length];

    // قوس القطاع الدائري
    const pathD = `M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
    slicesSvg.push(
      `<path d="${pathD}" fill="${color}" stroke="#FFFFFF" stroke-width="1.2" opacity="0.9" />`
    );

    // ملصق النسبة داخل أو بجوار القطاع إن كان كبيراً بما فيه الكفاية
    if (fraction >= 0.08) {
      const midA = currentAngle + angleSweep / 2;
      const lx = cx + (r * 0.65) * Math.cos(midA);
      const ly = cy + (r * 0.65) * Math.sin(midA);
      const pctText = cat.percentage !== undefined
        ? `${formatNumeralsByModeSSOT(cat.percentage, numeralMode)}٪`
        : `${formatNumeralsByModeSSOT(Math.round(fraction * 100), numeralMode)}٪`;

      slicesSvg.push(
        `<text x="${lx.toFixed(1)}" y="${(ly + 3).toFixed(1)}" text-anchor="middle" font-size="8" font-weight="900" fill="#FFFFFF">${pctText}</text>`
      );
    }

    // عنصر في دليل الألوان (Legend) على الجانب الأيمن
    const legY = 45 + idx * 22;
    legendSvg.push(
      `<rect x="180" y="${legY}" width="10" height="10" rx="2" fill="${color}" />
      <text x="195" y="${legY + 8}" font-size="8" font-weight="700" fill="#1E293B">${cat.label} (${formatNumeralsByModeSSOT(cat.value, numeralMode)})</text>`
    );

    currentAngle = endAngle;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-auto select-none">${slicesSvg.join("")}${legendSvg.join("")}</svg>`;
}
