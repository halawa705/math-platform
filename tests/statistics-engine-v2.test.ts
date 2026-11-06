/**
 * @file statistics-engine-v2.test.ts
 * @description اختبارات شاملة لمحرك الإحصاء والاحتمالات الموحد (المرحلة 4):
 * - تحليل وسوم [رسم إحصائي: ...]
 * - فحص الاتساق الرياضي (مجموع النسب 100%، الزوايا 360°، أطوال الفئات)
 * - جدول التوزيع التكراري
 * - القطاعات الدائرية
 * - المضلع والمنحنى التكراري
 * - شجرة الاحتمالات وفضاء العينة
 * - التكامل مع المنسق العام وإنتاج CanonicalGeometryFigureIR
 */

import { describe, it, expect } from "vitest";
import { parseStatisticsTagDescription } from "@/core/statistics-engine/statistics-tag-parser";
import { checkStatisticsDataConsistency } from "@/core/statistics-engine/statistics-consistency-checker";
import { buildFrequencyTableSvgMarkup } from "@/core/statistics-engine/frequency-table-svg-builder";
import { buildPieChartSvgMarkup } from "@/core/statistics-engine/pie-chart-svg-builder";
import { buildFrequencyPolygonOrCurveSvgMarkup } from "@/core/statistics-engine/frequency-polygon-curve-svg-builder";
import { buildProbabilityTreeSvgMarkup } from "@/core/statistics-engine/probability-tree-svg-builder";
import { matchAndRenderStatisticsFigure } from "@/core/statistics-engine/statistics-orchestrator";
import { matchOptionalGeometryFigureFromArabicDescription } from "@/core/geometry-engine/natural-arabic-geometry-matcher";

