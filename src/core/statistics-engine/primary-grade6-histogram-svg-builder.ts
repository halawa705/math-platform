/**
 * @file primary-grade6-histogram-svg-builder.ts
 * @description مصير متجهي نقي (Pure Vector SVG Builder) للمدرج التكراري (Histogram):
 * يبني أعمدة متلاصقة تماماً (Contiguous Bars) تعبر عن فترات متصلة وشبكة خطوط أفقية
 * مع تسميات الفترات والتكرارات وفق معايير كتاب الوزارة وسلاح التلميذ 6ب.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import type { StatisticalHistogramSpec } from "../ssot/statistics-archetype-ssot";
import {
  formatNumeralsByModeSSOT,
  type NumeralDisplayMode,
} from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_PRIMARY_GRADE6_HISTOGRAM_SVG_BUILDER =
  "primary_grade6_histogram_svg_builder" as const;

export interface HistogramSvgOptions {
  readonly widthPx?: number;
  readonly heightPx?: number;
  readonly numeralMode?: NumeralDisplayMode;
  readonly strokeColorHex?: string;
  readonly barFillHex?: string;
  readonly barStrokeHex?: string;
}

export function buildGrade6HistogramSvgMarkup(
  spec: StatisticalHistogramSpec,
  options: HistogramSvgOptions = {}
): string {
  const width = options.widthPx ?? 340;
  const height = options.heightPx ?? 200;
  const stroke = options.strokeColorHex ?? "#0F172A";
  const barFill = options.barFillHex ?? "#DDD6FE";
  const barStroke = options.barStrokeHex ?? "#6D28D9";
  const numMode = options.numeralMode ?? "western";

  const padLeft = 44;
  const padRight = 20;
  const padTop = 32;
  const padBottom = 38;

  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;
  const baselineY = height - padBottom;

  const maxDataFreq = Math.max(...spec.intervals.map((i) => i.frequency), 1);
  const yMax = spec.yMax ?? (maxDataFreq <= 6 ? 6 : maxDataFreq <= 10 ? 10 : Math.ceil(maxDataFreq / 2) * 2);
  const yStep = spec.yStep ?? (yMax <= 6 ? 1 : 2);

  // خطوط الشبكة الأفقية وتدريجات المحور الرأسي (التكرار)
  const gridAndYTicks: string[] = [];
  for (let yVal = 0; yVal <= yMax; yVal += yStep) {
    const yPx = baselineY - (yVal / yMax) * plotHeight;
    // خط شبكة أفقي خفيف
    gridAndYTicks.push(
      `<line x1="${padLeft}" y1="${yPx.toFixed(1)}" x2="${(width - padRight).toFixed(1)}" y2="${yPx.toFixed(1)}" stroke="#E2E8F0" stroke-width="0.8" />`
    );
    // رقم التدريج الرأسي
    const label = formatNumeralsByModeSSOT(yVal, numMode);
    gridAndYTicks.push(
      `<text x="${(padLeft - 6).toFixed(1)}" y="${(yPx + 3).toFixed(1)}" text-anchor="end" font-size="8.5" font-weight="700" font-family="system-ui, sans-serif" fill="#64748B">${label}</text>`
    );
  }

  // الأعمدة المتلاصقة للفترات (Zero gap)
  const n = Math.max(spec.intervals.length, 1);
  const barWidth = plotWidth / n;

  const barsSvg: string[] = [];
  const xLabelsSvg: string[] = [];

  spec.intervals.forEach((interval, idx) => {
    const x = padLeft + idx * barWidth;
    const barH = (interval.frequency / yMax) * plotHeight;
    const y = baselineY - barH;

    if (interval.frequency > 0) {
      barsSvg.push(
        `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barH.toFixed(1)}" fill="${barFill}" stroke="${barStroke}" stroke-width="1.3" opacity="0.9" />`
      );
    }

    // تسمية الفترة أسفل العمود
    const midX = x + barWidth / 2;
    const cleanLabel = interval.intervalLabel.replace(/\s+/g, "");
    xLabelsSvg.push(
      `<text x="${midX.toFixed(1)}" y="${(baselineY + 14).toFixed(1)}" text-anchor="middle" font-size="8" font-weight="700" font-family="system-ui, sans-serif" fill="${stroke}">${cleanLabel}</text>`
    );
  });

  const titleSvg = spec.titleArabic
    ? `<text x="${(width / 2).toFixed(1)}" y="17" text-anchor="middle" font-size="11" font-weight="800" font-family="system-ui, sans-serif" fill="${stroke}">${spec.titleArabic}</text>`
    : "";

  const xLabelSvg = spec.xLabelArabic
    ? `<text x="${(width / 2).toFixed(1)}" y="${height - 6}" text-anchor="middle" font-size="9" font-weight="700" font-family="system-ui, sans-serif" fill="#0D9488">${spec.xLabelArabic}</text>`
    : "";

  const yLabelSvg = spec.yLabelArabic
    ? `<text x="${padLeft}" y="${padTop - 8}" text-anchor="start" font-size="8.5" font-weight="700" font-family="system-ui, sans-serif" fill="#0D9488">${spec.yLabelArabic}</text>`
    : "";

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="background-color: #ffffff;">
  ${titleSvg}
  ${yLabelSvg}
  <!-- خطوط الشبكة وتدريجات المحور الرأسي -->
  ${gridAndYTicks.join("\n  ")}
  <!-- الأعمدة المتلاصقة للمدرج التكراري -->
  ${barsSvg.join("\n  ")}
  <!-- المحور الأفقي والرأسي -->
  <line x1="${padLeft}" y1="${padTop - 4}" x2="${padLeft}" y2="${baselineY}" stroke="${stroke}" stroke-width="1.4" />
  <line x1="${padLeft}" y1="${baselineY}" x2="${(width - padRight).toFixed(1)}" y2="${baselineY}" stroke="${stroke}" stroke-width="1.4" />
  <!-- تسميات الفترات والمحور الأفقي -->
  ${xLabelsSvg.join("\n  ")}
  ${xLabelSvg}
</svg>`.trim();
}
