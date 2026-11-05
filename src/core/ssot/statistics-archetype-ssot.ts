/**
 * @file statistics-archetype-ssot.ts
 * @description المصدر الوحيد للحقيقة (SSOT) لعائلة الإحصاء والاحتمالات والتمثيل البياني للبيانات.
 * تنبثق منه كافة الجداول والرسوم الإحصائية المقررة في الكتب المدرسية والخارجية.
 */

export type StatisticsChartBranchId =
  | "stats_frequency_distribution_table"
  | "stats_histogram_columns"
  | "stats_frequency_polygon_and_curve"
  | "stats_ascending_descending_ogive"
  | "stats_pie_circular_sectors"
  | "stats_boxplot_and_quartiles"
  | "stats_scatter_regression_line"
  | "stats_normal_bell_curve"
  | "stats_dot_plot"
  | "stats_bar_chart";

export interface StatisticalIntervalBin {
  readonly lowerBound: number;
  readonly upperBound: number;
  readonly frequency: number;
  readonly midpoint: number;
}

export interface StatisticalDotPlotSpec {
  readonly titleArabic: string;
  readonly xLabelArabic: string;
  readonly minVal: number;
  readonly maxVal: number;
  readonly step: number;
  readonly points: readonly { readonly value: number; readonly count: number; readonly isOutlier?: boolean }[];
}

export interface StatisticalBoxPlotSpec {
  readonly titleArabic?: string;
  readonly minVal: number;
  readonly q1Val: number;
  readonly medianVal: number;
  readonly q3Val: number;
  readonly maxVal: number;
  readonly axisMin: number;
  readonly axisMax: number;
  readonly axisStep: number;
  readonly xLabelArabic?: string;
}

export interface StatisticalHistogramInterval {
  readonly intervalLabel: string;
  readonly frequency: number;
  readonly lowerBound?: number;
  readonly upperBound?: number;
}

export interface StatisticalHistogramSpec {
  readonly titleArabic: string;
  readonly xLabelArabic: string;
  readonly yLabelArabic: string;
  readonly intervals: readonly StatisticalHistogramInterval[];
  readonly yStep?: number;
  readonly yMax?: number;
}

export interface StatisticalBarItem {
  readonly categoryLabel: string;
  readonly frequency: number;
  readonly barColorHex?: string;
}

export interface StatisticalBarChartSpec {
  readonly titleArabic: string;
  readonly xLabelArabic: string;
  readonly yLabelArabic: string;
  readonly bars: readonly StatisticalBarItem[];
  readonly yStep?: number;
  readonly yMax?: number;
}

export interface CanonicalStatisticsDatasetIR {
  readonly datasetId: string;
  readonly branchId: StatisticsChartBranchId;
  readonly titleArabic: string;
  readonly xLabelArabic: string;
  readonly yLabelArabic: string;
  readonly bins: readonly StatisticalIntervalBin[];
  readonly summaryMetrics?: {
    readonly mean?: number;
    readonly median?: number;
    readonly mode?: number;
    readonly standardDeviation?: number;
  };
}
