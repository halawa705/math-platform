/**
 * @file official-exam-prompt-builder.ts
 * @description مولد برومبت الاختبار التقييمي الرسمي الموجه لـ NotebookLM بناءً على الفرع الرياضي
 * والوحدات والدروس المختارة من `curriculum-hierarchy-ssot.ts` وتوزيع الأسئلة والدرجات.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
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
  const termLabel =
    config.termNumber === 1 ? "الفصل الدراسي الأول" : "الفصل الدراسي الثاني";
  const completionCount = config.completionQuestionsCount ?? 0;

  const difficultyDescription =
    config.difficultyProfile === "olympiad_challenge"
      ? "مستويات تفكير عليا ومسائل مركبة للمتفوقين (٤٠٪ تطبيقي، ٦٠٪ مستويات عليا وبرهان غير مباشر)"
      : config.difficultyProfile === "comprehensive_rigorous"
      ? "تقييم شامل ودقيق (٥٠٪ تطبيقي وتحليلي، ٣٠٪ برهان وربط مفاهيم، ٢٠٪ مستويات عليا)"
      : "توزيع قياسي متوازن مطابق لمواصفات الورقة الامتحانية الرسمية (٣٠٪ مباشر، ٥٠٪ تطبيقي وبرهان، ٢٠٪ تمييز)";

  const lessonsFormatted =
    config.targetedLessonTitlesArabic.length > 0
      ? config.targetedLessonTitlesArabic.map((t, i) => `   ${i + 1}. ${t}`).join("\n")
      : "   - جميع الدروس المقررة في هذا الفرع من المصادر المرفوعة";

  return [
    `المهمة: إعداد اختبار تقييمي رسمي متكامل في مادة الرياضيات (${branchSpec.nameArabic}) بالاعتماد الحصري على المصادر المرفوعة.`,
    `• الصف الدراسي: ${config.gradeNameArabic} (${termLabel})`,
    `• الزمن المخصص: ${config.durationTextArabic} | الدرجة الكلية: ${config.totalMarks} درجة`,
    `• مستوى العمق التربوي: ${difficultyDescription}`,
    "",
    "📚 الدروس المستهدفة في الاختبار:",
    lessonsFormatted,
    "",
    "📊 هيكل وتوزيع أسئلة الاختبار المطلوب:",
    `- القسم الأول (الاختيار من متعدد): عدد (${config.mcqQuestionsCount}) سؤالاً، لكل سؤال ٤ بدائل (أ، ب، جـ، د).`,
    ...(completionCount > 0
      ? [`- القسم الثاني (أكمل ما يأتي): عدد (${completionCount}) مفردة دقيقة.`]
      : []),
    `- القسم المقالي والبرهان الاستدلالي: عدد (${config.essayAndProofQuestionsCount}) مسائل تتطلب خطوات الحل الكاملة والبرهان.`,
    "",
    buildSharedMathInvariantsPromptBlock({
      branchId: config.branchId,
      notationLanguage: config.notationLanguage,
      lessonTitleArabic: config.targetedLessonTitlesArabic.join(" ، "),
    }),
    "",
    "📐 صيغة الإخراج القياسية المطلوبة لكل سؤال (التزم بها حرفياً للاستيراد الآلي):",
    "=== [QUESTION: رقم_السؤال] | النوع: [MCQ أو PROOF أو ESSAY] | الدرس: [اسم_الدرس] | الدرجة: [عدد_الدرجات] ===",
    "النص: [نص السؤال كاملاً مع المعادلات داخل $...$]",
    "الرسم: [إن كان السؤال هندسياً يحتاج شكلاً اكتب: [رسم هندسي: وصف دقيق للشكل والرموز والأطوال] وإلا اتركه فارغاً]",
    "البدائل: (أ) [...] | (ب) [...] | (جـ) [...] | (د) [...]  (في حالة MCQ فقط)",
    "الإجابة_الصحيحة: [البديل الصحيح أو الناتج النهائي بالوحدة العربية]",
    "البرهان_والخطوات: [خطوات الحل النموذجي المتسلسلة (بما أن ∵ ... إذن ∴ ...)]",
  ].join("\n");
}
