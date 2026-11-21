/**
 * @file double-bar-chart-svg-builder.ts
 * @description مصيّر متجهي نقي للتمثيل البياني بالأعمدة المزدوجة (Double Bar Chart)
 * مع مفتاح ألوان للسلسلتين وتدريجات `data-furniture="1"` ومطابقة كاملة لمعايير الابتدائي والإعدادي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 160 سطراً).
 */

import type { StatisticalDoubleBarChartSpec } from "../ssot/statistics-archetype-ssot";
import {
  formatNumeralsByModeSSOT,
  type NumeralDisplayMode,
} from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_DOUBLE_BAR_CHART_SVG_BUILDER =
  "double_bar_chart_svg_builder" as const;

export interface DoubleBarChartSvgOptions {
  readonly widthPx?: number;
  readonly heightPx?: number;
  readonly numeralMode?: NumeralDisplayMode;
  readonly strokeColorHex?: string;
}

export function buildDoubleBarChartSvgMarkup(
  spec: StatisticalDoubleBarChartSpec,
  options: DoubleBarChartSvgOptions = {}
): string {
  const width = options.widthPx ?? 350;
  const height = options.heightPx ?? 215;
  const stroke = options.strokeColorHex ?? "#0F172A";
  const numMode = options.numeralMode ?? "western";

  const padLeft = 44;
  const padRight = 20;
  const padTop = 44;
  const padBottom = 38;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const baseY = height - padBottom;

  const maxVal = Math.max(...spec.bars.flatMap((b) => [b.series1Value, b.series2Value]), 1);
  const yMax = spec.yMax ?? (maxVal <= 6 ? 6 : maxVal <= 10 ? 10 : Math.ceil(maxVal / 2) * 2);
  const yStep = spec.yStep ?? (yMax <= 6 ? 1 : yMax <= 12 ? 2 : Math.ceil(yMax / 5));

  const gridSvg: string[] = [];
  for (let yVal = 0; yVal <= yMax; yVal += yStep) {
    const yPx = baseY - (yVal / yMax) * plotH;
    gridSvg.push(
      `<line x1="${padLeft}" y1="${yPx.toFixed(1)}" x2="${(width - padRight).toFixed(1)}" y2="${yPx.toFixed(1)}" stroke="#E2E8F0" stroke-width="0.8" />`,
      `<text data-furniture="1" x="${(padLeft - 6).toFixed(1)}" y="${(yPx + 3).toFixed(1)}" text-anchor="end" font-size="8" font-weight="700" font-family="system-ui, sans-serif" fill="#64748B">${formatNumeralsByModeSSOT(yVal, numMode)}</text>`
    );
  }

  const n = Math.max(spec.bars.length, 1);
  const slotW = plotW / n;
  const pairW = Math.min(slotW * 0.68, 44);
  const barW = (pairW - 3) / 2;
  const slotOff = (slotW - pairW) / 2;

  const barsSvg: string[] = [];
  const xLabelsSvg: string[] = [];

  spec.bars.forEach((b, idx) => {
    const x1 = padLeft + idx * slotW + slotOff;
    const x2 = x1 + barW + 3;
    const h1 = (b.series1Value / yMax) * plotH;
    const h2 = (b.series2Value / yMax) * plotH;
    const attr1 = spec.omitDataGivenValues ? "" : ` data-given-values="${b.series1Value}"`;
    const attr2 = spec.omitDataGivenValues ? "" : ` data-given-values="${b.series2Value}"`;

    if (b.series1Value > 0) {
      barsSvg.push(
        `<rect${attr1} x="${x1.toFixed(1)}" y="${(baseY - h1).toFixed(1)}" width="${barW.toFixed(1)}" height="${h1.toFixed(1)}" fill="#2563EB" stroke="${stroke}" stroke-width="1" rx="1.5" opacity="0.9" />`
      );
    }
    if (b.series2Value > 0) {
      barsSvg.push(
        `<rect${attr2} x="${x2.toFixed(1)}" y="${(baseY - h2).toFixed(1)}" width="${barW.toFixed(1)}" height="${h2.toFixed(1)}" fill="#10B981" stroke="${stroke}" stroke-width="1" rx="1.5" opacity="0.9" />`
      );
    }
    xLabelsSvg.push(
      `<text x="${(x1 + pairW / 2).toFixed(1)}" y="${(baseY + 14).toFixed(1)}" text-anchor="middle" font-size="7.5" font-weight="700" font-family="system-ui, sans-serif" fill="${stroke}">${b.categoryLabel}</text>`
    );
  });

  const legendSvg =
    `<rect x="${width - 140}" y="24" width="8" height="8" rx="1.5" fill="#2563EB" />` +
    `<text x="${width - 129}" y="31" font-size="7.5" font-weight="700" fill="${stroke}">${spec.series1Label}</text>` +
    `<rect x="${width - 75}" y="24" width="8" height="8" rx="1.5" fill="#10B981" />` +
    `<text x="${width - 64}" y="31" font-size="7.5" font-weight="700" fill="${stroke}">${spec.series2Label}</text>`;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="background-color:#ffffff;">
  <text x="${(width / 2).toFixed(1)}" y="15" text-anchor="middle" font-size="10.5" font-weight="800" font-family="system-ui, sans-serif" fill="${stroke}">${spec.titleArabic}</text>
  ${legendSvg}
  <text x="${padLeft}" y="${padTop - 8}" text-anchor="start" font-size="8" font-weight="700" fill="#0D9488">${spec.yLabelArabic}</text>
  ${gridSvg.join("\n  ")}
  ${barsSvg.join("\n  ")}
  <line x1="${padLeft}" y1="${padTop - 4}" x2="${padLeft}" y2="${baseY}" stroke="${stroke}" stroke-width="1.4" />
  <line x1="${padLeft}" y1="${baseY}" x2="${(width - padRight).toFixed(1)}" y2="${baseY}" stroke="${stroke}" stroke-width="1.4" />
  ${xLabelsSvg.join("\n  ")}
  <text x="${(width / 2).toFixed(1)}" y="${height - 5}" text-anchor="middle" font-size="8.5" font-weight="700" fill="#0D9488">${spec.xLabelArabic}</text>
</svg>`.trim();
}
