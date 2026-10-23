"use client";

/**
 * @file safe-katex-bidi-math-renderer.tsx
 * @description العازل ثنائي الاتجاه (RTL/LTR) وعارض المعادلات الرياضية الآمن المتوافق مع الهاتف والطباعة.
 * يطبق قواعد `numeral-and-unit-ssot.ts`، ويطهر رمز فرق المجموعات `\setminus` إلى `-`،
 * ويصيّر المعادلات عبر `katex.renderToString` مع `throwOnError: false` لضمان عدم ظهور كود LaTeX خام نهائياً.
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
 * يطهر تعبير LaTeX الرياضي من الرموز غير المدعومة في المناهج العربية مثل `\setminus`
 * ويضبط المتغيرات والأرقام وفق نظام العرض المختار.
 */
export function sanitizeLatexForSchoolMath(
  rawLatex: string,
  numeralMode: NumeralDisplayMode,
  notationLanguage: MathNotationLanguage
): string {
  let cleaned = rawLatex
    .replace(/\\setminus/g, " - ")
    .replace(/\\div/g, " \\div ")
    .replace(/\\times/g, " \\times ")
    .trim();

  if (notationLanguage === "english") {
    cleaned = cleaned
      .replace(/س/g, "x")
      .replace(/ص/g, "y")
      .replace(/ع/g, "z")
      .replace(/جا/g, "\\sin")
      .replace(/جتا/g, "\\cos")
      .replace(/ظا/g, "\\tan");
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
  // تقسيم النص عند محددات المعادلات $$...$$ أو $...$ لعزل اتجاه كل معادلة بدقة
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
              output: "htmlAndMathml",
            });
          } catch {
            renderedHtml = sanitized;
          }

          return (
            <span
              key={idx}
              dir="ltr"
              style={{ unicodeBidi: "isolate" }}
              className="inline-block px-1.5 py-0.5 mx-1 rounded-md bg-indigo-50/90 dark:bg-indigo-950/70 text-indigo-950 dark:text-indigo-200 font-bold tracking-wide border border-indigo-200/70 dark:border-indigo-800/60 align-middle"
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
