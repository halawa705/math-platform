/**
 * @file booklet-three-stages-prompt-builder.ts
 * @description مولد برومبتات المذكرة الدراسية الشاملة بالمراحل الثلاث المترابطة (حصر ذكي شامل لأفكار الدرس أولاً ثم توليد الأمثلة والتدريبات والواجب لكل فكرة).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 175 سطراً).
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

export function extractIdeasFromBookletStage1Reply(stage1Raw: string): readonly string[] {
  if (!stage1Raw || !stage1Raw.trim()) return [];
  const byId = new Map<string, string>();
  const unnumbered: string[] = [];

  for (const line of stage1Raw.split(/\r?\n/)) {
    const clean = line.replace(/\*\*/g, "").trim();
    const indexMatch = clean.match(/^[-•*]?\s*idea-(\d+)\s*:\s*(.+)$/i);
    if (indexMatch?.[1] && indexMatch[2]) {
      const key = `idea-${indexMatch[1].padStart(2, "0")}`;
      const title = indexMatch[2].replace(/\[[^\]]*\]\s*-?\s*/g, "").replace(/^\[|\]$/g, "").trim().slice(0, 48);
      if (title && !byId.has(key)) byId.set(key, title);
      continue;
    }
    const headerMatch = clean.match(/^(?:###?\s*)?(?:الفكرة\s+[^:|]+|عنوان_الفكرة)\s*[:|]\s*(.+)$/i);
    if (headerMatch?.[1]) {
      const idInLine = clean.match(/idea-(\d+)/i)?.[1];
      const title = headerMatch[1].split("|")[0].replace(/^\[|\]$/g, "").trim().slice(0, 48);
      if (!title) continue;
      if (idInLine) {
        const key = `idea-${idInLine.padStart(2, "0")}`;
        if (!byId.has(key)) byId.set(key, title);
      } else if (!unnumbered.includes(title)) {
        unnumbered.push(title);
      }
    }
  }
  const combined = [...byId.values(), ...unnumbered];
  return combined.slice(0, 24);
}

