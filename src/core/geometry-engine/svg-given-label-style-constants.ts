/**
 * @file svg-given-label-style-constants.ts
 * @description ثوابت النمط البصري الاحترافي لمعطيات الأشكال الهندسية بدون خلفية مصمتة (No-Fill Givens):
 * خلفية شفافة (`fill="none"`) مع هالة نصية بيضاء دقيقة (`paint-order="stroke"`) تحفظ وضوح الرقم
 * دون طمس أو إخفاء أي خط هندسي أو علامة تساوي خلفه.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 40 سطراً).
 */

export const MODULE_ID_SVG_GIVEN_LABEL_STYLE_CONSTANTS =
  "svg_given_label_style_constants" as const;

export const GIVEN_LABEL_BACKGROUND_FILL = "none" as const;
export const GIVEN_LABEL_HALO_STROKE = "#FFFFFF" as const;
export const GIVEN_LABEL_HALO_WIDTH = 2.4 as const;
export const UNKNOWN_LABEL_BORDER = "#F59E0B" as const;
export const UNKNOWN_LABEL_DASHARRAY = "2,1.5" as const;
