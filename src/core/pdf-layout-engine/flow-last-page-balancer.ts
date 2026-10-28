/**
 * @file flow-last-page-balancer.ts
 * @description موازن الصفحات: يجرّب التوزيع الأمثل أولاً؛ فإن بقيت صفحة أخيرة شبه فارغة (< 55%) يقلل ميزانية كل الصفحات
 * بأصغر معامل ممكن يُبقي عدد الصفحات كما هو، فتتقارب أحمال الصفحات ولا تظهر صفحة بمثال وحيد.
 */

import { FLOW_LAST_PAGE_MIN_FILL_RATIO, FLOW_MIN_BUDGET_FACTOR } from "./flow-page-geometry-constants";
import type { FlowItem, FlowPage } from "./flow-item-model";
import { packFlowItemsIntoPages } from "./flow-page-packer";

export const MODULE_ID_FLOW_LAST_PAGE_BALANCER = "flow_last_page_balancer" as const;

const BALANCE_SEARCH_ITERATIONS = 10;

export function packFlowItemsWithPageBalance(
  items: readonly FlowItem[],
  heights: ReadonlyMap<string, number>
): readonly FlowPage[] {
  const full = packFlowItemsIntoPages(items, heights, { budgetFactor: 1 });
  if (full.length < 2) return full;

  const last = full[full.length - 1];
  if (last.usedHeightPx >= last.budgetHeightPx * FLOW_LAST_PAGE_MIN_FILL_RATIO) return full;

  let low = FLOW_MIN_BUDGET_FACTOR;
  let high = 1;
  for (let i = 0; i < BALANCE_SEARCH_ITERATIONS; i++) {
    const mid = (low + high) / 2;
    if (packFlowItemsIntoPages(items, heights, { budgetFactor: mid }).length <= full.length) high = mid;
    else low = mid;
  }
  return packFlowItemsIntoPages(items, heights, { budgetFactor: high });
}
