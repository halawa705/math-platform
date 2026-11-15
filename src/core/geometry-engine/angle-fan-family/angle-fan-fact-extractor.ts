/**
 * @file angle-fan-fact-extractor.ts
 * @description مستخلص حقائق عائلة مراوح الأشعة والزوايا (Angle-Fan Fact Extractor):
 * يفهم وسوم `[رسم هندسي: ...]` ونصوص المسائل الكاملة من NotebookLM ويحوّلها إلى مواصفة (`AngleFanSpec`).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 300 سطراً).
 */

import { normalizeLabelKey } from "../fact-compositor/geo-label-utils";
import {
  extractCleanKeys,
  splitAngleFanClauses,
  tryParseCollinearAndSumClause,
  tryParseFanAndIntersectClause,
  type AngleFanBuildCtx,
} from "./angle-fan-clause-parsers";
import type {
  AngleFanBetweenFact,
  AngleFanBisectorFact,
  AngleFanMeasureFact,
  AngleFanSpec,
  AngleFanSumFact,
} from "./angle-fan-fact-types";
import { parseLinearAngleExpression } from "./angle-linear-expression-parser";

export { splitAngleFanClauses } from "./angle-fan-clause-parsers";

export const MODULE_ID_ANGLE_FAN_FACT_EXTRACTOR = "angle_fan_fact_extractor" as const;

const POLYGON_OR_OTHER_FAMILY_GUARD =
  /(?:^|[\s،؛;])(مثلث|مستطيل|مربع|معين|متوازي\s*أضلاع|متوازي\s*مستطيلات|شبه\s*منحرف|دائرة|سداسي|خماسي|هرم|مخروط|أسطوانة|مكعب|خط\s*الأعداد|مستوى\s*إحداثي|دالة\s*تربيعية)(?:$|[\s،؛;])|[△▱⊙]/i;

