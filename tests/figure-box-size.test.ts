import { describe, it, expect } from "vitest";
import { computeFigureBoxSizePx as f } from "@/core/pdf-layout-engine/question-figure-box-size";
describe("figure box", () => {
  it("scale 1 قريب من 146×102", () => { const r = f({ aspect: 146 / 102, figureScale: 1, columnsCount: 2 }); expect(Math.abs(r.svgWidthPx - 146)).toBeLessThan(3); });
  it("أصغر مع scale أقل", () => expect(f({ aspect: 1.4, figureScale: 0.7, columnsCount: 2 }).svgWidthPx).toBeLessThan(f({ aspect: 1.4, figureScale: 1, columnsCount: 2 }).svgWidthPx));
  it("لا يتجاوز عرض العمود", () => expect(f({ aspect: 2.6, figureScale: 1.6, columnsCount: 2 }).svgWidthPx).toBeLessThanOrEqual(190));
});
