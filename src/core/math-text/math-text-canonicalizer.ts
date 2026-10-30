/**
 * @file math-text-canonicalizer.ts
 * @description المنسّق الوحيد لخط أنابيب النص الرياضي. يُستدعى **مرة واحدة** عند الاستيراد وينتج نصاً قانونياً
 * (Canonical Text: عربي عادي + `$..$` لكل رياضيات/رمز لاتيني + وحدات ملتصقة بالأعداد) و**idempotent**:
 * `canonicalizeMathText(canonicalizeMathText(x)) === canonicalizeMathText(x)`.
 */

import { balanceDollarsInLine, mapMathSegments, mapTextSegments, splitDollarSegments, wrapMath } from "./math-dollar-segment-utils";
import { unifyMathDelimiters } from "./math-delimiter-unifier";
import { convertEgyptianIntervals } from "./math-interval-egyptian-converter";
import { repairMathLatex } from "./math-latex-balanced-repair";
import { isolateArabicInMath } from "./math-arabic-script-isolator";
import { wrapNakedLatexInText } from "./math-naked-latex-wrapper";
import { bindLatinNamesAndSimilarity } from "./math-latin-name-and-similarity-binder";
import { bindMeasurementUnits, convertEnglishUnitsToArabic } from "./math-unit-quantity-binder";
import { finalizeMathLine } from "./math-leak-final-gate";

export const MODULE_ID_MATH_TEXT_CANONICALIZER = "math_text_canonicalizer" as const;

function tidyLine(line: string, indentation: string): string {
  const segs = splitDollarSegments(line.replace(/^[ \t]+/, ""));
  const joined = segs
    .map((seg, i) => {
      if (i % 2 === 1) return seg;
      const collapsed = seg.replace(/[ \t]{2,}/g, " ");
      const isGapBetweenMath = i > 0 && i < segs.length - 1 && collapsed === "";
      return isGapBetweenMath ? " " : collapsed;
    })
    .join("");
  return (indentation + joined).replace(/[ \t]+$/g, "");
}

function canonicalizeMathLine(line: string): string {
  let l = convertEnglishUnitsToArabic(line);
  l = balanceDollarsInLine(l);
  l = convertEgyptianIntervals(l);
  l = mapMathSegments(l, (inner) => wrapMath(repairMathLatex(inner)));
  l = mapMathSegments(l, isolateArabicInMath);
  l = mapTextSegments(l, wrapNakedLatexInText);
  l = bindLatinNamesAndSimilarity(l);
  l = bindMeasurementUnits(l);
  l = finalizeMathLine(l);
  return tidyLine(l, line.match(/^[ \t]*/)?.[0] ?? "");
}

export function canonicalizeMathText(raw: string): string {
  if (!raw) return "";
  return unifyMathDelimiters(raw).split("\n").map(canonicalizeMathLine).join("\n");
}
