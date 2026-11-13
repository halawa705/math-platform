/**
 * @file geo-composite-angle-override-helper.ts
 * @description يستنتج قياسات زوايا داخلة لمثلث من حقائق الامتداد والزوايا الخارجة والتوازي (تبادل/تناظر) لضبط التوضع الحتمي.
 */

import type { GeoFact } from "./geo-fact-types";
import { pairKey } from "./geo-label-utils";

export const MODULE_ID_GEO_COMPOSITE_ANGLE_OVERRIDE_HELPER =
  "geo_composite_angle_override_helper" as const;

export function inferTriangleAngleOverridesFromComposites(
  facts: readonly GeoFact[],
  triLabels: readonly string[]
): Map<string, number> {
  const overrides = new Map<string, number>();
  const triSet = new Set(triLabels);

  for (const f of facts) {
    if (f.k === "extend" && triSet.has(f.from) && triSet.has(f.through)) {
      const angFact = facts.find(
        (af): af is Extract<GeoFact, { k: "angle" }> =>
          af.k === "angle" &&
          af.vertex === f.through &&
          af.deg !== undefined &&
          af.deg > 5 &&
          af.deg < 175 &&
          Boolean(af.arms?.includes(f.to))
      );
      if (angFact && angFact.deg !== undefined) {
        const interior = 180 - angFact.deg;
        if (interior > 5 && interior < 175) overrides.set(f.through, interior);
      }
    }
    if (f.k === "pointOn" && triSet.has(f.seg[0]) && triSet.has(f.seg[1]) && !triSet.has(f.p)) {
      const angFact = facts.find(
        (af): af is Extract<GeoFact, { k: "angle" }> =>
          af.k === "angle" &&
          (af.vertex === f.seg[0] || af.vertex === f.seg[1]) &&
          af.deg !== undefined &&
          af.deg > 5 &&
          af.deg < 175 &&
          Boolean(af.arms?.includes(f.p))
      );
      if (angFact && angFact.deg !== undefined) {
        const interior = 180 - angFact.deg;
        if (interior > 5 && interior < 175) overrides.set(angFact.vertex, interior);
      }
    }
  }

  for (const pf of facts) {
    if (pf.k !== "parallel") continue;

    // 1) مستقيم موازٍ يمر بالرأس الثالث للمثلث (XY // BC و A ∈ XY أو زوايا ∠XAB / ∠YAC عند A)
    const candidatePairs: Array<readonly [readonly [string, string], readonly [string, string]]> = [
      [pf.a, pf.b],
      [pf.b, pf.a],
    ];
    for (const [lineSeg, baseSeg] of candidatePairs) {
      if (!triSet.has(baseSeg[0]) || !triSet.has(baseSeg[1])) continue;
      const apex = triLabels.find((l) => l !== baseSeg[0] && l !== baseSeg[1]);
      if (!apex) continue;
      const [x, y] = lineSeg;
      const [b0, b1] = baseSeg;
      const hasHost =
        facts.some(
          (hp) => hp.k === "pointOn" && hp.p === apex && pairKey(hp.seg[0], hp.seg[1]) === pairKey(x, y)
        ) ||
        facts.some(
          (af) => af.k === "angle" && af.vertex === apex && af.arms && (af.arms.includes(x) || af.arms.includes(y))
        );
      if (hasHost && !triSet.has(x) && !triSet.has(y)) {
        for (const af of facts) {
          if (af.k !== "angle" || af.vertex !== apex || !af.arms || af.deg === undefined) continue;
          if (af.deg <= 5 || af.deg >= 175) continue;
          const otherArm = af.arms.find((arm) => arm !== apex && (arm === b0 || arm === b1));
          if (!otherArm) continue;
          const hasX = af.arms.includes(x);
          const hasY = af.arms.includes(y);
          if (hasX && !hasY) overrides.set(b0, af.deg);
          else if (hasY && !hasX) overrides.set(b1, af.deg);
        }
      }

      // 2) قطعة موازية من رأس المثلث مثل AD // BC في مثلث ABC مع m(∠DAC) = 40° (تبادل داخلي مع ∠C)
      if ((triSet.has(x) && !triSet.has(y)) || (triSet.has(y) && !triSet.has(x))) {
        const triEnd = triSet.has(x) ? x : y;
        const extEnd = triEnd === x ? y : x;
        for (const af of facts) {
          if (af.k !== "angle" || af.vertex !== triEnd || !af.arms || af.deg === undefined) continue;
          if (af.deg <= 5 || af.deg >= 175 || !af.arms.includes(extEnd)) continue;
          const baseVertex = af.arms.find((arm) => arm === b0 || arm === b1);
          if (baseVertex && !overrides.has(baseVertex)) overrides.set(baseVertex, af.deg);
        }
      }

      // 3) مستقيم موازٍ خارجي متصل بامتداد ضلع مثل AB // CD و C ∈ BE مع m(∠B) = 55° (تناظر مع ∠DCE)
      if (!triSet.has(x) && !triSet.has(y)) {
        const extCollinear = facts.find(
          (pt): pt is Extract<GeoFact, { k: "pointOn" }> =>
            pt.k === "pointOn" &&
            (pt.p === b0 || pt.p === b1) &&
            ((pt.seg[0] === apex && (pt.seg[1] === x || pt.seg[1] === y)) ||
              (pt.seg[1] === apex && (pt.seg[0] === x || pt.seg[0] === y)))
        );
        if (extCollinear) {
          const extVertex = extCollinear.seg[0] === apex ? extCollinear.seg[1] : extCollinear.seg[0];
          const bAng = facts.find(
            (af): af is Extract<GeoFact, { k: "angle" }> =>
              af.k === "angle" &&
              af.vertex === extVertex &&
              af.deg !== undefined &&
              af.deg > 5 &&
              af.deg < 175 &&
              (!af.arms || af.arms.includes(x) || af.arms.includes(y))
          );
          if (bAng?.deg !== undefined && !overrides.has(extCollinear.p)) {
            overrides.set(extCollinear.p, bAng.deg);
          }
        }
      }
    }
  }

  return overrides;
}
