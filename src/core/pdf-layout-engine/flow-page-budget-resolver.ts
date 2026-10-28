/**
 * @file flow-page-budget-resolver.ts
 * @description يشتق ميزانية الارتفاع الحقيقية لكل صفحة من القياس الحي: الارتفاع الداخلي − الترويسة (الأولى أو الجارية) − التذييل − أمان.
 * بهذا لا تُفسد ترويسة طويلة (عنوان من سطرين، شعار، شارة) الحساب كما كان يحدث مع الأرقام الثابتة 915/1020.
 */

import {
  FLOW_FALLBACK_FIRST_PAGE_BUDGET_PX,
  FLOW_FALLBACK_NEXT_PAGE_BUDGET_PX,
  FLOW_PAGE_INNER_HEIGHT_PX,
  FLOW_PAGE_SAFETY_PX,
} from "./flow-page-geometry-constants";

export const MODULE_ID_FLOW_PAGE_BUDGET_RESOLVER = "flow_page_budget_resolver" as const;

export interface FlowChromeHeightsPx {
  readonly firstHeaderPx: number;
  readonly runningHeaderPx: number;
  readonly footerPx: number;
}

export interface FlowPageBudgetsPx {
  readonly firstPagePx: number;
  readonly nextPagePx: number;
}

export const FALLBACK_FLOW_PAGE_BUDGETS: FlowPageBudgetsPx = {
  firstPagePx: FLOW_FALLBACK_FIRST_PAGE_BUDGET_PX,
  nextPagePx: FLOW_FALLBACK_NEXT_PAGE_BUDGET_PX,
};

export function resolveFlowPageBudgets(chrome: FlowChromeHeightsPx | undefined): FlowPageBudgetsPx {
  if (!chrome || chrome.firstHeaderPx <= 0 || chrome.runningHeaderPx <= 0 || chrome.footerPx <= 0) {
    return FALLBACK_FLOW_PAGE_BUDGETS;
  }
  const body = FLOW_PAGE_INNER_HEIGHT_PX - chrome.footerPx - FLOW_PAGE_SAFETY_PX;
  return {
    firstPagePx: Math.floor(body - chrome.firstHeaderPx),
    nextPagePx: Math.floor(body - chrome.runningHeaderPx),
  };
}
