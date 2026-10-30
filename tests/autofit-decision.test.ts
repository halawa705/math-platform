import { describe, it, expect } from "vitest";
import { decideBestAutoFitRung as d } from "@/core/pdf-layout-engine/autofit-decision";
import { autoFitSweepReducer as red, INITIAL_AUTOFIT_SWEEP_STATE as I } from "@/core/pdf-layout-engine/autofit-sweep-reducer";
const P = (rungIndex: number, pages: number, overflow = false) => ({ rungIndex, pages, lastPageFill: 0.5, overflow });

describe("autofit", () => {
  it("fill: أول درجة بأقل عدد صفحات", () => expect(d([P(0, 4), P(1, 3), P(2, 3)]).rungIndex).toBe(1));
  it("fit: أول درجة ≤ الهدف", () => expect(d([P(0, 3), P(1, 3), P(2, 2)], 2)).toMatchObject({ rungIndex: 2, status: "fit" }));
  it("cannot_fit", () => expect(d([P(0, 4), P(1, 3)], 2)).toMatchObject({ status: "cannot_fit", overBy: 1 }));
  it("يتجاهل الفائض", () => expect(d([P(0, 2, true), P(1, 2)], 2).rungIndex).toBe(1));
  it("reducer sweep", () => {
    let s = red(I, { type: "START" });
    [4, 3, 3, 2].forEach((pages) => { s = red(s, { type: "MEASURED", rungIndex: s.probeRungIndex, pages, lastPageFill: 0.5, overflow: false, rungCount: 4, targetMaxPages: 2 }); });
    expect(s.phase).toBe("done"); expect(s.decision?.rungIndex).toBe(3);
  });
});
