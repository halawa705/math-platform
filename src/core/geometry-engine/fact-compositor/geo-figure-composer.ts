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
import { composeCircleFigureFromFacts } from "./geo-circle-composer-helper";
import { composeAngleFanFigureFromDescription } from "../angle-fan-family/angle-fan-figure-builder";
import { angleBisectorFoot, footOfPerpendicular, lineIntersection, vAdd, vDist, vLerp, vMid, vScale, vSub, type Vec2 } from "./geo-vector-math";

export const MODULE_ID_GEO_FIGURE_COMPOSER = "geo_figure_composer" as const;

export interface ComposeResult { readonly figure: CanonicalGeometryFigureIR | null; readonly warnings: readonly string[] }
interface ExtraSeg { readonly a: string; readonly b: string; readonly dashed?: boolean }
const clamp = (t: number) => Math.min(0.92, Math.max(0.08, t));

export function composeFigureFromGeometryDescription(description: string, figureId: string, notation: "english" | "arabic" = "english"): ComposeResult {
  const embeddedTagMatch = description.match(/\[\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*([^\]]+)\]/i);
  if (embeddedTagMatch && embeddedTagMatch[1].trim() !== description.trim()) {
    const fromTag = composeFigureFromGeometryDescription(embeddedTagMatch[1].trim(), figureId, notation);
    if (fromTag.figure && fromTag.warnings.length === 0) return fromTag;
  }
  const warnings: string[] = [];
  const facts: GeoFact[] = [];
  for (const line of splitDescriptionIntoFactStrings(description)) {
    const f = parseGeoFactString(line);
    if (f) facts.push(f); else warnings.push(`لم يُفهم السطر: «${line}»`);
  }
  const lengths = new Map<string, { text: string; numeric?: number }>();
  for (const f of facts) if (f.k === "length") lengths.set(pairKey(f.seg[0], f.seg[1]), { text: f.text, numeric: f.numeric });

  const circleFig = composeCircleFigureFromFacts(facts, lengths, description, figureId, notation);
  if (circleFig) return { figure: circleFig, warnings };

  const points = new Map<string, Vec2>();
  const polygons = placeDeclaredShapes(facts, lengths, points);
  if (polygons.length === 0) {
    const angleFanFig = composeAngleFanFigureFromDescription(description, figureId, notation);
    if (angleFanFig) return { figure: angleFanFig, warnings: [] };
    return { figure: null, warnings: [...warnings, "لا يوجد مثلث أو رباعي أو دائرة معلنة في الوصف."] };
  }

  const host = new Map<string, Seg>();
  const extras: ExtraSeg[] = [];
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

  for (const p of polygons) if (p.rightAt && p.labels.length === 3) addAngle(p.rightAt, ...(p.labels.filter((l) => l !== p.rightAt) as [string, string]), { isRightAngle: true, degrees: 90 });

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

  for (const f of facts) {
    if (f.k === "pointOn" || f.k === "midpoint") {
      const [a, b] = f.seg; if (!P(a) || !P(b)) { warnings.push(`نقطتا ${a}${b} غير معرّفتين`); continue; }
      points.set(f.p, vLerp(P(a)!, P(b)!, f.k === "midpoint" ? 0.5 : ratioOnSeg(f.p, a, b))); host.set(f.p, f.seg);
      if (f.k === "midpoint") { ticks.set(pairKey(a, f.p), ++tickGroup); ticks.set(pairKey(f.p, b), tickGroup); }
    } else if (f.k === "parallel") {
      const [x, y] = f.a; const [p, q] = f.b; if (!P(x) || !P(y) || !P(p) || !P(q)) { warnings.push("توازي بنقاط غير معرّفة"); continue; }
      const d = vSub(P(q)!, P(p)!); const hy = host.get(y); const hx = host.get(x);
      if (hy) { const r = lineIntersection(P(x)!, vAdd(P(x)!, d), P(hy[0])!, P(hy[1])!); if (r) points.set(y, r); }
      else if (hx) { const r = lineIntersection(P(y)!, vAdd(P(y)!, d), P(hx[0])!, P(hx[1])!); if (r) points.set(x, r); }
      parallelGroup = Math.min(2, parallelGroup + 1);
      parallelMarks.set(pairKey(x, y), parallelGroup); parallelMarks.set(pairKey(p, q), parallelGroup); addExtra(x, y);
    } else if (f.k === "perp") {
      let [apex, foot] = f.a; if (f.foot) foot = f.foot; if (!P(apex) && P(foot)) [apex, foot] = [foot, apex];
      const [b0, b1] = f.b; if (!P(apex) || !P(b0) || !P(b1)) { warnings.push("تعامد بنقاط غير معرّفة"); continue; }
      points.set(foot, footOfPerpendicular(P(apex)!, P(b0)!, P(b1)!)); host.set(foot, f.b); addExtra(apex, foot);
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
      const r = lineIntersection(P(f.a[0])!, P(f.a[1])!, P(f.b[0])!, P(f.b[1])!); if (!r) { warnings.push("مستقيمان متوازيان لا يتقاطعان"); continue; }
      points.set(f.p, r); for (const s of [f.a, f.b]) if (!isPolygonSide(s[0], s[1])) addExtra(s[0], s[1]);
    } else if (f.k === "diagonalsMeet") {
      const q = polygons.find((x) => x.labels.length === 4); if (!q) continue; const [a, b, c, d] = q.labels;
      const r = lineIntersection(P(a)!, P(c)!, P(b)!, P(d)!); if (r) { points.set(f.p, r); addExtra(a, c); addExtra(b, d); }
    } else if (f.k === "extend") {
      const A = P(f.from); const B = P(f.through); if (!A || !B) continue; const len = lengths.get(pairKey(f.through, f.to))?.numeric ?? vDist(A, B) * 0.4;
      points.set(f.to, vAdd(B, vScale(vSub(B, A), len / (vDist(A, B) || 1)))); addExtra(f.through, f.to, true);
    } else if (f.k === "draw") addExtra(f.seg[0], f.seg[1]);
    else if (f.k === "equal") { ticks.set(pairKey(f.a[0], f.a[1]), ++tickGroup); ticks.set(pairKey(f.b[0], f.b[1]), tickGroup); }
    else if (f.k === "angle") {
      const poly = polyOf(f.vertex); const labels = poly?.labels ?? []; const i = labels.indexOf(f.vertex);
      const arms = f.arms ? [f.arms[0], f.arms[2]] : i >= 0 ? [labels[(i + labels.length - 1) % labels.length], labels[(i + 1) % labels.length]] : null;
      if (arms) addAngle(f.vertex, arms[0], arms[1], { degrees: f.deg, degreesLabel: f.text ?? (f.deg !== undefined && !f.right ? `${f.deg}°` : undefined), isRightAngle: f.right });
    }
  }

  const keyId = (k: string) => `${figureId}_v_${k}`;
  const segments: CanonicalSegmentNode[] = [];
  const pushSeg = (a: string, b: string, baseKey: string, dashed?: boolean) => {
    const len = lengths.get(pairKey(a, b));
    segments.push({ id: `${figureId}_s_${segments.length}`, fromVertexId: keyId(a), toVertexId: keyId(b),
      ...(len ? { lengthLabel: { value: len.numeric ?? len.text, unit: "سم" } } : {}),
      ...(ticks.get(pairKey(a, b)) ? { tickMarks: Math.min(3, ticks.get(pairKey(a, b))!) as 1 | 2 | 3 } : {}),
      ...(parallelMarks.get(baseKey) ? { parallelArrows: parallelMarks.get(baseKey) as 1 | 2 } : {}), ...(dashed ? { strokeStyle: "dashed" as const } : {}) });
  };
  for (const poly of polygons) poly.labels.forEach((a, i) => {
    const b = poly.labels[(i + 1) % poly.labels.length]; const base = pairKey(a, b);
    const mids = [...host.entries()].filter(([, s]) => pairKey(s[0], s[1]) === base).map(([k]) => k).sort((m, n) => vDist(P(a)!, P(m)!) - vDist(P(a)!, P(n)!));
    const chain = [a, ...mids, b]; for (let j = 0; j + 1 < chain.length; j++) pushSeg(chain[j], chain[j + 1], base);
  });
  for (const e of extras) if (P(e.a) && P(e.b)) pushSeg(e.a, e.b, pairKey(e.a, e.b), e.dashed);

  const vertices: CanonicalVertexNode[] = [...points.entries()].map(([k, position]) => ({ id: keyId(k), label: toDisplayLabel(k, notation), position }));
  const hasQuad = polygons.some((p) => p.labels.length === 4);
  return { warnings, figure: { figureId, familyId: hasQuad ? "quadrilateral_family" : "triangle_family", branchId: hasQuad ? "quad_parallelogram_diagonals" : "triangle_base_general",
    titleArabic: description.slice(0, 60), notationLanguage: notation, vertices, segments, angles,
    polygons: polygons.map((p) => p.labels.map(keyId)) } };
}
