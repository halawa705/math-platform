/**
 * @file adaptive-page-header-budget-resolver.ts
 * @description محلل ترويسة الصفحة الأولى التكيفية المرنة: يحدد تلقائياً ما إذا كانت الصفحة الأولى
 * تحتاج الترويسة المدمجة الرشيقة (Compact Header) لتوفير ~45px إضافية لاستيعاب مسألة أو فكرة ومنع ترحيلها،
 * أو الإبقاء على الترويسة الفخمة الكاملة عند توفر المساحة وامتلاء الصفحة بشكل مريح.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 90 سطراً).
 */

export const MODULE_ID_ADAPTIVE_PAGE_HEADER_BUDGET_RESOLVER =
  "adaptive_page_header_budget_resolver" as const;

export interface AdaptiveHeaderDecision {
  readonly isHeaderCompact: boolean;
  readonly effectiveFirstPageBudgetPx: number;
  readonly spaceSavedPx: number;
}

/** متوسط فرق الارتفاع بين الترويسة الكاملة والمدمجة الرشيقة (~45px). */
export const COMPACT_HEADER_HEIGHT_SAVING_PX = 45;

/**
 * يحلل حاجة الصفحة الأولى للمساحة ويقرر حجم الترويسة الأمثل.
 */
export function resolveAdaptiveFirstPageHeader(params: {
  readonly standardFirstPageBudgetPx: number;
  readonly compactFirstPageBudgetPx?: number;
  readonly requiredFirstPageHeightPx: number;
  readonly manualCompactHeaderSetting?: boolean;
}): AdaptiveHeaderDecision {
  const {
    standardFirstPageBudgetPx,
    compactFirstPageBudgetPx,
    requiredFirstPageHeightPx,
    manualCompactHeaderSetting,
  } = params;

  const compactBudget =
    compactFirstPageBudgetPx ?? standardFirstPageBudgetPx + COMPACT_HEADER_HEIGHT_SAVING_PX;

  // إذا كان المعلم قد قفل الترويسة المدمجة يدوياً
  if (manualCompactHeaderSetting === true) {
    return {
      isHeaderCompact: true,
      effectiveFirstPageBudgetPx: compactBudget,
      spaceSavedPx: compactBudget - standardFirstPageBudgetPx,
    };
  }

  // إذا كان المحتوى يتسع بأريحية تامة في الميزانية القياسية دون الحاجة لضغط الترويسة
  if (requiredFirstPageHeightPx <= standardFirstPageBudgetPx) {
    return {
      isHeaderCompact: false,
      effectiveFirstPageBudgetPx: standardFirstPageBudgetPx,
      spaceSavedPx: 0,
    };
  }

  // إذا كان الفائض يقع في نطاق ما يمكن للترويسة المدمجة استيعابه
  if (requiredFirstPageHeightPx <= compactBudget + 3) {
    return {
      isHeaderCompact: true,
      effectiveFirstPageBudgetPx: compactBudget,
      spaceSavedPx: compactBudget - standardFirstPageBudgetPx,
    };
  }

  // إذا كان الفائض أكبر بكثير حتى مع الترويسة المدمجة (فالعنصر سيرحل على أي حال)، تبقى الترويسة فخمة
  return {
    isHeaderCompact: false,
    effectiveFirstPageBudgetPx: standardFirstPageBudgetPx,
    spaceSavedPx: 0,
  };
}
