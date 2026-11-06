/**
 * @file baseline-coverage-report-aggregator.ts
 * @description يجمّع نتائج الحالات الذهبية في لوحة تغطية v2 تفصل الأخضر المعتمد بشرياً عن مؤشرات النظافة الآلية،
 * وتحسب الدقة لكل صف وفرع وعائلة أشكال (المرحلة 0.6).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 130 سطراً).
 */

import type { GoldenCorpusCase } from "./golden-corpus-case-types-ssot";
import type { BaselineCaseResult, BaselineOutcomeKind, BaselineRiskFlag } from "./baseline-case-outcome-classifier";
import { compareFigureAgainstExpectedSpec } from "./golden-figure-spec-comparator";
import { matchGeometryWithDiagnostics } from "../natural-arabic-geometry-matcher";
import { combineProblemAndTagGeometryContext } from "../description-intake/problem-geometry-context-extractor";

export const MODULE_ID_BASELINE_COVERAGE_REPORT_AGGREGATOR =
  "baseline_coverage_report_aggregator" as const;

export interface BaselineBucketStats {
  readonly key: string;
  readonly total: number;
  readonly byOutcome: Readonly<Record<BaselineOutcomeKind, number>>;
  readonly humanCorrect: number;
  readonly humanWrong: number;
  readonly humanAccuracy: number | null;
}

export interface BaselineSummary {
  readonly total: number;
  readonly byOutcome: Readonly<Record<BaselineOutcomeKind, number>>;
  readonly byFlag: Readonly<Partial<Record<BaselineRiskFlag, number>>>;
  readonly byGrade: readonly BaselineBucketStats[];
  readonly byBranch: readonly BaselineBucketStats[];
  readonly byFamily: readonly BaselineBucketStats[];
  /** دقة مُثبتة بالمراجعة البشرية فقط: correct / (correct + wrong) */
  readonly humanReviewedFigures: number;
  readonly humanCorrectCount: number;
  readonly humanWrongCount: number;
  readonly humanAccuracy: number | null;
  /** المطابقة الآلية لمواصفات الأشكال المرجعية (expectedFigureSpec) */
  readonly specMatchedCount: number;
  readonly specTotalCount: number;
}

const OUTCOMES: readonly BaselineOutcomeKind[] = [
  "figure_clean",
  "figure_flagged",
  "false_figure_on_no_figure_case",
  "missed_figure",
  "true_negative_no_figure",
];

function zeroOutcomes(): Record<BaselineOutcomeKind, number> {
  return Object.fromEntries(OUTCOMES.map((o) => [o, 0])) as Record<BaselineOutcomeKind, number>;
}

function bucketize(
  cases: readonly GoldenCorpusCase[],
  results: readonly BaselineCaseResult[],
  pick: (r: BaselineCaseResult) => string
): BaselineBucketStats[] {
  const caseMap = new Map(cases.map((c) => [c.id, c]));
  const groupOutcomes = new Map<string, Record<BaselineOutcomeKind, number>>();
  const groupCorrect = new Map<string, number>();
  const groupWrong = new Map<string, number>();

  for (const r of results) {
    const key = pick(r);
    const row = groupOutcomes.get(key) ?? zeroOutcomes();
    row[r.outcome] += 1;
    groupOutcomes.set(key, row);

    const c = caseMap.get(r.caseId);
    if (c?.humanVerdict === "correct") {
      groupCorrect.set(key, (groupCorrect.get(key) ?? 0) + 1);
    } else if (c?.humanVerdict === "wrong") {
      groupWrong.set(key, (groupWrong.get(key) ?? 0) + 1);
    }
  }

  return [...groupOutcomes.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, byOutcome]) => {
      const correct = groupCorrect.get(key) ?? 0;
      const wrong = groupWrong.get(key) ?? 0;
      const reviewed = correct + wrong;
      return {
        key,
        byOutcome,
        total: Object.values(byOutcome).reduce((s, n) => s + n, 0),
        humanCorrect: correct,
        humanWrong: wrong,
        humanAccuracy: reviewed === 0 ? null : Number((correct / reviewed).toFixed(3)),
      };
    });
}

export function summarizeBaselineResults(
  cases: readonly GoldenCorpusCase[],
  results: readonly BaselineCaseResult[]
): BaselineSummary {
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

  // فحص مقارنة المواصفات المرجعية الآلية
  let specMatchedCount = 0;
  let specTotalCount = 0;
  for (const c of cases) {
    if (c.expectedFigureSpec) {
      specTotalCount++;
      const combined = combineProblemAndTagGeometryContext(c.geometryRaw || undefined, c.problemText);
      const diag = matchGeometryWithDiagnostics(combined, `sum_${c.id}`, "arabic");
      const report = compareFigureAgainstExpectedSpec({
        figure: diag.figure,
        expectedOutcome: c.expectedOutcome,
        expectedSpec: c.expectedFigureSpec,
      });
      if (report.matches) specMatchedCount++;
    }
  }

  return {
    total: results.length,
    byOutcome,
    byFlag,
    byGrade: bucketize(cases, results, (r) => r.gradeId),
    byBranch: bucketize(cases, results, (r) => r.branchId),
    byFamily: bucketize(cases, results, (r) => r.figureBranchId || "none"),
    humanReviewedFigures: reviewed,
    humanCorrectCount: correct,
    humanWrongCount: wrong,
    humanAccuracy: reviewed === 0 ? null : Number((correct / reviewed).toFixed(3)),
    specMatchedCount,
    specTotalCount,
  };
}
