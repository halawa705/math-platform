"use client";

/**
 * @file safe-katex-bidi-math-renderer.tsx
 * @description عارض النص الرياضي الآمن: يستقبل نصاً (قانونياً أو قديماً مخزناً) ← يمرّره على `canonicalizeMathText`
 * (idempotent، مع ذاكرة LRU) ← يرسم العقد فقط: نص عادي RTL، كتل KaTeX معزولة LTR داخل `MathFormulaFitBox`،
 * وكميات (عدد + وحدة) غير قابلة للكسر. لا توجد أي regex تطبيعي هنا؛ فقط تطبيق إعدادات المستند.
 */

import React, { useMemo } from "react";
import {
  formatNumeralsByModeSSOT,
  type MathNotationLanguage,
  type NumeralDisplayMode,
} from "../../core/ssot/numeral-and-unit-ssot";
import { canonicalizeMathText } from "../../core/math-text/math-text-canonicalizer";
import { parseCanonicalTextToNodes } from "../../core/math-text/math-canonical-text-node-parser";
import { localizeCanonicalLatex } from "../../core/math-text/math-latex-notation-and-numeral-localizer";
import { localizeGeometricEntitiesInPlainText } from "../../core/math-text/math-geometric-entity-localizer";
import { renderKatexHtmlCached } from "./math-katex-cached-html-renderer";
import MathFormulaFitBox from "./math-formula-fit-box";

export const MODULE_ID_SAFE_KATEX_BIDI_MATH_RENDERER =
  "safe_katex_bidi_math_renderer" as const;

export interface SafeKaTeXBiDiMathRendererProps {
  readonly text: string;
  readonly numeralMode?: NumeralDisplayMode;
  readonly notationLanguage?: MathNotationLanguage;
  readonly className?: string;
}

const MAX_CANONICAL_CACHE_SIZE = 1500;
const canonicalCache = new Map<string, string>();

function canonicalizeCached(text: string): string {
  const hit = canonicalCache.get(text);
  if (hit !== undefined) return hit;
  const value = canonicalizeMathText(text);
  if (canonicalCache.size >= MAX_CANONICAL_CACHE_SIZE) {
    const oldest = canonicalCache.keys().next().value;
    if (oldest !== undefined) canonicalCache.delete(oldest);
  }
  canonicalCache.set(text, value);
  return value;
}

export default function SafeKaTeXBiDiMathRenderer({
  text,
  numeralMode = "eastern",
  notationLanguage = "arabic",
  className = "",
}: SafeKaTeXBiDiMathRendererProps) {
  const nodes = useMemo(() => parseCanonicalTextToNodes(canonicalizeCached(text ?? "")), [text]);
  if (!text) return null;

  const renderFormula = (latex: string) => (
    <MathFormulaFitBox
      html={renderKatexHtmlCached(localizeCanonicalLatex(latex, numeralMode, notationLanguage))}
    />
  );

  return (
    <span className={`inline break-words leading-[1.9] ${className}`}>
      {nodes.map((node, idx) => {
        if (node.kind === "newline") return <br key={idx} />;
        if (node.kind === "text") {
          const localized = localizeGeometricEntitiesInPlainText(node.value, notationLanguage);
          return <React.Fragment key={idx}>{formatNumeralsByModeSSOT(localized, numeralMode)}</React.Fragment>;
        }
        if (node.kind === "math") return <React.Fragment key={idx}>{renderFormula(node.latex)}</React.Fragment>;
        return (
          <span key={idx} className="whitespace-nowrap">
            {renderFormula(node.latex)}
            {"\u00A0"}
            {node.unit}
          </span>
        );
      })}
    </span>
  );
}
