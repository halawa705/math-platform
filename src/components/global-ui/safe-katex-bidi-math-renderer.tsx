"use client";

/**
 * @file safe-katex-bidi-math-renderer.tsx
 * @description العازل ثنائي الاتجاه (RTL/LTR) وعارض المعادلات الرياضية الآمن المتوافق مع الهاتف والطباعة:
 * - مزود بذاكرة تخزين مؤقت سريعة (In-Memory LRU Cache) لتسريع المعاينة الحية وتصيير الـ PDF.
 * - يمنع تماماً ظهور أخطاء KaTeX الحمراء (`.katex-error`) أو تسرب `{\displaystyle ...}` أو الشرط المائلة `\`.
 * - يغلف الكلمات العربية داخل الكسور (`\frac{\text{عرض النموذج}}{...}`) بـ `\text{...}` لحفظ المسافات بين الكلمات.
 * - يعزل الفترات المصرية المفتوحة والمغلقة `]أ، ب[` داخل `<bdi dir="ltr">` لمنع انعكاس الأقواس في RTL نهائياً.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import React from "react";
import katex from "katex";
import {
  formatNumeralsByModeSSOT,
  localizeMathExpressionNotationSSOT,
  normalizeArabicUnitPlacementSSOT,
  type NumeralDisplayMode,
  type MathNotationLanguage,
} from "../../core/ssot/numeral-and-unit-ssot";
import { normalizeToEgyptianSchoolMath } from "../../core/ingestion/egyptian-math-notation-normalizer";

export const MODULE_ID_SAFE_KATEX_BIDI_MATH_RENDERER =
  "safe_katex_bidi_math_renderer" as const;

export interface SafeKaTeXBiDiMathRendererProps {
  readonly text: string;
  readonly numeralMode?: NumeralDisplayMode;
  readonly notationLanguage?: MathNotationLanguage;
  readonly className?: string;
}

const MAX_KATEX_CACHE_SIZE = 3000;
const katexHtmlCache = new Map<string, string>();

function buildHumanReadableMathFallback(latex: string): string {
  return latex
    .replace(/\{\\displaystyle\s*([\s\S]*?)\}/g, "$1")
    .replace(/\\displaystyle\b/g, "")
    .replace(/\\(?:text|mathrm|textbf|mathbf)\{([^{}]*)\}/g, "$1")
    .replace(/\\?begin\{?cases\}?([\s\S]*?)\\?end\{?cases\}?/gi, (_m, body: string) =>
      body
        .split(/\\\\|;/)
        .map((r) => r.replace(/&/g, " : ").trim())
        .filter(Boolean)
        .join(" ، ")
    )
    .replace(/\\?frac\{([^{}]+)\}\{([^{}]+)\}/g, "($1 / $2)")
    .replace(/\\?sqrt\{([^{}]+)\}/g, "√($1)")
    .replace(/\\?(?:quad|qquad|enspace|begincases|endcases)\b/gi, " ")
    .replace(/\\(times|div|pm|sim|cong|approx|le|leq|ge|geq|ne|neq|implies|Rightarrow|iff|Leftrightarrow|perp|parallel|in|notin|cup|cap)\b/g, (_m, op: string) => {
      const map: Record<string, string> = { times: " × ", div: " ÷ ", pm: " ± ", sim: " ∼ ", cong: " ≅ ", approx: " ≈ ", le: " ≤ ", leq: " ≤ ", ge: " ≥ ", geq: " ≥ ", ne: " ≠ ", neq: " ≠ ", implies: " ⇒ ", Rightarrow: " ⇒ ", iff: " ⇔ ", Leftrightarrow: " ⇔ ", perp: " ⊥ ", parallel: " ∥ ", in: " ∈ ", notin: " ∉ ", cup: " ∪ ", cap: " ∩ " };
      return map[op] || ` ${op} `;
    })
    .replace(/\\angle\b/g, "∠")
    .replace(/\\triangle\b/g, "△")
    .replace(/\^\s*\\circ\b|\\circ\b/g, "°")
    .replace(/\\dots\b/g, "...")
    .replace(/\\(?:phi|emptyset|varnothing)\b/g, "∅")
    .replace(/\\(?:infty)\b/g, "∞")
    .replace(/\bfrac\b/gi, "/")
    .replace(/&/g, " ، ")
    .replace(/[\\{}]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function renderKatexCached(latex: string, displayMode: boolean): string {
  const cacheKey = `${displayMode ? "B" : "I"}:${latex}`;
  const cached = katexHtmlCache.get(cacheKey);
  if (cached !== undefined) return cached;

  let html = "";
  try {
    html = katex.renderToString(latex, {
      displayMode,
      throwOnError: true,
      strict: false,
      output: "html",
    });
  } catch {
    html = `<span class="font-bold">${buildHumanReadableMathFallback(latex)}</span>`;
  }

  if (katexHtmlCache.size >= MAX_KATEX_CACHE_SIZE) {
    const oldestKey = katexHtmlCache.keys().next().value;
    if (oldestKey !== undefined) katexHtmlCache.delete(oldestKey);
  }
  katexHtmlCache.set(cacheKey, html);
  return html;
}

/**
 * يطهر تعبير LaTeX الرياضي من أي تسرب نصي، ويغلف الكلمات العربية داخل الكسور بـ `\text{...}` لحفظ المسافات.
 */
