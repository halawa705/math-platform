/**
 * @file angle-fan-fact-extractor.ts
 * @description مستخلص حقائق عائلة مراوح الأشعة والزوايا (Angle-Fan Fact Extractor):
 * يحول الوصف العربي/الرياضي للزوايا المتتامة، المتكاملة، المتقابلة بالرأس، المتجمعة حول نقطة،
 * ومنصفات الزوايا إلى مواصفة مهيكلة (`AngleFanSpec`).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 260 سطراً).
 */

import { convertGeometryLatexToPlainText } from "../description-intake/geometry-latex-to-plain-normalizer";
import { normalizeLabelKey, parseLabelList } from "../fact-compositor/geo-label-utils";
import type {
  AngleFanBetweenFact,
  AngleFanBisectorFact,
  AngleFanMeasureFact,
  AngleFanSpec,
  AngleFanSumFact,
} from "./angle-fan-fact-types";
import { parseLinearAngleExpression } from "./angle-linear-expression-parser";

export const MODULE_ID_ANGLE_FAN_FACT_EXTRACTOR = "angle_fan_fact_extractor" as const;

const POLYGON_OR_OTHER_FAMILY_GUARD =
  /(?:^|[\s،؛;])(مثلث|مستطيل|مربع|معين|متوازي\s*أضلاع|متوازي\s*مستطيلات|شبه\s*منحرف|دائرة|سداسي|خماسي|هرم|مخروط|أسطوانة|مكعب|خط\s*الأعداد|مستوى\s*إحداثي|دالة\s*تربيعية)(?:$|[\s،؛;])|[△▱⊙]/i;

