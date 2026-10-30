/**
 * @file smart-geometry-prompt-director.ts
 * @description الموجه الذكي المضغوط لبرومبتات الهندسة لـ NotebookLM (< 370 حرفاً).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 90 سطراً).
 */

import type { MathBranchId } from "../ssot/math-branches-ssot";

export const MODULE_ID_SMART_GEOMETRY_PROMPT_DIRECTOR =
  "smart_geometry_prompt_director" as const;

export interface GeometryPromptDetectionParams {
  readonly branchId?: MathBranchId;
  readonly lessonTitleArabic?: string;
  readonly unitTitleArabic?: string;
}

export function isGeometryContext(params: GeometryPromptDetectionParams): boolean {
  if (
    params.branchId === "plane_geometry" ||
    params.branchId === "solid_geometry" ||
    params.branchId === "analytic_geometry"
  ) {
    return true;
  }
  const combined = `${params.unitTitleArabic || ""} ${params.lessonTitleArabic || ""}`.trim();
  if (!combined) return false;
  return /هندسة|تشابه|مضلع|مثلث|دائرة|شبه\s*منحرف|متوازي|معين|مستطيل|مربع|طائرة\s*ورقية|دالتون|أوتار|مماس|قاطع|إقليدس|فيثاغورس|طاليس|منصف|إحداثي|حجوم|مساحات/i.test(
    combined
  );
}

export function buildSmartGeometryPromptGuidance(
  params: GeometryPromptDetectionParams
): string {
  if (!isGeometryContext(params)) return "";
  return "📐 توجيه الإخراج الهندسي الذكي: للشكل فقط اكتب `[رسم هندسي: ...]` كحقائق بـ `;` بلا كود: الشكل والرؤوس والتناظر (مثلث أ ب جـ قائم في ب | دائرة م ; نق=5 | ABCD ~ EFGH) ؛ أطوال الأضلاع مع قيمها ووحداتها (أ ب=6 سم ; DA=1.5√3 سم) ؛ قياسات الزوايا الدقيقة والعلاقات (ق(∠ب)=60° ; د منتصف أ ب ; د هـ // ب جـ ; أ د ⊥ ب جـ). وللدوال: `[رسم بياني: ص=٢س+١ ; نقطة (٠,١) أ]`.";
}
