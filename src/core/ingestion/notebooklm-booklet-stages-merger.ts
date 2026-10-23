/**
 * @file notebooklm-booklet-stages-merger.ts
 * @description دامج ردود المراحل الثلاث للمذكرة الدراسية (المرحلة 1: الأفكار والشرح والأمثلة،
 * المرحلة 2: تدريبات حاول بنفسك والواجب، المرحلة 3: الحلول التفصيلية) في شجرة `BookletLessonContentIR` موحدة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 200 سطر).
 */

import type {
  BookletLessonContentIR,
  IdeaPedagogicalNode,
  TryItYourselfDrillIR,
} from "../ir/booklet-lesson-content-ir";
import type { MathBranchId } from "../ssot/math-branches-ssot";
import { sanitizeNotebookLMCitationsAndLatex } from "./notebooklm-citation-latex-sanitizer";
import { parseNotebookLMExamQuestionsToIR } from "./notebooklm-exam-questions-parser";

export const MODULE_ID_NOTEBOOKLM_BOOKLET_STAGES_MERGER =
  "notebooklm_booklet_stages_merger" as const;

export interface MergeBookletThreeStagesInput {
  readonly bookletId: string;
  readonly gradeId: string;
  readonly gradeNameArabic: string;
  readonly termNumber: 1 | 2;
  readonly branchId: MathBranchId;
  readonly unitId: string;
  readonly unitTitleArabic: string;
  readonly lessonId: string;
  readonly lessonTitleArabic: string;
  readonly stage1RawResponse: string;
  readonly stage2RawResponse?: string;
  readonly stage3RawResponse?: string;
}

export function mergeNotebookLMBookletThreeStagesToIR(
  input: MergeBookletThreeStagesInput
): BookletLessonContentIR {
  const cleanStage1 = sanitizeNotebookLMCitationsAndLatex(
    input.stage1RawResponse
  ).cleanedText;
  const cleanStage2 = sanitizeNotebookLMCitationsAndLatex(
    input.stage2RawResponse || ""
  ).cleanedText;
  const cleanStage3 = sanitizeNotebookLMCitationsAndLatex(
    input.stage3RawResponse || ""
  ).cleanedText;

  // استخراج الحلول التفصيلية من المرحلة الثالثة وربطها بمعرف التدريب
  const solutionMap = new Map<string, string[]>();
  const solSplits = cleanStage3.split(/\[SOLUTION_FOR:\s*([^\]]+)\]/i).slice(1);
  for (let i = 0; i < solSplits.length; i += 2) {
    const targetId = solSplits[i].trim();
    const lines = (solSplits[i + 1] || "")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    solutionMap.set(targetId, lines);
  }

  // استخراج الأفكار التربوية من المرحلة الأولى
  const ideaChunks = cleanStage1
    .split(/===\s*\[IDEA:\s*(\d+)\]\s*\|\s*العنوان:\s*([^=\n]+)===/i)
    .slice(1);

  const pedagogicalIdeas: IdeaPedagogicalNode[] = [];

  for (let i = 0; i < ideaChunks.length; i += 3) {
    const ideaNum = parseInt(ideaChunks[i], 10) || pedagogicalIdeas.length + 1;
    const ideaTitle = (ideaChunks[i + 1] || `الفكرة ${ideaNum}`).trim();
    const ideaBody = ideaChunks[i + 2] || "";

    const explanationMatch = ideaBody.match(/الشرح:\s*(.+)/i);
    const ruleBoxMatch = ideaBody.match(/صندوق_القاعدة:\s*(.+)/i);
    const exampleProblemMatch = ideaBody.match(/المسألة:\s*(.+)/i);
    const exampleStepsMatch = ideaBody.match(/خطوات_الحل:\s*(.+)/i);

    const drillId = `drill_${ideaNum}_1`;
    const drillSolutions = solutionMap.get(drillId) || [
      "بالتطبيق المباشر للقاعدة المؤطرة في الفكرة نحصل على الناتج.",
    ];

    const immediateStudentDrills: readonly TryItYourselfDrillIR[] = [
      {
        drillId,
        linkedExampleId: `ex_${ideaNum}_1`,
        promptArabic: `حاول بنفسك (${ideaNum}): طبّق قاعدة (${ideaTitle}) لحل المسألة الموازية.`,
        finalAnswerKeyArabic: drillSolutions[drillSolutions.length - 1] || "",
        fullSolutionStepsArabic: drillSolutions,
      },
    ];

    pedagogicalIdeas.push({
      ideaId: `idea_${ideaNum}`,
      ideaOrderNumber: ideaNum,
      ideaTitleArabic: ideaTitle,
      conceptualExplanationArabic:
        explanationMatch?.[1]?.trim() ||
        `شرح تأسيسي لمفهوم ${ideaTitle} وتطبيقاته الرياضية.`,
      boxedRuleOrTheoremArabic:
        ruleBoxMatch?.[1]?.trim() ||
        `القاعدة الأساسية لـ ${ideaTitle} كما وردت في كتاب الوزارة.`,
      workedExamples: [
        {
          exampleId: `ex_${ideaNum}_1`,
          titleArabic: `مثال محلول (${ideaNum})`,
          problemStatementArabic:
            exampleProblemMatch?.[1]?.trim() || `مثال تطبيقي على ${ideaTitle}`,
          solutionSteps: [
            {
              stepIndex: 1,
              explanationArabic:
                exampleStepsMatch?.[1]?.trim() || "خطوات الحل النموذجي المتسلسلة.",
            },
          ],
          finalResultHighlightArabic: "تم إثبات المطلوب رياضياً",
        },
      ],
      immediateStudentDrills,
    });
  }

  const comprehensiveExercises = parseNotebookLMExamQuestionsToIR(cleanStage2, {
    defaultBranchId: input.branchId,
    defaultUnitId: input.unitId,
    defaultLessonId: input.lessonId,
    defaultLessonTitleArabic: input.lessonTitleArabic,
  });

  return {
    bookletId: input.bookletId,
    gradeId: input.gradeId,
    gradeNameArabic: input.gradeNameArabic,
    termNumber: input.termNumber,
    branchId: input.branchId,
    unitId: input.unitId,
    unitTitleArabic: input.unitTitleArabic,
    lessonId: input.lessonId,
    lessonTitleArabic: input.lessonTitleArabic,
    executiveSummaryRulesArabic: pedagogicalIdeas.map(
      (idNode) => idNode.boxedRuleOrTheoremArabic
    ),
    pedagogicalIdeas,
    comprehensiveExercises,
    homeworkAssignmentQuestions: comprehensiveExercises.slice(0, 4),
  };
}
