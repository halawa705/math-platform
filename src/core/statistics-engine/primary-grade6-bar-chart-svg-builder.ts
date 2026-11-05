/**
 * @file primary-grade6-bar-chart-svg-builder.ts
 * @description مصير متجهي نقي (Pure Vector SVG Builder) للتمثيل البياني بالأعمدة المنفصلة (Bar Chart):
 * يبني أعمدة متباعدة بمسافات منتظمة تعبر عن فئات نوعية أو عددية منفصلة مع ألوان مميزة
 * وتسميات المحاور والتكرارات وفق معايير كتاب الوزارة وسلاح التلميذ 6ب.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import type { StatisticalBarChartSpec } from "../ssot/statistics-archetype-ssot";
import {
  formatNumeralsByModeSSOT,
  type NumeralDisplayMode,
} from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_PRIMARY_GRADE6_BAR_CHART_SVG_BUILDER =
  "primary_grade6_bar_chart_svg_builder" as const;

export interface BarChartSvgOptions {
  readonly widthPx?: number;
  readonly heightPx?: number;
  readonly numeralMode?: NumeralDisplayMode;
  readonly strokeColorHex?: string;
}

const DEFAULT_BAR_COLORS = [
  "#10B981", // أخضر زمردي
  "#3B82F6", // أزرق سماوي
  "#F43F5E", // وردي/أحمر
  "#F59E0B", // برتقالي/كهرماني
  "#8B5CF6", // بنفسجي
  "#06B6D4", // تركواز
];

export function buildGrade6BarChartSvgMarkup(
  spec: StatisticalBarChartSpec,
  options: BarChartSvgOptions = {}
): string {
  const width = options.widthPx ?? 340;
  const height = options.heightPx ?? 200;
  const stroke = options.strokeColorHex ?? "#0F172A";
  const numMode = options.numeralMode ?? "western";

  const padLeft = 44;
  const padRight = 20;
  const padTop = 32;
  const padBottom = 38;

  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;
  const baselineY = height - padBottom;

  const maxDataFreq = Math.max(...spec.bars.map((b) => b.frequency), 1);
  const yMax = spec.yMax ?? (maxDataFreq <= 6 ? 6 : maxDataFreq <= 10 ? 10 : Math.ceil(maxDataFreq / 2) * 2);
  const yStep = spec.yStep ?? (yMax <= 6 ? 1 : 2);

  // خطوط الشبكة الأفقية وتدريجات المحور الرأسي
  const gridAndYTicks: string[] = [];
  for (let yVal = 0; yVal <= yMax; yVal += yStep) {
    const yPx = baselineY - (yVal / yMax) * plotHeight;
    gridAndYTicks.push(
      `<line x1="${padLeft}" y1="${yPx.toFixed(1)}" x2="${(width - padRight).toFixed(1)}" y2="${yPx.toFixed(1)}" stroke="#E2E8F0" stroke-width="0.8" />`
    );
    const label = formatNumeralsByModeSSOT(yVal, numMode);
    gridAndYTicks.push(
      `<text x="${(padLeft - 6).toFixed(1)}" y="${(yPx + 3).toFixed(1)}" text-anchor="end" font-size="8.5" font-weight="700" font-family="system-ui, sans-serif" fill="#64748B">${label}</text>`
    );
  }

  // الأعمدة المتباعدة (Separated bars with gaps)
  const n = Math.max(spec.bars.length, 1);
  const slotWidth = plotWidth / n;
  const barWidth = Math.min(slotWidth * 0.62, 38);
  const barOffset = (slotWidth - barWidth) / 2;

  const barsSvg: string[] = [];
  const xLabelsSvg: string[] = [];

  spec.bars.forEach((bar, idx) => {
    const x = padLeft + idx * slotWidth + barOffset;
    const barH = (bar.frequency / yMax) * plotHeight;
    const y = baselineY - barH;
    const color = bar.barColorHex || DEFAULT_BAR_COLORS[idx % DEFAULT_BAR_COLORS.length];

    if (bar.frequency > 0) {
      barsSvg.push(
        `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barH.toFixed(1)}" fill="${color}" stroke="${stroke}" stroke-width="1.2" rx="1.5" opacity="0.9" />`
      );
    }

    // تسمية الفئة أسفل العمود (مع التفاف بسيط إن كانت كلمتين)
    const midX = x + barWidth / 2;
    const words = bar.categoryLabel.trim().split(/\s+/);
    if (words.length >= 2 && bar.categoryLabel.length > 7) {
      const line1 = words.slice(0, Math.ceil(words.length / 2)).join(" ");
      const line2 = words.slice(Math.ceil(words.length / 2)).join(" ");
      xLabelsSvg.push(
        `<text x="${midX.toFixed(1)}" y="${(baselineY + 11).toFixed(1)}" text-anchor="middle" font-size="7" font-weight="700" font-family="system-ui, sans-serif" fill="${stroke}">${line1}</text>` +
        `<text x="${midX.toFixed(1)}" y="${(baselineY + 19).toFixed(1)}" text-anchor="middle" font-size="7" font-weight="700" font-family="system-ui, sans-serif" fill="${stroke}">${line2}</text>`
      );
    } else {
      xLabelsSvg.push(
        `<text x="${midX.toFixed(1)}" y="${(baselineY + 14).toFixed(1)}" text-anchor="middle" font-size="7.5" font-weight="700" font-family="system-ui, sans-serif" fill="${stroke}">${bar.categoryLabel}</text>`
      );
    }
  });

  const titleSvg = spec.titleArabic
    ? `<text x="${(width / 2).toFixed(1)}" y="17" text-anchor="middle" font-size="11" font-weight="800" font-family="system-ui, sans-serif" fill="${stroke}">${spec.titleArabic}</text>`
    : "";

  const xLabelSvg = spec.xLabelArabic
    ? `<text x="${(width / 2).toFixed(1)}" y="${height - 4}" text-anchor="middle" font-size="9" font-weight="700" font-family="system-ui, sans-serif" fill="#0D9488">${spec.xLabelArabic}</text>`
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
  <!-- الأعمدة البيانية المتباعدة -->
  ${barsSvg.join("\n  ")}
  <!-- المحور الأفقي والرأسي -->
  <line x1="${padLeft}" y1="${padTop - 4}" x2="${padLeft}" y2="${baselineY}" stroke="${stroke}" stroke-width="1.4" />
  <line x1="${padLeft}" y1="${baselineY}" x2="${(width - padRight).toFixed(1)}" y2="${baselineY}" stroke="${stroke}" stroke-width="1.4" />
  <!-- تسميات الفئات والمحور الأفقي -->
  ${xLabelsSvg.join("\n  ")}
  ${xLabelSvg}
</svg>`.trim();
}
