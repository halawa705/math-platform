/**
 * @file math-dollar-segment-utils.ts
 * @description أدوات تقسيم السطر إلى مقاطع نص (فهرس زوجي) ومقاطع رياضية `$...$` (فهرس فردي)،
 * وموازنة علامات `$` في السطر الواحد دون أن يبتلع `$` ناقص الفقرة كلها.
 */

export const MODULE_ID_MATH_DOLLAR_SEGMENT_UTILS =
  "math_dollar_segment_utils" as const;

const DOLLAR_SEGMENT_SPLITTER = /(\$[^$\n]*\$)/;
const ARABIC_LETTER_GLOBAL = /[\u0621-\u064A]/g;

export function splitDollarSegments(line: string): string[] {
  return line.split(DOLLAR_SEGMENT_SPLITTER);
}

export function wrapMath(latex: string): string {
  const trimmed = latex.trim();
  return trimmed ? `$${trimmed}$` : "";
}

/** يطبّق الدالة على داخل كل مقطع رياضي؛ الدالة تعيد المقطع كاملاً (قد تشمل `$` أو لا). */
export function mapMathSegments(
  line: string,
  transform: (inner: string) => string
): string {
  return splitDollarSegments(line)
    .map((seg, i) => (i % 2 === 1 ? transform(seg.slice(1, -1)) : seg))
    .join("");
}

export function mapTextSegments(
  line: string,
  transform: (text: string) => string
): string {
  return splitDollarSegments(line)
    .map((seg, i) => (i % 2 === 1 ? seg : transform(seg)))
    .join("");
}

export function replaceOutsideMath(
  line: string,
  pattern: RegExp,
  replacer: (substring: string, ...groups: string[]) => string
): string {
  return mapTextSegments(line, (text) => text.replace(pattern, replacer));
}

function arabicLettersInsideMath(line: string): number {
  return splitDollarSegments(line).reduce(
    (sum, seg, i) =>
      i % 2 === 1 ? sum + (seg.match(ARABIC_LETTER_GLOBAL)?.length ?? 0) : sum,
    0
  );
}

/**
 * إن كان عدد `$` فردياً يحذف العلامة التي تُنتج أقل عربي محبوس داخل الرياضيات،
 * ثم يحذف المقاطع الفارغة `$ $`.
 */
export function balanceDollarsInLine(line: string): string {
  const positions: number[] = [];
  for (let i = 0; i < line.length; i++) if (line[i] === "$") positions.push(i);

  let balanced = line;
  if (positions.length % 2 === 1) {
    let bestIndex = positions[positions.length - 1];
    let bestScore = Infinity;
    for (const pos of positions) {
      const score = arabicLettersInsideMath(line.slice(0, pos) + line.slice(pos + 1));
      if (score <= bestScore) {
        bestScore = score;
        bestIndex = pos;
      }
    }
    balanced = line.slice(0, bestIndex) + line.slice(bestIndex + 1);
  }
  return mapMathSegments(balanced, (inner) => (inner.trim() ? `$${inner}$` : " "));
}
