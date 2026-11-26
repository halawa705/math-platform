/**
 * @file geo-parametric-domains-dispatcher.ts
 * @description الموزّع البارامتري الموحد للمجالات التخصصية داخل المركّب الهندسي (`source: "compositor"`):
 * الإحصاء والرسوم البيانية، النماذج البصرية، المستوى الإحداثي والدوال، خطوط الأعداد، المجسمات الثلاثية،
 * الأشكال المركبة المتعامدة، مساحات المثلث/متوازي الأضلاع بالارتفاع، والدائرة البسيطة بنصف القطر/القطر.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 165 سطراً).
 */

import type { CanonicalGeometryFigureIR, CanonicalSegmentNode, CanonicalVertexNode } from "@/core/ssot/geometry-archetype-ssot";
import { localizeGeometricVertexLabelSSOT, toWesternNumeralsSSOT, type MathNotationLanguage } from "@/core/ssot/numeral-and-unit-ssot";
import { matchAndRenderStatisticsFigure } from "@/core/statistics-engine/statistics-orchestrator";
import { detectAndBuildMathElementaryVisualFigure } from "../elementary-visuals/math-elementary-visuals-dispatcher";
import { tryBuildParametricCoordinateAnalysisFigure } from "../analytic-function-family/coordinate-plane-projections-and-midpoint-builder";
import { tryBuildCoordinateFunctionOrLineFigure } from "../analytic-function-family/coordinate-functions-and-lines-plotter";
import { buildCoordinatePlanePolygonFigure } from "../analytic-function-family/coordinate-plane-polygon-plotter";
import { buildNumberLineIntervalFigure } from "../analytic-function-family/number-line-intervals-branch";
import { matchRectilinearCompositeFigure } from "../quadrilateral-family/rectilinear-composite-shapes-matcher";
import { matchRectangleSquareUnknownDimensionFigure } from "../quadrilateral-family/rectangle-square-unknown-dimension-builder";
import { matchParametricPerimeterAreaFigure } from "../quadrilateral-family/rectangle-square-perimeter-area-builder";
import { matchPrimaryAltitudeAreaAndStandaloneFigure } from "../triangle-family/triangle-parallelogram-altitude-area-builder";
import { buildCubeCuboid3DFigure } from "../spatial-3d-family/cube-cuboid-prism-branch";
import { buildRightCircularCone3DFigure } from "../spatial-3d-family/cylinder-cone-sphere-branch";
import { buildRegularPyramid3DFigure } from "../spatial-3d-family/pyramid-spatial-planes-branch";
import { buildParametricSimilarityFigure } from "../similarity-family/similarity-parametric-builder-orchestrator";
import { isSimilarityGeometryContext } from "../similarity-family/similarity-context-detector";
import { matchTrigonometryParametricFigure } from "../trigonometry-family/trigonometry-parametric-orchestrator";
import { matchParallelTransversalParametricFigure } from "../parallel-transversal-family/parallel-transversal-parametric-orchestrator";
import { tryComposeParallelTransversalsFigure } from "./geo-parallel-transversals-placer";

export const MODULE_ID_GEO_PARAMETRIC_DOMAINS_DISPATCHER =
  "geo_parametric_domains_dispatcher" as const;