export function extractQuestionsSummaryFromBookletStage2Reply(
  stage2Raw: string
): readonly string[] {
  if (!stage2Raw || !stage2Raw.trim()) return [];
  const results: string[] = [];
  for (const line of stage2Raw.split(/\r?\n/)) {
    const clean = line.replace(/\*\*/g, "").trim();
    const idMatch = clean.match(/معرف\s*السؤال\s*:\s*((?:practice|homework)-\d+-\d+)/i);
    if (idMatch?.[1]) {
      results.push(idMatch[1]);
      continue;
    }
    const bracketMatch = clean.match(/^(\[\d+\]|#\d+)\s*(.+)?$/i);
    if (bracketMatch?.[1]) {
      results.push(`${bracketMatch[1]} ${(bracketMatch[2] || "").slice(0, 20).trim()}`);
    }
  }
  return results.slice(0, 40);
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
    lessonTitleArabic: config.lessonTitleArabic,
    unitTitleArabic: config.unitTitleArabic,
  });

  if (config.stageNumber === 1) {
    return [
      `مذكرة الدرس (المرحلة ١: حصر الأفكار والشرح والأمثلة المحلولة): ${branchSpec.nameArabic} | ${config.gradeNameArabic} | ${config.unitTitleArabic} — درس (${config.lessonTitleArabic}).`,
      `🎯 خطة العمل: (أولاً) ابدأ بـ «فهرس أفكار الدرس:» لحصر أفكار الدرس الحقيقية من المصادر. (ثانياً) خذ كل فكرة من الفهرس بالترتيب واشرح مفهومها وقاعدتها وأورد (${examplesCount}) أمثلة محلولة عليها من المصادر (بلا حاول بنفسك أو واجب هنا):`,
      sharedRules,
      "📐 قالب الإخراج الإلزامي للمرحلة ١:",
      "فهرس أفكار الدرس:",
      "- idea-01: [نوع المسألة] - [عنوان الفكرة - المستوى: تأسيسي/متوسط/متقدم/للمتفوقين]",
      "---",
      "الفكرة الأولى: [عنوان الفكرة] | المستوى: [المستوى] | نوع المسألة: [اختر/أكمل/مقالي] | معرف الفكرة: idea-01",
      "مفهوم الفكرة: [شرح موجز]",
      "القاعدة الرياضية: [القانون داخل $...$]",
      "المثال 1 | معرف المثال: example-01-01",
      "نص المسألة: [النص، ومعه [رسم هندسي: ...] إن لزم]",
      "خطوات الحل:",
      "1. [الخطوة ١]",
      "2. [الخطوة ٢]",
      "الناتج النهائي: [الناتج بـ $...$ بالوحدة]",
      "نهاية الفكرة الأولى",
    ].join("\n");
  }

  const ideasLine =
    config.extractedStage1Ideas && config.extractedStage1Ideas.length > 0
      ? `📌 الأفكار المحصورة المطلوب توليد تدريباتها بالترتيب دون إسقاط: ${config.extractedStage1Ideas
          .map((t, i) => `idea-${String(i + 1).padStart(2, "0")}(${t})`)
          .join(" ، ")}.`
      : "📌 التزم بجميع أفكار الفهرس التي حصرتها في المرحلة ١ بالترتيب (idea-01, idea-02, ...) دون إسقاط أي فكرة.";

  if (config.stageNumber === 2) {
    return [
      `مذكرة الدرس (المرحلة ٢: حاول بنفسك + الواجب لكل فكرة بلا حلول): ${branchSpec.nameArabic} | ${config.gradeNameArabic} | درس (${config.lessonTitleArabic}).`,
      ideasLine,
      `📊 المطلوب من المصادر (بلا حلول هنا): لكل فكرة من الأفكار المحصورة أنشئ (${drillsCount}) تمارين «حاول بنفسك» تطبق نفس الفكرة + إجمالي (${totalHw}) أسئلة واجب شاملة لأفكار الدرس = (${hwMcq}) [اختر] + (${hwEssay}) [مقالي].`,
      sharedRules,
      "📐 قالب الإخراج الإلزامي للمرحلة ٢ (كرره لكل فكرة):",
      "الفكرة الأولى: [العنوان] | معرف الفكرة: idea-01",
      "حاول بنفسك:",
      "[1] [نص التمرين] | معرف السؤال: practice-01-01",
      "تمارين الواجب المنزلي:",
      "#1 [اختر] [النص] (أ) ... (ب) ... (جـ) ... (د) ... | معرف السؤال: homework-01-01",
      "#2 [مقالي] [النص] | معرف السؤال: homework-01-02",
      "نهاية الفكرة الأولى",
    ].join("\n");
  }

  const qListLine =
    config.extractedStage2Questions && config.extractedStage2Questions.length > 0
      ? `📌 الأسئلة المطلوب حلها بالترتيب: ${config.extractedStage2Questions.join(" ، ")}.`
      : "📌 اكتب الحل النموذجي لجميع أسئلة المرحلة ٢ (حاول بنفسك والواجب لجميع الأفكار) بالترتيب.";

  return [
    `مذكرة الدرس (المرحلة ٣: نموذج إجابة أسئلة المرحلة ٢): ${branchSpec.nameArabic} | ${config.gradeNameArabic} | درس (${config.lessonTitleArabic}).`,
    ideasLine,
    qListLine,
    sharedRules,
    "📐 قالب الإخراج الإلزامي للمرحلة ٣ (بدون إعادة نص السؤال):",
    "نموذج إجابة | معرف الفكرة: idea-01",
    "معرف السؤال: practice-01-01",
    "خطوات الحل: [الخطوة ١ | الخطوة ٢]",
    "الناتج النهائي المعتمد: $...$",
  ].join("\n");
}
