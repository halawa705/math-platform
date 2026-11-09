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
import { COMPACT_HEADER_HEIGHT_SAVING_PX } from "./adaptive-page-header-budget-resolver";

export const MODULE_ID_FLOW_PAGE_BUDGET_RESOLVER = "flow_page_budget_resolver" as const;

export interface FlowChromeHeightsPx {
  readonly firstHeaderPx: number;
  readonly runningHeaderPx: number;
  readonly footerPx: number;
}

export interface FlowPageBudgetsPx {
  readonly firstPagePx: number;
  readonly nextPagePx: number;
  readonly firstPageCompactPx?: number;
}

const FALLBACK_FLOW_PAGE_BUDGETS: FlowPageBudgetsPx = {
  firstPagePx: FLOW_FALLBACK_FIRST_PAGE_BUDGET_PX,
  nextPagePx: FLOW_FALLBACK_NEXT_PAGE_BUDGET_PX,
  firstPageCompactPx: FLOW_FALLBACK_FIRST_PAGE_BUDGET_PX + COMPACT_HEADER_HEIGHT_SAVING_PX,
};

export function resolveFlowPageBudgets(chrome: FlowChromeHeightsPx | undefined): FlowPageBudgetsPx {
  if (!chrome || chrome.firstHeaderPx <= 0 || chrome.runningHeaderPx <= 0 || chrome.footerPx <= 0) {
    return FALLBACK_FLOW_PAGE_BUDGETS;
  }
  const body = FLOW_PAGE_INNER_HEIGHT_PX - chrome.footerPx - FLOW_PAGE_SAFETY_PX;
  const firstPagePx = Math.floor(body - chrome.firstHeaderPx);
  const compactFirstHeaderPx = Math.max(chrome.runningHeaderPx + 15, chrome.firstHeaderPx - COMPACT_HEADER_HEIGHT_SAVING_PX);
  return {
    firstPagePx,
    nextPagePx: Math.floor(body - chrome.runningHeaderPx),
    firstPageCompactPx: Math.floor(body - compactFirstHeaderPx),
  };
}
