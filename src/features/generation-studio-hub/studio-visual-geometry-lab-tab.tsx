"use client";

/**
 * @file studio-visual-geometry-lab-tab.tsx
 * @description معمل الأشكال الهندسية التفاعلي المربوط بسجلات النظام وحلقة التحسين والمراجعة (المرحلة 7):
 * - الرموز اللاتينية (A B C D) هي الافتراضية القياسية.
 * - يقرأ فورياً من نص أي مسألة أو وصف ويكتشف ويرسم الشكل الهندسي المسجل بالنظام بدقة متناهية.
 * - مزود بمحرر قائمة الحقائق للأصفر (7.1)، وتوجيه تربوي بالصياغة المحسنة للأحمر (7.2)، وحفظ الحالة الذهبية (7.3)، ولوحة مراقبة الجودة (7.4).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 220 سطراً).
 */

import { useState } from "react";
import { matchGeometryWithDiagnostics } from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "@/core/geometry-engine/vector-svg-figure-projector";
import type { MathNotationLanguage } from "@/core/ssot/numeral-and-unit-ssot";
import { CURRICULUM_QUICK_SAMPLES } from "./studio-geometry-lab-quick-samples-data";
import StudioGeometryUnderstoodFactsEditor from "./studio-geometry-understood-facts-editor";
import StudioGeometryRedAdviceCard from "./studio-geometry-red-advice-card";
import StudioGeometryGoldenCaseExporter from "./studio-geometry-golden-case-exporter";
import StudioGeometryQualityDashboardCard from "./studio-geometry-quality-dashboard-card";

export const MODULE_ID_STUDIO_VISUAL_GEOMETRY_LAB_TAB =
  "studio_visual_geometry_lab_tab" as const;

export default function StudioVisualGeometryLabTab() {
  const [desc, setDesc] = useState<string>(CURRICULUM_QUICK_SAMPLES[0].sampleText);
  const [notation, setNotation] = useState<MathNotationLanguage>("english");
  const [copied, setCopied] = useState(false);

  const diag = matchGeometryWithDiagnostics(desc, "lab_geom_live", notation);
  const matchedFigure = diag.figure;
  const svgMarkup = matchedFigure
    ? projectGeometryFigureToSVGMarkup(matchedFigure, {
        widthPx: 380,
        heightPx: 220,
        strokeColorHex: "#1E1B4B",
        accentColorHex: "#0D9488",
        numeralMode: notation === "arabic" ? "eastern" : "western",
        notationLanguage: notation,
      })
    : "";

  const readyTag = `[رسم هندسي: ${desc.trim()}]`;

  return (
    <div className="space-y-3.5">
      {/* لوحة مراقبة الجودة العامة ونسب التغطية (7.4) */}
      <StudioGeometryQualityDashboardCard />

      {/* شريط حالة الشكل والمعاينة البصرية */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">
          المعاينة الهندسية اللحظية من النظام (SVG Vector حتمي)
        </span>
        <span className="text-[10.5pt] font-black text-indigo-700 dark:text-indigo-400">
          {!matchedFigure
            ? "🔴 لم يُتعرَّف على الشكل"
            : diag.warnings.length
            ? "🟡 شكل بحاجة إلى مراجعة وتدقيق"
            : "🟢 شكل مطابق ومُتحقَّق منه 100%"}
        </span>
      </div>

      <div
        className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-xs [&_svg]:max-w-full [&_svg]:h-auto min-h-[220px]"
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />

      {/* محرر الحقائق التفاعلي للأصفر (المهمة 7.1) */}
      <StudioGeometryUnderstoodFactsEditor
        description={desc}
        onChangeDescription={(nextDesc) => setDesc(nextDesc)}
      />

      {/* التوجيه التربوي الذكي عند الرفض أو وجود تحذيرات (المهمة 7.2) */}
      {diag.warnings.length > 0 && (
        <StudioGeometryRedAdviceCard rawPrompt={desc} reasons={diag.warnings} />
      )}

      {/* حفظ الحالة وتصديرها كحالة مرجعية ذهبية (المهمة 7.3) */}
      {matchedFigure && (
        <StudioGeometryGoldenCaseExporter
          problemText={desc}
          description={desc}
          gradeId="prep-1"
          branchId="plane_geometry"
        />
      )}

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
