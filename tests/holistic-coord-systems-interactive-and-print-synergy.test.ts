/**
 * @file holistic-coord-systems-interactive-and-print-synergy.test.ts
 * @description اختبارات التحسينات الشاملة: نظام معادلتين خطيتين، المتباينات الخطية وتظليل منطقة الحل،
 * أداة الشبكة الإحداثية التفاعلية للواجب والاختبار، نقوش التهشير الأبيض والأسود وتضخيم خطوط الابتدائي، وتوجيه NotebookLM.
 */

import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { tryBuildCoordinateFunctionOrLineFigure } from "@/core/geometry-engine/analytic-function-family/coordinate-functions-and-lines-plotter";
import { projectGeometryFigureToSVGMarkup } from "@/core/geometry-engine/vector-svg-figure-projector";
import { verifyNoSolutionLeakOnFigure } from "@/core/geometry-engine/verification/geometry-solution-leak-guard";
import InteractiveCoordinatePlaneAnswerPad from "@/features/electronic-exams-hub/interactive-coordinate-plane-answer-pad";
import { buildDoubleBarChartSvgMarkup } from "@/core/statistics-engine/double-bar-chart-svg-builder";
import { enhanceQuestionFigureSvgForPrint } from "@/core/pdf-layout-engine/svg-monochrome-and-primary-print-enhancer";
import { buildPrimaryStageFigurePromptGuidance } from "@/core/prompts/geometry-prompt-guidance-primary";
import { buildCartesianFunctionsPromptGuidance } from "@/core/prompts/geometry-prompt-guidance-functions";
import { buildStatisticsFigurePromptGuidance } from "@/core/prompts/geometry-prompt-guidance-statistics";
import StudioGeometryLabPrintPreviewToggles from "@/features/generation-studio-hub/studio-geometry-lab-print-preview-toggles";

