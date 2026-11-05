/**
 * @file baseline-coverage-report-markdown-writer.ts
 * @description يحوّل ملخص خط الأساس إلى تقرير Markdown عربي (لوحة التغطية) يُحفظ في docs/qa.
 */
import type { BaselineSummary, BaselineBucketStats } from "./baseline-coverage-report-aggregator";
import type { BaselineCaseResult } from "./baseline-case-outcome-classifier";

export const MODULE_ID_BASELINE_COVERAGE_REPORT_MARKDOWN_WRITER = "baseline_coverage_report_markdown_writer" as const;

const pct = (n: number, d: number): string => (d === 0 ? "—" : `${((n / d) * 100).toFixed(1)}%`);

function bucketTable(title: string, rows: readonly BaselineBucketStats[]): string {
  const lines = [
    `### ${title}`,
    "",
    "| المفتاح | الإجمالي | شكل بلا علامات | شكل بعلامات خطر | شكل على حالة بلا شكل | شكل مفقود | رفض صحيح |",
    "|---|---|---|---|---|---|---|",
  ];
  for (const r of rows) {
    const o = r.byOutcome;
    lines.push(`| ${r.key} | ${r.total} | ${o.figure_clean} | ${o.figure_flagged} | ${o.false_figure_on_no_figure_case} | ${o.missed_figure} | ${o.true_negative_no_figure} |`);
  }
  return lines.join("\n");
}

export function renderBaselineReportMarkdown(summary: BaselineSummary, results: readonly BaselineCaseResult[], generatedAtIso: string): string {
  const o = summary.byOutcome;
  const produced = o.figure_clean + o.figure_flagged + o.false_figure_on_no_figure_case;
  const flagRows = Object.entries(summary.byFlag).sort(([, a], [, b]) => (b ?? 0) - (a ?? 0));
  const problematic = results.filter((r) => r.outcome === "figure_flagged" || r.outcome === "false_figure_on_no_figure_case" || r.outcome === "missed_figure");

  return [
    "# تقرير خط الأساس لدقة الأشكال الهندسية (المرحلة 0)",
    "",
    `> تاريخ التوليد: ${generatedAtIso} — يُولَّد آلياً بواسطة \`tests/geo-baseline-measurement-runner.test.ts\`. لا تعدّله يدوياً.`,
    "",
    "> [!IMPORTANT]",
    "> العلامات الآلية **مؤشرات خطر وليست حكماً نهائياً**. الدقة الحقيقية لا تُحسب إلا من خانة `humanVerdict` بعد المراجعة البشرية.",
    "",
    "## الملخص",
    "",
    `- إجمالي الحالات: **${summary.total}**`,
    `- أنتج النظام شكلاً في: **${produced}** (${pct(produced, summary.total)})`,
    `- شكل بلا أي علامة خطر آلية: **${o.figure_clean}** (${pct(o.figure_clean, summary.total)})`,
    `- شكل بعلامات خطر: **${o.figure_flagged}** (${pct(o.figure_flagged, summary.total)})`,
    `- 🔴 شكل رُسم لمسألة لا يجب أن يُرسم لها: **${o.false_figure_on_no_figure_case}**`,
    `- شكل مفقود لمسألة تستحق شكلاً: **${o.missed_figure}**`,
    `- رفض صحيح (لا شكل): **${o.true_negative_no_figure}**`,
    `- الدقة المُثبتة بشرياً: **${summary.humanAccuracy === null ? "لم تُراجَع أي حالة بعد" : pct(Math.round(summary.humanAccuracy * summary.humanReviewedFigures), summary.humanReviewedFigures) + ` (على ${summary.humanReviewedFigures} حالة مراجَعة)`}**`,
    "",
    "## علامات الخطر",
    "",
    "| العلامة | العدد |",
    "|---|---|",
    ...flagRows.map(([k, v]) => `| \`${k}\` | ${v} |`),
    "",
    bucketTable("حسب الصف", summary.byGrade),
    "",
    bucketTable("حسب الفرع", summary.byBranch),
    "",
    "## الحالات التي تستحق الفحص أولاً",
    "",
    "| الحالة | النتيجة | العلامات | المصدر | أرقام ناقصة | أرقام مسرّبة |",
    "|---|---|---|---|---|---|",
    ...problematic.map((r) => `| ${r.caseId} | ${r.outcome} | ${r.flags.join("، ") || "—"} | ${r.source} | ${r.missingNumbers.join("، ") || "—"} | ${r.leakedNumbers.join("، ") || "—"} |`),
    "",
  ].join("\n");
}
