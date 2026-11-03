/**
 * @file worksheet-drill-prompt-builder.ts
 * @description مولد برومبت ورقة العمل والتطبيق السريع المعتمد وفق الرؤية التربوية المتقدمة:
 * 1. اسم الدرس ونطاق المنهج المستهدف
 * 2. فكرة عامة عن الدرس وما سوف يستفيده الطالب كمعلومة سريعة
 * 3. جميع قوانين الدرس معمولة بذكاء وليس بجفاء (مقولة لفظية منطقية بالعربية + القانون الرمزي الرياضي + سر الحل)
 * 4. مثال واحد لكل فكرة أساسية وحل سريع نموذجي ومختصر له
 * 5. بنك تدريبات ورقة العمل بالأعداد الحرفية المطلوبة كتابة (اختر ومقالي).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 90 سطراً).
 */

import type { MathBranchId } from "../ssot/math-branches-ssot";
import { MATH_BRANCHES_SSOT } from "../ssot/math-branches-ssot";
import type { MathNotationLanguage } from "../ssot/numeral-and-unit-ssot";
import { buildSharedMathInvariantsPromptBlock } from "./shared-math-prompt-invariants";

export const MODULE_ID_WORKSHEET_DRILL_PROMPT_BUILDER =
  "worksheet_drill_prompt_builder" as const;

export interface WorksheetDrillPromptConfig {
  readonly gradeNameArabic: string;
  readonly branchId: MathBranchId;
  readonly lessonTitleArabic: string;
  readonly targetedScopeArabic?: string;
  readonly quickMcqCount: number;
  readonly quickEssayCount: number;
  readonly durationMinutes: number;
  readonly includeAnswerLines?: boolean;
  readonly notationLanguage?: MathNotationLanguage;
  readonly customDirectivesArabic?: string;
}

export function buildWorksheetDrillNotebookLMPrompt(
  config: WorksheetDrillPromptConfig
): string {
  const branchSpec = MATH_BRANCHES_SSOT[config.branchId];
  const totalQ = config.quickMcqCount + config.quickEssayCount;
  const notationLang = config.notationLanguage ?? "english";
  const scopeText = config.targetedScopeArabic?.trim() || config.lessonTitleArabic;

  const customRule = config.customDirectivesArabic?.trim()
    ? `💡 توجيهات خاصة: ${config.customDirectivesArabic.trim()}`
    : undefined;

  return [
    `ورقة عمل وتطبيق (${config.durationMinutes} د): ${branchSpec.nameArabic} | ${config.gradeNameArabic}.`,
    `🎯 النطاق: [${scopeText}].`,
    `📊 التدريبات: (${config.quickMcqCount}) اختر + (${config.quickEssayCount}) مقالي.`,
    ...(customRule ? [customRule] : []),
    buildSharedMathInvariantsPromptBlock({
      branchId: config.branchId,
      notationLanguage: notationLang,
      lessonTitleArabic: config.lessonTitleArabic,
    }),
    "📐 هيكل ورقة العمل لـ NotebookLM:",
    "=== [WORKSHEET_CORE] ===",
    `اسم_الدرس: ${scopeText}`,
    "الفكرة_العامة: [سطران: فائدة الدرس الحياتية والامتحانية للطالب]",
    "القوانين_الذكية:",
    "- القانون: [الاسم] | المقولة_اللفظية: [المقولة البلاغية] | الصيغة_الرياضية: [$القانون$] | سر_الحل: [فخ شائع]",
    "=== [CONCEPT_EXAMPLE: 1] | عنوان_الفكرة: [عنوان الفكرة] ===",
    "المثال: [نص المثال في $...$] | الرسم: [[رسم هندسي: ...] إن وجد] | الحل_السريع: [الخطوات بـ |]",
    "=== [QUESTION: رقم_السؤال] | النوع: [MCQ أو ESSAY] | الدرجة: [الدرجة] ===",
    "النص: [نص السؤال في $...$]",
    "الرسم: [[رسم هندسي: ...] إن لزم وإلا فارغ]",
    "البدائل: (أ) ... | (ب) ... | (جـ) ... | (د) ... (لـ MCQ)",
    "الإجابة_الصحيحة: [البديل أو الناتج] | البرهان_والخطوات: [خطوات الحل مفصولة بـ |]",
  ].join("\n");
}
