"use client";

/**
 * @file studio-golden-corpus-quick-reviewer.tsx
 * @description واجهة المراجعة البشرية السريعة (✓/✗) لحالات المجموعة الذهبية لتثبيت رقم الدقة الحقيقي (المهمة 0.4):
 * - مصممة أولاً للهاتف المحمول (360px - 430px) بأزرار لمس إبهامية مريحة (min-height >= 48px).
 * - تدعم اختصارات لوحة المفاتيح للمراجعة الفائقة السرعة (50 شكلاً في أقل من 10 دقائق).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 295 سطراً).
 */

import { useState, useMemo, useEffect, useCallback } from "react";
import type { GoldenCorpusCase, GoldenHumanVerdict } from "@/core/geometry-engine/baseline-measurement/golden-corpus-case-types-ssot";
import { matchGeometryWithDiagnostics } from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { combineProblemAndTagGeometryContext } from "@/core/geometry-engine/description-intake/problem-geometry-context-extractor";
import { projectGeometryFigureToSVGMarkup } from "@/core/geometry-engine/vector-svg-figure-projector";

export const MODULE_ID_STUDIO_GOLDEN_CORPUS_QUICK_REVIEWER =
  "studio_golden_corpus_quick_reviewer" as const;

export interface StudioGoldenCorpusQuickReviewerProps {
  readonly initialCases?: readonly GoldenCorpusCase[];
  readonly onSaveReviewedCorpus?: (reviewedCases: GoldenCorpusCase[]) => void;
}

