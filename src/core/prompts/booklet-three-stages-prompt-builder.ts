/**
 * @file booklet-three-stages-prompt-builder.ts
 * @description مولد برومبتات المذكرة الدراسية الشاملة بالمراحل الثلاث المتتابعة مع تخصيص كامل للأعداد:
 * - المرحلة 1: خريطة الأفكار التربوية، القواعد المؤطرة، والأمثلة المحلولة بالخطوات (عدد مخصص لكل فكرة).
 * - المرحلة 2: تدريبات "حاول بنفسك" وبنك تدريبات الحصة التطبيقي (عدد مخصص لكل فكرة).
 * - المرحلة 3: الواجب المنزلي الشامل للدرس (عدد مخصص لأسئلة اختر + عدد مخصص للمسائل المقالية والبرهان مع الإجابات).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import type { MathBranchId } from "../ssot/math-branches-ssot";
import { MATH_BRANCHES_SSOT } from "../ssot/math-branches-ssot";
import type { MathNotationLanguage } from "../ssot/numeral-and-unit-ssot";
import { buildSharedMathInvariantsPromptBlock } from "./shared-math-prompt-invariants";

export const MODULE_ID_BOOKLET_THREE_STAGES_PROMPT_BUILDER =
  "booklet_three_stages_prompt_builder" as const;

export type BookletPromptStageNumber = 1 | 2 | 3;

export interface BookletStagePromptConfig {
  readonly stageNumber: BookletPromptStageNumber;
  readonly gradeNameArabic: string;
  readonly termNumber: 1 | 2;
  readonly branchId: MathBranchId;
  readonly unitTitleArabic: string;
  readonly lessonTitleArabic: string;
  readonly solvedExamplesPerIdea?: number;
  readonly drillsPerIdea?: number;
  readonly homeworkMcqCount?: number;
  readonly homeworkEssayCount?: number;
  readonly notationLanguage?: MathNotationLanguage;
}

export function buildBookletStageNotebookLMPrompt(
  config: BookletStagePromptConfig
): string {
  const branchSpec = MATH_BRANCHES_SSOT[config.branchId];
  const examplesCount = config.solvedExamplesPerIdea ?? 2;
  const drillsCount = config.drillsPerIdea ?? 2;
  const hwMcq = config.homeworkMcqCount ?? 6;
  const hwEssay = config.homeworkEssayCount ?? 4;

  const sharedRules = buildSharedMathInvariantsPromptBlock({
    branchId: config.branchId,
    notationLanguage: config.notationLanguage,
  });

  if (config.stageNumber === 1) {
    return [
      `المهمة [المرحلة 1 من 3 - بناء الشرح والأمثلة المحلولة]: تفكيك درس (${config.lessonTitleArabic}) في فرع (${branchSpec.nameArabic}) - ${config.gradeNameArabic} من المصادر المرفوعة.`,
      `• الوحدة الدراسية: ${config.unitTitleArabic}`,
      "",
      "🎯 المطلوب في المرحلة الأولى (الشرح والأمثلة المحلولة):",
      "1. استخراج ملخص القوانين والنظريات الأساسية للدرس في نقاط مركزة.",
      "2. تقسيم الدرس إلى أفكار تربوية متدرجة (`[IDEA: 1]`, `[IDEA: 2]`, ...).",
      `3. تحت كل فكرة: اشرح المفهوم بوضوح، ثم ضع القاعدة أو منطوق النظرية داخل \`[صندوق القاعدة: ...]\`، ثم أورد عدد (${examplesCount}) أمثلة محلولة بالخطوات الكاملة لكل فكرة.`,
      "",
      sharedRules,
      "",
      "📐 هيكل الإخراج القياسي للمرحلة الأولى:",
      "=== [QUESTION: رقم] | النوع: ESSAY | الدرس: " + config.lessonTitleArabic + " | الدرجة: 3 ===",
      "النص: [عنوان الفكرة + نص المثال المحلول]",
      "الرسم: [وصف الشكل داخل [رسم هندسي: ...] إن لزم]",
      "الإجابة_الصحيحة: [الناتج النهائي]",
      "البرهان_والخطوات: [شرح القاعدة متبوعاً بالخطوات المتسلسلة للحل]",
    ].join("\n");
  }

  if (config.stageNumber === 2) {
    return [
      `المهمة [المرحلة 2 من 3 - تدريبات الفهم والتطبيق (حاول بنفسك)]: بناء التمارين التطبيقية لدرس (${config.lessonTitleArabic}) في فرع (${branchSpec.nameArabic}) - ${config.gradeNameArabic}.`,
      "",
      "🎯 المطلوب في المرحلة الثانية (تدريبات الحصة):",
      `1. لكل فكرة من أفكار الدرس: أورد عدد (${drillsCount}) تدريبات تطبيقية متدرجة تحت مسمى (تدريب تطبيقي / حاول بنفسك).`,
      "2. نوّع بين أسئلة الاختيار من متعدد (MCQ) ومسائل التطبيق والبرهان.",
      "",
      sharedRules,
      "",
      "📐 هيكل الإخراج القياسي للمرحلة الثانية:",
      "=== [QUESTION: رقم] | النوع: [MCQ أو PROOF أو ESSAY] | الدرس: " + config.lessonTitleArabic + " | الدرجة: 2 ===",
      "النص: [نص التدريب التطبيقي]",
      "الرسم: [وصف الشكل داخل [رسم هندسي: ...] أو اتركه فارغاً]",
      "البدائل: (أ) ... | (ب) ... | (جـ) ... | (د) ... [إن كان MCQ]",
      "الإجابة_الصحيحة: [الإجابة النموذجية]",
      "البرهان_والخطوات: [خطوات الحل الإرشادية للمعلم]",
    ].join("\n");
  }

  return [
    `المهمة [المرحلة 3 من 3 - الواجب المنزلي الشامل للدرس]: إعداد قسم الواجب المنزلي لدرس (${config.lessonTitleArabic}) في فرع (${branchSpec.nameArabic}) - ${config.gradeNameArabic}.`,
    "",
    "🎯 توزيع أسئلة الواجب المنزلي المطلوب بدقة:",
    `- أولاً: عدد (${hwMcq}) أسئلة اختيار من متعدد (MCQ) شاملة لأفكار الدرس.`,
    `- ثانياً: عدد (${hwEssay}) مسائل مقالية / برهان استدلالي متدرجة من المباشر إلى المستويات العليا.`,
    "- أرفق مع كل سؤال الإجابة الصحيحة وخطوات الحل النموذجية.",
    "",
    sharedRules,
    "",
    "📐 هيكل الإخراج القياسي للمرحلة الثالثة (الواجب):",
    "=== [QUESTION: رقم] | النوع: [MCQ أو PROOF أو ESSAY] | الدرس: " + config.lessonTitleArabic + " | الدرجة: 2 ===",
    "النص: [نص سؤال الواجب]",
    "الرسم: [وصف الشكل داخل [رسم هندسي: ...] أو اتركه فارغاً]",
    "البدائل: (أ) ... | (ب) ... | (جـ) ... | (د) ... [لأسئلة MCQ]",
    "الإجابة_الصحيحة: [الإجابة الصحيحة]",
    "البرهان_والخطوات: [خطوات الحل الكاملة]",
  ].join("\n");
}
