"use client";

/**
 * @file pdf-watermark-ornamental-svg.tsx
 * @description راسم المخطوطة العربية الاحترافية للعلامة المائية بتفاصيل قلم الخط العربي المستدق الأطراف
 * (خط الرقعة السلطاني `Aref Ruqaa`، الثلث الملكي `Amiri`، أو الكوفي المزخرف `Reem Kufi`) مع الحليات والكشيدة الديوانية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 165 سطراً).
 */

import React from "react";
import type { WatermarkCalligraphyFontId } from "../ssot/pdf-print-settings-ssot";

export const MODULE_ID_PDF_WATERMARK_ORNAMENTAL_SVG =
  "pdf_watermark_ornamental_svg" as const;

const CALLIGRAPHY_FONT_STACKS: Record<WatermarkCalligraphyFontId, string> = {
  aref_ruqaa: "'Aref Ruqaa', 'Amiri', 'Cairo', serif",
  amiri: "'Amiri', 'Aref Ruqaa', 'Cairo', serif",
  reem_kufi: "'Reem Kufi', 'Cairo', sans-serif",
};

export interface PdfWatermarkOrnamentalSvgProps {
  readonly displayName: string;
  readonly fontId: WatermarkCalligraphyFontId;
  readonly showFrameOrnament: boolean;
  readonly inkPrimary: string;
  readonly inkAccent: string;
}

export function PdfWatermarkOrnamentalSvg({
  displayName,
  fontId,
  showFrameOrnament,
  inkPrimary,
  inkAccent,
}: PdfWatermarkOrnamentalSvgProps) {
  const fontStack = CALLIGRAPHY_FONT_STACKS[fontId] ?? CALLIGRAPHY_FONT_STACKS.aref_ruqaa;
  const approxFontPx =
    displayName.length > 22 ? 54 : displayName.length > 15 ? 64 : 78;

  return (
    <svg
      viewBox="0 0 700 280"
      width="660"
      height="264"
      aria-hidden="true"
      style={{
        width: "92%",
        maxWidth: "660px",
        height: "auto",
        overflow: "visible",
        display: "block",
      }}
    >
      {showFrameOrnament && (
        <>
          {/* تاج علوي متماثل مرسوم بسن قلم الخط المستدق (سميك بالوسط، حاد بالأطراف) */}
          <path
            d="M 118 76 Q 230 20 332 52 Q 232 33 118 76 Z"
            fill={inkPrimary}
            opacity="0.78"
          />
          <path
            d="M 582 76 Q 470 20 368 52 Q 468 33 582 76 Z"
            fill={inkPrimary}
            opacity="0.78"
          />
          <path
            d="M 184 82 Q 260 50 326 66 Q 260 58 184 82 Z"
            fill={inkAccent}
            opacity="0.62"
          />
          <path
            d="M 516 82 Q 440 50 374 66 Q 440 58 516 82 Z"
            fill={inkAccent}
            opacity="0.62"
          />

          {/* نجمة إسلامية ثمانية هندسية في القمة */}
          <g transform="translate(350,47)" fill={inkPrimary} opacity="0.86">
            <rect x="-8" y="-8" width="16" height="16" rx="1" />
            <rect x="-8" y="-8" width="16" height="16" rx="1" transform="rotate(45)" />
          </g>

          {/* نقاط خطية (نقطة الخطاط المعينية) حول الوسط */}
          <polygon points="314,50 319,45 324,50 319,55" fill={inkAccent} opacity="0.75" />
          <polygon points="376,50 381,45 386,50 381,55" fill={inkAccent} opacity="0.75" />

          {/* أجنحة جانبية مستدقة على اليمين واليسار */}
          <path d="M 28 140 Q 72 135 112 140 Q 72 145 28 140 Z" fill={inkPrimary} opacity="0.58" />
          <path d="M 672 140 Q 628 135 588 140 Q 628 145 672 140 Z" fill={inkPrimary} opacity="0.58" />
          <polygon points="118,140 125,134 132,140 125,146" fill={inkAccent} opacity="0.72" />
          <polygon points="568,140 575,134 582,140 575,146" fill={inkAccent} opacity="0.72" />

          {/* حليات تشكيلية خطية طائرة تضفي روح المخطوطة اليدوية */}
          <path
            d="M 225 94 C 232 82, 246 84, 242 96 C 240 100, 232 99, 234 93"
            fill="none"
            stroke={inkAccent}
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.55"
          />
          <path
            d="M 455 95 L 478 85"
            stroke={inkAccent}
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.55"
          />
        </>
      )}

      {/* ظل حفر رقيق للعمق الخطي */}
      <text
        x="352"
        y="157"
        textAnchor="middle"
        direction="rtl"
        style={{
          fontFamily: fontStack,
          fontSize: `${approxFontPx}px`,
          fontWeight: 700,
          fill: "none",
          stroke: inkAccent,
          strokeWidth: 1.2,
          opacity: 0.42,
        }}
      >
        {displayName}
      </text>

      {/* المخطوطة الرئيسية بالخط العربي الأصيل */}
      <text
        x="350"
        y="153"
        textAnchor="middle"
        direction="rtl"
        style={{
          fontFamily: fontStack,
          fontSize: `${approxFontPx}px`,
          fontWeight: 700,
          fill: inkPrimary,
        }}
      >
        {displayName}
      </text>

      {showFrameOrnament && (
        <>
          {/* كشيدة السيف الديواني السفلية المستدقة الأطراف */}
          <path
            d="M 88 192 Q 350 256 612 186 Q 350 236 88 192 Z"
            fill={inkPrimary}
            opacity="0.82"
          />
          <path
            d="M 158 214 Q 350 258 542 210 Q 350 247 158 214 Z"
            fill={inkAccent}
            opacity="0.65"
          />
          <polygon points="350,224 358,232 350,240 342,232" fill={inkPrimary} opacity="0.88" />
        </>
      )}
    </svg>
  );
}
