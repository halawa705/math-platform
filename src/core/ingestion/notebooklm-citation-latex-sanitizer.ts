/**
 * @file notebooklm-citation-latex-sanitizer.ts
 * @description مطهر ردود NotebookLM من أرقام الهوامش والاقتباس مثل `【1:2†source】` أو `[1]`،
 * وعبارات المحادثة الذكية الختامية (`💡 خطوة تالية اقتراحية...`) وفواصل `---`،
 * وفك هروب `\$` وتطبيع الرياضيات المصرية عبر `normalizeToEgyptianSchoolMath` وضبط الوحدات العربية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import { canonicalizeMathText } from "../math-text/math-text-canonicalizer";

export const MODULE_ID_NOTEBOOKLM_CITATION_LATEX_SANITIZER =
  "notebooklm_citation_latex_sanitizer" as const;

export interface SanitizedNotebookLMResponseResult {
  readonly cleanedText: string;
  readonly removedCitationsCount: number;
  readonly normalizedLatexDelimitersCount: number;
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
    .replace(/(?:^|\n)\s*💡\s*هل\s+(?:ترغب|تود)[^\n]*/gi, "")
    .replace(/(?:^|\n|\s+)(?:💡\s*)?(?:خطوة\s+تالية\s+اقتراحية|اقتراح\s+الخطوة\s+التالية|خطوة\s+اقتراحية|هل\s+تود\s+الانتقال|هل\s+ترغب\s+في\s+الانتقال|بانتظار\s+تعليماتك|إذا\s+كنت\s+مستعداً)[\s\S]*$/gi, "")
    .replace(/💡\s*[\u0600-\u06FF\s:]*$/gi, "")
    .replace(/^\s*[-*_]{3,}\s*$/gm, "\n\n")
    .replace(/(?<!\|[ \t]*)\s*---+\s*(?![ \t]*\|)/g, "\n\n")
    .replace(/^\s*معرف_الفكرة\s*:\s*idea-\d+\s*$/gim, "")
    .replace(
      /\[\s*(رسم\s*(?:هندسي|توضيحي|بياني)\s*:[^\]]*)\]/gi,
      (_m, inner: string) => `[${inner.trim()}]`
    )
    .replace(
      /(?:^|(?<![\[أ-ي]))(رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*[^\]\n]+)\]/gi,
      "[$1]"
    );

  // 3.5 تطبيع أوسمة هيكلة الأسئلة الإنجليزية والمختلطة إلى الأوسمة العربية القياسية قبل معالجة الرياضيات
  text = text
    .replace(/(?:^|\n)\s*\[?\s*نموذج\s+الإجابة\s+الرسمي[\s\S]*$/i, "")
    .replace(
      /===\s*\[\s*(?:QUESTION|سؤال|Q)\s*:\s*(\d+)\s*\]([^\n=]*?)===/gi,
      (_m, qNum: string, tail: string) => {
        const kindMatch = tail.match(/النوع\s*:\s*\[?\s*([^\]|\n]+?)\s*\]?(?=\s*\||$)/i);
        const marksMatch = tail.match(/الدرجة\s*:\s*\[?\s*(\d+(?:\.\d+)?)\s*\]?/i);
        const extraLines: string[] = [];
        if (kindMatch?.[1]) extraLines.push(`النوع: ${kindMatch[1].trim()}`);
        if (marksMatch?.[1]) extraLines.push(`الدرجة: ${marksMatch[1].trim()}`);
        return `=== [سؤال: ${qNum}] ===${extraLines.length ? `\n${extraLines.join("\n")}` : ""}`;
      }
    )
    .replace(/^\s*(?:#{1,4}\s*)?\[\s*(?:QUESTION|سؤال|Q)\s*:\s*(\d+)\s*\][^\n]*/gim, "=== [سؤال: $1] ===")
    .replace(/^\s*(?:\[\s*TYPE\s*\]|TYPE|النوع|النمط)\s*:\s*(?:multiple_choice|mcq|اختر[^\n]*)\s*$/gim, "النوع: اختر")
    .replace(/^\s*(?:\[\s*TYPE\s*\]|TYPE|النوع|النمط)\s*:\s*(?:short_answer|short|إجابة\s*قصيرة)\s*$/gim, "النوع: إجابة قصيرة")
    .replace(/^\s*(?:\[\s*TYPE\s*\]|TYPE|النوع|النمط)\s*:\s*(?:completion|complete|أكمل)\s*$/gim, "النوع: أكمل")
    .replace(/^\s*(?:\[\s*TYPE\s*\]|TYPE|النوع|النمط)\s*:\s*(?:proof|essay|مقالي|برهان)\s*$/gim, "النوع: مقالي")
    .replace(/^\s*\[\s*TYPE\s*\]\s*:\s*([^\n]+)$/gim, "النوع: $1")
    .replace(/^\s*\[\s*MARKS\s*\]\s*:\s*([^\n]+)$/gim, "الدرجة: $1")
    .replace(/^\s*\[\s*(?:TEXT|PROMPT)\s*\]\s*:\s*/gim, "النص: ")
    .replace(/^\s*\[\s*(?:OPTIONS|CHOICES)\s*\]\s*:\s*/gim, "البدائل: ")
    .replace(/^\s*\[\s*(?:ANSWER|CORRECT_ANSWER)\s*\]\s*:\s*/gim, "الإجابة_الصحيحة: ")
    .replace(/^\s*\[\s*ACCEPTED_ANSWERS\s*\]\s*:\s*/gim, "الإجابات_المقبولة: ")
    .replace(/^\s*\[\s*(?:SOLUTION|STEPS)\s*\]\s*:\s*/gim, "خطوات_الحل: ");

  // 4. تطبيع هلوسة تسميات الأشعة في الزوايا المتجمعة (4 أشعة مع تعامد وهمي بحرف E)
  text = healFourRaysHallucination(text);

  // 5. خط الأنابيب الرياضي الوحيد: توحيد المحددات + الفترات + العربي داخل الرياضيات + التشابه + الوحدات + بوابة التسرب
  text = canonicalizeMathText(text);

  return {
    cleanedText: text.trim(),
    removedCitationsCount,
    normalizedLatexDelimitersCount,
  };
}

export function healFourRaysHallucination(text: string): string {
  if (!text) return "";
  return text
    .replace(
      /(أربعة\s*أشعة\s*تخرج\s*من\s*النقطة\s*([A-Za-z]|[أ-ي]ـ?)[\s\S]*?)(?:\\+vec\{([A-Za-z])E\}|([A-Za-z])E)\s*(?:⊥|\\+perp|عمودي\s*على)\s*(?:\\+vec\{([A-Za-z])A\}|([A-Za-z])A)/gi,
      (m, prefix, v, r1a, r1b, r2a, r2b) => `${prefix}\\vec{${r1a || r1b}D} ⊥ \\vec{${r2a || r2b}A}`
    )
    .replace(
      /(أربعة\s*أشعة\s*تخرج\s*من\s*النقطة\s*([A-Za-z]|[أ-ي]ـ?)[\s\S]*?)(?:\\+vec\{([A-Za-z])A\}|([A-Za-z])A)\s*(?:⊥|\\+perp|عمودي\s*على)\s*(?:\\+vec\{([A-Za-z])E\}|([A-Za-z])E)/gi,
      (m, prefix, v, r1a, r1b, r2a, r2b) => `${prefix}\\vec{${r1a || r1b}A} ⊥ \\vec{${r2a || r2b}D}`
    )
    .replace(
      /(أربعة\s*أشعة\s*تخرج\s*من\s*النقطة\s*([أ-ي]ـ?)[\s\S]*?)(?:الشعاع\s+)?([أ-ي]ـ?)\s*هـ\s*(?:⊥|متعامد\s+على|عمودي\s+على)\s*(?:الشعاع\s+)?([أ-ي]ـ?)\s*أ/gi,
      "$1الشعاع $3 د ⊥ الشعاع $4 أ"
    )
    .replace(
      /(أربعة\s*أشعة\s*تخرج\s*من\s*النقطة\s*([أ-ي]ـ?)[\s\S]*?)(?:الشعاع\s+)?([أ-ي]ـ?)\s*أ\s*(?:⊥|متعامد\s+على|عمودي\s+على)\s*(?:الشعاع\s+)?([أ-ي]ـ?)\s*هـ/gi,
      "$1الشعاع $3 أ ⊥ الشعاع $4 د"
    );
}

/**
 * تطهير نصوص المسائل والتدريبات والأمثلة والواجبات الموجهة للطالب في المطبوعات الرسمية:
 * يحذف وسوم الرسوم الهندسية [رسم هندسي: ...] والبيانية بجميع أنواعها حتى لو امتدت لعدة أسطر،
 * ويزيل وسوم التصنيف [أكمل]، [اختر]، ومعرفات الفكرة والمسألة، وعبارات الخطوات الاقتراحية.
 */
export function cleanStudentFacingMathPromptSSOT(rawText: string): string {
  if (!rawText) return "";
  const healed = healFourRaysHallucination(rawText);
  return healed
    .replace(/\[\s*رسم\s*(?:هندسي|بياني|توضيحي|تخطيطي)[\s\S]*?\]\.?\s*/gi, "")
    .replace(/(?:^|\n)\s*(?:الرسم|رسم|الشكل)(?:\s*(?:المقابل|الهندسي|البياني|التوضيحي|التخطيطي))?\s*:[^\n]*/gi, "")
    .replace(/(?:^|\n)\s*(?:الرسم|رسم|الشكل)\s*$/gim, "")
    .replace(/(?:^|\n)\s*(?:لا يوجد رسم|بدون رسم|لا رسم)[^\n]*/gi, "")
    .replace(/(?:^|\n)\s*(?:الإجابة_الصحيحة|الإجابة الصحيحة|إجابة_الصحيحة|إجابة الصحيحة|الإجابة|الحل|خطوات الحل|خطوات_الحل)\s*:[^\n]*/gi, "")
    .replace(/(?:💡\s*)?(?:خطوة\s+تالية\s+اقتراحية|اقتراح\s+الخطوة\s+التالية|خطوة\s+اقتراحية)[\s\S]*$/gi, "")
    .replace(/^\s*#{1,4}\s*\[\s*(?:QUESTION|سؤال|Q)\s*:\s*\d+\s*\]\s*$/gim, "")
    .replace(/^\s*\[\s*(?:TYPE|MARKS|OPTIONS|CHOICES)\s*\]\s*:\s*[^\n]*$/gim, "")
    .replace(/^\s*\[\s*(?:TEXT|PROMPT|ANSWER|SOLUTION)\s*\]\s*:\s*/gim, "")
    .replace(/\{\s*محافظة\s+[^}\n]+\s*\}/g, "")
    .replace(/\|\s*نوع\s*المسألة\s*:\s*\[?[^|\n\]]+\]?/gi, "")
    .replace(/\|\s*معرف\s*(?:السؤال|المثال|الفكرة)\s*:\s*[^\n|]+/gi, "")
    .replace(/^(?:معرف\s*(?:السؤال|المثال|الفكرة))\s*:\s*[^\n]+/gim, "")
    .replace(/\[\s*(?:أكمل|اختر|مقالي|مسألة|تطبيق|متقدم)\s*\]/gi, "")
    .replace(/\bidea[-_]\d+\b/i, "")
    .replace(/(?<=[^\n])\s*(?=(?:أولاً|ثانياً|ثالثاً|رابعاً)\s*:)/g, "\n\n• ")
    .trim();
}
