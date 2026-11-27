"use client";

/**
 * @file editorial-highlighted-prompt-renderer.tsx
 * @description مصيّر نص السؤال في القالب المدرسي الحديث: يدمج جداول Markdown المنسقة مع الإبراز اللوني
 * للكلمات المحورية الرياضية (أوجد، فإن، فما، أثبت أن...) مع الحفاظ التام على المسافات المحيطة بالكلمات.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 115 سطراً).
 */

import React from "react";
import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";
import {
  MathMarkdownTableBlockRenderer,
  splitTextIntoProseAndTableSegments,
} from "@/components/global-ui/math-markdown-table-block-renderer";
import { cleanStudentFacingMathPromptSSOT } from "../ingestion/notebooklm-citation-latex-sanitizer";
import type { MathNotationLanguage, NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";
import type { PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";

export const MODULE_ID_EDITORIAL_HIGHLIGHTED_PROMPT_RENDERER =
  "editorial_highlighted_prompt_renderer" as const;

const KEYWORD_HIGHLIGHT_REGEX =
  /(فإن\s*:?|فما\s+قيمة\s*:?|فأوجد\s*:?|أوجد\s+بالبرهان\s*:?|أوجد\s*:?|اثبت\s+أن\s*:?|أثبت\s+أن\s*:?|برهن\s+أن\s*:?|احسب\s+بالبرهان\s*:?|احسب\s*:?|اجمع\s*:?|اطرح\s*:?|كم\s+ينقص\s*:?|ما\s+زيادة\s*:?|حلل(?:\s+كلاً\s+مما\s+يأتي\s+تحليلاً\s+تاماً)?\s*:?|أي\s+مما\s+يلي|أي\s+الأعداد\s+الآتية)/g;

function renderHighlightedTextSegment(
  segmentText: string,
  numeralMode: NumeralDisplayMode,
  notationLanguage: MathNotationLanguage,
  kwColor: string,
  keyPrefix: string
): React.ReactNode {
  const mathAndTextTokens = segmentText.split(/(\$[^$]+\$)/g);
  const nodes: React.ReactNode[] = [];
  let keySeq = 0;

  for (const token of mathAndTextTokens) {
    if (!token) continue;
    if (token.startsWith("$") && token.endsWith("$")) {
      nodes.push(
        <SafeKaTeXBiDiMathRenderer
          key={`${keyPrefix}-em-${keySeq++}`}
          text={token}
          numeralMode={numeralMode}
          notationLanguage={notationLanguage}
          className="!leading-[1.32]"
        />
      );
      continue;
    }

    const parts = token.split(KEYWORD_HIGHLIGHT_REGEX);
    for (const part of parts) {
      if (!part) continue;
      if (KEYWORD_HIGHLIGHT_REGEX.test(part)) {
        KEYWORD_HIGHLIGHT_REGEX.lastIndex = 0;
        nodes.push(
          <span key={`${keyPrefix}-kw-${keySeq++}`} style={{ color: kwColor }} className="font-black">
            {part}
          </span>
        );
      } else {
        KEYWORD_HIGHLIGHT_REGEX.lastIndex = 0;
        const hasLeadSpace = /^\s/.test(part);
        const hasTrailSpace = /\s$/.test(part) && part.trim().length > 0;
        nodes.push(
          <React.Fragment key={`${keyPrefix}-et-${keySeq++}`}>
            {hasLeadSpace ? " " : null}
            <SafeKaTeXBiDiMathRenderer
              text={part}
              numeralMode={numeralMode}
              notationLanguage={notationLanguage}
              className="!leading-[1.32]"
            />
            {hasTrailSpace ? " " : null}
          </React.Fragment>
        );
      }
    }
  }
  return nodes;
}

export function renderEditorialHighlightedPrompt(
  rawPrompt: string,
  numeralMode: NumeralDisplayMode,
  notationLanguage: MathNotationLanguage,
  palette: PrintThemePaletteTokens,
  isPhotocopy: boolean
): React.ReactNode {
  const cleaned = cleanStudentFacingMathPromptSSOT(rawPrompt).replace(
    /=\s*(?:\.{2,}|\\dots|\\ldots)\s*\$/g,
    "= $ ..."
  );
  const kwColor = isPhotocopy ? "#0F172A" : palette.accentHex;
  const segments = splitTextIntoProseAndTableSegments(cleaned);

  if (segments.length === 1 && segments[0].kind === "prose") {
    return renderHighlightedTextSegment(segments[0].text, numeralMode, notationLanguage, kwColor, "p0");
  }

  return (
    <div className="w-full space-y-1">
      {segments.map((seg, sIdx) =>
        seg.kind === "table" ? (
          <MathMarkdownTableBlockRenderer
            key={`tbl-${sIdx}`}
            rows={seg.rows}
            renderCell={(cellText) => (
              <SafeKaTeXBiDiMathRenderer
                text={cellText}
                numeralMode={numeralMode}
                notationLanguage={notationLanguage}
                className="!leading-[1.25]"
              />
            )}
          />
        ) : (
          <div key={`pr-${sIdx}`}>
            {renderHighlightedTextSegment(seg.text, numeralMode, notationLanguage, kwColor, `p${sIdx}`)}
          </div>
        )
      )}
    </div>
  );
}
