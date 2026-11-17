"use client";

import { useCallback, useEffect, useReducer } from "react";
import type { FlowPage } from "./flow-item-model";
import { autoFitSweepReducer, INITIAL_AUTOFIT_SWEEP_STATE, type AutoFitSweepState } from "./autofit-sweep-reducer";
import type { AutoFitModeId } from "./autofit-ladders";

export const MODULE_ID_USE_AUTOFIT_SWEEP_CONTROLLER = "use_autofit_sweep_controller" as const;

export function useAutoFitSweepPhaseController(params: {
  readonly mode: AutoFitModeId;
  readonly rungCount: number;
  readonly inputSignature: string;
}): {
  readonly sweep: AutoFitSweepState;
  readonly submitMeasuredPages: (measureStamp: string, pages: readonly FlowPage[], targetMaxPages?: number) => void;
} {
  const { mode, rungCount, inputSignature } = params;
  const [sweep, dispatch] = useReducer(autoFitSweepReducer, INITIAL_AUTOFIT_SWEEP_STATE);

  useEffect(() => {
    dispatch(mode === "off" || rungCount === 0 ? { type: "STOP" } : { type: "START" });
  }, [mode, rungCount, inputSignature]);

  const submitMeasuredPages = useCallback(
    (measureStamp: string, pages: readonly FlowPage[], targetMaxPages?: number) => {
      if (sweep.phase !== "sweeping" || pages.length === 0) return;
      if (measureStamp !== `rung-${sweep.probeRungIndex}`) return;
      const last = pages[pages.length - 1];
      const avgFill =
        pages.reduce(
          (sum, p) => sum + (p.budgetHeightPx > 0 ? p.usedHeightPx / p.budgetHeightPx : 0),
          0
        ) / pages.length;
      dispatch({
        type: "MEASURED",
        rungIndex: sweep.probeRungIndex,
        pages: pages.length,
        lastPageFill: last.budgetHeightPx > 0 ? last.usedHeightPx / last.budgetHeightPx : 0,
        avgFill,
        overflow: pages.some((p) => p.overflowsBudget),
        rungCount,
        targetMaxPages,
      });
    },
    [sweep.phase, sweep.probeRungIndex, rungCount]
  );

  return { sweep, submitMeasuredPages };
}

export function useAutoFitSweepController(params: {
  readonly mode: AutoFitModeId;
  readonly rungCount: number;
  readonly targetMaxPages?: number;
  readonly inputSignature: string;
  readonly measureStamp: string;
  readonly pages: readonly FlowPage[];
}): AutoFitSweepState {
  const { mode, rungCount, targetMaxPages, inputSignature, measureStamp, pages } = params;
  const { sweep, submitMeasuredPages } = useAutoFitSweepPhaseController({ mode, rungCount, inputSignature });
  useEffect(() => {
    submitMeasuredPages(measureStamp, pages, targetMaxPages);
  }, [submitMeasuredPages, measureStamp, pages, targetMaxPages]);
  return sweep;
}
