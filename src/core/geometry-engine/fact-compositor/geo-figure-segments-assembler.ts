/**
 * @file geo-figure-segments-assembler.ts
 * @description مساعد تجميع أضلاع الشكل الهندسي وامتدادات التساوي (EF = DE) دون تكرار في geo-figure-composer.
 * @invariant ملف ذري مستقل باسم فريد عالمياً (< 100 سطر وفق AGENTS.md).
 */

import type { CanonicalAngleNode, CanonicalSegmentNode } from "@/core/ssot/geometry-archetype-ssot";
import type { GeoFact, Seg } from "./geo-fact-types";
import { pairKey } from "./geo-label-utils";
import type { PlacedPolygon } from "./geo-shape-placers";
import { vAdd, vDist, vScale, vSub, type Vec2 } from "./geo-vector-math";

export const MODULE_ID_GEO_FIGURE_SEGMENTS_ASSEMBLER =
  "geo_figure_segments_assembler" as const;

export interface AssembledExtraSeg {
  readonly a: string;
  readonly b: string;
  readonly dashed?: boolean;
}

export function resolveAngleFactHelper(params: {
  fact: Extract<GeoFact, { k: "angle" }>;
  polyOf: (v: string) => PlacedPolygon | undefined;
  extras: readonly AssembledExtraSeg[];
  host: ReadonlyMap<string, Seg>;
  points: ReadonlyMap<string, Vec2>;
  addAngle: (v: string, a1: string, a2: string, extra?: Partial<CanonicalAngleNode>) => void;
}): void {
  const { fact, polyOf, extras, host, points, addAngle } = params;
  const poly = polyOf(fact.vertex);
  const labels = poly?.labels ?? [];
  const i = labels.indexOf(fact.vertex);
  let arms: [string, string] | null = fact.arms
    ? [fact.arms[0], fact.arms[2]]
    : i >= 0
      ? [labels[(i + labels.length - 1) % labels.length], labels[(i + 1) % labels.length]]
      : null;
  if (!arms) {
    const neighbors = extras.flatMap((e) => (e.a === fact.vertex ? [e.b] : e.b === fact.vertex ? [e.a] : []));
    const hSeg = host.get(fact.vertex);
    if (hSeg) neighbors.push(hSeg[0], hSeg[1]);
    const uniqueN = Array.from(new Set(neighbors.filter((n) => n !== fact.vertex && points.has(n))));
    if (uniqueN.length >= 2) arms = [uniqueN[0], uniqueN[1]];
  }
  const eqAngleMatch = fact.text?.match(/^(?:ق|m)?\s*\(?\s*∠\s*([A-Z])\s*\)?$/);
  if (arms && eqAngleMatch) {
    const vOther = eqAngleMatch[1];
    const lblO = polyOf(vOther)?.labels ?? [];
    const iO = lblO.indexOf(vOther);
    addAngle(fact.vertex, arms[0], arms[1], { markSymbol: "dot" });
    if (iO >= 0) {
      addAngle(vOther, lblO[(iO + lblO.length - 1) % lblO.length], lblO[(iO + 1) % lblO.length], { markSymbol: "dot" });
    }
  } else if (arms && points.has(arms[0]) && points.has(arms[1])) {
    addAngle(fact.vertex, arms[0], arms[1], {
      degrees: fact.deg,
      degreesLabel: fact.text ?? (fact.deg !== undefined && !fact.right ? `${fact.deg}°` : undefined),
      isRightAngle: fact.right,
    });
  }
}

