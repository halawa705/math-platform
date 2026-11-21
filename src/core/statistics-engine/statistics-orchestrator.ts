/**
 * @file statistics-orchestrator.ts
 * @description المنسق العام للرسوم والجداول الإحصائية (المرحلة 4):
 * يربط بين المحلل العام للوسوم الإحصائية `statistics-tag-parser.ts`
 * وفاحص الاتساق `statistics-consistency-checker.ts`
 * ومصيّرات الـ SVG (الجدول، القطاعات، المضلع، المنحنى، شجرة الاحتمالات، ومصيّرات الصف السادس الأربعة)
 * ليُنتج شكلاً موحداً `CanonicalGeometryFigureIR` بحالة `statistics_family`.
 * @invariant ملف ذري منسق باسم فريد عالمياً وفق دستور المنصة (< 150 سطراً).
 */

import type { CanonicalGeometryFigureIR, StatisticsDerivedBranchId } from "../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage, NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";
import { parseStatisticsTagDescription } from "./statistics-tag-parser";
import { checkStatisticsDataConsistency } from "./statistics-consistency-checker";
import { buildFrequencyTableSvgMarkup } from "./frequency-table-svg-builder";
import { buildPieChartSvgMarkup } from "./pie-chart-svg-builder";
import { buildFrequencyPolygonOrCurveSvgMarkup } from "./frequency-polygon-curve-svg-builder";
import { buildProbabilityTreeSvgMarkup } from "./probability-tree-svg-builder";

import {
  parseBarChartSpecFromText,
  parseBoxPlotSpecFromText,
  parseDotPlotSpecFromText,
  parseDoubleBarChartSpecFromText,
  parseHistogramSpecFromText,
} from "./statistics-natural-arabic-fact-parser";
import { buildGrade6BarChartSvgMarkup } from "./primary-grade6-bar-chart-svg-builder";
import { buildDoubleBarChartSvgMarkup } from "./double-bar-chart-svg-builder";
import { buildGrade6BoxPlotSvgMarkup } from "./primary-grade6-box-plot-svg-builder";
import { buildGrade6DotPlotSvgMarkup } from "./primary-grade6-dot-plot-svg-builder";
import { buildGrade6HistogramSvgMarkup } from "./primary-grade6-histogram-svg-builder";

export const MODULE_ID_STATISTICS_ORCHESTRATOR = "statistics_orchestrator" as const;

