/**
 * @file a4-block-height-estimator.ts
 * @description حاسب الارتفاعات الدقيق بالـ Point الطباعي (`pt`) لكل عنصر قبل التوزيع على صفحات A4.
 * يراعي حجم الخط الحقيقي المختار (`12pt` إلى `16pt`)، معامل توفير الخط (`spaceSavingFactor`)،
 * ووجود شكل هندسي مدمج أفقياً، وعدد أسطر الإجابة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import {
  PRINT_FONT_FAMILIES_SSOT,
  type PDFPrintSettingsStateSSOT,
} from "../ssot/pdf-print-settings-ssot";
import { resolveAdaptiveMCQColumnsCount } from "./adaptive-mcq-options-grid-solver";

export const MODULE_ID_A4_BLOCK_HEIGHT_ESTIMATOR =
  "a4_block_height_estimator" as const;

export const A4_PAGE_TOTAL_HEIGHT_PT = 841.89 as const;
export const A4_VERTICAL_MARGINS_SUM_PT = 34 as const; // 6mm top + 6mm bottom
export const A4_COMPACT_SOVEREIGN_HEADER_HEIGHT_PT = 42 as const;
export const A4_COMPACT_FOOTER_HEIGHT_PT = 18 as const;

export interface QuestionHeightEstimationInput {
  readonly promptTextLength: number;
  readonly isMCQ: boolean;
  readonly mcqChoices?: readonly string[];
  readonly hasAttachedDiagram: boolean;
  readonly answerLinesCount: number;
  readonly settings: PDFPrintSettingsStateSSOT;
}

/**
 * يقدّر الارتفاع الفعلي لبطاقة السؤال بالـ `pt` بدقة حتمية لمنع انقسام البطاقة أو فيضان الصفحة.
 */
export function estimateQuestionCardHeightPt(
  input: QuestionHeightEstimationInput
): number {
  const { settings } = input;
  const fontSpec = PRINT_FONT_FAMILIES_SSOT[settings.fontFamilyId];
  const lineHeightPt =
    settings.exactFontSizePt * fontSpec.optimalLineHeight * fontSpec.spaceSavingFactor;

  const isTwoCol = settings.columnsCount === 2;
  const charsPerLine = isTwoCol ? 42 : 86;

  // 1. ارتفاع رأس البطاقة (رقم السؤال + الفرع + الدرجة)
  const cardHeaderPt = lineHeightPt + 6;

  // 2. ارتفاع نص السؤال
  const effectiveCharsPerLine = input.hasAttachedDiagram
    ? Math.floor(charsPerLine * 0.62)
    : charsPerLine;
  const promptLines = Math.max(
    1,
    Math.ceil(input.promptTextLength / Math.max(20, effectiveCharsPerLine))
  );
  const promptHeightPt = promptLines * lineHeightPt;

  // 3. إذا وُجد شكل هندسي مدمج أفقياً (Side-by-Side)، يكون الارتفاع هو الأكبر بين النص والشكل (96pt)
  const bodyHeightPt = input.hasAttachedDiagram
    ? Math.max(promptHeightPt, 94)
    : promptHeightPt;

  // 4. ارتفاع بدائل الاختيار من متعدد (MCQ)
  let mcqHeightPt = 0;
  if (input.isMCQ && input.mcqChoices) {
    const cols = resolveAdaptiveMCQColumnsCount(input.mcqChoices, isTwoCol);
    const rows = cols === 4 ? 1 : cols === 2 ? 2 : 4;
    mcqHeightPt = rows * (lineHeightPt + 4) + 4;
  }

  // 5. ارتفاع أسطر الإجابة أو نموذج الحل
  let answerZonePt = 0;
  if (
    settings.answerVisibilityMode === "questions_only" &&
    !input.isMCQ &&
    settings.answerSpaceStyle !== "hidden"
  ) {
    answerZonePt = input.answerLinesCount * 14 + 6;
  } else if (settings.answerVisibilityMode !== "questions_only") {
    answerZonePt = lineHeightPt * 1.8 + 8;
  }

  const paddingPt =
    settings.densityMode === "ultra_compact"
      ? 10
      : settings.densityMode === "standard_balanced"
      ? 16
      : 22;

  return Math.ceil(cardHeaderPt + bodyHeightPt + mcqHeightPt + answerZonePt + paddingPt);
}
