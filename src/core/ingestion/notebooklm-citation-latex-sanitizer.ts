/**
 * @file notebooklm-citation-latex-sanitizer.ts
 * @description مطهر ردود NotebookLM من أرقام الهوامش والاقتباس مثل `【1:2†source】` أو `[1]`،
 * مع حماية الفترات المغلقة والمفتوحة مثل `[2, 5]` و `]1, 4[` وأرقام الأسئلة في بداية السطر،
 * وتطبيع الرياضيات المصرية عبر `normalizeToEgyptianSchoolMath` وضبط الوحدات العربية.
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
      const dollarMatches = line.match(/\$/g);
      if (!dollarMatches || dollarMatches.length % 2 === 0) {
        return line;
      }
      // إذا كان هناك علامة $ يتيمة واحدة فقط في السطر بدون تعبير رياضي واضح، نحذفها؛ وإلا نغلقها في آخر السطر
      if (dollarMatches.length === 1 && !/[=+\-^\\/]/.test(line)) {
        return line.replace(/\$/, "");
      }
      return `${line}$`;
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

  // 1. إزالة أسوار Markdown العشوائية (```markdown ... ```) وعلامات الاقتباس الصريحة 【1:2†source】
  let text = rawResponse
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

  // 3. تنظيف البادئات الهيكلية المتسربة داخل المتن مثل [TEXT]: أو معرف_الفكرة: idea-01
  text = text
    .replace(/\[(?:TEXT|PROMPT|SOLUTION|ANSWER)\]\s*:?\s*/gi, "")
    .replace(/^\s*معرف_الفكرة\s*:\s*idea-\d+\s*$/gim, "");

  // 4. إحصاء وتوحيد محددات \( ... \) و \[ ... \]
  text = text.replace(/\\\((.+?)\\\)/g, (_m, inner: string) => {
    normalizedLatexDelimitersCount += 1;
    return `$${inner.trim()}$`;
  });
  text = text.replace(/\\\[([\s\S]+?)\\\]/g, (_m, inner: string) => {
    normalizedLatexDelimitersCount += 1;
    return `$${inner.trim()}$`;
  });

  // 5. تطبيع الرياضيات المصرية (الفترات ]a, b[، المجال ح - {...}، أوامر LaTeX المكشوفة، وفك \text العربي)
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
