/**
 * @file exam-forms-notebooklm-prompt-builder.ts
 * @description مولد برومبت النماذج الامتحانية المتعددة المتكافئة أو المتدرجة الموجه لـ NotebookLM
 * مع التوزيع الديموجرافي الصارم على الدروس ومنع تكرار الأفكار بنسبة 100% عبر جميع النماذج.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 150 سطراً).
 */

import type { MathBranchId } from "../ssot/math-branches-ssot";
import { MATH_BRANCHES_SSOT } from "../ssot/math-branches-ssot";
import type { MathNotationLanguage } from "../ssot/numeral-and-unit-ssot";
import type { CurriculumUnitNode } from "../ssot/curriculum-hierarchy-ssot";
import type {
  ExamFormsDifficultyProfile,
  ExamFormsProgressionMode,
  ExamFormsScopeKind,
} from "../ssot/studio-state-persistence-ssot";
import type { UnitFocusWeightItem } from "@/features/generation-studio-hub/studio-curriculum-units-checklist";
import { buildSharedMathInvariantsPromptBlock } from "./shared-math-prompt-invariants";
import { getArabicFormLetter } from "../pdf-layout-engine/printable-exam-forms-model";
import { buildExamFormsDemographicAndDifficultyBlueprint } from "./exam-forms-demographic-blueprint-builder";

export const MODULE_ID_EXAM_FORMS_NOTEBOOKLM_PROMPT_BUILDER =
  "exam_forms_notebooklm_prompt_builder" as const;

export interface ExamFormsPromptBuilderConfig {
  readonly gradeId?: string;
  readonly gradeNameArabic: string;
  readonly termNumber: 1 | 2;
  readonly branchId: MathBranchId;
  readonly scopeKind: ExamFormsScopeKind;
  readonly scopeDescriptionArabic: string;
  readonly units?: readonly CurriculumUnitNode[];
  readonly selectedUnitIds?: readonly string[];
  readonly selectedLessonIds?: readonly string[];
  readonly unitFocusWeights?: readonly UnitFocusWeightItem[];
  readonly formsCount: number;
  readonly mcqQuestionsCount: number;
  readonly essayAndProofQuestionsCount: number;
  readonly totalMarksPerForm: number;
  readonly durationTextArabic: string;
  readonly difficultyProfile: ExamFormsDifficultyProfile;
  readonly progressionMode?: ExamFormsProgressionMode;
  readonly notationLanguage?: MathNotationLanguage;
  readonly customDirectivesArabic?: string;
}

