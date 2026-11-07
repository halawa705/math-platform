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
  const currentProbe: AutoFitProbe = {
    rungIndex: action.rungIndex,
    pages: action.pages,
    lastPageFill: action.lastPageFill,
    overflow: action.overflow,
  };
  const probes = [...state.probes, currentProbe];

  // قطع مبكر ذكي (Smart Early-Exit):
  // 1) في وضع تحديد سقف الصفحات (الاختبارات): بمجرد الوصول لدرجة تحقق السقف المطلوب بدون فيض، نتوقف فوراً.
  if (action.targetMaxPages !== undefined && !action.overflow && action.pages <= action.targetMaxPages) {
    const decision = decideBestAutoFitRung(probes, action.targetMaxPages);
    return { phase: "done", probeRungIndex: decision.rungIndex, probes, decision };
  }

  // 2) في وضع ملء المذكرة (booklet_fill): إذا لم يكن هناك فيض وكانت الصفحة الأخيرة ممتلئة بنسبة ممتازة (>= 52%) أو هي صفحة واحدة فقط،
  // فلا داعي لتصغير الخط أكثر؛ نعتمد هذه الدرجة المريحة فوراً!
  // وكذلك قبل النزول للدرجة الأخيرة القصوى (11.5pt)، لا ننزل إليها إلا إذا كانت الصفحة الأخيرة في 12pt شبه فارغة (< 22% ذيل يتيم) أو بها فيض.
  if (action.targetMaxPages === undefined && !action.overflow) {
    if (action.pages <= 1 || action.lastPageFill >= 0.52) {
      const decision = decideBestAutoFitRung(probes, undefined);
      return { phase: "done", probeRungIndex: decision.rungIndex, probes, decision };
    }
    const nextIdx = action.rungIndex + 1;
    const isNextExtremeRung = nextIdx === action.rungCount - 1 && action.rungCount >= 4;
    if (isNextExtremeRung && action.lastPageFill >= 0.22) {
      const decision = decideBestAutoFitRung(probes, undefined);
      return { phase: "done", probeRungIndex: decision.rungIndex, probes, decision };
    }
  }

  const next = action.rungIndex + 1;
  if (next < action.rungCount) return { phase: "sweeping", probeRungIndex: next, probes, decision: null };
  const decision = decideBestAutoFitRung(probes, action.targetMaxPages);
  return { phase: "done", probeRungIndex: decision.rungIndex, probes, decision };
}
