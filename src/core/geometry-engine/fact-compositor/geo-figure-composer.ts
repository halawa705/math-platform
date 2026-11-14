/**
 * @file geo-figure-composer.ts
 * @description المركّب الهندسي: يحوّل وصف الحقائق إلى CanonicalGeometryFigureIR (مثلثات/رباعيات/دوائر + نقاط وخطوط مشتقة).
 */
import type { CanonicalAngleNode, CanonicalGeometryFigureIR, CanonicalSegmentNode, CanonicalVertexNode } from "@/core/ssot/geometry-archetype-ssot";
import type { GeoFact, Seg } from "./geo-fact-types";
import { splitDescriptionIntoFactStrings } from "./geo-fact-splitter";
import { parseGeoFactString } from "./geo-fact-parser";
import { pairKey, toDisplayLabel } from "./geo-label-utils";
import { placeDeclaredShapes, type PlacedPolygon } from "./geo-shape-placers";
import { buildOutwardAreaSquaresForFacts } from "./geo-pythagoras-squares-helper";
import {
  tryPlaceParallelWithMissingEndpoints,
  tryPlacePointOnWithCollinearExtension,
} from "./geo-composite-topology-placer";
import { composeCircleFigureFromFacts } from "./geo-circle-composer-helper";
import { composeAngleFanFigureFromDescription } from "../angle-fan-family/angle-fan-figure-builder";
import { tryComposeParallelTransversalsFigure } from "./geo-parallel-transversals-placer";
import {
  buildPerimeterAndAreaBadges,
  deduplicatePlacedPolygons,
  registerIntersectingRaySegments,
  resolveParallelConstraintFact,
  tryPlaceSegmentRatioVertex,
} from "./geo-composite-constraint-helpers";
import {
  assembleCanonicalFigureSegments,
  resolveAngleFactHelper,
  resolveExtendWithEqualHelper,
  type AssembledExtraSeg,
} from "./geo-figure-segments-assembler";
import { angleBisectorFoot, footOfPerpendicular, lineIntersection, vAdd, vDist, vLerp, vMid, vScale, vSub, type Vec2 } from "./geo-vector-math";
import { buildParametricSimilarityFigure } from "../similarity-family/similarity-parametric-builder-orchestrator";
import { isSimilarityGeometryContext } from "../similarity-family/similarity-context-detector";
import { matchPrepGrade3TrigonometryFigure } from "../curriculum-catalogs/prep-stage/grade-3/prep-grade3-trigonometry-catalog";
import { matchPrepGrade1ParallelismFigure } from "../curriculum-catalogs/prep-stage/grade-1/prep-grade1-parallelism-catalog";
import { isFigureFaithfulToPrompt } from "../verification/geometry-figure-fidelity-gate";
import { extractGeometryProblemSpecDual } from "../description-intake/geometry-problem-spec-extractor";
import { verifyProblemSpecMathematicalConsistency } from "../verification/geometry-problem-spec-consistency-checker";


export const MODULE_ID_GEO_FIGURE_COMPOSER = "geo_figure_composer" as const;

export interface ComposeResult { readonly figure: CanonicalGeometryFigureIR | null; readonly warnings: readonly string[] }
const clamp = (t: number) => Math.min(0.92, Math.max(0.08, t));

