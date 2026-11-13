/**
 * @file page-occupancy-target-ssot.ts
 * @description المصدر الوحيد لهدف إشغال صفحة A4 في المذكرات: الإشغال الخام (قبل تمديد البطاقات والفراغات) لا يقل عن 90% لكل صفحة عدا الأخيرة.
 */

export const MODULE_ID_PAGE_OCCUPANCY_TARGET_SSOT = "page_occupancy_target_ssot" as const;

/** الحد الأدنى للإشغال الخام لكل صفحة غير أخيرة. */
export const MIN_RAW_PAGE_OCCUPANCY_RATIO = 0.9 as const;

/** صفحة أخيرة أقل من هذه النسبة تُعتبر ورقة مهدرة وتستدعي محاولة إنقاذ. */
export const LAST_PAGE_RESCUE_THRESHOLD_RATIO = 0.35 as const;

/** أرضية حجم الخط المطبوع (pt) في أوضاع الملاءمة التلقائية للمذكرات. */
export const BOOKLET_MIN_FONT_PT = 12 as const;

export function isPageBelowOccupancyTarget(rawFillRatio: number, isLastPage: boolean): boolean {
  return !isLastPage && rawFillRatio < MIN_RAW_PAGE_OCCUPANCY_RATIO;
}
