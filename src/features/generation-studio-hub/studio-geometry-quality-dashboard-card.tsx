"use client";

/**
 * @file studio-geometry-quality-dashboard-card.tsx
 * @description لوحة مراقبة جودة الأشكال (المهمة 7.4) تحسب الأرقام حيّاً من المجموعة الذهبية والمحرك الحالي
 * (لا أرقام ثابتة): أخضر = شكل بلا علامات خطر، أصفر = شكل بعلامات خطر، أحمر = شكل مفقود أو زائد،
 * مع الدقة المثبتة بالمراجعة البشرية وأكثر أسباب الخطر شيوعاً.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 200 سطر).
 */

import { useState } from "react";
import { loadGoldenCorpusInBrowser } from "@/core/geometry-engine/baseline-measurement/golden-corpus-client-bundle-loader";
import { classifyBaselineCase } from "@/core/geometry-engine/baseline-measurement/baseline-case-outcome-classifier";
import { applyVerdictsToCases, loadGoldenHumanVerdicts } from "@/core/geometry-engine/baseline-measurement/golden-human-verdicts-local-store";

export const MODULE_ID_STUDIO_GEOMETRY_QUALITY_DASHBOARD_CARD =
  "studio_geometry_quality_dashboard_card" as const;

interface GradeRow {
  readonly gradeId: string;
  readonly total: number;
  readonly clean: number;
  readonly flagged: number;
  readonly bad: number;
  readonly humanReviewed: number;
  readonly humanCorrect: number;
}

interface DashboardData {
  readonly rows: readonly GradeRow[];
  readonly topFlags: readonly { flag: string; count: number }[];
}

async function computeDashboard(): Promise<DashboardData> {
  const cases = applyVerdictsToCases(await loadGoldenCorpusInBrowser(), loadGoldenHumanVerdicts());
  const byGrade = new Map<string, { total: number; clean: number; flagged: number; bad: number; hr: number; hc: number }>();
  const flagCounts = new Map<string, number>();
  for (const c of cases) {
    if (c.expectedOutcome !== "figure") continue;
    const g = byGrade.get(c.gradeId) ?? { total: 0, clean: 0, flagged: 0, bad: 0, hr: 0, hc: 0 };
    const r = classifyBaselineCase(c);
    g.total++;
    if (r.outcome === "figure_clean") g.clean++;
    else if (r.outcome === "figure_flagged") g.flagged++;
    else g.bad++;
    for (const f of r.flags) flagCounts.set(f, (flagCounts.get(f) ?? 0) + 1);
    if (c.humanVerdict !== "unreviewed") { g.hr++; if (c.humanVerdict === "correct") g.hc++; }
    byGrade.set(c.gradeId, g);
  }
  const rows = Array.from(byGrade, ([gradeId, g]) => ({
    gradeId, total: g.total, clean: g.clean, flagged: g.flagged, bad: g.bad, humanReviewed: g.hr, humanCorrect: g.hc,
  })).sort((a, b) => a.gradeId.localeCompare(b.gradeId));
  const topFlags = Array.from(flagCounts, ([flag, count]) => ({ flag, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  return { rows, topFlags };
}

const pct = (n: number, d: number) => (d > 0 ? (n / d) * 100 : 0);

export default function StudioGeometryQualityDashboardCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next && !data && !loading) {
      setLoading(true);
      computeDashboard().then(setData).finally(() => setLoading(false));
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden shadow-xs">
      <button type="button" onClick={toggle}
        className="w-full p-3.5 flex items-center justify-between text-right cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <span className="text-base">📊</span>
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">لوحة مراقبة جودة الأشكال (أرقام حيّة)</h4>
            <span className="text-[10px] font-bold text-slate-500">تُحسب الآن من المحرك الحالي والمجموعة الذهبية</span>
          </div>
        </div>
        <span className="text-xs text-slate-400">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="p-3.5 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
          {loading && <div className="font-bold text-slate-500">جارٍ الحساب…</div>}
          {data && (
            <>
              <div className="space-y-1.5 max-h-[260px] overflow-y-auto">
                {data.rows.map((r) => (
                  <div key={r.gradeId} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between font-black text-[11px]">
                      <span>{r.gradeId} • {r.total} شكل</span>
                      <span className="text-slate-500 text-[10px]">
                        {r.humanReviewed > 0 ? `دقة مثبتة ${pct(r.humanCorrect, r.humanReviewed).toFixed(0)}% (${r.humanReviewed})` : "لم يُراجَع بشرياً"}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                      <div style={{ width: `${pct(r.clean, r.total)}%` }} className="bg-emerald-500 h-full" title={`بلا علامات خطر: ${r.clean}`} />
                      <div style={{ width: `${pct(r.flagged, r.total)}%` }} className="bg-amber-400 h-full" title={`بعلامات خطر: ${r.flagged}`} />
                      <div style={{ width: `${pct(r.bad, r.total)}%` }} className="bg-rose-500 h-full" title={`مفقود/زائد: ${r.bad}`} />
                    </div>
                    <div className="text-[10px] font-bold text-slate-500">🟢 {r.clean} • 🟡 {r.flagged} • 🔴 {r.bad}</div>
                  </div>
                ))}
              </div>
              {data.topFlags.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10.5px] font-black block">أكثر علامات الخطر شيوعاً:</span>
                  {data.topFlags.map((f) => (
                    <div key={f.flag} className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between text-[10.5px] font-bold">
                      <span className="font-mono">{f.flag}</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-800 font-black">{f.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
