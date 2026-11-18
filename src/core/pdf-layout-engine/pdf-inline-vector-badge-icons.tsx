"use client";

/**
 * @file pdf-inline-vector-badge-icons.tsx
 * @description أيقونات Vector SVG خفيفة وصافية مخصصة لبطاقات وترويسات صفحات الـ PDF.
 * تستبدل رموز الإيموجي (Segoe UI Emoji) التي يضطر Chromium لتضمينها كخطوط Type3 وصور نقطية متكررة،
 * مما يقلل حجم ملف الـ PDF المصدر مع الحفاظ الكامل على وضوح الطباعة واللون الموروث (currentColor).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 200 سطر).
 */

import React from "react";

export const MODULE_ID_PDF_INLINE_VECTOR_BADGE_ICONS =
  "pdf_inline_vector_badge_icons" as const;

interface PdfBadgeIconProps {
  readonly className?: string;
}

const DEFAULT_ICON_CLASS = "inline-block shrink-0 align-[-0.14em]";

function SvgIconFrame({
  children,
  className,
}: PdfBadgeIconProps & { readonly children: React.ReactNode }) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className ? `${DEFAULT_ICON_CLASS} ${className}` : DEFAULT_ICON_CLASS}
    >
      {children}
    </svg>
  );
}

/** بديل ✍️ (قلم الحل والإجابة) */
export function PdfPenIcon({ className }: PdfBadgeIconProps) {
  return (
    <SvgIconFrame className={className}>
      <path d="M11.6 2.2l2.2 2.2-8.1 8.1-2.9.7.7-2.9 8.1-8.1z" />
      <path d="M9.8 4l2.2 2.2" />
    </SvgIconFrame>
  );
}

/** بديل 💡 (فكرة ومفهوم) */
export function PdfBulbIcon({ className }: PdfBadgeIconProps) {
  return (
    <SvgIconFrame className={className}>
      <path d="M5.7 11.2c-.3-1.1-1.7-2-1.7-4a4 4 0 1 1 8 0c0 2-1.4 2.9-1.7 4H5.7z" />
      <path d="M6.2 13.4h3.6" />
    </SvgIconFrame>
  );
}

/** بديل 📐 (مثلث هندسي / قاعدة وقانون) */
export function PdfRuleRulerIcon({ className }: PdfBadgeIconProps) {
  return (
    <SvgIconFrame className={className}>
      <polygon points="2.5,13.5 13.5,13.5 2.5,2.5" />
      <polygon points="5,11 9.2,11 5,6.8" />
    </SvgIconFrame>
  );
}

/** بديل 🎯 (هدف / حاول بنفسك) */
export function PdfTargetIcon({ className }: PdfBadgeIconProps) {
  return (
    <SvgIconFrame className={className}>
      <circle cx="8" cy="8" r="5.8" />
      <circle cx="8" cy="8" r="2.8" />
      <circle cx="8" cy="8" r="0.8" fill="currentColor" stroke="none" />
    </SvgIconFrame>
  );
}

/** بديل ⚡ (ورقة عمل وتطبيق سريع) */
export function PdfBoltIcon({ className }: PdfBadgeIconProps) {
  return (
    <SvgIconFrame className={className}>
      <polygon points="9,1.5 3.5,9 7.8,9 7,14.5 12.5,7 8.2,7" fill="currentColor" strokeWidth="1" />
    </SvgIconFrame>
  );
}

/** بديل 📚 (كتاب الواجب المنزلي) */
export function PdfBookIcon({ className }: PdfBadgeIconProps) {
  return (
    <SvgIconFrame className={className}>
      <path d="M2.2 3.2h4.6c.7 0 1.2.5 1.2 1.2v8.4c0-.6-.5-1-1.1-1H2.2V3.2z" />
      <path d="M13.8 3.2H9.2c-.7 0-1.2.5-1.2 1.2v8.4c0-.6.5-1 1.1-1h4.7V3.2z" />
    </SvgIconFrame>
  );
}

/** بديل 📍 (شارة المصدر / الموضع) */
export function PdfPinIcon({ className }: PdfBadgeIconProps) {
  return (
    <SvgIconFrame className={className}>
      <path d="M8 14.2s4.5-4.3 4.5-7.7a4.5 4.5 0 1 0-9 0c0 3.4 4.5 7.7 4.5 7.7z" />
      <circle cx="8" cy="6.5" r="1.4" />
    </SvgIconFrame>
  );
}

/** بديل 🔑 (مفتاح الإجابات) */
export function PdfKeyIcon({ className }: PdfBadgeIconProps) {
  return (
    <SvgIconFrame className={className}>
      <circle cx="5.2" cy="8" r="2.8" />
      <path d="M8 8h5.8v2.2" />
      <path d="M11.3 8v1.7" />
    </SvgIconFrame>
  );
}

/** بديل 👤 (اسم الطالب) */
export function PdfUserIcon({ className }: PdfBadgeIconProps) {
  return (
    <SvgIconFrame className={className}>
      <circle cx="8" cy="5.2" r="2.6" />
      <path d="M2.8 13.8c.6-2.4 2.6-3.6 5.2-3.6s4.6 1.2 5.2 3.6" />
    </SvgIconFrame>
  );
}

/** بديل 📞 (رقم الهاتف) */
export function PdfPhoneIcon({ className }: PdfBadgeIconProps) {
  return (
    <SvgIconFrame className={className}>
      <path d="M3.2 2.8h2.6l1.1 2.9-1.5 1.1a8.5 8.5 0 0 0 3.8 3.8l1.1-1.5 2.9 1.1v2.6c0 .7-.6 1.2-1.3 1.2A9.8 9.8 0 0 1 2 4.1c0-.7.5-1.3 1.2-1.3z" />
    </SvgIconFrame>
  );
}

/** بديل ✨ (نجمة زينة) */
export function PdfSparkleIcon({ className }: PdfBadgeIconProps) {
  return (
    <SvgIconFrame className={className}>
      <path d="M8 2l1.3 4.7L14 8l-4.7 1.3L8 14l-1.3-4.7L2 8l4.7-1.3L8 2z" fill="currentColor" strokeWidth="0.9" />
    </SvgIconFrame>
  );
}
