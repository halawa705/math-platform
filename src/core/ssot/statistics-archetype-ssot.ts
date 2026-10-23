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
  | "stats_normal_bell_curve";

export interface StatisticalIntervalBin {
  readonly lowerBound: number;
  readonly upperBound: number;
  readonly frequency: number;
  readonly midpoint: number;
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
