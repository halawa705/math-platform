/**
 * @file primary-grade3-fraction-models-builder.ts
 * @description منشئ النماذج البصرية للكسور للصف الثالث الابتدائي (المرحلة 5.2):
 * - شرائح الكسور (مستطيل مقسم إلى n جزء متساوٍ ومظلل منها k جزء)
 * - دوائر الكسور (دائرة مقسمة إلى قطاعات ومظلل منها k قطاع)
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (< 150 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "@/core/ssot/geometry-archetype-ssot";
import { formatNumeralsByModeSSOT, type MathNotationLanguage, type NumeralDisplayMode } from "@/core/ssot/numeral-and-unit-ssot";

export const MODULE_ID_PRIMARY_GRADE3_FRACTION_MODELS_BUILDER =
  "primary_grade3_fraction_models_builder" as const;

export interface FractionModelSpec {
  readonly numerator: number;   // البسط (المظلل)
  readonly denominator: number; // المقام (الإجمالي)
  readonly shape: "strip" | "circle";
  readonly titleArabic?: string;
  /** لا تُكتب قيمة الكسر على الشكل (المطلوب في السؤال غالباً هو كتابة الكسر أو تظليله) */
  readonly hideFractionValue?: boolean;
}

export function buildGrade3FractionStripSvgMarkup(
  spec: FractionModelSpec,
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
  const title = spec.titleArabic ?? (spec.hideFractionValue ? `نموذج شريطي مقسم إلى ${formatNumeralsByModeSSOT(n, numeralMode)} أجزاء متساوية` : `نموذج الكسر: ${formatNumeralsByModeSSOT(k, numeralMode)} / ${formatNumeralsByModeSSOT(n, numeralMode)}`);

  partsSvg.push(
    `<text x="${(width / 2).toFixed(1)}" y="20" text-anchor="middle" font-size="10" font-weight="900" fill="#0F172A">${title}</text>`
  );

  // إطار خارجي
  const givenAttr = k >= 2 ? ` data-given-values="${n},${k}"` : ` data-given-values="${n}"`;
  partsSvg.push(
    `<rect x="${startX}" y="${startY}" width="${totalW}" height="${blockH}" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.2" rx="3"${givenAttr} />`
  );

  // الأجزاء
  for (let i = 0; i < n; i++) {
    const cx = startX + i * cellW;
    const isShaded = i < k;
    const fill = isShaded ? "#3B82F6" : "#F8FAFC";
    const opacity = isShaded ? "0.85" : "1";

    partsSvg.push(
      `<rect x="${cx.toFixed(1)}" y="${startY}" width="${cellW.toFixed(1)}" height="${blockH}" fill="${fill}" opacity="${opacity}" stroke="#0F172A" stroke-width="0.9" />`
    );

    // كتابة الكسر الواحد 1/n داخل كل جزء إن كان العرض كافياً
    if (cellW >= 24 && !spec.hideFractionValue) {
      const textColor = isShaded ? "#FFFFFF" : "#64748B";
      partsSvg.push(
        `<text x="${(cx + cellW / 2).toFixed(1)}" y="${startY + 22}" text-anchor="middle" font-size="8" font-weight="800" fill="${textColor}">1/${formatNumeralsByModeSSOT(n, numeralMode)}</text>`
      );
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-auto select-none">${partsSvg.join("")}</svg>`;
}

export function buildGrade3FractionCircleSvgMarkup(
  spec: FractionModelSpec,
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
  const title = spec.titleArabic ?? `كسر الدائرة: ${formatNumeralsByModeSSOT(k, numeralMode)} / ${formatNumeralsByModeSSOT(n, numeralMode)}`;

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
    const fill = isShaded ? "#2563EB" : "#F8FAFC";
    const opacity = isShaded ? "0.9" : "1";

    const pathD = `M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
    partsSvg.push(
      `<path d="${pathD}" fill="${fill}" opacity="${opacity}" stroke="#0F172A" stroke-width="1.0" />`
    );

    currentAngle = nextAngle;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-auto select-none">${partsSvg.join("")}</svg>`;
}

export function buildGrade3FractionFigure(
  spec: FractionModelSpec,
  figureId = "prim3_frac_fig",
  notationLanguage: MathNotationLanguage = "arabic"
): CanonicalGeometryFigureIR {
  const svg = spec.shape === "circle"
    ? buildGrade3FractionCircleSvgMarkup(spec, "western")
    : buildGrade3FractionStripSvgMarkup(spec, "western");

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
