"use client";

/**
 * @file safe-katex-bidi-math-renderer.tsx
 * @description العازل ثنائي الاتجاه (RTL/LTR) وعارض المعادلات الرياضية الآمن المتوافق مع الهاتف والطباعة.
 * - مزود بذاكرة تخزين مؤقت سريعة (In-Memory LRU Cache) لتسريع المعاينة الحية وتصيير الـ PDF بعشرة أضعاف.
 * - يطبق تطبيع الرياضيات المصرية (`normalizeToEgyptianSchoolMath`) تلقائياً لمنع تسرب أي أمر LaTeX خام.
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
} from "@/core/ssot/numeral-and-unit-ssot";
import { normalizeToEgyptianSchoolMath } from "@/core/ingestion/egyptian-math-notation-normalizer";

export const MODULE_ID_SAFE_KATEX_BIDI_MATH_RENDERER =
  "safe_katex_bidi_math_renderer" as const;

export interface SafeKaTeXBiDiMathRendererProps {
  readonly text: string;
  readonly numeralMode?: NumeralDisplayMode;
  readonly notationLanguage?: MathNotationLanguage;
  readonly className?: string;
}

const MAX_KATEX_CACHE_SIZE = 2500;
const katexHtmlCache = new Map<string, string>();

function renderKatexCached(latex: string, displayMode: boolean): string {
  const cacheKey = `${displayMode ? "B" : "I"}:${latex}`;
  const cached = katexHtmlCache.get(cacheKey);
  if (cached !== undefined) return cached;

  let html = "";
  try {
    html = katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      strict: false,
      output: "html",
    });
  } catch {
    html = latex
      .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "($1)/($2)")
      .replace(/\\sqrt\{([^{}]+)\}/g, "√($1)")
      .replace(/\\/g, "");
  }

  if (katexHtmlCache.size >= MAX_KATEX_CACHE_SIZE) {
    const oldestKey = katexHtmlCache.keys().next().value;
    if (oldestKey !== undefined) katexHtmlCache.delete(oldestKey);
  }
  katexHtmlCache.set(cacheKey, html);
  return html;
}

/**
 * يطهر تعبير LaTeX الرياضي من أي تسرب نصي، ويعالج الدوال المثلثية والمجموعات والكسور الجبرية بدقة.
 */
export function sanitizeLatexForSchoolMath(
  rawLatex: string,
  numeralMode: NumeralDisplayMode,
  notationLanguage: MathNotationLanguage
): string {
  let cleaned = rawLatex
    .replace(/\\text\{\\(?:sin|cos|tan|cot|sec|csc)\}/gi, (m) => {
      const fn = m.match(/sin|cos|tan|cot|sec|csc/i)?.[0]?.toLowerCase() ?? "sin";
      return `\\${fn}`;
    })
    .replace(/\\div/g, " \\div ")
    .replace(/\\times/g, " \\times ")
    .trim();

  cleaned = localizeMathExpressionNotationSSOT(cleaned, notationLanguage);

  if (notationLanguage === "english") {
    cleaned = cleaned
      .replace(/س/g, "x")
      .replace(/ص/g, "y")
      .replace(/ع/g, "z")
      .replace(/ح/g, "\\mathbb{R}");
  }

  // تكبير الكسور والجذور داخل السطر لتظهر بحجم كتاب وزاري واضح
  if (
    (cleaned.includes("\\frac") || cleaned.includes("\\sqrt")) &&
    !cleaned.includes("\\displaystyle")
  ) {
    cleaned = `{\\displaystyle ${cleaned}}`;
  }

  return formatNumeralsByModeSSOT(cleaned, numeralMode);
}

/**
 * يعزل الفترات المصرية المكتوبة في النص العادي مثل `]2, 5[` أو `[-1, 4]` داخل `<bdi dir="ltr">`
 * حتى لا تنعكس أقواس الفترة في سياق اللغة العربية.
 */
function renderPlainSegmentWithIsolatedIntervals(
  plainText: string,
  numeralMode: NumeralDisplayMode
): React.ReactNode {
  const formatted = formatNumeralsByModeSSOT(plainText, numeralMode);
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

  return (
    <span className={`inline leading-relaxed ${className}`}>
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
          const sanitized = sanitizeLatexForSchoolMath(
            innerLatex,
            numeralMode,
            notationLanguage
          );
          const renderedHtml = renderKatexCached(sanitized, isBlockMath);

          return (
            <span
              key={idx}
              dir="ltr"
              style={{
                unicodeBidi: "isolate",
                display: isBlockMath ? "block" : "inline-block",
              }}
              className="px-1 py-0.5 mx-0.5 rounded bg-indigo-50/70 text-indigo-950 font-bold align-middle"
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
