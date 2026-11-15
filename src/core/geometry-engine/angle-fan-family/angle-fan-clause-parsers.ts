/**
 * @file angle-fan-clause-parsers.ts
 * @description دوال تجزئة وفك شيفرة جمل مراوح الأشعة والزوايا (التقاطع، الانتماء، الاستقامة، التقسيم، والمجاميع).
 */
import { convertGeometryLatexToPlainText } from "../description-intake/geometry-latex-to-plain-normalizer";
import { normalizeLabelKey, parseLabelList } from "../fact-compositor/geo-label-utils";
import type { AngleFanMeasureFact, AngleFanSumFact } from "./angle-fan-fact-types";
import { parseLinearAngleExpression } from "./angle-linear-expression-parser";

export const MODULE_ID_ANGLE_FAN_CLAUSE_PARSERS = "angle_fan_clause_parsers" as const;

const GOAL_CLAUSE_RE =
  /^(?:ثم\s+)?[فو]?\s*(?:أوجد|اوجد|احسب|أثبت|اثبت|برهن|استنتج|علل|بين\s*أن|حدد|اذكر|ما\s*(?:هو|هي|قيمة|نوع)|المطلوب|هل\b)/;

export interface AngleFanBuildCtx {
  setVertex: (v: string) => void;
  getVertex: () => string | null;
  addRay: (r: string) => void;
  addOpposite: (a: string, b: string) => void;
  addAngleFact: (arm1: string, arm2: string, expr: AngleFanMeasureFact["expr"]) => void;
  markFullCircle: () => void;
  setConsecutiveOrder: (order: string[]) => void;
  setLastPairBounds: (bounds: [string, string]) => void;
  pushBetween: (midRays: string[], bound1: string, bound2: string) => void;
  sumEquations: AngleFanSumFact[];
}

