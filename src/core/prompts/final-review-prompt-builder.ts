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
  readonly targetedScopeArabic?: string;
  readonly totalReviewQuestionsCount: number;
  readonly mcqCount?: number;
  readonly essayCount?: number;
  readonly notationLanguage?: MathNotationLanguage;
  readonly extractedStage2EssayQuestions?: readonly string[];
  readonly customDirectivesArabic?: string;
}

export function extractEssayQuestionsFromReviewStage2Reply(
  stage2Raw: string
): readonly string[] {
  if (!stage2Raw || !stage2Raw.trim()) return [];
  const results: string[] = [];
  for (const line of stage2Raw.split(/\r?\n/)) {
    const clean = line.replace(/\*\*/g, "").trim();
    if (/^(?:#\d+\b|\[\d+\]|\d+[.)-]|السؤال\s+|===\s*\[QUESTION:\s*\d+\])/i.test(clean)) {
      results.push(clean.slice(0, 40));
    }
  }
  if (results.length === 0) {
    const paragraphs = stage2Raw
      .split(/(?:\r?\n)\s*(?:\r?\n)+/)
      .map((p) => p.replace(/\*\*/g, "").trim())
      .filter((p) => p.length > 12 && !/^(?:المرحلة|التعليمات|الهيكل|ملاحظات)/i.test(p));
    for (const p of paragraphs) {
      results.push(p.slice(0, 40));
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
    config.targetedScopeArabic?.trim() ||
    (config.coveredUnitsTitlesArabic.length > 0
      ? config.coveredUnitsTitlesArabic.join(" ، ")
      : "جميع وحدات المنهج المقررة");

  const customRule = config.customDirectivesArabic?.trim()
    ? `💡 توجيهات المعلم الخاصة: ${config.customDirectivesArabic.trim()}`
    : undefined;

  const sharedRules = buildSharedMathInvariantsPromptBlock({
    branchId: config.branchId,
    notationLanguage: config.notationLanguage,
    unitTitleArabic: unitsList,
  });

  if (stage === 1) {
    return [
      `${scopeLabel} (المرحلة ١: اختر وإجابتها): ${branchSpec.nameArabic} | ${config.gradeNameArabic}.`,
      `🎯 النطاق: [${unitsList}] | العدد الإلزامي: (${mcqCount}) سؤال [اختر] بلا تكرار.`,
      `🎲 التوزيع: وزّع الإجابة الصحيحة عشوائياً بين (أ، ب، جـ، د) ~25% لكل حرف؛ يُمنع حصر (أ) أو التكرار > سؤالين.`,
      `🔢 الترقيم والترتيب: ابدأ بـ #1 ثم #2 ... حتى #${mcqCount} (يُمنع [1])، مرتبةً بتسلسل الوحدات وتدرج الصعوبة.`,
      ...(customRule ? [customRule] : []),
      sharedRules,
      `📐 قالب الإخراج (من #1 حتى #${mcqCount}):`,
      "#1 [نص السؤال كاملاً، ومعه [رسم هندسي: ...] إن لزم]",
      "(أ) [الخيار ١]",
      "(ب) [الخيار ٢]",
      "(جـ) [الخيار ٣]",
      "(د) [الخيار ٤]",
      "الإجابة الصحيحة: ([أ/ب/جـ/د عشوائياً]) [الإجابة المعتمدة]",
    ].join("\n");
  }

  if (stage === 2) {
    return [
      `${scopeLabel} (المرحلة ٢: المقالي والبرهان بلا حلول): ${branchSpec.nameArabic} | ${config.gradeNameArabic}.`,
      `🎯 النطاق: [${unitsList}] | العدد الإلزامي: (${essayCount}) مسائل مقالية وبراهين (الحلول في المرحلة ٣ فقط).`,
      `🔢 الترقيم والترتيب: #1 ثم #2 ... حتى #${essayCount} (يُمنع [1])، مرتبةً بتسلسل الوحدات وتدرج الصعوبة.`,
      ...(customRule ? [customRule] : []),
      sharedRules,
      `📐 قالب الإخراج (من #1 حتى #${essayCount}):`,
      "#1 [نص المسألة بالمعطيات والمطلوب، ومعه [رسم هندسي: ...] إن لزم]",
      "#2 [نص المسألة الثانية بالمعطيات والمطلوب]",
    ].join("\n");
  }

  const stage2Summary =
    config.extractedStage2EssayQuestions && config.extractedStage2EssayQuestions.length > 0
      ? `📌 مسائل المرحلة ٢ المطلوب حلها: ${config.extractedStage2EssayQuestions.join(" | ")}.`
      : `📌 اكتب الحل النموذجي للمسائل المقالية الـ (${essayCount}) الصادرة في المرحلة ٢ بالترتيب من #1 حتى #${essayCount}.`;

  return [
    `${scopeLabel} (المرحلة ٣: إجابات مقالي المرحلة ٢): ${branchSpec.nameArabic} | ${config.gradeNameArabic}.`,
    stage2Summary,
    `🔢 الترقيم الإلزامي: اكتب رقم المسألة بعلامة # في ترويسة كل حل بوضوح: حل السؤال #1: ثم حل السؤال #2: ... حتى #${essayCount} (يُمنع [1]).`,
    sharedRules,
    "📐 قالب الإخراج الإلزامي للمرحلة ٣:",
    "حل السؤال #1:",
    "خطوات الحل: [الخطوة ١ | الخطوة ٢ | الخطوة ٣]",
    "الناتج النهائي: [الناتج داخل $...$ بالوحدة]",
  ].join("\n");
}
