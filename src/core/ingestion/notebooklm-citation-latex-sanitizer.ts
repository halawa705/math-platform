/**
 * @file notebooklm-citation-latex-sanitizer.ts
 * @description مطهر ردود NotebookLM من أرقام الهوامش والاقتباس مثل `[1]` أو `[2, 3]`،
 * وتطبيع محددات LaTeX (`\(...\)` -> `$...$`)، وتحويل `\setminus` إلى `-`،
 * وضبط مواضع الوحدات العربية عبر `normalizeArabicUnitPlacementSSOT`.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import { normalizeArabicUnitPlacementSSOT } from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_NOTEBOOKLM_CITATION_LATEX_SANITIZER =
  "notebooklm_citation_latex_sanitizer" as const;

export interface SanitizedNotebookLMResponseResult {
  readonly cleanedText: string;
  readonly removedCitationsCount: number;
  readonly normalizedLatexDelimitersCount: number;
}

/**
 * يطهر النص الخام القادم من NotebookLM مع حماية أوسمة الهيكلة القياسية مثل `[QUESTION: 1]` و `[UNIT: 1]` و `[رسم هندسي: ...]`.
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

  // 1. إزالة مراجع الاقتباس الرقمية البحتة مثل [1] أو [12, 15] أو [1-3] دون المساس بـ [UNIT: 1] أو [فترة]
  let text = rawResponse.replace(
    /\s*\[(\d+(?:\s*[,،-]\s*\d+)*)\](?!\s*[∪∩-])/g,
    () => {
      removedCitationsCount += 1;
      return "";
    }
  );

  // 2. توحيد محددات LaTeX: تحويل \( ... \) إلى $ ... $ وتحويل \[ ... \] إلى $$ ... $$
  text = text.replace(/\\\((.+?)\\\)/g, (_m, inner: string) => {
    normalizedLatexDelimitersCount += 1;
    return `$${inner.trim()}$`;
  });

  text = text.replace(/\\\[([\s\S]+?)\\\]/g, (_m, inner: string) => {
    normalizedLatexDelimitersCount += 1;
    return `$$${inner.trim()}$$`;
  });

  // 3. تحويل رمز فرق المجموعات \setminus إلى علامة الطرح المدرسية القياسية -
  text = text.replace(/\\setminus/g, " - ");

  // 4. تطبيع مواضع وحدات القياس العربية لتأتي دائماً بعد العدد ("8 سم" بدلاً من "سم 8")
  text = normalizeArabicUnitPlacementSSOT(text);

  return {
    cleanedText: text.trim(),
    removedCitationsCount,
    normalizedLatexDelimitersCount,
  };
}
