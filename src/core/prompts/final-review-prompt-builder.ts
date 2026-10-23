/**
 * @file final-review-prompt-builder.ts
 * @description مولد برومبتات المراجعة النهائية الشاملة (كبسولة ليلة الامتحان) ومراجعات الشهور لـ NotebookLM.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import type { MathBranchId } from "../ssot/math-branches-ssot";
import { MATH_BRANCHES_SSOT } from "../ssot/math-branches-ssot";
import type { MathNotationLanguage } from "../ssot/numeral-and-unit-ssot";
import { buildSharedMathInvariantsPromptBlock } from "./shared-math-prompt-invariants";

export const MODULE_ID_FINAL_REVIEW_PROMPT_BUILDER =
  "final_review_prompt_builder" as const;

export type FinalReviewScopeKind = "monthly_revision" | "final_exam_night_capsule";

export interface FinalReviewPromptConfig {
  readonly reviewScope: FinalReviewScopeKind;
  readonly gradeNameArabic: string;
  readonly termNumber: 1 | 2;
  readonly branchId: MathBranchId;
  readonly coveredUnitsTitlesArabic: readonly string[];
  readonly totalReviewQuestionsCount: number;
  readonly notationLanguage?: MathNotationLanguage;
}

export function buildFinalReviewNotebookLMPrompt(
  config: FinalReviewPromptConfig
): string {
  const branchSpec = MATH_BRANCHES_SSOT[config.branchId];
  const scopeLabel =
    config.reviewScope === "final_exam_night_capsule"
      ? "كبسولة المراجعة النهائية الشاملة وليلة الامتحان"
      : "مراجعة مقرر الشهر المركزة";

  const unitsList =
    config.coveredUnitsTitlesArabic.length > 0
      ? config.coveredUnitsTitlesArabic.map((u, idx) => `   ${idx + 1}. ${u}`).join("\n")
      : "   - جميع وحدات المنهج المقررة في المصدر المرفوع";

  return [
    `المهمة: إعداد (${scopeLabel}) في فرع (${branchSpec.nameArabic}) - ${config.gradeNameArabic} من الكتب والمصادر المرفوعة.`,
    "",
    "📦 الوحدات المشمولة في المراجعة:",
    unitsList,
    "",
    "🎯 الأقسام الثلاثة الإلزامية في المراجعة:",
    "1. القسم الأول [خريطة القوانين والنظريات والنتائج]: تجميع مكثف لجميع قوانين ونظريات الوحدات المحددة للطباعة في عمودين.",
    `2. القسم الثاني [أهم الأسئلة الموضوعية والاختيار من متعدد]: عدد (${Math.ceil(
      config.totalReviewQuestionsCount * 0.6
    )}) سؤالاً تغطي كافة الأفكار المتكررة في الامتحانات.`,
    `3. القسم الثالث [مسائل البرهان والمقال الحاسمة]: عدد (${Math.floor(
      config.totalReviewQuestionsCount * 0.4
    )}) مسائل شاملة مع الحلول النموذجية بالخطوات.`,
    "",
    buildSharedMathInvariantsPromptBlock({
      branchId: config.branchId,
      notationLanguage: config.notationLanguage,
    }),
  ].join("\n");
}
