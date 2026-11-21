/**
 * @file math-fraction-models-svg-builder.ts
 * @description منشئ النماذج البصرية للكسور (شرائح ودوائر الكسور) بالبيانات المباشرة من النص بدون أي قوالب جامدة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 160 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import {
  formatNumeralsByModeSSOT,
  toWesternNumeralsSSOT,
  type MathNotationLanguage,
  type NumeralDisplayMode,
} from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_MATH_FRACTION_MODELS_SVG_BUILDER =
  "math_fraction_models_svg_builder" as const;

export interface MathFractionModelSpec {
  readonly numerator: number;
  readonly denominator: number;
  readonly shape: "strip" | "circle";
  readonly titleArabic?: string;
  readonly hideFractionValue?: boolean;
}

export function buildMathFractionStripSvgMarkup(
  spec: MathFractionModelSpec,
  numeralMode: NumeralDisplayMode = "western"
): string {
  const width = 260;
  const height = 90;
  const startX = 20;
  const startY = 32;
  const totalW = 220;
  const blockH = 36;
  const n = Math.max(2, Math.min(12, spec.denominator));
  const k = Math.max(0, Math.min(n, spec.numerator));
  const cellW = totalW / n;

  const partsSvg: string[] = [];
  const title =
    spec.titleArabic ??
    (spec.hideFractionValue
      ? `نموذج شريطي مقسم إلى ${formatNumeralsByModeSSOT(n, numeralMode)} أجزاء متساوية`
      : `نموذج الكسر: ${formatNumeralsByModeSSOT(k, numeralMode)} / ${formatNumeralsByModeSSOT(n, numeralMode)}`);

  partsSvg.push(
    `<text x="${(width / 2).toFixed(1)}" y="20" text-anchor="middle" font-size="10" font-weight="900" fill="#0F172A">${title}</text>`
  );
  const givenAttr = k >= 2 ? ` data-given-values="${n},${k}"` : ` data-given-values="${n}"`;
  partsSvg.push(
    `<rect x="${startX}" y="${startY}" width="${totalW}" height="${blockH}" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.2" rx="3"${givenAttr} />`
  );

  for (let i = 0; i < n; i++) {
    const cx = startX + i * cellW;
    const isShaded = i < k;
    partsSvg.push(
      `<rect x="${cx.toFixed(1)}" y="${startY}" width="${cellW.toFixed(1)}" height="${blockH}" fill="${isShaded ? "#3B82F6" : "#F8FAFC"}" opacity="${isShaded ? "0.85" : "1"}" stroke="#0F172A" stroke-width="0.9" />`
    );
    if (cellW >= 24 && !spec.hideFractionValue) {
      partsSvg.push(
        `<text x="${(cx + cellW / 2).toFixed(1)}" y="${startY + 22}" text-anchor="middle" font-size="8" font-weight="800" fill="${isShaded ? "#FFFFFF" : "#64748B"}">1/${formatNumeralsByModeSSOT(n, numeralMode)}</text>`
      );
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-auto select-none">${partsSvg.join("")}</svg>`;
}

export function buildMathFractionCircleSvgMarkup(
  spec: MathFractionModelSpec,
  numeralMode: NumeralDisplayMode = "western"
): string {
  const width = 200;
  const height = 180;
  const cx = 100;
  const cy = 95;
  const r = 60;
  const n = Math.max(2, Math.min(12, spec.denominator));
  const k = Math.max(0, Math.min(n, spec.numerator));

  const partsSvg: string[] = [];
  const title =
    spec.titleArabic ??
    `كسر الدائرة: ${formatNumeralsByModeSSOT(k, numeralMode)} / ${formatNumeralsByModeSSOT(n, numeralMode)}`;
  partsSvg.push(
    `<text x="${cx}" y="20" text-anchor="middle" font-size="10" font-weight="900" fill="#0F172A">${title}</text>`
  );

  const angleStep = (2 * Math.PI) / n;
  let currentAngle = -Math.PI / 2;
  for (let i = 0; i < n; i++) {
    const isShaded = i < k;
    const nextAngle = currentAngle + angleStep;
    const x1 = cx + r * Math.cos(currentAngle);
    const y1 = cy + r * Math.sin(currentAngle);
    const x2 = cx + r * Math.cos(nextAngle);
    const y2 = cy + r * Math.sin(nextAngle);
    const largeArc = angleStep > Math.PI ? 1 : 0;
    const pathD = `M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
    partsSvg.push(
      `<path d="${pathD}" fill="${isShaded ? "#2563EB" : "#F8FAFC"}" opacity="${isShaded ? "0.9" : "1"}" stroke="#0F172A" stroke-width="1.0" />`
    );
    currentAngle = nextAngle;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-auto select-none">${partsSvg.join("")}</svg>`;
}

export function buildMathFractionModelFigure(
  spec: MathFractionModelSpec,
  figureId = "math_frac_fig",
  notationLanguage: MathNotationLanguage = "arabic"
): CanonicalGeometryFigureIR {
  const svg =
    spec.shape === "circle"
      ? buildMathFractionCircleSvgMarkup(spec, "western")
      : buildMathFractionStripSvgMarkup(spec, "western");
  return {
    figureId,
    familyId: "primary_visual_models_family",
    branchId: "primary_bar_model",
    titleArabic: spec.titleArabic ?? `نموذج كسر ${spec.numerator}/${spec.denominator}`,
    notationLanguage,
    vertices: [],
    segments: [],
    angles: [],
    rawSvgMarkup: svg,
  };
}

export function tryBuildMathFractionModelFromDescription(
  description: string,
  figureId: string,
  notationLanguage: MathNotationLanguage
): CanonicalGeometryFigureIR | undefined {
  const d = toWesternNumeralsSSOT(description.trim());
  if (!d || /خط\s*الأعداد/i.test(d)) return undefined;
  if (/بسطه.*مقامه|يكتب\s*بالصيغة/i.test(d)) return undefined;

  const fracMatch = d.match(/(?:كسر|ظلل|مظلل)?\s*(\d+)\s*(?:\/|على)\s*(\d+)/i) || d.match(/(\d+)\s*أجزاء\s*من\s*(\d+)/i);
  const dividedMatch = d.match(/مقسم[ةه]?\s*إلى\s*(\d+)\s*أجزاء.*?(?:مظلل|ظلل)\s*(?:منها)?\s*(\d+)/i);
  const splitOnly = d.match(/مقسم[ةه]?\s*إلى\s*(\d+)\s*أجزاء/i);
  const shadedCount = d.match(/(\d+)\s*(?:جزء|أجزاء)\s*مظلل/i);
  const oneShaded = /(?:^|[\s;؛])جزء\s*مظلل/i.test(d);
  const isCircle = /دائرة|قرص|قطاع/i.test(d);

  if (!fracMatch && !dividedMatch && splitOnly) {
    const den = Number(splitOnly[1]);
    const num = shadedCount ? Number(shadedCount[1]) : oneShaded ? 1 : 0;
    if (den > 0 && num <= den) {
      return buildMathFractionModelFigure(
        { numerator: num, denominator: den, shape: isCircle ? "circle" : "strip", hideFractionValue: true },
        figureId,
        notationLanguage
      );
    }
  }

  if ((fracMatch || dividedMatch) && /(?:كسر|شريحة|دائرة|أجزاء|مظلل|مقام|بسط)/i.test(d)) {
    const num = dividedMatch ? Number(dividedMatch[2]) : Number(fracMatch![1]);
    const den = dividedMatch ? Number(dividedMatch[1]) : Number(fracMatch![2]);
    if (den > 1 && num <= den) {
      return buildMathFractionModelFigure(
        { numerator: num, denominator: den, shape: isCircle ? "circle" : "strip" },
        figureId,
        notationLanguage
      );
    }
  }
  return undefined;
}
