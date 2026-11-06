/**
 * @file frequency-table-svg-builder.ts
 * @description مصيّر جدول التوزيع التكراري كمتجه SVG ناصع للطباعة (المرحلة 4.3):
 * ينشئ جدولاً هندسياً مصفوفاً بخطوط منتظمة: صف المجموعات وصف التكرارات وعمود المجموع الكلي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (< 150 سطراً).
 */

import type { ParsedStatisticsSpec } from "./statistics-tag-parser";
import { formatNumeralsByModeSSOT, type NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_FREQUENCY_TABLE_SVG_BUILDER =
  "frequency_table_svg_builder" as const;

export function buildFrequencyTableSvgMarkup(
  spec: ParsedStatisticsSpec,
  numeralMode: NumeralDisplayMode = "western"
): string {
  const cats = spec.categories;
  const colCount = cats.length + 2; // عمود العنوان + الأعمدة + عمود المجموع
  const colWidth = Math.max(38, Math.min(55, Math.floor(280 / colCount)));
  const totalWidth = colWidth * colCount + 20;
  const headerHeight = 26;
  const rowHeight = 24;
  const totalHeight = headerHeight + rowHeight * 2 + 30;

  const totalSum = cats.reduce((acc, c) => acc + c.value, 0);

  const startX = 10;
  const startY = 32;

  const cellsSvg: string[] = [];

  // ترويسة الجدول
  cellsSvg.push(
    `<text x="${(totalWidth / 2).toFixed(1)}" y="20" text-anchor="middle" font-size="11" font-weight="900" fill="#0F172A">${spec.titleArabic}</text>`
  );

  // إطار الجدول الخارجي
  cellsSvg.push(
    `<rect x="${startX}" y="${startY}" width="${(colWidth * colCount).toFixed(1)}" height="${(rowHeight * 2).toFixed(1)}" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.2" rx="3" />`
  );

  // خط أفقي فاصل بين صفي المجموعات والتكرارات
  const midY = startY + rowHeight;
  cellsSvg.push(
    `<line x1="${startX}" y1="${midY}" x2="${startX + colWidth * colCount}" y2="${midY}" stroke="#0F172A" stroke-width="1.0" />`
  );

  // عناوين الصفوف (العمود الأول الأيمن بالاتجاه العربي RTL)
  // سنرتب من اليمين إلى اليسار
  for (let c = 0; c < colCount; c++) {
    const curX = startX + (colCount - 1 - c) * colWidth;
    // خط عمودي فاصل بين الأعمدة
    if (c > 0) {
      cellsSvg.push(
        `<line x1="${(curX + colWidth).toFixed(1)}" y1="${startY}" x2="${(curX + colWidth).toFixed(1)}" y2="${startY + rowHeight * 2}" stroke="#CBD5E1" stroke-width="0.8" />`
      );
    }

    const textX = (curX + colWidth / 2).toFixed(1);

    if (c === 0) {
      // العمود الأول: العناوين
      cellsSvg.push(
        `<rect x="${curX}" y="${startY}" width="${colWidth}" height="${rowHeight * 2}" fill="#F8FAFC" opacity="0.9" />`
      );
      cellsSvg.push(
        `<text x="${textX}" y="${startY + 16}" text-anchor="middle" font-size="9" font-weight="900" fill="#1E293B">المجموعات</text>`
      );
      cellsSvg.push(
        `<text x="${textX}" y="${startY + rowHeight + 16}" text-anchor="middle" font-size="9" font-weight="900" fill="#1E293B">التكرار</text>`
      );
    } else if (c === colCount - 1) {
      // العمود الأخير: المجموع
      cellsSvg.push(
        `<rect x="${curX}" y="${startY}" width="${colWidth}" height="${rowHeight * 2}" fill="#F1F5F9" opacity="0.9" />`
      );
      cellsSvg.push(
        `<text x="${textX}" y="${startY + 16}" text-anchor="middle" font-size="9" font-weight="900" fill="#0F172A">المجموع</text>`
      );
      cellsSvg.push(
        `<text x="${textX}" y="${startY + rowHeight + 16}" text-anchor="middle" font-size="9" font-weight="900" fill="#2563EB">${formatNumeralsByModeSSOT(totalSum, numeralMode)}</text>`
      );
    } else {
      // أعمدة الفئات
      const item = cats[c - 1];
      cellsSvg.push(
        `<text x="${textX}" y="${startY + 16}" text-anchor="middle" font-size="8.5" font-weight="700" fill="#334155">${item.label}</text>`
      );
      cellsSvg.push(
        `<text x="${textX}" y="${startY + rowHeight + 16}" text-anchor="middle" font-size="8.5" font-weight="700" fill="#0F172A">${formatNumeralsByModeSSOT(item.value, numeralMode)}</text>`
      );
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" class="w-full h-auto select-none">${cellsSvg.join("")}</svg>`;
}
