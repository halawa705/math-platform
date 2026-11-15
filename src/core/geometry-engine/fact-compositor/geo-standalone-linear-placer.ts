/**
 * @file geo-standalone-linear-placer.ts
 * @description واضع الأشكال الخطية المستقلة (قطعة مستقيمة / شعاع / خط مستقيم / نقاط على استقامة واحدة / تقاطع مستقيمين)
 * عندما لا يحتوي الوصف على مضلع أو دائرة معلنة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 170 سطراً).
 */

import type {
  CanonicalAngleNode,
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
} from "@/core/ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "@/core/ssot/numeral-and-unit-ssot";
import {
  resolveSegmentLineSemantics,
  type LinearEntityKind,
  type LinearEntityKindMap,
} from "../description-intake/linear-entity-kind-extractor";
import type { GeoFact, Seg } from "./geo-fact-types";
import { pairKey, toDisplayLabel } from "./geo-label-utils";
import { vAdd, vLerp, vScale, type Vec2 } from "./geo-vector-math";

export const MODULE_ID_GEO_STANDALONE_LINEAR_PLACER =
  "geo_standalone_linear_placer" as const;

interface LinearSegmentSpec {
  readonly a: string;
  readonly b: string;
  readonly explicitKind?: LinearEntityKind;
  readonly dashed?: boolean;
}

