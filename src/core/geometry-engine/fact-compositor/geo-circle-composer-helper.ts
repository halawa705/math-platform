/**
 * @file geo-circle-composer-helper.ts
 * @description مساعد تركيب أشكال الدائرة (G-7): المركز، النقاط على المحيط، الأوتار، الأقطار، والمماسات.
 */
import type { CanonicalAngleNode, CanonicalGeometryFigureIR, CanonicalSegmentNode, CanonicalVertexNode } from "@/core/ssot/geometry-archetype-ssot";
import type { GeoFact } from "./geo-fact-types";
import { pairKey, toDisplayLabel } from "./geo-label-utils";
import { footOfPerpendicular, vAdd, vScale, type Vec2 } from "./geo-vector-math";

export const MODULE_ID_GEO_CIRCLE_COMPOSER_HELPER = "geo_circle_composer_helper" as const;

const CIRCLE_ANGLES_DEG = [90, 210, 330, 150, 30, 270];
const rad = (d: number) => (d * Math.PI) / 180;

export function composeCircleFigureFromFacts(
  facts: readonly GeoFact[],
  lengths: ReadonlyMap<string, { readonly text: string; readonly numeric?: number }>,
  description: string,
  figureId: string,
  notation: "english" | "arabic"
): CanonicalGeometryFigureIR | null {
  const circleFact = facts.find((f) => f.k === "circle");
  if (!circleFact || circleFact.k !== "circle") return null;

  const radiusFact = facts.find((f) => f.k === "radius");
  const r = circleFact.radius ?? (radiusFact && radiusFact.k === "radius" ? radiusFact.r : 5);
  const centerKey = circleFact.center;
  const points = new Map<string, Vec2>([[centerKey, { x: 0, y: 0 }]]);
  const rimAngles = new Map<string, number>();
  let angleIdx = 0;

  const ensureRimPoint = (k: string, customAngleDeg?: number) => {
    if (points.has(k)) return;
    const deg = customAngleDeg ?? CIRCLE_ANGLES_DEG[angleIdx++ % CIRCLE_ANGLES_DEG.length];
    rimAngles.set(k, deg);
    points.set(k, { x: r * Math.cos(rad(deg)), y: r * Math.sin(rad(deg)) });
  };

  for (const f of facts) {
    if (f.k === "onCircle") f.labels.forEach((l) => ensureRimPoint(l));
    else if (f.k === "diameter") {
      const [a, b] = f.seg;
      ensureRimPoint(a);
      const degA = rimAngles.get(a) ?? 180;
      ensureRimPoint(b, degA + 180);
    } else if (f.k === "chord") {
      ensureRimPoint(f.seg[0]);
      ensureRimPoint(f.seg[1]);
    }
  }

  // Ensure at least one rim point so the SVG projector can compute radius
  if (points.size === 1) {
    ensureRimPoint("A", 0);
  }

  const keyId = (k: string) => (k === centerKey ? `${figureId}_center_${k}` : `${figureId}_v_${k}`);
  const segments: CanonicalSegmentNode[] = [];
  const angles: CanonicalAngleNode[] = [];
  const pushSeg = (a: string, b: string, dashed?: boolean) => {
    if (segments.some((s) => pairKey(s.fromVertexId, s.toVertexId) === pairKey(keyId(a), keyId(b)))) return;
    const len = lengths.get(pairKey(a, b));
    segments.push({
      id: `${figureId}_s_${segments.length}`,
      fromVertexId: keyId(a),
      toVertexId: keyId(b),
      ...(len ? { lengthLabel: { value: len.numeric ?? len.text, unit: "سم" } } : {}),
      ...(dashed ? { strokeStyle: "dashed" as const } : {}),
    });
  };

  for (const f of facts) {
    if (f.k === "chord" || f.k === "diameter" || f.k === "draw") {
      ensureRimPoint(f.seg[0]);
      ensureRimPoint(f.seg[1]);
      pushSeg(f.seg[0], f.seg[1]);
    } else if (f.k === "tangent") {
      const at = f.at;
      const other = f.seg[0] === at ? f.seg[1] : f.seg[0];
      ensureRimPoint(at);
      const deg = rimAngles.get(at) ?? 90;
      const P = points.get(at)!;
      const dir = { x: -Math.sin(rad(deg)), y: Math.cos(rad(deg)) };
      points.set(other, vAdd(P, vScale(dir, 0.6 * r)));
      pushSeg(centerKey, at, true);
      pushSeg(at, other);
      angles.push({
        id: `${figureId}_ang_${angles.length}`,
        vertexId: keyId(at),
        arm1VertexId: keyId(centerKey),
        arm2VertexId: keyId(other),
        isRightAngle: true,
        degrees: 90,
      });
    } else if (f.k === "perp") {
      let [apex, foot] = f.a;
      if (f.foot) foot = f.foot;
      const [b0, b1] = f.b;
      ensureRimPoint(b0);
      ensureRimPoint(b1);
      if (points.get(apex) && points.get(b0) && points.get(b1)) {
        points.set(foot, footOfPerpendicular(points.get(apex)!, points.get(b0)!, points.get(b1)!));
        pushSeg(apex, foot, true);
        angles.push({
          id: `${figureId}_ang_${angles.length}`,
          vertexId: keyId(foot),
          arm1VertexId: keyId(apex),
          arm2VertexId: keyId(b1),
          isRightAngle: true,
          degrees: 90,
        });
      }
    }
  }

  const vertices: CanonicalVertexNode[] = [...points.entries()].map(([k, position]) => ({
    id: keyId(k),
    label: toDisplayLabel(k, notation),
    position,
  }));

  return {
    figureId,
    familyId: "circle_family",
    branchId: "circle_base_radius_chord",
    titleArabic: description.slice(0, 60),
    notationLanguage: notation,
    vertices,
    segments,
    angles,
  };
}
