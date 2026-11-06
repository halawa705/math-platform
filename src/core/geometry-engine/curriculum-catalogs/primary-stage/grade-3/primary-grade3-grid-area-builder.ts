/**
 * @file primary-grade3-grid-area-builder.ts
 * @description منشئ أشكال المحيط والمساحة على الشبكة التربيعية للصف الثالث الابتدائي (المرحلة 5.2):
 * يرسم شبكة مربعات منتظمة وشكلاً مظللاً لحساب عدد الوحدات المربعة والمحيط.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (< 150 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "@/core/ssot/geometry-archetype-ssot";
import { formatNumeralsByModeSSOT, type MathNotationLanguage, type NumeralDisplayMode } from "@/core/ssot/numeral-and-unit-ssot";

export const MODULE_ID_PRIMARY_GRADE3_GRID_AREA_BUILDER =
  "primary_grade3_grid_area_builder" as const;

export interface GridShapeSpec {
  readonly gridCols: number;
  readonly gridRows: number;
  readonly shapeWidth: number;
  readonly shapeHeight: number;
  readonly titleArabic?: string;
}

export function buildGrade3GridAreaSvgMarkup(
  spec: GridShapeSpec,
  numeralMode: NumeralDisplayMode = "western"
): string {
  const width = 240;
  const height = 180;
  const cellSize = 22;
  const padTop = 32;

  const cols = Math.max(3, Math.min(8, spec.gridCols));
  const rows = Math.max(3, Math.min(6, spec.gridRows));
  const gridW = cols * cellSize;
  const gridH = rows * cellSize;

  const startX = (width - gridW) / 2;
  const startY = padTop + (height - padTop - gridH) / 2;

  const sW = Math.max(1, Math.min(cols - 1, spec.shapeWidth));
  const sH = Math.max(1, Math.min(rows - 1, spec.shapeHeight));

  const svgParts: string[] = [];
  const title = spec.titleArabic ?? "أوجد محيط ومساحة الشكل على الشبكة التربيعية";

  svgParts.push(
    `<text x="${(width / 2).toFixed(1)}" y="20" text-anchor="middle" font-size="10" font-weight="900" fill="#0F172A">${title}</text>`
  );

  // خطوط الشبكة الرمادية
  for (let c = 0; c <= cols; c++) {
    const x = startX + c * cellSize;
    svgParts.push(
      `<line x1="${x.toFixed(1)}" y1="${startY.toFixed(1)}" x2="${x.toFixed(1)}" y2="${(startY + gridH).toFixed(1)}" stroke="#E2E8F0" stroke-width="0.8" />`
    );
  }
  for (let r = 0; r <= rows; r++) {
    const y = startY + r * cellSize;
    svgParts.push(
      `<line x1="${startX.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(startX + gridW).toFixed(1)}" y2="${y.toFixed(1)}" stroke="#E2E8F0" stroke-width="0.8" />`
    );
  }

  // الشكل المظلل (مستطيل بمنتصف الشبكة)
  const shapeX = startX + Math.floor((cols - sW) / 2) * cellSize;
  const shapeY = startY + Math.floor((rows - sH) / 2) * cellSize;

  svgParts.push(
    `<rect x="${shapeX.toFixed(1)}" y="${shapeY.toFixed(1)}" width="${(sW * cellSize).toFixed(1)}" height="${(sH * cellSize).toFixed(1)}" fill="#3B82F6" opacity="0.35" stroke="#1D4ED8" stroke-width="1.8" />`
  );

  // إطار الشبكة الخارجي
  svgParts.push(
    `<rect x="${startX.toFixed(1)}" y="${startY.toFixed(1)}" width="${gridW.toFixed(1)}" height="${gridH.toFixed(1)}" fill="none" stroke="#94A3B8" stroke-width="1.2" />`
  );

  // تسمية أبعاد الشكل المظلل بوحدات الطول
  svgParts.push(
    `<text x="${(shapeX + (sW * cellSize) / 2).toFixed(1)}" y="${(shapeY - 4).toFixed(1)}" text-anchor="middle" font-size="8" font-weight="800" fill="#1D4ED8">${formatNumeralsByModeSSOT(sW, numeralMode)} وحدات</text>`
  );
  svgParts.push(
    `<text x="${(shapeX + sW * cellSize + 6).toFixed(1)}" y="${(shapeY + (sH * cellSize) / 2 + 3).toFixed(1)}" text-anchor="start" font-size="8" font-weight="800" fill="#1D4ED8">${formatNumeralsByModeSSOT(sH, numeralMode)} وحدات</text>`
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-auto select-none">${svgParts.join("")}</svg>`;
}

export function buildGrade3GridAreaFigure(
  spec: GridShapeSpec,
  figureId = "prim3_grid_fig",
  notationLanguage: MathNotationLanguage = "arabic"
): CanonicalGeometryFigureIR {
  const svg = buildGrade3GridAreaSvgMarkup(spec, "western");
  return {
    figureId,
    familyId: "primary_visual_models_family",
    branchId: "primary_bar_model",
    titleArabic: spec.titleArabic ?? "محيط ومساحة الشكل على الشبكة التربيعية",
    notationLanguage,
    vertices: [],
    segments: [],
    angles: [],
    rawSvgMarkup: svg,
  };
}
