/**
 * @file math-latex-notation-and-numeral-localizer.ts
 * @description المرحلة الوحيدة وقت العرض: تطبيق إعدادات المستند على LaTeX قانونية (لا تطبيع ولا إصلاح هنا):
 * لغة الترميز (س ← x، ح ← ℝ، جا ← sin أو العكس) ثم نظام الأرقام (٠-٩ أو 0-9).
 */

import {
  formatNumeralsByModeSSOT,
  localizeMathExpressionNotationSSOT,
  type MathNotationLanguage,
  type NumeralDisplayMode,
} from "../ssot/numeral-and-unit-ssot";
import {
  ARABIC_TO_LATIN_VERTEX,
  localizeGeometricEntitiesInLatex,
} from "./math-geometric-entity-localizer";
import { localizeLatinSymbolsInLatexToArabic } from "./math-latex-latin-symbols-arabic-localizer";

export const MODULE_ID_MATH_LATEX_NOTATION_AND_NUMERAL_LOCALIZER =
  "math_latex_notation_and_numeral_localizer" as const;

const ARABIC_VARIABLE_TO_LATIN: Readonly<Record<string, string>> = {
  "س": "x", "ص": "y", "ع": "z", "ك": "k", "ح": "\\mathbb{R}",
};

/** كل عربي عارٍ خارج `\text{}` (نتج عن تعريب الرموز) يُغلَّف بـ `\text{}` كي تقبله KaTeX. */
function wrapBareArabicInText(latex: string): string {
  return latex.replace(
    /\\text\{[^{}]*\}|([\u0621-\u064A]+)/g,
    (m, bare: string | undefined) => (bare ? `\\text{${bare}}` : m)
  );
}

export function localizeCanonicalLatex(
  latex: string,
  numeralMode: NumeralDisplayMode,
  notation: MathNotationLanguage
): string {
  let out = localizeMathExpressionNotationSSOT(latex, notation);
  out = localizeGeometricEntitiesInLatex(out, notation);
  if (notation === "arabic") out = localizeLatinSymbolsInLatexToArabic(out);
  if (notation === "english") {
    out = out.replace(/\\text\{\s*([سصعكح])\s*\}/g, (_m, ch: string) => ARABIC_VARIABLE_TO_LATIN[ch]);
    out = out.replace(
      /\\text\{[^{}]*\}|(?<![\u0621-\u064A])([سصعكح]|[أإابجدهوزخيلمنفقرشطتثغ]ـ?)(?![\u0621-\u064A])/g,
      (m, sym: string | undefined) => {
        if (!sym) return m;
        const clean = sym.replace(/\u0640/g, "");
        return ARABIC_VARIABLE_TO_LATIN[clean] || ARABIC_TO_LATIN_VERTEX[clean] || m;
      }
    );
  }
  out = wrapBareArabicInText(out);
  if (/\\frac|\\sqrt/.test(out) && !out.includes("\\displaystyle")) out = `\\displaystyle ${out}`;
  return formatNumeralsByModeSSOT(out, numeralMode);
}

