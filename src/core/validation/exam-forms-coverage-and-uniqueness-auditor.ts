/**
 * @file exam-forms-coverage-and-uniqueness-auditor.ts
 * @description مدقق حتمي لجودة النماذج الامتحانية المستوردة: يتحقق من عدد النماذج والأسئلة، ومنع تكرار الأفكار
 * (أو تكرار المسألة مع تغيير الأرقام فقط) عبر جميع النماذج، وعدالة التوزيع الديموجرافي على الدروس.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 175 سطراً).
 */

import type { ParsedExamFormBlock } from "../ingestion/notebooklm-exam-forms-parser";

export const MODULE_ID_EXAM_FORMS_COVERAGE_AND_UNIQUENESS_AUDITOR =
  "exam_forms_coverage_and_uniqueness_auditor" as const;

export interface DuplicateIdeaFinding {
  readonly kind: "idea_tag" | "stem_fingerprint";
  readonly label: string;
  readonly locations: readonly string[];
}

export interface LessonDistributionRow {
  readonly lessonTitleArabic: string;
  readonly count: number;
}

export interface ExamFormsAuditReport {
  readonly actualFormsCount: number;
  readonly expectedFormsCount: number;
  readonly formsCountMatches: boolean;
  readonly formCountMismatches: readonly string[];
  readonly duplicateFindings: readonly DuplicateIdeaFinding[];
  readonly lessonDistribution: readonly LessonDistributionRow[];
  readonly neglectedLessons: readonly string[];
  readonly skewedLessons: readonly string[];
}

function normalizeArabicText(raw: string): string {
  return (raw || "")
    .replace(/[\u064B-\u0652\u0670]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function normalizeQuestionStemFingerprint(promptArabic: string): string {
  return normalizeArabicText(promptArabic)
    .replace(/\$[^$]*\$/g, " # ")
    .replace(/[0-9٠-٩]+(?:\.[0-9٠-٩]+)?/g, "#")
    .replace(/[^\u0621-\u064Aa-z# ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function auditParsedExamFormsQuality(params: {
  readonly forms: readonly ParsedExamFormBlock[];
  readonly expectedFormsCount: number;
  readonly expectedMcqPerForm: number;
  readonly expectedEssayPerForm: number;
  readonly targetedLessonTitles?: readonly string[];
}): ExamFormsAuditReport {
  const { forms, expectedFormsCount, expectedMcqPerForm, expectedEssayPerForm } = params;
  const expectedTotalPerForm = expectedMcqPerForm + expectedEssayPerForm;

  const formCountMismatches: string[] = [];
  const ideaBuckets = new Map<string, { label: string; locs: string[] }>();
  const stemBuckets = new Map<string, { label: string; locs: string[] }>();
  const lessonCounts = new Map<string, { display: string; count: number }>();

  for (const form of forms) {
    const mcqActual = form.questions.filter((q) => q.patternKind === "mcq").length;
    const essayActual = form.questions.length - mcqActual;
    if (
      expectedTotalPerForm > 0 &&
      (mcqActual !== expectedMcqPerForm || essayActual !== expectedEssayPerForm)
    ) {
      formCountMismatches.push(
        `${form.formTitleAr}: ${mcqActual} اختر + ${essayActual} مقالي (المطلوب ${expectedMcqPerForm} + ${expectedEssayPerForm})`
      );
    }

    for (const q of form.questions) {
      const loc = `${form.formTitleAr} س${q.displayOrderNumber}`;

      if (q.ideaTagArabic?.trim()) {
        const ideaKey = normalizeArabicText(q.ideaTagArabic);
        if (ideaKey.length >= 3) {
          const entry = ideaBuckets.get(ideaKey) ?? { label: q.ideaTagArabic.trim(), locs: [] };
          entry.locs.push(loc);
          ideaBuckets.set(ideaKey, entry);
        }
      }

      const stemKey = normalizeQuestionStemFingerprint(q.promptArabic);
      if (stemKey.length >= 16) {
        const entry = stemBuckets.get(stemKey) ?? {
          label: q.promptArabic.slice(0, 56).trim() + (q.promptArabic.length > 56 ? "..." : ""),
          locs: [],
        };
        entry.locs.push(loc);
        stemBuckets.set(stemKey, entry);
      }

      const lessonClean = (q.lessonTitleArabic || "").trim();
      if (lessonClean) {
        const lKey = normalizeArabicText(lessonClean);
        const existing = lessonCounts.get(lKey) ?? { display: lessonClean, count: 0 };
        existing.count += 1;
        lessonCounts.set(lKey, existing);
      }
    }
  }

  const duplicateFindings: DuplicateIdeaFinding[] = [];
  for (const entry of ideaBuckets.values()) {
    if (entry.locs.length > 1) {
      duplicateFindings.push({ kind: "idea_tag", label: entry.label, locations: entry.locs });
    }
  }
  for (const entry of stemBuckets.values()) {
    if (entry.locs.length > 1) {
      duplicateFindings.push({ kind: "stem_fingerprint", label: entry.label, locations: entry.locs });
    }
  }

  const targeted = (params.targetedLessonTitles ?? []).filter((t) => t.trim().length > 0);
  const neglectedLessons: string[] = [];
  for (const targetTitle of targeted) {
    const tKey = normalizeArabicText(targetTitle);
    const matched = Array.from(lessonCounts.entries()).some(
      ([k]) => k === tKey || k.includes(tKey) || tKey.includes(k)
    );
    if (!matched) neglectedLessons.push(targetTitle);
  }

  const lessonDistribution: LessonDistributionRow[] = Array.from(lessonCounts.values())
    .map((v) => ({ lessonTitleArabic: v.display, count: v.count }))
    .sort((a, b) => b.count - a.count);

  const skewedLessons: string[] = [];
  if (lessonDistribution.length >= 2) {
    const totalCounted = lessonDistribution.reduce((s, r) => s + r.count, 0);
    const avg = totalCounted / lessonDistribution.length;
    const threshold = Math.max(3, Math.ceil(avg * 1.8));
    for (const row of lessonDistribution) {
      if (row.count > threshold) {
        skewedLessons.push(`${row.lessonTitleArabic} (${row.count})`);
      }
    }
  }

  return {
    actualFormsCount: forms.length,
    expectedFormsCount,
    formsCountMatches: forms.length === expectedFormsCount,
    formCountMismatches,
    duplicateFindings,
    lessonDistribution,
    neglectedLessons,
    skewedLessons,
  };
}
