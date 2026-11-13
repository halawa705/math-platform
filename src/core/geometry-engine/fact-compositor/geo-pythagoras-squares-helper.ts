/**
 * @file geo-pythagoras-squares-helper.ts
 * @description بناء المربعات المنشأة على أضلاع المثلث وشارات مساحتها الداخلية لحقائق `areaOnSide` (نظرية فيثاغورس والمساحات).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 100 سطراً).
 */
import type {
  CanonicalInteriorBadgeNode,
  CanonicalSegmentNode,
  CanonicalShadedRegionNode,
  CanonicalVertexNode,
} from "@/core/ssot/geometry-archetype-ssot";
import type { GeoFact } from "./geo-fact-types";
import type { PlacedPolygon } from "./geo-shape-placers";
import type { Vec2 } from "./geo-vector-math";

export const MODULE_ID_GEO_PYTHAGORAS_SQUARES_HELPER = "geo_pythagoras_squares_helper" as const;

export function buildOutwardAreaSquaresForFacts(params: {
  readonly facts: readonly GeoFact[];
  readonly points: ReadonlyMap<string, Vec2>;
  readonly polygons: readonly PlacedPolygon[];
  readonly figureId: string;
}): {
  readonly vertices: readonly CanonicalVertexNode[];
  readonly segments: readonly CanonicalSegmentNode[];
  readonly interiorBadges: readonly CanonicalInteriorBadgeNode[];
  readonly shadedRegions: readonly CanonicalShadedRegionNode[];
} {
  const areaFacts = params.facts.filter((f): f is Extract<GeoFact, { k: "areaOnSide" }> => f.k === "areaOnSide");
  if (areaFacts.length === 0) {
    return { vertices: [], segments: [], interiorBadges: [], shadedRegions: [] };
  }

  const vertices: CanonicalVertexNode[] = [];
  const segments: CanonicalSegmentNode[] = [];
  const interiorBadges: CanonicalInteriorBadgeNode[] = [];
  const shadedRegions: CanonicalShadedRegionNode[] = [];

  const allPts = [...params.points.values()];
  const fallbackCenter = allPts.reduce(
    (acc, p) => ({ x: acc.x + p.x / Math.max(allPts.length, 1), y: acc.y + p.y / Math.max(allPts.length, 1) }),
    { x: 0, y: 0 }
  );

  areaFacts.forEach((f, idx) => {
    const [u, v] = f.seg;
    const U = params.points.get(u);
    const V = params.points.get(v);
    if (!U || !V) return;
    const sideLen = Math.hypot(V.x - U.x, V.y - U.y);
    if (sideLen <= 1e-6) return;

    const hostTri = params.polygons.find((p) => p.labels.includes(u) && p.labels.includes(v));
    const oppLabel = hostTri?.labels.find((l) => l !== u && l !== v);
    const refPt = (oppLabel ? params.points.get(oppLabel) : undefined) ?? fallbackCenter;

    let nx = -(V.y - U.y) / sideLen;
    let ny = (V.x - U.x) / sideLen;
    const midX = (U.x + V.x) / 2;
    const midY = (U.y + V.y) / 2;
    if ((refPt.x - midX) * nx + (refPt.y - midY) * ny > 0) {
      nx = -nx;
      ny = -ny;
    }

    const p3Pos: Vec2 = { x: V.x + nx * sideLen, y: V.y + ny * sideLen };
    const p4Pos: Vec2 = { x: U.x + nx * sideLen, y: U.y + ny * sideLen };
    const p3Id = `${params.figureId}_sq_${idx}_v1`;
    const p4Id = `${params.figureId}_sq_${idx}_v2`;
    const uId = `${params.figureId}_v_${u}`;
    const vId = `${params.figureId}_v_${v}`;

    vertices.push(
      { id: p3Id, label: "", position: p3Pos, hideVertexDot: true },
      { id: p4Id, label: "", position: p4Pos, hideVertexDot: true }
    );
    segments.push(
      { id: `${params.figureId}_sq_${idx}_s1`, fromVertexId: vId, toVertexId: p3Id },
      { id: `${params.figureId}_sq_${idx}_s2`, fromVertexId: p3Id, toVertexId: p4Id },
      { id: `${params.figureId}_sq_${idx}_s3`, fromVertexId: p4Id, toVertexId: uId }
    );
    shadedRegions.push({
      id: `${params.figureId}_sq_${idx}_region`,
      vertexIds: [uId, vId, p3Id, p4Id],
      fillColorHex: idx % 2 === 0 ? "#e0f2fe" : "#fef3c7",
      fillOpacity: 0.35,
    });
    interiorBadges.push({
      id: `${params.figureId}_sq_${idx}_badge`,
      text: `${f.area} ${f.unit ?? "سم²"}`,
      position: {
        x: (U.x + V.x + p3Pos.x + p4Pos.x) / 4,
        y: (U.y + V.y + p3Pos.y + p4Pos.y) / 4,
      },
      badgeType: "area",
      labelKind: "given",
    });
  });

  return { vertices, segments, interiorBadges, shadedRegions };
}
