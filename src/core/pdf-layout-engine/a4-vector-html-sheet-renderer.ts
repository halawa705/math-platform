/**
 * @file a4-vector-html-sheet-renderer.ts
 * @description مصير صفحات A4 HTML/SVG بالطابع الوزاري المصري الفاخر (المعاصر / الفارس المطوّر)
 * والخلفية البيضاء الناصعة (#ffffff).
 * يوفر حزمة الأمثلة والأسئلة الرياضية القياسية (تتضمن كسوراً جبرية وأشكالاً هندسية متجهية SVG مدمجة)
 * بدون أي تسرب لرموز LaTeX أو ازدواجية في الأرقام.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import type { CanonicalGeometryFigureIR } from "../ssot/geometry-archetype-ssot";
import type { PrintColorThemeId } from "../ssot/pdf-print-settings-ssot";

export const MODULE_ID_A4_VECTOR_HTML_SHEET_RENDERER =
  "a4_vector_html_sheet_renderer" as const;

export interface PrintableMathQuestionItem {
  readonly id: string;
  readonly questionNumber: number;
  readonly kind: "mcq" | "essay_geometry" | "essay_algebra";
  readonly branchBadgeAr: string;
  readonly marks: number;
  readonly promptAr: string;
  readonly mcqChoicesAr?: readonly [string, string, string, string];
  readonly modelAnswerAr: string;
  readonly geometryFigure?: CanonicalGeometryFigureIR;
}

export function resolvePrintThemePalette(themeId: PrintColorThemeId) {
  if (themeId === "math_teal") {
    return {
      primaryHex: "#0F766E",
      secondaryHex: "#115E59",
      badgeBgHex: "#F0FDFA",
      borderHex: "#0D9488",
    };
  }
  if (themeId === "photocopy_black") {
    return {
      primaryHex: "#000000",
      secondaryHex: "#1E293B",
      badgeBgHex: "#F8FAFC",
      borderHex: "#000000",
    };
  }
  return {
    primaryHex: "#1E1B4B",
    secondaryHex: "#312E81",
    badgeBgHex: "#EEF2FF",
    borderHex: "#4338CA",
  };
}
