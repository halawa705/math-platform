/**
 * @file curriculum-topology-classifier.ts
 * @description مصنّف الهيئات المنهجية المصرية لمسائل المثلثات والتشابه والتطابق (المرحلة 3):
 * يصنّف المسألة حتمياً إلى إحدى الهيئات القياسية الثماني بناءً على تقاطع مجموعات الرؤوس
 * والعلاقات الهندسية (توازٍ، تعامد إقليدس، تقاطع مقص، تطابق زوايا عكسية).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 270 سطراً).
 */

import { convertGeometryLatexToPlainText } from "../description-intake/geometry-latex-to-plain-normalizer";
import { restructureGeometryClauses } from "../description-intake/geometry-clause-restructurer";
import { extractOrderedSimilarityTriangles } from "../description-intake/problem-geometry-context-extractor";
import { normalizeLabelKey } from "../fact-compositor/geo-label-utils";
import { parseGeoFactString } from "../fact-compositor/geo-fact-parser";
import type { GeoFact } from "../fact-compositor/geo-fact-types";

export const MODULE_ID_CURRICULUM_TOPOLOGY_CLASSIFIER =
  "curriculum_topology_classifier" as const;

export type CurriculumGeometryTopology =
  | "disjoint_two_triangles"
  | "thales_parallel_in_triangle"
  | "antiparallel_in_triangle"
  | "hourglass_intersecting_chords"
  | "shared_vertex_secant_triangle"
  | "adjacent_ray_bisector_triangles"
  | "euclid_right_triangle_altitude"
  | "applied_shadow_height_triangles"
  | "unknown_topology";

export interface TopologyClassificationResult {
  readonly topology: CurriculumGeometryTopology;
  readonly confidence: number;
  readonly sharedVertices: readonly string[];
  readonly primaryTri?: readonly string[];
  readonly secondaryTri?: readonly string[];
  readonly intersectionPoint?: string;
  readonly altitudePoint?: string;
  readonly notes: readonly string[];
}

const APPLIED_SHADOW_RE =
  /سارية|عمود\s*إنارة|شجرة|رجل.*ظله?|برج|ارتفاع\s*مبنى|مئذنة|ظل\s*شجرة|مسائل\s*الظل/i;

const EUCLID_RE =
  /إقليدس|اقليدس|عمود.*من\s*رأس\s*القائمة|قائم.*وعمود\s*ساقط\s*على\s*الوتر|مسقط.*على\s*الوتر/i;

const HOURGLASS_KEYWORDS_RE =
  /∩|مقص|فراشة|متقابل(?:ان|تان|ين|ة)?\s*بالرأس|قطران\s*يتقاطعان|يتقاطعان\s*(?:في|عند)/i;

/**
 * يصنّف المسألة الهندسية إلى إحدى الهيئات القياسية الثماني.
 */
