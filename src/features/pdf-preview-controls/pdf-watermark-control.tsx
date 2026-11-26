"use client";

/**
 * @file pdf-watermark-control.tsx
 * @description خاصية ذرية مستقلة: التحكم في العلامة المائية الزخرفية (التفعيل، الترتيب أمام/خلف الكلام،
 * مزاليج الشفافية والحجم والميلان، اختيار الخط الزخرفي الاحترافي، أو رفع صورة مخصصة).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 195 سطراً).
 */

import React, { useRef, useState } from "react";
import type {
  PDFPrintSettingsStateSSOT,
  WatermarkCalligraphyFontId,
  WatermarkPlacementMode,
} from "@/core/ssot/pdf-print-settings-ssot";
import { PDFWatermarkSlidersGroup } from "./pdf-watermark-sliders-group";

export const MODULE_ID_PDF_WATERMARK_CONTROL = "pdf_watermark_control" as const;

export interface PDFWatermarkControlProps {
  readonly settings: PDFPrintSettingsStateSSOT;
  readonly onChange: (patch: Partial<PDFPrintSettingsStateSSOT>) => void;
}

const PLACEMENT_OPTIONS: readonly { readonly id: WatermarkPlacementMode; readonly label: string }[] = [
  { id: "auto", label: "✨ تلقائي ذكي" },
  { id: "front", label: "🔝 أمام الكلام والبطاقات" },
  { id: "behind", label: "📄 خلف الكلام" },
];

const CALLIGRAPHY_FONTS: readonly { readonly id: WatermarkCalligraphyFontId; readonly label: string }[] = [
  { id: "aref_ruqaa", label: "خط الرقعة السلطاني" },
  { id: "amiri", label: "خط الثلث الأميري" },
  { id: "reem_kufi", label: "الكوفي المزخرف" },
];

export default function PDFWatermarkControl({
  settings,
  onChange,
}: PDFWatermarkControlProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const isEnabled = settings.watermarkEnabled ?? true;
  const opacityPct = settings.watermarkOpacityPct ?? 16;
  const mode = settings.watermarkMode ?? "decorative_svg";
  const placement = settings.watermarkPlacement ?? "auto";
  const calligraphyFont = settings.watermarkCalligraphyFont ?? "aref_ruqaa";
  const showOrnament = settings.watermarkShowFrameOrnament !== false;

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
          onChange({
            watermarkEnabled: true,
            watermarkMode: "custom_image",
            watermarkImageDataUrl: canvas.toDataURL("image/png"),
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
      {/* ١. التفعيل + موضع الطبقة (أمام الكلام / خلف الكلام) */}
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
          <span>{isEnabled ? "مفعّلة في كل الصفحات" : "متوقفة"}</span>
        </button>

        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5 font-bold">
          {PLACEMENT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ watermarkPlacement: opt.id })}
              className={`px-2 py-1 rounded-lg cursor-pointer transition-all ${
                placement === opt.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ٢. مزاليج الشفافية (0-100%) والحجم (40-180%) والميلان (-60° إلى +60°) */}
      <PDFWatermarkSlidersGroup settings={settings} onChange={onChange} />

      {/* ٣. نمط المخطوطة الاحترافية أو الصورة الخاصة */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5 font-bold">
            <button
              type="button"
              onClick={() => onChange({ watermarkMode: "decorative_svg" })}
              className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                mode === "decorative_svg" ? "bg-sky-700 text-white" : "text-slate-600 dark:text-slate-400"
              }`}
            >
              ✒️ مخطوطة عربية احترافية
            </button>
            <button
              type="button"
              onClick={() => onChange({ watermarkMode: "custom_image" })}
              className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                mode === "custom_image" ? "bg-sky-700 text-white" : "text-slate-600 dark:text-slate-400"
              }`}
            >
              🖼️ صورة زخرفية خاصة
            </button>
          </div>

          {mode === "decorative_svg" && (
            <label className="inline-flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showOrnament}
                onChange={(e) => onChange({ watermarkShowFrameOrnament: e.target.checked })}
                className="w-4 h-4 accent-sky-700"
              />
              <span>حليات وأقواس زخرفية</span>
            </label>
          )}
        </div>

        {mode === "decorative_svg" ? (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-1">
              {CALLIGRAPHY_FONTS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onChange({ watermarkCalligraphyFont: f.id })}
                  className={`px-2.5 py-1 rounded-lg border font-black cursor-pointer transition-all ${
                    calligraphyFont === f.id
                      ? "bg-sky-700 text-white border-sky-700"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={settings.watermarkText ?? "أ/ إسلام محمد"}
              onChange={(e) => onChange({ watermarkText: e.target.value })}
              placeholder="اكتب الاسم الزخرفي هنا (مثال: أ/ إسلام محمد)"
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-black text-slate-900 dark:text-white"
            />
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
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
                onClick={() => onChange({ watermarkImageDataUrl: "", watermarkMode: "decorative_svg" })}
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
