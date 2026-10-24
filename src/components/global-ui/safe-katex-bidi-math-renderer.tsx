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
    .replace(/\\times\b/g, " × ")
    .replace(/\\div\b/g, " ÷ ")
    .replace(/\\pm\b/g, " ± ")
    .replace(/\\sim\b/g, " ∼ ")
    .replace(/\\cong\b/g, " ≅ ")
    .replace(/\\approx\b/g, " ≈ ")
    .replace(/\\(?:le|leq)\b/g, " ≤ ")
    .replace(/\\(?:ge|geq)\b/g, " ≥ ")
    .replace(/\\(?:ne|neq)\b/g, " ≠ ")
    .replace(/\\(?:implies|Rightarrow)\b/g, " ⇒ ")
    .replace(/\\(?:iff|Leftrightarrow)\b/g, " ⇔ ")
    .replace(/\\angle\b/g, "∠")
    .replace(/\\triangle\b/g, "△")
    .replace(/\\perp\b/g, " ⊥ ")
    .replace(/\\parallel\b/g, " ∥ ")
    .replace(/\^\s*\\circ\b|\\circ\b/g, "°")
    .replace(/\\dots\b/g, "...")
    .replace(/\\(?:in)\b/g, " ∈ ")
    .replace(/\\(?:notin)\b/g, " ∉ ")
    .replace(/\\(?:cup)\b/g, " ∪ ")
    .replace(/\\(?:cap)\b/g, " ∩ ")
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

  if (notationLanguage === "english") {
    cleaned = cleaned
      .replace(/س/g, "x")
      .replace(/ص/g, "y")
      .replace(/ع/g, "z")
      .replace(/ح/g, "\\mathbb{R}");
  }

  // تغليف أي كلمات عربية داخل البسط أو المقام بـ \text{...} حتى لا تلتصق الكلمات العربية ببعضها داخل KaTeX
  cleaned = cleaned.replace(
    /\\(?:text|mathrm|textbf|mathbf)\{[^{}]*\}|([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+)*)/g,
    (match, arabicPhrase: string | undefined) =>
      arabicPhrase ? `\\text{${arabicPhrase.trim()}}` : match
  );

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

export default function SafeKaTeXBiDiMathRenderer({
  text,
  numeralMode = "eastern",
  notationLanguage = "arabic",
  className = "",
}: SafeKaTeXBiDiMathRendererProps) {
  if (!text) return null;

  const normalizedMath = normalizeToEgyptianSchoolMath(text);
  const unitFixed = normalizeArabicUnitPlacementSSOT(normalizedMath);
  const segments = unitFixed.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);
  const hasFractionSegment = /\\(?:d|t)?frac\b/.test(unitFixed);

  return (
    <span
      className={`inline ${
        hasFractionSegment ? "leading-[2.15] py-0.5" : "leading-relaxed"
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
                maxWidth: "100%",
                paddingTop: isFractionMath ? "0.24em" : undefined,
                paddingBottom: isFractionMath ? "0.24em" : undefined,
                verticalAlign: "middle",
              }}
              className="mx-0.5 font-bold align-middle max-w-full"
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
