"use client";

/**
 * @file studio-visual-geometry-lab-tab.tsx
 * @description تبويب معمل بناء وتخصيص الأشكال الهندسية القياسية المنبثقة من العائلات الخمس
 * عبر `natural-arabic-geometry-matcher.ts` مع معاينة SVG متجهية حية وشرح واضح لوظيفته.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 170 سطراً).
 */

import { useState } from "react";
import { matchArabicDescriptionToCanonicalGeometryFigure } from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "@/core/geometry-engine/vector-svg-figure-projector";
import type { MathNotationLanguage } from "@/core/ssot/numeral-and-unit-ssot";

export const MODULE_ID_STUDIO_VISUAL_GEOMETRY_LAB_TAB =
  "studio_visual_geometry_lab_tab" as const;

const CANONICAL_ARCHETYPE_PRESETS = [
  {
    id: "midseg",
    familyBadge: "عائلة المثلث",
    descAr: "مثلث فيه قطعة واصلة بين منتصفي ضلعين توازي الضلع الثالث",
  },
  {
    id: "euclid",
    familyBadge: "عائلة المثلث",
    descAr: "نظرية إقليدس وعمود ساقط من رأس القائمة على الوتر",
  },
  {
    id: "medians",
    familyBadge: "عائلة المثلث",
    descAr: "متوسطات المثلث المتقاطعة في نقطة م",
  },
  {
    id: "circle_tangents",
    familyBadge: "عائلة الدائرة",
    descAr: "مماسان مرسومان من نقطة خارج الدائرة م",
  },
  {
    id: "circle_chord",
    familyBadge: "عائلة الدائرة",
    descAr: "دائرة م فيها المستقيم المار بالمركز ينصف الوتر",
  },
  {
    id: "trapezoid",
    familyBadge: "عائلة الرباعي",
    descAr: "شبه منحرف فيه القاعدتان متوازيتان",
  },
  {
    id: "parabola",
    familyBadge: "الشبكة الديكارتية",
    descAr: "منحنى دالة تربيعية على الشبكة البيانية",
  },
  {
    id: "pyramid3d",
    familyBadge: "الهندسة الفراغية",
    descAr: "هرم رباعي منتظم م أ ب جـ د",
  },
] as const;

export default function StudioVisualGeometryLabTab() {
  const [arabicDesc, setArabicDesc] = useState<string>(
    CANONICAL_ARCHETYPE_PRESETS[0].descAr
  );
  const [notation, setNotation] = useState<MathNotationLanguage>("arabic");
  const [copiedTag, setCopiedTag] = useState<boolean>(false);

  const liveFigure = matchArabicDescriptionToCanonicalGeometryFigure(
    arabicDesc,
    "lab_dynamic_fig",
    notation
  );

  const svgMarkup = projectGeometryFigureToSVGMarkup(liveFigure, {
    widthPx: 340,
    heightPx: 210,
    strokeColorHex: "#1E1B4B",
    accentColorHex: "#0D9488",
    numeralMode: notation === "arabic" ? "eastern" : "western",
  });

  const readyTag = `[رسم هندسي: ${arabicDesc}]`;

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            📐 معمل الأشكال الهندسية الذكي (الرسم بالوصف العربي الطبيعي)
          </h3>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
            مهمة المعمل: اكتب وصف أي شكل هندسي بالعربية ليرسمه المحرك بدقة SVG ويعطيك وسمه الجاهز للوضع داخل أي سؤال أو مذكرة
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setNotation("arabic")}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
              notation === "arabic"
                ? "bg-indigo-900 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600"
            }`}
          >
            رموز عربية (أ ب جـ)
          </button>
          <button
            type="button"
            onClick={() => setNotation("english")}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
              notation === "english"
                ? "bg-indigo-900 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600"
            }`}
          >
            رموز لاتينية (A B C)
          </button>
        </div>
      </div>

      {/* أزرار نماذج الأشكال الشهيرة في المنهج */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {CANONICAL_ARCHETYPE_PRESETS.map((preset) => {
          const isSelected = arabicDesc === preset.descAr;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => setArabicDesc(preset.descAr)}
              className={`shrink-0 min-h-[40px] px-3.5 py-1.5 rounded-xl border text-xs font-black transition cursor-pointer ${
                isSelected
                  ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
              }`}
            >
              {preset.familyBadge}: {preset.descAr.slice(0, 28)}...
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-6 space-y-3">
          <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300">
            اكتب أو عدّل وصف الشكل الهندسي باللغة العربية:
          </label>
          <textarea
            rows={3}
            value={arabicDesc}
            onChange={(e) => setArabicDesc(e.target.value)}
            className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold leading-relaxed"
          />
          <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800 flex items-center justify-between gap-2">
            <code className="text-xs font-black text-indigo-950 dark:text-indigo-200">
              {readyTag}
            </code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(readyTag);
                setCopiedTag(true);
                setTimeout(() => setCopiedTag(false), 2000);
              }}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-indigo-900 text-white text-xs font-black cursor-pointer"
            >
              {copiedTag ? "✓ تم النسخ" : "📋 نسخ الوسم"}
            </button>
          </div>
        </div>

        <div
          className="md:col-span-6 p-4 rounded-3xl bg-white border border-slate-200 flex items-center justify-center shadow-inner"
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
      </div>
    </div>
  );
}
