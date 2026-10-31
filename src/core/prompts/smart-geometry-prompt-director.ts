/**
 * @file smart-geometry-prompt-director.ts
 * @description الموجه الذكي المضغوط لبرومبتات الهندسة لـ NotebookLM (< 355 حرفاً).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 90 سطراً).
 */

import type { MathBranchId } from "../ssot/math-branches-ssot";
import type { MathNotationLanguage } from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_SMART_GEOMETRY_PROMPT_DIRECTOR =
  "smart_geometry_prompt_director" as const;

export interface GeometryPromptDetectionParams {
  readonly branchId?: MathBranchId;
  readonly notationLanguage?: MathNotationLanguage;
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
  return /هندسة|تشابه|مضلع|مثلث|دائرة|شبه\s*منحرف|متوازي|معين|مستطيل|مربع|طائرة\s*ورقية|دالتون|أوتار|مماس|قاطع|إقليدس|فيثاغورس|طاليس|منصف|إحداثي|حجوم|مساحات|زوايا|زاوية|تقاطع/i.test(
    combined
  );
}

export function buildSmartGeometryPromptGuidance(
  params: GeometryPromptDetectionParams
): string {
  if (!isGeometryContext(params)) return "";
  if (params.notationLanguage === "arabic") {
    return "📐 توجيه الإخراج الهندسي الذكي: للشكل فقط اكتب `[رسم هندسي: ...]` كحقائق بـ `;` بلا كود: الرؤوس (مثلث أ ب جـ قائم في ب|ABCD ~ EFGH)؛ أطوال الأضلاع مع قيمها ووحداتها (أ ب=6 سم)؛ قياسات الزوايا الدقيقة (ق(∠ب)=60°;د هـ // ب جـ;أ د ⊥ ب جـ). ممنوع وسم عائم بلا رؤوس؛ الأسئلة النظرية بلا وسم. وللدوال: `[رسم بياني: ص=٢س+١]`.";
  }
  return "📐 توجيه الإخراج الهندسي الذكي: للشكل فقط اكتب `[رسم هندسي: ...]` كحقائق بـ `;` بلا كود: الرؤوس (مثلث ABC قائم في B|ABCD ~ EFGH)؛ أطوال الأضلاع مع قيمها ووحداتها (AB=6 سم)؛ قياسات الزوايا الدقيقة (m(∠B)=60°;DE // BC;AD ⊥ BC). ممنوع وسم عائم بلا رؤوس؛ الأسئلة النظرية بلا وسم. وللدوال: `[رسم بياني: y=2x+1]`.";
}
