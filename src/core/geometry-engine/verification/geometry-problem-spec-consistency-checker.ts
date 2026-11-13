/**
 * @file geometry-problem-spec-consistency-checker.ts
 * @description فاحص الاتساق الرياضي والمغلق لمواصفة المسألة قبل الرسم (`Closed-World & Mathematical Consistency Check` — المرحلة 3.2):
 * يفحص:
 * 1. المتباينة المثلثية: مجموع طولي أي ضلعين في مثلث أكبر قطعاً من طول الضلع الثالث ($a + b > c$).
 * 2. مجموع زوايا المثلث: إذا عُرفت زاويتان فمجموعهما $< 180^\circ$، وإذا عُرفت الثلاث فمجموعها $= 180^\circ$.
 * 3. مجموع زوايا الشكل الرباعي: إذا عُرفت الزوايا الأربع فمجموعها $= 360^\circ$.
 * 4. اتساق نظرية فيثاغورس للمثلث القائم: الوتر أكبر من كل من ضلعي القائمة، وإذا أُعطيت الأضلاع الثلاثة فإن $a^2 + b^2 = c^2$.
 * 5. عدم وجود قيم سالبة أو صفرية للأطوال أو الزوايا.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 170 سطراً).
 */

import type { GeometryProblemSpec } from "../../ssot/geometry-archetype-ssot";
import { pairKey } from "../fact-compositor/geo-label-utils";

export const MODULE_ID_GEOMETRY_PROBLEM_SPEC_CONSISTENCY_CHECKER =
  "geometry_problem_spec_consistency_checker" as const;

export interface ProblemSpecConsistencyReport {
  readonly passed: boolean;
  readonly violations: readonly string[];
}

/**
 * يتحقق من الاتساق الرياضي للمعطيات داخل `GeometryProblemSpec` قبل الشروع في البناء الهندسي.
 */
