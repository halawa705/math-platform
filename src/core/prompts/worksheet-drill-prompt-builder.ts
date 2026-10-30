/**
 * @file worksheet-drill-prompt-builder.ts
 * @description مولد برومبت ورقة العمل والتطبيق السريع والواجب التفاعلي (مكثف < 1450 حرفاً وحازم في العدد والنطاق وتنوع الأفكار وترتيب المصادر).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 85 سطراً).
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
  readonly quickMcqCount: number;
  readonly quickEssayCount: number;
  readonly durationMinutes: number;
  readonly notationLanguage?: MathNotationLanguage;
}

export function buildWorksheetDrillNotebookLMPrompt(
  config: WorksheetDrillPromptConfig
): string {
  const branchSpec = MATH_BRANCHES_SSOT[config.branchId];
  const totalQ = config.quickMcqCount + config.quickEssayCount;

  return [
    `ورقة عمل وواجب تطبيقي (${config.durationMinutes} د): ${branchSpec.nameArabic} | ${config.gradeNameArabic}.`,
    `🎯 الدرس المستهدف حصراً (ممنوع الخروج عنه): [${config.lessonTitleArabic}].`,
    `📊 الأعداد الحرفية الإلزامية (إجمالي ${totalQ} أسئلة متنوعة الأفكار بلا تكرار): (${config.quickMcqCount}) اختر [MCQ] + (${config.quickEssayCount}) مقالي/برهان قصير [ESSAY].`,
    buildSharedMathInvariantsPromptBlock({
      branchId: config.branchId,
      notationLanguage: config.notationLanguage,
      lessonTitleArabic: config.lessonTitleArabic,
    }),
    "📐 قالب الإخراج الإلزامي لكل سؤال:",
    "=== [QUESTION: رقم_السؤال] | النوع: [MCQ أو ESSAY] | الدرس: [اسم_الدرس] | الدرجة: [الدرجة] ===",
    "النص: [نص السؤال كاملاً بالمعادلات داخل $...$]",
    "الرسم: [[رسم هندسي: ...] إن لزم فقط وإلا فارغ]",
    "البدائل: (أ) ... | (ب) ... | (جـ) ... | (د) ... (لـ MCQ فقط)",
    "الإجابة_الصحيحة: [البديل الصحيح أو الناتج النهائي]",
    "البرهان_والخطوات: [خطوات الحل مفصولة بـ |]",
  ].join("\n");
}