describe("Holistic Enhancements — Systems, Inequalities, Interactive Grid & PDF Synergy", () => {
  it("plots system of 2 intersecting linear equations without leaking ungiven intersection coords", () => {
    const prompt = "أوجد نقطة تقاطع المستقيمين: x + y = 5 ؛ x - y = 1";
    const fig = tryBuildCoordinateFunctionOrLineFigure({
      figureId: "sys_inter",
      description: prompt,
      notationLanguage: "english",
    });
    expect(fig).toBeDefined();
    expect(fig?.coordinateGrid?.curves?.length).toBe(2);
    expect(fig?.coordinateGrid?.curves?.some((c) => c.id === "line_1")).toBe(true);
    expect(fig?.coordinateGrid?.curves?.some((c) => c.id === "line_2")).toBe(true);
    const inter = fig?.vertices.find((v) => v.id.endsWith("_inter"));
    expect(inter?.position).toEqual({ x: 3, y: 2 });
    expect(inter?.label).toBe("P");
    expect(verifyNoSolutionLeakOnFigure(fig!, prompt).passed).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { notationLanguage: "english" });
    expect(svg).toContain('data-coord-curve="line_1"');
    expect(svg).toContain('data-coord-curve="line_2"');
  });

  it("handles parallel lines cleanly without adding false intersection vertex", () => {
    const fig = tryBuildCoordinateFunctionOrLineFigure({
      figureId: "sys_par",
      description: "مثل بيانياً المستقيمين: y = 2x + 1 ؛ y = 2x - 3",
      notationLanguage: "english",
    });
    expect(fig?.coordinateGrid?.curves?.length).toBe(2);
    expect(fig?.vertices).toHaveLength(0);
  });

  it("clips linear inequalities via Sutherland-Hodgman into feasible shaded region with solid & dashed boundaries", () => {
    const fig = tryBuildCoordinateFunctionOrLineFigure({
      figureId: "ineq_feas",
      description: "مثل منطقة الحل للنظام: 2x + y <= 6 ؛ x >= 0 ؛ y >= 0 ؛ y > x - 1",
      notationLanguage: "english",
    });
    expect(fig).toBeDefined();
    expect(fig?.coordinateGrid?.quadrantMode).toBe("first_quadrant");
    expect(fig?.shadedRegions?.length).toBe(1);
    expect(fig?.shadedRegions?.[0].vertexIds.length).toBeGreaterThanOrEqual(3);
    expect(fig?.coordinateGrid?.curves?.some((c) => c.strokeStyle === "dashed")).toBe(true);
    expect(fig?.coordinateGrid?.curves?.some((c) => c.strokeStyle === "solid")).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { notationLanguage: "english" });
    expect(svg).toContain('data-coord-curve="ineq_0"');
    expect(svg).toContain("<polygon");
  });

  it("renders InteractiveCoordinatePlaneAnswerPad HTML with touch-friendly 44px controls & SVG grid", () => {
    const html = renderToStaticMarkup(
      createElement(InteractiveCoordinatePlaneAnswerPad, {
        quadrantMode: "first_quadrant",
        notationLanguage: "arabic",
        numeralMode: "eastern",
        onInsertAnswerText: () => {},
      })
    );
    expect(html).toContain("<svg");
    expect(html).toContain('data-coord-grid="1"');
    expect(html).toContain("min-h-[44px]");
    expect(html).toContain("تبديل إلى ٤ أرباع");
  });

  it("injects B&W laser hatch patterns on double bar charts and scales Primary strokes cleanly", () => {
    const svgMono = buildDoubleBarChartSvgMarkup(
      {
        titleArabic: "مقارنة",
        xLabelArabic: "المواد",
        yLabelArabic: "الدرجات",
        series1Label: "بنين",
        series2Label: "بنات",
        bars: [
          { categoryLabel: "علوم", series1Value: 10, series2Value: 12 },
          { categoryLabel: "رياضيات", series1Value: 14, series2Value: 11 },
        ],
      },
      { monochromePrintSafe: true }
    );
    expect(svgMono).toContain("double_bar_hatch_s1");
    expect(svgMono).toContain("double_bar_hatch_s2");
    expect(svgMono).toContain('fill="url(#double_bar_hatch_s1)"');

    const enhanced = enhanceQuestionFigureSvgForPrint(
      '<svg viewBox="0 0 100 100"><rect fill="#2563EB" stroke="#2563EB" stroke-width="1.2"/></svg>',
      { monochromePrintSafe: true, strokeWidthMultiplier: 1.35 }
    );
    expect(enhanced).toContain("print_hatch_s1");
    expect(enhanced).toContain('fill="url(#print_hatch_s1)"');
    expect(enhanced).toContain('stroke="#0F172A"');
    expect(enhanced).toContain('stroke-width="1.62"');
  });

  it("keeps upgraded NotebookLM Zero-DSL prompt guidance strings concise (< 500 chars)", () => {
    const gPrimaryAr = buildPrimaryStageFigurePromptGuidance("arabic");
    const gPrimaryEn = buildPrimaryStageFigurePromptGuidance("english");
    const gFuncAr = buildCartesianFunctionsPromptGuidance("arabic");
    const gFuncEn = buildCartesianFunctionsPromptGuidance("english");
    const gStats = buildStatisticsFigurePromptGuidance();

    for (const s of [gPrimaryAr, gPrimaryEn, gFuncAr, gFuncEn, gStats]) {
      expect(s.length).toBeLessThan(500);
    }
    expect(gFuncAr).toContain("لنظام معادلتين");
    expect(gFuncAr).toContain("للمتباينات");
    expect(gStats).toContain("أعمدة مزدوجة");
  });

  it("renders Geometry Lab monochrome B&W & Primary stroke boost preview toggles with 44px touch height", () => {
    const html = renderToStaticMarkup(
      createElement(StudioGeometryLabPrintPreviewToggles, {
        monochromePrintSafe: true,
        primaryStrokeBoost: false,
        onToggleMonochrome: () => {},
        onTogglePrimaryStroke: () => {},
      })
    );
    expect(html).toContain("معاينة ليزرية");
    expect(html).toContain("سُمك خطوط الابتدائي");
    expect(html).toContain("min-h-[44px]");
    expect(html).toContain('aria-pressed="true"');
  });
});
