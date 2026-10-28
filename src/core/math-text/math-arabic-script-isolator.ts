/**
 * @file math-arabic-script-isolator.ts
 * @description المرحلة 4: يفصل العربي من داخل المقطع الرياضي.
 * - العبارة العربية النثرية في المستوى الأعلى تخرج نصاً عادياً بسياق RTL، وتُقسم المعادلة عند علامات العلاقة
 *   إلى ذرات (نص / رياضيات) لتُقرأ من اليمين لليسار بشكل طبيعي.
 * - العربي داخل البسط والمقام يُغلَّف بـ `\text{}`، ووحدات القياس تبقى داخل `\text{ }`.
 */

import { isArabicMeasurementUnit } from "../ssot/arabic-measurement-units-ssot";
import { extractBalancedBraces, isEscapedAt } from "./math-balanced-brace-scanner";
import { wrapMath } from "./math-dollar-segment-utils";
import {
  RELATION_LATEX_TO_UNICODE,
  peelDanglingEdgeOperators,
  splitAtTopLevelRelations,
} from "./math-relation-operator-splitter";

export const MODULE_ID_MATH_ARABIC_SCRIPT_ISOLATOR =
  "math_arabic_script_isolator" as const;

const ARABIC_LETTER = /[\u0621-\u0652\u0670\u0671]/;
const TEXT_COMMAND_OPEN = /^\\(?:text|mathrm|textbf|mathbf)\{/;
const ARABIC_PUNCTUATION_TO_ASCII: Readonly<Record<string, string>> = { "،": ",", "؛": ";", "؟": "?" };

const SHORT_ARABIC_MATH_SYMBOLS: ReadonlySet<string> = new Set([
  "س", "ص", "ع", "ح", "ط", "ن", "ك", "م", "ل", "ف", "د", "ر", "نق", "أ", "ا", "ب", "ج", "جـ",
  "ه", "هـ", "ي", "جا", "جتا", "ظا", "ظتا", "قا", "قتا", "لو", "نها", "أب", "بج", "جد", "أج", "دهـ",
]);

function isProsePhrase(phrase: string): boolean {
  const words = phrase.trim().split(/\s+/).filter(Boolean);
  return words.length >= 2 || (words.length === 1 && !SHORT_ARABIC_MATH_SYMBOLS.has(words[0]));
}

type ScanPiece =
  | { readonly kind: "math"; readonly latex: string }
  | { readonly kind: "prose"; readonly text: string };

function readArabicPhrase(src: string, start: number): { phrase: string; end: number } {
  let j = start;
  let phrase = "";
  while (j < src.length) {
    if (ARABIC_LETTER.test(src[j])) { phrase += src[j++]; continue; }
    if (src[j] === " " && phrase && ARABIC_LETTER.test(src[j + 1] ?? "")) { phrase += src[j++]; continue; }
    break;
  }
  return { phrase, end: j };
}

function scanTopLevelPieces(inner: string): ScanPiece[] {
  const pieces: ScanPiece[] = [];
  let buffer = "";
  let depth = 0;
  const flush = () => { if (buffer.trim()) pieces.push({ kind: "math", latex: buffer }); buffer = ""; };
  const handlePhrase = (phrase: string) => {
    if (depth > 0) buffer += `\\text{${phrase}}`;
    else if (isArabicMeasurementUnit(phrase)) buffer += `\\text{ ${phrase}}`;
    else if (isProsePhrase(phrase)) { flush(); pieces.push({ kind: "prose", text: phrase }); }
    else buffer += `\\text{${phrase}}`;
  };

  let i = 0;
  while (i < inner.length) {
    const ch = inner[i];
    const textOpen = inner.slice(i).match(TEXT_COMMAND_OPEN);
    if (textOpen) {
      const group = extractBalancedBraces(inner, i + textOpen[0].length - 1);
      if (!group) { buffer += inner.slice(i); break; }
      const content = group.content.trim();
      if (depth === 0 && ARABIC_LETTER.test(content)) handlePhrase(content);
      else buffer += inner.slice(i, group.endIndex + 1);
      i = group.endIndex + 1;
      continue;
    }
    if ((ch === "{" || ch === "}") && !isEscapedAt(inner, i)) depth = Math.max(0, depth + (ch === "{" ? 1 : -1));
    if (ARABIC_LETTER.test(ch)) {
      const { phrase, end } = readArabicPhrase(inner, i);
      handlePhrase(phrase);
      i = end;
      continue;
    }
    buffer += ARABIC_PUNCTUATION_TO_ASCII[ch] ?? ch;
    i++;
  }
  flush();
  return pieces;
}

/** إن بدأ التعبير بعلامة علاقة (`= 2`) تُخرج العلامة نصاً قبل الكتلة كي لا تنقلب في RTL. */
function splitLeadingRelation(latex: string): string {
  const trimmed = latex.trim();
  const hit = RELATION_LATEX_TO_UNICODE.find(
    ([token]) =>
      trimmed.startsWith(token) &&
      !(token.startsWith("\\") && /[A-Za-z]/.test(trimmed[token.length] ?? ""))
  );
  if (!hit || trimmed.length === hit[0].length) return wrapMath(trimmed);
  return ` ${hit[1]} ${wrapMath(trimmed.slice(hit[0].length))} `;
}

/** يعيد نصاً قانونياً: إما `$latex$` واحدة، أو تسلسل ذرات (نص ورياضيات) إن وُجد عربي نثري. */
export function isolateArabicInMath(inner: string): string {
  const pieces = scanTopLevelPieces(inner);
  const hasProse = pieces.some((p) => p.kind === "prose");
  if (!hasProse) {
    return splitLeadingRelation(pieces.map((p) => (p.kind === "math" ? p.latex : "")).join(""));
  }
  if (/\\begin\{/.test(inner)) {
    return wrapMath(pieces.map((p) => (p.kind === "math" ? p.latex : `\\text{${p.text}}`)).join(""));
  }

  const atoms: string[] = [];
  for (const piece of pieces) {
    if (piece.kind === "prose") { atoms.push(piece.text); continue; }
    for (const part of splitAtTopLevelRelations(piece.latex)) {
      if (part.kind === "relation") { atoms.push(part.symbol); continue; }
      const { leading, core, trailing } = peelDanglingEdgeOperators(part.latex);
      atoms.push(...leading);
      if (core) atoms.push(wrapMath(core));
      atoms.push(...trailing);
    }
  }
  return ` ${atoms.join(" ")} `;
}
