"use client";

/**
 * @file studio-figure-human-review-tab.tsx
 * @description تبويب «مراجعة الأشكال» في الاستوديو: نظام المراجعة البشرية (المهمة 0.4) لحالات المجموعة الذهبية:
 * يحمّل الحالات، يفلترها بالصف والحالة، يعرض الشكل الذي يرسمه المحرك، ويحفظ حكم المعلم محلياً مع التصدير.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 200 سطر).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { GoldenCorpusCase, GoldenHumanVerdict } from "@/core/geometry-engine/baseline-measurement/golden-corpus-case-types-ssot";
import { loadGoldenCorpusInBrowser } from "@/core/geometry-engine/baseline-measurement/golden-corpus-client-bundle-loader";
import {
  applyVerdictsToCases,
  loadGoldenHumanVerdicts,
  saveGoldenHumanVerdicts,
  withVerdict,
  type GoldenHumanVerdictMap,
} from "@/core/geometry-engine/baseline-measurement/golden-human-verdicts-local-store";
import type { MathNotationLanguage } from "@/core/ssot/numeral-and-unit-ssot";
import StudioGoldenCorpusQuickReviewer from "./studio-golden-corpus-quick-reviewer";
import StudioGoldenReviewExportPanel from "./studio-golden-review-export-panel";

export const MODULE_ID_STUDIO_FIGURE_HUMAN_REVIEW_TAB = "studio_figure_human_review_tab" as const;

type StatusFilter = "unreviewed" | "wrong" | "correct" | "all";
const STATUS_LABELS: readonly { id: StatusFilter; label: string }[] = [
  { id: "unreviewed", label: "لم يُراجَع" },
  { id: "wrong", label: "الخاطئ" },
  { id: "correct", label: "الصحيح" },
  { id: "all", label: "الكل" },
];

export default function StudioFigureHumanReviewTab() {
  const [baseCases, setBaseCases] = useState<GoldenCorpusCase[] | null>(null);
  const [verdicts, setVerdicts] = useState<GoldenHumanVerdictMap>({});
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("unreviewed");
  const [onlyFigures, setOnlyFigures] = useState(true);
  const [notation, setNotation] = useState<MathNotationLanguage>("english");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setVerdicts(loadGoldenHumanVerdicts());
    loadGoldenCorpusInBrowser().then(setBaseCases);
  }, []);

  const merged = useMemo(() => (baseCases ? applyVerdictsToCases(baseCases, verdicts) : []), [baseCases, verdicts]);
  const grades = useMemo(() => Array.from(new Set(merged.map((c) => c.gradeId))).sort(), [merged]);

  const queue = useMemo(
    () =>
      merged.filter(
        (c) =>
          (gradeFilter === "all" || c.gradeId === gradeFilter) &&
          (!onlyFigures || c.expectedOutcome === "figure") &&
          (statusFilter === "all" || c.humanVerdict === statusFilter)
      ),
    [merged, gradeFilter, statusFilter, onlyFigures]
  );

  const safeIndex = Math.min(index, Math.max(0, queue.length - 1));
  const current = queue[safeIndex];

  const commitVerdict = useCallback(
    (verdict: GoldenHumanVerdict, note?: string) => {
      if (!current) return;
      const next = withVerdict(verdicts, current.id, verdict, note);
      setVerdicts(next);
      saveGoldenHumanVerdicts(next);
      // في وضع «لم يُراجَع» تختفي الحالة من الطابور فيبقى المؤشر على التالية تلقائياً
      if (statusFilter !== "unreviewed") setIndex((i) => Math.min(queue.length - 1, i + 1));
    },
    [current, verdicts, statusFilter, queue.length]
  );

  const importVerdicts = (map: GoldenHumanVerdictMap) => { setVerdicts(map); saveGoldenHumanVerdicts(map); };
  const chip = (active: boolean) =>
    `shrink-0 min-h-[40px] px-3 rounded-xl text-xs font-black cursor-pointer ${active ? "bg-indigo-900 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`;

  if (!baseCases) return <div className="p-6 text-center text-xs font-bold text-slate-500">جارٍ تحميل حالات المراجعة…</div>;

  return (
    <div className="space-y-3">
      <StudioGoldenReviewExportPanel verdicts={verdicts} totalCases={merged.filter((c) => c.expectedOutcome === "figure").length} onImport={importVerdicts} />

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap pb-0.5">
          <button type="button" className={chip(gradeFilter === "all")} onClick={() => { setGradeFilter("all"); setIndex(0); }}>كل الصفوف</button>
          {grades.map((g) => (
            <button key={g} type="button" className={chip(gradeFilter === g)} onClick={() => { setGradeFilter(g); setIndex(0); }}>{g}</button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap pb-0.5">
          {STATUS_LABELS.map((s) => (
            <button key={s.id} type="button" className={chip(statusFilter === s.id)} onClick={() => { setStatusFilter(s.id); setIndex(0); }}>{s.label}</button>
          ))}
          <button type="button" className={chip(onlyFigures)} onClick={() => { setOnlyFigures((v) => !v); setIndex(0); }}>الأشكال فقط</button>
          <button type="button" className={chip(notation === "arabic")} onClick={() => setNotation((n) => (n === "arabic" ? "english" : "arabic"))}>
            {notation === "arabic" ? "رموز عربية" : "رموز لاتينية"}
          </button>
        </div>
      </div>

      {current ? (
        <StudioGoldenCorpusQuickReviewer
          currentCase={current}
          positionLabel={`${safeIndex + 1} / ${queue.length}`}
          notation={notation}
          onVerdict={commitVerdict}
          onPrev={() => setIndex(Math.max(0, safeIndex - 1))}
          onNext={() => setIndex(Math.min(queue.length - 1, safeIndex + 1))}
        />
      ) : (
        <div className="p-6 text-center text-xs font-bold text-emerald-700 bg-emerald-50 rounded-2xl">
          ✓ لا توجد حالات في هذا الفلتر. غيّر الفلتر أو صدّر أحكامك.
        </div>
      )}
    </div>
  );
}
