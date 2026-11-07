"use client";

/**
 * @file studio-golden-corpus-quick-reviewer.tsx
 * @description بطاقة المراجعة البشرية السريعة لحالة واحدة (✓/✗ + ملاحظة) لتثبيت رقم الدقة الحقيقي (المهمة 0.4):
 * - جوال أولاً (360px) بأزرار لمس ≥ 48px، واختصارات لوحة مفاتيح للكمبيوتر.
 * - الحالة والحكم يُدار من الحاوية (studio-figure-human-review-tab.tsx) وتُحفظ الأحكام محلياً وتُصدَّر JSON.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 220 سطراً).
 */

import { useState, useMemo, useEffect } from "react";
import type { GoldenCorpusCase, GoldenHumanVerdict } from "@/core/geometry-engine/baseline-measurement/golden-corpus-case-types-ssot";
import { matchGeometryWithDiagnostics } from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { combineProblemAndTagGeometryContext } from "@/core/geometry-engine/description-intake/problem-geometry-context-extractor";
import { projectGeometryFigureToSVGMarkup } from "@/core/geometry-engine/vector-svg-figure-projector";
import type { MathNotationLanguage } from "@/core/ssot/numeral-and-unit-ssot";

export const MODULE_ID_STUDIO_GOLDEN_CORPUS_QUICK_REVIEWER =
  "studio_golden_corpus_quick_reviewer" as const;

export interface StudioGoldenCorpusQuickReviewerProps {
  readonly currentCase: GoldenCorpusCase;
  readonly positionLabel: string;
  readonly notation: MathNotationLanguage;
  readonly onVerdict: (verdict: GoldenHumanVerdict, note?: string) => void;
  readonly onPrev: () => void;
  readonly onNext: () => void;
}

const DECISION_STYLE: Record<string, string> = {
  green: "text-emerald-600",
  yellow: "text-amber-600",
  red: "text-rose-600",
};

export default function StudioGoldenCorpusQuickReviewer({
  currentCase, positionLabel, notation, onVerdict, onPrev, onNext,
}: StudioGoldenCorpusQuickReviewerProps) {
  const [note, setNote] = useState(currentCase.humanNotes ?? "");

  useEffect(() => { setNote(currentCase.humanNotes ?? ""); }, [currentCase.id, currentCase.humanNotes]);

  const figureInfo = useMemo(() => {
    const combined = combineProblemAndTagGeometryContext(currentCase.geometryRaw || undefined, currentCase.problemText);
    const diag = matchGeometryWithDiagnostics(combined, `rev_${currentCase.id}`, notation);
    const svg = diag.figure
      ? projectGeometryFigureToSVGMarkup(diag.figure, {
          widthPx: 340, heightPx: 240, strokeColorHex: "#0F172A", accentColorHex: "#0284C7",
          numeralMode: notation === "arabic" ? "eastern" : "western", notationLanguage: notation,
        })
      : null;
    return { diag, svg };
  }, [currentCase, notation]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "1" || e.key === "y") { e.preventDefault(); onVerdict("correct", note); }
      else if (e.key === "2" || e.key === "n") { e.preventDefault(); onVerdict("wrong", note); }
      else if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); onNext(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); onPrev(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onVerdict, onNext, onPrev, note]);

  const decision = figureInfo.diag.decision;
  const verdictLabel = currentCase.humanVerdict === "correct" ? "معتمد ✓" : currentCase.humanVerdict === "wrong" ? "خاطئ ✗" : "لم يُراجَع";

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto space-y-3 p-3 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
      <div className="flex items-center justify-between text-xs font-bold">
        <span className="text-slate-500">{positionLabel} • {currentCase.gradeId}</span>
        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">{verdictLabel}</span>
      </div>

      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs leading-relaxed space-y-1">
        <p className="font-bold" dir="auto">{currentCase.problemText}</p>
        {currentCase.geometryRaw && <p className="text-slate-500 font-mono text-[11px]" dir="auto">[وسم]: {currentCase.geometryRaw}</p>}
        <p className="text-[10px] text-slate-400">المصدر: {currentCase.source}</p>
      </div>

      <div className="w-full min-h-[240px] bg-white border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center p-2 overflow-hidden [&_svg]:max-w-full [&_svg]:h-auto">
        {figureInfo.svg ? (
          <div dangerouslySetInnerHTML={{ __html: figureInfo.svg }} />
        ) : (
          <div className="text-center p-4 text-xs font-bold text-slate-500">
            {currentCase.expectedOutcome === "no_figure"
              ? "🟢 لا شكل لهذه المسألة (نظرية/لفظية) — هل هذا صحيح؟"
              : "🔴 لم يُرسم شكل لهذه المسألة"}
          </div>
        )}
      </div>

      <div className="text-[11px] font-bold px-1 space-y-1">
        <div>قرار المحرك: <span className={`font-extrabold ${DECISION_STYLE[decision] ?? "text-slate-500"}`}>{decision}</span></div>
        {figureInfo.diag.warnings.length > 0 && (
          <ul className="list-disc pr-5 text-amber-800 dark:text-amber-300 font-semibold">
            {figureInfo.diag.warnings.map((w) => <li key={w}>{w}</li>)}
          </ul>
        )}
      </div>

      <input
        type="text" dir="auto" value={note} onChange={(e) => setNote(e.target.value)}
        placeholder="ملاحظة (اختياري): ما الخطأ في الشكل؟"
        className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
      />

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => onVerdict("correct", note)}
          className="min-h-[48px] bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-sm cursor-pointer">
          ✓ الشكل صحيح
        </button>
        <button type="button" onClick={() => onVerdict("wrong", note)}
          className="min-h-[48px] bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold rounded-xl text-sm cursor-pointer">
          ✗ الشكل خاطئ
        </button>
        <button type="button" onClick={onPrev}
          className="min-h-[44px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer">
          ◀ السابق
        </button>
        <button type="button" onClick={onNext}
          className="min-h-[44px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer">
          تخطي ▶
        </button>
      </div>
    </div>
  );
}
