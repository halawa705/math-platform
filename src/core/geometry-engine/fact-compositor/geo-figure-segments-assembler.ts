/**
 * @file geo-figure-segments-assembler.ts
 * @description مساعد تجميع أضلاع الشكل الهندسي وامتدادات التساوي (EF = DE) دون تكرار في geo-figure-composer.
 * @invariant ملف ذري مستقل باسم فريد عالمياً (< 100 سطر وفق AGENTS.md).
 */

import type { CanonicalAngleNode, CanonicalSegmentNode } from "@/core/ssot/geometry-archetype-ssot";
import {
  resolveSegmentLineSemantics,
  type LinearEntityKind,
  type LinearEntityKindMap,
} from "../description-intake/linear-entity-kind-extractor";
import type { GeoFact, Seg } from "./geo-fact-types";
import { pairKey } from "./geo-label-utils";
import type { PlacedPolygon } from "./geo-shape-placers";
import { footOfPerpendicular, lineIntersection, vAdd, vDist, vScale, vSub, type Vec2 } from "./geo-vector-math";

export const MODULE_ID_GEO_FIGURE_SEGMENTS_ASSEMBLER =
  "geo_figure_segments_assembler" as const;

export interface AssembledExtraSeg {
  readonly a: string;
  readonly b: string;
  readonly dashed?: boolean;
  readonly lineKind?: LinearEntityKind;
}

