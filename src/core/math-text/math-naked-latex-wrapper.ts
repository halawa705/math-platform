/**
 * @file math-naked-latex-wrapper.ts
 * @description المرحلة 5: يعالج أوامر LaTeX المكشوفة في النص الخارجي (بلا `$`):
 * الكسور والجذور والخطوط العلوية تُغلَّف بـ `$..$` بأقواسها المتوازنة، والرموز البسيطة تتحول إلى Unicode،
 * وأي شرطة مائلة يتيمة تُحذف. فلا يبقى أمر LaTeX في النص بأي حال.
 */

import { extractBalancedBraces } from "./math-balanced-brace-scanner";
import { latexCommandToUnicode } from "./latex-command-unicode-symbol-map";

export const MODULE_ID_MATH_NAKED_LATEX_WRAPPER = "math_naked_latex_wrapper" as const;

const ONE_ARG_COMMANDS = "overline|overrightarrow|widehat|vec|bar|hat";
const NAKED_STRUCTURE = new RegExp(
  `(?<![A-Za-z])\\\\?(frac|dfrac|tfrac|sqrt|${ONE_ARG_COMMANDS})(?=[\\{\\[])`
);

function readGroupAfter(text: string, from: number): { content: string; end: number } | null {
  let k = from;
  while (k < text.length && /\s/.test(text[k])) k++;
  const group = extractBalancedBraces(text, k);
  return group ? { content: group.content, end: group.endIndex + 1 } : null;
}

function wrapFirstNakedStructure(
  text: string,
  searchFrom: number
): { readonly text: string; readonly nextFrom: number } | null {
  const scanner = new RegExp(NAKED_STRUCTURE.source, "g");
  scanner.lastIndex = searchFrom;
  const match = scanner.exec(text);
  if (!match) return null;
  const done = (value: string, prefixLength: number, inserted: string) => ({
    text: value,
    nextFrom: prefixLength + inserted.length,
  });
  const name = match[1] === "dfrac" || match[1] === "tfrac" ? "frac" : match[1];
  let cursor = match.index + match[0].length;
  let optional = "";
  if (name === "sqrt" && text[cursor] === "[") {
    const close = text.indexOf("]", cursor);
    if (close > 0) { optional = text.slice(cursor, close + 1); cursor = close + 1; }
  }
  const first = readGroupAfter(text, cursor);
  if (!first) {
    return done(text.slice(0, match.index) + text.slice(match.index + match[0].length), match.index, "");
  }
  let latex = `\\${name}${optional}{${first.content}}`;
  let end = first.end;
  if (name === "frac") {
    const second = readGroupAfter(text, end);
    if (!second) {
      return done(text.slice(0, match.index) + first.content + text.slice(end), match.index, first.content);
    }
    latex += `{${second.content}}`;
    end = second.end;
  }
  const wrapped = ` $${latex}$ `;
  return done(`${text.slice(0, match.index)}${wrapped}${text.slice(end)}`, match.index, wrapped);
}

export function wrapNakedLatexInText(text: string): string {
  if (!/[\\{}]|frac|sqrt/.test(text)) return text;
  let out = text.replace(/\\(?:text|mathrm|textbf|mathbf)\{([^{}]*)\}/g, "$1");
  let searchFrom = 0;
  for (let guard = 0; guard < 40; guard++) {
    const next = wrapFirstNakedStructure(out, searchFrom);
    if (next === null) break;
    out = next.text;
    searchFrom = next.nextFrom;
  }
  // الأجزاء المحيطة بالمقاطع الجديدة فقط تُعالج هنا، لذا نحمي ما بين $ ... $
  return out
    .split(/(\$[^$\n]*\$)/)
    .map((seg, i) =>
      i % 2 === 1
        ? seg
        : seg
            .replace(/(\d)\s*\^\s*\\?circ\b/g, "$1°")
            .replace(/\\([A-Za-z]+)/g, (_m, name: string) => latexCommandToUnicode(name))
            .replace(/\\+/g, " ")
    )
    .join("");
}
