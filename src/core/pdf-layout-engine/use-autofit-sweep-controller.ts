"use client";

import { useEffect, useReducer } from "react";
import type { FlowPage } from "./flow-item-model";
import { autoFitSweepReducer, INITIAL_AUTOFIT_SWEEP_STATE, type AutoFitSweepState } from "./autofit-sweep-reducer";
import type { AutoFitModeId } from "./autofit-ladders";

export const MODULE_ID_USE_AUTOFIT_SWEEP_CONTROLLER = "use_autofit_sweep_controller" as const;

export function useAutoFitSweepController(params: {
  readonly mode: AutoFitModeId;
  readonly rungCount: number;
  readonly targetMaxPages?: number;
  /** نص يتغير كلما تغيّرت مدخلات تستدعي إعادة الفحص (الأسئلة، الأعمدة، الكثافة، الخط العائلة، وضع الإجابات...). */
  readonly inputSignature: string;
  /** ختم القياس الحالي القادم من useFlowStagingLiveMeasurer. */
  readonly measureStamp: string;
  readonly pages: readonly FlowPage[];
}): AutoFitSweepState {
  const { mode, rungCount, targetMaxPages, inputSignature, measureStamp, pages } = params;
  const [state, dispatch] = useReducer(autoFitSweepReducer, INITIAL_AUTOFIT_SWEEP_STATE);

  useEffect(() => {
    dispatch(mode === "off" || rungCount === 0 ? { type: "STOP" } : { type: "START" });
  }, [mode, rungCount, inputSignature]);

  useEffect(() => {
    if (state.phase !== "sweeping" || pages.length === 0) return;
    if (measureStamp !== `rung-${state.probeRungIndex}`) return;
    const last = pages[pages.length - 1];
    dispatch({
      type: "MEASURED",
      rungIndex: state.probeRungIndex,
      pages: pages.length,
      lastPageFill: last.budgetHeightPx > 0 ? last.usedHeightPx / last.budgetHeightPx : 0,
      overflow: pages.some((p) => p.overflowsBudget),
      rungCount,
      targetMaxPages,
    });
  }, [state.phase, state.probeRungIndex, measureStamp, pages, rungCount, targetMaxPages]);

  return state;
}
