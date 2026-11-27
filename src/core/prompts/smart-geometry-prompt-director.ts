/**
 * @file smart-geometry-prompt-director.ts
 * @description المنسق الموحد للتوجيهات الذكية للرسوم والنماذج لـ NotebookLM (المرحلة 1.3):
 * يوجه البرومبت بحسب نوع المادة والصف مع دعم الاختبارات والنماذج الشاملة متعددة الفروع
 * (هندسة + إحصاء + دوال) دون أن يلغي أحدها الآخر.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 105 سطراً).
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

const GEOMETRY_CONTEXT_CUES_REGEX =
  /هندسة|تشابه|مضلع|مثلث|مثلثية|نسب\s*مثلثية|حساب\s*المثلثات|جا|جتا|ظا|وتر|قائم|دائرة|شبه\s*منحرف|متوازي|معين|مستطيل|مربع|محيط|مساحة|أشكال\s*مركبة|تركيب\s*شكل|تطبيقات\s*الوحدات|طائرة\s*ورقية|سلم|برج|عمود|ظل|دالتون|أوتار|مماس|قاطع|إقليدس|فيثاغورس|طاليس|منصف|إحداثي|حجوم|مساحات|زوايا|زاوية|تقاطع|إحصاء|مدرج|صندوق|أعمدة|قطاع|دالة|منحنى|شبكة\s*تربيعية|شريطي|ساعة|نهاية\s*الترم|كامل\s*(?:وحدات|المنهج)/i;

const EXPLICIT_GEOMETRY_SHAPE_CUES_REGEX =
  /هندسة|تشابه|مضلع|مثلث|مثلثية|حساب\s*المثلثات|دائرة|شبه\s*منحرف|متوازي|معين|مستطيل|مربع|محيط|مساحة|أشكال\s*مركبة|تركيب\s*شكل|تطبيقات\s*الوحدات|زوايا|زاوية|توازي|فيثاغورس|إقليدس|طاليس|حجوم|مساحات|نهاية\s*الترم|كامل\s*(?:وحدات|المنهج)/i;

const STATS_CUES_REGEX = /إحصاء|بيانات|مدرج|صندوق|أعمدة|قطاع|تكرار/i;
const FUNCTIONS_CUES_REGEX = /دالة|تربيعية|خطية|مقياس|منحنى|رسم\s*بياني/i;

export function isGeometryContext(params: GeometryPromptDetectionParams): boolean {
  if (
    params.branchId === "plane_geometry" ||
    params.branchId === "solid_geometry" ||
    params.branchId === "analytic_geometry" ||
    params.branchId === "trigonometry" ||
    params.branchId === "statics" ||
    params.branchId === "dynamics" ||
    params.branchId === "statistics_probability" ||
    params.branchId === "functions"
  ) {
    return true;
  }
  const combined = `${params.unitTitleArabic || ""} ${params.lessonTitleArabic || ""}`.trim();
  if (!combined) return false;
  return GEOMETRY_CONTEXT_CUES_REGEX.test(combined);
}

export function buildSmartGeometryPromptGuidance(
  params: GeometryPromptDetectionParams
): string {
  if (!isGeometryContext(params)) return "";

  const combined = `${params.unitTitleArabic || ""} ${params.lessonTitleArabic || ""}`.trim();
  const notation: MathNotationLanguage = params.notationLanguage || "english";

  const isGeoBranch =
    params.branchId === "plane_geometry" ||
    params.branchId === "solid_geometry" ||
    params.branchId === "analytic_geometry" ||
    params.branchId === "trigonometry" ||
    params.branchId === "statics" ||
    params.branchId === "dynamics";

  const hasGeoCue = isGeoBranch || EXPLICIT_GEOMETRY_SHAPE_CUES_REGEX.test(combined);
  const hasStatsCue = params.branchId === "statistics_probability" || STATS_CUES_REGEX.test(combined);
  const hasFunctionsCue = params.branchId === "functions" || FUNCTIONS_CUES_REGEX.test(combined);

  // 1. دروس/فرع الإحصاء البحت بدون هندسة أو شمول نهاية الترم
  if (hasStatsCue && !hasGeoCue) {
    return buildStatisticsFigurePromptGuidance();
  }

  // 2. دروس/فرع الدوال البحت بدون هندسة أو شمول نهاية الترم
  if (hasFunctionsCue && !hasGeoCue) {
    return buildCartesianFunctionsPromptGuidance(notation);
  }

  // 3. المرحلة الابتدائية أو الإعدادية للهندسة (مع إرفاق توجيه مختصر للإحصاء/الدوال في الاختبارات الشاملة)
  const isPrimary =
    params.stage === "primary" ||
    (params.gradeId ? params.gradeId.startsWith("prim") : false) ||
    /ابتدائي|شريط|ساعة|وحدات\s*مربعة/i.test(combined);

  const primaryOrPrepGeo = isPrimary
    ? buildPrimaryStageFigurePromptGuidance(notation)
    : buildPrepStageFigurePromptGuidance(notation);

  const isComprehensiveExam = /نهاية\s*الترم|كامل\s*(?:وحدات|المنهج)/i.test(combined);
  if (hasStatsCue || hasFunctionsCue || isComprehensiveExam) {
    return `${primaryOrPrepGeo}\n📊📈 وفي مسائل الإحصاء/الدوال اكتب \`[رسم إحصائي: نوع=... ; ...]\` أو \`[رسم بياني: ...]\` بنفس الصيغة بلا كود.`;
  }

  return primaryOrPrepGeo;
}
