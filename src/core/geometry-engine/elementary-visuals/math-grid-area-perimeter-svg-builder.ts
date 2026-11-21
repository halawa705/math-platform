/**
 * @file math-grid-area-perimeter-svg-builder.ts
 * @description منشئ أشكال المحيط والمساحة على الشبكة التربيعية (بالمصفوفات والوحدات المربعة).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 135 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import {
  formatNumeralsByModeSSOT,
  toWesternNumeralsSSOT,
  type MathNotationLanguage,
  type NumeralDisplayMode,
} from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_MATH_GRID_AREA_PERIMETER_SVG_BUILDER =
  "math_grid_area_perimeter_svg_builder" as const;

export interface MathGridAreaSpec {
  readonly gridCols: number;
  readonly gridRows: number;
  readonly shapeWidth: number;
  readonly shapeHeight: number;
  readonly titleArabic?: string;
}

export function buildMathGridAreaSvgMarkup(
  spec: MathGridAreaSpec,
  numeralMode: NumeralDisplayMode = "western"
): string {
  const width = 240;
  const height = 180;
  const cellSize = 22;
  const padTop = 32;

  const cols = Math.max(3, Math.min(12, spec.gridCols));
  const rows = Math.max(3, Math.min(8, spec.gridRows));
  const effCell = cols > 8 ? Math.floor(176 / cols) : cellSize;
  const gridW = cols * effCell;
  const gridH = rows * effCell;

  const startX = (width - gridW) / 2;
  const startY = padTop + (height - padTop - gridH) / 2;

  const sW = Math.max(1, Math.min(cols - 1, spec.shapeWidth));
  const sH = Math.max(1, Math.min(rows - 1, spec.shapeHeight));

  const svgParts: string[] = [];
  const title = spec.titleArabic ?? "أوجد محيط ومساحة الشكل على الشبكة التربيعية";
  svgParts.push(
    `<text x="${(width / 2).toFixed(1)}" y="20" text-anchor="middle" font-size="10" font-weight="900" fill="#0F172A">${title}</text>`
  );

  for (let c = 0; c <= cols; c++) {
    const x = startX + c * effCell;
    svgParts.push(
      `<line x1="${x.toFixed(1)}" y1="${startY.toFixed(1)}" x2="${x.toFixed(1)}" y2="${(startY + gridH).toFixed(1)}" stroke="#E2E8F0" stroke-width="0.8" />`
    );
  }
  for (let r = 0; r <= rows; r++) {
    const y = startY + r * effCell;
    svgParts.push(
      `<line x1="${startX.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(startX + gridW).toFixed(1)}" y2="${y.toFixed(1)}" stroke="#E2E8F0" stroke-width="0.8" />`
    );
  }

  const shapeX = startX + Math.floor((cols - sW) / 2) * effCell;
  const shapeY = startY + Math.floor((rows - sH) / 2) * effCell;
  svgParts.push(
    `<rect x="${shapeX.toFixed(1)}" y="${shapeY.toFixed(1)}" width="${(sW * effCell).toFixed(1)}" height="${(sH * effCell).toFixed(1)}" fill="#3B82F6" opacity="0.35" stroke="#1D4ED8" stroke-width="1.8" />`,
    `<rect x="${startX.toFixed(1)}" y="${startY.toFixed(1)}" width="${gridW.toFixed(1)}" height="${gridH.toFixed(1)}" fill="none" stroke="#94A3B8" stroke-width="1.2" />`,
    `<text x="${(shapeX + (sW * effCell) / 2).toFixed(1)}" y="${(shapeY - 4).toFixed(1)}" text-anchor="middle" font-size="8" font-weight="800" fill="#1D4ED8">${formatNumeralsByModeSSOT(sW, numeralMode)} وحدات</text>`,
    `<text x="${(shapeX + sW * effCell + 6).toFixed(1)}" y="${(shapeY + (sH * effCell) / 2 + 3).toFixed(1)}" text-anchor="start" font-size="8" font-weight="800" fill="#1D4ED8">${formatNumeralsByModeSSOT(sH, numeralMode)} وحدات</text>`
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-auto select-none">${svgParts.join("")}</svg>`;
}

export function buildMathGridAreaFigure(
  spec: MathGridAreaSpec,
  figureId = "math_grid_area_fig",
  notationLanguage: MathNotationLanguage = "arabic"
): CanonicalGeometryFigureIR {
  const svg = buildMathGridAreaSvgMarkup(spec, "western");
  return {
    figureId,
    familyId: "quadrilateral_family",
    branchId: "primary_bar_model",
    titleArabic: spec.titleArabic ?? "محيط ومساحة الشكل على الشبكة التربيعية",
    notationLanguage,
    vertices: [],
    segments: [],
    angles: [],
    rawSvgMarkup: svg,
  };
}

export function tryBuildMathGridAreaFromDescription(
  description: string,
  figureId: string,
  notationLanguage: MathNotationLanguage
): CanonicalGeometryFigureIR | undefined {
  const d = toWesternNumeralsSSOT(description.trim());
  if (!/شبكة\s*تربيعية|شبكة\s*مربعات|شبكة\s*(?:ال)?وحدات|وحدات\s*مربعة|وحدة\s*و\s*\d+|محيط.*شبكة|مساحة.*شبكة/i.test(d)) {
    return undefined;
  }
  if (/مستوى\s*إحداثي|[أ-ي]ـ?\s*\(\s*\d+\s*[,،]\s*\d+\s*\)/.test(d)) return undefined;

  const dimMatch =
    d.match(/(\d+)\s*(?:في|×|x)\s*(\d+)/i) ||
    d.match(/أبعاد[هـا]?\s*=?\s*(\d+)\s*(?:وحد(?:ة|ات)?\s*)?(?:و|،|×|في)\s*(\d+)/i);
  const lenWidthMatch = d.match(/طول[هـا]?\s*=?\s*(\d+)[\s\S]{0,25}?عرض[هـا]?\s*=?\s*(\d+)/i);
  const squareSideMatch = /مربع/.test(d) ? d.match(/طول\s*ضلع[هـا]?\s*=?\s*(\d+)/i) : null;
  const sW = dimMatch ? Number(dimMatch[1]) : lenWidthMatch ? Number(lenWidthMatch[1]) : squareSideMatch ? Number(squareSideMatch[1]) : 4;
  const sH = dimMatch ? Number(dimMatch[2]) : lenWidthMatch ? Number(lenWidthMatch[2]) : squareSideMatch ? Number(squareSideMatch[1]) : 3;

  return buildMathGridAreaFigure(
    { gridCols: Math.max(sW + 2, 6), gridRows: Math.max(sH + 2, 5), shapeWidth: sW, shapeHeight: sH },
    figureId,
    notationLanguage
  );
}
