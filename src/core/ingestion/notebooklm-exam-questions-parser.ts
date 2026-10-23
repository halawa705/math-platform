/**
 * @file notebooklm-exam-questions-parser.ts
 * @description محلل نصوص الأسئلة والبدائل الأربعة ومفاتيح الإجابة وخطوات البرهان من رد NotebookLM
 * وتحويلها إلى مصفوفة `QuestionAssessmentIR[]` مهيكلة ومطهرة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 200 سطر).
 */

import type { QuestionAssessmentIR, MathQuestionPatternKind } from "../ir/question-assessment-ir";
import type { MathBranchId } from "../ssot/math-branches-ssot";
import { matchArabicDescriptionToCanonicalGeometryFigure } from "../geometry-engine/natural-arabic-geometry-matcher";
import { sanitizeNotebookLMCitationsAndLatex } from "./notebooklm-citation-latex-sanitizer";
import { isDiagramJustifiedForQuestion } from "./unsolicited-diagram-guard";

export const MODULE_ID_NOTEBOOKLM_EXAM_QUESTIONS_PARSER =
  "notebooklm_exam_questions_parser" as const;

export interface ExamQuestionsParserOptions {
  readonly defaultBranchId: MathBranchId;
  readonly defaultUnitId?: string;
  readonly defaultLessonId?: string;
  readonly defaultLessonTitleArabic?: string;
}

export function parseNotebookLMExamQuestionsToIR(
  rawNotebookLMResponse: string,
  options: ExamQuestionsParserOptions
): readonly QuestionAssessmentIR[] {
  const { cleanedText } = sanitizeNotebookLMCitationsAndLatex(rawNotebookLMResponse);
  if (!cleanedText) return [];

  const blocks = cleanedText
    .split(/===\s*\[QUESTION:\s*(\d+)\]/i)
    .slice(1);

  const parsedQuestions: QuestionAssessmentIR[] = [];

  for (let i = 0; i < blocks.length; i += 2) {
    const qNumber = parseInt(blocks[i], 10) || parsedQuestions.length + 1;
    const body = blocks[i + 1] || "";

    const typeMatch = body.match(/النوع:\s*([A-Z_]+)/i);
    const lessonMatch = body.match(/الدرس:\s*([^|=\n]+)/i);
    const marksMatch = body.match(/الدرجة:\s*(\d+)/i);
    const promptMatch = body.match(/النص:\s*(.+)/i);
    const diagramMatch = body.match(/الرسم:\s*\[رسم هندسي:\s*([^\]]+)\]/i);
    const choicesMatch = body.match(/البدائل:\s*(.+)/i);
    const answerMatch = body.match(/الإجابة_الصحيحة:\s*(.+)/i);
    const proofMatch = body.match(/البرهان_والخطوات:\s*([\s\S]+?)(?:===|$)/i);

    const rawKind = (typeMatch?.[1] || "MCQ").toUpperCase();
    const patternKind: MathQuestionPatternKind =
      rawKind === "PROOF"
        ? "proof_reasoning"
        : rawKind === "COMPLETION"
        ? "completion"
        : rawKind === "ESSAY"
        ? "direct_answer"
        : "mcq";

    const promptArabic = promptMatch?.[1]?.trim() || "سؤال رياضي";
    const rawDiagramDesc = diagramMatch?.[1]?.trim();

    let mcqChoicesArabic: readonly [string, string, string, string] | undefined;
    if (choicesMatch?.[1]) {
      const parts = choicesMatch[1]
        .split("|")
        .map((c) => c.replace(/^\([أابجدهـ1234]\)\s*/, "").trim())
        .filter(Boolean);
      if (parts.length >= 4) {
        mcqChoicesArabic = [parts[0], parts[1], parts[2], parts[3]];
      }
    }

    const allowDiagram = isDiagramJustifiedForQuestion({
      promptArabic,
      rawDiagramTagText: rawDiagramDesc,
      branchId: options.defaultBranchId,
    });

    const attachedGeometryFigure =
      allowDiagram && rawDiagramDesc
        ? matchArabicDescriptionToCanonicalGeometryFigure(
            rawDiagramDesc,
            `parsed_fig_${qNumber}`,
            "arabic"
          )
        : undefined;

    const solutionLines = proofMatch?.[1]
      ? proofMatch[1]
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean)
      : ["بالتعويض المباشر في القاعدة الرياضية نحصل على الناتج."];

    parsedQuestions.push({
      questionId: `exam_q_${qNumber}`,
      displayOrderNumber: qNumber,
      branchId: options.defaultBranchId,
      unitId: options.defaultUnitId || "unit_1",
      lessonId: options.defaultLessonId || "lesson_1",
      lessonTitleArabic:
        lessonMatch?.[1]?.trim() ||
        options.defaultLessonTitleArabic ||
        "الدرس الأول",
      patternKind,
      cognitiveDepth:
        patternKind === "proof_reasoning" ? "deductive_proof" : "direct_application",
      allocatedMarks: marksMatch ? parseInt(marksMatch[1], 10) : 2,
      estimatedSolveMinutes: patternKind === "mcq" ? 2 : 5,
      promptArabic,
      mcqChoicesArabic,
      correctMcqChoiceIndex: patternKind === "mcq" ? 0 : undefined,
      modelSolutionStepsArabic: solutionLines,
      finalCanonicalAnswerArabic: answerMatch?.[1]?.trim() || solutionLines[0] || "",
      attachedGeometryFigure,
    });
  }

  return parsedQuestions;
}
