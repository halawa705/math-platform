/**
 * @file final-review-prompt-builder.ts
 * @description مولد برومبتات المراجعة النهائية الشاملة ومراجعات الشهور لـ NotebookLM بالمراحل الثلاث (مكثف < 1550 حرفاً تحت سقف NotebookLM).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 130 سطراً).
 */

import type { MathBranchId } from "../ssot/math-branches-ssot";
import { MATH_BRANCHES_SSOT } from "../ssot/math-branches-ssot";
import type { MathNotationLanguage } from "../ssot/numeral-and-unit-ssot";
import { buildSharedMathInvariantsPromptBlock } from "./shared-math-prompt-invariants";

export const MODULE_ID_FINAL_REVIEW_PROMPT_BUILDER =
  "final_review_prompt_builder" as const;

export type FinalReviewScopeKind = "monthly_revision" | "final_exam_night_capsule";
export type FinalReviewStageNumber = 1 | 2 | 3;

export interface FinalReviewPromptConfig {
  readonly reviewScope: FinalReviewScopeKind;
  readonly stageNumber?: FinalReviewStageNumber;
  readonly gradeNameArabic: string;
  readonly termNumber: 1 | 2;
  readonly branchId: MathBranchId;
  readonly coveredUnitsTitlesArabic: readonly string[];
  readonly totalReviewQuestionsCount: number;
  readonly mcqCount?: number;
  readonly essayCount?: number;
  readonly notationLanguage?: MathNotationLanguage;
  readonly extractedStage2EssayQuestions?: readonly string[];
}

export function extractEssayQuestionsFromReviewStage2Reply(
  stage2Raw: string
): readonly string[] {
  if (!stage2Raw || !stage2Raw.trim()) return [];
  const results: string[] = [];
  for (const line of stage2Raw.split(/\r?\n/)) {
    const clean = line.replace(/\*\*/g, "").trim();
    if (/^(?:\[\d+\]|\d+[.)-]|السؤال\s+|===\s*\[QUESTION:\s*\d+\])/i.test(clean)) {
      results.push(clean.slice(0, 40));
    }
  }
  return results.slice(0, 16);
}

export function buildFinalReviewNotebookLMPrompt(
  config: FinalReviewPromptConfig
): string {
  const branchSpec = MATH_BRANCHES_SSOT[config.branchId];
  const stage = config.stageNumber ?? 1;
  const mcqCount = config.mcqCount ?? Math.ceil(config.totalReviewQuestionsCount * 0.6);
  const essayCount = config.essayCount ?? Math.floor(config.totalReviewQuestionsCount * 0.4);
  const scopeLabel =
    config.reviewScope === "final_exam_night_capsule" ? "مراجعة ليلة الامتحان الشاملة" : "مراجعة مقرر الشهر";
  const unitsList =
    config.coveredUnitsTitlesArabic.length > 0
      ? config.coveredUnitsTitlesArabic.join(" ، ")
      : "جميع وحدات المنهج المقررة";

  const sharedRules = buildSharedMathInvariantsPromptBlock({
    branchId: config.branchId,
    notationLanguage: config.notationLanguage,
    unitTitleArabic: unitsList,
  });

  if (stage === 1) {
    return [
      `${scopeLabel} (المرحلة ١: أسئلة اختر وإجابتها): ${branchSpec.nameArabic} | ${config.gradeNameArabic}.`,
      `🎯 النطاق الحصري: [${unitsList}] | العدد الإلزامي الحرفي: (${mcqCount}) سؤال اختيار من متعدد [اختر] تغطي جميع أفكار الوحدات بلا أي تكرار.`,
      sharedRules,
      `📐 قالب الإخراج الإلزامي للمرحلة ١ (من [1] حتى [${mcqCount}]):`,
      "[1] [نص السؤال كاملاً، ومعه [رسم هندسي: ...] إن لزم]",
      "(أ) [الخيار ١]",
      "(ب) [الخيار ٢]",
      "(جـ) [الخيار ٣]",
      "(د) [الخيار ٤]",
      "الإجابة الصحيحة: (أ) [نص الإجابة المعتمدة]",
    ].join("\n");
  }

  if (stage === 2) {
    return [
      `${scopeLabel} (المرحلة ٢: الأسئلة المقالية والبرهان بلا حلول): ${branchSpec.nameArabic} | ${config.gradeNameArabic}.`,
      `🎯 النطاق الحصري: [${unitsList}] | العدد الإلزامي الحرفي: (${essayCount}) مسائل مقالية وبراهين متنوعة الأفكار (بدون كتابة الحلول هنا؛ الحلول في المرحلة ٣).`,
      sharedRules,
      `📐 قالب الإخراج الإلزامي للمرحلة ٢ (من [1] حتى [${essayCount}]):`,
      "[1] [نص المسألة المقالية الأولى بالمعطيات والمطلوب، ومعه [رسم هندسي: ...] إن لزم]",
      "[2] [نص المسألة المقالية الثانية بالمعطيات والمطلوب]",
    ].join("\n");
  }

  const stage2Summary =
    config.extractedStage2EssayQuestions && config.extractedStage2EssayQuestions.length > 0
      ? `📌 مسائل المرحلة ٢ المطلوب حلها: ${config.extractedStage2EssayQuestions.join(" | ")}.`
      : `📌 اكتب الحل النموذجي للمسائل المقالية الـ (${essayCount}) الصادرة في المرحلة ٢ من [1] حتى [${essayCount}].`;

  return [
    `${scopeLabel} (المرحلة ٣: إجابات مقالي المرحلة ٢): ${branchSpec.nameArabic} | ${config.gradeNameArabic}.`,
    stage2Summary,
    sharedRules,
    "📐 قالب الإخراج الإلزامي للمرحلة ٣:",
    "حل السؤال [1]:",
    "خطوات الحل: [الخطوة ١ | الخطوة ٢ | الخطوة ٣]",
    "الناتج النهائي: [الناتج داخل $...$ بالوحدة]",
  ].join("\n");
}
