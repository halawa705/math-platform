/**
 * @file autofit-decision.ts
 * @description دالة نقية تختار أريح درجة (Rung) تحقق أفضل عدد صفحات.
 */
export const MODULE_ID_AUTOFIT_DECISION = "autofit_decision" as const;

export interface AutoFitProbe {
  readonly rungIndex: number;
  readonly pages: number;
  readonly lastPageFill: number; // 0..1+
  readonly overflow: boolean;
}

export interface AutoFitDecision {
  readonly rungIndex: number;
  readonly pages: number;
  readonly status: "fit" | "fill" | "cannot_fit" | "no_data";
  readonly overBy: number;
}

export function decideBestAutoFitRung(probes: readonly AutoFitProbe[], targetMaxPages?: number): AutoFitDecision {
  if (probes.length === 0) return { rungIndex: 0, pages: 0, status: "no_data", overBy: 0 };
  const clean = probes.filter((p) => !p.overflow);
  const pool = (clean.length > 0 ? clean : probes).slice().sort((a, b) => a.rungIndex - b.rungIndex);
  const minPages = Math.min(...pool.map((p) => p.pages));
  if (targetMaxPages !== undefined && minPages > targetMaxPages) {
    const best = pool.find((p) => p.pages === minPages)!;
    return { rungIndex: best.rungIndex, pages: best.pages, status: "cannot_fit", overBy: minPages - targetMaxPages };
  }
  if (targetMaxPages === undefined && pool.length >= 2) {
    // تفضيل عدم النزول إلى آخر درجة قصوى (11.5pt) إذا كانت الدرجة التي تسبقها (12pt+) لا تعاني من ذيل يتيم (< 22%)
    const nonExtreme = pool.slice(0, -1);
    const minNonExtremePages = Math.min(...nonExtreme.map((p) => p.pages));
    const bestNonExtreme = nonExtreme.find((p) => p.pages === minNonExtremePages)!;
    if (bestNonExtreme.pages === minPages || bestNonExtreme.lastPageFill >= 0.22) {
      return { rungIndex: bestNonExtreme.rungIndex, pages: bestNonExtreme.pages, status: "fill", overBy: 0 };
    }
  }
  const limit = targetMaxPages !== undefined ? targetMaxPages : minPages;
  const chosen = pool.find((p) => p.pages <= limit)!;
  return { rungIndex: chosen.rungIndex, pages: chosen.pages, status: targetMaxPages !== undefined ? "fit" : "fill", overBy: 0 };
}
