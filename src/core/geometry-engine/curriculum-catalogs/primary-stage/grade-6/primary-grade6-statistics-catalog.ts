/**
 * @file primary-grade6-statistics-catalog.ts
 * @description السجل المركزي لمنسق نماذج إحصاء الصف السادس الابتدائي:
 * يربط بين الوصف العربي ومصيّرات الصندوق، النقاط، المدرج، والأعمدة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 90 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../../../ssot/numeral-and-unit-ssot";
import { buildGrade6BoxPlotFigure } from "./primary-grade6-box-plot-catalog";
import { buildGrade6DotPlotFigure } from "./primary-grade6-dot-plot-catalog";
import {
  buildGrade6HistogramFigure,
  buildGrade6BarChartFigure,
} from "./primary-grade6-histogram-bar-catalog";

export const MODULE_ID_PRIMARY_GRADE6_STATISTICS_CATALOG =
  "primary_grade6_statistics_catalog" as const;

export {
  buildGrade6BoxPlotFigure,
  buildGrade6DotPlotFigure,
  buildGrade6HistogramFigure,
  buildGrade6BarChartFigure,
};

/** المطابق الشامل لإحصاء الصف السادس الابتدائي */
export function matchPrimaryGrade6StatisticsFigure(
  description: string,
  figureId = "primary6_stat_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = description.trim();
  if (!d) return undefined;

  // 1. مخطط الصندوق
  if (
    /مخطط\s*الصندوق|الربيعيات|الربع\s*(?:الأول|السفلي|الثالث|العلوي)|الوسيط.*الحد\s*(?:الأدنى|الأقصى)|عارضتين/i.test(
      d
    )
  ) {
    return buildGrade6BoxPlotFigure(d, figureId, notationLanguage);
  }

  // 2. مخطط التمثيل بالنقاط
  if (
    /مخطط\s*(?:التمثيل\s*(?:البياني\s*)?بالنقاط|النقاط)|(?:ال)?تمثيل\s*(?:البياني\s*)?بالنقاط|عدد\s*الإخوة|الأطوال\s*في\s*فصلنا|الزمن\s*المستغرق/i.test(
      d
    )
  ) {
    return buildGrade6DotPlotFigure(d, figureId, notationLanguage);
  }

  // 3. المدرج التكراري
  if (
    /مدرج\s*تكراري|المدرج\s*التكراري|فترات\s*متلاصقة|أعمار\s*بعض\s*الأشخاص|درجات\s*الاختبار/i.test(
      d
    )
  ) {
    return buildGrade6HistogramFigure(d, figureId, notationLanguage);
  }

  // 4. الأعمدة البيانية
  if (
    /(?:ال)?تمثيل\s*(?:ال)?بياني\s*بالأعمدة|أعمدة\s*بيانية|عروض\s*التليفزيون|وجبات\s*(?:الغذاء|الغداء)/i.test(
      d
    )
  ) {
    return buildGrade6BarChartFigure(d, figureId, notationLanguage);
  }

  return undefined;
}
