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
export type WatermarkPlacementMode = "auto" | "front" | "behind";
export type WatermarkCalligraphyFontId = "aref_ruqaa" | "amiri" | "reem_kufi";

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
  readonly watermarkScalePct?: number;
  readonly watermarkPlacement?: WatermarkPlacementMode;
  readonly watermarkCalligraphyFont?: WatermarkCalligraphyFontId;
  readonly watermarkShowFrameOrnament?: boolean;
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
  watermarkScalePct: 100,
  watermarkPlacement: "auto",
  watermarkCalligraphyFont: "aref_ruqaa",
  watermarkShowFrameOrnament: true,
  watermarkMode: "decorative_svg",
  watermarkRotationDeg: 0,
  customDocumentTitle: "مستند رياضيات",
  customDurationText: "ساعة ونصف",
};

const PDF_PRINT_SETTINGS_STORAGE_KEY =
  "math_platform_pdf_print_settings_ssot_v4" as const;
const LEGACY_V3_SETTINGS_STORAGE_KEY =
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

const VALID_PLACEMENTS: readonly WatermarkPlacementMode[] = ["auto", "front", "behind"];
const VALID_CALLIGRAPHY_FONTS: readonly WatermarkCalligraphyFontId[] = ["aref_ruqaa", "amiri", "reem_kufi"];

const clampInt = (v: unknown, min: number, max: number, fb: number): number =>
  typeof v === "number" && !Number.isNaN(v) ? Math.max(min, Math.min(max, Math.round(v))) : fb;

const oneOf = <T extends string>(v: unknown, valid: readonly T[], fb: T): T =>
  typeof v === "string" && (valid as readonly string[]).includes(v) ? (v as T) : fb;

/** يسترجع إعدادات تخصيص ورقة الـ PDF المحفوظة للمعلم، أو يرجع الإعدادات الافتراضية المعتمدة. */
export function loadPersistedPDFPrintSettingsSSOT(): PDFPrintSettingsStateSSOT {
  if (typeof window === "undefined") return DEFAULT_PDF_PRINT_SETTINGS_SSOT;
  try {
    const rawV4 = window.localStorage.getItem(PDF_PRINT_SETTINGS_STORAGE_KEY);
    const rawLegacyV3 = !rawV4 ? window.localStorage.getItem(LEGACY_V3_SETTINGS_STORAGE_KEY) : null;
    const raw = rawV4 || rawLegacyV3;
    if (!raw) return DEFAULT_PDF_PRINT_SETTINGS_SSOT;
    const p = JSON.parse(raw) as Partial<PDFPrintSettingsStateSSOT>;
    const d = DEFAULT_PDF_PRINT_SETTINGS_SSOT;
    const migratedTemplate =
      rawLegacyV3 && p.paperTemplateId === "classic_sovereign"
        ? d.paperTemplateId!
        : oneOf(p.paperTemplateId, VALID_PAPER_TEMPLATES, d.paperTemplateId!);
    const migratedTheme =
      rawLegacyV3 ? d.colorThemeId : oneOf(p.colorThemeId, VALID_COLOR_THEMES, d.colorThemeId);
    return {
      ...d,
      ...p,
      paperTemplateId: migratedTemplate,
      numeralMode: oneOf(p.numeralMode, ["eastern", "western"], d.numeralMode),
      notationLanguage: oneOf(p.notationLanguage, ["arabic", "english"], d.notationLanguage),
      fontFamilyId: p.fontFamilyId && p.fontFamilyId in PRINT_FONT_FAMILIES_SSOT ? p.fontFamilyId : d.fontFamilyId,
      exactFontSizePt:
        typeof p.exactFontSizePt === "number" && p.exactFontSizePt >= 12 && p.exactFontSizePt <= 16
          ? (p.exactFontSizePt as ExactPrintFontSizePt)
          : d.exactFontSizePt,
      colorThemeId: migratedTheme,
      boldProseText: typeof p.boldProseText === "boolean" ? p.boldProseText : d.boldProseText,
      boldMathExpressions: typeof p.boldMathExpressions === "boolean" ? p.boldMathExpressions : d.boldMathExpressions,
      watermarkEnabled: typeof p.watermarkEnabled === "boolean" ? p.watermarkEnabled : d.watermarkEnabled,
      watermarkText: typeof p.watermarkText === "string" ? p.watermarkText : d.watermarkText,
      watermarkOpacityPct: clampInt(p.watermarkOpacityPct, 0, 100, d.watermarkOpacityPct ?? 16),
      watermarkScalePct: clampInt(p.watermarkScalePct, 40, 180, d.watermarkScalePct ?? 100),
      watermarkPlacement: oneOf(p.watermarkPlacement, VALID_PLACEMENTS, d.watermarkPlacement ?? "auto"),
      watermarkCalligraphyFont: oneOf(p.watermarkCalligraphyFont, VALID_CALLIGRAPHY_FONTS, d.watermarkCalligraphyFont ?? "aref_ruqaa"),
      watermarkShowFrameOrnament: typeof p.watermarkShowFrameOrnament === "boolean" ? p.watermarkShowFrameOrnament : d.watermarkShowFrameOrnament,
      watermarkMode: oneOf<WatermarkRenderMode>(
        p.watermarkMode,
        ["custom_image", "decorative_svg"] as const,
        d.watermarkMode ?? "decorative_svg"
      ),
      watermarkRotationDeg: clampInt(p.watermarkRotationDeg, -60, 60, d.watermarkRotationDeg ?? 0),
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
