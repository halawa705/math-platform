/**
 * @file egyptian-math-notation-normalizer.ts
 * @description محول الترميز الرياضي العالمي (القادم من NotebookLM) إلى الاصطلاح الرسمي لوزارة التربية والتعليم المصرية:
 * - فك هروب علامات الدولار `\$` الناتجة عن نسخ ردود NotebookLM وتوحيد `\( ... \)` و `\[ ... \]` و `\ ... \`.
 * - فصل الجمل العربية المحشورة داخل `$ ... $` في المستوى الأعلى لتبقى في سياق RTL الطبيعي،
 *   مع الحفاظ التام على `\text{...}` داخل البسط والمقام (`\frac{\text{عرض النموذج}}{...}`) لمنع التصاق الكلمات العربية.
 * - تحويل الفترات المفتوحة ونصف المفتوحة `(-\infty, a)` و `[a, b)` و `(a, b]` إلى `]-\infty, a[` و `[a, b[` و `]a, b]`.
 * - تحويل فرق المجموعات `\setminus` والمجال `R \ {a}` إلى الصيغة الوزارية `ح - {أ}`.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

export const MODULE_ID_EGYPTIAN_MATH_NOTATION_NORMALIZER =
  "egyptian_math_notation_normalizer" as const;

const SHORT_ARABIC_MATH_SYMBOLS = new Set([
  "س", "ص", "ع", "ح", "ط", "ن", "ك", "م", "ل", "ف", "د", "ر", "نق",
  "أ", "ا", "ب", "ج", "جـ", "ه", "هـ", "ي",
  "جا", "جتا", "ظا", "ظتا", "قا", "قتا", "لو", "نها", "أب", "بج", "جد", "أج", "دهـ",
]);

function isArabicProsePhrase(phrase: string): boolean {
  const words = phrase.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;
  if (words.length >= 2) return true;
  return !SHORT_ARABIC_MATH_SYMBOLS.has(words[0].replace(/[:،؛.؟!]/g, ""));
}

/**
 * يفصل العبارات العربية الموجودة في المستوى الأعلى (خارج الأقواس المعقوفة `{...}`) عن المعادلة الرياضية،
 * بينما يغلف أي نص عربي داخل `{...}` (مثل بسط ومقام `\frac{...}{...}`) بـ `\text{...}` لحفظ المسافات بين الكلمات.
 */
