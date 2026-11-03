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
  const formLettersList =
    config.formsCount <= 8
      ? Array.from({ length: config.formsCount }, (_, i) => `النموذج (${getArabicFormLetter(i)})`).join(" ، ")
      : `من النموذج (${getArabicFormLetter(0)}) إلى النموذج (${getArabicFormLetter(config.formsCount - 1)}) — إجمالي ${config.formsCount} نماذج متتالية`;

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
    `⚠️ ضوابط حاسمة غير قابلة للكسر (Anti-Duplication & Exam High-Yield Invariants):`,
    `   ١. التكافؤ التام والاختلاف الحقيقي: النماذج متكافئة بدقة في الوزن النسبي ومستوى الصعوبة (${difficultyAr}) والزمن والدرجات، ولكن كل نموذج مستقل تماماً بأسئلته.`,
    `   ٢. ضابط الأفكار وتنوع الأسئلة ومنع التكرار:`,
    `      - الأصل الصارم الحاسم: يُمنع منعاً باتاً تكرار أي سؤال بنفس الفكرة في أي نموذج، ويُحظر الاكتفاء بنسخ المسائل وتغيير الأرقام بصورة شكلية؛ يجب أن يقيس كل سؤال مهارة رياضية وفكرة مستقلة لتغطية مختلف زوايا المنهج.`,
    `      - استثناء النماذج الضخمة والأفكار الأكثر تكراراً${config.formsCount >= 5 ? ` (المطلوب ${config.formsCount} نماذج)` : ""}: عند طلب عدد كبير من النماذج، يُسمح بتناول الأفكار الجوهرية الكبرى الأكثر تكراراً وشهرة في اختبارات نصف العام ونهاية العام الرسمية بالمحافظات، بشرط تغيير صياغة المسألة والمعطيات والشكل الهندسي وطريقة الحل كلياً بحيث يقدم كل سؤال تجربة امتحانية جديدة ومستقلة للطالب.`,
    `   ٣. المطابقة الصارمة والتامة للمصادر: جميع الأسئلة والمسائل مستقاة بنسبة 100% من كتب الوزارة ونماذج امتحانات المحافظات الرسمية الموثقة.`,
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