export default function StudioGoldenCorpusQuickReviewer({
  initialCases = [],
  onSaveReviewedCorpus,
}: StudioGoldenCorpusQuickReviewerProps) {
  const [cases, setCases] = useState<GoldenCorpusCase[]>(() => [...initialCases]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentCase = cases[currentIndex] as GoldenCorpusCase | undefined;

  // توليد الشكل والتشخيص للحالة الحالية
  const figureInfo = useMemo(() => {
    if (!currentCase) return null;
    const combined = combineProblemAndTagGeometryContext(
      currentCase.geometryRaw || undefined,
      currentCase.problemText
    );
    const diag = matchGeometryWithDiagnostics(combined, `rev_${currentCase.id}`, "arabic");
    const svg = diag.figure
      ? projectGeometryFigureToSVGMarkup(diag.figure, {
          widthPx: 320,
          heightPx: 220,
          strokeColorHex: "#0F172A",
          accentColorHex: "#0284C7",
          numeralMode: "eastern",
          notationLanguage: "arabic",
        })
      : null;

    return { diag, svg };
  }, [currentCase]);

  // إحصائيات المراجعة
  const stats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let unreviewed = 0;
    for (const c of cases) {
      if (c.humanVerdict === "correct") correct++;
      else if (c.humanVerdict === "wrong") wrong++;
      else unreviewed++;
    }
    const reviewed = correct + wrong;
    const accuracy = reviewed > 0 ? Number(((correct / reviewed) * 100).toFixed(1)) : 0;
    return { correct, wrong, unreviewed, reviewed, accuracy, total: cases.length };
  }, [cases]);

  const handleApplyVerdict = useCallback(
    (verdict: GoldenHumanVerdict) => {
      if (!currentCase) return;
      setCases((prev) => {
        const next = [...prev];
        next[currentIndex] = { ...currentCase, humanVerdict: verdict };
        return next;
      });

      if (currentIndex < cases.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
    },
    [currentCase, currentIndex, cases.length]
  );

  // اختصارات لوحة المفاتيح للمراجعة الخاطفة على الكمبيوتر
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "1" || e.key === "y" || e.key === "Enter") {
        e.preventDefault();
        handleApplyVerdict("correct");
      } else if (e.key === "2" || e.key === "n" || e.key === "Backspace") {
        e.preventDefault();
        handleApplyVerdict("wrong");
      } else if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        if (currentIndex < cases.length - 1) setCurrentIndex((i) => i + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (currentIndex > 0) setCurrentIndex((i) => i - 1);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleApplyVerdict, currentIndex, cases.length]);

  if (!currentCase) {
    return (
      <div className="p-6 text-center text-slate-500 font-bold bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        لا توجد حالات مراجعة محملة حالياً.
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto space-y-4 p-3 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-800 dark:text-slate-100">
      {/* شريط التقدم والإحصائيات */}
      <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
        <span className="text-slate-500">
          حالة {currentIndex + 1} من {stats.total} ({currentCase.gradeId})
        </span>
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
            معتمد: {stats.correct}
          </span>
          <span className="text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
            خاطئ: {stats.wrong}
          </span>
          <span className="text-sky-600 font-extrabold bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded-full">
            دقة: {stats.accuracy}%
          </span>
        </div>
      </div>

      {/* مسألة ورسم الحالة */}
      <div className="space-y-2">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-medium leading-relaxed">
          <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">
            {currentCase.problemText}
          </p>
          {currentCase.geometryRaw && (
            <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px] dir-rtl">
              [وسم]: {currentCase.geometryRaw}
            </p>
          )}
        </div>

        {/* عرض الشكل الهندسي */}
        <div className="w-full min-h-[220px] bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center p-2 overflow-hidden">
          {figureInfo?.svg ? (
            <div
              className="max-w-full flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: figureInfo.svg }}
            />
          ) : (
            <div className="text-center p-4 text-xs font-bold text-slate-400">
              {currentCase.expectedOutcome === "no_figure"
                ? "🟢 مسألة لفظية / نظرية (لا تستحق شكلاً هندسياً)"
                : "🔴 تعذر توليد شكل هندسي مطابق لهذه المسألة"}
            </div>
          )}
        </div>

        {/* قرار المحرك الآلي والحكم البشري الحالي */}
        <div className="flex items-center justify-between text-[11px] font-bold px-1">
          <span className="text-slate-500">
            قرار المحرك:{" "}
            <span
              className={
                figureInfo?.diag.decision === "green"
                  ? "text-emerald-600 font-extrabold"
                  : figureInfo?.diag.decision === "yellow"
                  ? "text-amber-600 font-extrabold"
                  : "text-rose-600 font-extrabold"
              }
            >
              {figureInfo?.diag.decision?.toUpperCase() ?? "NONE"}
            </span>
          </span>
          <span className="text-slate-500">
            حكمك الحالي:{" "}
            <span className="text-slate-900 dark:text-slate-100 underline">
              {currentCase.humanVerdict === "correct"
                ? "معتمد ✓"
                : currentCase.humanVerdict === "wrong"
                ? "خاطئ ✗"
                : "قيد المراجعة"}
            </span>
          </span>
        </div>
      </div>

      {/* لوحة التحكم اللمسية السريعة (Thumb-Friendly >= 48px) */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => handleApplyVerdict("correct")}
          className="min-h-[48px] px-4 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-sm shadow-sm transition flex items-center justify-center gap-1.5"
        >
          <span>✓</span>
          <span>شكل ممتاز ومعتمد</span>
        </button>

        <button
          type="button"
          onClick={() => handleApplyVerdict("wrong")}
          className="min-h-[48px] px-4 py-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold rounded-xl text-sm shadow-sm transition flex items-center justify-center gap-1.5"
        >
          <span>✗</span>
          <span>شكل خاطئ أو غير دقيق</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="min-h-[44px] px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition"
        >
          ◀ السابق
        </button>

        <button
          type="button"
          onClick={() => setCurrentIndex((i) => Math.min(cases.length - 1, i + 1))}
          disabled={currentIndex === cases.length - 1}
          className="min-h-[44px] px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition"
        >
          التالي ▶
        </button>
      </div>

      {/* زر حفظ المراجعة عند الحاجة */}
      {onSaveReviewedCorpus && stats.reviewed > 0 && (
        <button
          type="button"
          onClick={() => onSaveReviewedCorpus(cases)}
          className="min-h-[44px] w-full text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 dark:text-sky-300 dark:bg-sky-950/40 rounded-xl transition py-2"
        >
          حفظ وتثبيت نتائج المراجعة ({stats.reviewed} حالة مراجعة)
        </button>
      )}
    </div>
  );
}
