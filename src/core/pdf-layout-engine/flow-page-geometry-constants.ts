/**
 * @file flow-page-geometry-constants.ts
 * @description ثوابت هندسة صفحة A4 (794×1123px) لمحرك التدفق: عرض المحتوى الداخلي، العمودان، ميزانية الارتفاع،
 * وحدود المسافة المرنة بين الكائنات. مصدر واحد يستخدمه القياس والتوزيع والعرض معاً.
 */

export const MODULE_ID_FLOW_PAGE_GEOMETRY_CONSTANTS =
  "flow_page_geometry_constants" as const;

export const FLOW_PAGE_INNER_WIDTH_PX = 754;
export const FLOW_COLUMN_GAP_PX = 8;
export const FLOW_COLUMN_WIDTH_PX = (FLOW_PAGE_INNER_WIDTH_PX - FLOW_COLUMN_GAP_PX) / 2;

export const FLOW_FIRST_PAGE_BUDGET_PX = 915;
export const FLOW_SUBSEQUENT_PAGE_BUDGET_PX = 1020;

/** أقل مسافة بين كائنين (تُستخدم في اختبار الاتساع) وأقصاها (عند وجود فراغ يُوزَّع). */
export const FLOW_GAP_MIN_PX = 2;
export const FLOW_GAP_MAX_PX = 10;

/** فاصل «نهاية الفكرة» لا يُترك وحيداً في رأس صفحة: يُسمح له بتجاوز طفيف للميزانية. */
export const FLOW_DIVIDER_OVERFLOW_TOLERANCE_PX = 26;

/** إن قلّ امتلاء الصفحة الأخيرة عن هذه النسبة تُوزَّع الأحمال على الصفحات بالتساوي. */
export const FLOW_LAST_PAGE_MIN_FILL_RATIO = 0.55;
export const FLOW_MIN_BUDGET_FACTOR = 0.55;
