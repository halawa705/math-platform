/**
 * @file notebooklm-citation-latex-sanitizer.ts
 * @description مطهر ردود NotebookLM من أرقام الهوامش والاقتباس مثل `【1:2†source】` أو `[1]`،
 * وعبارات المحادثة الذكية الختامية (`💡 خطوة تالية اقتراحية...`) وفواصل `---`،
 * وفك هروب `\$` وتطبيع الرياضيات المصرية عبر `normalizeToEgyptianSchoolMath` وضبط الوحدات العربية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import { normalizeArabicUnitPlacementSSOT } from "../ssot/numeral-and-unit-ssot";
import { normalizeToEgyptianSchoolMath } from "./egyptian-math-notation-normalizer";

export const MODULE_ID_NOTEBOOKLM_CITATION_LATEX_SANITIZER =
  "notebooklm_citation_latex_sanitizer" as const;

export interface SanitizedNotebookLMResponseResult {
  readonly cleanedText: string;
  readonly removedCitationsCount: number;
  readonly normalizedLatexDelimitersCount: number;
}

/**
 * يوازن علامات `$` في كل سطر على حدة حتى لا يؤدي نسيان علامة `$` واحدة إلى ابتلاع الفقرة كلها.
 */
export function balanceInlineDollarDelimitersPerLine(input: string): string {
  if (!input) return "";
  return input
    .split("\n")
    .map((line) => {
      const cleanedLine = line.replace(/\\+\$/g, "$");
      const dollarMatches = cleanedLine.match(/\$/g);
      if (!dollarMatches || dollarMatches.length % 2 === 0) {
        return cleanedLine;
      }
      if (dollarMatches.length === 1 && !/[=+\-^\\/]/.test(cleanedLine)) {
        return cleanedLine.replace(/\$/, "");
      }
      return `${cleanedLine}$`;
    })
    .join("\n");
}

/**
 * يطهر النص الخام القادم من NotebookLM مع حماية أوسمة الهيكلة القياسية والفترات الرياضية `[أ، ب]`.
 */
export function sanitizeNotebookLMCitationsAndLatex(
  rawResponse: string
): SanitizedNotebookLMResponseResult {
  if (!rawResponse) {
    return {
      cleanedText: "",
      removedCitationsCount: 0,
      normalizedLatexDelimitersCount: 0,
    };
  }

  let removedCitationsCount = 0;
  let normalizedLatexDelimitersCount = 0;

  // 1. فك هروب علامات الدولار \$ الناتجة عن نسخ ردود NotebookLM وإزالة أسوار Markdown وعلامات الاقتباس
  let text = rawResponse
    .replace(/\\+\$/g, () => {
      normalizedLatexDelimitersCount += 1;
      return "$";
    })
    .replace(/^```(?:markdown|latex|text|plain)?\s*$/gim, "")
    .replace(/【[^】]*】/g, () => {
      removedCitationsCount += 1;
      return "";
    })
    .replace(/\[\s*\d+\s*:\s*\d+[^\]]*\]/g, () => {
      removedCitationsCount += 1;
      return "";
    })
    .replace(/\[(?:source|citation|مرجع|المصدر)\s*\d*\]/gi, () => {
      removedCitationsCount += 1;
      return "";
    });

  // 2. إزالة أرقام الهوامش المفردة [1] في نهاية الجمل دون المساس بأرقام الأسئلة في أول السطر أو الفترات [2, 5]
  text = text.replace(
    /(?<![=∈\n\r$])(?<!الفترة\s)(?<!فترة\s)\s*\[(\d{1,2})\](?=\s*(?:[.,،؛؟!\n\r]|$))/g,
    () => {
      removedCitationsCount += 1;
      return "";
    }
  );

  // 3. إزالة فواصل --- العشوائية وعبارات المحادثة الاقتراحية في نهاية رد NotebookLM
  text = text
    .replace(/(?:^|\n|\s+)(?:💡\s*)?(?:خطوة\s+تالية\s+اقتراحية|اقتراح\s+الخطوة\s+التالية|هل\s+تود\s+الانتقال|هل\s+ترغب\s+في\s+الانتقال|بانتظار\s+تعليماتك|إذا\s+كنت\s+مستعداً)[\s\S]*$/gi, "")
    .replace(/^\s*[-*_]{3,}\s*$/gm, "\n\n")
    .replace(/\s*---+\s*/g, "\n\n")
    .replace(/\[(?:TEXT|PROMPT|SOLUTION|ANSWER)\]\s*:?\s*/gi, "")
    .replace(/^\s*معرف_الفكرة\s*:\s*idea-\d+\s*$/gim, "")
    .replace(
      /\[\s*(رسم\s*(?:هندسي|توضيحي|بياني)\s*:[^\]]*)\]/gi,
      (_m, inner: string) => `[${inner.trim()}]`
    )
    .replace(
      /(?:^|(?<![\[أ-ي]))(رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*[^\]\n]+)\]/gi,
      "[$1]"
    );

  // 4. إحصاء وتوحيد محددات \( ... \) و \[ ... \]
  text = text.replace(/\\+\(([\s\S]+?)\\+\)/g, (_m, inner: string) => {
    normalizedLatexDelimitersCount += 1;
    return `$${inner.trim()}$`;
  });
  text = text.replace(/\\+\[([\s\S]+?)\\+\]/g, (_m, inner: string) => {
    normalizedLatexDelimitersCount += 1;
    return `$${inner.trim()}$`;
  });

  // 5. تطبيع الرياضيات المصرية (الفترات ]a, b[، المجال ح - {...}، أوامر LaTeX المكشوفة، وفصل الجمل العربية)
  text = normalizeToEgyptianSchoolMath(text);

  // 6. تطبيع مواضع وحدات القياس العربية لتأتي دائماً بعد العدد ("8 سم" بدلاً من "سم 8")
  text = normalizeArabicUnitPlacementSSOT(text);

  // 7. موازنة محددات $ في كل سطر لمنع انكسار التصيير
  text = balanceInlineDollarDelimitersPerLine(text);

  return {
    cleanedText: text.trim(),
    removedCitationsCount,
    normalizedLatexDelimitersCount,
  };
}