export function resolveExtendWithEqualHelper(params: {
  fact: Extract<GeoFact, { k: "extend" }>;
  facts: readonly GeoFact[];
  points: Map<string, Vec2>;
  host: Map<string, Seg>;
  lengths: ReadonlyMap<string, { numeric?: number }>;
  addExtra: (a: string, b: string, dashed?: boolean) => void;
}): void {
  const { fact, facts, points, host, lengths, addExtra } = params;
  const A = points.get(fact.from);
  const B = points.get(fact.through);
  if (!A || !B) return;

  const isEqualExtend = facts.some(
    (ef) =>
      ef.k === "equal" &&
      ((pairKey(ef.a[0], ef.a[1]) === pairKey(fact.from, fact.through) &&
        pairKey(ef.b[0], ef.b[1]) === pairKey(fact.through, fact.to)) ||
        (pairKey(ef.b[0], ef.b[1]) === pairKey(fact.from, fact.through) &&
          pairKey(ef.a[0], ef.a[1]) === pairKey(fact.through, fact.to)))
  );
  const len =
    lengths.get(pairKey(fact.through, fact.to))?.numeric ??
    (isEqualExtend ? vDist(A, B) : vDist(A, B) * 0.4);
  points.set(fact.to, vAdd(B, vScale(vSub(B, A), len / (vDist(A, B) || 1))));
  addExtra(fact.through, fact.to, true);

  if (isEqualExtend) {
    const hFrom = host.get(fact.from);
    const hThru = host.get(fact.through);
    const sharedApex = hFrom && hThru ? hFrom.find((v) => hThru.includes(v)) : undefined;
    const otherOnThru = hThru && sharedApex ? hThru.find((v) => v !== sharedApex) : undefined;
    if (sharedApex) addExtra(sharedApex, fact.to, true);
    if (otherOnThru) addExtra(otherOnThru, fact.to, true);
  }
}

export function assembleCanonicalFigureSegments(params: {
  figureId: string;
  polygons: readonly PlacedPolygon[];
  points: ReadonlyMap<string, Vec2>;
  host: ReadonlyMap<string, Seg>;
  lengths: ReadonlyMap<string, { text: string; numeric?: number; symbolic?: boolean; unit?: string }>;
  ticks: ReadonlyMap<string, number>;
  parallelMarks: ReadonlyMap<string, number>;
  extras: readonly AssembledExtraSeg[];
}): CanonicalSegmentNode[] {
  const { figureId, polygons, points, host, lengths, ticks, parallelMarks, extras } = params;
  const keyId = (k: string) => `${figureId}_v_${k}`;
  const P = (k: string) => points.get(k);
  const segments: CanonicalSegmentNode[] = [];
  const seenSegPairs = new Set<string>();

  const pushSeg = (a: string, b: string, baseKey: string, dashed?: boolean) => {
    const pk = pairKey(a, b);
    if (seenSegPairs.has(pk)) return;
    seenSegPairs.add(pk);
    const len = lengths.get(pk);
    segments.push({
      id: `${figureId}_s_${segments.length}`,
      fromVertexId: keyId(a),
      toVertexId: keyId(b),
      ...(len
        ? {
            lengthLabel: {
              value: len.symbolic ? len.text : (len.numeric ?? len.text),
              unit: (len.unit ?? "سم") as "سم",
            },
          }
        : {}),
      ...(ticks.get(pk) ? { tickMarks: Math.min(3, ticks.get(pk)!) as 1 | 2 | 3 } : {}),
      ...(parallelMarks.get(baseKey)
        ? { parallelArrows: parallelMarks.get(baseKey) as 1 | 2 }
        : {}),
      ...(dashed ? { strokeStyle: "dashed" as const } : {}),
    });
  };

  const labeledFullSides = new Set<string>();
  for (const poly of polygons) {
    poly.labels.forEach((a, i) => {
      const b = poly.labels[(i + 1) % poly.labels.length];
      const base = pairKey(a, b);
      const mids = [...host.entries()]
        .filter(([, s]) => pairKey(s[0], s[1]) === base)
        .map(([k]) => k)
        .sort((m, n) => vDist(P(a)!, P(m)!) - vDist(P(a)!, P(n)!));
      const chain = [a, ...mids, b];
      for (let j = 0; j + 1 < chain.length; j++) pushSeg(chain[j], chain[j + 1], base);
      if (
        mids.length > 0 &&
        lengths.has(base) &&
        !labeledFullSides.has(base) &&
        !chain.some((u, j) => j + 1 < chain.length && lengths.has(pairKey(u, chain[j + 1])))
      ) {
        labeledFullSides.add(base);
        const fullLen = lengths.get(base)!;
        segments.push({
          id: `${figureId}_s_${segments.length}`,
          fromVertexId: keyId(a),
          toVertexId: keyId(b),
          lengthLabel: {
            value: fullLen.symbolic ? fullLen.text : (fullLen.numeric ?? fullLen.text),
            unit: (fullLen.unit ?? "سم") as "سم",
          },
        });
      }
    });
  }
  for (const e of extras) {
    if (P(e.a) && P(e.b)) pushSeg(e.a, e.b, pairKey(e.a, e.b), e.dashed);
  }
  return segments;
}
