import { describe, it, expect } from "vitest";
import { parseCartesianGraphDescription as p } from "@/core/geometry-engine/graph-compositor/graph-fact-parser";
import { projectCartesianGraphToSVGMarkup } from "@/core/geometry-engine/graph-compositor/graph-svg-projector";

describe("graph-fact-parser (G-9)", () => {
  it("دالة خطية: ص = ٢س + ١", () => {
    const spec = p("ص = ٢س + ١");
    expect(spec?.functions[0]).toMatchObject({ kind: "linear", a: 2, b: 1 });
  });
  it("دالة تربيعية: ص = س² − ٤", () => {
    const spec = p("ص = س² − ٤");
    expect(spec?.functions[0]).toMatchObject({ kind: "quadratic", a: 1, b: 0, c: -4 });
  });
  it("قيمة مطلقة: ص = |س − ١| + ٢", () => {
    const spec = p("ص = |س − ١| + ٢");
    expect(spec?.functions[0]).toMatchObject({ kind: "absolute", a: 1, b: 1, c: 2 });
  });
  it("خط رأسي: س = ٣", () => {
    const spec = p("س = ٣");
    expect(spec?.functions[0]).toMatchObject({ kind: "vertical_line", a: 3 });
  });
  it("نقطة والمدى", () => {
    const spec = p("ص = ٢س + ١ ; نقطة (٢, ٥) أ ; المدى س من −٣ إلى ٣ ، ص من −٤ إلى ٦");
    expect(spec?.points[0]).toMatchObject({ x: 2, y: 5, label: "أ" });
    expect(spec?.xMin).toBe(-3);
    expect(spec?.yMax).toBe(6);
    const svg = projectCartesianGraphToSVGMarkup(spec!);
    expect(svg).toContain("<polyline");
  });
  it("وصف فارغ = null", () => {
    expect(p("كلام غير بياني")).toBeNull();
  });
});
