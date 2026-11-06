/**
 * @file smart-geometry-prompt-director.ts
 * @description المنسق الموحد للتوجيهات الذكية للرسوم والنماذج لـ NotebookLM (المرحلة 1.3):
 * يوجه البرومبت بحسب نوع المادة والصف:
 * - المرحلة الابتدائية (نماذج بصرية ومساحات).
 * - المرحلة الإعدادية (هندسة مستوية وتشابه وإقليدس ودوائر).
 * - الإحصاء والبيانات (مدرجات، قطاعات، صندوق).
 * - الدوال والرسوم الكارتيزية (خطية، تربيعية، شبكة إحداثية).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 100 سطر).
 */

import type { MathBranchId } from "../ssot/math-branches-ssot";
import type { MathNotationLanguage } from "../ssot/numeral-and-unit-ssot";
import { buildPrimaryStageFigurePromptGuidance } from "./geometry-prompt-guidance-primary";
import { buildPrepStageFigurePromptGuidance } from "./geometry-prompt-guidance-prep";
import { buildStatisticsFigurePromptGuidance } from "./geometry-prompt-guidance-statistics";
import { buildCartesianFunctionsPromptGuidance } from "./geometry-prompt-guidance-functions";

export const MODULE_ID_SMART_GEOMETRY_PROMPT_DIRECTOR =
  "smart_geometry_prompt_director" as const;

export interface GeometryPromptDetectionParams {
  readonly branchId?: MathBranchId;
  readonly notationLanguage?: MathNotationLanguage;
  readonly lessonTitleArabic?: string;
  readonly unitTitleArabic?: string;
  readonly gradeId?: string;
  readonly stage?: "primary" | "preparatory" | "secondary";
}

export function isGeometryContext(params: GeometryPromptDetectionParams): boolean {
  if (
    params.branchId === "plane_geometry" ||
    params.branchId === "solid_geometry" ||
    params.branchId === "analytic_geometry" ||
    params.branchId === "statistics_probability" ||
    params.branchId === "functions"
  ) {
    return true;
  }
  const combined = `${params.unitTitleArabic || ""} ${params.lessonTitleArabic || ""}`.trim();
  if (!combined) return false;
  return /هندسة|تشابه|مضلع|مثلث|دائرة|شبه\s*منحرف|متوازي|معين|مستطيل|مربع|طائرة\s*ورقية|دالتون|أوتار|مماس|قاطع|إقليدس|فيثاغورس|طاليس|منصف|إحداثي|حجوم|مساحات|زوايا|زاوية|تقاطع|إحصاء|مدرج|صندوق|أعمدة|قطاع|دالة|منحنى|شبكة\s*تربيعية|شريطي|ساعة/i.test(
    combined
  );
}

export function buildSmartGeometryPromptGuidance(
  params: GeometryPromptDetectionParams
): string {
  if (!isGeometryContext(params)) return "";

  const combined = `${params.unitTitleArabic || ""} ${params.lessonTitleArabic || ""}`.trim();
  const notation: MathNotationLanguage = params.notationLanguage || "english";

  // 1. فرع أو دروس الإحصاء
  if (params.branchId === "statistics_probability" || /إحصاء|بيانات|مدرج|صندوق|أعمدة|قطاع|تكرار/i.test(combined)) {
    return buildStatisticsFigurePromptGuidance();
  }

  // 2. فرع أو دروس الدوال والرسوم الكارتيزية
  if (params.branchId === "functions" || /دالة|تربيعية|خطية|مقياس|منحنى|رسم\s*بياني/i.test(combined)) {
    return buildCartesianFunctionsPromptGuidance(notation);
  }

  // 3. المرحلة الابتدائية (الصفوف 3–6)
  const isPrimary =
    params.stage === "primary" ||
    (params.gradeId ? params.gradeId.startsWith("prim") : false) ||
    /ابتدائي|شريط|ساعة|وحدات\s*مربعة/i.test(combined);

  if (isPrimary) {
    return buildPrimaryStageFigurePromptGuidance(notation);
  }

  // 4. المرحلة الإعدادية والهندسة العامة
  return buildPrepStageFigurePromptGuidance(notation);
}