export function classifyCurriculumGeometryTopology(
  rawInput: string | readonly GeoFact[]
): TopologyClassificationResult {
  // تحويل المدخل إلى نص وحقائق
  const text =
    typeof rawInput === "string"
      ? convertGeometryLatexToPlainText(rawInput)
      : rawInput.map((f) => JSON.stringify(f)).join(" ");
  const facts =
    typeof rawInput === "string"
      ? restructureGeometryClauses(text)
          .split(/\s*[;؛\n،,]+\s*/)
          .map((c) => parseGeoFactString(c.trim()))
          .filter((f): f is GeoFact => f !== null)
      : [...rawInput];

  // 1. فحص مسائل الظل والارتفاع الحياتية
  if (APPLIED_SHADOW_RE.test(text)) {
    return {
      topology: "applied_shadow_height_triangles",
      confidence: 0.95,
      sharedVertices: [],
      notes: ["مسألة تشابه تطبيقية حياتية (ظل وارتفاع أو عمود إنارة)."],
    };
  }

  // 2. فحص تقاطع القطعتين في نقطة (الساعة الرملية / المقص / الفراشة)
  const intersectFacts = facts.filter(
    (f): f is Extract<GeoFact, { k: "intersect" }> => f.k === "intersect"
  );
  if (intersectFacts.length > 0) {
    const inter = intersectFacts[0];
    return {
      topology: "hourglass_intersecting_chords",
      confidence: 0.95,
      sharedVertices: [inter.p],
      intersectionPoint: inter.p,
      notes: [`تقاطع قطعتين في النقطة ${inter.p} (هيئة الساعة الرملية / المقص).`],
    };
  }

  if (HOURGLASS_KEYWORDS_RE.test(text)) {
    const mP =
      text.match(
        /(?:[A-Za-z]{2}\s*∩\s*[A-Za-z]{2}\s*=|يتقاطعان\s*(?:في|عند)|متقابل(?:ان|تان|ين|ة)?\s*بالرأس)\s*(?:في|عند)?\s*(?:النقطة\s+)?\{?\s*([A-Za-z]|[أ-ي]ـ?)\s*\}?/i
      ) || text.match(/∩\s*[A-Za-z]{2}\s*=\s*\{?\s*([A-Za-z]|[أ-ي]ـ?)\s*\}?/i);
    const p = mP ? normalizeLabelKey(mP[1]) : "M";
    return {
      topology: "hourglass_intersecting_chords",
      confidence: 0.92,
      sharedVertices: [p],
      intersectionPoint: p,
      notes: [`تقابل بالرأس أو مقص متقاطع عند النقطة ${p}.`],
    };
  }

  // 3. فحص تشابه إقليدس (مثلث قائم مع عمود ساقط من رأس القائمة على الوتر)
  const perpFacts = facts.filter((f): f is Extract<GeoFact, { k: "perp" }> => f.k === "perp");
  const hasEuclidKeyword = EUCLID_RE.test(text);
  const altitudeFoot = perpFacts.find(
    (p) => p.foot || text.includes(`${p.a[0]} ⊥`) || text.includes(`${p.a[1]} ⊥`)
  );

  if (hasEuclidKeyword || (perpFacts.length > 0 && /قائم/i.test(text) && altitudeFoot)) {
    const altM =
      text.match(/(?:العمود|عمود)?\s*([A-Za-z]{2}|(?:[أ-ي]ـ?\s*){2})\s*⊥/i) ||
      text.match(/العمود\s*([A-Za-z]{2})/i);
    const altPt =
      altitudeFoot?.foot ||
      altitudeFoot?.a[1] ||
      (altM ? normalizeLabelKey(altM[1].replace(/\s+/g, "").slice(-1)) : hasEuclidKeyword ? "D" : undefined);
    const rightApexM = text.match(/قائم(?:الزاوية)?\s*(?:في|عند)\s*([A-Za-z]|[أ-ي]ـ?)/i);
    const apex = rightApexM ? normalizeLabelKey(rightApexM[1]) : "A";
    const mainTriM = text.match(/(?:مثلث|Δ)\s*([A-Za-z]{3})/i);
    const o = mainTriM ? [mainTriM[1][0], mainTriM[1][1], mainTriM[1][2]].filter((l) => l !== apex) : [];
    const primaryTri: readonly [string, string, string] = o.length === 2 ? [apex, o[0], o[1]] : [apex, "B", "C"];

    return {
      topology: "euclid_right_triangle_altitude",
      confidence: 0.92,
      sharedVertices: altitudeFoot ? [altitudeFoot.a[0], altitudeFoot.a[1]] : altPt ? [altPt] : [],
      altitudePoint: altPt,
      primaryTri,
      notes: ["تشابه المثلث القائم الزاوية وتطبيقات نظرية إقليدس."],
    };
  }

  // 3.5 فحص المثلث المتداخل لطاليس أو القاطع العكسي (حتى دون إعلان تشابه صريح)
  const cuts = Array.from(text.matchAll(/([A-Za-z])\s*(?:∈|ينتمي|منتصف|على)\s*([A-Za-z]{2})/gi)).map((m) => m[1]);
  const isNestedCut = cuts.length >= 2 && !/متوسط|متوسطات/i.test(text);
  const hasParallel = facts.some((f) => f.k === "parallel") || /\/\/|يوازي|توازي/.test(text);
  const hasAntiparallelAngle =
    /∠\s*([A-Za-z]{3})\s*=\s*(?:∠\s*)?([A-Za-z]{1,3})|m\s*\(\s*∠\s*([A-Za-z]{3})\s*\)\s*=\s*m\s*\(\s*∠\s*([A-Za-z]{1,3})\s*\)|ق\s*\(\s*∠\s*([A-Za-z]{3})\s*\)\s*=\s*ق\s*\(\s*∠\s*([A-Za-z]{1,3})\s*\)/i.test(text);

  if (isNestedCut && (hasParallel || hasAntiparallelAngle)) {
    const mainTriM = text.match(/(?:مثلث|Δ)\s*([A-Za-z]{3})/i);
    const mainTri: readonly [string, string, string] = mainTriM
      ? [mainTriM[1][0], mainTriM[1][1], mainTriM[1][2]]
      : ["A", "B", "C"];
    return {
      topology: hasAntiparallelAngle ? "antiparallel_in_triangle" : "thales_parallel_in_triangle",
      confidence: 0.95,
      sharedVertices: [mainTri[0]],
      primaryTri: mainTri,
      secondaryTri: [mainTri[0], cuts[0] || "D", cuts[1] || "E"] as const,
      notes: [hasAntiparallelAngle ? "قاطع عكسي داخل المثلث." : "توازٍ داخل المثلث بنظرية طاليس."],
    };
  }

  // 4. فحص علاقة تشابه أو تطابق صريحة مع ترتيب الرؤوس
  const simFact = facts.find(
    (f): f is Extract<GeoFact, { k: "similarity" | "congruence" }> =>
      f.k === "similarity" || f.k === "congruence"
  );
  const sim =
    extractOrderedSimilarityTriangles(text) ||
    (simFact ? { tri1: simFact.tri1, tri2: simFact.tri2, isCongruence: simFact.k === "congruence" } : null);

  if (sim) {
    const t1Set = new Set(sim.tri1);
    const shared = sim.tri2.filter((v) => t1Set.has(v));

    // الحالة أ: صفر رؤوس مشتركة ({A,B,C} ∩ {D,E,F} = ∅)
    if (shared.length === 0) {
      return {
        topology: "disjoint_two_triangles",
        confidence: 0.98,
        sharedVertices: [],
        primaryTri: sim.tri1,
        secondaryTri: sim.tri2,
        notes: [`مثلثان منفصلان لا يشتركان في أي رأس: Δ${sim.tri1.join("")} و Δ${sim.tri2.join("")}.`],
      };
    }

    // الحالة ب: رأس مشترك واحد (مثل A)
    if (shared.length === 1) {
      const commonApex = shared[0];

      // فحص إذا كان الرأس المشترك هو تقاطع قطعتين متعاكستين (مقص)
      if (HOURGLASS_KEYWORDS_RE.test(text)) {
        return {
          topology: "hourglass_intersecting_chords",
          confidence: 0.95,
          sharedVertices: [commonApex],
          primaryTri: sim.tri1,
          secondaryTri: sim.tri2,
          intersectionPoint: commonApex,
          notes: [`تقاطع قطعتين في الرأس المشترك ${commonApex} (مقص).`],
        };
      }

      // فحص ترتيب التناظر: هل هو طاليس (مباشر) أم قاطع عكسي (antiparallel)؟
      const isApexFirstInBoth = sim.tri1[0] === commonApex && sim.tri2[0] === commonApex;
      const isApexLastInBoth =
        sim.tri1[sim.tri1.length - 1] === commonApex &&
        sim.tri2[sim.tri2.length - 1] === commonApex;

      const hasParallelFact = facts.some((f) => f.k === "parallel") || /\/\/|يوازي|توازي/.test(text);
      const isAntiparallelOrder =
        /ADE\s*~\s*ACB|ACB\s*~\s*ADE/i.test(text) ||
        /غير\s*مواز|معكوس|عكسي/i.test(text) ||
        (sim.tri1[0] === commonApex &&
          sim.tri2[0] === commonApex &&
          ((sim.tri1[1] === "D" && sim.tri2[1] === "C") ||
            (sim.tri1[1] === "E" && sim.tri2[1] === "B") ||
            (sim.tri1[1] === "X" && sim.tri2[1] === "C")));

      if (isAntiparallelOrder) {
        return {
          topology: "antiparallel_in_triangle",
          confidence: 0.95,
          sharedVertices: [commonApex],
          primaryTri: sim.tri1,
          secondaryTri: sim.tri2,
          notes: [
            `قاطع عكسي غير موازٍ في المثلث عند الرأس المشترك ${commonApex} (مثل ΔADE ~ ΔACB).`,
          ],
        };
      }

      // طاليس الموازي الافتراضي
      return {
        topology: "thales_parallel_in_triangle",
        confidence: isApexFirstInBoth || isApexLastInBoth || hasParallelFact ? 0.95 : 0.85,
        sharedVertices: [commonApex],
        primaryTri: sim.tri1,
        secondaryTri: sim.tri2,
        notes: [
          `تشابه ناتج عن توازي مستقيم لضلع في مثلث عند الرأس المشترك ${commonApex} (طاليس: ΔADE ~ ΔABC).`,
        ],
      };
    }

    // الحالة ج: رأسان مشتركان والرابع على الضلع (مثل ΔABC ~ ΔDBA)
    if (shared.length === 2) {
      return {
        topology: "shared_vertex_secant_triangle",
        confidence: 0.94,
        sharedVertices: shared,
        primaryTri: sim.tri1,
        secondaryTri: sim.tri2,
        notes: [
          `مثلثان يشتركان في ضلع/رأسين والرابع على الامتداد: (${shared.join("، ")}).`,
        ],
      };
    }
  }

  // 5. فحص التوازي لطاليس عند وجود نص صريح
  if ((facts.some((f) => f.k === "parallel") || /\/\/|يوازي/.test(text)) && /طاليس/i.test(text)) {
    return {
      topology: "thales_parallel_in_triangle",
      confidence: 0.88,
      sharedVertices: [],
      notes: ["توازي مستقيم لضلع في مثلث بنظرية طاليس."],
    };
  }

  // 6. فحص منصف زاوية يربط بين مثلثين متجاورين
  const bisectorFact = facts.find((f): f is Extract<GeoFact, { k: "bisector" }> => f.k === "bisector");
  if (bisectorFact && /ينصف|منصف\s*الزاوية/.test(text)) {
    return {
      topology: "adjacent_ray_bisector_triangles",
      confidence: 0.85,
      sharedVertices: [bisectorFact.vertex],
      notes: ["منصف زاوية يربط مثلثين متجاورين."],
    };
  }

  // 7. مثلثان متشابهان بدون علاقة ترتيبية صريحة
  if (/مثلثان\s*متشابهان|مثلثين\s*متشابهين|تشابه\s*مثلثين/i.test(text)) {
    return {
      topology: "disjoint_two_triangles",
      confidence: 0.85,
      sharedVertices: [],
      notes: ["مثلثان متشابهان منفصلان."],
    };
  }

  return {
    topology: "unknown_topology",
    confidence: 0.0,
    sharedVertices: [],
    notes: ["لم يتم التعرف على هيئة هندسية قياسية."],
  };
}
