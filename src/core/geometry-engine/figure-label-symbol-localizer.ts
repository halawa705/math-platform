/**
 * @file figure-label-symbol-localizer.ts
 * @description توطين نصوص تسميات الأشكال (أطوال/زوايا جبرية مثل X سم و (3X-18)°) وفق ترميز المستند:
 * عربي: X ← س، Y ← ص ...؛ إنجليزي: س ← X ... ، ثم تنسيق الأرقام. مستقل عن LaTeX لأن الـ SVG نص عادي.
 */
import {
  formatNumeralsByModeSSOT,
  localizeGeometricVertexLabelSSOT,
  type MathNotationLanguage,
  type NumeralDisplayMode,
} from "@/core/ssot/numeral-and-unit-ssot";

export const MODULE_ID_FIGURE_LABEL_SYMBOL_LOCALIZER = "figure_label_symbol_localizer" as const;

const LATIN_RUN = /(?<![A-Za-z])([A-Za-z]{1,3})(?![A-Za-z])/g;
const ARABIC_LETTER_RUN = /(?<![\u0621-\u064A])([سصعزحيكلط])(?![\u0621-\u064A])/g;

export function localizeFigureLabelText(text: string, notation: MathNotationLanguage, numeralMode: NumeralDisplayMode): string {
  const symbols =
    notation === "arabic"
      ? text.replace(LATIN_RUN, (run) => [...run.toUpperCase()].map((ch) => localizeGeometricVertexLabelSSOT(ch, "arabic")).join(""))
      : text.replace(ARABIC_LETTER_RUN, (ch) => localizeGeometricVertexLabelSSOT(ch, "english"));
  return formatNumeralsByModeSSOT(symbols, numeralMode);
}
