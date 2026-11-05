/**
 * @file baseline-coverage-report-aggregator.ts
 * @description يجمّع نتائج الحالات الذهبية في لوحة تغطية لكل صف وفرع، ويحسب الدقة الفعلية من أحكام المراجعة البشرية.
 */
import type { GoldenCorpusCase } from "./golden-corpus-case-types-ssot";
import type { BaselineCaseResult, BaselineOutcomeKind, BaselineRiskFlag } from "./baseline-case-outcome-classifier";

export const MODULE_ID_BASELINE_COVERAGE_REPORT_AGGREGATOR = "baseline_coverage_report_aggregator" as const;

export interface BaselineBucketStats {
  readonly key: string;
  readonly total: number;
  readonly byOutcome: Readonly<Record<BaselineOutcomeKind, number>>;
}

export interface BaselineSummary {
  readonly total: number;
  readonly byOutcome: Readonly<Record<BaselineOutcomeKind, number>>;
  readonly byFlag: Readonly<Partial<Record<BaselineRiskFlag, number>>>;
  readonly byGrade: readonly BaselineBucketStats[];
  readonly byBranch: readonly BaselineBucketStats[];
  /** دقة مُثبتة بالمراجعة البشرية فقط: correct / (correct + wrong) على الحالات المراجَعة التي أنتج لها النظام شكلاً. */
  readonly humanReviewedFigures: number;
  readonly humanAccuracy: number | null;
}

const OUTCOMES: readonly BaselineOutcomeKind[] = [
  "figure_clean", "figure_flagged", "false_figure_on_no_figure_case", "missed_figure", "true_negative_no_figure",
];

function zeroOutcomes(): Record<BaselineOutcomeKind, number> {
  return Object.fromEntries(OUTCOMES.map((o) => [o, 0])) as Record<BaselineOutcomeKind, number>;
}

function bucketize(results: readonly BaselineCaseResult[], pick: (r: BaselineCaseResult) => string): BaselineBucketStats[] {
  const map = new Map<string, Record<BaselineOutcomeKind, number>>();
  for (const r of results) {
    const key = pick(r);
    const row = map.get(key) ?? zeroOutcomes();
    row[r.outcome] += 1;
    map.set(key, row);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, byOutcome]) => ({ key, byOutcome, total: Object.values(byOutcome).reduce((s, n) => s + n, 0) }));
}

export function summarizeBaselineResults(cases: readonly GoldenCorpusCase[], results: readonly BaselineCaseResult[]): BaselineSummary {
  const byOutcome = zeroOutcomes();
  const byFlag: Partial<Record<BaselineRiskFlag, number>> = {};
  for (const r of results) {
    byOutcome[r.outcome] += 1;
    for (const f of r.flags) byFlag[f] = (byFlag[f] ?? 0) + 1;
  }
  const verdictById = new Map(cases.map((c) => [c.id, c.humanVerdict]));
  const producedFigureIds = new Set(results.filter((r) => r.source !== "none").map((r) => r.caseId));
  let correct = 0;
  let wrong = 0;
  for (const id of producedFigureIds) {
    const v = verdictById.get(id);
    if (v === "correct") correct += 1;
    if (v === "wrong") wrong += 1;
  }
  const reviewed = correct + wrong;
  return {
    total: results.length,
    byOutcome,
    byFlag,
    byGrade: bucketize(results, (r) => r.gradeId),
    byBranch: bucketize(results, (r) => r.branchId),
    humanReviewedFigures: reviewed,
    humanAccuracy: reviewed === 0 ? null : correct / reviewed,
  };
}
