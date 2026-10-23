/**
 * @file egyptian-math-notation-normalizer.ts
 * @description محول الترميز الرياضي العالمي (القادم من NotebookLM) إلى الاصطلاح الرسمي لوزارة التربية والتعليم المصرية:
 * - تحويل الفترات المفتوحة ونصف المفتوحة `(-\infty, a)` و `[a, b)` و `(a, b]` إلى `]-\infty, a[` و `[a, b[` و `]a, b]`
 *   دون المساس بالأزواج المرتبة `(س، ص)` أو إحداثيات النقاط، ودون اختلاق أرقام وهمية أبداً.
 * - تحويل فرق المجموعات `\setminus` والمجال `R \ {a}` إلى الصيغة الوزارية `ح - {أ}`.
 * - فك النصوص العربية المحبوسة داخل `\text{...}` وتغليف كافة أوامر LaTeX المكشوفة (`\frac`, `\sqrt`, `\widehat`, `\overline`, إلخ) بمحددات `$`.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 190 سطراً).
 */

export const MODULE_ID_EGYPTIAN_MATH_NOTATION_NORMALIZER =
  "egyptian_math_notation_normalizer" as const;

const ARABIC_PROSE_ONLY_REGEX = /^[\u0600-\u06FF\s،؛؟.!ـ]+$/;

/**
 * يحول الفترات العالمية إلى فترات مصرية قياسية `]أ، ب[` مع الحفاظ التام على الأزواج المرتبة `(س، ص)`.
 */
export function normalizeEgyptianIntervalsAndDomain(input: string): string {
  if (!input) return "";

  let text = input
    // 1. الفترات نصف المفتوحة `[a, b)` أو `(a, b]` هي دائماً فترات رياضية وليست أزواجاً مرتبة
    .replace(/\[\s*([^[\]()\n]{1,35}?)\s*[,،]\s*([^[\]()\n]{1,35}?)\s*\)/g, "[$1, $2[")
    .replace(/\(\s*([^[\]()\n]{1,35}?)\s*[,،]\s*([^[\]()\n]{1,35}?)\s*\]/g, "]$1, $2]")
    // 2. الفترات المفتوحة التي تحتوي على ما لا نهاية (\infty أو ∞) هي قطعاً فترات
    .replace(
      /\(\s*(-?(?:\\infty|∞)|[^[\]()\n]{1,25}?)\s*[,،]\s*(\+?(?:\\infty|∞))\s*\)/g,
      "][$1, $2[".replace("][", "]")
    )
    .replace(
      /\(\s*(-?(?:\\infty|∞))\s*[,،]\s*([^[\]()\n]{1,25}?)\s*\)/g,
      "][$1, $2[".replace("][", "]")
    )
    // 3. الفترات المفتوحة المسبوقة بكلمات دلالية (الفترة، فترة، تنتمي، مجال، مدى، اتحاد، تقاطع، فرق)
    .replace(
      /(الفترة(?:\s+المفتوحة)?|فترة|تنتمي(?:\s+إلى)?|ينتمي(?:\s+إلى)?|\\in|∈|مجال(?:\s+الدالة)?|المدى|مدى(?:\s+الدالة)?|\\cup|∪|\\cap|∩|ح\s*-\s*)(\s*\$?\s*)\(\s*([^[\]()\n]{1,25}?)\s*[,،]\s*([^[\]()\n]{1,25}?)\s*\)/g,
      "$1$2]$3, $4["
    );

  // 4. تحويل فرق المجموعات ومجال الدالة الكسرية إلى الاصطلاح المصري (ح - {...})
  text = text
    .replace(/\\(?:setminus|smallsetminus)/g, " - ")
    .replace(/\\(?:emptyset|varnothing)/g, "\\phi")
    .replace(/\b(?:Domain\s+of\s+f|dom\s*\(\s*f\s*\))\b/gi, "مجال الدالة")
    .replace(
      /(?:\\mathbb\{R\}|\bR\b|ح)\s*(?:\\setminus|\\smallsetminus|\\|-)\s*\\?\{\s*([^{}\n]+?)\s*\\?\}/g,
      "ح - \\{$1\\}"
    );

  return text;
}

/**
 * يفك الجمل العربية المحبوسة داخل `\text{...}` و `\mathrm{...}` و `\textbf{...}` لتجنب تشوه خط KaTeX.
 */
export function unwrapTrappedArabicFromLatexCommands(input: string): string {
  if (!input) return "";

  return input
    .replace(
      /\$\s*\\(?:text|mathrm|textbf|mathbf)\{\s*([\u0600-\u06FF\s،؛؟.!ـ]{3,})\s*\}\s*\$/g,
      " $1 "
    )
    .replace(
      /\\(?:text|mathrm|textbf|mathbf)\{\s*([\u0600-\u06FF\s،؛؟.!ـ]{2,})\s*\}/g,
      (_, inner: string) => (ARABIC_PROSE_ONLY_REGEX.test(inner) ? inner : `\\text{${inner}}`)
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
      if (segment.startsWith("$") && segment.endsWith("$")) {
        return segment
          .replace(/\\(?:dft|dfrac|tfrac)\{/g, "\\frac{")
          .replace(/(^|[^\\a-zA-Z])frac\{([^{}]+)\}\{([^{}]+)\}/g, "$1\\frac{$2}{$3}")
          .replace(/(^|[^\\a-zA-Z])sqrt\{([^{}]+)\}/g, "$1\\sqrt{$2}");
      }

      return segment
        .replace(/\\(?:dft|dfrac|tfrac)\{/g, "\\frac{")
        .replace(/\\(?:left|right|displaystyle|quad|qquad|enspace)\b/g, " ")
        .replace(/(^|[^\\a-zA-Z])frac\{([^{}]+)\}\{([^{}]+)\}/g, "$1$\\frac{$2}{$3}$")
        .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "$\\frac{$1}{$2}$")
        .replace(/(^|[^\\a-zA-Z])sqrt(\[[0-9]+\])?\{([^{}]+)\}/g, "$1$\\sqrt$2{$3}$")
        .replace(/\\sqrt(\[[0-9]+\])?\{([^{}]+)\}/g, "$\\sqrt$1{$2}$")
        .replace(
          /\\(widehat|overline|overrightarrow|vec|bar|hat)\{([^{}]+)\}/g,
          "$\\$1{$2}$"
        )
        .replace(/(\d+)\s*\^\\circ/g, "$$$1^\\circ$$")
        .replace(/\\therefore\b/g, " ∴ ")
        .replace(/\\because\b/g, " ∵ ")
        .replace(
          /\\(times|div|pm|mp|le|leq|ge|geq|neq|ne|approx|equiv|cong|sim|perp|parallel|angle|triangle|in|notin|subset|subseteq|cup|cap|implies|Rightarrow|iff|Leftrightarrow|pi|theta|alpha|beta|gamma|delta|phi|infty|circ)\b/g,
          "$\\$1$"
        );
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
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\\\(([\s\S]*?)\\\)/g, "$$$1$$")
    .replace(/\\\[([\s\S]*?)\\\]/g, "$$$1$$")
    .replace(/\$\$([\s\S]*?)\$\$/g, "$$$1$$");

  const unwrappedArabic = unwrapTrappedArabicFromLatexCommands(normalizedDelimiters);
  const withEgyptianIntervals = normalizeEgyptianIntervalsAndDomain(unwrappedArabic);
  return wrapNakedLatexCommandsOutsideDelimiters(withEgyptianIntervals);
}
