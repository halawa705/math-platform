/**
 * @file math-latex-balanced-repair.ts
 * @description المرحلة 3: إصلاح محتوى مقطع رياضي واحد (idempotent): أوامر ناقصة الشرطة المائلة،
 * شرطات يتيمة، `//` للتوازي، `~` للتشابه، توازن الأقواس، وتوحيد المسافات.
 */

import { repairBraceBalance } from "./math-balanced-brace-scanner";

export const MODULE_ID_MATH_LATEX_BALANCED_REPAIR =
  "math_latex_balanced_repair" as const;

const COMMANDS_MISSING_BACKSLASH =
  /(^|[^\\A-Za-z])(frac|dfrac|tfrac|sqrt|text|textbf|mathrm|mathbf|overline|overrightarrow|widehat|vec|bar|hat|xrightarrow)(?=[{[])/g;

export function repairMathLatex(inner: string): string {
  const repaired = inner
    .replace(/\\+\s*=/g, " = ")
    .replace(/^\s*\\+(?![A-Za-z{])\s*/, "")
    .replace(/\s*\\+\s*$/, "")
    .replace(COMMANDS_MISSING_BACKSLASH, "$1\\$2")
    .replace(/\\(?:dfrac|tfrac|dft)(?=\{)/g, "\\frac")
    .replace(/\\(?:text|mathrm|textbf)\{\s*\}/g, "")
    .replace(/\s*\/\/\s*/g, " \\parallel ")
    .replace(/\s*(?<!\\)~\s*/g, " \\sim ")
    .replace(/\s+/g, " ")
    .trim();
  return repairBraceBalance(repaired);
}
