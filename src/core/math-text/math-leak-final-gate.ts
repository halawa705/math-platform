/**
 * @file math-leak-final-gate.ts
 * @description البوابة الأخيرة ضد التسرب: كل مقطع رياضي يُختبر فعلياً بـ KaTeX؛ إن فشل يتدهور إلى نص Unicode آمن
 * (بلا `\` ولا `{}`)، وأي backslash متبقٍ في النص الخارجي يُزال. وتصدّر `findResidualLeaks` للاختبارات.
 */

import katex from "katex";
import { latexCommandToUnicode } from "./latex-command-unicode-symbol-map";
import { splitDollarSegments } from "./math-dollar-segment-utils";

export const MODULE_ID_MATH_LEAK_FINAL_GATE = "math_leak_final_gate" as const;

function isKatexRenderable(latex: string): boolean {
  try {
    katex.renderToString(latex, { throwOnError: true, strict: "ignore", output: "html" });
    return true;
  } catch {
    return false;
  }
}

export function degradeLatexToPlainUnicode(latex: string): string {
  let s = latex;
  for (let k = 0; k < 6; k++) {
    s = s.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "($1)/($2)");
  }
  return s
    .replace(/\\sqrt\s*\{([^{}]*)\}/g, "√($1)")
    .replace(/\\(?:text|mathrm|textbf|mathbf|overline|widehat|vec|bar|hat)\s*\{([^{}]*)\}/g, "$1")
    .replace(/\\([A-Za-z]+)/g, (_m, name: string) => latexCommandToUnicode(name))
    .replace(/\\./g, " ")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanTextSegment(text: string): string {
  return text
    .replace(/\\([A-Za-z]+)/g, (_m, name: string) => latexCommandToUnicode(name))
    .replace(/\\+/g, " ");
}

export function finalizeMathLine(line: string): string {
  return splitDollarSegments(line)
    .map((seg, i) => {
      if (i % 2 === 0) return cleanTextSegment(seg);
      const inner = seg.slice(1, -1);
      return isKatexRenderable(inner) ? seg : degradeLatexToPlainUnicode(inner);
    })
    .join("");
}

/** قائمة التسريبات المتبقية في نص قانوني (للاختبارات ولوحة التشخيص). */
export function findResidualLeaks(canonical: string): string[] {
  const leaks: string[] = [];
  for (const line of canonical.split("\n")) {
    const segs = splitDollarSegments(line);
    if ((line.match(/\$/g) ?? []).length % 2 !== 0) leaks.push(`unbalanced-dollar: ${line}`);
    segs.forEach((seg, i) => {
      if (i % 2 === 0 && /\\/.test(seg)) leaks.push(`backslash-in-text: ${seg}`);
      if (i % 2 === 1) {
        const withoutText = seg.replace(/\\text\{[^{}]*\}/g, "");
        if (/[\u0621-\u064A]/.test(withoutText)) leaks.push(`arabic-in-math: ${seg}`);
        if (!isKatexRenderable(seg.slice(1, -1))) leaks.push(`katex-fail: ${seg}`);
      }
    });
  }
  return leaks;
}
