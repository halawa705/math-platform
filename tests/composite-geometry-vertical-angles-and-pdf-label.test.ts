/**
 * @file composite-geometry-vertical-angles-and-pdf-label.test.ts
 * @description اختبارات التحقق الشاملة للمسار ١ (تسمية الإجابة المختصرة في الـ PDF)
 * والمسار ٢ (الأشكال المركّبة، تصيير القيود الصريحة، إحداثيات المساقط والمنتصف البارامترية، وعزل الكتالوجات).
 */

import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StudentAnswerSpaceDocker } from "@/core/pdf-layout-engine/student-answer-space-docker";
import { matchGeometryWithDiagnostics } from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { measureAngleDegrees } from "@/core/geometry-engine/verification/figure-vector-measure-helpers";
import { buildPrepStageFigurePromptGuidance } from "@/core/prompts/geometry-prompt-guidance-prep";
import { GEOMETRY_CATALOG_MATCHERS, matchFromCatalogRegistry } from "@/core/geometry-engine/curriculum-catalogs/geometry-catalog-match-registry";
import { projectGeometryFigureToSVGMarkup } from "@/core/geometry-engine/vector-svg-figure-projector";
import { matchTrigonometryParametricFigure } from "@/core/geometry-engine/trigonometry-family/trigonometry-parametric-orchestrator";
import { verifyNoSolutionLeakOnFigure } from "@/core/geometry-engine/verification/geometry-solution-leak-guard";

describe("Track 1 — StudentAnswerSpaceDocker Compact Label", () => {
  it("renders 'الإجابة:' only for drill, homework, and general essay modes", () => {
    const modes = [
      { isBookletDrill: true, isBookletHomework: false },
      { isBookletDrill: false, isBookletHomework: true },
      { isBookletDrill: false, isBookletHomework: false },
    ] as const;

    for (const m of modes) {
      const html = renderToStaticMarkup(
        createElement(StudentAnswerSpaceDocker, {
          ...m,
          primaryHex: "#0f766e",
          answerSpaceStyle: "dotted",
          isMcq: false,
          lineCount: 2,
        })
      );
      expect(html).toContain("الإجابة:");
      expect(html).not.toContain("إجابة تدريب حاول بنفسك");
      expect(html).not.toContain("إجابة الواجب المنزلي");
      expect(html).not.toContain("مساحة الحل");
    }
  });
});

