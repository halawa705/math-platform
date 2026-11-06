/**
 * @file figure-kind-resolver.ts
 * @description محدد نوع الشكل الموحد (FigureKind Resolver - المرحلة 2.1):
 * يحدد نوع الشكل مسبقاً من وسوم الرسم والمواصفة المهيكلة وسياق المسألة،
 * مما يمنع التضارب بين المحللات وسلاسل المطابقة العشوائية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 200 سطر).
 */

import type { FigureKind } from "../../ssot/figure-kind-ssot";
import type { MathBranchId } from "../../ssot/math-branches-ssot";
import type { ParsedFigureTagPayload } from "../../ssot/figure-tag-grammar-ssot";
import type { GeometryProblemSpec } from "../../ssot/geometry-archetype-ssot";
import { isPurelyTheoreticalNoDiagramProblem } from "../verification/geometry-figure-fidelity-gate";

export const MODULE_ID_FIGURE_KIND_RESOLVER = "figure_kind_resolver" as const;

export interface FigureKindResolutionParams {
  readonly rawText: string;
  readonly tagPayload?: ParsedFigureTagPayload | null;
  readonly problemSpec?: GeometryProblemSpec | null;
  readonly branchId?: MathBranchId;
}

const SPATIAL_3D_KEYWORDS_REGEX =
  /(?:^|\s)(?:هرم|مخروط|أسطوانة|اسطوانة|مكعب|متوازي\s*مستطيلات|منشور|مجسم)(?:\s|$|[،.؛])/i;

const NUMBER_LINE_KEYWORDS_REGEX =
  /(?:خط\s*الأعداد|فترة\s*(?:مغلقة|مفتوحة|نصف|حقيقية)?|\\in\s*\[|\\in\s*\])/i;

const STATS_KEYWORDS_REGEX =
  /(?:مخطط\s*صندوق|مدرج\s*تكراري|قطاع(?:ات)?\s*دائري(?:ة)?|أعمدة\s*بيانية|مخطط\s*النقاط|جدول\s*تكراري)/i;

const CARTESIAN_FUNCTION_REGEX =
  /(?:دالة\s*(?:تربيعية|خطية|مقياس|كسرية)|ارسم\s*منحنى|رأس\s*المنحنى|مستوى\s*إحداثي|شبكة\s*تربيعية|ص\s*=\s*[0-9\-+]*\s*س|y\s*=\s*)/i;

const AREA_MODEL_REGEX =
  /(?:نموذج\s*مساحة\s*المستطيل|نموذج\s*المساحة|مساحة\s*المستطيل\s*الحسابي)/i;

/**
 * يحدد نوع الشكل بدقة تامة وبصورة حتمية قبل الدخول في محركات الإنشاء
 */
export function resolveFigureKind(params: FigureKindResolutionParams): FigureKind {
  const { rawText, tagPayload, problemSpec, branchId } = params;

  // 1. إذا كان هناك وسم مصنف صريح، اعتمد نوعه كأولوية مع فحص المحتوى الداخلي
  if (tagPayload) {
    if (tagPayload.kind === "statistics") return "statistics_chart";
    if (tagPayload.kind === "graph") return "cartesian_function";
    if (tagPayload.kind === "visual_model") return "arithmetic_visual_model";

    // وسم هندسي [رسم هندسي: ...] قد يكون مجسماً أو خط أعداد أو هندسة مستوية
    const content = tagPayload.content;
    if (SPATIAL_3D_KEYWORDS_REGEX.test(content)) return "spatial_3d";
    if (NUMBER_LINE_KEYWORDS_REGEX.test(content)) return "number_line";
    if (AREA_MODEL_REGEX.test(content)) return "arithmetic_visual_model";
    if (CARTESIAN_FUNCTION_REGEX.test(content) && !/مثلث|دائرة|شبه\s*منحرف|متوازي/i.test(content)) {
      return "cartesian_function";
    }
    return "euclidean_plane";
  }

  // 2. فحص المسائل النظرية البحتة الخالية من الوسوم
  if (isPurelyTheoreticalNoDiagramProblem(rawText)) {
    return "none";
  }

  // 3. فحص الفرع الدلالي والكلمات الدلالية المباشرة
  if (branchId === "statistics_probability" || STATS_KEYWORDS_REGEX.test(rawText)) {
    return "statistics_chart";
  }

  if (AREA_MODEL_REGEX.test(rawText)) {
    return "arithmetic_visual_model";
  }

  if (SPATIAL_3D_KEYWORDS_REGEX.test(rawText)) {
    return "spatial_3d";
  }

  if (branchId === "functions" || CARTESIAN_FUNCTION_REGEX.test(rawText)) {
    if (!/(?:في|من)?\s*الشكل\s*(?:المقابل|المجاور)|مثلث|دائرة|متوازي/i.test(rawText)) {
      return "cartesian_function";
    }
  }

  if (NUMBER_LINE_KEYWORDS_REGEX.test(rawText)) {
    return "number_line";
  }

  // 4. فحص مواصفة المسألة المهيكلة
  if (problemSpec && problemSpec.objects.length > 0) {
    const hasEuclideanObjects = problemSpec.objects.some(
      (o) =>
        o.kind === "triangle" ||
        o.kind === "circle" ||
        o.kind === "quadrilateral" ||
        o.kind === "polygon" ||
        o.kind === "segment"
    );
    if (hasEuclideanObjects) {
      return "euclidean_plane";
    }
  }

  // 5. فحص القرائن الإقليدية في النص
  const hasSpatialCue =
    /(?:في|من|بـ)?\s*الشكل\s*(?:المقابل|المجاور|المرسوم|الموضح)|مستعيناً\s*بالشكل/i.test(rawText);
  const hasEuclideanEntity =
    /مثلث|دائرة|متوازي\s*أضلاع|مستطيل|مربع|معين|شبه\s*منحرف|وتر|مماس|قاطع|منصف|قطر|زاوية/i.test(rawText);

  if (hasSpatialCue && hasEuclideanEntity) {
    return "euclidean_plane";
  }

  if (branchId === "plane_geometry" || branchId === "analytic_geometry") {
    if (hasEuclideanEntity) return "euclidean_plane";
  }

  return "none";
}
