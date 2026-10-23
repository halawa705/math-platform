/**
 * @file pdf-isolated-print-trigger.ts
 * @description خاصية ذرية مستقلة: تنفيذ الطباعة المعزولة وتصدير الـ PDF المتجهي
 * مع نسخ كافة أنماط Tailwind و KaTeX والخطوط العربية من الرأس (`document.head`)
 * لضمان تطابق الـ PDF المخرج بنسبة 100% مع التصميم الوزاري الفاخر على الشاشة دون أي تشوه أو تضخم للأشكال.
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

  // نسخ كافة وسوم <style> و <link rel="stylesheet"> من الصفحة لضمان وجود Tailwind و KaTeX والخطوط
  const headStylesHtml = Array.from(
    document.head.querySelectorAll('style, link[rel="stylesheet"]')
  )
    .map((el) => el.outerHTML)
    .join("\n");

  const iframe = document.createElement("iframe");
  iframe.id = "isolated-math-a4-print-frame";
  iframe.style.position = "fixed";
  iframe.style.right = "-9999px";
  iframe.style.bottom = "-9999px";
  iframe.style.width = "794px";
  iframe.style.height = "1123px";
  iframe.style.border = "0";
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
      margin: 0mm;
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
      font-size: ${settings.exactFontSizePt}pt !important;
      line-height: ${fontSpec.optimalLineHeight} !important;
      direction: rtl !important;
    }
    .katex-mathml {
      display: none !important;
    }
    .a4-ministerial-sheet {
      width: 210mm !important;
      min-height: 297mm !important;
      padding: 6mm !important;
      margin: 0 auto !important;
      background-color: #ffffff !important;
      box-shadow: none !important;
      page-break-inside: avoid;
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

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  }, 550);
}
