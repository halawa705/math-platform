/**
 * @file final-review-prompt-builder.ts
 * @description مولد برومبتات المراجعة النهائية الشاملة ومراجعات الشهور لـ NotebookLM بالمراحل الثلاث المترابطة:
 * - المرحلة 1: أسئلة الاختيار من متعدد (MCQ) وإجابتها الصحيحة مباشرة تحت كل سؤال.
 * - المرحلة 2: الأسئلة المقالية والبرهان الاستدلالي (بدون حلول لضمان عدم بتر الرد).
 * - المرحلة 3 (اختيارية): تقرأ أسئلة المرحلة 2 المقالية وتولد إجاباتها النموذجية الكاملة بالخطوات.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 190 سطراً).
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

/**
 * يستخرج ملخص الأسئلة المقالية الصادرة في رد المرحلة 2 لتغذيتها تلقائياً في برومبت المرحلة 3.
 */
export function extractEssayQuestionsFromReviewStage2Reply(
  stage2Raw: string
): readonly string[] {
  if (!stage2Raw || !stage2Raw.trim()) return [];
  const results: string[] = [];
  const lines = stage2Raw.split(/\r?\n/);

  for (const line of lines) {
    const clean = line.replace(/\*\*/g, "").trim();
    if (/^(?:\[\d+\]|\d+[.)-]|السؤال\s+|===\s*\[QUESTION:\s*\d+\])/i.test(clean)) {
      results.push(clean.slice(0, 90));
    }
  }
  return results.slice(0, 30);
}

export function buildFinalReviewNotebookLMPrompt(
  config: FinalReviewPromptConfig
): string {
  const branchSpec = MATH_BRANCHES_SSOT[config.branchId];
  const stage = config.stageNumber ?? 1;
  const mcqCount =
    config.mcqCount ?? Math.ceil(config.totalReviewQuestionsCount * 0.6);
  const essayCount =
    config.essayCount ?? Math.floor(config.totalReviewQuestionsCount * 0.4);

  const scopeLabel =
    config.reviewScope === "final_exam_night_capsule"
      ? "المراجعة النهائية الشاملة وليلة الامتحان"
      : "مراجعة مقرر الشهر المركزة";

  const unitsList =
    config.coveredUnitsTitlesArabic.length > 0
      ? config.coveredUnitsTitlesArabic.join(" ، ")
      : "جميع وحدات المنهج المقررة في المصدر المرفوع";

  const sharedRules = buildSharedMathInvariantsPromptBlock({
    branchId: config.branchId,
    notationLanguage: config.notationLanguage,
    unitTitleArabic: unitsList,
  });

  if (stage === 1) {
    return [
      `المراجعة النهائية الشاملة — المرحلة 1 (أسئلة الاختيار من متعدد وإجابتها):`,
      `المادة: الرياضيات (${branchSpec.nameArabic}) | الصف: ${config.gradeNameArabic}`,
      `نطاق المراجعة المستهدف: ${unitsList} (${scopeLabel})`,
      "",
      "🎯 التعليمات والضوابط الإلزامية للمرحلة 1:",
      `1. صغ بدقة عدد (${mcqCount}) سؤال اختيار من متعدد [اختر] حصراً، تغطي كافة دروس المراجعة بتوازن وشمولية لأهم أفكار امتحانات المحافظات والكتاب المدرسي.`,
      "2. لكل سؤال 4 بدائل واضحة ومستقلة: (أ)، (ب)، (جـ)، (د).",
      "3. ⚠️ قاعدة الإجابة الإلزامية في المرحلة 1: اكتب مباشرة تحت كل سؤال السطر التالي:",
      "«الإجابة الصحيحة: (الحرف) نص الإجابة»",
      "",
      sharedRules,
      "",
      "📐 الهيكل الإلزامي لكل سؤال في المرحلة 1 (ابدأ مباشرة بالسؤال [1] حتى [" + mcqCount + "]):",
      "[1] [نص السؤال الأول كاملاً بوضوح ودقة]",
      "(أ) [الخيار الأول]",
      "(ب) [الخيار الثاني]",
      "(جـ) [الخيار الثالث]",
      "(د) [الخيار الرابع]",
      "الإجابة الصحيحة: (أ) [نص الإجابة المعتمدة]",
    ].join("\n");
  }

  if (stage === 2) {
    return [
      `المراجعة النهائية الشاملة — المرحلة 2 (الأسئلة المقالية والبرهان بدون حلول):`,
      `المادة: الرياضيات (${branchSpec.nameArabic}) | الصف: ${config.gradeNameArabic}`,
      `نطاق المراجعة المستهدف: ${unitsList} (${scopeLabel})`,
      "",
      "🎯 التعليمات والضوابط الإلزامية للمرحلة 2:",
      `1. صغ بدقة عدد (${essayCount}) مسائل مقالية وتطبيقية وبراهين شاملة لأهم مسائل الامتحانات عن الوحدات المحددة.`,
      "2. ⚠️ إلزام حاسم لتجزئة الرد: اكتب في هذه المرحلة نصوص المسائل المقالية والمعطيات والمطلوب فقط (مع وسم [رسم هندسي: ...] إن احتاجت شكلاً). لا تكتب خطوات الحل في هذه المرحلة لأن الحلول التفصيلية ستُطلب في المرحلة 3.",
      "",
      sharedRules,
      "",
      "📐 الهيكل الإلزامي للمرحلة 2 (ابدأ مباشرة بالسؤال [1] حتى [" + essayCount + "]):",
      "[1] [نص المسألة المقالية الأولى كاملاً مع المعطيات والمطلوب بدقة]",
      "[2] [نص المسألة المقالية الثانية كاملاً مع المعطيات والمطلوب بدقة]",
    ].join("\n");
  }

  const stage2ListBlock =
    config.extractedStage2EssayQuestions && config.extractedStage2EssayQuestions.length > 0
      ? [
          "📌 المسائل المقالية الصادرة في المرحلة 2 والمطلوب كتابة إجاباتها النموذجية بالترتيب:",
          ...config.extractedStage2EssayQuestions.map((q) => `- ${q}`),
        ].join("\n")
      : `📌 اكتب نموذج الإجابة والحل الكامل لجميع المسائل المقالية الـ (${essayCount}) التي أنتجتها في المرحلة 2 بالترتيب من [1] حتى [${essayCount}].`;

  return [
    `المراجعة النهائية الشاملة — المرحلة 3 (اختيارية — إجابات الأسئلة المقالية للمرحلة 2):`,
    `المادة: الرياضيات (${branchSpec.nameArabic}) | الصف: ${config.gradeNameArabic}`,
    "",
    stage2ListBlock,
    "",
    "🎯 التعليمات والضوابط الإلزامية للمرحلة 3:",
    "1. لكل مسألة مقالية من المرحلة 2: اذكر رقمها بوضوح «حل السؤال [الرقم]:» ثم اكتب خطوات الحل أو البرهان الاستدلالي (بما أن $\\because$ ... إذن $\\therefore$ ...) والناتج النهائي المعتمد.",
    "",
    sharedRules,
    "",
    "📐 الهيكل الإلزامي للمرحلة 3:",
    "حل السؤال [1]:",
    "خطوات الحل: [الخطوة الأولى | الخطوة الثانية | الخطوة الثالثة]",
    "الناتج النهائي: [الناتج النهائي داخل $...$ مع الوحدة]",
    "حل السؤال [2]:",
    "خطوات الحل: [الخطوة الأولى | الخطوة الثانية]",
    "الناتج النهائي: [الناتج النهائي داخل $...$ مع الوحدة]",
  ].join("\n");
}
