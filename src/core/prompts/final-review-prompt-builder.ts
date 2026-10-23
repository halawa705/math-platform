/**
 * @file final-review-prompt-builder.ts
 * @description مولد برومبتات المراجعة النهائية الشاملة (كبسولة ليلة الامتحان) ومراجعات الشهور لـ NotebookLM
 * بنظام المراحل الثلاث المتتابعة مع تخصيص عدد أسئلة اختر وعدد المسائل المقالية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
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
      ? "كبسولة المراجعة النهائية الشاملة وليلة الامتحان"
      : "مراجعة مقرر الشهر المركزة";

  const unitsList =
    config.coveredUnitsTitlesArabic.length > 0
      ? config.coveredUnitsTitlesArabic
          .map((u, idx) => `   ${idx + 1}. ${u}`)
          .join("\n")
      : "   - جميع وحدات المنهج المقررة في المصدر المرفوع";

  const sharedRules = buildSharedMathInvariantsPromptBlock({
    branchId: config.branchId,
    notationLanguage: config.notationLanguage,
  });

  if (stage === 1) {
    return [
      `المهمة [المرحلة 1 من 3 - كبسولة القوانين والنظريات]: إعداد ملخص القوانين والمفاهيم الأساسية لـ (${scopeLabel}) في فرع (${branchSpec.nameArabic}) - ${config.gradeNameArabic}.`,
      "",
      "📦 الوحدات المشمولة في المراجعة:",
      unitsList,
      "",
      "🎯 المطلوب في المرحلة الأولى:",
      "1. تجميع مكثف لجميع القوانين والنظريات والنتائج الهندسية أو الجبرية للوحدات المحددة.",
      "2. إقران كل قانون بمثال تطبيقي مباشر سريع يوضح كيفية استخدامه.",
      "",
      sharedRules,
    ].join("\n");
  }

  if (stage === 2) {
    return [
      `المهمة [المرحلة 2 من 3 - بنك أسئلة الاختيار من متعدد]: إعداد أهم أسئلة اختر لـ (${scopeLabel}) في فرع (${branchSpec.nameArabic}) - ${config.gradeNameArabic}.`,
      "",
      "📦 الوحدات المشمولة:",
      unitsList,
      "",
      `🎯 المطلوب في المرحلة الثانية: توليد عدد (${mcqCount}) سؤال اختيار من متعدد (MCQ) تغطي كافة الأفكار المتكررة في الامتحانات الرسمية للمصادر المرفوعة.`,
      "",
      sharedRules,
      "",
      "📐 هيكل الإخراج القياسي لكل سؤال:",
      "=== [QUESTION: رقم] | النوع: MCQ | الدرس: مراجعة شاملة | الدرجة: 1 ===",
      "النص: [نص السؤال]",
      "الرسم: [وصف الشكل داخل [رسم هندسي: ...] أو اتركه فارغاً]",
      "البدائل: (أ) ... | (ب) ... | (جـ) ... | (د) ...",
      "الإجابة_الصحيحة: [البديل الصحيح]",
      "البرهان_والخطوات: [سبب الاختيار بخطوات مختصرة]",
    ].join("\n");
  }

  return [
    `المهمة [المرحلة 3 من 3 - مسائل البرهان والمقال الحاسمة]: إعداد أهم المسائل المقالية لـ (${scopeLabel}) في فرع (${branchSpec.nameArabic}) - ${config.gradeNameArabic}.`,
    "",
    "📦 الوحدات المشمولة:",
    unitsList,
    "",
    `🎯 المطلوب في المرحلة الثالثة: توليد عدد (${essayCount}) مسائل مقالية / برهان استدلالي شاملة لأهم أفكار الامتحانات مع الحلول النموذجية الكاملة بالخطوات.`,
    "",
    sharedRules,
    "",
    "📐 هيكل الإخراج القياسي لكل مسألة:",
    "=== [QUESTION: رقم] | النوع: PROOF | الدرس: مراجعة شاملة | الدرجة: 4 ===",
    "النص: [نص المسألة المقالية أو البرهان]",
    "الرسم: [وصف الشكل داخل [رسم هندسي: ...] إن وجد]",
    "الإجابة_الصحيحة: [الناتج النهائي أو المطلوب إثباته]",
    "البرهان_والخطوات: [خطوات الحل أو البرهان بالتفصيل]",
  ].join("\n");
}
