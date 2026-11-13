/**
 * @file math-place-value-table-builder.ts
 * @description مصيّر جدول القيمة المكانية (Place Value Table) للأعداد الكبيرة والعشرية للمرحلة الابتدائية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 160 سطراً).
 */

import {
  formatNumeralsByModeSSOT,
  toWesternNumeralsSSOT,
  type NumeralDisplayMode,
} from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_MATH_PLACE_VALUE_TABLE_BUILDER =
  "math_place_value_table_builder" as const;

export interface MathPlaceValuePeriod {
  readonly name: string;
  readonly bgHeaderColor: string;
  readonly columns: readonly { readonly name: string; readonly digit?: string | number }[];
}

export interface MathPlaceValueOptions {
  readonly numberValue?: string | number;
  readonly periods?: readonly MathPlaceValuePeriod[];
  readonly width?: number;
  readonly numeralMode?: NumeralDisplayMode;
  readonly title?: string;
}

function buildDefaultPeriodsFromValue(rawVal: string): MathPlaceValuePeriod[] {
  const clean = toWesternNumeralsSSOT(rawVal).replace(/[^\d.]/g, "");
  const [wholeStr = "0", decStr = ""] = clean.split(".");
  const padLength = Math.ceil(Math.max(1, wholeStr.length) / 3) * 3;
  const paddedWhole = wholeStr.padStart(padLength, " ");
  const chunkCount = paddedWhole.length / 3;

  const families = [
    { name: "المليارات", bg: "#fce7f3" },
    { name: "الملايين", bg: "#fef3c7" },
    { name: "الألوف", bg: "#e0f2fe" },
    { name: "الوحدات", bg: "#f1f5f9" },
  ];
  const avail = families.slice(Math.max(0, families.length - chunkCount));
  const periods: MathPlaceValuePeriod[] = [];

  for (let i = 0; i < chunkCount; i++) {
    const chunk = paddedWhole.slice(i * 3, (i + 1) * 3);
    const fam = avail[i] ?? { name: `مجموعة ${i + 1}`, bg: "#f1f5f9" };
    periods.push({
      name: fam.name,
      bgHeaderColor: fam.bg,
      columns: [
        { name: "مئات", digit: chunk[0] !== " " ? chunk[0] : "" },
        { name: "عشرات", digit: chunk[1] !== " " ? chunk[1] : "" },
        { name: "آحاد", digit: chunk[2] !== " " ? chunk[2] : "" },
      ],
    });
  }

  if (decStr.length > 0) {
    periods.push({
      name: "الأجزاء العشرية",
      bgHeaderColor: "#dcfce7",
      columns: [
        { name: "جزء من 10", digit: decStr[0] ?? "0" },
        ...(decStr.length > 1 ? [{ name: "جزء من 100", digit: decStr[1] }] : []),
        ...(decStr.length > 2 ? [{ name: "جزء من 1000", digit: decStr[2] }] : []),
      ],
    });
  }

  return periods;
}

export function renderMathPlaceValueTableSVG(options: MathPlaceValueOptions): string {
  const numeralMode = options.numeralMode ?? "western";
  const periods = options.periods?.length
    ? options.periods
    : buildDefaultPeriodsFromValue(options.numberValue !== undefined ? String(options.numberValue) : "3548");

  const totalCols = Math.max(1, periods.reduce((sum, p) => sum + p.columns.length, 0));
  const padX = 14;
  const padTop = options.title ? 34 : 14;
  const tableW = Math.max(options.width ?? 0, totalCols * 52 + padX * 2);
  const colW = (tableW - padX * 2) / totalCols;

  const hRow = 28;
  const subRow = 26;
  const dRow = 36;
  const tableH = hRow + subRow + dRow;
  const totalH = padTop + tableH + 14;

  const svgParts: string[] = [];
  if (options.title) {
    svgParts.push(`<text x="${tableW / 2}" y="${padTop - 12}" font-family="Cairo, Arial, sans-serif" font-size="14" font-weight="bold" fill="#1e293b" text-anchor="middle">${options.title}</text>`);
  }
  svgParts.push(`<rect x="${padX}" y="${padTop}" width="${tableW - padX * 2}" height="${tableH}" rx="4" fill="#ffffff" stroke="#334155" stroke-width="1.5"/>`);

  let curX = padX;
  for (const period of periods) {
    const pw = period.columns.length * colW;
    svgParts.push(
      `<rect x="${curX}" y="${padTop}" width="${pw}" height="${hRow}" fill="${period.bgHeaderColor}" stroke="#334155" stroke-width="1"/>`,
      `<text x="${curX + pw / 2}" y="${padTop + hRow / 2 + 5}" font-family="Cairo, Arial, sans-serif" font-size="13" font-weight="800" fill="#0f172a" text-anchor="middle">${period.name}</text>`
    );

    period.columns.forEach((col, cIdx) => {
      const cx = curX + cIdx * colW;
      const subY = padTop + hRow;
      const digY = subY + subRow;
      svgParts.push(
        `<rect x="${cx}" y="${subY}" width="${colW}" height="${subRow}" fill="#fafafa" stroke="#334155" stroke-width="0.8"/>`,
        `<text x="${cx + colW / 2}" y="${subY + subRow / 2 + 4}" font-family="Cairo, Arial, sans-serif" font-size="11" font-weight="600" fill="#475569" text-anchor="middle">${formatNumeralsByModeSSOT(col.name, numeralMode)}</text>`,
        `<rect x="${cx}" y="${digY}" width="${colW}" height="${dRow}" fill="#ffffff" stroke="#334155" stroke-width="0.8"/>`
      );
      if (col.digit !== undefined && col.digit !== "") {
        svgParts.push(`<text x="${cx + colW / 2}" y="${digY + dRow / 2 + 6}" font-family="Cairo, Arial, sans-serif" font-size="18" font-weight="900" fill="#0f172a" text-anchor="middle">${formatNumeralsByModeSSOT(col.digit, numeralMode)}</text>`);
      }
    });
    curX += pw;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${tableW} ${totalH}" class="w-full h-auto select-none" style="background:#ffffff">${svgParts.join("")}</svg>`;
}
