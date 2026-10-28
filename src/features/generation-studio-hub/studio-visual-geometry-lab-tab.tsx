"use client";

/**
 * @file studio-visual-geometry-lab-tab.tsx
 * @description معمل الأشكال الهندسية التفاعلي المربوط بسجلات النظام:
 * - الرموز اللاتينية (A B C D) هي الافتراضية القياسية.
 * - يقرأ فورياً من نص أي مسألة أو وصف ويكتشف ويرسم الشكل الهندسي المسجل بالنظام بدقة متناهية.
 * - أزيلت الخيارات التجريبية القديمة، وزُوّد بنماذج استدلالية لمناهج الابتدائي والإعدادي للمعاينة السريعة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 190 سطراً).
 */

import { useState } from "react";
import {
  matchArabicDescriptionToCanonicalGeometryFigure,
  matchOptionalGeometryFigureFromArabicDescription,
} from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "@/core/geometry-engine/vector-svg-figure-projector";
import type { MathNotationLanguage } from "@/core/ssot/numeral-and-unit-ssot";

export const MODULE_ID_STUDIO_VISUAL_GEOMETRY_LAB_TAB =
  "studio_visual_geometry_lab_tab" as const;

const CURRICULUM_QUICK_SAMPLES = [
  {
    id: "tri_sim_butterfly",
    label: "تشابه مثلثات: فراشة ومقص ΔABC ~ ΔADE",
    sampleText: "تشابه مثلثين متقابلين بالرأس عند A شكل مقص ΔABC ~ ΔADE وأطوال 10 سم و 12 سم و 8 سم و 18 سم",
  },
  {
    id: "tri_sim_nested_common",
    label: "تشابه مثلثات: زاوية مشتركة B (مثال 7)",
    sampleText: "تشابه مثلثين بزاوية مشتركة B وقاطع داخلي ΔABC ~ ΔDBA وقاعدة B-D-C وأطوال BD = 9 سم و DC = 27 سم و AB = 18 سم و AD = 12 سم",
  },
  {
    id: "tri_sim_thales_xy",
    label: "تشابه مثلثات: توازي طاليس XY || BC",
    sampleText: "تشابه مثلثين بتوازي طاليس XY || BC و ΔAXY ~ ΔABC وأطوال XY = 5 سم و BC = 10 سم",
  },
  {
    id: "tri_sim_euclid_alt",
    label: "تشابه مثلثات: إقليدس والقائم ΔADB ~ ΔBDC",
    sampleText: "تشابه المثلثات القائمة بإسقاط عمود BD ⊥ AC من رأس القائمة ونظرية إقليدس ΔADB ~ ΔBDC أطوال BD = 4.8 سم و AD = 6.4 سم",
  },
  {
    id: "tri_sim_antiparallel",
    label: "تشابه مثلثات: قاطع عكسي ΔABC ~ ΔADH",
    sampleText: "تشابه مثلثين بقاطع عكسي غير موازي ΔABC ~ ΔADH حيث زاوية C تطابق زاوية ADH وأطوال AD = 7 سم و AH = 6 سم و HB = 8 سم",
  },
  {
    id: "tri_sim_separate_120",
    label: "تشابه مثلثات: منفصلان بزاوية 120° (مثال 6)",
    sampleText: "تشابه مثلثين منفصلين بزاوية 120° ΔABC ~ ΔDEF أطوال الأول 7.5 سم و 4.5 سم و 10.5 سم والثاني 5 سم و 3 سم",
  },
  {
    id: "sim_quad_radicals",
    label: "تشابه مضلعات: جذور وزوايا (مثال 2)",
    sampleText: "مضلعان رباعيان متشابهان ABCD ~ EFGH ، أطوال الأول AB = 6.5 سم و BC = 8 سم و CD = 5 سم و DA = 1.5√3 سم وزاوية A قائمة وزاوية C = 60° وزاوية B = x° ، والثاني EF = (y - 1/3) سم و FG = z سم و HE = √3 سم وزاوية E قائمة وزاوية H = 150°",
  },
  {
    id: "sim_trapezoid_vars",
    label: "تشابه مضلعات: شبه منحرف بمجاهيل X و Y",
    sampleText: "شبه منحرف قائم الزاوية متشابه بمجاهيل جبرية أطوال قاعدتيه X - 3 و Y + 1 وارتفاع 12 سم وقاعدة 16 سم وارتفاع 8 سم",
  },
  {
    id: "sim_house_pentagon",
    label: "تشابه مضلعات: خماسيان شكل منزل",
    sampleText: "مضلعان خماسيان متشابهان ABCDE ~ KFGHJ على شكل منزل قاعدة الأول 6 سم وقواعد الثاني 18 سم و 15 سم و 12 سم و 9 سم",
  },
] as const;

