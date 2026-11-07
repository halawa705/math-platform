/**
 * @file autofit-decision.ts
 * @description دالة نقية تختار أريح درجة (Rung) تحقق أفضل عدد صفحات.
 */
export const MODULE_ID_AUTOFIT_DECISION = "autofit_decision" as const;

export interface AutoFitProbe {
  readonly rungIndex: number;
  readonly pages: number;
  readonly lastPageFill: number; // 0..1+
  readonly avgFill?: number;      // 0..1+ متوسط امتلاء جميع الصفحات
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
  const limit = targetMaxPages !== undefined ? targetMaxPages : minPages;
  const candidates = pool.filter((p) => p.pages <= limit);
  if (targetMaxPages === undefined && candidates.length > 1) {
    // من بين الدرجات التي تعطي أقل عدد صفحات، نختار الدرجة صاحبة أعلى متوسط امتلاء للصفحات (لتقليل الفراغات في كل الصفحات)
    // مع تجنب الدرجة القصوى الأخيرة (11.5pt) إذا كانت هناك درجة >= 12pt تحقق نفس عدد الصفحات.
    const nonExtreme = candidates.filter((c) => c.rungIndex < probes.length - 1);
    const activeCandidates = nonExtreme.length > 0 ? nonExtreme : candidates;
    const bestFill = activeCandidates.slice().sort((a, b) => {
      const fillA = a.avgFill ?? a.lastPageFill;
      const fillB = b.avgFill ?? b.lastPageFill;
      if (Math.abs(fillB - fillA) > 0.03) return fillB - fillA;
      return a.rungIndex - b.rungIndex;
    })[0];
    return { rungIndex: bestFill.rungIndex, pages: bestFill.pages, status: "fill", overBy: 0 };
  }
  const chosen = candidates[0] ?? pool[0];
  return { rungIndex: chosen.rungIndex, pages: chosen.pages, status: targetMaxPages !== undefined ? "fit" : "fill", overBy: 0 };
}