export function separateTopLevelArabicFromMathContent(rawLatex: string): string {
  const cleaned = rawLatex
    .replace(/^\\+(?![a-zA-Z{])\s*/, "")
    .replace(/\s*\\+$/, "")
    .replace(/(^|[^\\])\b(frac|sqrt)\{/g, "$1\\$2{")
    .replace(/\\(?:text|mathrm|textbf)\{\s*(\\frac\{[\s\S]*?\})\s*\}/g, "$1")
    .trim();
  if (!cleaned) return "";

  // حماية بيئات cases و matrix و aligned من التفكيك
  if (/\\begin\{(?:cases|matrix|pmatrix|bmatrix|aligned|array)\}/.test(cleaned)) {
    return `$${cleaned}$`;
  }

  // 1. فك \text{...} الموجود في المستوى الأعلى فقط (خارج \frac و \sqrt و _ و ^)
  let topUnwrapped = "";
  let i = 0;
  let depth = 0;
  while (i < cleaned.length) {
    if (cleaned[i] === "{" && (i === 0 || cleaned[i - 1] !== "\\")) {
      depth++;
      topUnwrapped += cleaned[i++];
      continue;
    }
    if (cleaned[i] === "}" && (i === 0 || cleaned[i - 1] !== "\\")) {
      depth = Math.max(0, depth - 1);
      topUnwrapped += cleaned[i++];
      continue;
    }
    const textCmdMatch =
      depth === 0
        ? cleaned.slice(i).match(/^\\(?:text|mathrm|textbf|mathbf)\{\s*([^{}]*)\s*\}/)
        : null;
    if (textCmdMatch && /[\u0600-\u06FF]/.test(textCmdMatch[1])) {
      topUnwrapped += ` ${textCmdMatch[1].trim()} `;
      i += textCmdMatch[0].length;
      continue;
    }
    topUnwrapped += cleaned[i++];
  }

  // 2. تقسيم السلسلة عند المستوى الأعلى (depth === 0) إلى مقاطع عربية ومقاطع رياضية
  const tokens: Array<{ isArabic: boolean; val: string }> = [];
  let buf = "";
  depth = 0;
  for (let idx = 0; idx < topUnwrapped.length; idx++) {
    const ch = topUnwrapped[idx];
    if (ch === "{" && (idx === 0 || topUnwrapped[idx - 1] !== "\\")) depth++;
    else if (ch === "}" && (idx === 0 || topUnwrapped[idx - 1] !== "\\")) {
      depth = Math.max(0, depth - 1);
    }

    if (depth === 0 && /[\u0600-\u06FF]/.test(ch)) {
      if (buf) {
        tokens.push({ isArabic: false, val: buf });
        buf = "";
      }
      let arChunk = ch;
      while (
        idx + 1 < topUnwrapped.length &&
        /[\u0600-\u06FF\s،؛:؟!]/.test(topUnwrapped[idx + 1])
      ) {
        idx++;
        arChunk += topUnwrapped[idx];
      }
      if (isArabicProsePhrase(arChunk)) {
        tokens.push({ isArabic: true, val: arChunk.trim() });
      } else {
        buf += arChunk;
      }
    } else {
      buf += ch;
    }
  }
  if (buf) tokens.push({ isArabic: false, val: buf });

  if (!tokens.some((t) => t.isArabic)) {
    return `$${cleaned}$`;
  }

  return tokens
    .map((t) => {
      const v = t.val
        .trim()
        .replace(/^\\+(?![a-zA-Z{])\s*|\s*\\+$/g, "")
        .trim();
      if (!v) return "";
      if (t.isArabic) return ` ${v} `;
      if (/^[,،.;:]+$/.test(v)) return `${v} `;
      return ` $${v}$ `;
    })
    .join("")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * يحول الفترات العالمية إلى فترات مصرية قياسية `]أ، ب[` مع الحفاظ التام على الأزواج المرتبة `(س، ص)`.
 */
export function normalizeEgyptianIntervalsAndDomain(input: string): string {
  if (!input) return "";

  return input
    .replace(/\[\s*([^[\]()\n]{1,35}?)\s*[,،]\s*([^[\]()\n]{1,35}?)\s*\)/g, "[$1, $2[")
    .replace(/\(\s*([^[\]()\n]{1,35}?)\s*[,،]\s*([^[\]()\n]{1,35}?)\s*\]/g, "]$1, $2]")
    .replace(
      /\(\s*(-?(?:\\infty|∞)|[^[\]()\n]{1,25}?)\s*[,،]\s*(\+?(?:\\infty|∞))\s*\)/g,
      "][$1, $2[".replace("][", "]")
    )
    .replace(
      /\(\s*(-?(?:\\infty|∞))\s*[,،]\s*([^[\]()\n]{1,25}?)\s*\)/g,
      "][$1, $2[".replace("][", "]")
    )
    .replace(
      /(الفترة(?:\s+المفتوحة)?|فترة|تنتمي(?:\s+إلى)?|ينتمي(?:\s+إلى)?|\\in|∈|مجال(?:\s+الدالة)?|المدى|مدى(?:\s+الدالة)?|\\cup|∪|\\cap|∩|ح\s*-\s*)(\s*\$?\s*)\(\s*([^[\]()\n]{1,25}?)\s*[,،]\s*([^[\]()\n]{1,25}?)\s*\)/g,
      "$1$2]$3, $4["
    )
    .replace(/\\(?:setminus|smallsetminus)/g, " - ")
    .replace(/\\(?:emptyset|varnothing)/g, "\\phi")
    .replace(/\b(?:Domain\s+of\s+f|dom\s*\(\s*f\s*\))\b/gi, "مجال الدالة")
    .replace(
      /(?:\\mathbb\{R\}|\bR\b|ح)\s*(?:\\setminus|\\smallsetminus|\\|-)\s*\\?\{\s*([^{}\n]+?)\s*\\?\}/g,
      "ح - \\{$1\\}"
    );
}

/**
 * يصلح أوامر LaTeX المكشوفة (بدون محددات `$`) في الأجزاء النصية غير المحاطة بـ `$...$`.
 */
export function wrapNakedLatexCommandsOutsideDelimiters(input: string): string {
  if (!input) return "";

  const parts = input.split(/(\$[^$]+\$)/g);

  return parts
    .map((segment) => {
      if (segment.startsWith("$") && segment.endsWith("$") && segment.length >= 2) {
        const inner = segment
          .slice(1, -1)
          .replace(/\\(?:dft|dfrac|tfrac)\{/g, "\\frac{")
          .replace(/(^|[^\\a-zA-Z])frac\{([^{}]+)\}\{([^{}]+)\}/g, "$1\\frac{$2}{$3}")
          .replace(/(^|[^\\a-zA-Z])sqrt\{([^{}]+)\}/g, "$1\\sqrt{$2}");
        return separateTopLevelArabicFromMathContent(inner);
      }

      return segment
        .replace(/\\(?:dft|dfrac|tfrac)\{/g, "\\frac{")
        .replace(/\\?(?:left|right|displaystyle|quad|qquad|enspace)\b/g, " ")
        .replace(/\\?begin\{?cases\}?([\s\S]*?)\\?end\{?cases\}?/gi, (_m, casesBody: string) => {
          const rows = casesBody
            .split(/\\\\|;/)
            .map((r) => r.replace(/&/g, " : ").trim())
            .filter(Boolean);
          return rows.join(" ، ");
        })
        .replace(/(^|[^\\a-zA-Z])frac\{([^{}]+)\}\{([^{}]+)\}/g, "$1$\\frac{$2}{$3}$")
        .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "$\\frac{$1}{$2}$")
        .replace(/(^|[^\\a-zA-Z])sqrt(\[[0-9]+\])?\{([^{}]+)\}/g, "$1$\\sqrt$2{$3}$")
        .replace(/\\sqrt(\[[0-9]+\])?\{([^{}]+)\}/g, "$\\sqrt$1{$2}$")
        .replace(
          /\\(widehat|overline|overrightarrow|vec|bar|hat)\{([^{}]+)\}/g,
          "$\\$1{$2}$"
        )
        .replace(/([0-9٠-٩]+)\s*\^\s*\\circ/g, "$$$1^\\circ$$")
        .replace(/\\therefore\b/g, " ∴ ")
        .replace(/\\because\b/g, " ∵ ")
        .replace(/\\dots\b/g, "...")
        .replace(
          /\\(times|div|pm|mp|le|leq|ge|geq|neq|ne|approx|equiv|cong|sim|perp|parallel|angle|triangle|in|notin|subset|subseteq|cup|cap|implies|Rightarrow|iff|Leftrightarrow|pi|theta|alpha|beta|gamma|delta|phi|infty|circ)\b/g,
          "$\\$1$"
        )
        .replace(/\b(begincases|endcases|quad|qquad|frac)\b/gi, "")
        .replace(/\s*&\s*/g, " ، ")
        .replace(/(?:^|\s)\\+(?=\s|$|[.,،؛:])/g, " ");
    })
    .join("")
    .replace(/\$\s*\$/g, " ");
}

/**
 * الدالة الشاملة لتطبيع الرياضيات المصرية وتنظيف أوامر LaTeX والرموز الغريبة قبل العرض أو الطباعة.
 */
export function normalizeToEgyptianSchoolMath(rawText: string): string {
  if (!rawText) return "";

  const normalizedDelimiters = rawText
    // 1. فك هروب علامات الدولار \$ الناتجة عن نسخ ردود NotebookLM
    .replace(/\\+\$/g, "$")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    // 2. توحيد محددات \( ... \) و \[ ... \] و $$ ... $$
    .replace(/\\+\(([\s\S]*?)\\+\)/g, "$$$1$$")
    .replace(/\\+\[([\s\S]*?)\\+\]/g, "$$$1$$")
    .replace(/\$\$([\s\S]*?)\$\$/g, "$$$1$$")
    // 3. إزالة أي محددات مكسورة يتيمة مثل \( أو \)
    .replace(/\\+[()[\]]/g, " ")
    // 4. فك عبارات \text{...} العربية المعزولة خارج المعادلات
    .replace(
      /\$\s*\\(?:text|mathrm|textbf|mathbf)\{\s*([\u0600-\u06FF\s،؛؟.!ـ]{2,})\s*\}\s*\$/g,
      " $1 "
    );

  const withEgyptianIntervals = normalizeEgyptianIntervalsAndDomain(normalizedDelimiters);
  return wrapNakedLatexCommandsOutsideDelimiters(withEgyptianIntervals);
}
