/**
 * @file online-exam-prompt-builder.ts
 * @description مولد برومبت الاختبار الإلكتروني التفاعلي (تصحيح آلي بالخادم) الموجه لـ NotebookLM:
 * يقتصر على أسئلة الاختيار من متعدد (MCQ) والأسئلة ذات الإجابة القصيرة الحاسمة (SHORT) مع حقل الإجابات المقبولة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
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
  const termLabel =
    config.termNumber === 1 ? "الفصل الدراسي الأول" : "الفصل الدراسي الثاني";

  const difficultyDescription =
    config.difficultyProfile === "olympiad_challenge"
      ? "مستويات تفكير عليا ومسائل مركبة للمتفوقين (٤٠٪ تطبيقي، ٦٠٪ مستويات عليا)"
      : config.difficultyProfile === "comprehensive_rigorous"
      ? "تقييم شامل ودقيق (٥٠٪ تطبيقي وتحليلي، ٣٠٪ ربط مفاهيم، ٢٠٪ مستويات عليا)"
      : "توزيع قياسي متوازن (٣٠٪ مباشر، ٥٠٪ تطبيقي، ٢٠٪ تمييز)";

  const lessonsFormatted =
    config.targetedLessonTitlesArabic.length > 0
      ? config.targetedLessonTitlesArabic.map((t, i) => `   ${i + 1}. ${t}`).join("\n")
      : "   - جميع الدروس المقررة في هذا الفرع من المصادر المرفوعة";

  return [
    `المهمة: إعداد اختبار إلكتروني تفاعلي في مادة الرياضيات (${branchSpec.nameArabic}) بالاعتماد الحصري على المصادر المرفوعة.`,
    `• الصف الدراسي: ${config.gradeNameArabic} (${termLabel})`,
    `• الزمن المخصص: ${config.durationTextArabic} | الدرجة الكلية: ${config.totalMarks} درجة`,
    `• مستوى العمق التربوي: ${difficultyDescription}`,
    "",
    "📚 الدروس المستهدفة في الاختبار:",
    lessonsFormatted,
    "",
    "📊 هيكل وتوزيع أسئلة الاختبار الإلكتروني:",
    `- القسم الأول (الاختيار من متعدد MCQ): عدد (${config.mcqQuestionsCount}) سؤالاً، لكل سؤال ٤ بدائل (أ، ب، جـ، د).`,
    `- القسم الثاني (إجابة قصيرة SHORT): عدد (${config.shortAnswerQuestionsCount}) سؤالاً.`,
    "",
    buildSharedMathInvariantsPromptBlock({
      branchId: config.branchId,
      notationLanguage: config.notationLanguage,
      lessonTitleArabic: config.targetedLessonTitlesArabic.join(" ، "),
    }),
    "",
    "هذا اختبار إلكتروني يُصحَّح آلياً. ممنوع أسئلة البرهان والمقالي. الأنواع المسموحة فقط: MCQ أو SHORT.",
    "- أسئلة SHORT: إجابتها النهائية قيمة قصيرة واحدة (عدد، كسر، جذر، مجموعة {٢، ٣}، فترة، أو كلمة قصيرة) وليست جملة.",
    "=== [QUESTION: رقم_السؤال] | النوع: [MCQ أو SHORT] | الدرس: [اسم_الدرس] | الدرجة: [عدد_الدرجات] ===",
    "النص: [نص السؤال كاملاً مع المعادلات داخل $...$]",
    "الرسم: [اتركه فارغاً أو اكتب سطور حقائق بين [رسم هندسي: ... ] كما في التعليمات]",
    "البدائل: (أ) [...] | (ب) [...] | (جـ) [...] | (د) [...]   (في MCQ فقط)",
    "الإجابة_الصحيحة: [حرف البديل في MCQ، أو القيمة النهائية في SHORT]",
    "الإجابات_المقبولة: [في SHORT فقط: كل الصيغ المكافئة مفصولة بـ | مثل: 0.5 | 1/2 | \\frac{1}{2}]",
    "البرهان_والخطوات: [خطوات الحل المختصرة]",
  ].join("\n");
}
