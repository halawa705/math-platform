/**
 * @file booklet-lesson-content-ir.ts
 * @description العقد الموحد لشجرة المحتوى والأفكار التربوية والأمثلة المحلولة والمذكرات والمراجعات (Content IR).
 * يمثل مخرجات خط أنابيب المذكرة الدراسية بالمراحل الثلاث (خريطة الأفكار + تدريبات الطالب + نموذج الحلول).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 200 سطر).
 */

import type { MathBranchId } from "../ssot/math-branches-ssot";
import type { CanonicalGeometryFigureIR } from "../ssot/geometry-archetype-ssot";
import type { CanonicalStatisticsDatasetIR } from "../ssot/statistics-archetype-ssot";
import type { QuestionAssessmentIR } from "./question-assessment-ir";

export const MODULE_ID_BOOKLET_LESSON_CONTENT_IR = "booklet_lesson_content_ir" as const;

export interface WorkedExampleStepIR {
  readonly stepIndex: number;
  readonly explanationArabic: string;
  readonly mathExpressionLatex?: string;
}

export interface WorkedMathExampleIR {
  readonly exampleId: string;
  readonly titleArabic: string;
  readonly problemStatementArabic: string;
  readonly givenArabic?: string;
  readonly requiredArabic?: string;
  readonly solutionSteps: readonly WorkedExampleStepIR[];
  readonly finalResultHighlightArabic: string;
  readonly commonStudentMistakeWarningArabic?: string;
  readonly attachedGeometryFigure?: CanonicalGeometryFigureIR;
  readonly attachedStatisticsDataset?: CanonicalStatisticsDatasetIR;
}

export interface TryItYourselfDrillIR {
  readonly drillId: string;
  readonly linkedExampleId: string;
  readonly promptArabic: string;
  readonly hintArabic?: string;
  readonly finalAnswerKeyArabic: string;
  readonly fullSolutionStepsArabic: readonly string[];
  readonly attachedGeometryFigure?: CanonicalGeometryFigureIR;
}

export interface IdeaPedagogicalNode {
  readonly ideaId: string;
  readonly ideaOrderNumber: number;
  readonly ideaTitleArabic: string;
  readonly conceptualExplanationArabic: string;
  /**
   * القانون الرياضي أو منطوق النظرية الهندسية المؤطر داخل صندوق القاعدة.
   */
  readonly boxedRuleOrTheoremArabic: string;
  readonly symbolicFormulaLatex?: string;
  readonly workedExamples: readonly WorkedMathExampleIR[];
  readonly immediateStudentDrills: readonly TryItYourselfDrillIR[];
}

export interface BookletLessonContentIR {
  readonly bookletId: string;
  readonly gradeId: string;
  readonly gradeNameArabic: string;
  readonly termNumber: 1 | 2;
  readonly branchId: MathBranchId;
  readonly unitId: string;
  readonly unitTitleArabic: string;
  readonly lessonId: string;
  readonly lessonTitleArabic: string;

  /**
   * ملخص القوانين والمفاهيم الأساسية في مطلع الدرس.
   */
  readonly executiveSummaryRulesArabic: readonly string[];

  /**
   * شجرة الأفكار المتدرجة (المرحلة 1 + المرحلة 2 + المرحلة 3 مدمجة).
   */
  readonly pedagogicalIdeas: readonly IdeaPedagogicalNode[];

  /**
   * بنك التدريبات المتدرج والواجب المنزلي الشامل في ختام المذكرة.
   */
  readonly comprehensiveExercises: readonly QuestionAssessmentIR[];
  readonly homeworkAssignmentQuestions: readonly QuestionAssessmentIR[];
}
