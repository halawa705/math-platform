/**
 * @file booklet-three-stages-prompt-builder.ts
 * @description مولد برومبتات المذكرة الدراسية الشاملة بالمراحل الثلاث المترابطة (التي تقرأ ما قبلها كما في النظام المرجعي):
 * - المرحلة 1: استخراج وتفنيط أفكار الدرس + المفهوم الرياضي + القاعدة الرياضية + الأمثلة المحلولة بالخطوات الكاملة.
 * - المرحلة 2: تقرأ الأفكار المستخرجة من رد المرحلة 1 وتولد تدريبات الدرس (حاول بنفسك) وتمارين الواجب المنزلي بالأعداد المختارة بدون حلول.
 * - المرحلة 3 (اختيارية): تقرأ أسئلة المرحلة 2 وتولد نموذج الإجابة والحل التفصيلي لكل سؤال بمعرفه ورقمه.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
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
  readonly extractedStage1Ideas?: readonly string[];
  readonly extractedStage2Questions?: readonly string[];
}

/**
 * يقرأ رد المرحلة الأولى ويستخرج منه عناوين ومعرفات الأفكار لتغذيتها تلقائياً في برومبت المرحلة ٢ و ٣.
 */
export function extractIdeasFromBookletStage1Reply(stage1Raw: string): readonly string[] {
  if (!stage1Raw || !stage1Raw.trim()) return [];
  const found: string[] = [];
  const lines = stage1Raw.split(/\r?\n/);

  for (const line of lines) {
    const clean = line.replace(/\*\*/g, "").trim();
    const ideaMatch =
      clean.match(/^(?:الفكرة\s+[^:]+|عنوان_الفكرة)\s*:\s*(.+)$/i) ||
      clean.match(/^[-•*]?\s*(idea-\d+\s*:\s*.+)$/i);
    if (ideaMatch?.[1]) {
      const val = ideaMatch[1].trim();
      if (!found.includes(val)) found.push(val);
    }
  }
  return found;
}

/**
 * يقرأ رد المرحلة الثانية ويستخرج منه معرفات وأرقام أسئلة التدريبات والواجب لتغذيتها في برومبت المرحلة ٣.
 */
