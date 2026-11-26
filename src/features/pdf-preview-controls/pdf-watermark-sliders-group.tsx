"use client";

/**
 * @file pdf-watermark-sliders-group.tsx
 * @description مجموعة المزاليج الخطية الثلاثة للعلامة المائية:
 * 1. الشفافية (0% ← 100%) | 2. الحجم والتكبير/التصغير (40% ← 180%) | 3. درجة الميلان (-60° ← +60°).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 145 سطراً).
 */

import React from "react";
import type { PDFPrintSettingsStateSSOT } from "@/core/ssot/pdf-print-settings-ssot";

export const MODULE_ID_PDF_WATERMARK_SLIDERS_GROUP =
  "pdf_watermark_sliders_group" as const;

const OPACITY_PRESETS = [0, 12, 18, 30, 50, 100] as const;
const SCALE_PRESETS = [60, 80, 100, 125, 150] as const;
const ROTATION_PRESETS = [-45, -25, -18, 0, 18, 35] as const;

export function PDFWatermarkSlidersGroup({
  settings,
  onChange,
}: {
  readonly settings: PDFPrintSettingsStateSSOT;
  readonly onChange: (patch: Partial<PDFPrintSettingsStateSSOT>) => void;
}) {
  const isEnabled = settings.watermarkEnabled ?? true;
  const opacityPct = settings.watermarkOpacityPct ?? 16;
  const scalePct = settings.watermarkScalePct ?? 100;
  const rotationDeg = settings.watermarkRotationDeg ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      {/* ١. مزلاج الشفافية (0% - 100%) */}
      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-black text-slate-700 dark:text-slate-200">الشفافية (الوضوح)</span>
          <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-900 dark:text-sky-200 font-mono font-black">
            {opacityPct}%
          </span>
        </div>
        <div className="flex items-center gap-1.5" dir="ltr">
          <span className="text-[10px] font-mono text-slate-500">0%</span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={opacityPct}
            aria-label="شفافية العلامة المائية"
            onChange={(e) => {
              const val = Math.max(0, Math.min(100, Number(e.target.value)));
              onChange({ watermarkOpacityPct: val, watermarkEnabled: val > 0 ? true : isEnabled });
            }}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-600"
          />
          <span className="text-[10px] font-mono text-slate-500">100%</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {OPACITY_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChange({ watermarkOpacityPct: p, watermarkEnabled: p > 0 })}
              className={`px-1.5 py-0.5 rounded text-[10.5px] font-mono font-black cursor-pointer ${
                opacityPct === p ? "bg-sky-700 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {p}%
            </button>
          ))}
        </div>
      </div>

      {/* ٢. مزلاج الحجم والتكبير/التصغير (40% - 180%) */}
      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-black text-slate-700 dark:text-slate-200">الحجم (تكبير/تصغير)</span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200 font-mono font-black">
            {scalePct}%
          </span>
        </div>
        <div className="flex items-center gap-1.5" dir="ltr">
          <span className="text-[10px] font-mono text-slate-500">40%</span>
          <input
            type="range"
            min={40}
            max={180}
            step={5}
            value={scalePct}
            aria-label="حجم العلامة المائية"
            onChange={(e) => onChange({ watermarkScalePct: Math.max(40, Math.min(180, Number(e.target.value))) })}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <span className="text-[10px] font-mono text-slate-500">180%</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {SCALE_PRESETS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange({ watermarkScalePct: s })}
              className={`px-1.5 py-0.5 rounded text-[10.5px] font-mono font-black cursor-pointer ${
                scalePct === s ? "bg-indigo-700 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {s}%
            </button>
          ))}
        </div>
      </div>

      {/* ٣. مزلاج درجة الميلان الحر (-60° إلى +60°) */}
      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-black text-slate-700 dark:text-slate-200">زاوية الميلان</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200 font-mono font-black" dir="ltr">
            {rotationDeg}°
          </span>
        </div>
        <div className="flex items-center gap-1.5" dir="ltr">
          <span className="text-[10px] font-mono text-slate-500">-60°</span>
          <input
            type="range"
            min={-60}
            max={60}
            step={1}
            value={rotationDeg}
            aria-label="درجة ميلان العلامة المائية"
            onChange={(e) => onChange({ watermarkRotationDeg: Math.max(-60, Math.min(60, Number(e.target.value))) })}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <span className="text-[10px] font-mono text-slate-500">+60°</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {ROTATION_PRESETS.map((deg) => (
            <button
              key={deg}
              type="button"
              onClick={() => onChange({ watermarkRotationDeg: deg })}
              className={`px-1.5 py-0.5 rounded text-[10.5px] font-mono font-black cursor-pointer ${
                rotationDeg === deg ? "bg-emerald-700 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {deg === 0 ? "0° عرض" : `${deg}°`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