function tryBuildSimpleArabicCircleFigure(
  description: string,
  figureId: string,
  notation: MathNotationLanguage
): CanonicalGeometryFigureIR | undefined {
  const d = toWesternNumeralsSSOT(description.trim());
  if (!/دائرة/.test(d) || /[A-Z]{2,4}|وتر|مماس|محيطية|مركزية|رباعي|قوس|تتقاطع|دائرتان/.test(d)) return undefined;
  if (!/(?:نصف\s*(?:ال)?قطر|قطر(?:ها|ه)?|نق|محيط\s*الدائرة|مساحة\s*الدائرة|ط\s*نق)/.test(d)) return undefined;

  const segName = "(?:[أ-ي]ـ?\\s*[أ-ي]ـ?\\s*)?";
  const radM = d.match(new RegExp(`(?:نصف\\s*(?:ال)?قطر(?:ها|ه)?|نق)\\s*${segName}=?\\s*(\\d+(?:\\.\\d+)?)\\s*(سم|م|ديسم|مم)?`, "i"));
  const diaM = !radM ? d.match(new RegExp(`(?:طول\\s*)?(?:ال)?قطر(?:ها|ه)?\\s*${segName}=?\\s*(\\d+(?:\\.\\d+)?)\\s*(سم|م|ديسم|مم)?`, "i")) : null;
  const radiusVal = radM ? Number(radM[1]) : undefined;
  const diameterVal = diaM ? Number(diaM[1]) : undefined;
  const unit = radM?.[2] || diaM?.[2] || "سم";

  const vCenter: CanonicalVertexNode = { id: `${figureId}_center`, label: localizeGeometricVertexLabelSSOT("م", notation), position: { x: 5, y: 5 } };
  const vRimRight: CanonicalVertexNode = { id: `${figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 8.5, y: 5 } };
  const vRimLeft: CanonicalVertexNode = { id: `${figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1.5, y: 5 } };
  const isDia = diameterVal !== undefined && radiusVal === undefined;
  const segments: CanonicalSegmentNode[] = isDia
    ? [{ id: `${figureId}_sDiameter`, fromVertexId: vRimLeft.id, toVertexId: vRimRight.id, lengthLabel: { value: diameterVal!, unit, labelKind: "given" } }]
    : [{ id: `${figureId}_sRadius`, fromVertexId: vCenter.id, toVertexId: vRimRight.id, lengthLabel: radiusVal !== undefined ? { value: radiusVal, unit, labelKind: "given" } : undefined }];

  return {
    figureId,
    familyId: "circle_family",
    branchId: "circle_base_radius_chord",
    titleArabic: "الدائرة: نصف القطر ومحيط ومساحة الدائرة",
    notationLanguage: notation,
    vertices: isDia ? [vCenter, vRimRight, vRimLeft] : [vCenter, vRimRight],
    segments,
    angles: [],
    circles: [{ id: `${figureId}_circle_main`, centerVertexId: vCenter.id, radius: 3.5, rimVertexId: vRimRight.id }],
  };
}

function tryBuildSolid3DFromDescription(
  description: string,
  figureId: string,
  notation: MathNotationLanguage
): CanonicalGeometryFigureIR | undefined {
  const clean = toWesternNumeralsSSOT(description.trim());
  if (/^\s*(?:المكعب\s+له|الهرم\s+له)/.test(clean)) return undefined;
  if (/هرم/i.test(clean)) {
    const baseM = clean.match(/(?:طول\s*)?(?:ضلع\s*قاعدت[هـا]?|ضلعه)\s*=?\s*(\d+(?:\.\d+)?)/i);
    const heightM = clean.match(/ارتفاع[هـا]?\s*=?\s*(\d+(?:\.\d+)?)/i);
    return buildRegularPyramid3DFigure({ figureId, notationLanguage: notation, baseSideCm: baseM ? Number(baseM[1]) : undefined, heightCm: heightM ? Number(heightM[1]) : undefined });
  }
  if (/مخروط|أسطوانة/i.test(clean)) {
    const radM = clean.match(/(?:نصف\s*قطر[هـا]?|نق)\s*=?\s*(\d+(?:\.\d+)?)/i);
    const heightM = clean.match(/ارتفاع[هـا]?\s*=?\s*(\d+(?:\.\d+)?)/i);
    const slantM = clean.match(/(?:راسم[هـا]?|طول\s*راسم[هـا]?)\s*=?\s*(\d+(?:\.\d+)?)/i);
    return buildRightCircularCone3DFigure({ figureId, notationLanguage: notation, radiusCm: radM ? Number(radM[1]) : undefined, heightCm: heightM ? Number(heightM[1]) : undefined, slantCm: slantM ? Number(slantM[1]) : undefined });
  }
  if (/مكعب(?:ات)?|متوازي\s*مستطيلات/i.test(clean)) {
    const dimsM = clean.match(/(?:أبعاده|مكعبات\s*(?:ال)?وحدة)\s*(\d+(?:\.\d+)?)\s*(?:سم|م|في|×|x|[،,و؛;\s])+\s*(\d+(?:\.\d+)?)\s*(?:سم|م|في|×|x|[،,و؛;\s])+\s*(\d+(?:\.\d+)?)/i);
    const edgeM = clean.match(/(?:طول\s*حرفه|حرفه|ضلعه)\s*=?\s*(\d+(?:\.\d+)?)/i);
    const lenM = clean.match(/طول[هـا]?\s*=?\s*(\d+(?:\.\d+)?)/i);
    const widM = clean.match(/عرض[هـا]?\s*=?\s*(\d+(?:\.\d+)?)/i);
    const hgtM = clean.match(/ارتفاع[هـا]?\s*=?\s*(\d+(?:\.\d+)?)/i);
    const cubeEdge = edgeM ? Number(edgeM[1]) : undefined;
    return buildCubeCuboid3DFigure({
      figureId,
      notationLanguage: notation,
      lengthCm: dimsM ? Number(dimsM[1]) : lenM ? Number(lenM[1]) : cubeEdge,
      widthCm: dimsM ? Number(dimsM[2]) : widM ? Number(widM[1]) : cubeEdge,
      heightCm: dimsM ? Number(dimsM[3]) : hgtM ? Number(hgtM[1]) : cubeEdge,
    });
  }
  return undefined;
}

