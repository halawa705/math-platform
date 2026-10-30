/**
 * @file autofit-sweep-reducer.ts
 * @description آلة حالة نقية تمرّ على درجات السلّم واحدة واحدة (قياس كل درجة) ثم تقرر الدرجة النهائية.
 */
import { decideBestAutoFitRung, type AutoFitDecision, type AutoFitProbe } from "./autofit-decision";

export const MODULE_ID_AUTOFIT_SWEEP_REDUCER = "autofit_sweep_reducer" as const;

export interface AutoFitSweepState {
  readonly phase: "idle" | "sweeping" | "done";
  readonly probeRungIndex: number;       // الدرجة المستخدمة الآن في القياس الخفي
  readonly probes: readonly AutoFitProbe[];
  readonly decision: AutoFitDecision | null;
}

export type AutoFitSweepAction =
  | { readonly type: "START" }
  | { readonly type: "MEASURED"; readonly rungIndex: number; readonly pages: number; readonly lastPageFill: number; readonly overflow: boolean; readonly rungCount: number; readonly targetMaxPages?: number }
  | { readonly type: "STOP" };

export const INITIAL_AUTOFIT_SWEEP_STATE: AutoFitSweepState = { phase: "idle", probeRungIndex: 0, probes: [], decision: null };

export function autoFitSweepReducer(state: AutoFitSweepState, action: AutoFitSweepAction): AutoFitSweepState {
  if (action.type === "STOP") return INITIAL_AUTOFIT_SWEEP_STATE;
  if (action.type === "START") return { phase: "sweeping", probeRungIndex: 0, probes: [], decision: null };
  if (state.phase !== "sweeping" || action.rungIndex !== state.probeRungIndex) return state; // قياس قديم: تجاهل
  const probes = [...state.probes, { rungIndex: action.rungIndex, pages: action.pages, lastPageFill: action.lastPageFill, overflow: action.overflow }];
  const next = action.rungIndex + 1;
  if (next < action.rungCount) return { phase: "sweeping", probeRungIndex: next, probes, decision: null };
  const decision = decideBestAutoFitRung(probes, action.targetMaxPages);
  return { phase: "done", probeRungIndex: decision.rungIndex, probes, decision };
}
