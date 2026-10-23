/**
 * @file a4-paginated-layout-ir.ts
 * @description العقد الموحد لتخطيط صفحات A4 والأعمدة المزدوجة ومساحات الإجابة (Layout Document IR).
 * يحكم توزيع الكتل المطبعية لتحقيق استغلال > 92% من مساحة الورقة وأقل عدد من الأوراق.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 200 سطر).
 */

import type { PDFPrintSettingsStateSSOT } from "../ssot/pdf-print-settings-ssot";
import type { CanonicalGeometryFigureIR } from "../ssot/geometry-archetype-ssot";
import type { CanonicalStatisticsDatasetIR } from "../ssot/statistics-archetype-ssot";
import type { QuestionAssessmentIR } from "./question-assessment-ir";

export const MODULE_ID_A4_PAGINATED_LAYOUT_IR = "a4_paginated_layout_ir" as const;

export type MCQAdaptiveColumnsCount = 4 | 2 | 1;

export interface A4HeadingBlockIR {
  readonly kind: "heading";
  readonly blockId: string;
  readonly estimatedHeightPt: number;
  readonly titleArabic: string;
  readonly subtitleBadgeArabic?: string;
  readonly totalSectionMarks?: number;
}

export interface A4RuleCalloutBlockIR {
  readonly kind: "rule_callout";
  readonly blockId: string;
  readonly estimatedHeightPt: number;
  readonly theoremTitleArabic: string;
  readonly ruleBodyArabic: string;
  readonly formulaLatex?: string;
}

export interface A4QuestionCardBlockIR {
  readonly kind: "question_card";
  readonly blockId: string;
  readonly estimatedHeightPt: number;
  readonly question: QuestionAssessmentIR;
  readonly mcqColumnsCount: MCQAdaptiveColumnsCount;
  readonly answerLinesCount: number;
}

export interface A4SideBySideDiagramQuestionBlockIR {
  readonly kind: "side_by_side_diagram_question";
  readonly blockId: string;
  readonly estimatedHeightPt: number;
  readonly question: QuestionAssessmentIR;
  readonly textColumnWidthPercent: 62;
  readonly diagramColumnWidthPercent: 38;
  readonly geometryFigure?: CanonicalGeometryFigureIR;
  readonly statisticsDataset?: CanonicalStatisticsDatasetIR;
}

export interface A4TwoColumnGridBlockIR {
  readonly kind: "two_column_grid";
  readonly blockId: string;
  readonly estimatedHeightPt: number;
  readonly rightColumnBlocks: readonly (A4QuestionCardBlockIR | A4SideBySideDiagramQuestionBlockIR)[];
  readonly leftColumnBlocks: readonly (A4QuestionCardBlockIR | A4SideBySideDiagramQuestionBlockIR)[];
  readonly showVerticalDivider: boolean;
}

export interface A4TableBoxBlockIR {
  readonly kind: "table_box";
  readonly blockId: string;
  readonly estimatedHeightPt: number;
  readonly captionArabic: string;
  readonly headersArabic: readonly string[];
  readonly rowsArabic: readonly (readonly string[])[];
}

export type A4LayoutBlockIR =
  | A4HeadingBlockIR
  | A4RuleCalloutBlockIR
  | A4QuestionCardBlockIR
  | A4SideBySideDiagramQuestionBlockIR
  | A4TwoColumnGridBlockIR
  | A4TableBoxBlockIR;

export interface A4SinglePageSheetIR {
  readonly pageNumber: number;
  readonly totalPagesCount: number;
  readonly isFirstPageWithSovereignHeader: boolean;
  readonly availableContentHeightPt: number;
  readonly usedContentHeightPt: number;
  readonly utilizationPercentage: number;
  readonly blocks: readonly A4LayoutBlockIR[];
}

export interface A4PaginatedDocumentIR {
  readonly documentId: string;
  readonly printSettings: PDFPrintSettingsStateSSOT;
  readonly pages: readonly A4SinglePageSheetIR[];
  readonly totalQuestionsCount: number;
  readonly totalMarksSum: number;
  readonly averagePageUtilizationPercent: number;
}
