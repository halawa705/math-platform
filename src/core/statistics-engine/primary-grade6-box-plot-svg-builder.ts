/**
 * @file primary-grade6-box-plot-svg-builder.ts
 * @description مصير متجهي نقي (Pure Vector SVG Builder) لمخطط الصندوق والطرفين (Box-and-Whisker Plot):
 * يبني خط أعداد متدرج، مستطيل الصندوق للربيعيات (Q1 إلى Q3)، خط الوسيط (Median)،
 * والشاربين للحد الأدنى (Minimum) والحد الأقصى (Maximum) وفق معايير كتاب الوزارة وسلاح التلميذ 6ب.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 190 سطراً).
 */

import type { StatisticalBoxPlotSpec } from "../ssot/statistics-archetype-ssot";
import {
  formatNumeralsByModeSSOT,
  type NumeralDisplayMode,
} from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_PRIMARY_GRADE6_BOX_PLOT_SVG_BUILDER =
  "primary_grade6_box_plot_svg_builder" as const;

export interface BoxPlotSvgOptions {
  readonly widthPx?: number;
  readonly heightPx?: number;
  readonly numeralMode?: NumeralDisplayMode;
  readonly strokeColorHex?: string;
  readonly accentColorHex?: string;
  readonly showProjectionDashes?: boolean;
}

