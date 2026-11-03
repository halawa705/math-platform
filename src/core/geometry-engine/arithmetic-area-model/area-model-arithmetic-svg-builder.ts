/**
 * @file area-model-arithmetic-svg-builder.ts
 * @description منشئ ومصيّر نموذج مساحة المستطيل (Area Model) الحسابي المعتمد في المناهج الابتدائية
 * لعمليات ضرب وقسمة الأعداد والكسور العشرية كـ Vector SVG نقي وحتمي بدلاً من الأشكال الإقليدية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 220 سطراً).
 */

import {
  formatNumeralsByModeSSOT,
  type MathNotationLanguage,
  type NumeralDisplayMode,
} from "../../ssot/numeral-and-unit-ssot";
import {
  type AreaModelSpec,
  parseAreaModelSpecFromText,
} from "./area-model-decomposer-ssot";

export const MODULE_ID_AREA_MODEL_ARITHMETIC_SVG_BUILDER =
  "area_model_arithmetic_svg_builder" as const;

export {
  type AreaModelSpec,
  type AreaModelMultiplicationSpec,
  type AreaModelDivisionSpec,
  parseAreaModelSpecFromText,
} from "./area-model-decomposer-ssot";

export interface AreaModelSvgRenderOptions {
  readonly numeralMode?: NumeralDisplayMode;
  readonly notationLanguage?: MathNotationLanguage;
  readonly primaryHex?: string;
  readonly accentHex?: string;
}

/**
 * يصيّر نموذج مساحة المستطيل كـ SVG متجهي نقي بأعلى جودة مطبعية للطباعة وشاشات الهواتف
 */
export function renderAreaModelToSvg(
  spec: AreaModelSpec,
  options: AreaModelSvgRenderOptions = {}
): string {
  const numeralMode = options.numeralMode ?? "western";
  const primaryHex = options.primaryHex ?? "#312E81";
  const fmt = (v: string) => formatNumeralsByModeSSOT(v, numeralMode);

  if (spec.kind === "division") {
    const colCount = spec.topQuotients.length;
    const colW = colCount >= 3 ? 56 : 64;
    const gridW = colCount * colW;
    const gridH = 44;
    const startX = 46;
    const startY = 24;
    const totalW = startX + gridW + 10;
    const totalH = startY + gridH + 8;

    const colsMarkup = spec.topQuotients
      .map((q, i) => {
        const cx = startX + i * colW + colW / 2;
        return `
          <text x="${cx}" y="${startY - 7}" text-anchor="middle" font-size="11" font-weight="900" fill="#1E293B">${fmt(q)}</text>
          ${i < colCount - 1 ? `<text x="${startX + (i + 1) * colW}" y="${startY - 7}" text-anchor="middle" font-size="10" font-weight="700" fill="#94A3B8">+</text>` : ""}
        `;
      })
      .join("");

    const cellsMarkup = spec.cellProducts
      .map((p, i) => {
        const x = startX + i * colW;
        const cx = x + colW / 2;
        const isUnknown = p === "س" || p === "x" || p === "؟" || p === "?";
        const bg = isUnknown ? "#FEF08A" : i % 2 === 0 ? "#FFFFFF" : "#F8FAFC";
        const stroke = isUnknown ? "#EAB308" : primaryHex;
        return `
          <rect x="${x}" y="${startY}" width="${colW}" height="${gridH}" fill="${bg}" stroke="${stroke}" stroke-width="${isUnknown ? 2 : 1.2}" ${isUnknown ? 'stroke-dasharray="3 2"' : ""} />
          <text x="${cx}" y="${startY + 26}" text-anchor="middle" font-size="${isUnknown ? 14 : 11}" font-weight="900" fill="${isUnknown ? "#854D0E" : "#0F172A"}">${fmt(p)}</text>
        `;
      })
      .join("");

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="100%" height="100%" style="max-height: 85px; display: block; margin: auto;">
        <!-- المقسوم عليه على الجانب الأيسر -->
        <rect x="6" y="${startY}" width="34" height="${gridH}" rx="4" fill="#EEF2FF" stroke="#6366F1" stroke-width="1.2" />
        <text x="23" y="${startY + 26}" text-anchor="middle" font-size="11" font-weight="900" fill="#312E81">${fmt(spec.divisor)}</text>
        ${colsMarkup}
        ${cellsMarkup}
      </svg>
    `;
  }

  // نموذج مساحة المستطيل لعمليات الضرب
  const numCols = spec.topColumns.length;
  const numRows = spec.sideRows.length;
  const colW = numCols >= 3 ? 50 : 58;
  const rowH = 32;
  const gridW = numCols * colW;
  const gridH = numRows * rowH;
  const startX = 40;
  const startY = 22;
  const totalW = startX + gridW + 10;
  const totalH = startY + gridH + 8;

  const topColsMarkup = spec.topColumns
    .map((c, i) => {
      const cx = startX + i * colW + colW / 2;
      return `<text x="${cx}" y="${startY - 6}" text-anchor="middle" font-size="11" font-weight="900" fill="#1E293B">${fmt(c)}</text>`;
    })
    .join("");

  const sideRowsMarkup = spec.sideRows
    .map((r, i) => {
      const cy = startY + i * rowH + rowH / 2 + 4;
      return `<text x="${startX - 6}" y="${cy}" text-anchor="end" font-size="11" font-weight="900" fill="#1E293B">${fmt(r)}</text>`;
    })
    .join("");

  const cellsMarkup = spec.cellValues
    .map((rowVals, rIdx) =>
      rowVals
        .map((val, cIdx) => {
          const x = startX + cIdx * colW;
          const y = startY + rIdx * rowH;
          const cx = x + colW / 2;
          const cy = y + rowH / 2 + 4;
          const isUnknown = val === "س" || val === "x" || val === "؟" || val === "?";
          const bg = isUnknown ? "#FEF08A" : (rIdx + cIdx) % 2 === 0 ? "#FFFFFF" : "#F8FAFC";
          const stroke = isUnknown ? "#EAB308" : primaryHex;
          const strokeW = isUnknown ? 2 : 1.2;
          const textFill = isUnknown ? "#854D0E" : "#0F172A";

          return `
            <rect x="${x}" y="${y}" width="${colW}" height="${rowH}" fill="${bg}" stroke="${stroke}" stroke-width="${strokeW}" ${isUnknown ? 'stroke-dasharray="3 2"' : ""} />
            <text x="${cx}" y="${cy}" text-anchor="middle" font-size="${isUnknown ? 14 : 11}" font-weight="900" fill="${textFill}">${fmt(val)}</text>
          `;
        })
        .join("")
    )
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="100%" height="100%" style="max-height: 90px; display: block; margin: auto;">
      <!-- رمز الضرب في الركن العلوي الأيمن/الأيسر -->
      <text x="${startX - 16}" y="${startY - 6}" font-size="12" font-weight="900" fill="#6366F1">×</text>
      ${topColsMarkup}
      ${sideRowsMarkup}
      ${cellsMarkup}
    </svg>
  `;
}

/**
 * دالة الدخول الرئيسية: تكتشف هل النص يصف نموذج مساحة المستطيل وتصيّره إلى SVG نقي
 */
export function detectAndBuildAreaModelSvg(
  text: string,
  options: AreaModelSvgRenderOptions = {}
): string | null {
  const spec = parseAreaModelSpecFromText(text);
  if (!spec) return null;
  return renderAreaModelToSvg(spec, options);
}
