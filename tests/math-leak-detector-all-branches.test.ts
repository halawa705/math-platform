import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import SafeKaTeXBiDiMathRenderer from "../src/components/global-ui/safe-katex-bidi-math-renderer";
import { sanitizeNotebookLMCitationsAndLatex } from "../src/core/ingestion/notebooklm-citation-latex-sanitizer";
import { NOTEBOOKLM_REAL_AND_SYNTHETIC_MATH_LINES } from "./fixtures/notebooklm-real-and-synthetic-math-lines-fixture";

const LEAK_WORDS =
  /\b(frac|dfrac|sqrt|text|textbf|mathrm|mathbb|displaystyle|begin|end|cases|quad|qquad|cdot|times|div|overline|widehat|Delta|angle|circ|xrightarrow|rightarrow|Rightarrow|implies|approx|infty|setminus|sim|cong|sum|bar|left|right)\b/;

function renderVisible(cleaned: string): { html: string; visible: string } {
  const html = renderToStaticMarkup(
    React.createElement(SafeKaTeXBiDiMathRenderer, { text: cleaned, numeralMode: "western", notationLanguage: "english" })
  );
  const visible = html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
  return { html, visible };
}

describe("M0 — math leak detector (all branches)", () => {
  for (const [i, line] of NOTEBOOKLM_REAL_AND_SYNTHETIC_MATH_LINES.entries()) {
    const label = `#${i} [${line.branch}] ${line.raw.slice(0, 50)}`;

    it(`no leaked LaTeX: ${label}`, () => {
      const cleaned = sanitizeNotebookLMCitationsAndLatex(line.raw).cleanedText;
      const { html, visible } = renderVisible(cleaned);
      expect(html, "katex-error").not.toContain("katex-error");
      expect(visible, "backslash").not.toMatch(/\\/);
      expect(visible, "dollar").not.toMatch(/\$/);
      expect(visible, "latex word").not.toMatch(LEAK_WORDS);
      const plainOutsideMath = cleaned.replace(/\$[^$]*\$/g, " ");
      expect(plainOutsideMath, "unit before number").not.toMatch(/(?:^|\s)(?:سم²?|سم³?|مم|كم|متر|جم|كجم|لتر)\s+[0-9٠-٩]/);
    });

    it(`idempotent: ${label}`, () => {
      const once = sanitizeNotebookLMCitationsAndLatex(line.raw).cleanedText;
      const twice = sanitizeNotebookLMCitationsAndLatex(once).cleanedText;
      expect(twice).toBe(once);
    });
  }
});
