/**
 * @file autofit-sweep-reducer.ts
 * @description آلة حالة نقية تمرّ على درجات السلّم واحدة واحدة (قياس كل درجة) ثم تقرر الدرجة النهائية.
 */
import { decideBestAutoFitRung, type AutoFitDecision, type AutoFitProbe } from "./autofit-decision";

export const MODULE_ID_AUTOFIT_SWEEP_REDUCER = "autofit_sweep_reducer" as const;

export interface AutoFitSweepState {
  readonly phase: "idle" | "sweeping" | "done";
  readonly probeRungIndex: number;
  readonly probes: readonly AutoFitProbe[];
  readonly decision: AutoFitDecision | null;
  readonly searchRange?: readonly [number, number];
}

export type AutoFitSweepAction =
  | { readonly type: "START" }
  | { readonly type: "MEASURED"; readonly rungIndex: number; readonly pages: number; readonly lastPageFill: number; readonly avgFill?: number; readonly overflow: boolean; readonly rungCount: number; readonly targetMaxPages?: number }
  | { readonly type: "STOP" };

export const INITIAL_AUTOFIT_SWEEP_STATE: AutoFitSweepState = { phase: "idle", probeRungIndex: 0, probes: [], decision: null };

export function autoFitSweepReducer(state: AutoFitSweepState, action: AutoFitSweepAction): AutoFitSweepState {
  if (action.type === "STOP") return INITIAL_AUTOFIT_SWEEP_STATE;
  if (action.type === "START") return { phase: "sweeping", probeRungIndex: 0, probes: [], decision: null };
  if (state.phase !== "sweeping" || action.rungIndex !== state.probeRungIndex) return state;
  const probes = [...state.probes, { rungIndex: action.rungIndex, pages: action.pages, lastPageFill: action.lastPageFill, avgFill: action.avgFill, overflow: action.overflow }];

  // إيقاف مبكر في وضع الحد الأقصى للامتحان فور تحقق الشرط بأكبر خط ممكن
  if (action.targetMaxPages !== undefined) {
    if ((!action.overflow && action.pages <= action.targetMaxPages) || action.rungIndex + 1 >= action.rungCount) {
      const decision = decideBestAutoFitRung(probes, action.targetMaxPages);
      return { phase: "done", probeRungIndex: decision.rungIndex, probes, decision };
    }
    return { phase: "sweeping", probeRungIndex: action.rungIndex + 1, probes, decision: null };
  }

  // وضع المذكرة: قفز سريع بالحدود (0 ثم الأضيق) ثم بحث ثنائي فقط عند وجود وفر فعلي في الصفحات
  if (action.rungCount >= 3) {
    const lastIdx = action.rungCount - 1;
    if (action.rungIndex === 0) {
      return { phase: "sweeping", probeRungIndex: lastIdx, probes, decision: null };
    }
    const p0 = probes.find((p) => p.rungIndex === 0);
    const pTight = probes.find((p) => p.rungIndex === lastIdx);
    if (action.rungIndex === lastIdx && p0 && !p0.overflow && !action.overflow && action.pages >= p0.pages) {
      const decision = decideBestAutoFitRung([p0], undefined);
      return { phase: "done", probeRungIndex: decision.rungIndex, probes, decision };
    }
    if (pTight && action.rungCount > 3) {
      let [lo, hi] = state.searchRange ?? [1, lastIdx];
      if (action.rungIndex !== lastIdx) {
        if (!action.overflow && action.pages <= pTight.pages) hi = action.rungIndex;
        else lo = action.rungIndex + 1;
      }
      if (lo < hi) {
        const nextMid = lo + Math.floor((hi - lo) / 2);
        if (!probes.some((p) => p.rungIndex === nextMid)) {
          return { phase: "sweeping", probeRungIndex: nextMid, probes, decision: null, searchRange: [lo, hi] };
        }
      }
      const decision = decideBestAutoFitRung(probes, undefined);
      return { phase: "done", probeRungIndex: decision.rungIndex, probes, decision };
    }
    if (action.rungCount === 3 && action.rungIndex === lastIdx && !probes.some((p) => p.rungIndex === 1)) {
      return { phase: "sweeping", probeRungIndex: 1, probes, decision: null };
    }
    const decision = decideBestAutoFitRung(probes, undefined);
    return { phase: "done", probeRungIndex: decision.rungIndex, probes, decision };
  }

  const next = action.rungIndex + 1;
  if (next < action.rungCount) return { phase: "sweeping", probeRungIndex: next, probes, decision: null };
  const decision = decideBestAutoFitRung(probes, action.targetMaxPages);
  return { phase: "done", probeRungIndex: decision.rungIndex, probes, decision };
}
