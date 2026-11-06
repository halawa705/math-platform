/**
 * @file figure-kind-ssot.ts
 * @description المصدر الموحد للحقيقة لتصنيف نوع الشكل أو الرسم (FigureKind - المرحلة 2.1):
 * يحدد نوع الشكل مبكراً قبل التوجيه والتفكيك لمنع التداخل بين العائلات الرياضية المختلفة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 100 سطر).
 */

export const MODULE_ID_FIGURE_KIND_SSOT = "figure_kind_ssot" as const;

export type FigureKind =
  | "euclidean_plane"
  | "cartesian_function"
  | "statistics_chart"
  | "arithmetic_visual_model"
  | "spatial_3d"
  | "number_line"
  | "none";

export function isEuclideanFigureKind(kind: FigureKind): boolean {
  return kind === "euclidean_plane";
}

export function isCartesianFigureKind(kind: FigureKind): boolean {
  return kind === "cartesian_function" || kind === "number_line";
}

export function isStatisticsFigureKind(kind: FigureKind): boolean {
  return kind === "statistics_chart";
}

export function isVisualModelFigureKind(kind: FigureKind): boolean {
  return kind === "arithmetic_visual_model";
}

export function isSpatial3DFigureKind(kind: FigureKind): boolean {
  return kind === "spatial_3d";
}
