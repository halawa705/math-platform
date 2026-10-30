/**
 * @file official-exam-prompt-builder.ts
 * @description مولد برومبت الاختبار التقييمي الرسمي الموجه لـ NotebookLM (مكثف < 1800 حرف وحازم في الأعداد والنطاق وتنوع الأفكار وترتيب المصادر).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 100 سطر).
 */

import type { MathBranchId } from "../ssot/math-branches-ssot";
import { MATH_BRANCHES_SSOT } from "../ssot/math-branches-ssot";
import type { MathNotationLanguage } from "../ssot/numeral-and-unit-ssot";
import { buildSharedMathInvariantsPromptBlock } from "./shared-math-prompt-invariants";

export const MODULE_ID_OFFICIAL_EXAM_PROMPT_BUILDER =
  "official_exam_prompt_builder" as const;

export interface OfficialExamPromptBuilderConfig {
  readonly gradeNameArabic: string;
  readonly termNumber: 1 | 2;
  readonly branchId: MathBranchId;
  readonly targetedLessonTitlesArabic: readonly string[];
  readonly mcqQuestionsCount: number;
  readonly completionQuestionsCount?: number;
  readonly essayAndProofQuestionsCount: number;
  readonly totalMarks: number;
  readonly durationTextArabic: string;
  readonly difficultyProfile: "standard_balanced" | "comprehensive_rigorous" | "olympiad_challenge";
  readonly notationLanguage?: MathNotationLanguage;
}

export function buildOfficialExamNotebookLMPrompt(
  config: OfficialExamPromptBuilderConfig
): string {
  const branchSpec = MATH_BRANCHES_SSOT[config.branchId];
  const termLabel = config.termNumber === 1 ? "ترم ١" : "ترم ٢";
  const completionCount = config.completionQuestionsCount ?? 0;
  const totalQ = config.mcqQuestionsCount + completionCount + config.essayAndProofQuestionsCount;

  const difficultyAr =
    config.difficultyProfile === "olympiad_challenge"
      ? "متفوقين ومستويات عليا (٤٠٪ تطبيقي، ٦٠٪ عليا وبرهان)"
      : config.difficultyProfile === "comprehensive_rigorous"
        ? "شامل ودقيق (٥٠٪ تطبيقي، ٣٠٪ برهان، ٢٠٪ عليا)"
        : "متوازن رسمي (٣٠٪ مباشر، ٥٠٪ تطبيقي وبرهان، ٢٠٪ تمييز)";

  const lessonsText =
    config.targetedLessonTitlesArabic.length > 0
      ? config.targetedLessonTitlesArabic.join(" ، ")
      : "دروس الفرع بالمصادر";

  return [
    `اختبار رسمي: ${branchSpec.nameArabic} | ${config.gradeNameArabic} (${termLabel}) | الدرجة: ${config.totalMarks}.`,
    `🎯 الدروس المستهدفة حصراً (ممنوع الخروج عنها): [${lessonsText}] | المستوى: ${difficultyAr}.`,
    `📊 الأعداد الإلزامية الحرفية (إجمالي ${totalQ} أسئلة بلا زيادة أو نقصان): (${config.mcqQuestionsCount}) اختر [MCQ]${completionCount > 0 ? ` + (${completionCount}) أكمل` : ""} + (${config.essayAndProofQuestionsCount}) مقالي وبرهان [PROOF/ESSAY].`,
    buildSharedMathInvariantsPromptBlock({
      branchId: config.branchId,
      notationLanguage: config.notationLanguage,
      lessonTitleArabic: lessonsText,
    }),
    "📐 قالب الإخراج الإلزامي لكل سؤال:",
    "=== [QUESTION: رقم_السؤال] | النوع: [MCQ أو PROOF أو ESSAY] | الدرس: [اسم_الدرس] | الدرجة: [الدرجة] ===",
    "النص: [نص السؤال بالمعادلات داخل $...$]",
    "الرسم: [[رسم هندسي: ...] إن لزم وإلا فارغ]",
    "البدائل: (أ) ... | (ب) ... | (جـ) ... | (د) ... (لـ MCQ فقط)",
    "الإجابة_الصحيحة: [البديل الصحيح أو الناتج النهائي بالوحدة]",
    "البرهان_والخطوات: [خطوات الحل مفصولة بـ |]",
  ].join("\n");
}