function extractCleanKeys(rawSegmentText: string): string[] | null {
  const stripped = rawSegmentText
    .replace(/\(\s*\d+\s*°?\s*\)/g, " ")
    .replace(
      /(?:الشعاعان|الشعاعين|الشعاع|الأشعة|المستقيمان|المستقيمين|للمستقيم|بالمستقيم|المستقيم|لمستقيم|القطعة|شعاعين|شعاع|مستقيم|النقطة|نقطة|الزاوية|زاوية|ق\s*\(|∠|\))/g,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();
  return parseLabelList(stripped);
}

/**
 * يستخلص مواصفة مروحة الأشعة والزوايا من الوصف النصي، أو يعيد `null` إذا كان الشكل مضلعاً أو دائرة.
 */
export function extractAngleFanSpecFromDescription(rawDescription: string): AngleFanSpec | null {
  if (!rawDescription || POLYGON_OR_OTHER_FAMILY_GUARD.test(rawDescription)) {
    return null;
  }

  const plain = convertGeometryLatexToPlainText(rawDescription).replace(
    /،(?=\s*(?:ق\s*\(|∠|الشعاع|المستقيم|تقاطع|الزوايا|نقطة|مجموع))/g,
    "؛"
  );
  const clauses = plain
    .split(/\s*[;؛\n]+\s*/)
    .map((c) => c.trim())
    .filter(Boolean);

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

  const setVertex = (v: string) => {
    if (!vertex) vertex = v;
  };
  const addRay = (r: string) => {
    if (r && r !== vertex && !rays.includes(r)) rays.push(r);
  };
  const addOpposite = (a: string, b: string) => {
    addRay(a);
    addRay(b);
    if (!oppositePairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) {
      oppositePairs.push([a, b]);
    }
  };
  const addPerp = (a: string, b: string) => {
    addRay(a);
    addRay(b);
    if (!perpPairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) {
      perpPairs.push([a, b]);
    }
  };

  for (const clause of clauses) {
    // 1. نقطة م حولها أربعة أشعة تصنع زوايا 2س°، 3س°، 4س°، 6س°
    const mAnonFan = clause.match(
      /(?:ال)?نقطة\s+([أ-ي]ـ?|[A-Z])\s+حولها\s+(?:أربعة|اربعة|4|٤|عدة)?\s*أشعة\s+تصنع\s+زوايا\s+(.+)/
    );
    if (mAnonFan) {
      setVertex(normalizeLabelKey(mAnonFan[1]));
      isFullCircleAroundVertex = true;
      const exprTokens = mAnonFan[2]
        .split(/\s*(?:،|,|و(?=\s*[0-9٠-٩(]))\s*/)
        .map((s) => s.trim())
        .filter(Boolean);
      const pool = ["A", "B", "C", "D", "E", "F"].filter((k) => k !== vertex);
      const fanRays = pool.slice(0, exprTokens.length);
      fanRays.forEach(addRay);
      consecutiveFanOrder = fanRays;
      exprTokens.forEach((tok, idx) => {
        const expr = parseLinearAngleExpression(tok);
        if (expr) {
          angles.push({
            arm1: fanRays[idx],
            arm2: fanRays[(idx + 1) % fanRays.length],
            expr,
          });
        }
      });
      continue;
    }

    // 2. نقطة م حولها الأشعة م أ، م ب، م جـ، م د
    const mNamedFan = clause.match(/(?:ال)?نقطة\s+([أ-ي]ـ?|[A-Z])\s+حولها\s+الأشعة\s+(.+)/);
    if (mNamedFan) {
      const v = normalizeLabelKey(mNamedFan[1]);
      setVertex(v);
      isFullCircleAroundVertex = true;
      const rayParts = mNamedFan[2].split(/\s*[،,و]+\s*/).filter(Boolean);
      const order: string[] = [];
      for (const rp of rayParts) {
        const ks = extractCleanKeys(rp);
        if (ks && ks.length === 2) {
          const endPt = ks[0] === v ? ks[1] : ks[0];
          addRay(endPt);
          order.push(endPt);
        }
      }
      if (order.length >= 3) consecutiveFanOrder = order;
      continue;
    }

    // 3. الزوايا متجمعة حول النقطة م
    const mAround = clause.match(/الزوايا\s+متجمعة\s+حول\s+(?:النقطة\s+)?([أ-ي]ـ?|[A-Z])/);
    if (mAround) {
      setVertex(normalizeLabelKey(mAround[1]));
      isFullCircleAroundVertex = true;
      continue;
    }

    // 4. تقاطع مستقيمين (مقص) والزاويتان المتقابلتان بالرأس هما ... و ...
    if (/^تقاطع\s+مستقيمين/.test(clause)) {
      setVertex("M");
      addOpposite("A", "B");
      addOpposite("C", "D");
      continue;
    }
    const mVertPair = clause.match(/الزاويتان\s+المتقابلتان\s+بالرأس\s+هما\s+(.+?)\s+و\s*(.+)/);
    if (mVertPair) {
      if (!vertex) {
        setVertex("M");
        addOpposite("A", "B");
        addOpposite("C", "D");
      }
      const e1 = parseLinearAngleExpression(mVertPair[1]);
      const e2 = parseLinearAngleExpression(mVertPair[2]);
      if (e1) angles.push({ arm1: "A", arm2: "C", expr: e1 });
      if (e2) angles.push({ arm1: "B", arm2: "D", expr: e2 });
      continue;
    }

    // 5. تقاطع المستقيم أ ب والمستقيم جـ د في م
    const mIntersect = clause.match(
      /تقاطع\s+(?:المستقيم\s+|المستقيمان\s+)?(.+?)\s+و\s*(?:المستقيم\s+)?(.+?)\s+في\s+(?:النقطة\s+)?([أ-ي]ـ?|[A-Z])/
    );
    if (mIntersect) {
      const s1 = extractCleanKeys(mIntersect[1]);
      const s2 = extractCleanKeys(mIntersect[2]);
      const v = normalizeLabelKey(mIntersect[3]);
      if (s1 && s1.length === 2 && s2 && s2.length === 2) {
        setVertex(v);
        addOpposite(s1[0], s1[1]);
        addOpposite(s2[0], s2[1]);
        continue;
      }
    }

    // 6. ب تنتمي للمستقيم أ جـ
    const mBelongs = clause.match(
      /^([أ-ي]ـ?|[A-Z])\s*(?:تنتمي\s*(?:إلى|الى)?\s*(?:للمستقيم|المستقيم|مستقيم)?|∈\s*(?:المستقيم)?)\s*(.+)$/
    );
    if (mBelongs) {
      const v = normalizeLabelKey(mBelongs[1]);
      const lineKeys = extractCleanKeys(mBelongs[2]);
      if (lineKeys && lineKeys.length === 2) {
        setVertex(v);
        addOpposite(lineKeys[0], lineKeys[1]);
        lastPairBounds = [lineKeys[0], lineKeys[1]];
        continue;
      }
    }

    // 7. أ، ب، جـ نقط متتالية أو النقاط أ، ب، جـ متتالية
    const mCollinear = clause.match(
      /^(?:النقاط|النقط)?\s*(.+?)\s*(?:(?:نقط|نقاط)\s+)?(?:متتالية|على\s+استقامة)/
    );
    if (mCollinear) {
      const pts = mCollinear[1]
        .split(/\s*[،,و]+\s*/)
        .map((s) => normalizeLabelKey(s))
        .filter(Boolean);
      if (pts.length === 3) {
        setVertex(pts[1]);
        addOpposite(pts[0], pts[2]);
        lastPairBounds = [pts[0], pts[2]];
        continue;
      }
    }

    // 8. أ ب جـ زاوية مقسمة لشعاعين ب د و ب هـ
    const mSplitAngle = clause.match(/^(.+?)\s+زاوية\s+مقسمة\s+لشعاعين\s+(.+?)\s+و\s*(.+)$/);
    if (mSplitAngle) {
      const outer = extractCleanKeys(mSplitAngle[1]);
      const r1 = extractCleanKeys(mSplitAngle[2]);
      const r2 = extractCleanKeys(mSplitAngle[3]);
      if (outer && outer.length === 3 && r1 && r1.length === 2 && r2 && r2.length === 2) {
        const v = outer[1];
        setVertex(v);
        addRay(outer[0]);
        addRay(outer[2]);
        const m1 = r1[0] === v ? r1[1] : r1[0];
        const m2 = r2[0] === v ? r2[1] : r2[0];
        addRay(m1);
        addRay(m2);
        lastPairBounds = [outer[0], outer[2]];
        betweenness.push({ midRays: [m1, m2], bound1: outer[0], bound2: outer[2] });
        continue;
      }
    }

    // 9. الزوايا متجاورة عند ب
    const mAdjAt = clause.match(/الزوايا\s+متجاورة\s+عند\s+(?:النقطة\s+)?([أ-ي]ـ?|[A-Z])/);
    if (mAdjAt) {
      setVertex(normalizeLabelKey(mAdjAt[1]));
      continue;
    }

    // 10. مجموع الزاويتين المتقابلتين بالرأس (∠أ م جـ و ∠ب م د) يساوي 140°
    const mSum = clause.match(
      /مجموع\s+الزاويتين.*?\(\s*∠?\s*(.+?)\s+و\s+∠?\s*(.+?)\s*\)\s*(?:يساوي|=)\s*(\d+(?:\.\d+)?)/
    );
    if (mSum) {
      const a1 = extractCleanKeys(mSum[1]);
      const a2 = extractCleanKeys(mSum[2]);
      const sumDeg = Number(mSum[3]);
      if (a1 && a1.length === 3 && a2 && a2.length === 3 && Number.isFinite(sumDeg)) {
        setVertex(a1[1]);
        addRay(a1[0]);
        addRay(a1[2]);
        addRay(a2[0]);
        addRay(a2[2]);
        sumEquations.push({
          angles: [
            [a1[0], a1[2]],
            [a2[0], a2[2]],
          ],
          sumDeg,
        });
        continue;
      }
    }

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
    const mAngle = clause.match(/^(?:ق\s*\(\s*∠?\s*([^)]+)\)|∠\s*([^=]+))\s*=\s*(.+)$/);
    if (mAngle) {
      const pts = extractCleanKeys(mAngle[1] ?? mAngle[2]);
      const expr = parseLinearAngleExpression(mAngle[3]);
      if (pts && pts.length === 3 && expr) {
        setVertex(pts[1]);
        addRay(pts[0]);
        addRay(pts[2]);
        angles.push({ arm1: pts[0], arm2: pts[2], expr });
        continue;
      }
    }

    // 13. منصف زاوية صريح: الشعاع جـ هـ ينصف ∠د جـ س
    if (!/ينصف\s+المنطقة\s+بينهما/.test(clause)) {
      const mBis = clause.match(/^(.+?)\s+ينصف\s+(?:الزاوية\s+|∠\s*)(.+)$/);
      if (mBis) {
        const rayKeys = extractCleanKeys(mBis[1]);
        const angKeys = extractCleanKeys(mBis[2]);
        if (rayKeys && rayKeys.length === 2 && angKeys && angKeys.length === 3) {
          const v = angKeys[1];
          setVertex(v);
          const bisRay = rayKeys[0] === v ? rayKeys[1] : rayKeys[0];
          addRay(bisRay);
          addRay(angKeys[0]);
          addRay(angKeys[2]);
          bisectors.push({ bisectorRay: bisRay, arm1: angKeys[0], arm2: angKeys[2] });
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
      betweenness.push({
        midRays: extractedMidRays,
        bound1: lastPairBounds[0],
        bound2: lastPairBounds[1],
      });
    }
  }

  if (!vertex || rays.length < 2) return null;
  if (
    angles.length === 0 &&
    perpPairs.length === 0 &&
    oppositePairs.length === 0 &&
    bisectors.length === 0 &&
    sumEquations.length === 0
  ) {
    return null;
  }

  return {
    vertex,
    rays,
    oppositePairs,
    perpPairs,
    angles,
    bisectors,
    betweenness,
    sumEquations,
    isFullCircleAroundVertex,
    consecutiveFanOrder,
  };
}