function hasPrepNamedOrProofContext(description: string): boolean {
  return /[A-Z]{2,4}|\/\/|فيثاغورس|إقليدس|طاليس|متوسط|منصف|رباعي\s*دائري|مماسان|~|≅|\\sim|\\cong|تشابه|تطابق|متشابهان|نمد|امتداد|∩/i.test(description);
}

export function tryDispatchPreDeclarationDomainFigure(opts: {
  readonly description: string;
  readonly figureId: string;
  readonly notation: MathNotationLanguage;
}): CanonicalGeometryFigureIR | undefined {
  const { description, figureId, notation } = opts;

  const isQuadOrMidpointContext = /(?:شبه\s*منحرف|متوازي\s*أضلاع|مستطيل|معين|مربع|شكل\s*رباعي|منتصف|متوسط|تلاقي)/.test(description);
  const isNonSimilarityPoly = /(?:خماسي|سداسي|سباعي|ثماني|تساعي|عشاري)/.test(description) && !/(?:~|∼|تشابه|متشابهان|متشابهين|معامل\s*التشابه)/.test(description);
  if (!isQuadOrMidpointContext && !isNonSimilarityPoly && isSimilarityGeometryContext(description)) {
    const simFig = buildParametricSimilarityFigure(description, figureId, notation);
    if (simFig) return simFig;
  }
  const hasTrigKeywords = /(?<![a-z])\\?(?:sin|cos|tan|cot)(?![a-z])|(?<![أ-ي])(?:جا|جتا|ظا)(?![أ-ي])|θ|\\theta|زاوية\s*(?:ميل|ارتفاع|انخفاض)|النسب\s*المثلثية|نسبة\s*مثلثية|مربعات\s*متطابقة/i.test(description);
  const trigFig = (hasTrigKeywords || (!isQuadOrMidpointContext && /(?:طائرة\s*ورقية|سلم\s+طوله)/.test(description) && !/مثلث\s*[A-Z]{3}/i.test(description))) ? matchTrigonometryParametricFigure(description, figureId, notation) : undefined;
  if (trigFig) return trigFig;
  if (!/°|درجة|زاوي/.test(description)) {
    const earlyPar = tryComposeParallelTransversalsFigure(description, figureId, notation);
    if (earlyPar) return earlyPar;
  }
  const hasNamedIntersections = /في\s*(?:النقطتين\s*)?(?:[A-Z]|[أ-ي]ـ?)\s*و\s*(?:[A-Z]|[أ-ي]ـ?)\b/.test(description);
  const parFig = !hasNamedIntersections && !/مثلث|شبه\s*منحرف|متوازي\s*أضلاع|مستطيل|معين|مربع|شكل\s*رباعي|نمد|امتداد|∩/i.test(description)
    ? matchParallelTransversalParametricFigure(description, figureId, notation) : undefined;
  if (parFig) return parFig;

  const statsFig = matchAndRenderStatisticsFigure(description, figureId, "western", notation);
  if (statsFig) return statsFig;

  const coordAnalysis = tryBuildParametricCoordinateAnalysisFigure({ figureId, description, notationLanguage: notation });
  if (coordAnalysis) return coordAnalysis;

  const elementaryVisual = detectAndBuildMathElementaryVisualFigure(description, figureId, notation);
  if (elementaryVisual) return elementaryVisual;

  const funcOrLine = tryBuildCoordinateFunctionOrLineFigure({ figureId, description, notationLanguage: notation });
  if (funcOrLine) return funcOrLine;

  if (/(?:مستوى\s*(?:ال)?إحداثي|شبكة\s*(?:ال)?إحداثيات|شبكة\s*تربيعية|محوري\s*الإحداثيات|عيّن|مثل\s*بياني)/i.test(description)) {
    const coordPoly = buildCoordinatePlanePolygonFigure({ figureId, description, notationLanguage: notation });
    if (coordPoly) return coordPoly;
  }

  if (/خط\s*الأعداد|فترة\s*حقيقية|فترة\s*[مغ]/.test(description) && !/تكرار/.test(description)) {
    return buildNumberLineIntervalFigure({ figureId, description, notationLanguage: notation });
  }

  const solid3d = tryBuildSolid3DFromDescription(description, figureId, notation);
  if (solid3d) return solid3d;

  const rectilinear = matchRectilinearCompositeFigure(description, { figureId, notationLanguage: notation });
  if (rectilinear) return rectilinear;

  const unknownDim = matchRectangleSquareUnknownDimensionFigure(description, { figureId, notationLanguage: notation });
  if (unknownDim) return unknownDim;

  if (!hasPrepNamedOrProofContext(description)) {
    const perimArea = matchParametricPerimeterAreaFigure(description, { figureId, notationLanguage: notation });
    if (perimArea) return perimArea;

    const altArea = matchPrimaryAltitudeAreaAndStandaloneFigure(description, figureId, notation);
    if (altArea) return altArea;
  }

  return undefined;
}

