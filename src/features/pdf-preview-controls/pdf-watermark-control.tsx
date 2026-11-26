"use client";

/**
 * @file pdf-watermark-control.tsx
 * @description خاصية ذرية مستقلة: التحكم الكامل في العلامة المائية الزخرفية الخلفية لجميع صفحات الـ PDF
 * (تفعيل/إيقاف، الاسم بالعرض، رفع صورة زخرفية خاصة PNG/SVG/WebP مع الحفاظ على الشفافية، ومزلاج شفافية خطي 0%–100%).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 210 سطراً).
 */

import React, { useRef, useState } from "react";
import type { PDFPrintSettingsStateSSOT } from "@/core/ssot/pdf-print-settings-ssot";

export const MODULE_ID_PDF_WATERMARK_CONTROL = "pdf_watermark_control" as const;

export interface PDFWatermarkControlProps {
  readonly settings: PDFPrintSettingsStateSSOT;
  readonly onChange: (patch: Partial<PDFPrintSettingsStateSSOT>) => void;
}

const OPACITY_PRESETS = [0, 10, 16, 25, 40, 70, 100] as const;

export default function PDFWatermarkControl({
  settings,
  onChange,
}: PDFWatermarkControlProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const isEnabled = settings.watermarkEnabled ?? true;
  const opacityPct = settings.watermarkOpacityPct ?? 16;
  const mode = settings.watermarkMode ?? "decorative_svg";
  const rotationDeg = settings.watermarkRotationDeg ?? 0;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!rawDataUrl) return;
      const img = new Image();
      img.onload = () => {
        const maxW = 900;
        const scale = img.width > maxW ? maxW / img.width : 1;
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          const pngDataUrl = canvas.toDataURL("image/png");
          onChange({
            watermarkEnabled: true,
            watermarkMode: "custom_image",
            watermarkImageDataUrl: pngDataUrl,
            watermarkOpacityPct: opacityPct === 0 ? 18 : opacityPct,
          });
        }
      };
      img.onerror = () => setUploadError("تعذر قراءة الصورة المختارة، جرّب ملف PNG أو SVG.");
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs">
      {/* الصف الأول: التفعيل + الاتجاه */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onChange({ watermarkEnabled: !isEnabled })}
          className={`min-h-[38px] px-3 py-1.5 rounded-xl font-black cursor-pointer transition-all flex items-center gap-1.5 ${
            isEnabled
              ? "bg-sky-700 text-white shadow-xs"
              : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
          }`}
        >
          <span>{isEnabled ? "✅" : "⭕"}</span>
          <span>{isEnabled ? "العلامة المائية مفعّلة في كل الصفحات" : "العلامة المائية متوقفة"}</span>
        </button>

        <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5 font-bold">
          <button
            type="button"
            onClick={() => onChange({ watermarkRotationDeg: 0 })}
            className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
              rotationDeg === 0
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            ↔️ أفقي بالعرض (0°)
          </button>
          <button
            type="button"
            onClick={() => onChange({ watermarkRotationDeg: -18 })}
            className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
              rotationDeg !== 0
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            📐 مائل (-18°)
          </button>
        </div>
      </div>

      {/* الصف الثاني: مزلاج الشفافية الخطي من 0% إلى 100% */}
      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="font-black text-slate-700 dark:text-slate-200">
            درجة وضوح وظهور العلامة المائية (الشفافية)
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-900 dark:text-sky-200 font-mono font-black">
            {opacityPct}%
          </span>
        </div>
        <div className="flex items-center gap-2" dir="ltr">
          <span className="text-[10px] font-mono font-bold text-slate-500">0%</span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={opacityPct}
            aria-label="شفافية العلامة المائية من 0 إلى 100 بالمئة"
            onChange={(e) => {
              const val = Math.max(0, Math.min(100, Number(e.target.value)));
              onChange({
                watermarkOpacityPct: val,
                watermarkEnabled: val > 0 ? true : isEnabled,
              });
            }}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-600"
          />
          <span className="text-[10px] font-mono font-bold text-slate-500">100%</span>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {OPACITY_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() =>
                onChange({
                  watermarkOpacityPct: preset,
                  watermarkEnabled: preset > 0,
                })
              }
              className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-black cursor-pointer transition-all ${
                opacityPct === preset
                  ? "bg-sky-700 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {preset}%
            </button>
          ))}
        </div>
      </div>

      {/* الصف الثالث: نوع العلامة المائية (اسم زخرفي أو صورة مرفوعة) */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5 font-bold">
          <button
            type="button"
            onClick={() => onChange({ watermarkMode: "decorative_svg" })}
            className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
              mode === "decorative_svg"
                ? "bg-sky-700 text-white"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            ✒️ مخطوطة زخرفية بالاسم
          </button>
          <button
            type="button"
            onClick={() => onChange({ watermarkMode: "custom_image" })}
            className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
              mode === "custom_image"
                ? "bg-sky-700 text-white"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            🖼️ صورة اسم زخرفية خاصة
          </button>
        </div>

        {mode === "decorative_svg" ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={settings.watermarkText ?? "أ/ إسلام محمد"}
              onChange={(e) => onChange({ watermarkText: e.target.value })}
              placeholder="اكتب الاسم الزخرفي هنا (مثال: أ/ إسلام محمد)"
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-black text-slate-900 dark:text-white"
            />
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[38px] px-3 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-black cursor-pointer"
            >
              📤 {settings.watermarkImageDataUrl ? "تغيير صورة الاسم الزخرفية" : "رفع صورة الاسم الزخرفية (PNG / SVG / WebP)"}
            </button>
            {settings.watermarkImageDataUrl && (
              <button
                type="button"
                onClick={() =>
                  onChange({
                    watermarkImageDataUrl: "",
                    watermarkMode: "decorative_svg",
                  })
                }
                className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-black cursor-pointer"
              >
                🗑️ إزالة الصورة
              </button>
            )}
            {uploadError && <span className="text-rose-600 font-bold">{uploadError}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
