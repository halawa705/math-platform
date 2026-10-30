/**
 * @file math-latex-latin-symbols-arabic-localizer.ts
 * @description عند اختيار الترميز العربي: يحوّل الأحرف اللاتينية الباقية في LaTeX (رؤوس الأشكال A B C ← أ ب جـ، والمتغيرات x y z ← س ص ع)
 * مع تجاوز أوامر LaTeX (`\sin`, `\overline`…) ومحتوى `\text{}`.
 */
import { localizeGeometricVertexLabelSSOT } from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_MATH_LATEX_LATIN_SYMBOLS_ARABIC_LOCALIZER = "math_latex_latin_symbols_arabic_localizer" as const;

const LOWERCASE_VARIABLES: Readonly<Record<string, string>> = { x: "س", y: "ص", z: "ع" };

const TOKEN = /\\text\{[^{}]*\}|\\[A-Za-z]+|\\.|(?<![A-Za-z])([A-Z]{1,6})(?![A-Za-z])|(?<![A-Za-z])([xyz])(?![A-Za-z])/g;

/** يحوّل متتالية حروف كبيرة؛ الحرف غير المسجل في SSOT يبقى كما هو. */
function convertCapitalRun(run: string): string {
  const letters = [...run].map((ch) => localizeGeometricVertexLabelSSOT(ch, "arabic"));
  return letters.some((l, i) => l !== run[i]) ? `\\text{${letters.join(" ")}}` : run;
}

export function localizeLatinSymbolsInLatexToArabic(latex: string): string {
  if (!latex) return "";
  return latex.replace(TOKEN, (m, capitals: string | undefined, variable: string | undefined) => {
    if (capitals) return convertCapitalRun(capitals);
    if (variable) return `\\text{${LOWERCASE_VARIABLES[variable]}}`;
    return m;
  });
}
