import { describe, expect, it } from "vitest";
import { decideBestAutoFitRung, type AutoFitProbe } from "@/core/pdf-layout-engine/autofit-decision";
import {
  autoFitSweepReducer,
  INITIAL_AUTOFIT_SWEEP_STATE,
} from "@/core/pdf-layout-engine/autofit-sweep-reducer";
import { getLadderForMode } from "@/core/pdf-layout-engine/autofit-ladders";

describe("AutoFit sweep speed optimizations and exact decision parity", () => {
  it("stops booklet_fill sweep after only 2 probes when tightest rung saves zero pages", () => {
    const rungCount = getLadderForMode("booklet_fill").length;
    expect(rungCount).toBe(5);

    let s = autoFitSweepReducer(INITIAL_AUTOFIT_SWEEP_STATE, { type: "START" });
    expect(s.probeRungIndex).toBe(0);

    s = autoFitSweepReducer(s, {
      type: "MEASURED",
      rungIndex: 0,
      pages: 23,
      lastPageFill: 0.72,
      overflow: false,
      rungCount,
    });
    expect(s.phase).toBe("sweeping");
    expect(s.probeRungIndex).toBe(4);

    s = autoFitSweepReducer(s, {
      type: "MEASURED",
      rungIndex: 4,
      pages: 23,
      lastPageFill: 0.54,
      overflow: false,
      rungCount,
    });
    expect(s.phase).toBe("done");
    expect(s.probes.length).toBe(2);
    expect(s.decision?.rungIndex).toBe(0);
    expect(s.decision?.pages).toBe(23);
  });

  it("matches exhaustive linear decideBestAutoFitRung across all monotonic 5-rung booklet outcomes", () => {
    const scenarios: readonly (readonly [number, number, number, number, number])[] = [
      [25, 25, 25, 25, 25],
      [25, 24, 24, 24, 24],
      [25, 25, 24, 24, 24],
      [25, 25, 25, 24, 24],
      [25, 25, 25, 25, 24],
      [25, 24, 23, 22, 22],
      [25, 24, 23, 23, 22],
    ];

    for (const pagesByRung of scenarios) {
      const linearProbes: AutoFitProbe[] = pagesByRung.map((pages, rungIndex) => ({
        rungIndex,
        pages,
        lastPageFill: 0.6,
        overflow: false,
      }));
      const expected = decideBestAutoFitRung(linearProbes, undefined);

      let s = autoFitSweepReducer(INITIAL_AUTOFIT_SWEEP_STATE, { type: "START" });
      while (s.phase === "sweeping") {
        const idx = s.probeRungIndex;
        s = autoFitSweepReducer(s, {
          type: "MEASURED",
          rungIndex: idx,
          pages: pagesByRung[idx],
          lastPageFill: 0.6,
          overflow: false,
          rungCount: pagesByRung.length,
        });
      }
      expect(s.decision?.rungIndex).toBe(expected.rungIndex);
      expect(s.decision?.pages).toBe(expected.pages);
      expect(s.probes.length).toBeLessThanOrEqual(4);
    }
  });

  it("early-stops exam_max_pages as soon as first valid rung fits targetMaxPages", () => {
    const rungCount = getLadderForMode("exam_max_pages").length;
    expect(rungCount).toBe(8);

    const pagesByRung = [4, 3, 2, 2, 2, 2, 1, 1];
    let s = autoFitSweepReducer(INITIAL_AUTOFIT_SWEEP_STATE, { type: "START" });
    while (s.phase === "sweeping") {
      const idx = s.probeRungIndex;
      s = autoFitSweepReducer(s, {
        type: "MEASURED",
        rungIndex: idx,
        pages: pagesByRung[idx],
        lastPageFill: 0.8,
        overflow: false,
        rungCount,
        targetMaxPages: 2,
      });
    }
    expect(s.phase).toBe("done");
    expect(s.probes.length).toBe(3);
    expect(s.decision?.rungIndex).toBe(2);
    expect(s.decision?.status).toBe("fit");
  });

  it("never triggers an early stop on overflowing rung 0", () => {
    const pagesByRung = [2, 2, 2, 2, 2];
    const overflows = [true, true, false, false, false];
    let s = autoFitSweepReducer(INITIAL_AUTOFIT_SWEEP_STATE, { type: "START" });
    while (s.phase === "sweeping") {
      const idx = s.probeRungIndex;
      s = autoFitSweepReducer(s, {
        type: "MEASURED",
        rungIndex: idx,
        pages: pagesByRung[idx],
        lastPageFill: 0.6,
        overflow: overflows[idx],
        rungCount: 5,
      });
    }
    expect(s.phase).toBe("done");
    expect(s.decision?.rungIndex).toBe(2);
  });
});
