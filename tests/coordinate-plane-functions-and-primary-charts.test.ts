/**
 * @file coordinate-plane-functions-and-primary-charts.test.ts
 * @description اختبارات المحرك الموحد للمستوى الإحداثي والدوال (الإعدادي)
 * والرسوم البيانية والإحصائية والأشكال البصرية والهندسية للمرحلة الابتدائية عبر source="compositor".
 */

import { describe, expect, it } from "vitest";
import { matchGeometryWithDiagnostics } from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "@/core/geometry-engine/vector-svg-figure-projector";
import { buildCoordinatePlanePolygonFigure } from "@/core/geometry-engine/analytic-function-family/coordinate-plane-polygon-plotter";
import { tryBuildCoordinateFunctionOrLineFigure } from "@/core/geometry-engine/analytic-function-family/coordinate-functions-and-lines-plotter";
import { matchAndRenderStatisticsFigure } from "@/core/statistics-engine/statistics-orchestrator";

describe("Coordinate Plane, Functions & Enhanced Statistics / Primary Compositor", () => {
  it("projects unified coordinate grid lines, axes arrows, and data-furniture ticks without inverting Y axis", () => {
    const fig = buildCoordinatePlanePolygonFigure({
      figureId: "coord_y_up",
      notationLanguage: "english",
      description: "مستوى إحداثي ; A(4, 1) ; B(4, 7)",
    });
    expect(fig).toBeDefined();
    expect(fig?.coordinateGrid?.enabled).toBe(true);
    const vA = fig!.vertices.find((v) => v.label.startsWith("A("))!;
    const vB = fig!.vertices.find((v) => v.label.startsWith("B("))!;
    expect(vB.position.y).toBeGreaterThan(vA.position.y);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { notationLanguage: "english" });
    expect(svg).toContain('data-coord-grid="1"');
    expect(svg).toContain('data-furniture="1"');
    expect(svg).toContain('data-coord-axis="x"');
    expect(svg).toContain('data-coord-axis="y"');
  });

  it("auto-selects first_quadrant for Primary Arabic coordinate points with orthogonal drop-lines", () => {
    const res = matchGeometryWithDiagnostics(
      { geometryTag: "مستوى إحداثي الربع الأول ; النقطة أ(3 ، 5)", problemPrompt: "عين النقطة أ(3 ، 5) على شبكة الإحداثيات" },
      "prim5_coord_test",
      "arabic"
    );
    expect(res.source).toBe("compositor");
    expect(res.decision).toBe("green");
    expect(res.figure?.coordinateGrid?.quadrantMode).toBe("first_quadrant");
    const svg = projectGeometryFigureToSVGMarkup(res.figure!, { notationLanguage: "arabic" });
    expect(svg).toContain('data-coord-grid="1"');
    expect(svg).toContain("أ(3, 5)");
  });

  it("graphs parametric quadratic functions with smooth curve path and symmetry axis", () => {
    const fig = tryBuildCoordinateFunctionOrLineFigure({
      figureId: "quad_fn_1",
      description: "ارسم منحنى الدالة التربيعية f(x) = x^2 - 4x + 3 متخذاً x ∈ [-1, 5]",
      notationLanguage: "english",
    });
    expect(fig).toBeDefined();
    const parabola = fig?.coordinateGrid?.curves?.find((c) => c.id === "parabola");
    const symAxis = fig?.coordinateGrid?.curves?.find((c) => c.id === "symmetry_axis");
    expect(parabola?.points.length).toBeGreaterThanOrEqual(30);
    expect(symAxis?.strokeStyle).toBe("dashed");
    expect(symAxis?.points[0].x).toBeCloseTo(2, 1);

    const svg = projectGeometryFigureToSVGMarkup(fig!);
    expect(svg).toContain('data-coord-curve="parabola"');
    expect(svg).toContain('data-coord-curve="symmetry_axis"');
  });

  it("graphs linear equation 2x + 3y = 6 with X/Y intercepts and shaded triangle OAB", () => {
    const fig = tryBuildCoordinateFunctionOrLineFigure({
      figureId: "lin_eq_1",
      description: "المستقيم الذي معادلته 2x + 3y = 6 يقطع محوري الإحداثيات في A و B، أوجد مساحة المثلث AOB",
      notationLanguage: "english",
    });
    expect(fig).toBeDefined();
    expect(fig?.coordinateGrid?.curves?.some((c) => c.id === "line_main")).toBe(true);
    expect(fig?.shadedRegions?.length).toBe(1);
    const svg = projectGeometryFigureToSVGMarkup(fig!);
    expect(svg).toContain('data-coord-curve="line_main"');
  });

  it("renders Double Bar Charts and Cumulative Ascending Ogive directly via statistics orchestrator", () => {
    const doubleBar = matchAndRenderStatisticsFigure(
      "أعمدة مزدوجة: الفئات علوم، رياضيات، عربي ؛ السلسلة 1 (بنين): 12، 15، 10 ؛ السلسلة 2 (بنات): 14، 13، 16",
      "stat_double_bar"
    );
    expect(doubleBar).not.toBeNull();
    expect(doubleBar?.branchId).toBe("stats_bar_chart");
    expect(doubleBar?.rawSvgMarkup).toContain("بنين");
    expect(doubleBar?.rawSvgMarkup).toContain("بنات");
    expect(doubleBar?.rawSvgMarkup).toContain('data-given-values="15"');

    const ogive = matchAndRenderStatisticsFigure(
      "[رسم إحصائي: المنحنى المتجمع الصاعد ؛ فئات = 10-، 20-، 30- ؛ تكرار = 4، 10، 6]",
      "stat_ogive"
    );
    expect(ogive).not.toBeNull();
    expect(ogive?.branchId).toBe("stats_ascending_descending_ogive");
    expect(ogive?.rawSvgMarkup).toContain("<path");
  });

  it("routes Primary Grades 3-6 visual, geometry, solid, and stats figures cleanly through compositor (0 from_fixed_catalog)", () => {
    const cases: Array<[string, string]> = [
      ["نموذج شريحة كسر 3 / 8 مع تظليل 3 أجزاء من 8", "frac_3_8"],
      ["احسب محيط ومساحة الشكل على الشبكة التربيعية بأبعاد 5 في 3", "grid_5_3"],
      ["نموذج شريطي: الكل = 985 ؛ الجزء الأول = d ؛ الجزء الثاني = 285", "bar_model"],
      ["مثلث أ ب جـ ; القاعدة ب جـ = 8 سم ; الارتفاع أ د = 6 سم ; أ د ⊥ ب جـ", "tri_alt"],
      ["متوازي أضلاع أ ب جـ د ; ب جـ = 10 سم ; الارتفاع أ هـ = 5 سم", "para_alt"],
      ["دائرة طول قطرها 14 سم؛ احسب محيط الدائرة", "circle_dia"],
      ["متوازي مستطيلات أبعاده 5 سم ، 4 سم ، 3 سم", "cuboid_3d"],
      ["مدرج تكراري: الفترات 0-9 ، 10-19 ، 20-29 ؛ التكرار 3 ، 8 ، 5", "hist_dyn"],
    ];

    for (const [desc, id] of cases) {
      const res = matchGeometryWithDiagnostics(desc, id, "arabic");
      expect(res.source, `Case "${id}" expected compositor`).toBe("compositor");
      expect(res.decision, `Case "${id}" warnings: ${res.warnings.join("; ")}`).toBe("green");
    }
  });
});
