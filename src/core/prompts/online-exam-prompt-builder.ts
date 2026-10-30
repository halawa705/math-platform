/**
 * @file online-exam-prompt-builder.ts
 * @description مولد برومبت الاختبار الإلكتروني التفاعلي (مكثف وحازم في الأعداد والنطاق وتنوع الأفكار وترتيب المصادر).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 100 سطراً).
 */

import type { MathBranchId } from "../ssot/math-branches-ssot";
import { MATH_BRANCHES_SSOT } from "../ssot/math-branches-ssot";
import type { MathNotationLanguage } from "../ssot/numeral-and-unit-ssot";
import { buildSharedMathInvariantsPromptBlock } from "./shared-math-prompt-invariants";

export const MODULE_ID_ONLINE_EXAM_PROMPT_BUILDER =
  "online_exam_prompt_builder" as const;

export interface OnlineExamPromptBuilderConfig {
  readonly gradeNameArabic: string;
  readonly termNumber: 1 | 2;
  readonly branchId: MathBranchId;
  readonly targetedLessonTitlesArabic: readonly string[];
  readonly mcqQuestionsCount: number;
  readonly completionQuestionsCount?: number;
  readonly shortAnswerQuestionsCount: number;
  readonly totalMarks: number;
  readonly durationTextArabic: string;
  readonly difficultyProfile:
    | "standard_balanced"
    | "comprehensive_rigorous"
    | "olympiad_challenge";
  readonly notationLanguage?: MathNotationLanguage;
}

export function buildOnlineExamNotebookLMPrompt(
  config: OnlineExamPromptBuilderConfig
): string {
  const branchSpec = MATH_BRANCHES_SSOT[config.branchId];
  const termLabel = config.termNumber === 1 ? "ترم ١" : "ترم ٢";
  const totalQ = config.mcqQuestionsCount + config.shortAnswerQuestionsCount;

  const difficultyAr =
    config.difficultyProfile === "olympiad_challenge"
      ? "متفوقين ومستويات عليا (٤٠٪ تطبيقي، ٦٠٪ عليا)"
      : config.difficultyProfile === "comprehensive_rigorous"
        ? "شامل ودقيق (٥٠٪ تطبيقي، ٣٠٪ ربط، ٢٠٪ عليا)"
        : "متوازن قياسي (٣٠٪ مباشر، ٥٠٪ تطبيقي، ٢٠٪ تمييز)";

  const lessonsText =
    config.targetedLessonTitlesArabic.length > 0
      ? config.targetedLessonTitlesArabic.join(" ، ")
      : "دروس الفرع بالمصادر";

  return [
    `اختبار إلكتروني (تصحيح آلي): ${branchSpec.nameArabic} | ${config.gradeNameArabic} (${termLabel}) | الدرجة: ${config.totalMarks}.`,
    `🎯 النطاق الحصري: [${lessonsText}] | المستوى: ${difficultyAr}.`,
    `📊 الأعداد الحرفية (${totalQ} أسئلة، ممنوع أسئلة البرهان والمقالي): (${config.mcqQuestionsCount}) اختر [MCQ] + (${config.shortAnswerQuestionsCount}) إجابة قصيرة حاسمة [SHORT] (عدد/كسر/جذر/فترة وحيدة).`,
    buildSharedMathInvariantsPromptBlock({
      branchId: config.branchId,
      notationLanguage: config.notationLanguage,
      lessonTitleArabic: lessonsText,
    }),
    "📐 قالب الإخراج الإلزامي لكل سؤال:",
    "=== [QUESTION: رقم_السؤال] | النوع: [MCQ أو SHORT] | الدرس: [اسم_الدرس] | الدرجة: [الدرجة] ===",
    "النص: [نص السؤال بالمعادلات بـ $...$]",
    "الرسم: [[رسم هندسي: ...] إن لزم وإلا فارغ]",
    "البدائل: (أ) ... | (ب) ... | (جـ) ... | (د) ... (لـ MCQ)",
    "الإجابة_الصحيحة: [حرف البديل في MCQ، أو القيمة في SHORT]",
    "الإجابات_المقبولة: [في SHORT: الصيغ المكافئة بـ | مثل: 0.5 | 1/2 | \\frac{1}{2}]",
    "البرهان_والخطوات: [خطوات الحل بـ |]",
  ].join("\n");
}
