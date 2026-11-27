"use client";

/**
 * @file pdf-decorative-watermark-layer.tsx
 * @description طبقة العلامة المائية الزخرفية في كل صفحة A4 PDF:
 * تدعم التراكب أمام الكلام في القوالب الأخرى (`z-index: 30` مع `mixBlendMode: "multiply"`) أو الخلفية،
 * والتحكم بالشفافية (0%–100%)، والحجم (40%–180%)، ودرجة الميلان الحرة (-60° إلى +60°).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 115 سطراً).
 */

import React from "react";
import type { PDFPrintSettingsStateSSOT } from "../ssot/pdf-print-settings-ssot";
import type { PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";
import { PdfWatermarkOrnamentalSvg } from "./pdf-watermark-ornamental-svg";

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
  const clampedPct = Math.max(0, Math.min(100, settings.watermarkOpacityPct ?? 16));
  if (clampedPct <= 0) return null;

  const opacity = clampedPct / 100;
  const scale = Math.max(40, Math.min(180, settings.watermarkScalePct ?? 100)) / 100;
  const rotationDeg = Math.max(-60, Math.min(60, settings.watermarkRotationDeg ?? 0));

  const rawPlacement = settings.watermarkPlacement ?? "auto";
  const isFrontOverlay = rawPlacement !== "behind";

  const isCustomImg =
    settings.watermarkMode === "custom_image" &&
    Boolean(settings.watermarkImageDataUrl?.trim());
  const displayName =
    settings.watermarkText?.trim() || teacherFallbackName.trim() || "أ/ إسلام محمد";

  const inkPrimary = settings.colorThemeId === "photocopy_black" ? "#475569" : "#64748B";
  const inkAccent = settings.colorThemeId === "photocopy_black" ? "#334155" : palette.borderHex;

  return (
    <div
      aria-hidden="true"
      data-pdf-watermark="true"
      data-watermark-front={isFrontOverlay ? "true" : "false"}
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
        zIndex: isFrontOverlay ? 50 : 1,
        opacity,
        mixBlendMode: isFrontOverlay ? "multiply" : undefined,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          transform: `scale(${scale}) rotate(${rotationDeg}deg)`,
          transformOrigin: "center center",
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
          <PdfWatermarkOrnamentalSvg
            displayName={displayName}
            fontId={settings.watermarkCalligraphyFont ?? "aref_ruqaa"}
            showFrameOrnament={settings.watermarkShowFrameOrnament !== false}
            inkPrimary={inkPrimary}
            inkAccent={inkAccent}
          />
        )}
      </div>
    </div>
  );
}
