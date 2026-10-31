/**
 * @file similarity-parametric-builder-orchestrator.ts
 * @description منسق بناء عائلات التشابه والتطابق البارامترية (المرحلة 4):
 * يربط بين مصنّف الهيئات (Curriculum Topology Classifier) والمركّبات البارامترية الذرية،
 * وينشئ شكلاً هندسياً دقيقاً ومطابقاً بنسبة 100% لمعطيات المسألة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 260 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";
import {
  classifyCurriculumGeometryTopology,
  type TopologyClassificationResult,
} from "./curriculum-topology-classifier";
import { buildDisjointSimilarTrianglesFigure } from "./disjoint-triangles-parametric-builder";
import { buildNestedThalesAntiparallelFigure } from "./nested-thales-antiparallel-builder";
import { buildHourglassIntersectionFigure } from "./hourglass-intersection-parametric-builder";
import { buildSharedAngleSecantFigure } from "./shared-angle-and-bisector-builder";
import { buildEuclidAltitudeParametricFigure } from "./euclid-altitude-parametric-builder";
import { buildAppliedShadowHeightFigure } from "./applied-shadow-height-builder";
import {
  convertGeometryLatexToPlainText,
} from "../description-intake/geometry-latex-to-plain-normalizer";
import {
  combineProblemAndTagGeometryContext,
  extractOrderedSimilarityTriangles,
  unpackSequentialSideLengths,
} from "../description-intake/problem-geometry-context-extractor";
import { parseGeoFactString } from "../fact-compositor/geo-fact-parser";
import type { GeoFact } from "../fact-compositor/geo-fact-types";
import { pairKey } from "../fact-compositor/geo-label-utils";

export const MODULE_ID_SIMILARITY_PARAMETRIC_BUILDER_ORCHESTRATOR =
  "similarity_parametric_builder_orchestrator" as const;

/**
 * يستخرج خرائط الأطوال والزوايا المعطاة من النص والحقائق.
 */
function extractGivenMaps(
  cleanText: string,
  facts: readonly GeoFact[]
): {
  readonly lengths: Map<string, { readonly text: string; readonly numeric?: number }>;
  readonly angles: Map<string, { readonly deg?: number; readonly text?: string; readonly isRight?: boolean }>;
} {
  const lengths = new Map<string, { readonly text: string; readonly numeric?: number }>();
  const angles = new Map<string, { readonly deg?: number; readonly text?: string; readonly isRight?: boolean }>();

  for (const f of facts) {
    if (f.k === "length") {
      lengths.set(pairKey(f.seg[0], f.seg[1]), { text: f.text, numeric: f.numeric });
      lengths.set(`${f.seg[0]}${f.seg[1]}`, { text: f.text, numeric: f.numeric });
    } else if (f.k === "angle") {
      angles.set(f.vertex, { deg: f.deg, text: f.text, isRight: f.right });
    }
  }

  // أطوال ترتيبية إضافية
  const seq = unpackSequentialSideLengths(cleanText);
  for (const s of seq) {
    const parsed = parseGeoFactString(s);
    if (parsed && parsed.k === "length") {
      lengths.set(pairKey(parsed.seg[0], parsed.seg[1]), { text: parsed.text, numeric: parsed.numeric });
      lengths.set(`${parsed.seg[0]}${parsed.seg[1]}`, { text: parsed.text, numeric: parsed.numeric });
    }
  }

  return { lengths, angles };
}

/**
 * ينسق بناء الشكل الهندسي لعائلة التشابه والتطابق بناءً على الهيئة المستخلصة.
 */
