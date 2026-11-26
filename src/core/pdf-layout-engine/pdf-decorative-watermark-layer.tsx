"use client";

/**
 * @file pdf-decorative-watermark-layer.tsx
 * @description طبقة العلامة المائية الزخرفية في خلفية كل صفحة A4 PDF:
 * تدعم الشعار المخطوط الزخرفي الجاهز بالعرض («أ/ إسلام محمد») أو صورة زخرفية مخصصة يرفعها المعلم،
 * مع تحكم خطي دقيق في الشفافية (0% إلى 100%) والزاوية (أفقي بالعرض 0° أو مائل -18°).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 175 سطراً).
 */

import React from "react";
import type { PDFPrintSettingsStateSSOT } from "../ssot/pdf-print-settings-ssot";
import type { PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";

export const MODULE_ID_PDF_DECORATIVE_WATERMARK_LAYER =
  "pdf_decorative_watermark_layer" as const;

export interface PdfDecorativeWatermarkLayerProps {
  readonly settings: PDFPrintSettingsStateSSOT;
  readonly teacherFallbackName?: string;
  readonly palette: PrintThemePaletteTokens;
}

export function PdfDecorativeWatermarkLayer({
  settings,
  teacherFallbackName = "أ/ إسلام محمد",
  palette,
}: PdfDecorativeWatermarkLayerProps) {
  if (!settings.watermarkEnabled) return null;
  const rawPct = settings.watermarkOpacityPct ?? 16;
  const clampedPct = Math.max(0, Math.min(100, rawPct));
  if (clampedPct <= 0) return null;

  const opacity = clampedPct / 100;
  const rotationDeg = settings.watermarkRotationDeg ?? 0;
  const isCustomImg =
    settings.watermarkMode === "custom_image" &&
    Boolean(settings.watermarkImageDataUrl?.trim());
  const displayName =
    settings.watermarkText?.trim() || teacherFallbackName.trim() || "أ/ إسلام محمد";

  // تدرج الحبر الرمادي الفضي الفخم للعلامة المائية كي يظل النص الأسود فوقه مقروءاً دائماً حتى عند النسب العالية
  const inkPrimary = settings.colorThemeId === "photocopy_black" ? "#475569" : "#64748B";
  const inkAccent = settings.colorThemeId === "photocopy_black" ? "#334155" : palette.borderHex;
  const approxFontPx = displayName.length > 22 ? 52 : displayName.length > 15 ? 62 : 74;

  return (
    <div
      aria-hidden="true"
      data-pdf-watermark="true"
      style={{
        position: "absolute",
        top: "58px",
        right: "18px",
        bottom: "42px",
        left: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          opacity,
          transform: rotationDeg !== 0 ? `rotate(${rotationDeg}deg)` : undefined,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isCustomImg ? (
          <img
            src={settings.watermarkImageDataUrl}
            alt=""
            style={{
              maxWidth: "84%",
              maxHeight: "430px",
              objectFit: "contain",
              display: "block",
            }}
          />
        ) : (
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
            {/* قوس زخرفي علوي متماثل مع نجمة هندسية في المنتصف */}
            <path
              d="M 110 68 C 195 32, 275 30, 326 50"
              fill="none"
              stroke={inkPrimary}
              strokeWidth="2.4"
              strokeLinecap="round"
              opacity="0.72"
            />
            <path
              d="M 590 68 C 505 32, 425 30, 374 50"
              fill="none"
              stroke={inkPrimary}
              strokeWidth="2.4"
              strokeLinecap="round"
              opacity="0.72"
            />
            <path
              d="M 165 78 C 230 52, 290 50, 330 64"
              fill="none"
              stroke={inkAccent}
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.6"
            />
            <path
              d="M 535 78 C 470 52, 410 50, 370 64"
              fill="none"
              stroke={inkAccent}
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.6"
            />
            {/* الحلية الوسطى العلوية */}
            <polygon
              points="350,32 359,46 373,50 359,54 350,68 341,54 327,50 341,46"
              fill={inkPrimary}
              opacity="0.82"
            />
            <circle cx="312" cy="52" r="2.6" fill={inkAccent} opacity="0.7" />
            <circle cx="388" cy="52" r="2.6" fill={inkAccent} opacity="0.7" />

            {/* خطوط الأجنحة العرضية الجانبية */}
            <line x1="32" y1="138" x2="104" y2="138" stroke={inkPrimary} strokeWidth="2" opacity="0.5" />
            <line x1="596" y1="138" x2="668" y2="138" stroke={inkPrimary} strokeWidth="2" opacity="0.5" />
            <polygon points="108,138 116,132 124,138 116,144" fill={inkAccent} opacity="0.6" />
            <polygon points="576,138 584,132 592,138 584,144" fill={inkAccent} opacity="0.6" />

            {/* ظل مخطوطي خلفي رقيق للعمق الزخرفي */}
            <text
              x="353"
              y="156"
              textAnchor="middle"
              direction="rtl"
              style={{
                fontFamily: "'Cairo', 'Amiri', 'Tajawal', sans-serif",
                fontSize: `${approxFontPx}px`,
                fontWeight: 900,
                fill: "none",
                stroke: "#94A3B8",
                strokeWidth: 1.4,
                opacity: 0.55,
              }}
            >
              {displayName}
            </text>

            {/* النص الزخرفي الرئيسي بالعرض */}
            <text
              x="350"
              y="152"
              textAnchor="middle"
              direction="rtl"
              style={{
                fontFamily: "'Cairo', 'Amiri', 'Tajawal', sans-serif",
                fontSize: `${approxFontPx}px`,
                fontWeight: 900,
                fill: inkPrimary,
                stroke: inkPrimary,
                strokeWidth: 1.1,
                paintOrder: "stroke fill",
              }}
            >
              {displayName}
            </text>

            {/* قوس الكشيدة السفلية الانسيابية */}
            <path
              d="M 102 194 Q 350 242 598 194"
              fill="none"
              stroke={inkPrimary}
              strokeWidth="3.2"
              strokeLinecap="round"
              opacity="0.78"
            />
            <path
              d="M 155 212 Q 350 250 545 212"
              fill="none"
              stroke={inkAccent}
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity="0.65"
            />
            <polygon
              points="350,218 358,226 350,234 342,226"
              fill={inkPrimary}
              opacity="0.82"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
