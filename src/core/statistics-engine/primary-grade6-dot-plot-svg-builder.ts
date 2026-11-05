/**
 * @file primary-grade6-dot-plot-svg-builder.ts
 * @description مصير متجهي نقي (Pure Vector SVG Builder) لمخطط التمثيل بالنقاط (Dot Plot):
 * ينشئ خط أعداد متدرج بنقاط مجمعة رأسياً مع إمكانية تمييز القيم المتطرفة (Outliers)
 * وعناوين المحاور بالعربية وفق معايير كتاب الوزارة وسلاح التلميذ للصف السادس الابتدائي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import type { StatisticalDotPlotSpec } from "../ssot/statistics-archetype-ssot";
import {
  formatNumeralsByModeSSOT,
  type NumeralDisplayMode,
} from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_PRIMARY_GRADE6_DOT_PLOT_SVG_BUILDER =
  "primary_grade6_dot_plot_svg_builder" as const;

export interface DotPlotSvgOptions {
  readonly widthPx?: number;
  readonly heightPx?: number;
  readonly numeralMode?: NumeralDisplayMode;
  readonly strokeColorHex?: string;
  readonly accentColorHex?: string;
}

export function buildGrade6DotPlotSvgMarkup(
  spec: StatisticalDotPlotSpec,
  options: DotPlotSvgOptions = {}
): string {
  const width = options.widthPx ?? 340;
  const height = options.heightPx ?? 180;
  const stroke = options.strokeColorHex ?? "#0F172A";
  const accent = options.accentColorHex ?? "#0D9488";
  const numMode = options.numeralMode ?? "western";

  const padLeft = 32;
  const padRight = 32;
  const padBottom = 42;
  const axisY = height - padBottom;
  const plotWidth = width - padLeft - padRight;

  const minV = spec.minVal;
  const maxV = spec.maxVal;
  const span = Math.max(maxV - minV, 1);
  const step = spec.step > 0 ? spec.step : 1;

  const toX = (val: number): number => {
    return padLeft + ((val - minV) / span) * plotWidth;
  };

  const lineStartX = padLeft - 14;
  const lineEndX = width - padRight + 14;

  const arrows = `
    <polygon points="${lineStartX},${axisY} ${lineStartX + 8},${axisY - 3.5} ${lineStartX + 8},${axisY + 3.5}" fill="${stroke}" />
    <polygon points="${lineEndX},${axisY} ${lineEndX - 8},${axisY - 3.5} ${lineEndX - 8},${axisY + 3.5}" fill="${stroke}" />
  `;

  const ticksAndLabels: string[] = [];
  for (let v = minV; v <= maxV + 0.001; v += step) {
    const x = toX(v);
    ticksAndLabels.push(
      `<line x1="${x.toFixed(1)}" y1="${axisY - 5}" x2="${x.toFixed(1)}" y2="${axisY + 5}" stroke="${stroke}" stroke-width="1.3" />`
    );
    const labelText = formatNumeralsByModeSSOT(Math.round(v * 10) / 10, numMode);
    ticksAndLabels.push(
      `<text x="${x.toFixed(1)}" y="${axisY + 16}" text-anchor="middle" font-size="8.5" font-weight="700" font-family="system-ui, sans-serif" fill="${stroke}">${labelText}</text>`
    );
  }

  const dotElements: string[] = [];
  const dotRadius = 3.6;
  const dotSpacing = 8.5;

  for (const pt of spec.points) {
    const x = toX(pt.value);
    const count = Math.max(0, pt.count);
    const isOutlier = Boolean(pt.isOutlier);

    for (let i = 0; i < count; i++) {
      const y = axisY - 7 - i * dotSpacing;
      const fillCol = isOutlier ? "#DC2626" : stroke;
      dotElements.push(
        `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${dotRadius}" fill="${fillCol}" />`
      );
    }
  }

  const titleSvg = spec.titleArabic
    ? `<text x="${(width / 2).toFixed(1)}" y="18" text-anchor="middle" font-size="11" font-weight="800" font-family="system-ui, sans-serif" fill="${stroke}">${spec.titleArabic}</text>`
    : "";

  const xLabelSvg = spec.xLabelArabic
    ? `<text x="${(width / 2).toFixed(1)}" y="${height - 8}" text-anchor="middle" font-size="9.5" font-weight="700" font-family="system-ui, sans-serif" fill="${accent}">${spec.xLabelArabic}</text>`
    : "";

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="background-color: #ffffff;">
  ${titleSvg}
  <!-- خط الأعداد الرئيسي -->
  <line x1="${lineStartX}" y1="${axisY}" x2="${lineEndX}" y2="${axisY}" stroke="${stroke}" stroke-width="1.6" />
  ${arrows}
  <!-- التدريجات والأرقام -->
  ${ticksAndLabels.join("\n  ")}
  <!-- نقاط التكرار -->
  ${dotElements.join("\n  ")}
  <!-- تسمية المحور الأفقي -->
  ${xLabelSvg}
</svg>`.trim();
}
