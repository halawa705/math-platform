"use client";

/**
 * @file compact-mcq-inline-prompt-renderer.tsx
 * @description مصيّر ذري لنص سؤال الاختيار من متعدد المدمج مع مربعات الفراغ (`...` / `____`) وحساب طول البدائل.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 110 سطراً).
 */

import React from "react";
import type { PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";
import type { MathNotationLanguage, NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";
import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";
import { cleanStudentFacingMathPromptSSOT } from "../ingestion/notebooklm-citation-latex-sanitizer";

export const MODULE_ID_COMPACT_MCQ_INLINE_PROMPT_RENDERER =
  "compact_mcq_inline_prompt_renderer" as const;

export function estimateVisualChoiceLength(choiceText: string): number {
  if (!choiceText) return 0;
  return choiceText
    .replace(/\$/g, "")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1/$2")
    .replace(/\\sqrt\{([^}]+)\}/g, "√$1")
    .replace(/\\[a-zA-Z]+/g, "X")
    .replace(/[{}]/g, "")
    .trim().length;
}

export function renderPromptWithInlineBlankBoxes(
  rawPrompt: string,
  numeralMode: NumeralDisplayMode,
  notationLanguage: MathNotationLanguage,
  palette: PrintThemePaletteTokens
): React.ReactNode {
  const cleaned = cleanStudentFacingMathPromptSSOT(rawPrompt).replace(
    /=\s*(?:\.{2,}|\\dots|\\ldots)\s*\$/g,
    "= $ ..."
  );
  const mathAndTextTokens = cleaned.split(/(\$[^$]+\$)/g);
  const nodes: React.ReactNode[] = [];
  let keySeq = 0;

  for (const token of mathAndTextTokens) {
    if (!token) continue;
    if (token.startsWith("$") && token.endsWith("$")) {
      nodes.push(
        <SafeKaTeXBiDiMathRenderer
          key={`m-${keySeq++}`}
          text={token}
          numeralMode={numeralMode}
          notationLanguage={notationLanguage}
          className="!leading-[1.32]"
        />
      );
      continue;
    }

    const blankParts = token.split(/(\.{2,}|_{2,}|…+)/g);
    for (const part of blankParts) {
      if (!part) continue;
      if (/^(?:\.{2,}|_{2,}|…+)$/.test(part)) {
        nodes.push(
          <span
            key={`b-${keySeq++}`}
            aria-label="فراغ الإجابة"
            style={{
              backgroundColor: "#ffffff",
              border: `1.5px solid ${palette.accentHex}`,
              borderRadius: "6px",
              boxShadow: `0 1.5px 0 ${palette.borderHex}55, inset 0 1px 2px rgba(15, 23, 42, 0.05)`,
              minWidth: "52px",
              height: "18px",
              padding: "0 7px",
              margin: "0 4px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              verticalAlign: "middle",
            }}
          >
            <span style={{ width: "28px", borderBottom: `1.4px dashed ${palette.primaryHex}99` }} />
          </span>
        );
      } else {
        nodes.push(
          <SafeKaTeXBiDiMathRenderer
            key={`t-${keySeq++}`}
            text={part}
            numeralMode={numeralMode}
            notationLanguage={notationLanguage}
            className="!leading-[1.32]"
          />
        );
      }
    }
  }
  return nodes;
}
