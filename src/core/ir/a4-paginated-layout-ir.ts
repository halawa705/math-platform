/**
 * @file a4-paginated-layout-ir.ts
 * @description العقد الموحد لعدد أعمدة الاختيار من متعدد المتكيفة في تخطيط صفحات A4.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 200 سطر).
 */

export const MODULE_ID_A4_PAGINATED_LAYOUT_IR = "a4_paginated_layout_ir" as const;

export type MCQAdaptiveColumnsCount = 4 | 2 | 1;
