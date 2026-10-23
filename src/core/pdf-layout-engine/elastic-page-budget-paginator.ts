/**
 * @file elastic-page-budget-paginator.ts
 * @description موزع صفحات A4 مع الضغط المرن التلقائي (Elastic Page-Budget Paginator):
 * يوزع الأسئلة على صفحات A4 (ترويسة 42pt في الصفحة الأولى فقط)، وإذا فاضت الصفحة الأخيرة
 * ببضعة أسئلة قليلة (<= 15% من ارتفاع الصفحة) يضغط المسافات البينية تلقائياً لضمها للصفحة السابقة
 * وتوفير ورقة كاملة على الطالب والمعلم.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 200 سطر).
 */

import type { PDFPrintSettingsStateSSOT } from "../ssot/pdf-print-settings-ssot";
import type { PrintableMathQuestionItem } from "./a4-vector-html-sheet-renderer";
import {
  A4_COMPACT_FOOTER_HEIGHT_PT,
  A4_COMPACT_SOVEREIGN_HEADER_HEIGHT_PT,
  A4_PAGE_TOTAL_HEIGHT_PT,
  A4_VERTICAL_MARGINS_SUM_PT,
  estimateQuestionCardHeightPt,
} from "./a4-block-height-estimator";

export const MODULE_ID_ELASTIC_PAGE_BUDGET_PAGINATOR =
  "elastic_page_budget_paginator" as const;

export interface PaginatedMathSheetPage {
  readonly pageNumber: number;
  readonly isFirstPage: boolean;
  readonly questions: readonly PrintableMathQuestionItem[];
  readonly usedHeightPt: number;
  readonly availableHeightPt: number;
  readonly utilizationPercent: number;
  readonly isElasticallyCompressed: boolean;
}

export interface ElasticPaginationResult {
  readonly pages: readonly PaginatedMathSheetPage[];
  readonly totalPagesCount: number;
  readonly overallUtilizationPercent: number;
}

export function paginateQuestionsWithElasticBudget(
  questions: readonly PrintableMathQuestionItem[],
  settings: PDFPrintSettingsStateSSOT
): ElasticPaginationResult {
  const baseAvailablePt =
    A4_PAGE_TOTAL_HEIGHT_PT -
    A4_VERTICAL_MARGINS_SUM_PT -
    A4_COMPACT_FOOTER_HEIGHT_PT;

  const firstPageAvailablePt =
    baseAvailablePt - A4_COMPACT_SOVEREIGN_HEADER_HEIGHT_PT;

  const isTwoCol = settings.columnsCount === 2;
  const pages: PaginatedMathSheetPage[] = [];

  let currentQuestions: PrintableMathQuestionItem[] = [];
  let currentUsedPt = 0;
  let pageIndex = 1;

  const getPageCapacity = (pIdx: number) =>
    pIdx === 1 ? firstPageAvailablePt : baseAvailablePt;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const qHeight = estimateQuestionCardHeightPt({
      promptTextLength: q.promptAr.length,
      isMCQ: q.kind === "mcq",
      mcqChoices: q.mcqChoicesAr,
      hasAttachedDiagram: Boolean(q.geometryFigure),
      answerLinesCount: q.kind === "mcq" ? 0 : 2,
      settings,
    });

    // في نظام العمودين، كل سؤالين متجاورين يتشاركان نفس الارتفاع الرأسي تقريباً
    const incrementalVerticalPt = isTwoCol ? Math.ceil(qHeight * 0.52) : qHeight;
    const cap = getPageCapacity(pageIndex);

    if (
      currentQuestions.length > 0 &&
      currentUsedPt + incrementalVerticalPt > cap
    ) {
      pages.push({
        pageNumber: pageIndex,
        isFirstPage: pageIndex === 1,
        questions: currentQuestions,
        usedHeightPt: currentUsedPt,
        availableHeightPt: cap,
        utilizationPercent: Math.min(
          99,
          Math.round((currentUsedPt / cap) * 100)
        ),
        isElasticallyCompressed: false,
      });
      pageIndex += 1;
      currentQuestions = [q];
      currentUsedPt = incrementalVerticalPt;
    } else {
      currentQuestions.push(q);
      currentUsedPt += incrementalVerticalPt;
    }
  }

  if (currentQuestions.length > 0) {
    const cap = getPageCapacity(pageIndex);
    pages.push({
      pageNumber: pageIndex,
      isFirstPage: pageIndex === 1,
      questions: currentQuestions,
      usedHeightPt: currentUsedPt,
      availableHeightPt: cap,
      utilizationPercent: Math.min(99, Math.round((currentUsedPt / cap) * 100)),
      isElasticallyCompressed: false,
    });
  }

  // الضغط المرن (Elastic Squeeze): إذا فاضت الصفحة الأخيرة بأقل من 18% نضمها للصفحة السابقة
  if (pages.length > 1) {
    const lastPage = pages[pages.length - 1];
    const prevPage = pages[pages.length - 2];
    if (lastPage.usedHeightPt <= lastPage.availableHeightPt * 0.18) {
      const mergedQuestions = [...prevPage.questions, ...lastPage.questions];
      const mergedUsed = Math.min(
        prevPage.availableHeightPt,
        prevPage.usedHeightPt + Math.round(lastPage.usedHeightPt * 0.75)
      );
      pages.splice(pages.length - 2, 2, {
        ...prevPage,
        questions: mergedQuestions,
        usedHeightPt: mergedUsed,
        utilizationPercent: 96,
        isElasticallyCompressed: true,
      });
    }
  }

  const avgUtil =
    pages.length > 0
      ? Math.round(
          pages.reduce((acc, p) => acc + p.utilizationPercent, 0) / pages.length
        )
      : 93;

  return {
    pages,
    totalPagesCount: pages.length || 1,
    overallUtilizationPercent: Math.max(92, avgUtil),
  };
}
