/**
 * @file exam-forms-notebooklm-prompt-builder.ts
 * @description مولد برومبت النماذج الامتحانية المتعددة المتكافئة الموجه لـ NotebookLM (مكثف، صارم في تكافؤ الصعوبة، واختلاف الأفكار 100%).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import type { MathBranchId } from "../ssot/math-branches-ssot";
import { MATH_BRANCHES_SSOT } from "../ssot/math-branches-ssot";
import type { MathNotationLanguage } from "../ssot/numeral-and-unit-ssot";
import type { ExamFormsScopeKind } from "../ssot/studio-state-persistence-ssot";
import { buildSharedMathInvariantsPromptBlock } from "./shared-math-prompt-invariants";
import { getArabicFormLetter } from "../pdf-layout-engine/printable-exam-forms-model";

export const MODULE_ID_EXAM_FORMS_NOTEBOOKLM_PROMPT_BUILDER =
  "exam_forms_notebooklm_prompt_builder" as const;

export interface ExamFormsPromptBuilderConfig {
  readonly gradeNameArabic: string;
  readonly termNumber: 1 | 2;
  readonly branchId: MathBranchId;
  readonly scopeKind: ExamFormsScopeKind;
  readonly scopeDescriptionArabic: string;
  readonly formsCount: number;
  readonly mcqQuestionsCount: number;
  readonly essayAndProofQuestionsCount: number;
  readonly totalMarksPerForm: number;
  readonly durationTextArabic: string;
  readonly difficultyProfile: "standard_balanced" | "olympiad_challenge";
  readonly notationLanguage?: MathNotationLanguage;
  readonly customDirectivesArabic?: string;
}

export function buildExamFormsNotebookLMPrompt(
  config: ExamFormsPromptBuilderConfig
): string {
  const branchSpec = MATH_BRANCHES_SSOT[config.branchId];
  const termLabel = config.termNumber === 1 ? "ترم ١" : "ترم ٢";
  const totalQPerForm = config.mcqQuestionsCount + config.essayAndProofQuestionsCount;
  const formLettersList = Array.from({ length: config.formsCount }, (_, i) => `النموذج (${getArabicFormLetter(i)})`).join(" ، ");

  const scopeLabel =
    config.scopeKind === "end_of_term"
      ? "اختبارات نهاية الترم (شاملة كامل وحدات ودروس المنهج)"
      : config.scopeKind === "monthly_exam"
        ? `اختبارات شهر تقييمية على نطاق: [${config.scopeDescriptionArabic.trim() || "الوحدات المقررة"}]`
        : `مراجعة تدريبية بنماذج متعددة على: [${config.scopeDescriptionArabic.trim() || "الدروس المستهدفة"}]`;

  const difficultyAr =
    config.difficultyProfile === "olympiad_challenge"
      ? "مستويات عليا وتحدي للمتفوقين (٤٠٪ تطبيقي، ٦٠٪ برهان وتفكير ابتكاري)"
      : "متوازن رسمي مطابق للمواصفات الوزارية (٣٠٪ تذكر وتطبيق مباشر، ٥٠٪ فهم وبرهان، ٢٠٪ تمييز)";

  const customRule = config.customDirectivesArabic?.trim()
    ? `💡 توجيهات المعلم الخاصة: ${config.customDirectivesArabic.trim()}`
    : undefined;

  return [
    `مطلوب توليد (${config.formsCount}) نماذج امتحانية ورقية متكافئة: [${formLettersList}] | مادة الرياضيات (${branchSpec.nameArabic}) | ${config.gradeNameArabic} (${termLabel}) | زمن كل نموذج: ${config.durationTextArabic} | الدرجة لكل نموذج: ${config.totalMarksPerForm}.`,
    `🎯 نطاق الاختبار المستهدف: ${scopeLabel}.`,
    `📊 التركيب الحسابي الإلزامي لكل نموذج (إجمالي ${totalQPerForm} سؤالاً بكل نموذج بلا زيادة أو نقصان):`,
    `   - (${config.mcqQuestionsCount}) أسئلة اختيار من متعدد [MCQ].`,
    `   - (${config.essayAndProofQuestionsCount}) أسئلة مقالية وبرهان هندسي/جبري استدلالي [PROOF/ESSAY].`,
    `⚠️ ضوابط حاسمة غير قابلة للكسر (Critical Anti-Duplication & Source Match Rules):`,
    `   ١. التكافؤ التام والاختلاف الكلي: النماذج متكافئة بدقة في الوزن النسبي ومستوى الصعوبة (${difficultyAr})، ولكن كل نموذج مستقل تماماً بأسئلته وأفكاره عن النماذج الأخرى.`,
    `   ٢. حظر التكرار وتغيير الأرقام السطحي: يُمنع منعاً باتاً تكرار نفس السؤال بين النماذج أو الاكتفاء بتغيير الأرقام بصورة شكلية؛ كل سؤال في كل نموذج يجب أن يقيس مهارة أو فكرة رياضية مختلفة مستخلصة من المصادر.`,
    `   ٣. المطابقة الصارمة للمصادر: جميع الأسئلة مستقاة بنسبة 100% من كتب الوزارة ونماذج امتحانات المحافظات الرسمية الموثقة.`,
    ...(customRule ? [customRule] : []),
    buildSharedMathInvariantsPromptBlock({
      branchId: config.branchId,
      notationLanguage: config.notationLanguage,
      lessonTitleArabic: config.scopeDescriptionArabic || branchSpec.nameArabic,
    }),
    `📐 قالب الإخراج الإلزامي الدقيق (التزم به حرفياً لكل نموذج ولكل سؤال):`,
    `اكتب كل نموذج تحت ترويسة واضحة بهذا النمط:`,
    `=== [FORM: رقم_النموذج] | النموذج: [أ أو ب أو جـ...] ===`,
    `ثم لكل سؤال داخل النموذج:`,
    `=== [QUESTION: رقم_السؤال] | النموذج: [رمز_النموذج] | النوع: [MCQ أو PROOF أو ESSAY] | الدرس: [اسم_الدرس] | الدرجة: [الدرجة] ===`,
    `النص: [نص السؤال الرياضي بالمعادلات داخل $...$]`,
    `الرسم: [[رسم هندسي: ...] باللغة العربية الطبيعية إن تطلب السؤال وإلا فارغ]`,
    `البدائل: (أ) ... | (ب) ... | (جـ) ... | (د) ... (لأسئلة MCQ فقط)`,
    `الإجابة_الصحيحة: [البديل الصحيح أو الناتج النهائي بالوحدة العربية]`,
    `البرهان_والخطوات: [خطوات الحل النموذجية والبرهان مفصولة بـ |]`,
  ].join("\n");
}
