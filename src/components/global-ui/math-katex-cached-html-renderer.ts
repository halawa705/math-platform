/**
 * @file math-katex-cached-html-renderer.ts
 * @description يصيّر LaTeX إلى HTML عبر KaTeX مع ذاكرة LRU. عند الفشل (نادر بعد بوابة التسرب) يعرض نصاً آمناً
 * مُهرَّباً HTML بلا أي `\` أو `{}`، ولا يظهر خطأ KaTeX الأحمر أبداً.
 */

import katex from "katex";
import { degradeLatexToPlainUnicode } from "../../core/math-text/math-leak-final-gate";

export const MODULE_ID_MATH_KATEX_CACHED_HTML_RENDERER =
  "math_katex_cached_html_renderer" as const;

const MAX_CACHE_SIZE = 3000;
const htmlCache = new Map<string, string>();

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function renderKatexHtmlCached(latex: string): string {
  const cached = htmlCache.get(latex);
  if (cached !== undefined) return cached;

  let html: string;
  try {
    html = katex
      .renderToString(latex, { throwOnError: true, strict: "ignore", output: "html" })
      .replace(/<\/span><span class="base">/g, '</span><wbr><span class="base">');
  } catch {
    html = `<span dir="ltr">${escapeHtml(degradeLatexToPlainUnicode(latex))}</span>`;
  }
  if (htmlCache.size >= MAX_CACHE_SIZE) {
    const oldest = htmlCache.keys().next().value;
    if (oldest !== undefined) htmlCache.delete(oldest);
  }
  htmlCache.set(latex, html);
  return html;
}
