/**
 * @file pdf-isolated-print-trigger.ts
 * @description محرك استخراج وتصدير ملفات الـ PDF السيادي المستقل (Sovereign A4 PDF Exporter):
 * - يعمل بنظام الصفحات المنفصلة المقاسة مسبقاً (`.sovereign-a4-page-sheet` بأبعاد `210mm × 297mm` دقيقة).
 * - يلغي تماماً تدخل المتصفح في تقسيم الصفحات عبر `@page { size: A4 portrait; margin: 0mm !important; }`.
 * - هوامش الصفحة المطبوعة بالبكسل (18px 20px) تطابق تماماً هوامش المعاينة التي قاسها المحرك (كانت 5mm 5.5mm فتضيق
 *   العمود بـ ~1.6px ويلتف النص بسطر إضافي ويفيض آخر الصفحة).
 * - يحافظ على المعادلات الرياضية KaTeX أفقية متماسكة (`white-space: nowrap !important`) دون أي تكسير رأسي للحروف.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import {
  PRINT_FONT_FAMILIES_SSOT,
  type PDFPrintSettingsStateSSOT,
} from "@/core/ssot/pdf-print-settings-ssot";

export function triggerIsolatedA4Print(
  printableHtmlContent: string,
  settings: PDFPrintSettingsStateSSOT
): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const fontSpec = PRINT_FONT_FAMILIES_SSOT[settings.fontFamilyId];
  const existingFrame = document.getElementById("isolated-math-a4-print-frame");
  if (existingFrame) existingFrame.remove();

  const headStylesHtml = Array.from(
    document.head.querySelectorAll('style, link[rel="stylesheet"]')
  )
    .map((el) => el.outerHTML)
    .join("\n");

  const originalDocTitle = document.title;
  if (settings.customDocumentTitle) {
    document.title = settings.customDocumentTitle;
  }

  const iframe = document.createElement("iframe");
  iframe.id = "isolated-math-a4-print-frame";
  iframe.setAttribute(
    "style",
    "position:fixed;top:0;right:0;width:210mm;height:297mm;border:0;opacity:0.001;pointer-events:none;z-index:-1;"
  );
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar" class="light">
<head>
  <meta charset="utf-8" />
  <title>${settings.customDocumentTitle}</title>
  ${headStylesHtml}
  <style>
    @page {
      size: A4 portrait;
      margin: 0mm !important;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 210mm !important;
      background-color: #ffffff !important;
      color: #0f172a !important;
      font-family: ${fontSpec.cssFontStack} !important;
      direction: rtl !important;
    }
    .katex-mathml, .katex-error {
      display: none !important;
    }
    .katex, .katex-html, .katex .base {
      white-space: nowrap !important;
      direction: ltr !important;
      unicode-bidi: isolate !important;
    }
    .math-fit-wrap .katex, .math-fit-wrap .katex-html {
      white-space: normal !important;
    }
    .katex-display {
      max-width: 100% !important;
      margin: 0.2em 0 !important;
      overflow-x: hidden !important;
    }
    .katex .mfrac {
      margin: 0.1em 0.1em !important;
    }
    .a4-ministerial-sheet {
      width: 210mm !important;
      margin: 0 !important;
      padding: 0 !important;
      background-color: #ffffff !important;
    }
    .sovereign-a4-page-sheet {
      width: 210mm !important;
      height: 297mm !important;
      min-height: 297mm !important;
      max-height: 297mm !important;
      padding: 18px 20px !important;
      margin: 0 !important;
      background-color: #ffffff !important;
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      overflow: hidden !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: space-between !important;
      page-break-after: always !important;
      break-after: page !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .sovereign-a4-page-sheet:last-of-type {
      page-break-after: auto !important;
      break-after: auto !important;
    }
    .grid.grid-cols-2 {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
    .grid.grid-cols-4 {
      display: grid !important;
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    }
    .grid.grid-cols-12 {
      display: grid !important;
      grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
    }
    svg {
      max-width: 100% !important;
      height: auto !important;
      display: block;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="a4-ministerial-sheet">
    ${printableHtmlContent}
  </div>
</body>
</html>`);
  doc.close();

  const runPrint = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    if (originalDocTitle) {
      const restoreTitle = () => {
        document.title = originalDocTitle;
      };
      window.addEventListener("afterprint", restoreTitle, { once: true });
      setTimeout(restoreTitle, 3500);
    }
  };

  if (doc.fonts && doc.fonts.ready) {
    Promise.race([
      doc.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, 650)),
    ])
      .then(runPrint)
      .catch(runPrint);
  } else {
    setTimeout(runPrint, 450);
  }
}