export function resolvePerpFactHelper(params: {
  fact: Extract<GeoFact, { k: "perp" }>;
  points: Map<string, Vec2>;
  host: Map<string, Seg>;
  lengths: ReadonlyMap<string, { numeric?: number }>;
  addExtra: (a: string, b: string, dashed?: boolean) => void;
  addAngle: (v: string, a1: string, a2: string, extra?: Partial<CanonicalAngleNode>) => void;
}): boolean {
  const { fact, points, host, lengths, addExtra, addAngle } = params;
  const P = (k: string) => points.get(k);
  const [a0, a1] = fact.a; const [b0, b1] = fact.b;
  if (!fact.foot && P(a0) && P(a1) && P(b0) && P(b1)) {
    const hit = lineIntersection(P(a0)!, P(a1)!, P(b0)!, P(b1)!);
    if (hit) {
      const existingMeet = [...points.entries()].find(([, pt]) => vDist(pt, hit) < 0.08)?.[0];
      addExtra(a0, a1); addExtra(b0, b1);
      if (existingMeet && existingMeet !== a0 && existingMeet !== b0) addAngle(existingMeet, a0, b0, { isRightAngle: true, degrees: 90 });
      return true;
    }
  }
  let [apex, foot] = fact.a;
  if (fact.foot) foot = fact.foot;
  if (!P(apex) && P(foot)) [apex, foot] = [foot, apex];
  if (!P(apex) || !P(b0) || !P(b1)) return false;
  const len0 = lengths.get(pairKey(b0, foot))?.numeric;
  const len1 = lengths.get(pairKey(foot, b1))?.numeric;
  const lenAlt = lengths.get(pairKey(apex, foot))?.numeric;
  if (Math.abs(P(b0)!.y - P(b1)!.y) < 1e-6 && (len0 || len1 || lenAlt)) {
    const y0 = P(b0)!.y; const x0 = Math.min(P(b0)!.x, P(b1)!.x);
    const d0 = len0 ?? 3; const d1 = len1 ?? 5; const h = lenAlt ?? 4;
    points.set(b0, { x: x0, y: y0 }); points.set(foot, { x: x0 + d0, y: y0 });
    points.set(b1, { x: x0 + d0 + d1, y: y0 }); points.set(apex, { x: x0 + d0, y: y0 + h });
  } else points.set(foot, footOfPerpendicular(P(apex)!, P(b0)!, P(b1)!));
  host.set(foot, fact.b); addExtra(apex, foot);
  addAngle(foot, apex, vDist(P(foot)!, P(b1)!) >= vDist(P(foot)!, P(b0)!) ? b1 : b0, { isRightAngle: true, degrees: 90 });
  return true;
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
      isReflex: fact.reflex || (fact.deg !== undefined && fact.deg > 180) || undefined,
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
  linearKindMap?: LinearEntityKindMap;
}): CanonicalSegmentNode[] {
  const { figureId, polygons, points, host, lengths, ticks, parallelMarks, extras, linearKindMap } = params;
  const keyId = (k: string) => `${figureId}_v_${k}`;
  const P = (k: string) => points.get(k);
  const segments: CanonicalSegmentNode[] = [];
  const seenSegPairs = new Set<string>();

  const pushSeg = (
    a: string,
    b: string,
    baseKey: string,
    dashed?: boolean,
    explicitLineKind?: LinearEntityKind,
    allowKindLookup = false
  ) => {
    const pk = pairKey(a, b);
    if (seenSegPairs.has(pk)) return;
    seenSegPairs.add(pk);
    const len = lengths.get(pk);
    const lineSem =
      explicitLineKind || allowKindLookup
        ? resolveSegmentLineSemantics(a, b, linearKindMap, explicitLineKind)
        : {};
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
      ...(ticks.get(pk) && ticks.get(pk)! <= 3 ? { tickMarks: ticks.get(pk)! as 1 | 2 | 3 } : {}),
      ...(parallelMarks.get(baseKey)
        ? { parallelArrows: parallelMarks.get(baseKey) as 1 | 2 }
        : {}),
      ...(dashed ? { strokeStyle: "dashed" as const } : {}),
      ...lineSem,
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
        !chain.some(
          (u, j) =>
            j + 1 < chain.length &&
            lengths.get(pairKey(u, chain[j + 1]))?.text === lengths.get(base)?.text
        )
      ) {
        labeledFullSides.add(base);
        seenSegPairs.add(base);
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
    const pA = P(e.a);
    const pB = P(e.b);
    if (!pA || !pB) continue;
    const base = pairKey(e.a, e.b);
    const segLen = vDist(pA, pB);
    const mids =
      segLen > 1e-4
        ? [...points.entries()]
            .filter(([k, pk]) => {
              if (k === e.a || k === e.b) return false;
              const h = host.get(k);
              if (h && pairKey(h[0], h[1]) === base) return true;
              const t =
                ((pk.x - pA.x) * (pB.x - pA.x) + (pk.y - pA.y) * (pB.y - pA.y)) /
                (segLen * segLen);
              if (t <= 0.05 || t >= 0.95) return false;
              const cross =
                Math.abs((pB.x - pA.x) * (pk.y - pA.y) - (pB.y - pA.y) * (pk.x - pA.x)) /
                segLen;
              return cross <= 1e-2 * segLen;
            })
            .map(([k]) => k)
            .sort((m, n) => vDist(pA, P(m)!) - vDist(pA, P(n)!))
        : [];
    const chain = [e.a, ...mids, e.b];
    const hasSubLenOrTick =
      mids.length > 0 &&
      chain.some(
        (u, j) =>
          j + 1 < chain.length &&
          (lengths.has(pairKey(u, chain[j + 1])) || ticks.has(pairKey(u, chain[j + 1])))
      );
    if (hasSubLenOrTick) {
      for (let j = 0; j + 1 < chain.length; j++) {
        const isLast = j + 2 === chain.length;
        pushSeg(
          chain[j],
          chain[j + 1],
          base,
          e.dashed,
          isLast ? e.lineKind : undefined,
          isLast
        );
      }
      if (lengths.has(base) && !labeledFullSides.has(base)) {
        labeledFullSides.add(base);
        seenSegPairs.add(base);
        const fullLen = lengths.get(base)!;
        segments.push({
          id: `${figureId}_s_${segments.length}`,
          fromVertexId: keyId(e.a),
          toVertexId: keyId(e.b),
          lengthLabel: {
            value: fullLen.symbolic ? fullLen.text : (fullLen.numeric ?? fullLen.text),
            unit: (fullLen.unit ?? "سم") as "سم",
          },
        });
      }
    } else {
      pushSeg(e.a, e.b, base, e.dashed, e.lineKind, true);
    }
  }
  return segments;
}
