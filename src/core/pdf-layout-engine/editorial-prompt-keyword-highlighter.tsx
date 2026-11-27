"use client";

/**
 * @file editorial-prompt-keyword-highlighter.tsx
 * @description مبرز الكلمات المحورية والأفعال الرياضية الجراحي للقالب المدرسي الحديث (أوجد، فإن، فما، أثبت أن، فإوجد، هل...)
 * خارج صيغ KaTeX مع الحفاظ على نقاط الفراغات والعرض الرياضي الدقيق.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 125 سطراً).
 */

import React from "react";
import type { PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";
import type { MathNotationLanguage, NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";
import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";
import { cleanStudentFacingMathPromptSSOT } from "../ingestion/notebooklm-citation-latex-sanitizer";

export const MODULE_ID_EDITORIAL_PROMPT_HIGHLIGHTER = "editorial_prompt_highlighter" as const;

const ARABIC_KEYWORD_ALTERNATIVES = [
  "أوجد\\s+بالبرهان\\s*:?",
  "احسب\\s+بالبرهان\\s*:?",
  "أثبت\\s+بالبرهان\\s*:?",
  "أثبت\\s+أن\\s*:?",
  "اثبت\\s+أن\\s*:?",
  "برهن\\s+أن\\s*:?",
  "بين\\s+أن\\s*:?",
  "حلل(?:\\s+كلاً\\s+مما\\s+يأتي\\s+تحليلاً\\s+تاماً)?\\s*:?",
  "فما\\s+(?:قيمة|قياس|طول|عدد|نسبة)\\s*:?",
  "ما\\s+(?:زيادة|نقص|قيمة|قياس|نوع)\\s*:?",
  "كم\\s+(?:ينقص|يزيد)\\s*:?",
  "أوجد\\s+(?:قيمة|قياس|طول|مساحة|محيط|ناتج|مجموعة\\s+الحل)\\s*:?",
  "أي\\s+مما\\s+يلي",
  "أي\\s+الأعداد\\s+الآتية",
  "فأوجد\\s*:?",
  "فإن\\s*:?",
  "فما\\s*:?",
  "فأي\\s*:?",
  "أوجد\\s*:?",
  "احسب\\s*:?",
  "اجمع\\s*:?",
  "اطرح\\s*:?",
  "أكمل\\s*:?",
  "اكمل\\s*:?",
  "هل\\s*:?",
].join("|");

const BOUNDARY_KEYWORD_REGEX = new RegExp(
  `(^|[\\s،؛:()\\[\\].\\-])(${ARABIC_KEYWORD_ALTERNATIVES})(?=$|[\\s،؛:؟?!.\\)\\[])`,
  "g"
);

function renderProseSegmentWithBlanks(
  text: string,
  numeralMode: NumeralDisplayMode,
  notationLanguage: MathNotationLanguage,
  keyPrefix: string
): React.ReactNode {
  const blankParts = text.split(/(\.{3,}|…{1,})/g);
  if (blankParts.length === 1) {
    return (
      <SafeKaTeXBiDiMathRenderer
        key={keyPrefix}
        text={text}
        numeralMode={numeralMode}
        notationLanguage={notationLanguage}
        className="!leading-[1.34]"
      />
    );
  }

  return blankParts.map((seg, idx) => {
    if (!seg) return null;
    if (/^(?:\.{3,}|…{1,})$/.test(seg)) {
      const normalizedDots = seg.length < 7 ? "........." : seg;
      return (
        <span
          key={`${keyPrefix}-b-${idx}`}
          className="inline-block px-1 tracking-[0.06em] font-black text-slate-700"
        >
          {normalizedDots}
        </span>
      );
    }
    return (
      <SafeKaTeXBiDiMathRenderer
        key={`${keyPrefix}-t-${idx}`}
        text={seg}
        numeralMode={numeralMode}
        notationLanguage={notationLanguage}
        className="!leading-[1.34]"
      />
    );
  });
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
    "= $ ........."
  );
  const mathAndTextTokens = cleaned.split(/(\$[^$]+\$)/g);
  const nodes: React.ReactNode[] = [];
  let keySeq = 0;
  const kwColor = isPhotocopy ? "#0F172A" : palette.accentHex;

  for (const token of mathAndTextTokens) {
    if (!token) continue;
    if (token.startsWith("$") && token.endsWith("$")) {
      nodes.push(
        <SafeKaTeXBiDiMathRenderer
          key={`em-${keySeq++}`}
          text={token}
          numeralMode={numeralMode}
          notationLanguage={notationLanguage}
          className="!leading-[1.34]"
        />
      );
      continue;
    }

    BOUNDARY_KEYWORD_REGEX.lastIndex = 0;
    let cursor = 0;
    let match: RegExpExecArray | null;
    while ((match = BOUNDARY_KEYWORD_REGEX.exec(token)) !== null) {
      const prefix = match[1] ?? "";
      const keyword = match[2] ?? "";
      const kwStart = match.index + prefix.length;

      if (kwStart > cursor) {
        nodes.push(
          renderProseSegmentWithBlanks(
            token.slice(cursor, kwStart),
            numeralMode,
            notationLanguage,
            `et-${keySeq++}`
          )
        );
      }
      nodes.push(
        <span key={`kw-${keySeq++}`} style={{ color: kwColor }} className="font-black">
          {keyword}
        </span>
      );
      cursor = kwStart + keyword.length;
    }

    if (cursor < token.length) {
      nodes.push(
        renderProseSegmentWithBlanks(
          token.slice(cursor),
          numeralMode,
          notationLanguage,
          `et-${keySeq++}`
        )
      );
    }
  }

  return nodes;
}