/** يستخلص مواصفة مروحة الأشعة والزوايا من الوصف النصي، أو يعيد `null` إذا كان الشكل مضلعاً أو دائرة. */
export function extractAngleFanSpecFromDescription(rawDescription: string): AngleFanSpec | null {
  if (!rawDescription || POLYGON_OR_OTHER_FAMILY_GUARD.test(rawDescription)) return null;
  const clauses = splitAngleFanClauses(rawDescription);
  if (clauses.length === 0) return null;

  let vertex: string | null = null;
  const rays: string[] = [];
  const oppositePairs: [string, string][] = [];
  const perpPairs: [string, string][] = [];
  const angles: AngleFanMeasureFact[] = [];
  const bisectors: AngleFanBisectorFact[] = [];
  const betweenness: AngleFanBetweenFact[] = [];
  const sumEquations: AngleFanSumFact[] = [];
  let isFullCircleAroundVertex = false;
  let consecutiveFanOrder: string[] | undefined;
  let lastPairBounds: [string, string] | null = null;

  const setVertex = (v: string) => { if (!vertex) vertex = v; };
  const addRay = (r: string) => { if (r && r !== vertex && !rays.includes(r)) rays.push(r); };
  const addOpposite = (a: string, b: string) => {
    addRay(a); addRay(b);
    if (!oppositePairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) oppositePairs.push([a, b]);
  };
  const addPerp = (a: string, b: string) => {
    addRay(a); addRay(b);
    if (!perpPairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) perpPairs.push([a, b]);
  };
  const addAngleFact = (arm1: string, arm2: string, expr: AngleFanMeasureFact["expr"]) => {
    addRay(arm1); addRay(arm2);
    const exists = angles.some(
      (x) => ((x.arm1 === arm1 && x.arm2 === arm2) || (x.arm1 === arm2 && x.arm2 === arm1)) && x.expr.rawLabel === expr.rawLabel
    );
    if (!exists) angles.push({ arm1, arm2, expr });
  };

  const ctx: AngleFanBuildCtx = {
    setVertex,
    getVertex: () => vertex,
    addRay,
    addOpposite,
    addAngleFact,
    markFullCircle: () => { isFullCircleAroundVertex = true; },
    setConsecutiveOrder: (order) => { consecutiveFanOrder = order; },
    setLastPairBounds: (bounds) => { lastPairBounds = bounds; },
    pushBetween: (midRays, bound1, bound2) => { betweenness.push({ midRays, bound1, bound2 }); },
    sumEquations,
  };

  for (const clause of clauses) {
    if (tryParseFanAndIntersectClause(clause, ctx)) continue;
    if (tryParseCollinearAndSumClause(clause, ctx)) continue;

    // 11. التعامد: الشعاع جـ أ ⊥ الشعاع جـ ب أو الشعاع م هـ ⊥ المستقيم أ ب
    const mPerp = clause.match(/^(.+?)\s*(?:⊥|متعامد\s+على|عمودي\s+على)\s*(.+)$/);
    if (mPerp) {
      const k1 = extractCleanKeys(mPerp[1]);
      const k2 = extractCleanKeys(mPerp[2]);
      if (k1 && k1.length === 2 && k2 && k2.length === 2) {
        const shared = k1.find((p) => k2.includes(p));
        if (shared) {
          setVertex(shared);
          const a = k1[0] === shared ? k1[1] : k1[0];
          const b = k2[0] === shared ? k2[1] : k2[0];
          addPerp(a, b);
          lastPairBounds = [a, b];
        } else if (vertex && (k1.includes(vertex) || k2.includes(vertex))) {
          const rayPart = k1.includes(vertex) ? k1 : k2;
          const linePart = k1.includes(vertex) ? k2 : k1;
          const rayEnd = rayPart[0] === vertex ? rayPart[1] : rayPart[0];
          addPerp(rayEnd, linePart[0]);
          addPerp(rayEnd, linePart[1]);
        }
        continue;
      }
    }

    // 12. قياس زاوية: ق(∠أ جـ د) = 50°
    const mAngle = clause.match(/^(?:ق\s*\(\s*∠?\s*([^)]+)\)|∠\s*([^=+]+))\s*=\s*(.+)$/);
    if (mAngle) {
      const pts = extractCleanKeys(mAngle[1] ?? mAngle[2]);
      const expr = parseLinearAngleExpression(mAngle[3]);
      if (pts && pts.length === 3 && expr) {
        setVertex(pts[1]);
        addAngleFact(pts[0], pts[2], expr);
        continue;
      }
    }

    // 13. منصف زاوية صريح أو شعاع يقسم زاوية
    if (!/ينصف\s+المنطقة\s+بينهما/.test(clause)) {
      const mBis = clause.match(/^(.+?)\s+(ينصف|يقسم|داخل|يقع\s+داخل)\s+(?:الزاوية\s+|∠\s*)(.+)$/);
      if (mBis) {
        const rayKeys = extractCleanKeys(mBis[1]);
        const angKeys = extractCleanKeys(mBis[3]);
        if (rayKeys && rayKeys.length === 2 && angKeys && angKeys.length === 3) {
          const v = angKeys[1];
          setVertex(v);
          const bisRay = rayKeys[0] === v ? rayKeys[1] : rayKeys[0];
          addRay(bisRay); addRay(angKeys[0]); addRay(angKeys[2]);
          if (mBis[2] === "ينصف" && !bisectors.some((b) => b.bisectorRay === bisRay)) {
            bisectors.push({ bisectorRay: bisRay, arm1: angKeys[0], arm2: angKeys[2] });
          }
          betweenness.push({ midRays: [bisRay], bound1: angKeys[0], bound2: angKeys[2] });
          continue;
        }
      }
    }

    // 14. شعاع بينهما أو شعاع يخرج من الرأس
    const isBetweenClause = /بينهما/.test(clause);
    const subParts = clause
      .replace(/(?:شعاع\s+)?(?:ينصف\s+المنطقة\s+)?بينهما.*$/, "")
      .replace(/(?:يقطع\s+المستقيم|يخرج\s+من\s+.+)$/, "")
      .split(/\s+و\s*/);
    const extractedMidRays: string[] = [];
    for (const sp of subParts) {
      const ks = extractCleanKeys(sp);
      if (ks && ks.length === 2) {
        if (!vertex) setVertex(ks[0]);
        const endPt = ks[0] === vertex ? ks[1] : ks[1] === vertex ? ks[0] : ks[1];
        addRay(endPt);
        extractedMidRays.push(endPt);
      }
    }
    if (isBetweenClause && extractedMidRays.length > 0 && lastPairBounds) {
      betweenness.push({ midRays: extractedMidRays, bound1: lastPairBounds[0], bound2: lastPairBounds[1] });
    }
  }

  // استخراج أي أشعة ذُكرت في جملة المطلوب إن كانت تخرج من نفس الرأس
  if (vertex) {
    const goalMatches = rawDescription.matchAll(
      /(?:أوجد|اوجد|احسب|قياس|قيمة)\s+.*?(?:ق\s*\(\s*∠?\s*([A-Za-z]{3}|[أ-ي]ـ?(?:\s*[أ-ي]ـ?){2})\s*\)|m\s*\(\s*∠?\s*([A-Za-z]{3})\s*\)|∠\s*([A-Za-z]{3}))/gi
    );
    for (const gm of goalMatches) {
      const ks = extractCleanKeys(gm[1] || gm[2] || gm[3]);
      if (ks && ks.length === 3 && ks[1] === vertex) {
        addRay(ks[0]);
        addRay(ks[2]);
      }
    }
  }

  if (!vertex || rays.length < 2) return null;
  if (angles.length === 0 && perpPairs.length === 0 && oppositePairs.length === 0 && bisectors.length === 0 && sumEquations.length === 0) {
    return null;
  }

  return {
    vertex, rays, oppositePairs, perpPairs, angles, bisectors, betweenness, sumEquations,
    isFullCircleAroundVertex, consecutiveFanOrder,
  };
}
