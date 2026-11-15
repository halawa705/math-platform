import { describe, expect, it } from "vitest";
import { matchGeometryWithDiagnostics } from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { assertTransversalCollinearity } from "../src/core/geometry-engine/verification/geometry-transversal-collinearity-checker";
import { checkFigureFidelityToPrompt } from "../src/core/geometry-engine/verification/geometry-figure-fidelity-gate";

describe("Parallel Transversal Straightness Guard (Tasks B1–B3)", () => {
  it("renders Try-It-Yourself #5 (AL // BM // CN // DK) with 100% straight collinear transversals A-B-C-D and L-M-N-K", () => {
    const prompt =
      "في الشكل المقابل، \\(\\overleftrightarrow{AL} \\parallel \\overleftrightarrow{BM} \\parallel \\overleftrightarrow{CN} \\parallel \\overleftrightarrow{DK}\\) ، القاطع \\(AD\\) فيه \\(AB = BC = CD = 5\\text{ سم}\\) ، والقاطع \\(LK\\) فيه \\(LM = 4\\text{ سم}\\). أوجد طول القطعة \\(LK\\). [رسم هندسي: أربعة مستقيمات متوازية AL // BM // CN // DK يقطعها قاطعان AD و LK ; AB = BC = CD = 5 سم ; LM = 4 سم ; المطلوب: طول LK]";

    const res = matchGeometryWithDiagnostics(prompt, "drill_1_3", "english");
    expect(res.figure).toBeDefined();
    expect(res.decision).toBe("green");

    const collinearity = assertTransversalCollinearity(res.figure!);
    expect(collinearity.isCollinear).toBe(true);
    expect(collinearity.bentChains).toEqual([]);

    const fidelity = checkFigureFidelityToPrompt(res.figure!, prompt);
    expect(fidelity.passed).toBe(true);
  });

  it("rejects any figure whose transversal chain A->B->C->D is bent by post-refinement", () => {
    const prompt =
      "في الشكل المقابل، أربعة مستقيمات متوازية AL // BM // CN // DK يقطعها قاطعان AD و LK ; AB = BC = CD = 5 سم ; LM = 4 سم ; المطلوب: طول LK";
    const res = matchGeometryWithDiagnostics(prompt, "drill_1_3_bent", "english");
    expect(res.figure).toBeDefined();

    // إفساد إحداثي الرأس B عمداً لاختبار حارس الاستقامة
    const bentFigure = {
      ...res.figure!,
      vertices: res.figure!.vertices.map((v) =>
        v.id.endsWith("_v_B") ? { ...v, position: { x: v.position.x - 0.8, y: v.position.y } } : v,
      ),
    };

    const collinearity = assertTransversalCollinearity(bentFigure);
    expect(collinearity.isCollinear).toBe(false);
    expect(collinearity.bentChains.some((c) => c.includes("_v_A") && c.includes("_v_B"))).toBe(true);

    const fidelity = checkFigureFidelityToPrompt(bentFigure, prompt);
    expect(fidelity.passed).toBe(false);
  });
});