export function extractQuestionsSummaryFromBookletStage2Reply(
  stage2Raw: string
): readonly string[] {
  if (!stage2Raw || !stage2Raw.trim()) return [];
  const results: string[] = [];
  const lines = stage2Raw.split(/\r?\n/);

  for (const line of lines) {
    const clean = line.replace(/\*\*/g, "").trim();
    const idMatch = clean.match(/معرف\s*السؤال\s*:\s*((?:practice|homework)-\d+-\d+)/i);
    if (idMatch?.[1]) {
      results.push(`${idMatch[1]}: ${clean.slice(0, 75)}`);
      continue;
    }
    const bracketMatch = clean.match(/^(?:\[\d+\]|#\d+|===\s*\[QUESTION:\s*\d+\])\s*(.+)?$/i);
    if (bracketMatch) {
      results.push(clean.slice(0, 80));
    }
  }
  return results.slice(0, 30);
}

export function buildBookletStageNotebookLMPrompt(
  config: BookletStagePromptConfig
): string {
  const branchSpec = MATH_BRANCHES_SSOT[config.branchId];
  const examplesCount = config.solvedExamplesPerIdea ?? 2;
  const drillsCount = config.drillsPerIdea ?? 2;
  const hwMcq = config.homeworkMcqCount ?? 4;
  const hwEssay = config.homeworkEssayCount ?? 2;
  const totalHw = hwMcq + hwEssay;

  const sharedRules = buildSharedMathInvariantsPromptBlock({
    branchId: config.branchId,
    notationLanguage: config.notationLanguage,
  });

  if (config.stageNumber === 1) {
    return [
      `المرحلة 1 — شرح الأفكار والقوانين والأمثلة المحلولة فقط.`,
      `المادة: الرياضيات (${branchSpec.nameArabic}) | الصف: ${config.gradeNameArabic}`,
      `الوحدة: ${config.unitTitleArabic} | الدرس: ${config.lessonTitleArabic}`,
      "",
      "🎯 قاعدة تفكيك وتفنيط الأفكار والأمثلة في المرحلة 1:",
      "- افحص المصادر المرفوعة عن هذا الدرس حصراً، وافصل كل مفهوم أو قانون أو نوع مسائل في فكرة مستقلة متدرجة (تأسيسي، متوسط، متقدم، متفوقين).",
      `- لكل فكرة: اكتب شرحاً موجزاً للمفهوم، ثم القاعدة الرياضية في سطر مستقل، ثم اكتب عدد (${examplesCount}) أمثلة محلولة كاملة بالخطوات الرأسية والناتج النهائي.`,
      "- يُحظر في المرحلة 1 كتابة «حاول بنفسك» أو الواجب المنزلي (سيتم طلبها في المرحلة 2).",
      "",
      sharedRules,
      "",
      "📐 الهيكل الإلزامي لكل فكرة في المرحلة 1 (كرره لجميع أفكار الدرس دون توقف):",
      "الفكرة الأولى: [عنوان الفكرة ومستواها] | نوع المسألة: [اختر / أكمل / مقالي] | معرف الفكرة: idea-01",
      "مفهوم الفكرة: [شرح نظري موجز وواضح]",
      "القاعدة الرياضية: [القانون أو النظرية بالرموز داخل $...$]",
      "المثال 1 | معرف المثال: example-01-01",
      "نص المسألة: [اكتب نص المسألة كاملاً بالمعطيات والمطلوب، ومعه [رسم هندسي: ...] إن احتاجت شكلاً]",
      "خطوات الحل:",
      "1. [الخطوة الأولى]",
      "2. [الخطوة الثانية والتعويض]",
      "الناتج النهائي: [الناتج النهائي داخل $...$ مع الوحدة]",
      "نهاية الفكرة الأولى",
    ].join("\n");
  }

  const ideasBlock =
    config.extractedStage1Ideas && config.extractedStage1Ideas.length > 0
      ? [
          "📌 الأفكار المستهدفة المستخرجة من المرحلة 1 (التزم بها كاملة بالترتيب):",
          ...config.extractedStage1Ideas.map((idText, idx) => `- idea-0${idx + 1}: ${idText}`),
        ].join("\n")
      : "📌 الأفكار المستهدفة: التزم بجميع أفكار الدرس التي شرحتها في المرحلة 1 بالترتيب (idea-01, idea-02, ...).";

  if (config.stageNumber === 2) {
    return [
      `المرحلة 2 — تدريبات الدرس (حاول بنفسك) وتمارين الواجب المنزلي بلا حلول.`,
      `المادة: الرياضيات (${branchSpec.nameArabic}) | الصف: ${config.gradeNameArabic} | الدرس: ${config.lessonTitleArabic}`,
      "",
      ideasBlock,
      "",
      "🎯 الأعداد المطلوبة في المرحلة 2 حسب اختيار المعلم:",
      `1. تدريبات الفهم المباشر (حاول بنفسك): أنشئ عدد (${drillsCount}) تمارين تطبيقية لكل فكرة.`,
      `2. تمارين الواجب المنزلي على هذا الدرس: أنشئ إجمالي (${totalHw}) أسئلة واجب موزعة كالتالي: عدد (${hwMcq}) أسئلة اختيار من متعدد [اختر] (لكل سؤال 4 بدائل أ، ب، جـ، د) + عدد (${hwEssay}) مسائل مقالية وبرهان [مقالي].`,
      "- لا تكتب أي خطوات حل أو إجابات في هذه المرحلة (ستُطلب الإجابات النموذجية في المرحلة 3 الاختيارية).",
      "",
      sharedRules,
      "",
      "📐 الهيكل الإلزامي للمرحلة 2:",
      "الفكرة الأولى: [العنوان] | معرف الفكرة: idea-01",
      "حاول بنفسك:",
      "[1] [نص تمرين حاول بنفسك الأول] | معرف السؤال: practice-01-01",
      "[2] [نص تمرين حاول بنفسك الثاني] | معرف السؤال: practice-01-02",
      "تمارين الواجب المنزلي:",
      "#1 [اختر] [نص سؤال الواجب] (أ) ... (ب) ... (جـ) ... (د) ... | معرف السؤال: homework-01-01",
      "#2 [مقالي] [نص مسألة الواجب المقالية] | معرف السؤال: homework-01-02",
      "نهاية الفكرة الأولى",
    ].join("\n");
  }

  const stage2QuestionsContext =
    config.extractedStage2Questions && config.extractedStage2Questions.length > 0
      ? [
          "📌 الأسئلة الصادرة في المرحلة 2 والمطلوب كتابة حلها النموذجي بالترتيب:",
          ...config.extractedStage2Questions.map((q) => `- ${q}`),
        ].join("\n")
      : "📌 استخرج من رد المرحلة 2 جميع معرفات وأرقام أسئلة (حاول بنفسك) و(الواجب المنزلي) واكتب الحل النموذجي لكل منها بالترتيب.";

  return [
    `المرحلة 3 (اختيارية) — نموذج الإجابة والحل التفصيلي لأسئلة المرحلة 2 فقط.`,
    `المادة: الرياضيات (${branchSpec.nameArabic}) | الصف: ${config.gradeNameArabic} | الدرس: ${config.lessonTitleArabic}`,
    "",
    ideasBlock,
    "",
    stage2QuestionsContext,
    "",
    "🎯 المطلوب في المرحلة 3:",
    "- لا تُعد كتابة نص السؤال؛ انسخ معرف السؤال (`practice-01-01` أو `homework-01-01` أو رقم السؤال `[1]`) واكتب تحته مباشرة خطوات الحل والناتج النهائي المعتمد.",
    "",
    sharedRules,
    "",
    "📐 الهيكل الإلزامي للمرحلة 3:",
    "نموذج إجابة | معرف الفكرة: idea-01",
    "معرف السؤال: practice-01-01",
    "خطوات الحل: [الخطوة 1 | الخطوة 2]",
    "الناتج النهائي المعتمد: $...$",
    "معرف السؤال: homework-01-01",
    "خطوات الحل: [الخطوة 1 | الخطوة 2]",
    "الناتج النهائي المعتمد: $...$",
  ].join("\n");
}