export function buildGrade6BoxPlotSvgMarkup(
  spec: StatisticalBoxPlotSpec,
  options: BoxPlotSvgOptions = {}
): string {
  const width = options.widthPx ?? 340;
  const height = options.heightPx ?? 180;
  const stroke = options.strokeColorHex ?? "#0F172A";
  const accent = options.accentColorHex ?? "#0D9488";
  const numMode = options.numeralMode ?? "western";
  const showDashes = options.showProjectionDashes ?? true;

  const padLeft = 32;
  const padRight = 32;
  const padBottom = 42;
  const axisY = height - padBottom;
  const plotWidth = width - padLeft - padRight;

  const minA = spec.axisMin;
  const maxA = spec.axisMax;
  const span = Math.max(maxA - minA, 1);
  const step = spec.axisStep > 0 ? spec.axisStep : 1;

  const toX = (val: number): number => {
    return padLeft + ((val - minA) / span) * plotWidth;
  };

  const lineStartX = padLeft - 14;
  const lineEndX = width - padRight + 14;

  const arrows = `
    <polygon points="${lineStartX},${axisY} ${lineStartX + 8},${axisY - 3.5} ${lineStartX + 8},${axisY + 3.5}" fill="${stroke}" />
    <polygon points="${lineEndX},${axisY} ${lineEndX - 8},${axisY - 3.5} ${lineEndX - 8},${axisY + 3.5}" fill="${stroke}" />
  `;

  const ticksAndLabels: string[] = [];
  for (let v = minA; v <= maxA + 0.001; v += step) {
    const x = toX(v);
    ticksAndLabels.push(
      `<line x1="${x.toFixed(1)}" y1="${axisY - 4.5}" x2="${x.toFixed(1)}" y2="${axisY + 4.5}" stroke="${stroke}" stroke-width="1.2" />`
    );
    const labelText = formatNumeralsByModeSSOT(Math.round(v * 10) / 10, numMode);
    ticksAndLabels.push(
      `<text data-furniture="1" x="${x.toFixed(1)}" y="${axisY + 16}" text-anchor="middle" font-size="8.5" font-weight="700" font-family="system-ui, sans-serif" fill="${stroke}">${labelText}</text>`
    );
  }

  // أبعاد الصندوق
  const boxTop = 44;
  const boxHeight = 38;
  const boxCenterY = boxTop + boxHeight / 2;

  const xMin = toX(spec.minVal);
  const xQ1 = toX(spec.q1Val);
  const xMed = toX(spec.medianVal);
  const xQ3 = toX(spec.q3Val);
  const xMax = toX(spec.maxVal);

  const boxW = Math.max(xQ3 - xQ1, 2);

  // خطوط إسقاط خفيفة نحو خط الأعداد لتسهيل القراءة الصريحة للتلميذ
  const projectionLines: string[] = [];
  if (showDashes) {
    const keyVals = [xMin, xQ1, xMed, xQ3, xMax];
    for (const kx of keyVals) {
      projectionLines.push(
        `<line x1="${kx.toFixed(1)}" y1="${boxCenterY + 18}" x2="${kx.toFixed(1)}" y2="${axisY - 5}" stroke="#94A3B8" stroke-width="0.9" stroke-dasharray="2,3" />`
      );
    }
  }

  // الشارب الأيسر والأيمن
  const capHalfH = 8;
  const whiskers = `
    <!-- الشارب الأيسر (من الحد الأدنى إلى الربع الأول) -->
    <line x1="${xMin.toFixed(1)}" y1="${boxCenterY}" x2="${xQ1.toFixed(1)}" y2="${boxCenterY}" stroke="${stroke}" stroke-width="1.6" />
    <line x1="${xMin.toFixed(1)}" y1="${boxCenterY - capHalfH}" x2="${xMin.toFixed(1)}" y2="${boxCenterY + capHalfH}" stroke="${stroke}" stroke-width="1.8" />
    <!-- الشارب الأيمن (من الربع الثالث إلى الحد الأقصى) -->
    <line x1="${xQ3.toFixed(1)}" y1="${boxCenterY}" x2="${xMax.toFixed(1)}" y2="${boxCenterY}" stroke="${stroke}" stroke-width="1.6" />
    <line x1="${xMax.toFixed(1)}" y1="${boxCenterY - capHalfH}" x2="${xMax.toFixed(1)}" y2="${boxCenterY + capHalfH}" stroke="${stroke}" stroke-width="1.8" />
  `;

  // مستطيل الصندوق وخط الوسيط
  const summaryAttr = `data-given-values="${spec.minVal},${spec.q1Val},${spec.medianVal},${spec.q3Val},${spec.maxVal}"`;
  const boxRect = `
    <rect ${summaryAttr} x="${xQ1.toFixed(1)}" y="${boxTop}" width="${boxW.toFixed(1)}" height="${boxHeight}" rx="2" fill="#F8FAFC" stroke="${stroke}" stroke-width="1.8" />
    <!-- خط الوسيط -->
    <line x1="${xMed.toFixed(1)}" y1="${boxTop}" x2="${xMed.toFixed(1)}" y2="${boxTop + boxHeight}" stroke="${stroke}" stroke-width="2" />
  `;

  const titleSvg = spec.titleArabic
    ? `<text x="${(width / 2).toFixed(1)}" y="18" text-anchor="middle" font-size="11" font-weight="800" font-family="system-ui, sans-serif" fill="${stroke}">${spec.titleArabic}</text>`
    : "";

  const xLabelSvg = spec.xLabelArabic
    ? `<text x="${(width / 2).toFixed(1)}" y="${height - 8}" text-anchor="middle" font-size="9.5" font-weight="700" font-family="system-ui, sans-serif" fill="${accent}">${spec.xLabelArabic}</text>`
    : "";

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="background-color: #ffffff;">
  ${titleSvg}
  <!-- خطوط الإسقاط الإرشادية -->
  ${projectionLines.join("\n  ")}
  <!-- الشاربان -->
  ${whiskers}
  <!-- مستطيل الصندوق والوسيط -->
  ${boxRect}
  <!-- خط الأعداد الرئيسي -->
  <line x1="${lineStartX}" y1="${axisY}" x2="${lineEndX}" y2="${axisY}" stroke="${stroke}" stroke-width="1.6" />
  ${arrows}
  <!-- التدريجات والأرقام -->
  ${ticksAndLabels.join("\n  ")}
  <!-- تسمية المحور الأفقي -->
  ${xLabelSvg}
</svg>`.trim();
}
