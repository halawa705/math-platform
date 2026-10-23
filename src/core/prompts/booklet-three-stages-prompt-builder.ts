/**
 * @file booklet-three-stages-prompt-builder.ts
 * @description مولد برومبتات المذكرة الدراسية الشاملة بالمراحل الثلاث المتتابعة:
 * - المرحلة 1: خريطة الأفكار التربوية، القواعد المؤطرة، والأمثلة المحلولة بالخطوات.
 * - المرحلة 2: تدريبات "حاول بنفسك" الموازية لكل مثال + بنك التدريبات المتدرج والواجب المنزلي.
 * - المرحلة 3: نموذج الحلول التفصيلية والبرهان الكامل لجميع تدريبات المرحلة الثانية.
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
  readonly notationLanguage?: MathNotationLanguage;
}

export function buildBookletStageNotebookLMPrompt(
  config: BookletStagePromptConfig
): string {
  const branchSpec = MATH_BRANCHES_SSOT[config.branchId];
  const sharedRules = buildSharedMathInvariantsPromptBlock({
    branchId: config.branchId,
    notationLanguage: config.notationLanguage,
  });

  if (config.stageNumber === 1) {
    return [
      `المهمة [المرحلة 1 من 3 - بناء الشرح والأمثلة المحلولة]: تفكيك درس (${config.lessonTitleArabic}) في فرع (${branchSpec.nameArabic}) - ${config.gradeNameArabic} من المصادر المرفوعة.`,
      `• الوحدة الدراسية: ${config.unitTitleArabic}`,
      "",
      "🎯 المطلوب في المرحلة الأولى:",
      "1. استخراج ملخص القوانين والنظريات الأساسية للدرس في نقاط مركزة.",
      "2. تقسيم الدرس إلى أفكار تربوية متدرجة (`[IDEA: 1]`, `[IDEA: 2]`, ...).",
      "3. تحت كل فكرة: اشرح المفهوم بوضوح، ثم ضع القاعدة أو منطوق النظرية داخل `[صندوق القاعدة: ...]`، ثم أورد مثالين محلولين بالخطوات الكاملة (`[EXAMPLE: 1.1]`).",
      "",
      sharedRules,
      "",
      "📐 هيكل الإخراج القياسي للمرحلة الأولى:",
      "=== [IDEA: رقم_الفكرة] | العنوان: [عنوان الفكرة] ===",
      "الشرح: [تمهيد نظري مركز]",
      "صندوق_القاعدة: [القانون الرياضي أو منطوق النظرية الهندسية بدقة]",
      "--- [EXAMPLE: رقم_المثال] ---",
      "المسألة: [نص المثال المحلول]",
      "الرسم: [وصف الشكل داخل [رسم هندسي: ...] إن لزم]",
      "خطوات_الحل: [الخطوات المتسلسلة حتى الناتج النهائي المؤطر]",
    ].join("\n");
  }

  if (config.stageNumber === 2) {
    return [
      `المهمة [المرحلة 2 من 3 - تدريبات الطالب والواجب المنزلي]: بناء التمارين التطبيقية لدرس (${config.lessonTitleArabic}) استكمالاً للأفكار التي تم شرحها في المرحلة الأولى.`,
      "",
      "🎯 المطلوب في المرحلة الثانية:",
      "1. لكل فكرة من أفكار المرحلة الأولى: أورد تدريبين فوريين تحت مسمى `حاول بنفسك` (`[DRILL: رقم_الفكرة.1]`).",
      "2. أعد بنك تدريبات الدرس الشامل مقسماً إلى: أسئلة اختيار من متعدد (MCQ)، ومسائل برهان وتطبيق، ومسائل مستويات عليا.",
      "3. أعد قسم الواجب المنزلي (`[HOMEWORK]`) شاملاً أهم مسائل الامتحانات الواردة في المصدر.",
      "",
      sharedRules,
    ].join("\n");
  }

  return [
    `المهمة [المرحلة 3 من 3 - نموذج الإجابة والبرهان الكامل]: إعداد الحلول التفصيلية لجميع تدريبات (حاول بنفسك) والواجب المنزلي الخاصة بدرس (${config.lessonTitleArabic}).`,
    "",
    "🎯 المطلوب في المرحلة الثالثة:",
    "1. ربط كل حل بمعرّف التدريب أو السؤال المقابل له في المرحلة الثانية (`[SOLUTION_FOR: معرف_السؤال]`).",
    "2. كتابة خطوات البرهان الاستدلالي الكاملة (بما أن ∵ ... إذن ∴ ...) وتوضيح سبب اختيار البديل الصحيح في أسئلة الاختيار من متعدد.",
    "",
    sharedRules,
  ].join("\n");
}
