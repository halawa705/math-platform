/**
 * @file primary-grade6-statistics-engine.test.ts
 * @description اختبارات محرك الإحصاء التخصصي (النقاط، الصندوق والربيعيات، المدرج التكراري، الأعمدة المفردة والمزدوجة).
 */

import { describe, expect, it } from "vitest";
import { matchAndRenderStatisticsFigure } from "@/core/statistics-engine/statistics-orchestrator";
import {
  parseBoxPlotSpecFromText,
  parseDotPlotSpecFromText,
  parseDoubleBarChartSpecFromText,
  parseHistogramSpecFromText,
} from "@/core/statistics-engine/statistics-natural-arabic-fact-parser";
import { buildGrade6BoxPlotSvgMarkup } from "@/core/statistics-engine/primary-grade6-box-plot-svg-builder";
import { matchGeometryWithDiagnostics } from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { renderQuestionFigureSvg } from "@/core/pdf-layout-engine/question-figure-svg-renderer";

describe("Grade 6 & Core Statistics Engine (Zero Legacy Catalogs)", () => {
  it("يبني مخطط الصندوق والربيعيات الخمسة من أرقام المسألة مع كود SVG نقي", () => {
    const fig = matchAndRenderStatisticsFigure("مخطط الصندوق: البيانات: 5 ، 12 ، 8 ، 9 ، 7 ، 6 ، 11");
    expect(fig?.familyId).toBe("statistics_family");
    expect(fig?.branchId).toBe("stats_boxplot_and_quartiles");
    expect(fig?.rawSvgMarkup).toContain("<svg");
    expect(fig?.rawSvgMarkup).toContain('data-given-values="5,6,8,11,12"');
  });

  it("يرفض القيم المختلقة عندما تكون المعطيات غير مكتملة في مخطط الصندوق أو المدرج", () => {
    expect(parseBoxPlotSpecFromText("مخطط الصندوق والطرفين بدون قيم")).toBeNull();
    expect(parseHistogramSpecFromText("مدرج تكراري بدون فترات")).toBeNull();
    expect(parseDotPlotSpecFromText("تمثيل بالنقاط بدون قيم")).toBeNull();
  });

  it("يبني مخطط التمثيل بالنقاط ديناميكياً من القيم والتكرارات", () => {
    const fig = matchAndRenderStatisticsFigure("مخطط التمثيل بالنقاط: القيم 3 ، 4 ، 7 ؛ التكرار 2 ، 5 ، 1");
    expect(fig?.branchId).toBe("stats_dot_plot");
    expect(fig?.rawSvgMarkup).toContain("<circle");
    expect(fig?.rawSvgMarkup).toContain('data-given-values="3,2"');
    expect(fig?.rawSvgMarkup).toContain('data-given-values="4,5"');
  });

  it("يبني المدرج التكراري بأعمدة متلاصقة مع فترات بتكرار صفر", () => {
    const fig = matchAndRenderStatisticsFigure(
      "المدرج التكراري: الفترات 10-16 ، 17-23 ، 24-30 ، 31-37 ؛ التكرار 5 ، 8 ، 3 ، 0"
    );
    expect(fig?.branchId).toBe("stats_histogram_columns");
    expect(fig?.rawSvgMarkup).toContain("10-16");
    expect(fig?.rawSvgMarkup).toContain("31-37");
    expect(fig?.rawSvgMarkup).toContain('data-given-values="8"');
  });

  it("يبني الأعمدة المفردة والمزدوجة ويلتزم بعدم تسريب أرقام في الوضع المفاهيمي", () => {
    const bar = matchAndRenderStatisticsFigure("تمثيل بياني بالأعمدة: علوم 12 ؛ رياضيات 20 ؛ لغة عربية 9");
    expect(bar?.branchId).toBe("stats_bar_chart");
    expect(bar?.rawSvgMarkup).toContain(">علوم<");
    expect(bar?.rawSvgMarkup).toContain('data-given-values="20"');

    const conceptualSpec = parseDoubleBarChartSpecFromText("أعمدة مزدوجة توضح درجات التلاميذ في اختبارين");
    expect(conceptualSpec?.omitDataGivenValues).toBe(true);
    const conceptualFig = matchAndRenderStatisticsFigure("أعمدة مزدوجة توضح درجات التلاميذ في اختبارين");
    expect(conceptualFig?.rawSvgMarkup).not.toContain("data-given-values");
  });

  it("يتكامل بسلاسة مع بوابة التشخيص المركزية عبر compositor", () => {
    const res = matchGeometryWithDiagnostics(
      "مخطط الصندوق: البيانات: 10 ، 15 ، 20 ، 25 ، 30",
      "test_stat_fig"
    );
    expect(res.source).toBe("compositor");
    expect(res.decision).toBe("green");
    expect(res.figure?.familyId).toBe("statistics_family");
  });

  it("يُصيَّر مباشرة عبر renderQuestionFigureSvg دون تشويه", () => {
    const spec = parseBoxPlotSpecFromText(
      "مخطط الصندوق والطرفين: الحد الأدنى = 10 ؛ الربع الأول = 15 ؛ الوسيط = 25 ؛ الربع الثالث = 35 ؛ الحد الأقصى = 45"
    )!;
    const svgOut = renderQuestionFigureSvg({
      geometryFigure: {
        figureId: "box_render_test",
        familyId: "statistics_family",
        branchId: "stats_boxplot_and_quartiles",
        titleArabic: spec.titleArabic,
        notationLanguage: "arabic",
        vertices: [],
        segments: [],
        angles: [],
        rawSvgMarkup: buildGrade6BoxPlotSvgMarkup(spec),
      },
    });
    expect(svgOut).toBeTruthy();
    expect(svgOut).toContain("<svg");
    expect(svgOut).toContain("مخطط الصندوق والطرفين");
  });
});
