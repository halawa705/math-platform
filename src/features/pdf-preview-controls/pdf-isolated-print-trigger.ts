/**
 * @file pdf-isolated-print-trigger.ts
 * @description خاصية ذرية مستقلة (Micro-Feature): تنفيذ الطباعة المعزولة وتصدير الـ PDF المتجهي
 * بخلفية بيضاء ناصعة (#ffffff !important) مع تضمين الخط المختار (Cairo / Almarai) وحجم الخط الحقيقي.
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

  const iframe = document.createElement("iframe");
  iframe.id = "isolated-math-a4-print-frame";
  iframe.style.position = "fixed";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8" />
  <title>${settings.customDocumentTitle}</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: #ffffff !important;
      color: #0f172a !important;
      font-family: ${fontSpec.cssFontStack} !important;
      font-size: ${settings.exactFontSizePt}pt !important;
      line-height: ${fontSpec.optimalLineHeight} !important;
      direction: rtl !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  </style>
</head>
<body>${printableHtmlContent}</body>
</html>`);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  }, 300);
}
