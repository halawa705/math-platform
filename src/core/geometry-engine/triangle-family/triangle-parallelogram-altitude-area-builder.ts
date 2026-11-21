/**
 * @file triangle-parallelogram-altitude-area-builder.ts
 * @description منشئ بارامتري لأشكال المساحة والارتفاع في المثلث ومتوازي الأضلاع والزوايا القياسية المفردة
 * وعلاقات المستقيمين المتوازيين/المتعامدين والدائرة البسيطة بنصف القطر أو القطر دون الاعتماد على كتالوجات ثابتة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 215 سطراً).
 */

import type { CanonicalGeometryFigureIR, CanonicalSegmentNode, CanonicalVertexNode } from "../../ssot/geometry-archetype-ssot";
import { localizeGeometricVertexLabelSSOT, toWesternNumeralsSSOT, type MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_TRIANGLE_PARALLELOGRAM_ALTITUDE_AREA_BUILDER =
  "triangle_parallelogram_altitude_area_builder" as const;

function buildTriangleAltitudeAreaFigure(opts: {
  figureId: string;
  notation: MathNotationLanguage;
  baseVal?: number;
  heightVal?: number;
  areaVal?: number;
  unit: string;
  namedVerts?: boolean;
}): CanonicalGeometryFigureIR {
  const { figureId, notation, unit } = opts;
  const b = opts.baseVal ?? 8;
  const h = opts.heightVal ?? 6;
  const scale = 7 / Math.max(b, h, 1);
  const drawnB = Math.max(3.5, Math.min(8, Number((b * scale).toFixed(2))));
  const drawnH = Math.max(2.5, Math.min(7, Number((h * scale).toFixed(2))));
  const xLeft = Number((5 - drawnB / 2).toFixed(2));
  const xRight = Number((5 + drawnB / 2).toFixed(2));
  const lbl = (ar: string) => (opts.namedVerts ? localizeGeometricVertexLabelSSOT(ar, notation) : "");

  const vA: CanonicalVertexNode = { id: `${figureId}_pA`, label: lbl("أ"), position: { x: 5, y: Number((1.5 + drawnH).toFixed(2)) } };
  const vB: CanonicalVertexNode = { id: `${figureId}_pB`, label: lbl("ب"), position: { x: xLeft, y: 1.5 } };
  const vC: CanonicalVertexNode = { id: `${figureId}_pC`, label: lbl("جـ"), position: { x: xRight, y: 1.5 } };
  const vD: CanonicalVertexNode = { id: `${figureId}_pD`, label: lbl("د"), position: { x: 5, y: 1.5 } };

  return {
    figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: "مساحة المثلث = نصف القاعدة × الارتفاع",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD],
    segments: [
      { id: `${figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
      { id: `${figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: opts.baseVal !== undefined ? { value: opts.baseVal, unit, labelKind: "given" } : opts.areaVal !== undefined && opts.heightVal !== undefined ? { value: "؟", labelKind: "unknown" } : undefined },
      { id: `${figureId}_sCA`, fromVertexId: vC.id, toVertexId: vA.id },
      { id: `${figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, strokeStyle: "dashed", lengthLabel: opts.heightVal !== undefined ? { value: opts.heightVal, unit, labelKind: "given" } : opts.areaVal !== undefined && opts.baseVal !== undefined ? { value: "؟", labelKind: "unknown" } : undefined },
    ],
    angles: [{ id: `${figureId}_aD`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true }],
    polygons: [[vA.id, vB.id, vC.id]],
    interiorBadges: opts.areaVal !== undefined ? [{ id: `${figureId}_area`, text: `المساحة = ${opts.areaVal} ${unit}²`, position: { x: 5, y: Number((1.5 + drawnH * 0.35).toFixed(2)) }, badgeType: "area", labelKind: "given" }] : undefined,
  };
}

function buildParallelogramAltitudeAreaFigure(opts: {
  figureId: string;
  notation: MathNotationLanguage;
  baseVal?: number;
  heightVal?: number;
  areaVal?: number;
  sideAbVal?: number;
  unit: string;
  namedVerts?: boolean;
}): CanonicalGeometryFigureIR {
  const { figureId, notation, unit } = opts;
  const b = opts.baseVal ?? 8;
  const h = opts.heightVal ?? 5;
  const scale = 6.5 / Math.max(b, h, 1);
  const w = Math.max(3.5, Math.min(7.5, Number((b * scale).toFixed(2))));
  const dH = Math.max(2.5, Math.min(6, Number((h * scale).toFixed(2))));
  const shift = 1.6;
  const lbl = (ar: string) => (opts.namedVerts ? localizeGeometricVertexLabelSSOT(ar, notation) : "");

  const vA: CanonicalVertexNode = { id: `${figureId}_vA`, label: lbl("أ"), position: { x: Number((1.5 + shift).toFixed(2)), y: Number((1.5 + dH).toFixed(2)) } };
  const vB: CanonicalVertexNode = { id: `${figureId}_vB`, label: lbl("ب"), position: { x: 1.5, y: 1.5 } };
  const vC: CanonicalVertexNode = { id: `${figureId}_vC`, label: lbl("جـ"), position: { x: Number((1.5 + w).toFixed(2)), y: 1.5 } };
  const vD: CanonicalVertexNode = { id: `${figureId}_vD`, label: lbl("د"), position: { x: Number((1.5 + w + shift).toFixed(2)), y: Number((1.5 + dH).toFixed(2)) } };
  const vE: CanonicalVertexNode = { id: `${figureId}_vE`, label: opts.namedVerts ? localizeGeometricVertexLabelSSOT("هـ", notation) : "", position: { x: Number((1.5 + shift).toFixed(2)), y: 1.5 } };

  return {
    figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_parallelogram_diagonals",
    titleArabic: "مساحة متوازي الأضلاع = طول القاعدة × الارتفاع المناظر",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE],
    segments: [
      { id: `${figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: opts.sideAbVal !== undefined ? { value: opts.sideAbVal, unit, labelKind: "given" } : undefined },
      { id: `${figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: opts.baseVal !== undefined ? { value: opts.baseVal, unit, labelKind: "given" } : undefined },
      { id: `${figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
      { id: `${figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id },
      { id: `${figureId}_sAE`, fromVertexId: vA.id, toVertexId: vE.id, strokeStyle: "dashed", lengthLabel: opts.heightVal !== undefined ? { value: opts.heightVal, unit, labelKind: "given" } : undefined },
    ],
    angles: [{ id: `${figureId}_aE`, vertexId: vE.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true }],
    polygons: [[vA.id, vB.id, vC.id, vD.id]],
    interiorBadges: opts.areaVal !== undefined ? [{ id: `${figureId}_area`, text: `المساحة = ${opts.areaVal} ${unit}²`, position: { x: Number((1.5 + w * 0.55).toFixed(2)), y: Number((1.5 + dH * 0.5).toFixed(2)) }, badgeType: "area", labelKind: "given" }] : undefined,
  };
}

function buildClassifiedTriangleFigure(opts: {
  figureId: string;
  notation: MathNotationLanguage;
  kind: "equilateral" | "isosceles";
  sideVal?: number;
  unit: string;
  namedVerts: boolean;
}): CanonicalGeometryFigureIR {
  const { figureId, notation, kind, unit, namedVerts } = opts;
  const lbl = (ar: string) => (namedVerts ? localizeGeometricVertexLabelSSOT(ar, notation) : "");
  const hTop = kind === "equilateral" ? 6.2 : 6.8;
  const vA: CanonicalVertexNode = { id: `${figureId}_pA`, label: lbl("أ"), position: { x: 5, y: hTop } };
  const vB: CanonicalVertexNode = { id: `${figureId}_pB`, label: lbl("ب"), position: { x: 2, y: 1.5 } };
  const vC: CanonicalVertexNode = { id: `${figureId}_pC`, label: lbl("جـ"), position: { x: 8, y: 1.5 } };
  const sideLabel = opts.sideVal !== undefined ? { value: opts.sideVal, unit, labelKind: "given" as const } : undefined;
  return {
    figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: kind === "equilateral" ? "مثلث متساوي الأضلاع" : "مثلث متساوي الساقين",
    notationLanguage: notation,
    vertices: [vA, vB, vC],
    segments: [
      { id: `${figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 1 },
      { id: `${figureId}_sCA`, fromVertexId: vC.id, toVertexId: vA.id, tickMarks: 1 },
      { id: `${figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, ...(kind === "equilateral" ? { tickMarks: 1 } : {}), ...(sideLabel ? { lengthLabel: sideLabel } : {}) },
    ],
    angles: [],
    polygons: [[vA.id, vB.id, vC.id]],
  };
}

function buildStandaloneAngleFigure(
  kind: "right" | "acute" | "obtuse" | "straight",
  figureId: string,
  notation: MathNotationLanguage,
  explicitDeg?: number
): CanonicalGeometryFigureIR {
  const drawDeg = explicitDeg ?? (kind === "right" ? 90 : kind === "acute" ? 50 : kind === "obtuse" ? 130 : 180);
  const rad = (drawDeg * Math.PI) / 180;
  const vB: CanonicalVertexNode = { id: `${figureId}_vB`, label: "", hideVertexDot: true, position: { x: 5, y: 2.5 } };
  const vA: CanonicalVertexNode = { id: `${figureId}_vA`, label: "", hideVertexDot: true, position: { x: Number((5 + 4.2 * Math.cos(rad)).toFixed(2)), y: Number((2.5 + 4.2 * Math.sin(rad)).toFixed(2)) } };
  const vC: CanonicalVertexNode = { id: `${figureId}_vC`, label: "", hideVertexDot: true, position: { x: 9.2, y: 2.5 } };

  return {
    figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: `زاوية ${kind === "right" ? "قائمة" : kind === "acute" ? "حادة" : kind === "obtuse" ? "منفرجة" : "مستقيمة"}`,
    notationLanguage: notation,
    vertices: [vB, vA, vC],
    segments: [
      { id: `${figureId}_sBA`, fromVertexId: vB.id, toVertexId: vA.id, arrowAtEnd: true, isRay: true },
      { id: `${figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, arrowAtEnd: true, isRay: true },
    ],
    angles: [{
      id: `${figureId}_aB`,
      vertexId: vB.id,
      arm1VertexId: vA.id,
      arm2VertexId: vC.id,
      degrees: explicitDeg ?? (kind === "right" ? 90 : undefined),
      degreesLabel: explicitDeg ? `${explicitDeg}°` : undefined,
      isRightAngle: kind === "right" || explicitDeg === 90,
      arcCount: kind === "right" || explicitDeg === 90 ? undefined : 1,
    }],
  };
}

export function matchPrimaryAltitudeAreaAndStandaloneFigure(
  description: string,
  figureId: string,
  notationLanguage: MathNotationLanguage = "arabic"
): CanonicalGeometryFigureIR | undefined {
  const d = toWesternNumeralsSSOT(description.trim());
  if (!d || /[A-Z]{2,4}|\/\/|فيثاغورس|إقليدس|طاليس|متوسط|منصف|رباعي\s*دائري|مماسان/.test(d)) return undefined;
  if (/⊥|\\perp/.test(d) && !/(?:قاعد[ةت]|ارتفاع)/.test(d)) return undefined;

  const seg = "(?:[أ-ي]ـ?\\s*[أ-ي]ـ?\\s*)?";
  const num = "=?\\s*(\\d+(?:\\.\\d+)?)\\s*(سم|م|ديسم|مم)?";
  const baseM = d.match(new RegExp(`(?:طول\\s*)?(?:ال)?قاعد(?:ة|ت)(?:ها|ه)?\\s*${seg}${num}`, "i")) || d.match(new RegExp(`(?:^|[؛;\\s])ب\\s*جـ?\\s*${num}`, "i"));
  const heightM = d.match(new RegExp(`(?:ال)?ارتفاع(?:ها|ه)?(?:\\s*(?:المناظر|الأصغر))?\\s*${seg}${num}`, "i"));
  const areaM = d.match(/مساحت(?:ها|ه)?\s*=?\s*(\d+(?:\.\d+)?)/i);
  const sideAbM = d.match(new RegExp(`(?:^|[؛;\\s])أ\\s*ب\\s*${num}`, "i"));
  const unit = baseM?.[2] || heightM?.[2] || "سم";
  const baseVal = baseM ? Number(baseM[1]) : undefined;
  const heightVal = heightM ? Number(heightM[1]) : undefined;
  const areaVal = areaM ? Number(areaM[1]) : undefined;
  const sideAbVal = sideAbM ? Number(sideAbM[1]) : undefined;
  const namedPara = /متوازي\s*(?:ال)?أضلاع\s*[أ-ي]/.test(d);
  const namedTri = /مثلث\s*[أ-ي]/.test(d);

  if (/متوازي\s*(?:ال)?أضلاع/i.test(d) && (baseVal !== undefined || heightVal !== undefined || areaVal !== undefined)) {
    return buildParallelogramAltitudeAreaFigure({ figureId, notation: notationLanguage, baseVal, heightVal, areaVal, sideAbVal, unit, namedVerts: namedPara });
  }
  if (/مثلث/i.test(d) && (heightVal !== undefined || areaVal !== undefined || /القاعدة.*ارتفاع|قاعدته/i.test(d)) && !/قائم\s*(?:الزاوية\s*)?في/.test(d)) {
    return buildTriangleAltitudeAreaFigure({ figureId, notation: notationLanguage, baseVal, heightVal, areaVal, unit, namedVerts: namedTri });
  }
  if (/مثلث\s*متساوي\s*(?:ال)?(أضلاع|ساقين)/i.test(d) && !/قائم|°|درجة|زاوي|تشابه|تطابق|~/.test(d)) {
    const kind = /أضلاع/.test(d) ? "equilateral" : "isosceles";
    const sideM = d.match(new RegExp(`طول\\s*ضلع[هـا]?\\s*${num}`, "i"));
    const namedClass = /متساوي\s*(?:ال)?(?:أضلاع|ساقين)\s*[أ-ي]/i.test(d) || namedTri;
    return buildClassifiedTriangleFigure({
      figureId,
      notation: notationLanguage,
      kind,
      sideVal: sideM ? Number(sideM[1]) : undefined,
      unit: sideM?.[2] || unit,
      namedVerts: namedClass,
    });
  }

  const degMatch = d.match(/(\d+(?:\.\d+)?)\s*(?:°|درجة)/);
  const explicitDeg = degMatch ? Number(degMatch[1]) : undefined;
  if (/زاوية\s*حادة/i.test(d)) return buildStandaloneAngleFigure("acute", figureId, notationLanguage, explicitDeg);
  if (/زاوية\s*منفرجة/i.test(d)) return buildStandaloneAngleFigure("obtuse", figureId, notationLanguage, explicitDeg);
  if (/زاوية\s*قائمة/i.test(d)) return buildStandaloneAngleFigure("right", figureId, notationLanguage, explicitDeg);
  if (/زاوية\s*مستقيمة/i.test(d)) return buildStandaloneAngleFigure("straight", figureId, notationLanguage, explicitDeg);

  return undefined;
}
