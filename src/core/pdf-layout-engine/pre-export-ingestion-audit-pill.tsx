"use client";

/**
 * @file pre-export-ingestion-audit-pill.tsx
 * @description شريحة تدقيق ما قبل التصدير والطباعة للمعلم (`print:hidden`) تعرض عدّاد الأسئلة #1..#N
 * والجداول المحللة والرسوم المرسومة والحلول ومستويات الصعوبة قبل الطباعة أو النشر الإلكتروني.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 130 سطراً).
 */

import React, { useState } from "react";
import type { MathQuestionCognitiveDepth } from "../ir/question-assessment-ir";
import { formatNumeralsByModeSSOT, type NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";
import { MATH_COGNITIVE_DEPTH_LABELS_AR } from "../ingestion/math-question-difficulty-classifier";
import type { PrintableMathQuestionItem } from "./a4-vector-html-sheet-renderer";

export const MODULE_ID_PRE_EXPORT_INGESTION_AUDIT_PILL =
  "pre_export_ingestion_audit_pill" as const;

export interface PreExportIngestionAuditSummary {
  readonly total: number;
  readonly mcqCount: number;
  readonly essayCount: number;
  readonly tablesCount: number;
  readonly renderedSvgsCount: number;
  readonly unrenderedDiagramHintsCount: number;
  readonly solvedEssaysCount: number;
  readonly depthCounts: Record<MathQuestionCognitiveDepth, number>;
}

/** يحسب مؤشرات تدقيق الاستيراد والجداول والرسوم والحلول ومستويات الصعوبة لورقة الطباعة. */
export function computePreExportIngestionAudit(
  questions: readonly PrintableMathQuestionItem[]
): PreExportIngestionAuditSummary {
  const depthCounts: Record<MathQuestionCognitiveDepth, number> = {
    direct_application: 0,
    multi_step_analysis: 0,
    deductive_proof: 0,
    higher_order_olympiad: 0,
  };
  let mcqCount = 0;
  let essayCount = 0;
  let tablesCount = 0;
  let renderedSvgsCount = 0;
  let unrenderedDiagramHintsCount = 0;
  let solvedEssaysCount = 0;

  for (const q of questions) {
    const isMcq = q.kind === "mcq";
    if (isMcq) mcqCount += 1;
    else {
      essayCount += 1;
      if ((q.solutionStepsAr && q.solutionStepsAr.length > 0) || Boolean(q.modelAnswerAr?.trim())) {
        solvedEssaysCount += 1;
      }
    }
    if (/^\s*\|.*\|\s*$/m.test(q.promptAr || "")) tablesCount += 1;
    const hasSvg = Boolean(q.geometryFigure || q.graphSpec || q.rawSvgMarkup);
    if (hasSvg) renderedSvgsCount += 1;
    else if (/\[رسم|(?:\([^)\n]*(?:رسم|الشكل\s+المقابل|ميزان|خط\s*أعداد)[^)\n]*\))/i.test(q.promptAr || "")) {
      unrenderedDiagramHintsCount += 1;
    }
    depthCounts[q.cognitiveDepth ?? "direct_application"] += 1;
  }

  return {
    total: questions.length,
    mcqCount,
    essayCount,
    tablesCount,
    renderedSvgsCount,
    unrenderedDiagramHintsCount,
    solvedEssaysCount,
    depthCounts,
  };
}

export function PreExportIngestionAuditPill({
  questions,
  numeralMode,
}: {
  readonly questions: readonly PrintableMathQuestionItem[];
  readonly numeralMode: NumeralDisplayMode;
}) {
  const [expanded, setExpanded] = useState(false);
  if (questions.length === 0) return null;
  const s = computePreExportIngestionAudit(questions);
  const fmt = (n: number | string) => formatNumeralsByModeSSOT(n, numeralMode);

  return (
    <div className="print:hidden relative inline-flex flex-col items-start max-w-full">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="min-h-[44px] sm:min-h-0 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-[11px] font-black text-slate-100 inline-flex items-center gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap transition-colors"
        title="معاينة تدقيق الأسئلة والرسوم والجداول قبل التصدير"
      >
        <span className="text-sky-300">تدقيق #{fmt(1)}–#{fmt(s.total)}:</span>
        <span>اختر {fmt(s.mcqCount)}</span>
        <span>• مقالي {fmt(s.essayCount)}</span>
        {s.tablesCount > 0 && <span className="text-cyan-300">• جداول {fmt(s.tablesCount)}</span>}
        <span className="text-emerald-300">• SVG {fmt(s.renderedSvgsCount)}</span>
        {s.unrenderedDiagramHintsCount > 0 && (
          <span className="text-amber-300">• ⚠️ {fmt(s.unrenderedDiagramHintsCount)} وصف رسم</span>
        )}
        {s.essayCount > 0 && (
          <span className={s.solvedEssaysCount === s.essayCount ? "text-emerald-300" : "text-amber-300"}>
            • حلول {fmt(s.solvedEssaysCount)}/{fmt(s.essayCount)}
          </span>
        )}
        <span className="text-slate-400">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="mt-1.5 w-full sm:w-[440px] max-w-[92vw] max-h-52 overflow-y-auto rounded-xl bg-slate-950 border border-slate-700 p-2 text-[11px] text-slate-200 shadow-xl space-y-1 z-30">
          <div className="flex flex-wrap gap-1.5 pb-1 border-b border-slate-800 text-[10px] font-bold">
            {(Object.entries(s.depthCounts) as [MathQuestionCognitiveDepth, number][]).map(([k, count]) =>
              count > 0 ? (
                <span key={k} className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-200">
                  {MATH_COGNITIVE_DEPTH_LABELS_AR[k]}: {fmt(count)}
                </span>
              ) : null
            )}
          </div>
          {questions.map((q, idx) => (
            <div key={q.id || idx} className="flex items-center justify-between gap-2 py-0.5 border-b border-slate-900/80 last:border-none">
              <span className="font-mono text-amber-300 shrink-0">#{fmt(idx + 1)}</span>
              <span className="truncate flex-1 text-slate-300">{q.promptAr.replace(/\s+/g, " ").slice(0, 48)}</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-200 shrink-0">
                {q.kind === "mcq" ? "اختر" : "مقالي"} • {MATH_COGNITIVE_DEPTH_LABELS_AR[q.cognitiveDepth ?? "direct_application"]}
              </span>
              {(q.geometryFigure || q.graphSpec || q.rawSvgMarkup) && <span className="shrink-0" title="رسم SVG">📐</span>}
              {/^\s*\|.*\|\s*$/m.test(q.promptAr || "") && <span className="shrink-0" title="جدول">📊</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
