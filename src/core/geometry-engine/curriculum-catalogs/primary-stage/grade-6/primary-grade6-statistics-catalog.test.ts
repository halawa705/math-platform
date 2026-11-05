/**
 * @file primary-grade6-statistics-catalog.test.ts
 * @description اختبارات شاملة لنماذج الإحصاء للصف السادس الابتدائي (النقاط، الصندوق، المدرج، والأعمدة).
 */

import { describe, expect, it } from "vitest";
import {
  matchPrimaryGrade6StatisticsFigure,
  buildGrade6BoxPlotFigure,
  buildGrade6DotPlotFigure,
  buildGrade6HistogramFigure,
  buildGrade6BarChartFigure,
} from "./primary-grade6-statistics-catalog";
import { matchGeometryWithDiagnostics } from "../../../natural-arabic-geometry-matcher";
import { renderQuestionFigureSvg } from "../../../../pdf-layout-engine/question-figure-svg-renderer";

describe("Grade 6 Primary Statistics Visual Models", () => {
  it("يبني مخطط الصندوق والربيعيات الخمسة بدقة مع كود SVG نقي", () => {
    const fig = buildGrade6BoxPlotFigure("مخطط الصندوق والطرفين بتدريج من 5 إلى 50 والحد الأدنى 10 والوسيط 25");
    expect(fig.familyId).toBe("statistics_family");
    expect(fig.branchId).toBe("stats_boxplot_and_quartiles");
    expect(fig.rawSvgMarkup).toBeDefined();
    expect(fig.rawSvgMarkup).toContain("<svg");
    expect(fig.rawSvgMarkup).toContain("مخطط الصندوق والطرفين");
    expect(fig.rawSvgMarkup).toContain("<rect"); // مستطيل الصندوق
  });

  it("يبني مخطط التمثيل بالنقاط مع دعم تمييز القيمة المتطرفة (Outlier)", () => {
    const fig = buildGrade6DotPlotFigure("مخطط التمثيل بالنقاط لعدد الإخوة لكل تلميذ وقيمة متطرفة عند 10");
    expect(fig.familyId).toBe("statistics_family");
    expect(fig.branchId).toBe("stats_dot_plot");
    expect(fig.rawSvgMarkup).toBeDefined();
    expect(fig.rawSvgMarkup).toContain("<circle");
    // تمييز القيمة المتطرفة باللون الأحمر
    expect(fig.rawSvgMarkup).toContain("#DC2626");
    expect(fig.rawSvgMarkup).toContain("عدد الإخوة لكل تلميذ");
  });

  it("يبني المدرج التكراري بأعمدة متلاصقة تماماً (Contiguous Bars) ودعم الفترات ذات التكرار صفر", () => {
    const fig = buildGrade6HistogramFigure("المدرج التكراري يمثل أعمار بعض الأشخاص وفترة تكرارها صفر 31-37");
    expect(fig.familyId).toBe("statistics_family");
    expect(fig.branchId).toBe("stats_histogram_columns");
    expect(fig.rawSvgMarkup).toBeDefined();
    expect(fig.rawSvgMarkup).toContain("أعمار بعض الأشخاص");
    expect(fig.rawSvgMarkup).toContain("10-16");
    expect(fig.rawSvgMarkup).toContain("31-37");
  });

  it("يبني الأعمدة البيانية المنفصلة مع تباعد واضح وألوان مميزة", () => {
    const fig = buildGrade6BarChartFigure("التمثيل البياني بالأعمدة المنفصلة يوضح عروض التليفزيون المفضلة");
    expect(fig.familyId).toBe("statistics_family");
    expect(fig.branchId).toBe("stats_bar_chart");
    expect(fig.rawSvgMarkup).toBeDefined();
    expect(fig.rawSvgMarkup).toContain("عروض التليفزيون المفضلة");
    expect(fig.rawSvgMarkup).toContain("الألعاب");
    expect(fig.rawSvgMarkup).toContain("الكوميدية");
  });

  it("يتعرف المطابق الشامل على النماذج الإحصائية الأربعة من الأوصاف الطبيعية المعتمدة", () => {
    const boxMatch = matchPrimaryGrade6StatisticsFigure("مخطط الصندوق ذو العارضتين والربيعيات");
    expect(boxMatch).toBeDefined();
    expect(boxMatch?.branchId).toBe("stats_boxplot_and_quartiles");

    const dotMatch = matchPrimaryGrade6StatisticsFigure("مخطط التمثيل بالنقاط يوضح الزمن المستغرق");
    expect(dotMatch).toBeDefined();
    expect(dotMatch?.branchId).toBe("stats_dot_plot");

    const histMatch = matchPrimaryGrade6StatisticsFigure("المدرج التكراري لدرجات الاختبار");
    expect(histMatch).toBeDefined();
    expect(histMatch?.branchId).toBe("stats_histogram_columns");

    const barMatch = matchPrimaryGrade6StatisticsFigure("التمثيل البياني بالأعمدة لعروض التليفزيون");
    expect(barMatch).toBeDefined();
    expect(barMatch?.branchId).toBe("stats_bar_chart");
  });

  it("يتكامل بسلاسة مع بوابة التشخيص المركزية matchGeometryWithDiagnostics", () => {
    const res = matchGeometryWithDiagnostics(
      "مخطط الصندوق والطرفين للبيانات والربيعيات",
      "test_stat_fig"
    );
    expect(res.figure).toBeDefined();
    expect(res.figure?.familyId).toBe("statistics_family");
    expect(res.warnings).toHaveLength(0);
  });

  it("يُصيَّر مباشرة عبر renderQuestionFigureSvg دون أي تشويه أو أخطاء", () => {
    const fig = buildGrade6BoxPlotFigure("مخطط الصندوق");
    const svgOut = renderQuestionFigureSvg({ geometryFigure: fig });
    expect(svgOut).toBeTruthy();
    expect(svgOut).toContain("<svg");
    expect(svgOut).toContain("مخطط الصندوق والطرفين");
  });
});
