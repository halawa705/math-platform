/**
 * @file geo-parallel-transversals-placer.ts
 * @description واضع وباني الأشكال الهندسية لنظرية المستقيمات المتوازية والقواطع (Parallel Lines & Transversals Placer).
 * @invariant ملف ذري مستقل باسم فريد عالمياً (< 260 سطراً وفق AGENTS.md).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
} from "@/core/ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "@/core/ssot/numeral-and-unit-ssot";
import { toDisplayLabel } from "./geo-label-utils";
import {
  applyLengthsToTransversal,
  detectParallelLineCountAndNames,
  extractCommaVertexListAfterMarker,
  extractParallelEqualChains,
  extractParallelNamedSegLengths,
  FORBIDDEN_PARALLEL_POLYGON_RE,
  formatParallelExpressionValue,
  mapVertexChainFromLines,
  stripParallelLatexNoise,
  type TransversalSpec,
} from "./geo-parallel-transversals-parser";

export const MODULE_ID_GEO_PARALLEL_TRANSVERSALS_PLACER =
  "geo_parallel_transversals_placer" as const;

export function tryComposeParallelTransversalsFigure(
  description: string,
  figureId: string,
  notation: MathNotationLanguage = "arabic"
): CanonicalGeometryFigureIR | null {
  const normalized = stripParallelLatexNoise(description);
  const givens = normalized.split(/المطلوب\s*:/)[0] ?? normalized;
  if (FORBIDDEN_PARALLEL_POLYGON_RE.test(givens)) return null;

  const detected = detectParallelLineCountAndNames(givens);
  if (!detected || detected.count < 3 || detected.count > 5) return null;

  const n = detected.count;
  const eqChains = extractParallelEqualChains(givens);
  const namedLens = extractParallelNamedSegLengths(givens);

  let t1Pts = Array.from({ length: n }, () => "");
  let t2Pts = Array.from({ length: n }, () => "");
  let sharedApex = false;
  let extraTipOnLine0: string | undefined;

  if (detected.namedPairs) {
    const mapped = mapVertexChainFromLines(detected.namedPairs, givens, eqChains, namedLens);
    t1Pts = mapped.t1;
    t2Pts = mapped.t2;
    sharedApex = mapped.sharedApex;
    extraTipOnLine0 = mapped.extraTipOnLine0;
  } else {
    if (eqChains.length > 0 && eqChains[0].chain.length === n) {
      t1Pts = [...eqChains[0].chain];
    } else {
      const p1 = extractCommaVertexListAfterMarker(
        givens,
        /(?:القاطع\s*(?:الأول\s*)?(?:t1\s*)?(?:يقطعها\s*في|فيه))/
      );
      if (p1 && p1.length === n) t1Pts = p1;
    }

    const p2 = extractCommaVertexListAfterMarker(
      givens,
      /(?:القاطع\s*(?:الثاني\s*)?(?:t2\s*)?(?:يقطعها\s*في|فيه)|t2\s*(?:يقطعها\s*في|فيه))/
    );
    if (p2 && p2.length === n) {
      t2Pts = p2;
    } else {
      const candidateSeq: string[] = [];
      for (const [key] of namedLens) {
        const [u, v] = key.split("|");
        if (t1Pts.includes(u) || t1Pts.includes(v)) continue;
        if (!candidateSeq.includes(u)) candidateSeq.push(u);
        if (!candidateSeq.includes(v)) candidateSeq.push(v);
      }
      if (candidateSeq.length === n) t2Pts = candidateSeq;
    }
  }

  const t1: TransversalSpec = {
    points: t1Pts,
    equalTicks:
      eqChains.length > 0 ||
      /أجزاؤه\s*متساوية|مقسم\s*إلى\s*\d+\s*أجزاء\s*متساوية/.test(givens),
    uniformSegValue: eqChains[0]?.value,
    segLabels: new Map(),
    compositeSpans: [],
  };
  const t2: TransversalSpec = {
    points: t2Pts,
    equalTicks: false,
    segLabels: new Map(),
    compositeSpans: [],
  };

  if (!t1.uniformSegValue) {
    const eachVal = givens.match(/متساوية\s*كل\s*منها\s*([0-9]+(?:\.[0-9]+)?)\s*سم/);
    if (eachVal) t1.uniformSegValue = eachVal[1];
  }
  if (t1.uniformSegValue) t1.segLabels.set(0, t1.uniformSegValue);

  applyLengthsToTransversal(t1, namedLens, n);
  applyLengthsToTransversal(t2, namedLens, n);

  const t2ExprBlock = givens.match(/(?:القاطع\s*الثاني\s*|أجزاء\s*القاطع\s*الثاني\s*(?:هي\s*)?)(?:أجزاؤه\s*)?([^;؛]+)$/);
  const anonExprSrc =
    givens.match(/القاطع\s*الثاني\s*أجزاؤه\s*([^;؛]+)/)?.[1] ??
    givens.match(/أجزاء\s*القاطع\s*الثاني\s*(?:هي\s*)?([^;؛]+)/)?.[1] ??
    (t2.segLabels.size === 0 ? t2ExprBlock?.[1] : undefined);
  if (anonExprSrc && t2.segLabels.size === 0) {
    const parts = anonExprSrc
      .split(/\s+و\s+/)
      .map((s) => formatParallelExpressionValue(s))
      .filter((s) => s.length > 0 && /[0-9xyaXYA]/.test(s) && !/أجزاء|طوله/.test(s));
    for (let i = 0; i < Math.min(parts.length, n - 1); i++) t2.segLabels.set(i, parts[i]);
  }

  const totalT2 = givens.match(/القاطع\s*الثاني\s*طوله\s*(?:الكلي\s*)?([0-9]+(?:\.[0-9]+)?)\s*سم/);
  if (totalT2) t2.compositeSpans.push({ startIdx: 0, endIdx: n - 1, label: totalT2[1] });

  const yStep = 2.0;
  const topY = (n - 1) * yStep;
  const vertices: CanonicalVertexNode[] = [];
  const segments: CanonicalSegmentNode[] = [];
  const lineStartX = -2.5;
  const lineEndX = 10.2;
  const t1Coords: { id: string; x: number; y: number }[] = [];
  const t2Coords: { id: string; x: number; y: number }[] = [];

  for (let i = 0; i < n; i++) {
    const y = Number((topY - i * yStep).toFixed(2));
    const frac = i / (n - 1);
    const x1 = sharedApex ? Number((4.2 - frac * 2.9).toFixed(2)) : Number((2.2 - frac * 1.1).toFixed(2));
    const x2 = sharedApex ? Number((4.2 + frac * 3.1).toFixed(2)) : Number((6.2 + frac * 1.2).toFixed(2));

    const l1 = t1.points[i];
    const l2 = t2.points[i];
    const id1 = l1 ? `${figureId}_v_${l1}` : `${figureId}_v_t1_${i}`;
    vertices.push({ id: id1, label: l1 ? toDisplayLabel(l1, notation) : "", position: { x: x1, y } });
    t1Coords.push({ id: id1, x: x1, y });

    if (sharedApex && i === 0) {
      t2Coords.push({ id: id1, x: x1, y });
    } else {
      const id2 = l2 ? `${figureId}_v_${l2}` : `${figureId}_v_t2_${i}`;
      vertices.push({ id: id2, label: l2 ? toDisplayLabel(l2, notation) : "", position: { x: x2, y } });
      t2Coords.push({ id: id2, x: x2, y });
    }

    const leftId = `${figureId}_v_pl_${i}`;
    const hasTip = i === 0 && sharedApex && extraTipOnLine0;
    const rightId = hasTip ? `${figureId}_v_${extraTipOnLine0}` : `${figureId}_v_pr_${i}`;
    vertices.push(
      { id: leftId, label: detected.lineLabels[i] ?? "", position: { x: lineStartX, y } },
      { id: rightId, label: hasTip ? toDisplayLabel(extraTipOnLine0!, notation) : "", position: { x: lineEndX, y } }
    );
    segments.push({ id: `${figureId}_s_${segments.length}`, fromVertexId: leftId, toVertexId: rightId, parallelArrows: 1, isLine: true });
  }

  const emitTransversal = (coords: typeof t1Coords, spec: TransversalSpec) => {
    for (let i = 0; i + 1 < coords.length; i++) {
      const lbl = spec.segLabels.get(i);
      segments.push({
        id: `${figureId}_s_${segments.length}`,
        fromVertexId: coords[i].id,
        toVertexId: coords[i + 1].id,
        ...(spec.equalTicks ? { tickMarks: 1 as const } : {}),
        ...(lbl ? { lengthLabel: { value: lbl, unit: "سم" as const } } : {}),
      });
    }
    for (const span of spec.compositeSpans) {
      if (span.startIdx < span.endIdx && coords[span.endIdx]) {
        segments.push({
          id: `${figureId}_s_${segments.length}`,
          fromVertexId: coords[span.startIdx].id,
          toVertexId: coords[span.endIdx].id,
          strokeStyle: "dashed",
          lengthLabel: { value: span.label, unit: "سم" as const },
        });
      }
    }
  };

  emitTransversal(t1Coords, t1);
  emitTransversal(t2Coords, t2);

  return {
    figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: description.slice(0, 70),
    notationLanguage: notation,
    vertices,
    segments,
    angles: [],
    polygons: [],
  };
}