export function sanitizeLatexForSchoolMath(
  rawLatex: string,
  numeralMode: NumeralDisplayMode,
  notationLanguage: MathNotationLanguage
): string {
  let cleaned = rawLatex
    .replace(/^\$+|\$+$/g, "")
    .replace(/^\\+(?![a-zA-Z{])\s*/, "")
    .replace(/\s*\\+$/, "")
    .replace(/(^|[^\\a-zA-Z])(frac|sqrt|text|mathrm|textbf|mathbf)\{/g, "$1\\$2{")
    .replace(/\\text\{\\(?:sin|cos|tan|cot|sec|csc)\}/gi, (m) => {
      const fn = m.match(/sin|cos|tan|cot|sec|csc/i)?.[0]?.toLowerCase() ?? "sin";
      return `\\${fn}`;
    })
    .replace(/\\div\b/g, " \\div ")
    .replace(/\\times\b/g, " \\times ")
    .trim();

  cleaned = localizeMathExpressionNotationSSOT(cleaned, notationLanguage);

  // فك أي \frac أو \sqrt محبوسة خطأ داخل \text{...} لأن KaTeX لا يصرّف الكسور داخل وسوم النصوص
  cleaned = cleaned.replace(/\\(?:text|mathrm|textbf)\{\s*(\\frac\{[\s\S]*?\})\s*\}/g, "$1");
  cleaned = cleaned.replace(/(?<=[A-Za-z0-9٠-٩])\s*~\s*(?=[A-Za-z0-9٠-٩])/g, " \\sim ");

  if (notationLanguage === "english") {
    // حماية كتل \text{...} بالكامل حتى لا تُمس الحروف والكلمات العربية مثل (المضلع، محيط، الأصغر)
    const textBlocks: string[] = [];
    let protectedLatex = cleaned.replace(/\\(?:text|mathrm|textbf|mathbf)\{[^{}]*\}/g, (m) => {
      textBlocks.push(m);
      return `___MATH_TXT_${textBlocks.length - 1}___`;
    });

    // استبدال المتغيرات والرموز المنفردة فقط خارج النصوص
    const varMap: Record<string, string> = { "س": "x", "ص": "y", "ع": "z", "ك": "k", "ح": "\\mathbb{R}" };
    protectedLatex = protectedLatex.replace(/(?<![\u0600-\u06FFa-zA-Z\\_])([سصعكح])(?![\u0600-\u06FFa-zA-Z_])/g, (_m, ch: string) => varMap[ch] || ch);

    cleaned = protectedLatex.replace(/___MATH_TXT_(\d+)___/g, (_m, idx) => textBlocks[Number(idx)] || "");
  }

  // تغليف أي كلمات عربية داخل البسط أو المقام بـ \text{...} حتى لا تلتصق الكلمات العربية ببعضها داخل KaTeX
  cleaned = cleaned.replace(
    /\\(?:text|mathrm|textbf|mathbf)\{[^{}]*\}|([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+)*)/g,
    (match, arabicPhrase: string | undefined) =>
      arabicPhrase ? `\\text{${arabicPhrase.trim()}}` : match
  );

  cleaned = cleaned.replace(/\\text\{\s*\\text\{([^{}]+)\}\s*\}/g, "\\text{$1}");

  // تكبير الكسور والجذور داخل السطر لتظهر بحجم كتاب وزاري واضح مع مسافة أمان قبل القوس المغلق
  if (
    (cleaned.includes("\\frac") || cleaned.includes("\\sqrt")) &&
    !cleaned.includes("\\displaystyle")
  ) {
    cleaned = `{\\displaystyle ${cleaned} }`;
  }

  return formatNumeralsByModeSSOT(cleaned, numeralMode);
}

/**
 * يعزل الفترات المصرية المكتوبة في النص العادي مثل `]2, 5[` أو `[-1, 4]` داخل `<bdi dir="ltr">`.
 */
function renderPlainSegmentWithIsolatedIntervals(
  plainText: string,
  numeralMode: NumeralDisplayMode
): React.ReactNode {
  const cleanedPlain = plainText.replace(/(?:^|\s)\\+(?=\s|$|[.,،؛:])/g, " ");
  const formatted = formatNumeralsByModeSSOT(cleanedPlain, numeralMode);
  const parts = formatted.split(/([[\]][\s0-9٠-٩a-zA-Zسصأب+\-∞,،/]+[[\]])/g);
  if (parts.length === 1) return formatted;

  return parts.map((part, i) => {
    if (/^[[\]].+[[\]]$/.test(part) && /[,،]/.test(part)) {
      return (
        <bdi
          key={i}
          dir="ltr"
          style={{ unicodeBidi: "isolate" }}
          className="inline-block font-bold mx-0.5 px-1 rounded bg-slate-100/80 text-slate-900"
        >
          {part}
        </bdi>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function splitCompoundInlineMathChains(input: string): string {
  return input.replace(/(?<!\$)\$(?!\$)([^$]+)\$(?!\$)/g, (full, inner: string) => {
    if (inner.includes("cases") || inner.length < 24) return full;
    return `$${inner
      .replace(/\s*\\(?:implies|Rightarrow)\s*/g, "$ $\\implies$ $")
      .replace(/\s*\\(?:iff|Leftrightarrow|Longleftrightarrow)\s*/g, "$ $\\iff$ $")
      .replace(/\s*,\s*\\quad\s*/g, "$ ، $")}$`;
  });
}

export default function SafeKaTeXBiDiMathRenderer({
  text,
  numeralMode = "eastern",
  notationLanguage = "arabic",
  className = "",
}: SafeKaTeXBiDiMathRendererProps) {
  if (!text) return null;

  const normalizedMath = normalizeToEgyptianSchoolMath(text);
  const unitFixed = splitCompoundInlineMathChains(
    normalizeArabicUnitPlacementSSOT(normalizedMath)
  );
  const segments = unitFixed.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);
  const hasFractionSegment = /\\(?:d|t)?frac\b/.test(unitFixed);

  return (
    <span
      className={`inline ${
        hasFractionSegment ? "leading-[1.95] py-0.5 inline-block align-middle" : "leading-relaxed"
      } break-words ${className}`}
    >
      {segments.map((segment, idx) => {
        const isBlockMath =
          segment.startsWith("$$") && segment.endsWith("$$") && segment.length > 4;
        const isInlineMath =
          !isBlockMath &&
          segment.startsWith("$") &&
          segment.endsWith("$") &&
          segment.length > 2;

        if (isBlockMath || isInlineMath) {
          const innerLatex = isBlockMath
            ? segment.slice(2, -2)
            : segment.slice(1, -1);
          const isFractionMath = /\\(?:d|t)?frac\b/.test(innerLatex);
          const fractionsCount = (innerLatex.match(/\\(?:d|t)?frac\b/g) || []).length;
          const hasCases = innerLatex.includes("cases");
          const isWideEquation = innerLatex.length > 40 || fractionsCount >= 2;
          const dynamicFontSize = hasCases
            ? "0.76em"
            : fractionsCount >= 3
              ? "0.80em"
              : isWideEquation
                ? "0.87em"
                : undefined;
          const sanitized = sanitizeLatexForSchoolMath(
            innerLatex,
            numeralMode,
            notationLanguage
          );
          const renderedHtml = renderKatexCached(sanitized, isBlockMath);

          return (
            <bdi
              key={idx}
              dir="ltr"
              style={{
                unicodeBidi: "isolate",
                display: isBlockMath ? "block" : "inline-block",
                whiteSpace: hasCases ? "normal" : "nowrap",
                fontSize: dynamicFontSize,
                maxWidth: "100%",
                paddingTop: isFractionMath ? "0.18em" : undefined,
                paddingBottom: isFractionMath ? "0.18em" : undefined,
                margin: isFractionMath ? "0.06em 0.12em" : undefined,
                verticalAlign: "middle",
              }}
              className="mx-0.5 font-bold align-middle"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          );
        }

        return (
          <React.Fragment key={idx}>
            {renderPlainSegmentWithIsolatedIntervals(segment, numeralMode)}
          </React.Fragment>
        );
      })}
    </span>
  );
}
