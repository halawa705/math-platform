/**
 * @file baseline-coverage-report-markdown-writer.ts
 * @description يحوّل ملخص خط الأساس v2 إلى تقرير Markdown عربي متقدم يفصل الدقة المثبتة بشرياً عن المؤشرات الآلية (المرحلة 0.6).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 110 سطراً).
 */

import type { BaselineSummary, BaselineBucketStats } from "./baseline-coverage-report-aggregator";
import type { BaselineCaseResult } from "./baseline-case-outcome-classifier";

export const MODULE_ID_BASELINE_COVERAGE_REPORT_MARKDOWN_WRITER =
  "baseline_coverage_report_markdown_writer" as const;

const pct = (n: number, d: number): string => (d === 0 ? "—" : `${((n / d) * 100).toFixed(1)}%`);

function bucketTable(title: string, rows: readonly BaselineBucketStats[]): string {
  const lines = [
    `### ${title}`,
    "",
    "| المفتاح | الإجمالي | شكل بلا علامات | شكل بعلامات خطر | شكل على حالة بلا شكل | شكل مفقود | رفض صحيح | معتمد بشرياً | دقة مثبتة |",
    "|---|---|---|---|---|---|---|---|---|",
  ];
  for (const r of rows) {
    const o = r.byOutcome;
    const acc = r.humanAccuracy === null ? "—" : `${(r.humanAccuracy * 100).toFixed(1)}%`;
    lines.push(
      `| ${r.key} | ${r.total} | ${o.figure_clean} | ${o.figure_flagged} | ${o.false_figure_on_no_figure_case} | ${o.missed_figure} | ${o.true_negative_no_figure} | ${r.humanCorrect}/${r.humanCorrect + r.humanWrong} | ${acc} |`
    );
  }
  return lines.join("\n");
}

export function renderBaselineReportMarkdown(
  summary: BaselineSummary,
  results: readonly BaselineCaseResult[],
  generatedAtIso: string
): string {
  const o = summary.byOutcome;
  const produced = o.figure_clean + o.figure_flagged + o.false_figure_on_no_figure_case;
  const flagRows = Object.entries(summary.byFlag).sort(([, a], [, b]) => (b ?? 0) - (a ?? 0));
  const problematic = results.filter(
    (r) =>
      r.outcome === "figure_flagged" ||
      r.outcome === "false_figure_on_no_figure_case" ||
      r.outcome === "missed_figure"
  );

  return [
    "# تقرير خط الأساس لدقة الأشكال الهندسية والرسوم (لوحة القياس v2 - المرحلة 0)",
    "",
    `> تاريخ التوليد: ${generatedAtIso} — يُولَّد آلياً بواسطة \`tests/geo-baseline-measurement-runner.test.ts\`. لا تعدّله يدوياً.`,
    "",
    "> [!IMPORTANT]",
    "> العلامات الآلية **مؤشرات خطر ونظافة وليست حكماً نهائياً**. الدقة الحقيقية تُحسب فقط من خانة `humanVerdict` بعد المراجعة البشرية الصريحة.",
    "",
    "## 1. الملخص التنفيذي ومؤشرات الدقة",
    "",
    `- إجمالي الحالات في المجموعة الذهبية: **${summary.total}** حالة (تغطي ابتدائي 3–6 وإعدادي 1–3)`,
    `- أنتج النظام شكلاً في: **${produced}** (${pct(produced, summary.total)})`,
    `- شكل بلا أي علامة خطر آلية: **${o.figure_clean}** (${pct(o.figure_clean, summary.total)})`,
    `- شكل بعلامات خطر آلية: **${o.figure_flagged}** (${pct(o.figure_flagged, summary.total)})`,
    `- 🔴 شكل رُسم لمسألة لا يجب أن يُرسم لها (هلوسة زائدة): **${o.false_figure_on_no_figure_case}**`,
    `- شكل مفقود لمسألة تستحق شكلاً: **${o.missed_figure}**`,
    `- رفض صحيح لمسائل نظرية (لا شكل): **${o.true_negative_no_figure}**`,
    `- **الدقة المُثبتة بالمراجعة البشرية (Human Accuracy):** **${
      summary.humanAccuracy === null
        ? "لم تُراجَع أي حالة بعد"
        : `${(summary.humanAccuracy * 100).toFixed(1)}% (${summary.humanCorrectCount} معتمدة من ${summary.humanReviewedFigures} حالة مراجَعة)`
    }**`,
    `- **مطابقة المواصفة المرجعية الآلية (expectedFigureSpec):** **${summary.specMatchedCount}/${summary.specTotalCount}** (${pct(
      summary.specMatchedCount,
      summary.specTotalCount
    )})`,
    "",
    "## 2. مؤشرات وعلامات الخطر الآلية",
    "",
    "| العلامة الآلية | العدد |",
    "|---|---|",
    ...flagRows.map(([k, v]) => `| \`${k}\` | ${v} |`),
    "",
    bucketTable("لوحة التغطية والدقة حسب الصف الدراسي", summary.byGrade),
    "",
    bucketTable("لوحة التغطية حسب الفرع الرياضي", summary.byBranch),
    "",
    "## 3. أبرز الحالات التي تستحق الفحص والتحسين",
    "",
    "| الحالة | النتيجة | العلامات | المصدر | أرقام ناقصة | أرقام مسرّبة |",
    "|---|---|---|---|---|---|",
    ...problematic
      .slice(0, 100)
      .map(
        (r) =>
          `| ${r.caseId} | ${r.outcome} | ${r.flags.join("، ") || "—"} | ${r.source} | ${
            r.missingNumbers.join("، ") || "—"
          } | ${r.leakedNumbers.join("، ") || "—"} |`
      ),
    "",
  ].join("\n");
}
