"use client";

/**
 * @file flow-item-renderer.tsx
 * @description مصيّر كائن التدفق المفرد (كبسولة فكرة، سؤال/مثال/تدريب، فاصل، جدول إجابات، اعتماد).
 * هو نفسه المستخدم في القياس الخفي وفي الصفحة الفعلية فتتطابق الارتفاعات المقاسة مع المعروضة.
 */

import type { PDFPrintSettingsStateSSOT } from "../ssot/pdf-print-settings-ssot";
import type { OwnerTeacherIdentity } from "../ssot/teacher-identity-ssot";
import { formatNumeralsByModeSSOT } from "../ssot/numeral-and-unit-ssot";
import type { PrintThemePaletteTokens, PrintableMathQuestionItem } from "./a4-vector-html-sheet-renderer";
import { OfficialMcqAnswerKeySummaryTable, PedagogicalIdeaAndRuleCapsule } from "./a4-pedagogical-capsule-and-key-table";
import SideBySideDiagramDocker from "./side-by-side-diagram-docker";
import type { FlowItem } from "./flow-item-model";
import { SovereignDocumentAccreditationBox } from "./sovereign-a4-page-chrome-elements";
import { OfficialSchoolExamQuestionRow } from "./official-school-exam-question-row";
import { OfficialSchoolExamSectionBanner } from "./official-school-exam-section-banner";
import { OfficialSchoolEndWishBanner } from "./official-school-exam-page-chrome";
import { AnswerSectionBanner } from "./answer-section-banner";
import { CompactTextbookMcqRow, isCompactTextbookMcqQuestion } from "./compact-textbook-mcq-row";

export const MODULE_ID_FLOW_ITEM_RENDERER = "flow_item_renderer" as const;

export interface FlowItemRendererProps {
  readonly item: FlowItem;
  readonly settings: PDFPrintSettingsStateSSOT;
  readonly palette: PrintThemePaletteTokens;
  readonly identity: OwnerTeacherIdentity;
  readonly questions: readonly PrintableMathQuestionItem[];
}

export function FlowItemRenderer({ item, settings, palette, identity, questions }: FlowItemRendererProps) {
  const isSchoolExam = settings.paperTemplateId === "official_school_exam";
  const isSolvedMode = settings.answerVisibilityMode !== "questions_only";

  switch (item.kind) {
    case "exam_section_banner":
      return (
        <OfficialSchoolExamSectionBanner
          sectionOrdinalArabic={item.sectionOrdinalArabic}
          sectionTitleArabic={item.sectionTitleArabic}
          questionsCount={item.questionsCount}
          numeralMode={settings.numeralMode}
        />
      );
    case "exam_wish_banner":
      return <OfficialSchoolEndWishBanner />;
    case "answer_section_banner":
      return (
        <AnswerSectionBanner
          titleArabic={item.titleArabic}
          subtitleArabic={item.subtitleArabic}
          palette={palette}
        />
      );
    case "idea_capsule":
      return (
        <PedagogicalIdeaAndRuleCapsule
          item={item.anchorQuestion}
          palette={palette}
          numeralMode={settings.numeralMode}
          notationLanguage={settings.notationLanguage}
          ideaIndex={item.ideaIndex}
          boldProseText={settings.boldProseText}
        />
      );
    case "question": {
      const effectiveSolved = item.forceHideSolution ? false : item.isAnswerCard ? true : isSolvedMode;
      const isCompactMcq = isCompactTextbookMcqQuestion(item.question, item.isAnswerCard);
      return (
        <div className="w-full min-w-0 flex-1 flex flex-col">
          {isCompactMcq ? (
            <CompactTextbookMcqRow
              question={item.question}
              displayQuestionNumber={item.sectionLocalNumber ?? item.question.questionNumber}
              settings={settings}
              palette={palette}
              isSolvedMode={effectiveSolved}
            />
          ) : isSchoolExam ? (
            <OfficialSchoolExamQuestionRow
              question={item.question}
              sectionLocalNumber={item.sectionLocalNumber}
              settings={settings}
              palette={palette}
              isSolvedMode={effectiveSolved}
            />
          ) : (
            <SideBySideDiagramDocker
              question={item.question}
              settings={settings}
              solutionSlice={item.solutionSlice}
              forceHideSolution={item.forceHideSolution}
              isAnswerCard={item.isAnswerCard}
            />
          )}
        </div>
      );
    }
    case "idea_divider":
      return (
        <div className="py-0.5 flex items-center justify-center gap-2 text-[7.8pt] font-black text-slate-500">
          <span className="w-12 border-t border-dashed border-slate-300" />
          <span>نهاية الفكرة ({formatNumeralsByModeSSOT(item.ideaIndex, settings.numeralMode)})</span>
          <span className="w-12 border-t border-dashed border-slate-300" />
        </div>
      );
    case "mcq_answer_key":
      return (
        <OfficialMcqAnswerKeySummaryTable
          questions={questions}
          palette={palette}
          numeralMode={settings.numeralMode}
          notationLanguage={settings.notationLanguage}
        />
      );
    default:
      if (isSchoolExam) return null;
      return (
        <SovereignDocumentAccreditationBox identity={identity} palette={palette} numeralMode={settings.numeralMode} />
      );
  }
}