export function buildExamFormsNotebookLMPrompt(
  config: ExamFormsPromptBuilderConfig
): string {
  const branchSpec = MATH_BRANCHES_SSOT[config.branchId];
  const termLabel = config.termNumber === 1 ? "ترم ١" : "ترم ٢";
  const totalQPerForm = config.mcqQuestionsCount + config.essayAndProofQuestionsCount;
  const totalAllQuestions = config.formsCount * totalQPerForm;
  const formLettersList =
    config.formsCount <= 8
      ? Array.from({ length: config.formsCount }, (_, i) => `النموذج (${getArabicFormLetter(i)})`).join(" ، ")
      : `من النموذج (${getArabicFormLetter(0)}) إلى النموذج (${getArabicFormLetter(config.formsCount - 1)}) — إجمالي ${config.formsCount} نماذج متتالية`;

  const scopeKindText =
    config.scopeKind === "end_of_term"
      ? "اختبار نهاية الترم"
      : config.scopeKind === "monthly_exam"
        ? "اختبار شهر تقييمي"
        : "مراجعة تدريبية بالنماذج";

  const scopeLabel = config.scopeDescriptionArabic?.trim()
    ? `${scopeKindText} على نطاق: [${config.scopeDescriptionArabic.trim()}]`
    : config.scopeKind === "end_of_term"
      ? "اختبارات نهاية الترم (شاملة كامل وحدات ودروس المنهج المقرر)"
      : `${scopeKindText} على الوحدات والدروس المقررة`;

  const blueprintBlock = buildExamFormsDemographicAndDifficultyBlueprint({
    units: config.units,
    selectedUnitIds: config.selectedUnitIds,
    selectedLessonIds: config.selectedLessonIds,
    scopeKind: config.scopeKind,
    scopeDescriptionArabic: config.scopeDescriptionArabic,
    formsCount: config.formsCount,
    mcqCount: config.mcqQuestionsCount,
    essayCount: config.essayAndProofQuestionsCount,
    difficultyProfile: config.difficultyProfile,
    progressionMode: config.progressionMode,
    unitFocusWeights: config.unitFocusWeights,
  });

  const customRule = config.customDirectivesArabic?.trim()
    ? `💡 توجيهات المعلم الخاصة: ${config.customDirectivesArabic.trim()}`
    : undefined;

  return [
    `مطلوب توليد (${config.formsCount}) نماذج امتحانية ورقية: [${formLettersList}] | مادة الرياضيات (${branchSpec.nameArabic}) | ${config.gradeNameArabic} (${termLabel}) | زمن كل نموذج: ${config.durationTextArabic} | الدرجة لكل نموذج: ${config.totalMarksPerForm}.`,
    `🎯 نطاق الاختبار المستهدف: ${scopeLabel}.`,
    `📊 التركيب الحسابي الإلزامي لكل نموذج (إجمالي ${totalQPerForm} سؤالاً بكل نموذج بلا زيادة أو نقصان — الإجمالي الكلي ${totalAllQuestions} سؤالاً):`,
    `   - (${config.mcqQuestionsCount}) أسئلة اختيار من متعدد [MCQ].`,
    `   - (${config.essayAndProofQuestionsCount}) أسئلة مقالية وبرهان هندسي/جبري استدلالي [PROOF/ESSAY].`,
    blueprintBlock,
    `⚠️ ضوابط حاسمة غير قابلة للكسر (Zero-Idea-Repetition & Demographic Balance):`,
    `   ١. التوازن الديموجرافي الصارم: وزّع الأسئلة بعدالة بين جميع الدروس المحددة دون تركيز على درس وإهمال آخر.`,
    `   ٢. منع تكرار الفكرة عبر جميع النماذج (0% تكرار): يُمنع تكرار أي فكرة رياضية بين النماذج (${config.formsCount}) أو داخل النموذج، ويُحظر تغيير الأرقام فقط؛ استنفد كل أفكار الدروس حتى لا نهدر أي سؤال.`,
    `   ٣. الالتزام بالنطاق: التزم بالدروس المحددة، ويُحظر تماماً وضع أي مسألة من أي درس تم النص على استثنائه.`,
    `   ٤. المطابقة الصارمة والتامة للمصادر: المسائل مستقاة 100% من كتب التقييمات والوزارة والمحافظات الرسمية.`,
    ...(customRule ? [customRule] : []),
    buildSharedMathInvariantsPromptBlock({
      branchId: config.branchId,
      notationLanguage: config.notationLanguage,
      lessonTitleArabic: scopeLabel,
      gradeId: config.gradeId,
    }),
    `📐 قالب الإخراج الإلزامي الدقيق (التزم به حرفياً لكل نموذج ولكل سؤال):`,
    `اكتب كل نموذج تحت ترويسة واضحة بهذا النمط:`,
    `=== [FORM: رقم_النموذج] | النموذج: [أ أو ب أو جـ...] ===`,
    `ثم لكل سؤال داخل النموذج:`,
    `=== [QUESTION: رقم_السؤال] | النموذج: [رمز_النموذج] | النوع: [MCQ أو PROOF أو ESSAY] | الدرس: [اسم_الدرس_بدقة] | الدرجة: [الدرجة] ===`,
    `النص: [نص السؤال الرياضي بالمعادلات داخل $...$]`,
    `الرسم: [[رسم هندسي: ...] باللغة العربية الطبيعية إن تطلب السؤال، أو اترك السطر فارغاً تماماً بدون كتابة كلمة فارغ]`,
    `البدائل: (أ) ... | (ب) ... | (جـ) ... | (د) ... (لأسئلة MCQ فقط: وزّع الإجابات الصحيحة عشوائياً بالتساوي بين أ، ب، جـ، د)`,
    `الإجابة_الصحيحة: [البديل الصحيح أو الناتج النهائي بالوحدة العربية]`,
    `البرهان_والخطوات: [خطوات الحل النموذجية والبرهان مفصولة بـ |]`,
  ].join("\n");
}