describe("Track 2 — Composite Geometry, SVG Overlay & Parametric Coordinates", () => {
  const posOf = (fig: NonNullable<ReturnType<typeof matchGeometryWithDiagnostics>["figure"]>, key: string) =>
    fig.vertices.find((v) => v.label === key)?.position;

  it("composes Quad ABCD + Triangle CEF with exact vertical angles via BE ∩ DF = {C} and renders axis overlay", () => {
    const prompt =
      "في الشكل المقابل، متوازي أضلاع ABCD ومثلث CEF حيث BE ∩ DF = {C} و AB = 6 سم و BC = 4 سم و CE = 5 سم و CF = 4 سم و ق(∠B) = 70°، أوجد ق(∠ECF).";
    const res = matchGeometryWithDiagnostics(prompt, "comp_vert_inter", "english");

    expect(res.warnings).toEqual([]);
    expect(res.decision).toBe("green");
    expect(res.source).toBe("compositor");
    expect(res.figure).toBeDefined();

    const fig = res.figure!;
    expect(fig.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "D", "E", "F"]));
    expect(measureAngleDegrees(posOf(fig, "C")!, posOf(fig, "B")!, posOf(fig, "E")!)).toBeGreaterThanOrEqual(178);
    expect(measureAngleDegrees(posOf(fig, "C")!, posOf(fig, "D")!, posOf(fig, "F")!)).toBeGreaterThanOrEqual(178);
    expect(Math.abs(measureAngleDegrees(posOf(fig, "C")!, posOf(fig, "B")!, posOf(fig, "D")!) - measureAngleDegrees(posOf(fig, "C")!, posOf(fig, "E")!, posOf(fig, "F")!))).toBeLessThan(2);

    const svg = projectGeometryFigureToSVGMarkup(fig, { numeralMode: "western" });
    expect(svg).toContain('data-explicit-collinear="axis"');
  });

  it("composes Quad ABCD + Triangle CEF via dual explicit collinearity facts", () => {
    const prompt =
      "في الشكل المقابل، مستطيل ABCD ومثلث CEF فيه B، C، E على استقامة واحدة و D، C، F على استقامة واحدة و AB = 6 سم و BC = 4 سم و CE = 5 سم و CF = 4 سم، أوجد ق(∠ECF).";
    const res = matchGeometryWithDiagnostics(prompt, "comp_vert_col", "english");

    expect(res.warnings).toEqual([]);
    expect(res.decision).toBe("green");
    expect(res.source).toBe("compositor");
    expect(measureAngleDegrees(posOf(res.figure!, "C")!, posOf(res.figure!, "B")!, posOf(res.figure!, "E")!)).toBeGreaterThanOrEqual(178);
    expect(measureAngleDegrees(posOf(res.figure!, "C")!, posOf(res.figure!, "D")!, posOf(res.figure!, "F")!)).toBeGreaterThanOrEqual(178);
  });

  it("composes Quad ABCD + external Triangle CEF sharing single collinear extension B, C, E", () => {
    const prompt =
      "في الشكل المقابل، متوازي أضلاع ABCD ومثلث CEF حيث B، C، E على استقامة واحدة و AB = 6 سم و BC = 4 سم و CE = 5 سم و EF = 4 سم، أوجد طول CF.";
    const res = matchGeometryWithDiagnostics(prompt, "comp_ext_single", "english");

    expect(res.warnings).toEqual([]);
    expect(res.decision).toBe("green");
    expect(res.source).toBe("compositor");
    expect(measureAngleDegrees(posOf(res.figure!, "C")!, posOf(res.figure!, "B")!, posOf(res.figure!, "E")!)).toBeGreaterThanOrEqual(178);
    expect(res.figure!.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "D", "E", "F"]));
  });

  it("composes two triangles sharing a single vertex without collinearity (ABC isosceles + DBE equilateral)", () => {
    const prompt =
      "في الشكل المقابل، مثلث ABC متساوي الساقين رأسه A ومثلث DBE متساوي الأضلاع يشتركان في الرأس B، حيث ق(∠A) = 40°، أوجد ق(∠CBD).";
    const res = matchGeometryWithDiagnostics(prompt, "comp_shared_v", "english");

    expect(res.source).toBe("compositor");
    expect(res.figure).toBeDefined();
    expect(res.figure!.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "D", "E"]));
  });

  it("converges multi-step fixpoint dependency chains (4+ topological hops)", () => {
    const prompt =
      "في الشكل المقابل، مستطيل ABCD فيه AB = 8 سم و BC = 6 سم، E منتصف AB، F منتصف CD، G منتصف EF، M منتصف AG، أوجد طول MG.";
    const res = matchGeometryWithDiagnostics(prompt, "comp_fixpoint_4", "english");

    expect(res.warnings).toEqual([]);
    expect(res.decision).toBe("green");
    expect(res.source).toBe("compositor");
    expect(res.figure!.vertices.map((v) => v.label)).toEqual(
      expect.arrayContaining(["A", "B", "C", "D", "E", "F", "G", "M"])
    );
  });

  it("composes parametric regular pentagon ABCDE and hexagon ABCDEF cleanly", () => {
    const pent = matchGeometryWithDiagnostics("في الشكل المقابل، خماسي منتظم ABCDE فيه AB = 5 سم، أوجد محيطه.", "comp_pentagon", "english");
    expect(pent.decision).toBe("green");
    expect(pent.source).toBe("compositor");
    expect(pent.figure?.vertices).toHaveLength(5);

    const hex = matchGeometryWithDiagnostics("في الشكل المقابل، سداسي منتظم ABCDEF فيه AB = 4 سم، أوجد محيطه.", "comp_hexagon", "english");
    expect(hex.decision).toBe("green");
    expect(hex.source).toBe("compositor");
    expect(hex.figure?.vertices).toHaveLength(6);
  });

  it("renders arbitrary coordinate projections and midpoint M(؟, ؟) parametrically with zero solution leak", () => {
    const projPrompt = "إذا كان P(2, -3) و Q(-5, 4) ارسم PQ في المستوى الإحداثي ثم أوجد طول مسقطها على المحور X والمحور y";
    const projRes = matchGeometryWithDiagnostics(projPrompt, "coord_proj_arb", "english");
    expect(projRes.decision).toBe("green");
    expect(projRes.source).toBe("compositor");
    expect(projRes.figure?.coordinateGrid?.enabled).toBe(true);
    expect(projRes.figure?.vertices.some((v) => v.label === "P'(2, 0)")).toBe(true);
    expect(projRes.figure?.vertices.some((v) => v.label === "Q''(0, 4)")).toBe(true);
    expect(verifyNoSolutionLeakOnFigure(projRes.figure!, projPrompt).passed).toBe(true);

    const midPrompt = "أوجد إحداثيي منتصف القطعة المستقيمة RS حيث R(2, 4) و S(8, 10)";
    const midRes = matchGeometryWithDiagnostics(midPrompt, "coord_mid_arb", "english");
    expect(midRes.decision).toBe("green");
    expect(midRes.source).toBe("compositor");
    expect(midRes.figure?.vertices.find((v) => v.id.endsWith("_vM"))?.label).toBe("M(؟, ؟)");
    expect(verifyNoSolutionLeakOnFigure(midRes.figure!, midPrompt).passed).toBe(true);
  });

  it("keeps prep prompt guidance compact and confirms registry holds zero hardcoded prep catalogs", () => {
    const ar = buildPrepStageFigurePromptGuidance("arabic");
    const en = buildPrepStageFigurePromptGuidance("english");
    expect(ar.length).toBeLessThan(550);
    expect(en.length).toBeLessThan(550);
    expect(ar).toContain("أطوال الأضلاع ووحداتها");
    expect(ar).toContain("على استقامة واحدة");
    expect(en).toContain("المطلوب:");

    expect(GEOMETRY_CATALOG_MATCHERS.every((m) => m.stage === "primary")).toBe(true);
    const prepQueryInRegistry = matchFromCatalogRegistry(
      "في الشكل المقابل ABCD متوازي أضلاع فيه قياس D = 75° ومثلث خارجي EGB",
      "iso_quad",
      "english"
    );
    expect(prepQueryInRegistry.figure).toBeUndefined();

    const trigFig = matchTrigonometryParametricFigure(
      "في المثلث ABC القائم الزاوية في B، إذا كان AB = 3 سم، BC = 4 سم، AC = 5 سم، فإن sin C يساوي",
      "iso_trig",
      "english"
    );
    expect(trigFig).toBeDefined();
  });
});
