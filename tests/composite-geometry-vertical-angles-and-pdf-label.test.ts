/**
 * @file composite-geometry-vertical-angles-and-pdf-label.test.ts
 * @description اختبارات التحقق الشاملة للمسار ١ (تسمية الإجابة المختصرة في الـ PDF)
 * والمسار ٢ (الأشكال المركّبة: رباعي + مثلث بالتقابل بالرأس، امتداد ضلعين، رأس مشترك، تقارب متتبع، مضلعات منتظمة، وعزل الكتالوجات).
 */

import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StudentAnswerSpaceDocker } from "@/core/pdf-layout-engine/student-answer-space-docker";
import { matchGeometryWithDiagnostics } from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { measureAngleDegrees } from "@/core/geometry-engine/verification/figure-vector-measure-helpers";
import { buildPrepStageFigurePromptGuidance } from "@/core/prompts/geometry-prompt-guidance-prep";
import { matchFromCatalogRegistry } from "@/core/geometry-engine/curriculum-catalogs/geometry-catalog-match-registry";

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

describe("Track 2 — Composite Geometry & Shared-Vertex Vertical Angles", () => {
  const posOf = (fig: NonNullable<ReturnType<typeof matchGeometryWithDiagnostics>["figure"]>, key: string) =>
    fig.vertices.find((v) => v.label === key)?.position;

  it("composes Quad ABCD + Triangle CEF with exact vertical angles via BE ∩ DF = {C}", () => {
    const prompt =
      "في الشكل المقابل، متوازي أضلاع ABCD ومثلث CEF حيث BE ∩ DF = {C} و AB = 6 سم و BC = 4 سم و CE = 5 سم و CF = 4 سم و ق(∠B) = 70°، أوجد ق(∠ECF).";
    const res = matchGeometryWithDiagnostics(prompt, "comp_vert_inter", "english");

    expect(res.warnings).toEqual([]);
    expect(res.decision).toBe("green");
    expect(res.source).toBe("compositor");
    expect(res.figure).toBeDefined();

    const fig = res.figure!;
    expect(fig.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "D", "E", "F"]));
    const pB = posOf(fig, "B")!;
    const pC = posOf(fig, "C")!;
    const pD = posOf(fig, "D")!;
    const pE = posOf(fig, "E")!;
    const pF = posOf(fig, "F")!;

    expect(measureAngleDegrees(pC, pB, pE)).toBeGreaterThanOrEqual(178);
    expect(measureAngleDegrees(pC, pD, pF)).toBeGreaterThanOrEqual(178);
    expect(Math.abs(measureAngleDegrees(pC, pB, pD) - measureAngleDegrees(pC, pE, pF))).toBeLessThan(2);
  });

  it("composes Quad ABCD + Triangle CEF via dual explicit collinearity facts", () => {
    const prompt =
      "في الشكل المقابل، مستطيل ABCD ومثلث CEF فيه B، C، E على استقامة واحدة و D، C، F على استقامة واحدة و AB = 6 سم و BC = 4 سم و CE = 5 سم و CF = 4 سم، أوجد ق(∠ECF).";
    const res = matchGeometryWithDiagnostics(prompt, "comp_vert_col", "english");

    expect(res.warnings).toEqual([]);
    expect(res.decision).toBe("green");
    expect(res.source).toBe("compositor");
    expect(res.figure).toBeDefined();

    const fig = res.figure!;
    expect(measureAngleDegrees(posOf(fig, "C")!, posOf(fig, "B")!, posOf(fig, "E")!)).toBeGreaterThanOrEqual(178);
    expect(measureAngleDegrees(posOf(fig, "C")!, posOf(fig, "D")!, posOf(fig, "F")!)).toBeGreaterThanOrEqual(178);
  });

  it("composes Quad ABCD + external Triangle CEF sharing single collinear extension B, C, E", () => {
    const prompt =
      "في الشكل المقابل، متوازي أضلاع ABCD ومثلث CEF حيث B، C، E على استقامة واحدة و AB = 6 سم و BC = 4 سم و CE = 5 سم و EF = 4 سم، أوجد طول CF.";
    const res = matchGeometryWithDiagnostics(prompt, "comp_ext_single", "english");

    expect(res.warnings).toEqual([]);
    expect(res.decision).toBe("green");
    expect(res.source).toBe("compositor");
    expect(res.figure).toBeDefined();

    const fig = res.figure!;
    expect(measureAngleDegrees(posOf(fig, "C")!, posOf(fig, "B")!, posOf(fig, "E")!)).toBeGreaterThanOrEqual(178);
    expect(fig.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "D", "E", "F"]));
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
    expect(res.figure).toBeDefined();
    expect(res.figure!.vertices.map((v) => v.label)).toEqual(
      expect.arrayContaining(["A", "B", "C", "D", "E", "F", "G", "M"])
    );
  });

  it("composes parametric regular pentagon ABCDE and hexagon ABCDEF cleanly", () => {
    const pent = matchGeometryWithDiagnostics(
      "في الشكل المقابل، خماسي منتظم ABCDE فيه AB = 5 سم، أوجد محيطه.",
      "comp_pentagon",
      "english"
    );
    expect(pent.decision).toBe("green");
    expect(pent.source).toBe("compositor");
    expect(pent.figure?.vertices).toHaveLength(5);

    const hex = matchGeometryWithDiagnostics(
      "في الشكل المقابل، سداسي منتظم ABCDEF فيه AB = 4 سم، أوجد محيطه.",
      "comp_hexagon",
      "english"
    );
    expect(hex.decision).toBe("green");
    expect(hex.source).toBe("compositor");
    expect(hex.figure?.vertices).toHaveLength(6);
  });

  it("keeps prep prompt guidance compact with composite topology instructions and supports legacy catalog isolation flag", () => {
    const ar = buildPrepStageFigurePromptGuidance("arabic");
    const en = buildPrepStageFigurePromptGuidance("english");
    expect(ar.length).toBeLessThan(550);
    expect(en.length).toBeLessThan(550);
    expect(ar).toContain("أطوال الأضلاع ووحداتها");
    expect(ar).toContain("على استقامة واحدة");
    expect(en).toContain("المطلوب:");

    const isolatedQuad = matchFromCatalogRegistry(
      "في الشكل المقابل ABCD متوازي أضلاع فيه قياس D = 75° ومثلث خارجي EGB",
      "iso_quad",
      "english",
      false,
      { excludeLegacyPrepCatalogs: true }
    );
    expect(isolatedQuad.figure).toBeUndefined();

    const isolatedTrig = matchFromCatalogRegistry(
      "في المثلث ABC القائم الزاوية في B، إذا كان AB = 3 سم، BC = 4 سم، AC = 5 سم، فإن sin C يساوي",
      "iso_trig",
      "english",
      false,
      { excludeLegacyPrepCatalogs: true }
    );
    expect(isolatedTrig.figure).toBeDefined();
  });
});
