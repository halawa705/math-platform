/**
 * @file angle-fan-direction-solver.ts
 * @description حلال اتجاهات الأشعة والمعادلات الجبرية لعائلة الزوايا (Angle-Fan Direction & Algebraic Solver):
 * 1. يستنتج قيمة المجهول الجبري (مثل س أو X) من العلاقات الهندسية (التتام 90°، التكامل 180°، التقابل بالرأس، التجمع حول نقطة 360°).
 * 2. يحدد زاوية كل شعاع في المدى [0°, 360°) بحيث تتحقق جميع القياسات والتعامدات والاستقامات ومنصفات الزوايا دون تداخل.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 270 سطراً).
 */

import type { AngleFanSpec, SolvedAngleFanLayout } from "./angle-fan-fact-types";
import { evaluateLinearAngleExpr } from "./angle-linear-expression-parser";

export const MODULE_ID_ANGLE_FAN_DIRECTION_SOLVER =
  "angle_fan_direction_solver" as const;

function norm360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** المسافة الزاوية الصغرى في [0, 180] بين اتجاهين */
export function minorAngleDiffDeg(a: number, b: number): number {
  const d = Math.abs(norm360(a) - norm360(b));
  return d > 180 ? 360 - d : d;
}

/** هل يقع الاتجاه mid داخل القوس الأصغر بين a و b (أو القوس العلوي 180° عند الاستقامة)؟ */
function isRayStrictlyInsideArc(mid: number, a: number, b: number, margin = 1.5): boolean {
  const ma = norm360(a);
  const mb = norm360(b);
  const mm = norm360(mid);
  const ccwSpan = norm360(mb - ma);
  if (Math.abs(ccwSpan - 180) < 1) {
    return mm > margin && mm < 180 - margin;
  }
  if (ccwSpan < 180) {
    const rel = norm360(mm - ma);
    return rel > margin && rel < ccwSpan - margin;
  } else {
    const cwSpan = 360 - ccwSpan;
    const rel = norm360(ma - mm);
    return rel > margin && rel < cwSpan - margin;
  }
}

/** منتصف القوس الأصغر بين اتجاهين (أو القوس العلوي إذا كانا متقابلين بـ 180°) */
function minorArcMidpointDeg(a: number, b: number): number {
  const ma = norm360(a);
  const mb = norm360(b);
  const ccwSpan = norm360(mb - ma);
  if (Math.abs(ccwSpan - 180) < 1) {
    return 90;
  }
  if (ccwSpan <= 180) {
    return norm360(ma + ccwSpan / 2);
  }
  const cwSpan = 360 - ccwSpan;
  return norm360(ma - cwSpan / 2);
}

/**
 * يحل قيمة المتغير الجبري (مثل س) إن وُجد في قياسات الزوايا.
 */
export function solveAlgebraicVariableForFan(spec: AngleFanSpec): number | null {
  const hasAlgebraic = spec.angles.some((a) => !a.expr.isPureNumeric);
  if (!hasAlgebraic) return null;

  const oppOf = (r: string): string | undefined => {
    for (const [x, y] of spec.oppositePairs) {
      if (x === r) return y;
      if (y === r) return x;
    }
    return undefined;
  };

  // 1. تقابل بالرأس أو تكامل على مستقيمين متقاطعين
  if (spec.oppositePairs.length >= 1) {
    for (let i = 0; i < spec.angles.length; i++) {
      for (let j = i + 1; j < spec.angles.length; j++) {
        const A = spec.angles[i];
        const B = spec.angles[j];
        const o1 = oppOf(A.arm1);
        const o2 = oppOf(A.arm2);
        const isVertical =
          (o1 === B.arm1 && o2 === B.arm2) || (o1 === B.arm2 && o2 === B.arm1);
        if (isVertical) {
          const dc = A.expr.coeff - B.expr.coeff;
          const dk = B.expr.constant - A.expr.constant;
          if (Math.abs(dc) > 1e-6) return dk / dc;
        }
        const sharesOneAndOppositeOther =
          (A.arm1 === B.arm1 && oppOf(A.arm2) === B.arm2) ||
          (A.arm1 === B.arm2 && oppOf(A.arm2) === B.arm1) ||
          (A.arm2 === B.arm1 && oppOf(A.arm1) === B.arm2) ||
          (A.arm2 === B.arm2 && oppOf(A.arm1) === B.arm1);
        if (sharesOneAndOppositeOther) {
          const sc = A.expr.coeff + B.expr.coeff;
          const sk = A.expr.constant + B.expr.constant;
          if (Math.abs(sc) > 1e-6) return (180 - sk) / sc;
        }
      }
    }
  }

  // 2. مجموع الزوايا حول نقطة = 360°، أو على مستقيم = 180°، أو داخل زاوية قائمة = 90°
  let targetSum: number | null = null;
  let extraFixedDeg = 0;

  if (spec.isFullCircleAroundVertex) {
    targetSum = 360;
    for (const [p1, p2] of spec.perpPairs) {
      const alreadyListed = spec.angles.some(
        (a) => (a.arm1 === p1 && a.arm2 === p2) || (a.arm1 === p2 && a.arm2 === p1)
      );
      if (!alreadyListed) extraFixedDeg += 90;
    }
  } else if (spec.oppositePairs.length === 1) {
    targetSum = 180;
  } else if (spec.perpPairs.length >= 1) {
    targetSum = 90;
  }

  if (targetSum !== null) {
    const totalCoeff = spec.angles.reduce((acc, a) => acc + a.expr.coeff, 0);
    const totalConst =
      spec.angles.reduce((acc, a) => acc + a.expr.constant, 0) + extraFixedDeg;
    if (Math.abs(totalCoeff) > 1e-6) {
      const val = (targetSum - totalConst) / totalCoeff;
      if (val > 0) return val;
    }
  }

  return 20;
}

