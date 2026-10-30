/**
 * @file question-assessment-ir.ts
 * @description العقد الموحد لجميع أنماط الأسئلة الرياضية التسعة والبرهان الهندسي الاستدلالي (Question IR).
 * يرتبط مباشرة بـ `math-branches-ssot.ts` و `geometry-archetype-ssot.ts` و `statistics-archetype-ssot.ts`.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 200 سطر).
 */

import type { MathBranchId } from "../ssot/math-branches-ssot";
import type { CanonicalGeometryFigureIR } from "../ssot/geometry-archetype-ssot";
import type { CanonicalStatisticsDatasetIR } from "../ssot/statistics-archetype-ssot";
import type { ArabicMathUnit } from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_QUESTION_ASSESSMENT_IR = "question_assessment_ir" as const;

export type MathQuestionCognitiveDepth =
  | "direct_application"
  | "multi_step_analysis"
  | "deductive_proof"
  | "higher_order_olympiad";

export type MathQuestionPatternKind =
  | "mcq"
  | "completion"
  | "proof_reasoning"
  | "direct_answer"
  | "graph_question"
  | "find_error"
  | "compare_values"
  | "matching_pairs"
  | "multi_part_problem";

export interface DeductiveProofStepIR {
  readonly stepNumber: number;
  readonly premiseSinceArabic: string;     // بما أن (∵)
  readonly conclusionThereforeArabic: string; // إذن (∴)
  readonly geometricTheoremJustification?: string;
}

export interface MathSubQuestionPartIR {
  readonly partLabelArabic: "أ" | "ب" | "جـ" | "د";
  readonly promptTextArabic: string;
  readonly allocatedMarks: number;
  readonly finalAnswerValue: string;
  readonly finalAnswerUnit?: ArabicMathUnit;
}

export interface AuthenticExamSourceCitationIR {
  readonly governorateNameArabic?: string;
  readonly educationalAdministrationArabic?: string;
  readonly examYear?: number;
  readonly isSchoolBookExercise?: boolean;
}

export interface QuestionAssessmentIR {
  readonly questionId: string;
  readonly displayOrderNumber: number;
  readonly branchId: MathBranchId;
  readonly unitId: string;
  readonly lessonId: string;
  readonly lessonTitleArabic: string;
  readonly patternKind: MathQuestionPatternKind;
  readonly cognitiveDepth: MathQuestionCognitiveDepth;
  readonly allocatedMarks: number;
  readonly estimatedSolveMinutes: number;

  /**
   * نص السؤال الرياضي مع محددات المعادلات `$...$` والوحدات العربية القياسية.
   */
  readonly promptArabic: string;

  /**
   * المعطيات والمطلوب في المسائل الهندسية والبرهان الاستدلالي.
   */
  readonly givenDataArabic?: readonly string[];
  readonly requiredToProveOrFindArabic?: string;

  /**
   * البدائل الأربعة الإلزامية لأسئلة الاختيار من متعدد (`mcq`).
   */
  readonly mcqChoicesArabic?: readonly [string, string, string, string];
  readonly correctMcqChoiceIndex?: 0 | 1 | 2 | 3;

  /**
   * الجزئيات الفرعية في الأسئلة المقالية المركبة.
   */
  readonly subParts?: readonly MathSubQuestionPartIR[];

  /**
   * خطوات البرهان الاستدلالي المنظم (بما أن ∵ -> إذن ∴) والحل النموذجي الكامل.
   */
  readonly proofSteps?: readonly DeductiveProofStepIR[];
  readonly modelSolutionStepsArabic: readonly string[];
  readonly finalCanonicalAnswerArabic: string;
  /** إجابات مقبولة مكافئة للأسئلة القصيرة في الاختبار الإلكتروني (مثل: 5 | ٥ | خمسة). */
  readonly acceptedAnswersArabic?: readonly string[];
  /** تنبيهات تشخيص الرسم للمعلم (لا تُعرض للطالب). */
  readonly figureDiagnosticsAr?: readonly string[];

  /**
   * مرفق الشكل الهندسي المتجهي أو الرسم الإحصائي (إن كان السؤال يتطلب شكلاً).
   */
  readonly attachedGeometryFigure?: CanonicalGeometryFigureIR;
  readonly attachedStatisticsDataset?: CanonicalStatisticsDatasetIR;

  /**
   * التوثيق الصارم للمصدر (يُمنع اختلاق محافظة غير واردة في المصدر الأصلي).
   */
  readonly authenticCitation?: AuthenticExamSourceCitationIR;
}