export function matchAndRenderStatisticsFigure(
  description: string,
  figureId = "stats_fig",
  numeralMode: NumeralDisplayMode = "western",
  notationLanguage: MathNotationLanguage = "arabic"
): CanonicalGeometryFigureIR | null {
  if (!/(?:\[\s*رسم\s*(?:إحصائي|احصائي|بياني)|مدرج|صندوق|تمثيل\s*بالنقاط|(?:تمثيل|رسم)\s*بياني\s*بالأعمدة|بالأعمدة|(?:ال)?أعمدة\s*(?:ال)?(?:بيانية|مزدوجة|منفصلة)|قطاع(?:ات)?\s*دائري|جدول\s*(?:توزيع\s*)?تكراري|مضلع\s*تكراري|منحنى\s*تكراري|بالخطوط|صاعد|نازل|شجر(?:ة)?\s*(?:ال)?احتمال|فضاء\s*العينة)/i.test(description)) {
    return null;
  }

  const parsed = parseStatisticsTagDescription(description);

  const doubleBarSpec = parseDoubleBarChartSpecFromText(description);
  if (doubleBarSpec) {
    return {
      figureId,
      familyId: "statistics_family",
      branchId: "stats_bar_chart",
      titleArabic: doubleBarSpec.titleArabic,
      notationLanguage,
      vertices: [],
      segments: [],
      angles: [],
      rawSvgMarkup: buildDoubleBarChartSvgMarkup(doubleBarSpec, { numeralMode }),
    };
  }

  // 1. تجربة مصيّرات الصف السادس التخصصية أولاً إن انطبقت بدقة
  const barSpec = parseBarChartSpecFromText(description);
  if (barSpec && (!parsed || parsed.chartType === "bar_chart")) {
    const isConceptualBar = !/\d/.test(description.replace(/[3456]ب/g, ""));
    return {
      figureId,
      familyId: "statistics_family",
      branchId: "stats_bar_chart",
      titleArabic: barSpec.titleArabic,
      notationLanguage,
      vertices: [],
      segments: [],
      angles: [],
      rawSvgMarkup: buildGrade6BarChartSvgMarkup(barSpec, { numeralMode, omitDataGivenValues: isConceptualBar }),
    };
  }

  const histSpec = parseHistogramSpecFromText(description);
  if (histSpec && (!parsed || parsed.chartType === "histogram")) {
    return {
      figureId,
      familyId: "statistics_family",
      branchId: "stats_histogram_columns",
      titleArabic: histSpec.titleArabic,
      notationLanguage,
      vertices: [],
      segments: [],
      angles: [],
      rawSvgMarkup: buildGrade6HistogramSvgMarkup(histSpec, { numeralMode }),
    };
  }

  const boxSpec = parseBoxPlotSpecFromText(description);
  if (boxSpec && (!parsed || parsed.chartType === "box_plot")) {
    return {
      figureId,
      familyId: "statistics_family",
      branchId: "stats_boxplot_and_quartiles",
      titleArabic: boxSpec.titleArabic ?? "مخطط الصندوق والطرفين",
      notationLanguage,
      vertices: [],
      segments: [],
      angles: [],
      rawSvgMarkup: buildGrade6BoxPlotSvgMarkup(boxSpec, { numeralMode }),
    };
  }

  const dotSpec = parseDotPlotSpecFromText(description);
  if (dotSpec && (!parsed || parsed.chartType === "dot_plot")) {
    return {
      figureId,
      familyId: "statistics_family",
      branchId: "stats_dot_plot",
      titleArabic: dotSpec.titleArabic,
      notationLanguage,
      vertices: [],
      segments: [],
      angles: [],
      rawSvgMarkup: buildGrade6DotPlotSvgMarkup(dotSpec, { numeralMode }),
    };
  }

  // 2. إذا لم يكن شكلاً متخصصاً من الصف السادس، نعتمد المحلل الإحصائي الموحد
  if (!parsed) return null;

  // فحص الاتساق الرياضي
  const consistency = checkStatisticsDataConsistency(parsed);
  if (!consistency.isValid) {
    return null; // إسقاط البيانات المتناقضة
  }

  let svgMarkup = "";
  let branchId: StatisticsDerivedBranchId = "stats_frequency_distribution_table";

  if (parsed.chartType === "pie_chart") {
    svgMarkup = buildPieChartSvgMarkup(parsed, numeralMode);
    branchId = "stats_pie_circular_sectors";
  } else if (
    parsed.chartType === "frequency_polygon" ||
    parsed.chartType === "frequency_curve" ||
    parsed.chartType === "line_graph"
  ) {
    svgMarkup = buildFrequencyPolygonOrCurveSvgMarkup(parsed, numeralMode);
    branchId = "stats_frequency_polygon_and_curve";
  } else if (parsed.chartType === "ascending_ogive" || parsed.chartType === "descending_ogive") {
    svgMarkup = buildFrequencyPolygonOrCurveSvgMarkup(parsed, numeralMode);
    branchId = "stats_ascending_descending_ogive";
  } else if (parsed.chartType === "probability_tree") {
    svgMarkup = buildProbabilityTreeSvgMarkup(parsed);
    branchId = "stats_scatter_regression_line";
  } else {
    // الافتراضي: جدول توزيع تكراري
    svgMarkup = buildFrequencyTableSvgMarkup(parsed, numeralMode);
    branchId = "stats_frequency_distribution_table";
  }

  return {
    figureId,
    familyId: "statistics_family",
    branchId,
    titleArabic: parsed.titleArabic,
    notationLanguage,
    vertices: [],
    segments: [],
    angles: [],
    rawSvgMarkup: svgMarkup,
  };
}
