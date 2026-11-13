/**
 * @file math-tape-model-svg-builder.ts
 * @description مصيّر النموذج الشريطي (Tape / Bar Model) المتجهي لحل المعادلات والمسائل الكلامية (الكل والأجزاء).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 115 سطراً).
 */

import {
  formatNumeralsByModeSSOT,
  type NumeralDisplayMode,
} from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_MATH_TAPE_MODEL_SVG_BUILDER =
  "math_tape_model_svg_builder" as const;

export interface MathTapeModelPart {
  readonly label: string | number;
  readonly ratio?: number;
  readonly isUnknown?: boolean;
}

export interface MathTapeModelOptions {
  readonly total: string | number;
  readonly totalIsUnknown?: boolean;
  readonly parts: readonly MathTapeModelPart[];
  readonly width?: number;
  readonly numeralMode?: NumeralDisplayMode;
  readonly title?: string;
}

export function renderMathTapeModelSVG(options: MathTapeModelOptions): string {
  const width = options.width ?? 340;
  const numeralMode = options.numeralMode ?? "western";
  const paddingX = 16;
  const paddingTop = options.title ? 28 : 16;
  const barWidth = width - paddingX * 2;
  const barHeight = 44;
  const partsY = paddingTop + barHeight + 4;
  const svgParts: string[] = [];

  if (options.title) {
    svgParts.push(`<text x="${width / 2}" y="${paddingTop - 10}" font-family="Cairo, Arial, sans-serif" font-size="13" font-weight="bold" fill="#334155" text-anchor="middle">${options.title}</text>`);
  }

  const totalFill = options.totalIsUnknown ? "#fef3c7" : "#f1f5f9";
  const totalStroke = options.totalIsUnknown ? "#d97706" : "#334155";
  const totalText = formatNumeralsByModeSSOT(options.total, numeralMode);

  svgParts.push(
    `<rect x="${paddingX}" y="${paddingTop}" width="${barWidth}" height="${barHeight}" rx="4" fill="${totalFill}" stroke="${totalStroke}" stroke-width="1.5"/>`,
    `<text x="${paddingX + barWidth / 2}" y="${paddingTop + barHeight / 2 + 5}" font-family="Cairo, Arial, sans-serif" font-size="16" font-weight="800" fill="#0f172a" text-anchor="middle">${totalText}</text>`
  );

  const parts = options.parts.length > 0
    ? options.parts
    : [{ label: "؟", isUnknown: true }, { label: "...", isUnknown: false }];
  const totalRatio = parts.reduce((sum, p) => sum + (p.ratio && p.ratio > 0 ? p.ratio : 1), 0);
  let curX = paddingX;

  parts.forEach((part, idx) => {
    const r = part.ratio && part.ratio > 0 ? part.ratio : 1;
    const partW = idx === parts.length - 1 ? paddingX + barWidth - curX : Math.round((r / totalRatio) * barWidth);
    const isUnk = Boolean(part.isUnknown || String(part.label).includes("؟") || String(part.label).includes("?"));
    const partFill = isUnk ? "#e0f2fe" : idx % 2 === 0 ? "#ffffff" : "#f8fafc";
    const partStroke = isUnk ? "#0284c7" : "#334155";
    const partText = formatNumeralsByModeSSOT(part.label, numeralMode);

    svgParts.push(
      `<rect x="${curX}" y="${partsY}" width="${partW}" height="${barHeight}" rx="4" fill="${partFill}" stroke="${partStroke}" stroke-width="1.5"/>`,
      `<text x="${curX + partW / 2}" y="${partsY + barHeight / 2 + 5}" font-family="Cairo, Arial, sans-serif" font-size="15" font-weight="700" fill="${isUnk ? "#0369a1" : "#0f172a"}" text-anchor="middle">${partText}</text>`
    );
    curX += partW;
  });

  const finalH = partsY + barHeight + 16;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${finalH}" class="w-full h-auto select-none" style="background:#ffffff">${svgParts.join("")}</svg>`;
}
