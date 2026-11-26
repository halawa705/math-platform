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

export type PrintPaperTemplateId =
  | "classic_sovereign"
  | "modern_editorial_handout"
  | "official_school_exam";

export type DocumentAnswerVisibilityMode =
  | "questions_only"
  | "questions_with_answers"
  | "answer_key_only";

export type ExactPrintFontSizePt = 10.5 | 11 | 11.5 | 12 | 12.5 | 13 | 13.5 | 14 | 15 | 16;

export type PageDensityBudgetMode =
  | "ultra_compact"
  | "standard_balanced"
  | "booklet_relaxed";

export type PageColumnsLayoutMode = 1 | 2;

export type AnswerSpaceStyleMode = "lined" | "dotted" | "grid" | "blank" | "hidden";

export type PrintColorThemeId =
  | "sky_editorial"
  | "royal_indigo"
  | "emerald_moasser"
  | "math_teal"
  | "amber_gold"
  | "navy_gold"
  | "photocopy_black";

export type WatermarkRenderMode = "decorative_svg" | "custom_image";

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
  readonly paperTemplateId?: PrintPaperTemplateId;
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
  readonly autoFitMode?: "off" | "booklet_fill" | "exam_max_pages";
  readonly figureScale?: number;
  readonly answerSpaceLines?: 1 | 2 | 3;
  readonly essayAnswerLinesCount?: number;
  readonly hasManualEssayLinesLock?: boolean;
  readonly compactHeader?: boolean;
  readonly hideAccreditation?: boolean;
  readonly boldProseText?: boolean;
  readonly boldMathExpressions?: boolean;
  readonly watermarkEnabled?: boolean;
  readonly watermarkText?: string;
  readonly watermarkOpacityPct?: number;
  readonly watermarkMode?: WatermarkRenderMode;
  readonly watermarkImageDataUrl?: string;
  readonly watermarkRotationDeg?: number;
  readonly customDocumentTitle: string;
  readonly customDurationText: string;
}

export const DEFAULT_PDF_PRINT_SETTINGS_SSOT: PDFPrintSettingsStateSSOT = {
  paperTemplateId: "modern_editorial_handout",
  numeralMode: "western",
  notationLanguage: "english",
  fontFamilyId: "cairo",
  exactFontSizePt: 12.5,
  answerVisibilityMode: "questions_only",
  densityMode: "ultra_compact",
  columnsCount: 2,
  showColumnDivider: true,
  answerSpaceStyle: "dotted",
  essayAnswerLinesCount: 3,
  colorThemeId: "sky_editorial",
  autoFitMode: "booklet_fill",
  boldProseText: false,
  boldMathExpressions: true,
  watermarkEnabled: true,
  watermarkText: "أ/ إسلام محمد",
  watermarkOpacityPct: 16,
  watermarkMode: "decorative_svg",
  watermarkRotationDeg: 0,
  customDocumentTitle: "مستند رياضيات",
  customDurationText: "ساعة ونصف",
};

const PDF_PRINT_SETTINGS_STORAGE_KEY =
  "math_platform_pdf_print_settings_ssot_v3" as const;

const VALID_PAPER_TEMPLATES: readonly PrintPaperTemplateId[] = [
  "classic_sovereign",
  "modern_editorial_handout",
  "official_school_exam",
];

const VALID_COLOR_THEMES: readonly PrintColorThemeId[] = [
  "sky_editorial",
  "royal_indigo",
  "emerald_moasser",
  "math_teal",
  "amber_gold",
  "navy_gold",
  "photocopy_black",
];

/**
 * يسترجع إعدادات تخصيص ورقة الـ PDF المحفوظة للمعلم، أو يرجع الإعدادات الافتراضية المعتمدة.
 */
export function loadPersistedPDFPrintSettingsSSOT(): PDFPrintSettingsStateSSOT {
  if (typeof window === "undefined") return DEFAULT_PDF_PRINT_SETTINGS_SSOT;
  try {
    const raw = window.localStorage.getItem(PDF_PRINT_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_PDF_PRINT_SETTINGS_SSOT;
    const parsed = JSON.parse(raw) as Partial<PDFPrintSettingsStateSSOT>;
    const rawOpacity =
      typeof parsed.watermarkOpacityPct === "number" && !Number.isNaN(parsed.watermarkOpacityPct)
        ? Math.max(0, Math.min(100, Math.round(parsed.watermarkOpacityPct)))
        : (DEFAULT_PDF_PRINT_SETTINGS_SSOT.watermarkOpacityPct ?? 16);

    return {
      ...DEFAULT_PDF_PRINT_SETTINGS_SSOT,
      ...parsed,
      paperTemplateId:
        parsed.paperTemplateId && VALID_PAPER_TEMPLATES.includes(parsed.paperTemplateId)
          ? parsed.paperTemplateId
          : DEFAULT_PDF_PRINT_SETTINGS_SSOT.paperTemplateId,
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
        parsed.colorThemeId && VALID_COLOR_THEMES.includes(parsed.colorThemeId)
          ? parsed.colorThemeId
          : DEFAULT_PDF_PRINT_SETTINGS_SSOT.colorThemeId,
      boldProseText:
        typeof parsed.boldProseText === "boolean"
          ? parsed.boldProseText
          : DEFAULT_PDF_PRINT_SETTINGS_SSOT.boldProseText,
      boldMathExpressions:
        typeof parsed.boldMathExpressions === "boolean"
          ? parsed.boldMathExpressions
          : DEFAULT_PDF_PRINT_SETTINGS_SSOT.boldMathExpressions,
      watermarkEnabled:
        typeof parsed.watermarkEnabled === "boolean"
          ? parsed.watermarkEnabled
          : DEFAULT_PDF_PRINT_SETTINGS_SSOT.watermarkEnabled,
      watermarkText:
        typeof parsed.watermarkText === "string"
          ? parsed.watermarkText
          : DEFAULT_PDF_PRINT_SETTINGS_SSOT.watermarkText,
      watermarkOpacityPct: rawOpacity,
      watermarkMode:
        parsed.watermarkMode === "custom_image" || parsed.watermarkMode === "decorative_svg"
          ? parsed.watermarkMode
          : DEFAULT_PDF_PRINT_SETTINGS_SSOT.watermarkMode,
      watermarkRotationDeg:
        typeof parsed.watermarkRotationDeg === "number"
          ? parsed.watermarkRotationDeg
          : DEFAULT_PDF_PRINT_SETTINGS_SSOT.watermarkRotationDeg,
    };
  } catch {
    return DEFAULT_PDF_PRINT_SETTINGS_SSOT;
  }
}

/**
 * يحفظ أي تغيير يختاره المعلم في تخصيص الصفحة (الخط، الحجم، الأرقام، الرموز، اللون، الأعمدة، العلامة المائية).
 */
export function savePersistedPDFPrintSettingsSSOT(
  settings: PDFPrintSettingsStateSSOT
): void {
  if (typeof window === "undefined") return;
  const { customDocumentTitle: _ignoreTitle, ...persistedPrefs } = settings;
  try {
    window.localStorage.setItem(
      PDF_PRINT_SETTINGS_STORAGE_KEY,
      JSON.stringify(persistedPrefs)
    );
  } catch {
    try {
      const { watermarkImageDataUrl: _dropLargeImg, ...lightweight } = persistedPrefs;
      window.localStorage.setItem(
        PDF_PRINT_SETTINGS_STORAGE_KEY,
        JSON.stringify(lightweight)
      );
    } catch {
      // ignore storage write error
    }
  }
}
