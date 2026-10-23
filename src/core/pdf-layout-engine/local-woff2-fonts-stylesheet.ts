/**
 * @file local-woff2-fonts-stylesheet.ts
 * @description تعريفات وقواعد `@font-face` وإعدادات الطباعة لخطوط المراعي (`Almarai`) وكايرو (`Cairo`)
 * و`IBM Plex Sans Arabic` و`Readex Pro` و`Tajawal` لضمان ثبات شكل الحرف والمعادلات عند تصدير الـ PDF.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import {
  PRINT_FONT_FAMILIES_SSOT,
  type PrintFontFamilyId,
  type ExactPrintFontSizePt,
} from "../ssot/pdf-print-settings-ssot";

export const MODULE_ID_LOCAL_WOFF2_FONTS_STYLESHEET =
  "local_woff2_fonts_stylesheet" as const;

export const GOOGLE_FONTS_PRINT_IMPORT_URL =
  "https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&family=Cairo:wght@500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;600;700&family=Readex+Pro:wght@400;600;700&family=Tajawal:wght@400;700;800&display=swap" as const;

/**
 * يولد ورقة الأنماط المطبعية الصارمة لصفحة A4 البيضاء الناصعة مع تضمين عائلة الخط المختارة وحجم الخط الحقيقي بالـ `pt`.
 */
export function buildA4PrintFontsAndPageStylesheet(params: {
  readonly fontFamilyId: PrintFontFamilyId;
  readonly exactFontSizePt: ExactPrintFontSizePt;
}): string {
  const spec = PRINT_FONT_FAMILIES_SSOT[params.fontFamilyId];

  return `
@import url('${GOOGLE_FONTS_PRINT_IMPORT_URL}');

@page {
  size: A4 portrait;
  margin: 6mm;
}

html, body {
  background-color: #ffffff !important;
  color: #0f172a !important;
  font-family: ${spec.cssFontStack};
  font-size: ${params.exactFontSizePt}pt;
  line-height: ${spec.optimalLineHeight};
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  margin: 0;
  padding: 0;
}

.a4-print-sheet {
  width: 210mm;
  min-height: 297mm;
  background-color: #ffffff !important;
  color: #0f172a !important;
  box-sizing: border-box;
  page-break-after: always;
}

article, .math-question-card {
  break-inside: avoid;
  page-break-inside: avoid;
}
`.trim();
}