export function tryComposeStandaloneLinearFigure(params: {
  readonly facts: readonly GeoFact[];
  readonly lengths: ReadonlyMap<string, { text: string; numeric?: number; symbolic?: boolean; unit?: string }>;
  readonly linearKindMap?: LinearEntityKindMap;
  readonly description: string;
  readonly figureId: string;
  readonly notation: MathNotationLanguage;
}): CanonicalGeometryFigureIR | null {
  const { facts, lengths, linearKindMap, description, figureId, notation } = params;
  const points = new Map<string, Vec2>();
  const rawSegs: LinearSegmentSpec[] = [];
  const angles: CanonicalAngleNode[] = [];
  const ticks = new Map<string, number>();

  const pushSeg = (a: string, b: string, explicitKind?: LinearEntityKind, dashed?: boolean) => {
    if (a === b) return;
    if (!rawSegs.some((s) => pairKey(s.a, s.b) === pairKey(a, b))) {
      rawSegs.push({ a, b, explicitKind, dashed });
    }
  };
  const parallelMarks = new Map<string, number>();

  // 1أ. قاطع يقطع مستقيمين متوازيين في نقطتين مسماتين (مثل CD // EF والقاطع AB في M و N)
  const parFact = facts.find((f): f is Extract<GeoFact, { k: "parallel" }> => f.k === "parallel");
  const allInterFacts = facts.filter((f): f is Extract<GeoFact, { k: "intersect" }> => f.k === "intersect");
  if (parFact && allInterFacts.length >= 2) {
    const i1 = allInterFacts[0];
    const i2 = allInterFacts[1];
    const [c, d] = parFact.a;
    const [e, f] = parFact.b;
    const mPt = i1.p;
    const nPt = i2.p;
    const transPair = pairKey(i1.a[0], i1.a[1]) === pairKey(parFact.a[0], parFact.a[1]) || pairKey(i1.a[0], i1.a[1]) === pairKey(parFact.b[0], parFact.b[1]) ? i1.b : i1.a;
    const [tA, tB] = transPair;
    points.set(c, { x: -4.2, y: 6 }); points.set(mPt, { x: -0.9, y: 6 }); points.set(d, { x: 4.2, y: 6 });
    points.set(e, { x: -4.2, y: 1.5 }); points.set(nPt, { x: 1.3, y: 1.5 }); points.set(f, { x: 4.2, y: 1.5 });
    points.set(tA, { x: -2.22, y: 8.7 }); points.set(tB, { x: 2.62, y: -1.2 });
    pushSeg(c, d, parFact.lineKindA ?? "line");
    pushSeg(e, f, parFact.lineKindB ?? "line");
    parallelMarks.set(pairKey(c, d), 1);
    parallelMarks.set(pairKey(e, f), 1);
    pushSeg(tA, tB, i1.lineKindA ?? "line");
    for (const af of facts) {
      if (af.k === "angle" && points.has(af.vertex)) {
        const arm1 = af.arms?.[0] ?? tA;
        const arm2 = af.arms?.[2] ?? d;
        if (points.has(arm1) && points.has(arm2)) {
          angles.push({ id: `${figureId}_ang_${angles.length}`, vertexId: `${figureId}_v_${af.vertex}`, arm1VertexId: `${figureId}_v_${arm1}`, arm2VertexId: `${figureId}_v_${arm2}`, degrees: af.deg, degreesLabel: af.text ?? (af.deg !== undefined ? `${af.deg}°` : undefined) });
        }
      }
    }
  }

  // 1ب. تقاطع مستقيمين / قطعتين / شعاعين في نقطة
  const interFact = !parFact ? allInterFacts[0] : undefined;
  if (interFact) {
    const angleFact = facts.find((f): f is Extract<GeoFact, { k: "angle" }> => f.k === "angle" && f.deg !== undefined);
    const thetaDeg = angleFact?.deg && angleFact.deg > 15 && angleFact.deg < 165 ? angleFact.deg : 55;
    const rad = (thetaDeg * Math.PI) / 180;
    const [a0, a1] = interFact.a;
    const [b0, b1] = interFact.b;
    const armLen = 4;
    points.set(interFact.p, { x: 0, y: 0 });
    if (a0 !== interFact.p) points.set(a0, { x: -armLen, y: 0 });
    if (a1 !== interFact.p) points.set(a1, { x: armLen, y: 0 });
    const dir = { x: Math.cos(rad), y: Math.sin(rad) };
    if (b0 !== interFact.p) points.set(b0, vScale(dir, -armLen));
    if (b1 !== interFact.p) points.set(b1, vScale(dir, armLen));
    pushSeg(a0, a1, interFact.lineKindA ?? "line");
    pushSeg(b0, b1, interFact.lineKindB ?? "line");
  }

  // 2. نقاط على استقامة واحدة
  const colFact = facts.find((f): f is Extract<GeoFact, { k: "collinear" }> => f.k === "collinear");
  if (colFact) {
    let cursorX = 0;
    colFact.labels.forEach((lbl, idx) => {
      if (idx > 0) {
        const prev = colFact.labels[idx - 1];
        const segLen = lengths.get(pairKey(prev, lbl))?.numeric ?? 4;
        cursorX += Math.max(1.5, Math.min(12, segLen));
        pushSeg(prev, lbl);
      }
      if (!points.has(lbl)) points.set(lbl, { x: cursorX, y: 0 });
    });
  }

  // 3. تعامد قطعتين/شعاعين بدون مضلع (مثل AB ⊥ BC أو MA ⊥ MB)
  const perpFact = facts.find((f): f is Extract<GeoFact, { k: "perp" }> => f.k === "perp");
  if (perpFact && points.size === 0) {
    const [a0, a1] = perpFact.a;
    const [b0, b1] = perpFact.b;
    const shared = perpFact.foot ?? [a0, a1].find((x) => x === b0 || x === b1) ?? a1;
    const otherA = a0 === shared ? a1 : a0;
    const otherB = b0 === shared ? b1 : b0;
    const lenA = lengths.get(pairKey(shared, otherA))?.numeric ?? 5;
    const lenB = lengths.get(pairKey(shared, otherB))?.numeric ?? 6;
    points.set(shared, { x: 0, y: 0 });
    points.set(otherB, { x: lenB, y: 0 });
    points.set(otherA, { x: 0, y: lenA });
    pushSeg(shared, otherA, perpFact.lineKindA);
    pushSeg(shared, otherB, perpFact.lineKindB);
    angles.push({
      id: `${figureId}_ang_0`,
      vertexId: `${figureId}_v_${shared}`,
      arm1VertexId: `${figureId}_v_${otherA}`,
      arm2VertexId: `${figureId}_v_${otherB}`,
      degrees: 90,
      isRightAngle: true,
    });
  }

  // 4. كيان خطي مفرد أو أطوال/مدّ صريح
  for (const f of facts) {
    if (f.k === "draw") {
      const [a, b] = f.seg;
      const len = lengths.get(pairKey(a, b))?.numeric ?? 6;
      if (!points.has(a) && !points.has(b)) {
        points.set(a, { x: 0, y: 0 });
        points.set(b, { x: len, y: 0 });
      } else if (points.has(a) && !points.has(b)) {
        points.set(b, vAdd(points.get(a)!, { x: len, y: 0 }));
      } else if (!points.has(a) && points.has(b)) {
        points.set(a, vAdd(points.get(b)!, { x: -len, y: 0 }));
      }
      pushSeg(a, b, f.lineKind);
    } else if (f.k === "length") {
      const [a, b] = f.seg;
      const len = f.numeric ?? 6;
      if (!points.has(a) && !points.has(b) && points.size === 0) {
        points.set(a, { x: 0, y: 0 });
        points.set(b, { x: len, y: 0 });
        pushSeg(a, b);
      }
    } else if (f.k === "midpoint" || f.k === "pointOn") {
      const [a, b] = f.seg;
      const pa = points.get(a);
      const pb = points.get(b);
      if (pa && pb && !points.has(f.p)) {
        points.set(f.p, vLerp(pa, pb, f.k === "midpoint" ? 0.5 : 0.4));
        if (f.k === "midpoint") {
          ticks.set(pairKey(a, f.p), 1);
          ticks.set(pairKey(f.p, b), 1);
        }
      }
    }
  }

  if (points.size < 2 || rawSegs.length === 0) return null;

  const keyId = (k: string) => `${figureId}_v_${k}`;
  const vertices: CanonicalVertexNode[] = [...points.entries()].map(([k, position]) => ({
    id: keyId(k),
    label: toDisplayLabel(k, notation),
    position,
  }));

  const segments: CanonicalSegmentNode[] = rawSegs.map((s, idx) => {
    const pk = pairKey(s.a, s.b);
    const len = lengths.get(pk);
    const lineSem = resolveSegmentLineSemantics(s.a, s.b, linearKindMap, s.explicitKind);
    const tick = ticks.get(pk);
    const parArrow = parallelMarks.get(pk);
    return {
      id: `${figureId}_s_${idx}`,
      fromVertexId: keyId(s.a),
      toVertexId: keyId(s.b),
      ...(len
        ? {
            lengthLabel: {
              value: len.symbolic ? len.text : (len.numeric ?? len.text),
              unit: (len.unit ?? "سم") as "سم",
            },
          }
        : {}),
      ...(tick && tick <= 3 ? { tickMarks: tick as 1 | 2 | 3 } : {}),
      ...(parArrow && parArrow <= 2 ? { parallelArrows: parArrow as 1 | 2 } : {}),
      ...(s.dashed ? { strokeStyle: "dashed" as const } : {}),
      ...lineSem,
    };
  });

  return {
    figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: description.slice(0, 60),
    notationLanguage: notation,
    vertices,
    segments,
    angles,
  };
}
