/**
 * @file exam-forms-notebooklm-prompt-builder.ts
 * @description مولد برومبت النماذج الامتحانية المتعددة المتكافئة أو المتدرجة الموجه لـ NotebookLM
 * ضمن سقف الحجم الآمن لـ NotebookLM مع التوزيع الديموجرافي ومنع تكرار الأفكار بنسبة 100%.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 115 سطراً).
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
        ? "اختبار شهر"
        : "مراجعة بالنماذج";

  const scopeLabel = config.scopeDescriptionArabic?.trim()
    ? `${scopeKindText}: [${config.scopeDescriptionArabic.trim()}]`
    : config.scopeKind === "end_of_term"
      ? "اختبارات نهاية الترم (كامل المنهج)"
      : `${scopeKindText} على الدروس المقررة`;

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
    `مطلوب (${config.formsCount}) نماذج امتحانية: [${formLettersList}] | ${branchSpec.nameArabic} | ${config.gradeNameArabic} (${termLabel}) | ${config.durationTextArabic} | ${config.totalMarksPerForm} درجة.`,
    `🎯 النطاق: ${scopeLabel} | بكل نموذج ${totalQPerForm}س: (${config.mcqQuestionsCount}) اختر [MCQ] + (${config.essayAndProofQuestionsCount}) مقالي/برهان [PROOF/ESSAY] (إجمالي ${totalAllQuestions}س).`,
    blueprintBlock,
    `⚠️ ضوابط: منع تكرار الفكرة عبر النماذج (0% تكرار) أو تغيير الأرقام فقط وتغطية كل الأفكار | يُحظر تماماً وضع أي مسألة من أي درس تم النص على استثنائه | المطابقة الصارمة والتامة للمصادر.`,
    ...(customRule ? [customRule] : []),
    buildSharedMathInvariantsPromptBlock({
      branchId: config.branchId,
      notationLanguage: config.notationLanguage,
      lessonTitleArabic: scopeLabel,
      gradeId: config.gradeId,
    }),
    `📐 قالب الإخراج حرفياً:`,
    `=== [FORM: رقم] | النموذج: [أ، ب...] ===`,
    `=== [QUESTION: رقم] | النموذج: [رمز] | النوع: [MCQ|PROOF|ESSAY] | الدرس: [الدرس] | الدرجة: [رقم] ===`,
    `النص: [السؤال بـ $...$]`,
    `الرسم: [[رسم هندسي: ...] إن لزم وإلا فارغ]`,
    `البدائل: (أ) ... | (ب) ... | (جـ) ... | (د) ...`,
    `الإجابة_الصحيحة: [البديل/الناتج بالوحدة]`,
    `البرهان_والخطوات: [الخطوات بـ |]`,
  ].join("\n");
}