export function buildParametricSimilarityFigure(
  description: string,
  figureId = "similarity_parametric_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  if (!description || !description.trim()) return undefined;

  const enriched = combineProblemAndTagGeometryContext(undefined, description);
  const clean = convertGeometryLatexToPlainText(enriched || description);
  const topologyRes = classifyCurriculumGeometryTopology(clean);
  if (topologyRes.topology === "unknown_topology") return undefined;

  // استخراج الحقائق
  const clauses = clean.split(/\s*[;؛\n،,]+\s*/).map((c) => c.trim()).filter(Boolean);
  const facts = clauses.map(parseGeoFactString).filter((f): f is GeoFact => f !== null);
  const { lengths, angles } = extractGivenMaps(clean, facts);

  const simInfo = extractOrderedSimilarityTriangles(clean);
  const toTri3 = (arr?: readonly string[], fallback: readonly [string, string, string] = ["A", "B", "C"]): readonly [string, string, string] => [
    arr?.[0] || fallback[0],
    arr?.[1] || fallback[1],
    arr?.[2] || fallback[2],
  ];
  const tri1 = toTri3(topologyRes.primaryTri || simInfo?.tri1, ["A", "B", "C"]);
  const tri2 = toTri3(topologyRes.secondaryTri || simInfo?.tri2, ["D", "E", "F"]);

  switch (topologyRes.topology) {
    case "disjoint_two_triangles":
      return buildDisjointSimilarTrianglesFigure({
        figureId,
        notationLanguage,
        tri1,
        tri2,
        ratio: simInfo?.ratio,
        givenLengths: lengths,
        givenAngles: angles,
      });

    case "thales_parallel_in_triangle": {
      const commonApex = topologyRes.sharedVertices[0] || tri1[0] || "A";
      const base1 = tri1.find((v) => v !== commonApex) || "B";
      const base2 = tri1.find((v) => v !== commonApex && v !== base1) || "C";
      const cut1 = tri2.find((v) => v !== commonApex) || "D";
      const cut2 = tri2.find((v) => v !== commonApex && v !== cut1) || "E";
      return buildNestedThalesAntiparallelFigure({
        figureId,
        notationLanguage,
        isAntiparallel: false,
        apex: commonApex,
        base1,
        base2,
        cut1,
        cut2,
        givenLengths: lengths,
        givenAngles: angles,
      });
    }

    case "antiparallel_in_triangle": {
      const commonApex = topologyRes.sharedVertices[0] || tri1[0] || "A";
      const base1 = tri1.find((v) => v !== commonApex) || "B";
      const base2 = tri1.find((v) => v !== commonApex && v !== base1) || "C";
      const cut1 = tri2.find((v) => v !== commonApex) || "D";
      const cut2 = tri2.find((v) => v !== commonApex && v !== cut1) || "E";
      return buildNestedThalesAntiparallelFigure({
        figureId,
        notationLanguage,
        isAntiparallel: true,
        apex: commonApex,
        base1,
        base2,
        cut1,
        cut2,
        givenLengths: lengths,
        givenAngles: angles,
      });
    }

    case "hourglass_intersecting_chords": {
      const mid = topologyRes.intersectionPoint || topologyRes.sharedVertices[0] || "E";
      let topEnds: [string, string] = ["A", "B"];
      let botEnds: [string, string] = ["C", "D"];

      const chordMatch = clean.match(
        /([A-Z]{2}|(?:[أ-ي]ـ?\s*){2})\s*(?:∩|×)\s*([A-Z]{2}|(?:[أ-ي]ـ?\s*){2})\s*=\s*\{?\s*([A-Z]|[أ-ي]ـ?)\s*\}?/i
      );
      if (chordMatch) {
        const s1 = chordMatch[1].replace(/\s+/g, "");
        const s2 = chordMatch[2].replace(/\s+/g, "");
        if (s1.length >= 2 && s2.length >= 2) {
          topEnds = [s1[0], s2[0]];
          botEnds = [s1[1], s2[1]];
        }
      } else {
        const t1 = tri1.filter((v) => v !== mid);
        const t2 = tri2.filter((v) => v !== mid);
        if (t1.length === 2) topEnds = [t1[0], t1[1]];
        if (t2.length === 2) botEnds = [t2[0], t2[1]];
      }

      return buildHourglassIntersectionFigure({
        figureId,
        notationLanguage,
        intersectionVertex: mid,
        tri1Endpoints: topEnds,
        tri2Endpoints: botEnds,
        hasParallel: facts.some((f) => f.k === "parallel") || /\/\/|يوازي/.test(clean),
        givenLengths: lengths,
        givenAngles: angles,
      });
    }

    case "shared_vertex_secant_triangle": {
      const secantPt = tri2.find((v) => !tri1.includes(v)) || "D";
      return buildSharedAngleSecantFigure({
        figureId,
        notationLanguage,
        mainTri: tri1,
        secantVertex: secantPt,
        givenLengths: lengths,
        givenAngles: angles,
      });
    }

    case "euclid_right_triangle_altitude": {
      const altFoot = topologyRes.altitudePoint || "D";
      const apex = tri1[0] || "A";
      const b = tri1[1] || "B";
      const c = tri1[2] || "C";
      return buildEuclidAltitudeParametricFigure({
        figureId,
        notationLanguage,
        rightApex: apex,
        hyp1: b,
        hyp2: c,
        altitudeFoot: altFoot,
        givenLengths: lengths,
        givenAngles: angles,
      });
    }

    case "applied_shadow_height_triangles": {
      return buildAppliedShadowHeightFigure({
        figureId,
        notationLanguage,
        problemText: clean,
        givenLengths: lengths,
      });
    }

    default:
      // Fallback للمثلثين المنفصلين
      return buildDisjointSimilarTrianglesFigure({
        figureId,
        notationLanguage,
        tri1,
        tri2,
        ratio: simInfo?.ratio,
        givenLengths: lengths,
        givenAngles: angles,
      });
  }
}
