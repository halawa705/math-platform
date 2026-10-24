/**
 * @file pdf-isolated-print-trigger.ts
 * @description خاصية ذرية مستقلة: تنفيذ الطباعة المعزولة وتصدير الـ PDF المتجهي
 * - يضبط `@page { size: A4 portrait; margin: 7mm 8mm; }` مع عرض `100%` متمركز في منتصف الورقة تماماً
 *   للقضاء النهائي على مشكلة انحياز الصفحة لليسار أو ظهور هامش أبيض في اليمين.
 * - يمنع تمدد أي معادلة KaTeX خارج حدود العمود (`max-width: 100% !important; white-space: normal !important`).
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

  const iframe = document.createElement("iframe");
  iframe.id = "isolated-math-a4-print-frame";
  iframe.setAttribute(
    "style",
    "position:fixed;top:0;right:0;width:100%;height:100%;border:0;opacity:0.001;pointer-events:none;z-index:-1;"
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
      margin: 7mm 8mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      max-width: 100% !important;
      overflow-x: hidden !important;
      background-color: #ffffff !important;
      color: #0f172a !important;
      font-family: ${fontSpec.cssFontStack} !important;
      font-size: ${settings.exactFontSizePt}pt !important;
      line-height: ${fontSpec.optimalLineHeight} !important;
      direction: rtl !important;
    }
    .katex-mathml, .katex-error {
      display: none !important;
    }
    .katex, .katex-display, .katex-html {
      max-width: 100% !important;
      white-space: normal !important;
      overflow-wrap: anywhere !important;
      overflow: visible !important;
    }
    .katex .mfrac {
      margin: 0.2em 0.14em !important;
    }
    /* Reset outer flex containers in print to prevent stretching and huge white voids */
    .w-full.max-w-\[794px\],
    .min-h-\[1123px\],
    .flex.flex-col.justify-between {
      display: block !important;
      height: auto !important;
      min-height: 0 !important;
      justify-content: flex-start !important;
    }
    .grid.grid-cols-2 {
      display: block !important;
      columns: 2 !important;
      column-gap: 4mm !important;
    }
    .grid.grid-cols-2 > * {
      display: block !important;
      width: 100% !important;
      margin-bottom: 2mm !important;
      break-inside: auto !important;
      page-break-inside: auto !important;
    }
    .a4-ministerial-sheet {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 auto !important;
      padding: 0 !important;
      background-color: #ffffff !important;
      box-shadow: none !important;
      overflow-x: hidden !important;
    }
    header {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      margin-bottom: 2mm !important;
    }
    footer {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      margin-top: 3mm !important;
    }
    section {
      break-inside: auto !important;
      page-break-inside: auto !important;
    }
    article {
      break-inside: auto !important;
      page-break-inside: auto !important;
      min-width: 0 !important;
      max-width: 100% !important;
      margin-bottom: 2mm !important;
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
