"use client";

/**
 * @file safe-katex-bidi-math-renderer.tsx
 * @description العازل ثنائي الاتجاه (RTL/LTR) وعارض المعادلات الرياضية الآمن المتوافق مع الهاتف والطباعة.
 * - يستخدم `output: "html"` حصراً لمنع ازدواجية الأرقام والرموز في الطباعة نهائياً (Zero Duplicate MathML).
 * - يعالج الدوال المثلثية العربية واللاتينية بدون تسريب أي وسم `\text{\cos}`.
 * - يرفع حجم الكسور الجبرية تلقائياً عبر `\displaystyle` لتظهر واضحة ومفصولة البسط والمقام كالكتب الوزارية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import React from "react";
import katex from "katex";
import {
  formatNumeralsByModeSSOT,
  normalizeArabicUnitPlacementSSOT,
  type NumeralDisplayMode,
  type MathNotationLanguage,
} from "@/core/ssot/numeral-and-unit-ssot";

export const MODULE_ID_SAFE_KATEX_BIDI_MATH_RENDERER =
  "safe_katex_bidi_math_renderer" as const;

export interface SafeKaTeXBiDiMathRendererProps {
  readonly text: string;
  readonly numeralMode?: NumeralDisplayMode;
  readonly notationLanguage?: MathNotationLanguage;
  readonly className?: string;
}

/**
 * يطهر تعبير LaTeX الرياضي من أي تسرب نصي، ويعالج الدوال المثلثية والكسور الجبرية بدقة.
 */
export function sanitizeLatexForSchoolMath(
  rawLatex: string,
  numeralMode: NumeralDisplayMode,
  notationLanguage: MathNotationLanguage
): string {
  let cleaned = rawLatex
    .replace(/\\text\{\\(?:sin|cos|tan)\}/gi, (m) => {
      if (m.includes("sin")) return "\\sin";
      if (m.includes("cos")) return "\\cos";
      return "\\tan";
    })
    .replace(/\\setminus/g, " - ")
    .replace(/\\div/g, " \\div ")
    .replace(/\\times/g, " \\times ")
    .trim();

  if (notationLanguage === "english") {
    cleaned = cleaned
      .replace(/\\text\{\s*جا\s*\}/g, "\\sin")
      .replace(/\\text\{\s*جتا\s*\}/g, "\\cos")
      .replace(/\\text\{\s*ظا\s*\}/g, "\\tan")
      .replace(/جا/g, "\\sin ")
      .replace(/جتا/g, "\\cos ")
      .replace(/ظا/g, "\\tan ")
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

export default function SafeKaTeXBiDiMathRenderer({
  text,
  numeralMode = "eastern",
  notationLanguage = "arabic",
  className = "",
}: SafeKaTeXBiDiMathRendererProps) {
  if (!text) return null;

  const unitFixed = normalizeArabicUnitPlacementSSOT(text);
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

          let renderedHtml = "";
          try {
            renderedHtml = katex.renderToString(sanitized, {
              displayMode: isBlockMath,
              throwOnError: false,
              strict: false,
              output: "html",
            });
          } catch {
            renderedHtml = sanitized;
          }

          return (
            <span
              key={idx}
              dir="ltr"
              style={{
                unicodeBidi: "isolate",
                display: isBlockMath ? "block" : "inline-block",
              }}
              className="px-1 py-0.5 mx-0.5 rounded bg-indigo-50/60 text-indigo-950 font-bold align-middle"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          );
        }

        const plainFormatted = formatNumeralsByModeSSOT(segment, numeralMode);
        return <React.Fragment key={idx}>{plainFormatted}</React.Fragment>;
      })}
    </span>
  );
}
