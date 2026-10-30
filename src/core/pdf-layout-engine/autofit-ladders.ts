/**
 * @file autofit-ladders.ts
 * @description سلالم الضغط/التوسيع للصفحات: كل درجة (Rung) = مجموعة قيم تُطبَّق معاً. الدرجة 0 هي الأريح للقراءة، والأخيرة هي الأضغط.
 */
export const MODULE_ID_AUTOFIT_LADDERS = "autofit_ladders" as const;

export type AutoFitModeId = "off" | "booklet_fill" | "exam_max_pages";

export interface AutoFitRung {
  readonly fontPt: number;
  readonly figureScale: number;
  readonly answerLines: 1 | 2 | 3;
  readonly compactHeader: boolean;
  readonly hideAccreditation: boolean;
}

const r = (fontPt: number, figureScale: number, answerLines: 1 | 2 | 3, compactHeader: boolean, hideAccreditation: boolean): AutoFitRung =>
  ({ fontPt, figureScale, answerLines, compactHeader, hideAccreditation });

const BOOKLET_FILL_LADDER: readonly AutoFitRung[] = [
  r(14, 1, 2, false, false), r(13.5, 1, 2, false, false), r(13, 1, 2, false, false),
  r(12.5, 1, 2, false, false), r(12, 1, 2, false, false), r(11.5, 1, 2, false, false),
];

const EXAM_MAX_PAGES_LADDER: readonly AutoFitRung[] = [
  r(13, 1.15, 3, false, false), r(12.5, 1, 3, false, false), r(12, 1, 2, false, false),
  r(12, 0.9, 2, true, false), r(11.5, 0.85, 2, true, true), r(11.5, 0.8, 1, true, true),
  r(11, 0.75, 1, true, true), r(10.5, 0.7, 1, true, true),
];

export function getLadderForMode(mode: AutoFitModeId): readonly AutoFitRung[] {
  return mode === "exam_max_pages" ? EXAM_MAX_PAGES_LADDER : mode === "booklet_fill" ? BOOKLET_FILL_LADDER : [];
}