export function composeFigureFromGeometryDescription(description: string, figureId: string, notation: "english" | "arabic" = "english"): ComposeResult {
  // 0. فحص اتساق مواصفة المسألة (Problem Spec) قبل الرسم (المتباينة المثلثية، مجموع الزوايا، فيثاغورس)
  const specDual = extractGeometryProblemSpecDual(description);
  const consistency = verifyProblemSpecMathematicalConsistency(specDual.spec);
  if (!consistency.passed) {
    return { figure: null, warnings: [...consistency.violations] };
  }

  // 1. فحص عائلات التشابه والتطابق ومسائل المنهج البارامترية أولاً على كامل النص المدمج
  const isQuadOrMidpointContext = /(?:شبه\s*منحرف|متوازي\s*أضلاع|مستطيل|معين|مربع|شكل\s*رباعي|منتصف)/.test(description);
  const isSimilarityContext = !isQuadOrMidpointContext && isSimilarityGeometryContext(description);

  if (isSimilarityContext) {
    const parametricFig = buildParametricSimilarityFigure(description, figureId, notation);
    if (parametricFig) {
      return { figure: parametricFig, warnings: [] };
    }
  }

  const hasTrigKeywords = /(?<![a-z])\\?(?:sin|cos|tan|cot)(?![a-z])|(?<![أ-ي])(?:جا|جتا|ظا)(?![أ-ي])|θ|\\theta|زاوية\s*(?:ميل|ارتفاع|انخفاض)|النسب\s*المثلثية|نسبة\s*مثلثية|مربعات\s*متطابقة/i.test(description);
  const hasExplicitNamedTri = /مثلث\s*[A-Z]{3}/i.test(description);
  const trigCatalogFig = (hasTrigKeywords || (!isQuadOrMidpointContext && /(?:طائرة\s*ورقية|سلم)/.test(description) && !hasExplicitNamedTri))
    ? matchPrepGrade3TrigonometryFigure(description, figureId, notation)
    : undefined;
  if (trigCatalogFig) {
    return { figure: trigCatalogFig, warnings: [] };
  }

  const parallelCatalogFig = !/مثلث|شبه\s*منحرف|متوازي\s*أضلاع|مستطيل|معين|مربع|شكل\s*رباعي|نمد|امتداد|∩/i.test(description)
    ? matchPrepGrade1ParallelismFigure(description, figureId, notation)
    : undefined;
  if (parallelCatalogFig) {
    return { figure: parallelCatalogFig, warnings: [] };
  }

  const embeddedTagMatch = description.match(/\[\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*([^\]]+)\]/i);
  if (embeddedTagMatch && embeddedTagMatch[1].trim() !== description.trim()) {
    const fromTag = composeFigureFromGeometryDescription(embeddedTagMatch[1].trim(), figureId, notation);
    if (fromTag.figure && fromTag.warnings.length === 0 && isFigureFaithfulToPrompt(fromTag.figure, description)) return fromTag;
  }
  const warnings: string[] = [];
  const facts: GeoFact[] = [];
  for (const line of splitDescriptionIntoFactStrings(description)) {
    const f = parseGeoFactString(line);
    if (f) facts.push(f); else warnings.push(`لم يُفهم السطر: «${line}»`);
  }
  const lengths = new Map<string, { text: string; numeric?: number; symbolic?: boolean; unit?: string }>();
  for (const f of facts) if (f.k === "length") lengths.set(pairKey(f.seg[0], f.seg[1]), { text: f.text, numeric: f.numeric, symbolic: f.symbolic, unit: f.unit });

  const circleFig = composeCircleFigureFromFacts(facts, lengths, description, figureId, notation);
  if (circleFig) return { figure: circleFig, warnings };

  const points = new Map<string, Vec2>();
  const polygons = deduplicatePlacedPolygons(
    placeDeclaredShapes(facts, lengths, points)
  );
  if (polygons.length === 0) {
    const parallelFig = tryComposeParallelTransversalsFigure(description, figureId, notation);
    if (parallelFig) return { figure: parallelFig, warnings: [] };
    if (!/(?:\/\/|\\parallel|\|\|)|توازي|متوازيان|متوازيين|متوازية|يوازي|توازى/i.test(description)) {
      const angleFanFig = composeAngleFanFigureFromDescription(description, figureId, notation);
      if (angleFanFig) return { figure: angleFanFig, warnings: [] };
    }
    return { figure: null, warnings: [...warnings, "لا يوجد مثلث أو رباعي أو دائرة معلنة في الوصف."] };
  }
  const host = new Map<string, Seg>();
  const extras: AssembledExtraSeg[] = [];
  const ticks = new Map<string, number>();
  const parallelMarks = new Map<string, number>();
  const angles: CanonicalAngleNode[] = [];
  let tickGroup = 0; let parallelGroup = 0;
  const P = (k: string) => points.get(k);
  const polyOf = (v: string): PlacedPolygon | undefined => polygons.find((p) => p.labels.includes(v));
  const trianglesSides = (apex: string): Seg | null => { const p = polyOf(apex); if (!p || p.labels.length !== 3) return null; const o = p.labels.filter((l) => l !== apex); return [o[0], o[1]]; };
  const addExtra = (a: string, b: string, dashed?: boolean) => { if (!extras.some((e) => pairKey(e.a, e.b) === pairKey(a, b))) extras.push({ a, b, dashed }); };
  const isPolygonSide = (a: string, b: string) => polygons.some((p) => p.labels.some((l, i) => pairKey(l, p.labels[(i + 1) % p.labels.length]) === pairKey(a, b)));
  const addAngle = (vertex: string, arm1: string, arm2: string, extra: Partial<CanonicalAngleNode> = {}) => angles.push({ id: `${figureId}_ang_${angles.length}`, vertexId: `${figureId}_v_${vertex}`, arm1VertexId: `${figureId}_v_${arm1}`, arm2VertexId: `${figureId}_v_${arm2}`, ...extra });

  for (const p of polygons) {
    if (p.rightAt && p.labels.length === 3) addAngle(p.rightAt, ...(p.labels.filter((l) => l !== p.rightAt) as [string, string]), { isRightAngle: true, degrees: 90 });
    if (p.kind === "general" && p.labels.length === 4) {
      const [a, b, c, d] = p.labels;
      const hasDiag = (u: string, v: string) => extras.some((e) => pairKey(e.a, e.b) === pairKey(u, v)) || facts.some((f) => f.k === "draw" && pairKey(f.seg[0], f.seg[1]) === pairKey(u, v));
      if (!hasDiag(a, c) && !hasDiag(b, d)) addExtra(a, c);
    }
  }

  const ratioOnSeg = (p: string, a: string, b: string): number => {
    const ap = lengths.get(pairKey(a, p))?.numeric; const pb = lengths.get(pairKey(p, b))?.numeric; const ab = lengths.get(pairKey(a, b))?.numeric;
    if (ap && pb) return clamp(ap / (ap + pb));
    if (ap && ab) return clamp(ap / ab);
    if (pb && ab) return clamp(1 - pb / ab);
    const A = P(a); const B = P(b);
    if (ap && A && B) return clamp(ap / vDist(A, B));
    if (pb && A && B) return clamp(1 - pb / vDist(A, B));
    return 0.4;
  };

  const deferredParallels: Extract<GeoFact, { k: "parallel" }>[] = [];
  const runParallel = (pf: Extract<GeoFact, { k: "parallel" }>) => resolveParallelConstraintFact({
    parallelFact: pf, facts, polygons, points, host, addExtra,
    addParallelMark: (s0, s1, grp) => parallelMarks.set(pairKey(s0, s1), grp),
    nextGroup: () => { parallelGroup = Math.min(2, parallelGroup + 1); return parallelGroup; },
    tryComposite: () => tryPlaceParallelWithMissingEndpoints({
      parallelFact: pf, facts, points, host, lengths, addExtra,
      addParallelMark: (s0, s1, grp) => parallelMarks.set(pairKey(s0, s1), grp),
      nextGroup: () => { parallelGroup = Math.min(2, parallelGroup + 1); return parallelGroup; },
    }),
    warnings,
  });

  for (const f of facts) {
    if (f.k === "segmentRatio") {
      tryPlaceSegmentRatioVertex({ fact: f, points, host });
      continue;
    }
    if (f.k === "pointOn" || f.k === "midpoint") {
      const [a, b] = f.seg;
      if (f.k === "midpoint" && P(f.p) && Boolean(P(a)) !== Boolean(P(b))) {
        const missing = P(a) ? b : a;
        const known = P(a) ? a : b;
        const hasDeferredPointOn = facts.some((pf) => (pf.k === "pointOn" && pf.p === missing) || (pf.k === "intersect" && pf.p === missing));
        if (!hasDeferredPointOn) {
          points.set(missing, vAdd(P(f.p)!, vSub(P(f.p)!, P(known)!)));
          ticks.set(pairKey(a, f.p), ++tickGroup);
          ticks.set(pairKey(f.p, b), tickGroup);
          addExtra(a, b);
          continue;
        }
      }
      if (f.k === "pointOn" && facts.some((ef) => ef.k === "extend" && ef.to === f.p)) {
        continue;
      }
      if (f.k === "pointOn" && P(a) && P(b) && !P(f.p)) {
        const extAng = facts.find(
          (af): af is Extract<GeoFact, { k: "angle" }> =>
            af.k === "angle" && (af.vertex === a || af.vertex === b) && Boolean(af.arms?.includes(f.p))
        );
        if (extAng) {
          const through = extAng.vertex;
          const from = through === a ? b : a;
          const A = P(from)!; const B = P(through)!;
          const len = lengths.get(pairKey(through, f.p))?.numeric ?? vDist(A, B) * 0.4;
          points.set(f.p, vAdd(B, vScale(vSub(B, A), len / (vDist(A, B) || 1))));
          addExtra(through, f.p, true);
          continue;
        }
      }
      if (f.k === "pointOn" && tryPlacePointOnWithCollinearExtension({ p: f.p, seg: f.seg, points, lengths, addExtra })) {
        host.set(f.p, f.seg);
        continue;
      }
      const isDeferredHostLine = f.k === "pointOn" && facts.some((pf) => pf.k === "parallel" && (pairKey(pf.a[0], pf.a[1]) === pairKey(a, b) || pairKey(pf.b[0], pf.b[1]) === pairKey(a, b)));
      if (!P(a) || !P(b)) { if (!isDeferredHostLine) warnings.push(`نقطتا ${a}${b} غير معرّفتين`); continue; }
      points.set(f.p, vLerp(P(a)!, P(b)!, f.k === "midpoint" ? 0.5 : ratioOnSeg(f.p, a, b))); host.set(f.p, f.seg);
      if (f.k === "midpoint") { ticks.set(pairKey(a, f.p), ++tickGroup); ticks.set(pairKey(f.p, b), tickGroup); }
    } else if (f.k === "parallel") {
      const awaitsIntersect = [f.a[0], f.a[1], f.b[0], f.b[1]].some(
        (pt) => !P(pt) && facts.some((inf) => inf.k === "intersect" && inf.p === pt)
      );
      if (awaitsIntersect) { deferredParallels.push(f); continue; }
      runParallel(f);
    } else if (f.k === "perp") {
      let [apex, foot] = f.a; if (f.foot) foot = f.foot; if (!P(apex) && P(foot)) [apex, foot] = [foot, apex];
      const [b0, b1] = f.b; if (!P(apex) || !P(b0) || !P(b1)) { warnings.push("تعامد بنقاط غير معرّفة"); continue; }
      const len0 = lengths.get(pairKey(b0, foot))?.numeric;
      const len1 = lengths.get(pairKey(foot, b1))?.numeric;
      const lenAlt = lengths.get(pairKey(apex, foot))?.numeric;
      if (Math.abs(P(b0)!.y - P(b1)!.y) < 1e-6 && (len0 || len1 || lenAlt)) {
        const y0 = P(b0)!.y; const x0 = Math.min(P(b0)!.x, P(b1)!.x);
        const d0 = len0 ?? 3; const d1 = len1 ?? 5; const h = lenAlt ?? 4;
        points.set(b0, { x: x0, y: y0 }); points.set(foot, { x: x0 + d0, y: y0 });
        points.set(b1, { x: x0 + d0 + d1, y: y0 }); points.set(apex, { x: x0 + d0, y: y0 + h });
      } else {
        points.set(foot, footOfPerpendicular(P(apex)!, P(b0)!, P(b1)!));
      }
      host.set(foot, f.b); addExtra(apex, foot);
      addAngle(foot, apex, vDist(P(foot)!, P(b1)!) >= vDist(P(foot)!, P(b0)!) ? b1 : b0, { isRightAngle: true, degrees: 90 });
    } else if (f.k === "bisector") {
      const opp = trianglesSides(f.vertex); const d = f.seg[0] === f.vertex ? f.seg[1] : f.seg[0]; if (!opp || !P(f.vertex)) continue;
      points.set(d, angleBisectorFoot(P(f.vertex)!, P(opp[0])!, P(opp[1])!)); host.set(d, opp); addExtra(f.vertex, d);
      addAngle(f.vertex, opp[0], d, { arcCount: 1 }); addAngle(f.vertex, d, opp[1], { arcCount: 1 });
    } else if (f.k === "median") {
      const apex = f.seg[0]; const d = f.seg[1]; const opp = trianglesSides(apex); if (!opp) continue;
      points.set(d, vMid(P(opp[0])!, P(opp[1])!)); host.set(d, opp); addExtra(apex, d);
      ticks.set(pairKey(opp[0], d), ++tickGroup); ticks.set(pairKey(d, opp[1]), tickGroup);
    } else if (f.k === "intersect") {
      if (!P(f.a[0]) || !P(f.a[1]) || !P(f.b[0]) || !P(f.b[1])) { warnings.push("تقاطع بنقاط غير معرّفة"); continue; }
      if (!P(f.p)) {
        const r = lineIntersection(P(f.a[0])!, P(f.a[1])!, P(f.b[0])!, P(f.b[1])!); if (!r) { warnings.push("مستقيمان متوازيان لا يتقاطعان"); continue; }
        points.set(f.p, r);
      }
      for (const s of [f.a, f.b]) {
        registerIntersectingRaySegments({ s, p: f.p, points, host, isPolygonSide, addExtra });
      }
    } else if (f.k === "diagonalsMeet") {
      const q = polygons.find((x) => x.labels.length === 4); if (!q) continue; const [a, b, c, d] = q.labels;
      const r = lineIntersection(P(a)!, P(c)!, P(b)!, P(d)!); if (r) { points.set(f.p, r); addExtra(a, c); addExtra(b, d); }
    } else if (f.k === "extend") {
      resolveExtendWithEqualHelper({ fact: f, facts, points, host, lengths, addExtra });
    } else if (f.k === "draw") addExtra(f.seg[0], f.seg[1]);
    else if (f.k === "equal") { ticks.set(pairKey(f.a[0], f.a[1]), ++tickGroup); ticks.set(pairKey(f.b[0], f.b[1]), tickGroup); }
    else if (f.k === "angle") {
      resolveAngleFactHelper({ fact: f, polyOf, extras, host, points, addAngle });
    }
  }

  for (const pf of deferredParallels) runParallel(pf);

  for (const f of facts) {
    if (f.k === "length" && P(f.seg[0]) && P(f.seg[1]) && !isPolygonSide(f.seg[0], f.seg[1])) {
      const h0 = host.get(f.seg[0]); const h1 = host.get(f.seg[1]);
      const onSameHostSide =
        (h0 && (h0[0] === f.seg[1] || h0[1] === f.seg[1])) ||
        (h1 && (h1[0] === f.seg[0] || h1[1] === f.seg[0])) ||
        Boolean(h0 && h1 && pairKey(h0[0], h0[1]) === pairKey(h1[0], h1[1]));
      if (!onSameHostSide) addExtra(f.seg[0], f.seg[1]);
    }
  }

  const keyId = (k: string) => `${figureId}_v_${k}`;
  const segments = assembleCanonicalFigureSegments({
    figureId, polygons, points, host, lengths, ticks, parallelMarks, extras,
  });

  const areaSquares = buildOutwardAreaSquaresForFacts({ facts, points, polygons, figureId });
  const vertices: CanonicalVertexNode[] = [...[...points.entries()].map(([k, position]) => ({ id: keyId(k), label: toDisplayLabel(k, notation), position })), ...areaSquares.vertices];
  const allSegments: CanonicalSegmentNode[] = [...segments, ...areaSquares.segments];
  const hasQuad = polygons.some((p) => p.labels.length === 4);
  const mergedBadges = [...areaSquares.interiorBadges, ...buildPerimeterAndAreaBadges({ facts, polygons, points, figureId })];
  return {
    warnings,
    figure: {
      figureId, familyId: hasQuad ? "quadrilateral_family" : "triangle_family", branchId: hasQuad ? "quad_parallelogram_diagonals" : "triangle_base_general",
      titleArabic: description.slice(0, 60), notationLanguage: notation, vertices, segments: allSegments, angles, polygons: polygons.map((p) => p.labels.map(keyId)),
      ...(mergedBadges.length > 0 ? { interiorBadges: mergedBadges } : {}),
      ...(areaSquares.shadedRegions.length > 0 ? { shadedRegions: areaSquares.shadedRegions } : {}),
    },
  };
}
