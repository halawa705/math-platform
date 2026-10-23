/**
 * @file pdf-print-settings-ssot.ts
 * @description المصدر الوحيد للحقيقة (SSOT) لجميع إعدادات معاينة وطباعة ملفات الـ A4 PDF.
 * يربط بين جميع الملفات الذرية المستقلة لأدوات التحكم:
 * 1. `pdf-numeral-system-switch.tsx` (الأرقام الغربية 0-9 / المشرقية ٠-٩)
 * 2. `pdf-font-family-selector.tsx` (نوع الخط: كايرو، المراعي، آي بي إم بلكس، ريدكس، تجوال)
 * 3. `pdf-answer-visibility-mode.tsx` (أسئلة فقط / أسئلة بإجابات / نموذج إجابة فقط)
 * 4. `pdf-exact-fontsize-control.tsx` (حجم الخط الحقيقي بالـ pt: 12pt، 12.5pt، 13pt، 14pt، 15pt، 16pt)
 * 5. `pdf-density-budget-selector.tsx` (كثافة الصفحة وتوفير الأوراق)
 * 6. `pdf-columns-layout-toggle.tsx` (نظام العمود الواحد أو العمودين المتوازيين)
 * 7. `pdf-answer-space-style-selector.tsx` (نوع مساحة الإجابة: مسطرة، منقطة، شبكة تربيعية، مخفية)
 * 8. `pdf-color-theme-selector.tsx` (سمة الطباعة: نيلي ملكي، فيروزي، أسود تصوير ليزري)
 * 9. `pdf-notation-direction-switch.tsx` (رموز الرياضيات: س، ص / x, y)
 * 10. `pdf-header-branding-editor.tsx` (بيانات الترويسة المدمجة 42pt)
 */

import type { MathNotationLanguage, NumeralDisplayMode } from "./numeral-and-unit-ssot";

export type PrintFontFamilyId = "almarai" | "cairo" | "ibm_plex" | "readex_pro" | "tajawal";

export type DocumentAnswerVisibilityMode =
  | "questions_only"
  | "questions_with_answers"
  | "answer_key_only";

export type ExactPrintFontSizePt = 12 | 12.5 | 13 | 13.5 | 14 | 15 | 16;

export type PageDensityBudgetMode =
  | "ultra_compact"
  | "standard_balanced"
  | "booklet_relaxed";

export type PageColumnsLayoutMode = 1 | 2;

export type AnswerSpaceStyleMode = "lined" | "dotted" | "grid" | "blank" | "hidden";

export type PrintColorThemeId = "royal_indigo" | "math_teal" | "photocopy_black";

export interface PrintFontFamilySpecification {
  readonly id: PrintFontFamilyId;
  readonly nameArabic: string;
  readonly cssFontStack: string;
  readonly optimalLineHeight: number;
  readonly spaceSavingFactor: number;
}

export const PRINT_FONT_FAMILIES_SSOT: Record<PrintFontFamilyId, PrintFontFamilySpecification> = {
  almarai: {
    id: "almarai",
    nameArabic: "خط المراعي (Almarai) — فائق الرشاقة وموفر للمساحة",
    cssFontStack: "'Almarai', 'Cairo', system-ui, sans-serif",
    optimalLineHeight: 1.32,
    spaceSavingFactor: 0.82,
  },
  cairo: {
    id: "cairo",
    nameArabic: "خط كايرو (Cairo) — هندسي رسمي للمذكرات والرياضيات",
    cssFontStack: "'Cairo', 'Almarai', system-ui, sans-serif",
    optimalLineHeight: 1.35,
    spaceSavingFactor: 0.90,
  },
  ibm_plex: {
    id: "ibm_plex",
    nameArabic: "خط آي بي إم بلكس (IBM Plex) — تناغم المعادلات",
    cssFontStack: "'IBM Plex Sans Arabic', 'Cairo', system-ui, sans-serif",
    optimalLineHeight: 1.36,
    spaceSavingFactor: 0.92,
  },
  readex_pro: {
    id: "readex_pro",
    nameArabic: "خط ريدكس برو (Readex Pro) — واضح للمرحلة التأسيسية",
    cssFontStack: "'Readex Pro', 'Cairo', system-ui, sans-serif",
    optimalLineHeight: 1.38,
    spaceSavingFactor: 0.96,
  },
  tajawal: {
    id: "tajawal",
    nameArabic: "خط تجوال (Tajawal) — عصري وناعم",
    cssFontStack: "'Tajawal', 'Cairo', system-ui, sans-serif",
    optimalLineHeight: 1.34,
    spaceSavingFactor: 0.86,
  },
};

export interface PDFPrintSettingsStateSSOT {
  readonly numeralMode: NumeralDisplayMode;
  readonly notationLanguage: MathNotationLanguage;
  readonly fontFamilyId: PrintFontFamilyId;
  readonly exactFontSizePt: ExactPrintFontSizePt;
  readonly answerVisibilityMode: DocumentAnswerVisibilityMode;
  readonly densityMode: PageDensityBudgetMode;
  readonly columnsCount: PageColumnsLayoutMode;
  readonly showColumnDivider: boolean;
  readonly answerSpaceStyle: AnswerSpaceStyleMode;
  readonly colorThemeId: PrintColorThemeId;
  readonly targetMaxPages?: number;
  readonly customDocumentTitle: string;
  readonly customDurationText: string;
}

export const DEFAULT_PDF_PRINT_SETTINGS_SSOT: PDFPrintSettingsStateSSOT = {
  numeralMode: "eastern",
  notationLanguage: "arabic",
  fontFamilyId: "almarai",
  exactFontSizePt: 12.5,
  answerVisibilityMode: "questions_only",
  densityMode: "ultra_compact",
  columnsCount: 2,
  showColumnDivider: true,
  answerSpaceStyle: "dotted",
  colorThemeId: "royal_indigo",
  customDocumentTitle: "اختبار تقييمي في الرياضيات",
  customDurationText: "ساعة ونصف",
};