export function verifyProblemSpecMathematicalConsistency(
  spec: GeometryProblemSpec,
  options: { readonly isClassificationQuestion?: boolean } = {}
): ProblemSpecConsistencyReport {
  const violations: string[] = [];

  const lengthByPair = new Map<string, number>();
  const angleByTarget = new Map<string, number>();

  for (const g of spec.givens) {
    if (g.numericValue === undefined) continue;
    // المعطيات الجبرية التي تحوي متغيرات (مثل x أو 2x - 1) تحمل قيمة تقريبية للرسم فقط وليست ثوابت رياضية للفحص
    if (g.value && /[a-zA-Zسصع]/.test(g.value)) continue;
    if (g.numericValue <= 0) {
      violations.push(
        `قيمة غير موجبة للمعطى الهندسي (${g.target} = ${g.numericValue}).`
      );
      continue;
    }
    if (g.target.startsWith("∠")) {
      const key = g.target.slice(1).trim();
      angleByTarget.set(key, g.numericValue);
    } else if (g.target.length === 2) {
      lengthByPair.set(pairKey(g.target[0], g.target[1]), g.numericValue);
    }
  }

  for (const rel of spec.relations) {
    if (rel.kind !== "right_angle" || !rel.at) continue;
    const triAngleKey = rel.targets?.find((t) => t.length === 3 && t[1] === rel.at);
    if (triAngleKey) {
      if (!angleByTarget.has(triAngleKey)) {
        angleByTarget.set(triAngleKey, 90);
      }
      continue;
    }
    if (rel.targets && rel.targets.length === 2 && rel.targets[0].length === 2 && rel.targets[1].length === 2) {
      const a0 = rel.targets[0].replace(rel.at, "");
      const a1 = rel.targets[1].replace(rel.at, "");
      if (a0.length === 1 && a1.length === 1) {
        const key3 = `${a0}${rel.at}${a1}`;
        if (!angleByTarget.has(key3)) angleByTarget.set(key3, 90);
        continue;
      }
    }
    if (!angleByTarget.has(rel.at)) {
      angleByTarget.set(rel.at, 90);
    }
  }

  const resolveTriangleVertexAngle = (
    triVerts: readonly string[],
    v: string
  ): number | undefined => {
    const triSet = new Set(triVerts);
    for (const [k, deg] of angleByTarget) {
      if (k.length === 3 && k[1] === v && triSet.has(k[0]) && triSet.has(k[2])) {
        return deg;
      }
    }
    return angleByTarget.get(v);
  };

  // فحص كل مثلث معلن في المواصفة
  for (const obj of spec.objects) {
    if (obj.kind === "triangle" && obj.vertices && obj.vertices.length === 3) {
      const [A, B, C] = obj.vertices;
      const ab = lengthByPair.get(pairKey(A, B));
      const bc = lengthByPair.get(pairKey(B, C));
      const ca = lengthByPair.get(pairKey(C, A));

      // 1. فحص المتباينة المثلثية (إلا إذا كان السؤال يسأل صراحة: هل تصلح أن تكون أضلاع مثلث؟)
      if (!options.isClassificationQuestion && ab !== undefined && bc !== undefined && ca !== undefined) {
        if (ab + bc <= ca + 1e-6 || ab + ca <= bc + 1e-6 || bc + ca <= ab + 1e-6) {
          violations.push(
            `مخالفة المتباينة المثلثية في المثلث ${A}${B}${C}: الأطوال (${ab}، ${bc}، ${ca}) لا تكوّن مثلثاً.`
          );
        }
      }

      // 2. فحص مجموع زوايا المثلث الداخلية (الزوايا المنتمية لنفس المثلث)
      const angA = resolveTriangleVertexAngle(obj.vertices, A);
      const angB = resolveTriangleVertexAngle(obj.vertices, B);
      const angC = resolveTriangleVertexAngle(obj.vertices, C);
      const knownAngles = [angA, angB, angC].filter((x): x is number => x !== undefined);

      if (knownAngles.length === 2) {
        const sum2 = knownAngles[0] + knownAngles[1];
        if (sum2 >= 180 - 1e-6) {
          violations.push(
            `تعارض زوايا في المثلث ${A}${B}${C}: مجموع زاويتين (${sum2}°) لا يمكن أن يساوي أو يتجاوز 180°.`
          );
        }
      } else if (knownAngles.length === 3) {
        const sum3 = knownAngles[0] + knownAngles[1] + knownAngles[2];
        if (Math.abs(sum3 - 180) > 1.5) {
          violations.push(
            `تعارض زوايا في المثلث ${A}${B}${C}: مجموع الزوايا الثلاث (${sum3}°) لا يساوي 180°.`
          );
        }
      }

      // 3. فحص اتساق فيثاغورس إذا كان المثلث قائماً صراحة
      if (!options.isClassificationQuestion && obj.subtype === "right") {
        const rightRel = spec.relations.find(
          (r) => r.kind === "right_angle" && r.at && obj.vertices?.includes(r.at)
        );
        const rV = rightRel?.at;
        if (rV) {
          const hyp = rV === A ? bc : rV === B ? ca : ab;
          const leg1 = rV === A ? ab : rV === B ? ab : bc;
          const leg2 = rV === A ? ca : rV === B ? bc : ca;
          if (hyp !== undefined && ((leg1 !== undefined && hyp <= leg1) || (leg2 !== undefined && hyp <= leg2))) {
            violations.push(
              `تعارض في المثلث القائم ${A}${B}${C}: الوتر (${hyp}) يجب أن يكون أطول من ضلعي القائمة.`
            );
          } else if (
            hyp !== undefined &&
            leg1 !== undefined &&
            leg2 !== undefined &&
            Math.abs(leg1 * leg1 + leg2 * leg2 - hyp * hyp) > Math.max(1.5, 0.08 * hyp * hyp)
          ) {
            violations.push(
              `تعارض فيثاغورس في المثلث القائم ${A}${B}${C}: (${leg1}² + ${leg2}² ≠ ${hyp}²).`
            );
          }
        }
      }
    }

    // 4. فحص مجموع زوايا الشكل الرباعي
    if (obj.kind === "quadrilateral" && obj.vertices && obj.vertices.length === 4) {
      const knownQuadAngles = obj.vertices
        .map((v) => angleByTarget.get(v))
        .filter((x): x is number => x !== undefined);
      if (knownQuadAngles.length === 4) {
        const sum4 = knownQuadAngles.reduce((a, b) => a + b, 0);
        if (Math.abs(sum4 - 360) > 2) {
          violations.push(
            `تعارض زوايا في الشكل الرباعي ${obj.id}: مجموع الزوايا الأربع (${sum4}°) لا يساوي 360°.`
          );
        }
      }
    }
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}
