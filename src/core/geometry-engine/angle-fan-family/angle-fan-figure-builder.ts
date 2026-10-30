/**
 * @file angle-fan-figure-builder.ts
 * @description باني الشكل القياسي (`CanonicalGeometryFigureIR`) لعائلة مراوح الأشعة والزوايا (Angle-Fan Figure Builder).
 * يحول اتجاهات الأشعة المحلولة إلى رؤوس وأشعة وأقواس زوايا ومربعات تعامد وعلامات تنصيف متجهية دقيقة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 140 سطراً).
 */

import type {
  CanonicalAngleNode,
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
} from "@/core/ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "@/core/ssot/numeral-and-unit-ssot";
import { toDisplayLabel } from "../fact-compositor/geo-label-utils";
import { extractAngleFanSpecFromDescription } from "./angle-fan-fact-extractor";
import {
  minorAngleDiffDeg,
  solveAngleFanDirections,
} from "./angle-fan-direction-solver";

export const MODULE_ID_ANGLE_FAN_FIGURE_BUILDER =
  "angle_fan_figure_builder" as const;

const FAN_CENTER_X = 100;
const FAN_CENTER_Y = 100;
const FAN_RAY_RADIUS = 75;

/**
 * يبني `CanonicalGeometryFigureIR` من وصف نصي لمسألة زوايا وأشعة، أو يعيد `null` إن لم يكن الشكل مروحة زوايا.
 */
export function composeAngleFanFigureFromDescription(
  description: string,
  figureId: string,
  notation: MathNotationLanguage = "arabic"
): CanonicalGeometryFigureIR | null {
  const spec = extractAngleFanSpecFromDescription(description);
  if (!spec) return null;

  const layout = solveAngleFanDirections(spec);
  const keyId = (k: string) => `${figureId}_v_${k}`;

  const vertices: CanonicalVertexNode[] = [
    {
      id: keyId(spec.vertex),
      label: toDisplayLabel(spec.vertex, notation),
      position: { x: FAN_CENTER_X, y: FAN_CENTER_Y },
    },
  ];

  for (const r of spec.rays) {
    const deg = layout.rayAnglesDeg.get(r) ?? 0;
    const rad = (deg * Math.PI) / 180;
    vertices.push({
      id: keyId(r),
      label: toDisplayLabel(r, notation),
      position: {
        x: Number((FAN_CENTER_X + FAN_RAY_RADIUS * Math.cos(rad)).toFixed(2)),
        y: Number((FAN_CENTER_Y + FAN_RAY_RADIUS * Math.sin(rad)).toFixed(2)),
      },
    });
  }

  const segments: CanonicalSegmentNode[] = spec.rays.map((r, idx) => ({
    id: `${figureId}_s_${idx}`,
    fromVertexId: keyId(spec.vertex),
    toVertexId: keyId(r),
  }));

  const angles: CanonicalAngleNode[] = [];
  const addAngleNode = (
    arm1: string,
    arm2: string,
    extra: Partial<CanonicalAngleNode>
  ) => {
    angles.push({
      id: `${figureId}_ang_${angles.length}`,
      vertexId: keyId(spec.vertex),
      arm1VertexId: keyId(arm1),
      arm2VertexId: keyId(arm2),
      ...extra,
    });
  };

  for (const [p1, p2] of spec.perpPairs) {
    addAngleNode(p1, p2, { isRightAngle: true, degrees: 90 });
  }

  for (const ang of layout.evaluatedAngles) {
    const isPureRight = Math.abs(ang.degrees - 90) < 0.5 && ang.rawLabel === "90°";
    if (isPureRight) {
      const alreadyPerp = spec.perpPairs.some(
        ([x, y]) =>
          (x === ang.arm1 && y === ang.arm2) || (x === ang.arm2 && y === ang.arm1)
      );
      if (!alreadyPerp) {
        addAngleNode(ang.arm1, ang.arm2, { isRightAngle: true, degrees: 90 });
      }
      continue;
    }
    addAngleNode(ang.arm1, ang.arm2, {
      degrees: Number(ang.degrees.toFixed(1)),
      degreesLabel: ang.rawLabel,
    });
  }

  spec.bisectors.forEach((bis, bIdx) => {
    const a1 = layout.rayAnglesDeg.get(bis.arm1) ?? 0;
    const a2 = layout.rayAnglesDeg.get(bis.arm2) ?? 0;
    const halfDeg = Number((minorAngleDiffDeg(a1, a2) / 2).toFixed(1));
    const markSymbol = bIdx % 2 === 0 ? "dot" : "cross";
    for (const [u, v] of [
      [bis.arm1, bis.bisectorRay],
      [bis.bisectorRay, bis.arm2],
    ] as const) {
      const exists = angles.some(
        (x) =>
          (x.arm1VertexId === keyId(u) && x.arm2VertexId === keyId(v)) ||
          (x.arm1VertexId === keyId(v) && x.arm2VertexId === keyId(u))
      );
      if (!exists) {
        addAngleNode(u, v, { degrees: halfDeg, markSymbol, arcCount: 1 });
      }
    }
  });

  return {
    figureId,
    familyId: "triangle_family",
    branchId:
      spec.perpPairs.length > 0
        ? "triangle_right_pythagoras"
        : "triangle_interior_exterior_bisector",
    titleArabic: description.slice(0, 70),
    notationLanguage: notation,
    vertices,
    segments,
    angles,
    polygons: [],
  };
}
