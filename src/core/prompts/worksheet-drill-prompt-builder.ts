/**
 * @file worksheet-drill-prompt-builder.ts
 * @description مولد برومبت ورقة العمل والتطبيق السريع في صفحة A4 واحدة (One-Page Worksheet Drill).
 * مصمم لتوليد حزمة أسئلة مركزة وعالية الكثافة تناسب التوزيع في الحصة أو التقويم السريع.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
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

  return [
    `المهمة: إعداد ورقة عمل تطبيقية سريعة (شيت صفحة A4 واحدة) لدرس (${config.lessonTitleArabic}) في فرع (${branchSpec.nameArabic}) - ${config.gradeNameArabic}.`,
    `• زمن الحل المستهدف: ${config.durationMinutes} دقيقة`,
    `• ميزانية المساحة: مصممة لتُطبع في صفحة A4 واحدة فقط بنظام العمودين المضغوط.`,
    "",
    "📊 توزيع الأسئلة المطلوب في ورقة العمل:",
    `- عدد (${config.quickMcqCount}) أسئلة اختيار من متعدد سريعة ومركزة (بدائل قصيرة تناسب ٤ أعمدة في سطر واحد).`,
    `- عدد (${config.quickEssayCount}) مسائل تطبيقية أو برهان قصير مباشر على الفكرة الأساسية للدرس.`,
    "",
    buildSharedMathInvariantsPromptBlock({
      branchId: config.branchId,
      notationLanguage: config.notationLanguage,
    }),
  ].join("\n");
}
