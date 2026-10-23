"use client";

/**
 * @file studio-visual-geometry-lab-tab.tsx
 * @description معمل الأشكال الهندسية بتصميم هادئ: المعاينة أولاً، ثم نماذج جاهزة بشريط أفقي قصير،
 * ثم حقل الوصف العربي وزر نسخ الوسم الجاهز `[رسم هندسي: ...]`.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 170 سطراً).
 */

import { useState } from "react";
import { matchArabicDescriptionToCanonicalGeometryFigure } from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "@/core/geometry-engine/vector-svg-figure-projector";
import type { MathNotationLanguage } from "@/core/ssot/numeral-and-unit-ssot";

export const MODULE_ID_STUDIO_VISUAL_GEOMETRY_LAB_TAB =
  "studio_visual_geometry_lab_tab" as const;

const PRESETS = [
  { id: "midseg", label: "منتصفا ضلعين", descAr: "مثلث فيه قطعة واصلة بين منتصفي ضلعين توازي الضلع الثالث" },
  { id: "euclid", label: "نظرية إقليدس", descAr: "نظرية إقليدس وعمود ساقط من رأس القائمة على الوتر" },
  { id: "medians", label: "متوسطات المثلث", descAr: "متوسطات المثلث المتقاطعة في نقطة م" },
  { id: "tangents", label: "مماسان", descAr: "مماسان مرسومان من نقطة خارج الدائرة م" },
  { id: "chord", label: "وتر ودائرة", descAr: "دائرة م فيها المستقيم المار بالمركز ينصف الوتر" },
  { id: "trapezoid", label: "شبه منحرف", descAr: "شبه منحرف فيه القاعدتان متوازيتان" },
  { id: "parabola", label: "دالة تربيعية", descAr: "منحنى دالة تربيعية على الشبكة البيانية" },
  { id: "pyramid", label: "هرم منتظم", descAr: "هرم رباعي منتظم م أ ب جـ د" },
] as const;

export default function StudioVisualGeometryLabTab() {
  const [desc, setDesc] = useState<string>(PRESETS[0].descAr);
  const [notation, setNotation] = useState<MathNotationLanguage>("arabic");
  const [copied, setCopied] = useState(false);

  const figure = matchArabicDescriptionToCanonicalGeometryFigure(desc, "lab_dynamic_fig", notation);
  const svg = projectGeometryFigureToSVGMarkup(figure, {
    widthPx: 340,
    heightPx: 210,
    strokeColorHex: "#1E1B4B",
    accentColorHex: "#0D9488",
    numeralMode: notation === "arabic" ? "eastern" : "western",
  });
  const readyTag = `[رسم هندسي: ${desc}]`;

  return (
    <div className="space-y-3">
      <p className="px-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
        اكتب وصف الشكل بالعربية ليرسمه المحرك، ثم انسخ الوسم الجاهز داخل أي سؤال.
      </p>

      <div
        className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden [&_svg]:max-w-full [&_svg]:h-auto"
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap pb-1">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setDesc(p.descAr)}
            className={`shrink-0 min-h-[44px] px-3.5 rounded-xl text-xs font-black cursor-pointer ${
              desc === p.descAr
                ? "bg-teal-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <textarea
          rows={3}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold leading-relaxed"
        />
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900">
          {(
            [
              { id: "arabic", label: "رموز عربية (أ ب جـ)" },
              { id: "english", label: "رموز لاتينية (A B C)" },
            ] as const
          ).map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setNotation(o.id)}
              className={`min-h-[44px] rounded-xl text-xs font-black cursor-pointer ${
                notation === o.id
                  ? "bg-white dark:bg-slate-800 text-indigo-900 dark:text-teal-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(readyTag);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="w-full min-h-[48px] rounded-2xl bg-indigo-900 text-white text-sm font-black cursor-pointer"
        >
          {copied ? "✓ تم نسخ الوسم" : "📋 نسخ الوسم الجاهز"}
        </button>
        <code className="block text-[11px] font-black text-indigo-950 dark:text-indigo-200 break-words">
          {readyTag}
        </code>
      </div>
    </div>
  );
}