export function extractCleanKeys(rawSegmentText: string): string[] | null {
  const stripped = rawSegmentText
    .replace(/\(\s*\d+\s*°?\s*\)/g, " ")
    .replace(
      /(?:الشعاعان|الشعاعين|الشعاع|الأشعة|المستقيمان|المستقيمين|للمستقيم|بالمستقيم|المستقيم|لمستقيم|القطعة|شعاعين|شعاع|مستقيم|النقطة|نقطة|الزاوية|زاوية|ق\s*\(|∠|\)|\{|\})/g,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();
  return parseLabelList(stripped);
}

/** يقسم النص الخام إلى جمل حقائق نظيفة خاصة بعائلة المراوح والزوايا. */
export function splitAngleFanClauses(rawDescription: string): string[] {
  let plain = convertGeometryLatexToPlainText(rawDescription)
    .replace(/\[\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:/gi, " ؛ ")
    .replace(/(?:^|[\s؛;])رسم\s*(?:هندسي|توضيحي|بياني)\s*:/gi, " ؛ ")
    .replace(/\]\s*(?:\|.*)?$/g, " ")
    .replace(/\]/g, " ؛ ")
    .replace(/\|\s*(?:معرف|نوع)\s*[^؛;\n]*/g, " ")
    .replace(/\|\s*$/g, " ")
    .replace(/(?<!\d)\.(?!\d)/g, " ؛ ")
    .replace(/(?:في\s+)?الشكل\s+المقابل\s*[،,:]?/g, " ؛ ")
    .replace(/(?:^|[،؛;\s])(?:إذا\s+كان|اذا\s+كان|حيث|بحيث|وكان|علماً\s+بأن|علما\s+بأن)\s+/g, " ؛ ");

  plain = plain
    .replace(/،(?=\s*(?:ق\s*\(|∠|الشعاع|المستقيم|تقاطع|الزوايا|نقطة|مجموع|[فو]?(?:أوجد|اوجد|احسب|أثبت|اثبت|برهن)))/g, "؛")
    .replace(/(?:\s+|(?<=[°0-9٠-٩\)]))و(?=\s*(?:ق\s*\(|m\s*\(|∠))/g, " ؛ ");

  const rawParts = plain
    .split(/\s*[;؛\n]+\s*/)
    .flatMap((part) => (/(?:متتالية|على\s+استقامة|حولها)/.test(part) ? [part] : part.split(/\s*،\s*/)))
    .map((c) => c.replace(/^[و\s]+(?=(?:الشعاع|المستقيم|ق\s*\(|∠))/, "").trim())
    .filter((c) => c.length > 1 && !GOAL_CLAUSE_RE.test(c));

  return [...new Set(rawParts)];
}

/** يعالج جمل المروحة حول نقطة والتقاطع (القواعد 1–5). */
export function tryParseFanAndIntersectClause(clause: string, ctx: AngleFanBuildCtx): boolean {
  const mAnonFan = clause.match(
    /(?:ال)?نقطة\s+([أ-ي]ـ?|[A-Z])\s+حولها\s+(?:ثلاثة|ثلاث|أربعة|اربعة|خمسة|خمس|3|٣|4|٤|5|٥|عدة)?\s*أشعة\s+تصنع\s+زوايا\s+(.+)/
  );
  if (mAnonFan) {
    ctx.setVertex(normalizeLabelKey(mAnonFan[1]));
    ctx.markFullCircle();
    const exprTokens = mAnonFan[2].split(/\s*(?:،|,|و(?=\s*[0-9٠-٩(]))\s*/).map((s) => s.trim()).filter(Boolean);
    const v = ctx.getVertex();
    const fanRays = ["A", "B", "C", "D", "E", "F"].filter((k) => k !== v).slice(0, exprTokens.length);
    fanRays.forEach(ctx.addRay);
    ctx.setConsecutiveOrder(fanRays);
    exprTokens.forEach((tok, idx) => {
      const expr = parseLinearAngleExpression(tok);
      if (expr) ctx.addAngleFact(fanRays[idx], fanRays[(idx + 1) % fanRays.length], expr);
    });
    return true;
  }

  const mNamedFan = clause.match(/(?:ال)?نقطة\s+([أ-ي]ـ?|[A-Z])\s+حولها\s+الأشعة\s+(.+)/);
  if (mNamedFan) {
    const v = normalizeLabelKey(mNamedFan[1]);
    ctx.setVertex(v);
    ctx.markFullCircle();
    const order: string[] = [];
    for (const rp of mNamedFan[2].split(/\s*[،,و]+\s*/).filter(Boolean)) {
      const ks = extractCleanKeys(rp);
      if (ks && ks.length === 2) {
        const endPt = ks[0] === v ? ks[1] : ks[0];
        ctx.addRay(endPt);
        order.push(endPt);
      }
    }
    if (order.length >= 3) ctx.setConsecutiveOrder(order);
    return true;
  }

  const mAround =
    clause.match(/الزوايا\s+متجمعة\s+حول\s+(?:النقطة\s+)?([أ-ي]ـ?|[A-Z])/i) ??
    clause.match(/(?:أربعة|اربعة|ثلاثة|ثلاث|خمسة|خمس|\d+)?\s*أشعة\s+تخرج\s+من\s+(?:النقطة\s+)?([أ-ي]ـ?|[A-Z])/i);
  if (mAround) {
    ctx.setVertex(normalizeLabelKey(mAround[1]));
    ctx.markFullCircle();
    return true;
  }

  if (/^تقاطع\s+مستقيمين/.test(clause)) {
    ctx.setVertex("M");
    ctx.addOpposite("A", "B");
    ctx.addOpposite("C", "D");
    return true;
  }
  const mVertPair = clause.match(/الزاويتان\s+المتقابلتان\s+بالرأس\s+هما\s+(.+?)\s+و\s*(.+)/);
  if (mVertPair) {
    if (!ctx.getVertex()) {
      ctx.setVertex("M");
      ctx.addOpposite("A", "B");
      ctx.addOpposite("C", "D");
    }
    const e1 = parseLinearAngleExpression(mVertPair[1]);
    const e2 = parseLinearAngleExpression(mVertPair[2]);
    if (e1) ctx.addAngleFact("A", "C", e1);
    if (e2) ctx.addAngleFact("B", "D", e2);
    return true;
  }

  const mIntersect =
    clause.match(/تقاطع\s+(?:المستقيم\s+|المستقيمان\s+)?(.+?)\s+و\s*(?:المستقيم\s+|الشعاع\s+)?(.+?)\s+(?:في|عند)\s+(?:النقطة\s+)?([أ-ي]ـ?|[A-Z])/) ??
    clause.match(/^(?:ال)?(?:مستقيم|شعاع|قطعة(?:\s*مستقيمة)?)\s+(.+?)\s+(?:يتقاطع|تتقاطع)\s+مع\s+(?:ال)?(?:مستقيم|شعاع|قطعة(?:\s*مستقيمة)?)\s+(.+?)\s+(?:في|عند)\s+(?:النقطة\s+)?([أ-ي]ـ?|[A-Z])/i) ??
    clause.match(/^(.+?)\s*(?:∩|يتقاطعان\s+في)\s*(.+?)\s*(?:=\s*|\s+في\s+)\{?\s*([أ-ي]ـ?|[A-Z])\s*\}?$/);
  if (mIntersect) {
    const s1 = extractCleanKeys(mIntersect[1]);
    const s2 = extractCleanKeys(mIntersect[2]);
    const v = normalizeLabelKey(mIntersect[3]);
    if (s1 && s1.length === 2 && s2 && s2.length === 2) {
      ctx.setVertex(v);
      if (s1[0] === v || s1[1] === v) ctx.addRay(s1[0] === v ? s1[1] : s1[0]);
      else ctx.addOpposite(s1[0], s1[1]);
      if (s2[0] === v || s2[1] === v) ctx.addRay(s2[0] === v ? s2[1] : s2[0]);
      else ctx.addOpposite(s2[0], s2[1]);
      return true;
    }
  }
  return false;
}

/** يعالج جمل الانتماء والاستقامة والتقسيم والتجاور والمجموع (القواعد 6–10). */
export function tryParseCollinearAndSumClause(clause: string, ctx: AngleFanBuildCtx): boolean {
  const mBelongs = clause.match(/^([أ-ي]ـ?|[A-Z])\s*(?:تنتمي\s*(?:إلى|الى)?\s*(?:للمستقيم|المستقيم|مستقيم)?|∈\s*(?:المستقيم)?)\s*(.+)$/);
  if (mBelongs) {
    const lineKeys = extractCleanKeys(mBelongs[2]);
    if (lineKeys && lineKeys.length === 2) {
      ctx.setVertex(normalizeLabelKey(mBelongs[1]));
      ctx.addOpposite(lineKeys[0], lineKeys[1]);
      ctx.setLastPairBounds([lineKeys[0], lineKeys[1]]);
      return true;
    }
  }

  const mCollinear = clause.match(/^(?:النقاط|النقط)?\s*(.+?)\s*(?:(?:نقط|نقاط)\s+)?(?:متتالية|على\s+استقامة)/);
  if (mCollinear) {
    const pts = mCollinear[1].split(/\s*[،,و]+\s*/).map((s) => normalizeLabelKey(s)).filter(Boolean);
    if (pts.length === 3) {
      ctx.setVertex(pts[1]);
      ctx.addOpposite(pts[0], pts[2]);
      ctx.setLastPairBounds([pts[0], pts[2]]);
      return true;
    }
  }

  const mSplitAngle = clause.match(/^(.+?)\s+زاوية\s+مقسمة\s+لشعاعين\s+(.+?)\s+و\s*(.+)$/);
  if (mSplitAngle) {
    const outer = extractCleanKeys(mSplitAngle[1]);
    const r1 = extractCleanKeys(mSplitAngle[2]);
    const r2 = extractCleanKeys(mSplitAngle[3]);
    if (outer && outer.length === 3 && r1 && r1.length === 2 && r2 && r2.length === 2) {
      const v = outer[1];
      ctx.setVertex(v);
      ctx.addRay(outer[0]);
      ctx.addRay(outer[2]);
      const m1 = r1[0] === v ? r1[1] : r1[0];
      const m2 = r2[0] === v ? r2[1] : r2[0];
      ctx.addRay(m1);
      ctx.addRay(m2);
      ctx.setLastPairBounds([outer[0], outer[2]]);
      ctx.pushBetween([m1, m2], outer[0], outer[2]);
      return true;
    }
  }

  const mAdjAt = clause.match(/الزوايا\s+متجاورة\s+عند\s+(?:النقطة\s+)?([أ-ي]ـ?|[A-Z])/);
  if (mAdjAt) {
    ctx.setVertex(normalizeLabelKey(mAdjAt[1]));
    return true;
  }

  const mSum =
    clause.match(/مجموع\s+الزاويتين.*?\(\s*∠?\s*(.+?)\s+و\s+∠?\s*(.+?)\s*\)\s*(?:يساوي|=)\s*(\d+(?:\.\d+)?)/) ??
    clause.match(/^(?:ق\s*\(\s*∠?\s*([^)]+)\)|∠\s*([^+]+))\s*\+\s*(?:ق\s*\(\s*∠?\s*([^)]+)\)|∠\s*([^=]+))\s*=\s*(\d+(?:\.\d+)?)/);
  if (mSum) {
    const rawA1 = mSum.length === 4 ? mSum[1] : (mSum[1] ?? mSum[2]);
    const rawA2 = mSum.length === 4 ? mSum[2] : (mSum[3] ?? mSum[4]);
    const sumDeg = Number(mSum.length === 4 ? mSum[3] : mSum[5]);
    const a1 = extractCleanKeys(rawA1);
    const a2 = extractCleanKeys(rawA2);
    if (a1 && a1.length === 3 && a2 && a2.length === 3 && Number.isFinite(sumDeg)) {
      ctx.setVertex(a1[1]);
      ctx.addRay(a1[0]);
      ctx.addRay(a1[2]);
      ctx.addRay(a2[0]);
      ctx.addRay(a2[2]);
      if (!ctx.sumEquations.some((eq) => eq.sumDeg === sumDeg)) {
        ctx.sumEquations.push({ angles: [[a1[0], a1[2]], [a2[0], a2[2]]], sumDeg });
      }
      return true;
    }
  }
  return false;
}
