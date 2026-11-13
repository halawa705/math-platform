/**
 * @file math-decimal-grid-svg-builder.ts
 * @description مصيّر شبكة الكسور العشرية (شبكة المائة 10×10، الأجزاء من عشرة، وأشرطة الكسور) للمرحلة الابتدائية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 135 سطراً).
 */

import {
  formatNumeralsByModeSSOT,
  type NumeralDisplayMode,
} from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_MATH_DECIMAL_GRID_SVG_BUILDER =
  "math_decimal_grid_svg_builder" as const;

export interface MathDecimalGridOptions {
  readonly type?: "hundred_grid" | "tenths_bar" | "fraction_bar";
  readonly shadedCount?: number;
  readonly decimalValue?: number;
  readonly numerator?: number;
  readonly denominator?: number;
  readonly width?: number;
  readonly height?: number;
  readonly numeralMode?: NumeralDisplayMode;
  readonly shadedColor?: string;
  readonly title?: string;
}

export function renderMathDecimalGridSVG(options: MathDecimalGridOptions): string {
  const type = options.type ?? (options.denominator ? "fraction_bar" : "hundred_grid");
  const numeralMode = options.numeralMode ?? "western";
  const shadedColor = options.shadedColor ?? "#0284c7";
  const svgParts: string[] = [];

  if (type === "fraction_bar") {
    const den = Math.max(1, Math.min(24, options.denominator ?? 4));
    const num = Math.max(0, Math.min(den, options.numerator ?? 1));
    const w = options.width ?? 320;
    const padX = 16;
    const padTop = options.title ? 32 : 16;
    const barH = 44;
    const barW = w - padX * 2;
    const cellW = barW / den;

    if (options.title) {
      svgParts.push(`<text x="${w / 2}" y="${padTop - 12}" font-family="Cairo, Arial, sans-serif" font-size="13" font-weight="bold" fill="#1e293b" text-anchor="middle">${options.title}</text>`);
    }
    svgParts.push(`<rect x="${padX}" y="${padTop}" width="${barW}" height="${barH}" rx="4" fill="#ffffff" stroke="#334155" stroke-width="1.5"/>`);
    for (let i = 0; i < den; i++) {
      const cx = padX + i * cellW;
      const isShaded = i < num;
      svgParts.push(
        `<rect x="${cx}" y="${padTop}" width="${cellW}" height="${barH}" fill="${isShaded ? shadedColor : "#ffffff"}" stroke="#334155" stroke-width="1"/>`,
        `<text x="${cx + cellW / 2}" y="${padTop + barH / 2 + 5}" font-family="Cairo, Arial, sans-serif" font-size="11" font-weight="600" fill="${isShaded ? "#ffffff" : "#64748b"}" text-anchor="middle">1/${formatNumeralsByModeSSOT(den, numeralMode)}</text>`
      );
    }
    const totalH = padTop + barH + 20;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${totalH}" class="w-full h-auto select-none" style="background:#ffffff">${svgParts.join("")}</svg>`;
  }

  if (type === "tenths_bar") {
    const rawShaded =
      options.decimalValue !== undefined
        ? Math.round(options.decimalValue * 10)
        : Math.round(options.shadedCount ?? 0);
    const shaded = Math.max(0, Math.min(10, rawShaded));
    return renderMathDecimalGridSVG({
      ...options,
      type: "fraction_bar",
      denominator: 10,
      numerator: shaded,
      title: options.title ?? `نموذج الأجزاء من عشرة (${formatNumeralsByModeSSOT(shaded, numeralMode)} / ${formatNumeralsByModeSSOT(10, numeralMode)})`,
    });
  }

  const rawShaded =
    options.decimalValue !== undefined
      ? Math.round(options.decimalValue * 100)
      : Math.round(options.shadedCount ?? 0);
  const shaded = Math.max(0, Math.min(100, rawShaded));
  const gridSize = 180;
  const cellSize = gridSize / 10;
  const padTop = options.title ? 34 : 16;
  const width = options.width ?? gridSize + 32;
  const height = options.height ?? padTop + gridSize + 16;
  const startX = (width - gridSize) / 2;

  if (options.title) {
    svgParts.push(`<text x="${width / 2}" y="${padTop - 12}" font-family="Cairo, Arial, sans-serif" font-size="13" font-weight="bold" fill="#1e293b" text-anchor="middle">${options.title}</text>`);
  }

  let count = 0;
  for (let c = 0; c < 10; c++) {
    for (let r = 0; r < 10; r++) {
      svgParts.push(
        `<rect x="${startX + c * cellSize}" y="${padTop + r * cellSize}" width="${cellSize}" height="${cellSize}" fill="${count < shaded ? shadedColor : "#ffffff"}" stroke="#cbd5e1" stroke-width="0.75"/>`
      );
      count += 1;
    }
  }
  svgParts.push(`<rect x="${startX}" y="${padTop}" width="${gridSize}" height="${gridSize}" fill="none" stroke="#1e293b" stroke-width="2"/>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-auto select-none" style="background:#ffffff">${svgParts.join("")}</svg>`;
}