export default function StudioVisualGeometryLabTab() {
  const [desc, setDesc] = useState<string>(CURRICULUM_QUICK_SAMPLES[0].sampleText);
  // الرموز اللاتينية الافتراضية وفق توجيه المعلم
  const [notation, setNotation] = useState<MathNotationLanguage>("english");
  const [copied, setCopied] = useState(false);

  const matchedFigure = matchOptionalGeometryFigureFromArabicDescription(desc, "lab_geom_live", notation);
  const figureToRender = matchedFigure ?? matchArabicDescriptionToCanonicalGeometryFigure(desc, "lab_geom_fallback", notation);

  const svgMarkup = projectGeometryFigureToSVGMarkup(figureToRender, {
    widthPx: 380,
    heightPx: 220,
    strokeColorHex: "#1E1B4B",
    accentColorHex: "#0D9488",
    numeralMode: notation === "arabic" ? "eastern" : "western",
  });

  const readyTag = `[رسم هندسي: ${desc.trim()}]`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">
          المعاينة الهندسية اللحظية من النظام (SVG Vector حتمي)
        </span>
        <span className="text-[10.5pt] font-black text-indigo-700 dark:text-indigo-400">
          {matchedFigure ? "✓ شكل مطابق مسجل بالنظام" : "ℹ شكل افتراضي تقريبي"}
        </span>
      </div>

      <div
        className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-xs [&_svg]:max-w-full [&_svg]:h-auto min-h-[220px]"
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />

      {/* شريط نماذج سريعة من المنهج المدرسي للاختبار */}
      <div className="space-y-1">
        <div className="text-[10px] font-extrabold text-slate-500">
          نماذج فحص سريعة من المنهج (ابتدائي وإعدادي):
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap pb-1">
          {CURRICULUM_QUICK_SAMPLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setDesc(s.sampleText)}
              className={`shrink-0 min-h-[38px] px-3 rounded-xl text-xs font-black cursor-pointer transition-colors ${
                desc === s.sampleText
                  ? "bg-indigo-900 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* حقل إدخال نص السؤال واختيار لغة الرموز */}
      <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-3.5 space-y-2.5">
        <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300">
          اكتب أو الصق نص السؤال / وصف الشكل للتعرف عليه فوراً:
        </label>
        <textarea
          rows={3}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="مثال: مضلعان رباعيان متشابهان ABCD و PQRS..."
          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
        />

        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900">
          {(
            [
              { id: "english", label: "رموز لاتينية قياسية (A B C) [الافتراضي]" },
              { id: "arabic", label: "رموز عربية (أ ب جـ)" },
            ] as const
          ).map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setNotation(o.id)}
              className={`min-h-[40px] rounded-lg text-xs font-black cursor-pointer transition-colors ${
                notation === o.id
                  ? "bg-white dark:bg-slate-800 text-indigo-900 dark:text-teal-300 shadow-xs"
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
          className="w-full min-h-[44px] rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-colors"
        >
          {copied ? "✓ تم نسخ الوسم إلى الحافظة بنجاح" : "📋 نسخ وسم الرسم الهندسي الجاهز"}
        </button>

        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-[10.5px] font-mono text-indigo-900 dark:text-indigo-200 break-all select-all">
          {readyTag}
        </div>
      </div>
    </div>
  );
}