interface PairDistanceConstraint {
  readonly u: string;
  readonly v: string;
  readonly deg: number;
  readonly canContainIntermediateRays: boolean;
}

/**
 * يحل اتجاهات جميع الأشعة في المروحة.
 */
export function solveAngleFanDirections(spec: AngleFanSpec): SolvedAngleFanLayout {
  const solvedVarValue = solveAlgebraicVariableForFan(spec);
  const varVal = solvedVarValue ?? 20;

  const evaluatedAngles: {
    arm1: string;
    arm2: string;
    degrees: number;
    rawLabel: string;
  }[] = spec.angles.map((a) => ({
    arm1: a.arm1,
    arm2: a.arm2,
    degrees: Math.max(5, Math.min(175, evaluateLinearAngleExpr(a.expr, varVal))),
    rawLabel: a.expr.rawLabel,
  }));

  // إضافة الزوايا المستنتجة من معادلات المجموع (مثل مجموع زاويتين متقابلتين بالرأس = 140°)
  for (const eq of spec.sumEquations) {
    if (eq.angles.length === 2) {
      const eachDeg = eq.sumDeg / 2;
      for (const [u, v] of eq.angles) {
        if (
          !evaluatedAngles.some(
            (a) => (a.arm1 === u && a.arm2 === v) || (a.arm1 === v && a.arm2 === u)
          )
        ) {
          evaluatedAngles.push({
            arm1: u,
            arm2: v,
            degrees: eachDeg,
            rawLabel: `${eachDeg}°`,
          });
        }
      }
    }
  }

  // حالة خاصة سريعة ومضمونة: ترتيب دائري متتابع صريح (مثل #11)
  if (
    spec.isFullCircleAroundVertex &&
    spec.consecutiveFanOrder &&
    spec.consecutiveFanOrder.length === spec.rays.length &&
    spec.perpPairs.length === 0
  ) {
    const map = new Map<string, number>();
    let cur = 0;
    for (let i = 0; i < spec.consecutiveFanOrder.length; i++) {
      const r = spec.consecutiveFanOrder[i];
      map.set(r, norm360(cur));
      const nextR = spec.consecutiveFanOrder[(i + 1) % spec.consecutiveFanOrder.length];
      const ang = evaluatedAngles.find(
        (a) => (a.arm1 === r && a.arm2 === nextR) || (a.arm1 === nextR && a.arm2 === r)
      );
      cur += ang ? ang.degrees : 360 / spec.consecutiveFanOrder.length;
    }
    return { vertex: spec.vertex, rayAnglesDeg: map, solvedVarValue, evaluatedAngles };
  }

  const constraints: PairDistanceConstraint[] = [];
  for (const [a, b] of spec.oppositePairs) {
    constraints.push({ u: a, v: b, deg: 180, canContainIntermediateRays: true });
  }
  for (const [a, b] of spec.perpPairs) {
    const hasBetween =
      spec.betweenness.some(
        (bw) =>
          (bw.bound1 === a && bw.bound2 === b) || (bw.bound1 === b && bw.bound2 === a)
      ) || (!spec.isFullCircleAroundVertex && evaluatedAngles.length >= 2);
    constraints.push({ u: a, v: b, deg: 90, canContainIntermediateRays: hasBetween });
  }
  for (const ang of evaluatedAngles) {
    const isBisected = spec.bisectors.some(
      (b) =>
        (b.arm1 === ang.arm1 && b.arm2 === ang.arm2) ||
        (b.arm1 === ang.arm2 && b.arm2 === ang.arm1)
    );
    constraints.push({
      u: ang.arm1,
      v: ang.arm2,
      deg: ang.degrees,
      canContainIntermediateRays: isBisected,
    });
  }

  const initial = new Map<string, number>();
  if (spec.oppositePairs.length >= 1) {
    const [p1, p2] = spec.oppositePairs[0];
    // نضع الشعاع الأول عند 0° (يمين) أو 180° (يسار)
    initial.set(p1, 180);
    initial.set(p2, 0);
  } else if (spec.perpPairs.length >= 1) {
    initial.set(spec.perpPairs[0][0], 0);
    initial.set(spec.perpPairs[0][1], 90);
  } else {
    initial.set(spec.rays[0], 0);
  }

  let bestAssignment: Map<string, number> | null = null;
  let bestScore = -Infinity;

  const evaluateCandidate = (assigned: Map<string, number>): number => {
    for (const c of constraints) {
      const au = assigned.get(c.u);
      const av = assigned.get(c.v);
      if (au === undefined || av === undefined) return -Infinity;
      if (Math.abs(minorAngleDiffDeg(au, av) - c.deg) > 1.2) return -Infinity;
    }
    for (const bis of spec.bisectors) {
      const a1 = assigned.get(bis.arm1);
      const a2 = assigned.get(bis.arm2);
      const ab = assigned.get(bis.bisectorRay);
      if (a1 === undefined || a2 === undefined || ab === undefined) return -Infinity;
      const d1 = minorAngleDiffDeg(a1, ab);
      const d2 = minorAngleDiffDeg(ab, a2);
      if (Math.abs(d1 - d2) > 1.5 || !isRayStrictlyInsideArc(ab, a1, a2)) return -Infinity;
    }
    const entries = [...assigned.entries()];
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        if (minorAngleDiffDeg(entries[i][1], entries[j][1]) < 6) return -Infinity;
      }
    }

    let score = 0;
    // معاقبة وقوع أي شعاع داخل زاوية أولية غير مقسومة
    for (const c of constraints) {
      if (c.canContainIntermediateRays) continue;
      const au = assigned.get(c.u)!;
      const av = assigned.get(c.v)!;
      for (const [rKey, rAng] of entries) {
        if (rKey === c.u || rKey === c.v) continue;
        if (isRayStrictlyInsideArc(rAng, au, av, 1.5)) {
          score -= 500;
        }
      }
    }
    // مكافأة احترام البينية المعلنة
    for (const bw of spec.betweenness) {
      const b1 = assigned.get(bw.bound1);
      const b2 = assigned.get(bw.bound2);
      if (b1 !== undefined && b2 !== undefined) {
        for (const m of bw.midRays) {
          const ma = assigned.get(m);
          if (ma !== undefined && isRayStrictlyInsideArc(ma, b1, b2, 1)) {
            score += 40;
          } else {
            score -= 200;
          }
        }
      }
    }
    // تفضيل وضع الأشعة الثانوية في النصف العلوي (0°..180°) عندما لا تكون الزوايا متجمعة حول 360°
    if (!spec.isFullCircleAroundVertex && spec.oppositePairs.length <= 1) {
      for (const [, ang] of entries) {
        if (ang >= 0 && ang <= 180.5) score += 10;
        else score -= 30;
      }
    }
    return score;
  };

  const search = (assigned: Map<string, number>) => {
    if (assigned.size === spec.rays.length) {
      const sc = evaluateCandidate(assigned);
      if (sc > bestScore) {
        bestScore = sc;
        bestAssignment = new Map(assigned);
      }
      return;
    }

    // 1. هل يوجد شعاع غير معين مرتبط بقيد زاوي مع شعاع معين؟
    for (const c of constraints) {
      const hasU = assigned.has(c.u);
      const hasV = assigned.has(c.v);
      if (hasU !== hasV) {
        const knownRay = hasU ? c.u : c.v;
        const targetRay = hasU ? c.v : c.u;
        const baseAng = assigned.get(knownRay)!;
        const cands =
          c.deg === 180
            ? [norm360(baseAng + 180)]
            : [norm360(baseAng + c.deg), norm360(baseAng - c.deg)];
        for (const cand of cands) {
          assigned.set(targetRay, cand);
          search(assigned);
          assigned.delete(targetRay);
        }
        return;
      }
    }

    // 2. هل يوجد منصف زاوية طرفاه معينان؟
    for (const bis of spec.bisectors) {
      if (
        !assigned.has(bis.bisectorRay) &&
        assigned.has(bis.arm1) &&
        assigned.has(bis.arm2)
      ) {
        const mid = minorArcMidpointDeg(assigned.get(bis.arm1)!, assigned.get(bis.arm2)!);
        assigned.set(bis.bisectorRay, mid);
        search(assigned);
        assigned.delete(bis.bisectorRay);
        return;
      }
    }

    // 3. أي شعاع حر متبقٍ (مثل المستقيم الثاني في تقاطع مستقيمين قبل تطبيق المنصف)
    const nextRay = spec.rays.find((r) => !assigned.has(r))!;
    for (const fallbackAng of [55, 125, 45, 135]) {
      assigned.set(nextRay, fallbackAng);
      search(assigned);
      assigned.delete(nextRay);
    }
  };

  search(initial);

  if (!bestAssignment) {
    bestAssignment = new Map();
    spec.rays.forEach((r, idx) =>
      bestAssignment!.set(r, norm360((idx * 180) / Math.max(1, spec.rays.length - 1)))
    );
  }

  return {
    vertex: spec.vertex,
    rayAnglesDeg: bestAssignment,
    solvedVarValue,
    evaluatedAngles,
  };
}
