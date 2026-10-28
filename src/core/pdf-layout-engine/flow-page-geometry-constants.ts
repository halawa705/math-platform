/**
 * @file flow-page-geometry-constants.ts
 * @description ثوابت هندسة صفحة A4 (794×1123px) لمحرك التدفق: عرض المحتوى الداخلي، العمودان، وملفات الكثافة.
 * ميزانية ارتفاع الصفحة لم تعد رقماً ثابتاً؛ تُشتق حياً من قياس الترويسة والتذييل (flow-page-budget-resolver.ts).
 */

import type { PageDensityBudgetMode } from "../ssot/pdf-print-settings-ssot";

export const MODULE_ID_FLOW_PAGE_GEOMETRY_CONSTANTS =
  "flow_page_geometry_constants" as const;

export const FLOW_PAGE_WIDTH_PX = 794;
export const FLOW_PAGE_HEIGHT_PX = 1123;
export const FLOW_PAGE_PADDING_X_PX = 20;
export const FLOW_PAGE_PADDING_Y_PX = 18;

/** عرض المحتوى الداخلي = عرض الورقة − الهامشين الأفقيين (يطابق px-[20px] في الصفحة وفي الطباعة). */
export const FLOW_PAGE_INNER_WIDTH_PX = FLOW_PAGE_WIDTH_PX - FLOW_PAGE_PADDING_X_PX * 2;
export const FLOW_COLUMN_GAP_PX = 8;
export const FLOW_COLUMN_WIDTH_PX = (FLOW_PAGE_INNER_WIDTH_PX - FLOW_COLUMN_GAP_PX) / 2;

/** الارتفاع الداخلي المتاح بين هامشي الصفحة الرأسيين قبل خصم الترويسة والتذييل. */
export const FLOW_PAGE_INNER_HEIGHT_PX = FLOW_PAGE_HEIGHT_PX - FLOW_PAGE_PADDING_Y_PX * 2;

/** هامش أمان لتقريب البكسلات الجزئية وفروق الطباعة (لا يُترك أقل منه تحت المحتوى). */
export const FLOW_PAGE_SAFETY_PX = 8;

/** ميزانيات احتياطية تُستعمل فقط قبل اكتمال أول قياس حي للترويسة والتذييل. */
export const FLOW_FALLBACK_FIRST_PAGE_BUDGET_PX = 915;
export const FLOW_FALLBACK_NEXT_PAGE_BUDGET_PX = 1020;

/** صفحة لا تُمدَّد بطاقاتها إن قلّ امتلاؤها عن هذه النسبة (تجنباً لبطاقات متضخمة). */
export const FLOW_MIN_FILL_RATIO_FOR_STRETCH = 0.62;

export interface FlowDensityProfile {
  /** أقل مسافة بين كائنين: تحدد أقصى ضغط ممكن (أقل عدد أوراق). */
  readonly gapMinPx: number;
  /** أقصى مسافة تُوزَّع قبل اللجوء لتمديد البطاقات. */
  readonly gapMaxPx: number;
  /** أقصى زيادة تُضاف لارتفاع بطاقة واحدة عند ملء الفراغ. */
  readonly maxStretchPerItemPx: number;
  /** سقف الزيادة كنسبة من ارتفاع البطاقة الأصلي. */
  readonly maxStretchRatio: number;
}

export const FLOW_DENSITY_PROFILES: Record<PageDensityBudgetMode, FlowDensityProfile> = {
  ultra_compact: { gapMinPx: 2, gapMaxPx: 8, maxStretchPerItemPx: 90, maxStretchRatio: 0.4 },
  standard_balanced: { gapMinPx: 4, gapMaxPx: 12, maxStretchPerItemPx: 130, maxStretchRatio: 0.5 },
  booklet_relaxed: { gapMinPx: 6, gapMaxPx: 16, maxStretchPerItemPx: 170, maxStretchRatio: 0.6 },
};
