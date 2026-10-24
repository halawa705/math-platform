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

export type PrintColorThemeId =
  | "royal_indigo"
  | "emerald_moasser"
  | "math_teal"
  | "amber_gold"
  | "photocopy_black";

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
  numeralMode: "western",
  notationLanguage: "english",
  fontFamilyId: "cairo",
  exactFontSizePt: 13,
  answerVisibilityMode: "questions_only",
  densityMode: "ultra_compact",
  columnsCount: 2,
  showColumnDivider: true,
  answerSpaceStyle: "dotted",
  colorThemeId: "math_teal",
  customDocumentTitle: "مستند رياضيات",
  customDurationText: "ساعة ونصف",
};

const PDF_PRINT_SETTINGS_STORAGE_KEY =
  "math_platform_pdf_print_settings_ssot_v2" as const;

/**
 * يسترجع إعدادات تخصيص ورقة الـ PDF المحفوظة للمعلم، أو يرجع الإعدادات الافتراضية المعتمدة:
 * (1- أرقام عربية غربية 0-9، 2- حجم الخط 13pt، 3- خط كايرو، 4- حروف إنجليزية x, y، 5- قالب أزرق).
 */
export function loadPersistedPDFPrintSettingsSSOT(): PDFPrintSettingsStateSSOT {
  if (typeof window === "undefined") return DEFAULT_PDF_PRINT_SETTINGS_SSOT;
  try {
    const raw = window.localStorage.getItem(PDF_PRINT_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_PDF_PRINT_SETTINGS_SSOT;
    const parsed = JSON.parse(raw) as Partial<PDFPrintSettingsStateSSOT>;
    return {
      ...DEFAULT_PDF_PRINT_SETTINGS_SSOT,
      ...parsed,
      numeralMode:
        parsed.numeralMode === "eastern" || parsed.numeralMode === "western"
          ? parsed.numeralMode
          : DEFAULT_PDF_PRINT_SETTINGS_SSOT.numeralMode,
      notationLanguage:
        parsed.notationLanguage === "arabic" ||
        parsed.notationLanguage === "english"
          ? parsed.notationLanguage
          : DEFAULT_PDF_PRINT_SETTINGS_SSOT.notationLanguage,
      fontFamilyId:
        parsed.fontFamilyId && parsed.fontFamilyId in PRINT_FONT_FAMILIES_SSOT
          ? parsed.fontFamilyId
          : DEFAULT_PDF_PRINT_SETTINGS_SSOT.fontFamilyId,
      exactFontSizePt:
        typeof parsed.exactFontSizePt === "number" &&
        parsed.exactFontSizePt >= 12 &&
        parsed.exactFontSizePt <= 16
          ? (parsed.exactFontSizePt as ExactPrintFontSizePt)
          : DEFAULT_PDF_PRINT_SETTINGS_SSOT.exactFontSizePt,
      colorThemeId:
        parsed.colorThemeId || DEFAULT_PDF_PRINT_SETTINGS_SSOT.colorThemeId,
    };
  } catch {
    return DEFAULT_PDF_PRINT_SETTINGS_SSOT;
  }
}

/**
 * يحفظ أي تغيير يختاره المعلم في تخصيص الصفحة (الخط، الحجم، الأرقام، الرموز، اللون، الأعمدة، إلخ) للاستخدام التالي.
 */
export function savePersistedPDFPrintSettingsSSOT(
  settings: PDFPrintSettingsStateSSOT
): void {
  if (typeof window === "undefined") return;
  try {
    const { customDocumentTitle: _ignoreTitle, ...persistedPrefs } = settings;
    window.localStorage.setItem(
      PDF_PRINT_SETTINGS_STORAGE_KEY,
      JSON.stringify(persistedPrefs)
    );
  } catch {
    // ignore storage write error
  }
}
