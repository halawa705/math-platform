/**
 * @file area-model-arithmetic-svg-builder.ts
 * @description منشئ ومصيّر نموذج مساحة المستطيل (Area Model) الحسابي المعتمد في المناهج الابتدائية
 * لعمليات ضرب وقسمة الأعداد والكسور العشرية كـ Vector SVG نقي وحتمي معزول الاتجاه LTR.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 220 سطراً).
 */

import {
  formatNumeralsByModeSSOT,
  type MathNotationLanguage,
  type NumeralDisplayMode,
} from "../../ssot/numeral-and-unit-ssot";
import {
  isSymbolicAreaModelUnknown,
  parseAreaModelSpecFromText,
  type AreaModelDivisionSpec,
  type AreaModelMultiplicationSpec,
  type AreaModelSpec,
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

function renderDivisionAreaModelSvg(
  spec: AreaModelDivisionSpec,
  fmt: (v: string) => string,
  primaryHex: string
): string {
  const hasDetailedCols = Boolean(
    spec.columns &&
      spec.columns.length > 0 &&
      spec.columns.some((c) => c.subtractedProduct !== undefined)
  );
  const colCount = hasDetailedCols ? spec.columns!.length : spec.topQuotients.length;
  const colW = hasDetailedCols ? (colCount >= 3 ? 64 : 74) : colCount >= 3 ? 58 : 66;
  const gridW = colCount * colW;
  const gridH = hasDetailedCols ? 66 : 44;

  const divisorChars = Math.max(fmt(spec.divisor).length, 2);
  const divisorBoxW = Math.max(34, divisorChars * 8 + 14);
  const startX = 8 + divisorBoxW + 8;
  const startY = 26;
  const hasRemBadge = Boolean(spec.finalRemainder && spec.finalRemainder !== "0");
  const remBadgeW = hasRemBadge ? 64 : 0;
  const totalW = startX + gridW + remBadgeW + 10;
  const totalH = startY + gridH + 10;

  const colsMarkup = spec.topQuotients
    .map((q, i) => {
      const cx = startX + i * colW + colW / 2;
      const isUnknown = isSymbolicAreaModelUnknown(q);
      const qBox = isUnknown
        ? `<rect x="${cx - 14}" y="${startY - 21}" width="28" height="17" rx="3" fill="#FEF08A" stroke="#EAB308" stroke-width="1.3" stroke-dasharray="3 2" />`
        : "";
      const qText = `<text x="${cx}" y="${startY - 8}" text-anchor="middle" font-size="11.5" font-weight="900" fill="${isUnknown ? "#854D0E" : "#1E293B"}">${fmt(q)}</text>`;
      const plus =
        i < colCount - 1
          ? `<text x="${startX + (i + 1) * colW}" y="${startY - 8}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#94A3B8">+</text>`
          : "";
      return `${qBox}${qText}${plus}`;
    })
    .join("");

  const cellsMarkup = hasDetailedCols
    ? spec.columns!
        .map((col, i) => {
          const x = startX + i * colW;
          const cx = x + colW / 2;
          const bg = i % 2 === 0 ? "#FFFFFF" : "#F8FAFC";
          return `
            <rect x="${x}" y="${startY}" width="${colW}" height="${gridH}" fill="${bg}" stroke="${primaryHex}" stroke-width="1.2" />
            <text x="${cx}" y="${startY + 17}" text-anchor="middle" font-size="11.5" font-weight="900" fill="#0F172A">${fmt(col.partialDividend)}</text>
            <text x="${cx}" y="${startY + 35}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#475569">− ${fmt(col.subtractedProduct ?? "0")}</text>
            <line x1="${x + 8}" y1="${startY + 41}" x2="${x + colW - 8}" y2="${startY + 41}" stroke="#94A3B8" stroke-width="1" />
            <text x="${cx}" y="${startY + 57}" text-anchor="middle" font-size="11.5" font-weight="900" fill="#0F172A">${fmt(col.bottomRemainder ?? "0")}</text>
          `;
        })
        .join("")
    : spec.cellProducts
        .map((p, i) => {
          const x = startX + i * colW;
          const cx = x + colW / 2;
          const isUnknown = isSymbolicAreaModelUnknown(p);
          const bg = isUnknown ? "#FEF08A" : i % 2 === 0 ? "#FFFFFF" : "#F8FAFC";
          const stroke = isUnknown ? "#EAB308" : primaryHex;
          return `
            <rect x="${x}" y="${startY}" width="${colW}" height="${gridH}" fill="${bg}" stroke="${stroke}" stroke-width="${isUnknown ? 2 : 1.2}" ${isUnknown ? 'stroke-dasharray="3 2"' : ""} />
            <text x="${cx}" y="${startY + 26}" text-anchor="middle" font-size="${isUnknown ? 13 : 11}" font-weight="900" fill="${isUnknown ? "#854D0E" : "#0F172A"}">${fmt(p)}</text>
          `;
        })
        .join("");

  const remMarkup = hasRemBadge
    ? `<rect x="${startX + gridW + 6}" y="${startY + gridH / 2 - 11}" width="54" height="22" rx="4" fill="#FEF2F2" stroke="#EF4444" stroke-width="1" />
       <text x="${startX + gridW + 33}" y="${startY + gridH / 2 + 4}" text-anchor="middle" font-size="9.5" font-weight="800" fill="#991B1B">باقي ${fmt(spec.finalRemainder!)}</text>`
    : "";

  return `
    <svg xmlns="http://www.w3.org/2000/svg" direction="ltr" viewBox="0 0 ${totalW} ${totalH}" width="100%" height="100%" style="direction: ltr; unicode-bidi: isolate; max-height: ${hasDetailedCols ? 105 : 85}px; display: block; margin: auto;">
      ${cellsMarkup}
      <rect x="8" y="${startY}" width="${divisorBoxW}" height="${gridH}" rx="4" fill="#EEF2FF" stroke="#6366F1" stroke-width="1.2" />
      <text x="${8 + divisorBoxW / 2}" y="${startY + gridH / 2 + 4}" text-anchor="middle" font-size="11.5" font-weight="900" fill="#312E81">${fmt(spec.divisor)}</text>
      ${colsMarkup}
      ${remMarkup}
    </svg>
  `;
}

function renderMultiplicationAreaModelSvg(
  spec: AreaModelMultiplicationSpec,
  fmt: (v: string) => string,
  primaryHex: string
): string {
  const numCols = spec.topColumns.length;
  const numRows = spec.sideRows.length;
  const colW = numCols >= 3 ? 54 : 64;
  const rowH = 34;
  const gridW = numCols * colW;
  const gridH = numRows * rowH;

  const maxSideChars = Math.max(...spec.sideRows.map((r) => fmt(r).length), 2);
  const startX = Math.max(42, maxSideChars * 8 + 18);
  const startY = 24;
  const totalW = startX + gridW + 10;
  const totalH = startY + gridH + 10;

  const cellsMarkup = spec.cellValues
    .map((rowVals, rIdx) =>
      rowVals
        .map((val, cIdx) => {
          const x = startX + cIdx * colW;
          const y = startY + rIdx * rowH;
          const cx = x + colW / 2;
          const cy = y + rowH / 2 + 4;
          const isUnknown = isSymbolicAreaModelUnknown(val);
          const bg = isUnknown ? "#FEF08A" : (rIdx + cIdx) % 2 === 0 ? "#FFFFFF" : "#F8FAFC";
          const stroke = isUnknown ? "#EAB308" : primaryHex;
          const strokeW = isUnknown ? 2 : 1.2;
          const textFill = isUnknown ? "#854D0E" : "#0F172A";

          return `
            <rect x="${x}" y="${y}" width="${colW}" height="${rowH}" fill="${bg}" stroke="${stroke}" stroke-width="${strokeW}" ${isUnknown ? 'stroke-dasharray="3 2"' : ""} />
            <text x="${cx}" y="${cy}" text-anchor="middle" font-size="${isUnknown ? 13.5 : 11}" font-weight="900" fill="${textFill}">${fmt(val)}</text>
          `;
        })
        .join("")
    )
    .join("");

  const topColsMarkup = spec.topColumns
    .map((c, i) => {
      const cx = startX + i * colW + colW / 2;
      return `<text x="${cx}" y="${startY - 7}" text-anchor="middle" font-size="11.5" font-weight="900" fill="#1E293B">${fmt(c)}</text>`;
    })
    .join("");

  const sideRowsMarkup = spec.sideRows
    .map((r, i) => {
      const cy = startY + i * rowH + rowH / 2 + 4;
      return `<text x="${startX - 7}" y="${cy}" text-anchor="end" font-size="11.5" font-weight="900" fill="#1E293B">${fmt(r)}</text>`;
    })
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" direction="ltr" viewBox="0 0 ${totalW} ${totalH}" width="100%" height="100%" style="direction: ltr; unicode-bidi: isolate; max-height: 95px; display: block; margin: auto;">
      ${cellsMarkup}
      <text x="${startX - 10}" y="${startY - 7}" text-anchor="end" font-size="12" font-weight="900" fill="#6366F1">×</text>
      ${topColsMarkup}
      ${sideRowsMarkup}
    </svg>
  `;
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
    return renderDivisionAreaModelSvg(spec, fmt, primaryHex);
  }
  return renderMultiplicationAreaModelSvg(spec, fmt, primaryHex);
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