describe("Statistics and Probability Engine v2 (Phase 4)", () => {
  describe("Task 4.1: Tag Parser", () => {
    it("parses pie chart tag with percentages", () => {
      const tag = "[رسم إحصائي: نوع = قطاعات دائرية ؛ رياضة 40% ؛ قراءة 30% ؛ رسم 30%]";
      const spec = parseStatisticsTagDescription(tag);
      expect(spec).not.toBeNull();
      expect(spec?.chartType).toBe("pie_chart");
      expect(spec?.categories.length).toBe(3);
      expect(spec?.categories[0].percentage).toBe(40);
    });

    it("parses frequency distribution table with parallel lists", () => {
      const tag = "[رسم إحصائي: نوع = جدول تكراري ؛ المجموعات = 10- ، 20- ، 30- ، 40- ؛ التكرار = 4 ، 8 ، 6 ، 2]";
      const spec = parseStatisticsTagDescription(tag);
      expect(spec).not.toBeNull();
      expect(spec?.chartType).toBe("frequency_table");
      expect(spec?.categories.length).toBe(4);
      expect(spec?.categories[1].value).toBe(8);
    });

    it("parses frequency polygon tag", () => {
      const tag = "[رسم إحصائي: نوع = مضلع تكراري ؛ المجموعات = 20- ، 30- ، 40- ؛ التكرار = 5 ، 12 ، 7]";
      const spec = parseStatisticsTagDescription(tag);
      expect(spec).not.toBeNull();
      expect(spec?.chartType).toBe("frequency_polygon");
      expect(spec?.categories.length).toBe(3);
    });

    it("parses probability tree tag", () => {
      const tag = "[رسم إحصائي: نوع = شجرة احتمالات ؛ النواتج = صورة ، كتابة]";
      const spec = parseStatisticsTagDescription(tag);
      expect(spec).not.toBeNull();
      expect(spec?.chartType).toBe("probability_tree");
    });
  });

  describe("Task 4.2: Data Consistency Checker", () => {
    it("accepts consistent pie chart with sum of percentages = 100%", () => {
      const spec = parseStatisticsTagDescription(
        "[رسم إحصائي: نوع = قطاعات دائرية ؛ أ 25% ؛ ب 50% ؛ ج 25%]"
      );
      expect(spec).not.toBeNull();
      const rep = checkStatisticsDataConsistency(spec!);
      expect(rep.isValid).toBe(true);
      expect(rep.errors).toEqual([]);
    });

    it("rejects contradictory pie chart with sum of percentages != 100%", () => {
      const spec = parseStatisticsTagDescription(
        "[رسم إحصائي: نوع = قطاعات دائرية ؛ أ 20% ؛ ب 30% ؛ ج 20%]"
      );
      expect(spec).not.toBeNull();
      const rep = checkStatisticsDataConsistency(spec!);
      expect(rep.isValid).toBe(false);
      expect(rep.errors[0]).toContain("لا يساوي 100٪");
    });

    it("accepts uniform class width in frequency tables", () => {
      const spec = parseStatisticsTagDescription(
        "[رسم إحصائي: مجموعات = 10- ، 20- ، 30- ، 40- ؛ تكرار = 5 ، 10 ، 8 ، 3]"
      );
      expect(spec).not.toBeNull();
      const rep = checkStatisticsDataConsistency(spec!);
      expect(rep.isValid).toBe(true);
      expect(rep.warnings).toEqual([]);
    });
  });

  describe("Task 4.3: Frequency Table SVG Builder", () => {
    it("renders valid SVG table with header, rows, and total sum", () => {
      const spec = parseStatisticsTagDescription(
        "[رسم إحصائي: نوع = جدول تكراري ؛ المجموعات = 10- ، 20- ، 30- ؛ التكرار = 4 ، 8 ، 6]"
      )!;
      const svg = buildFrequencyTableSvgMarkup(spec, "western");
      expect(svg).toContain("<svg");
      expect(svg).toContain("المجموعات");
      expect(svg).toContain("التكرار");
      expect(svg).toContain("المجموع");
      expect(svg).toContain("18"); // 4 + 8 + 6 = 18
    });
  });

  describe("Task 4.4: Pie Chart SVG Builder", () => {
    it("renders SVG with circular arcs, path elements, and legend", () => {
      const spec = parseStatisticsTagDescription(
        "[رسم إحصائي: نوع = قطاعات دائرية ؛ علوم 50% ؛ فن 30% ؛ رياضة 20%]"
      )!;
      const svg = buildPieChartSvgMarkup(spec, "western");
      expect(svg).toContain("<svg");
      expect(svg).toContain("<path");
      expect(svg).toContain("علوم");
      expect(svg).toContain("50٪");
    });
  });

  describe("Task 4.5: Frequency Polygon and Curve SVG Builder", () => {
    it("renders broken line polygon for frequency_polygon", () => {
      const spec = parseStatisticsTagDescription(
        "[رسم إحصائي: نوع = مضلع تكراري ؛ مجموعات = 10- ، 20- ، 30- ؛ تكرار = 3 ، 7 ، 4]"
      )!;
      const svg = buildFrequencyPolygonOrCurveSvgMarkup(spec, "western");
      expect(svg).toContain("<svg");
      expect(svg).toContain("<path");
      expect(svg).toContain("<circle"); // midpoint markers
    });

    it("renders smooth Bézier curve for frequency_curve", () => {
      const spec = parseStatisticsTagDescription(
        "[رسم إحصائي: نوع = منحنى تكراري ؛ مجموعات = 10- ، 20- ، 30- ؛ تكرار = 3 ، 7 ، 4]"
      )!;
      const svg = buildFrequencyPolygonOrCurveSvgMarkup(spec, "western");
      expect(svg).toContain("<svg");
      expect(svg).toContain("C "); // Bézier curve command
    });
  });

  describe("Task 4.7: Probability Tree SVG Builder", () => {
    it("renders two-stage probability tree with outcomes", () => {
      const spec = parseStatisticsTagDescription("[رسم إحصائي: نوع = شجرة احتمالات]")!;
      const svg = buildProbabilityTreeSvgMarkup(spec);
      expect(svg).toContain("<svg");
      expect(svg).toContain("البداية");
      expect(svg).toContain("<line");
      expect(svg).toContain("<circle");
    });
  });

  describe("Task 4.6: Orchestrator and Full Matcher Integration", () => {
    it("orchestrator creates CanonicalGeometryFigureIR for pie chart", () => {
      const fig = matchAndRenderStatisticsFigure(
        "[رسم إحصائي: نوع = قطاعات دائرية ؛ نجاح 75% ؛ رسوب 25%]",
        "test_pie"
      );
      expect(fig).not.toBeNull();
      expect(fig?.familyId).toBe("statistics_family");
      expect(fig?.branchId).toBe("stats_pie_circular_sectors");
      expect(fig?.rawSvgMarkup).toContain("<svg");
    });

    it("natural matcher integrates statistics seamlessly", () => {
      const fig = matchOptionalGeometryFigureFromArabicDescription(
        "[رسم إحصائي: نوع = جدول تكراري ؛ المجموعات = 10- ، 20- ، 30- ؛ التكرار = 5 ، 15 ، 10]",
        "fig_stats_test"
      );
      expect(fig).toBeDefined();
      expect(fig?.familyId).toBe("statistics_family");
      expect(fig?.rawSvgMarkup).toContain("<svg");
    });
  });
});
