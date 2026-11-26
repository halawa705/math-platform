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
import {
  MathMarkdownTableBlockRenderer,
  splitTextIntoProseAndTableSegments,
} from "./math-markdown-table-block-renderer";

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
  numeralMode = "western",
  notationLanguage = "english",
  className = "",
}: SafeKaTeXBiDiMathRendererProps) {
  const segments = useMemo(() => splitTextIntoProseAndTableSegments(text ?? ""), [text]);
  if (!text) return null;

  const renderFormula = (latex: string) => (
    <MathFormulaFitBox
      html={renderKatexHtmlCached(localizeCanonicalLatex(latex, numeralMode, notationLanguage))}
    />
  );

  const renderProseNodes = (proseText: string) => {
    const nodes = parseCanonicalTextToNodes(canonicalizeCached(proseText));
    const rendered: React.ReactNode[] = [];
    for (let idx = 0; idx < nodes.length; idx++) {
      const node = nodes[idx];
      if (node.kind === "newline") {
        rendered.push(<br key={idx} />);
        continue;
      }
      if (
        node.kind === "text" &&
        node.value.endsWith("(") &&
        nodes[idx + 1]?.kind === "math" &&
        nodes[idx + 2]?.kind === "text" &&
        (nodes[idx + 2] as { kind: "text"; value: string }).value.startsWith(")")
      ) {
        const prefix = node.value.slice(0, -1);
        const mathNode = nodes[idx + 1] as { kind: "math"; latex: string };
        const suffixNode = nodes[idx + 2] as { kind: "text"; value: string };
        const suffixRest = suffixNode.value.slice(1);
        if (prefix) {
          const localizedPre = localizeGeometricEntitiesInPlainText(prefix, notationLanguage);
          rendered.push(
            <span key={`${idx}-pre`} className="math-prose-segment">
              {formatNumeralsByModeSSOT(localizedPre, numeralMode)}
            </span>
          );
        }
        rendered.push(
          <span key={`${idx}-grp`} dir="ltr" className="inline-block whitespace-nowrap">
            ({renderFormula(mathNode.latex)})
          </span>
        );
        if (suffixRest) {
          const localizedPost = localizeGeometricEntitiesInPlainText(suffixRest, notationLanguage);
          rendered.push(
            <span key={`${idx}-post`} className="math-prose-segment">
              {formatNumeralsByModeSSOT(localizedPost, numeralMode)}
            </span>
          );
        }
        idx += 2;
        continue;
      }
      if (node.kind === "text") {
        const gluedOpMatch = node.value.match(/^([\s\S]*?)([=≈])\s*$/);
        const nextNode = nodes[idx + 1];
        if (gluedOpMatch && nextNode?.kind === "math") {
          const [, prefix, op] = gluedOpMatch;
          if (prefix) {
            const localizedPre = localizeGeometricEntitiesInPlainText(prefix, notationLanguage);
            rendered.push(
              <span key={`${idx}-op-pre`} className="math-prose-segment">
                {formatNumeralsByModeSSOT(localizedPre, numeralMode)}
              </span>
            );
          }
          rendered.push(
            <span key={`${idx}-op-glue`} className="inline-block whitespace-nowrap">
              <span className="math-prose-segment">{op}{"\u00A0"}</span>
              {renderFormula(nextNode.latex)}
            </span>
          );
          idx += 1;
          continue;
        }
        const localized = localizeGeometricEntitiesInPlainText(node.value, notationLanguage);
        rendered.push(
          <span key={idx} className="math-prose-segment">
            {formatNumeralsByModeSSOT(localized, numeralMode)}
          </span>
        );
        continue;
      }
      if (node.kind === "math") {
        rendered.push(<React.Fragment key={idx}>{renderFormula(node.latex)}</React.Fragment>);
        continue;
      }
      rendered.push(
        <span key={idx} className="whitespace-nowrap">
          {renderFormula(node.latex)}
          {"\u00A0"}
          <span className="math-prose-segment">{node.unit}</span>
        </span>
      );
    }
    return rendered;
  };

  if (segments.length === 1 && segments[0].kind === "prose") {
    return (
      <span className={`inline break-words leading-[1.9] ${className}`}>
        {renderProseNodes(segments[0].text)}
      </span>
    );
  }

  return (
    <span className={`inline break-words leading-[1.9] ${className}`}>
      {segments.map((seg, sIdx) =>
        seg.kind === "table" ? (
          <MathMarkdownTableBlockRenderer
            key={sIdx}
            rows={seg.rows}
            renderCell={(cellText) => renderProseNodes(cellText)}
          />
        ) : (
          <React.Fragment key={sIdx}>{renderProseNodes(seg.text)}</React.Fragment>
        )
      )}
    </span>
  );
}