export function tryDispatchPrimaryParametricFigure(opts: {
  readonly description: string;
  readonly figureId: string;
  readonly notation: MathNotationLanguage;
}): CanonicalGeometryFigureIR | undefined {
  const { description, figureId, notation } = opts;
  const rectilinear = matchRectilinearCompositeFigure(description, { figureId, notationLanguage: notation });
  if (rectilinear) return rectilinear;
  const unknownDim = matchRectangleSquareUnknownDimensionFigure(description, { figureId, notationLanguage: notation });
  if (unknownDim) return unknownDim;
  if (hasPrepNamedOrProofContext(description)) return undefined;
  return (
    matchParametricPerimeterAreaFigure(description, { figureId, notationLanguage: notation }) ??
    matchPrimaryAltitudeAreaAndStandaloneFigure(description, figureId, notation) ??
    tryBuildSimpleArabicCircleFigure(description, figureId, notation)
  );
}

export function tryDispatchFallbackDomainFigure(opts: {
  readonly description: string;
  readonly figureId: string;
  readonly notation: MathNotationLanguage;
}): CanonicalGeometryFigureIR | undefined {
  const { description, figureId, notation } = opts;
  const prepOrNamed = hasPrepNamedOrProofContext(description);
  return (
    tryBuildParametricCoordinateAnalysisFigure({ figureId, description, notationLanguage: notation }) ??
    tryBuildCoordinateFunctionOrLineFigure({ figureId, description, notationLanguage: notation }) ??
    buildCoordinatePlanePolygonFigure({ figureId, description, notationLanguage: notation }) ??
    (!prepOrNamed ? matchPrimaryAltitudeAreaAndStandaloneFigure(description, figureId, notation) : undefined) ??
    (!prepOrNamed ? matchParametricPerimeterAreaFigure(description, { figureId, notationLanguage: notation }) : undefined) ??
    (!prepOrNamed ? tryBuildSimpleArabicCircleFigure(description, figureId, notation) : undefined)
  );
}
