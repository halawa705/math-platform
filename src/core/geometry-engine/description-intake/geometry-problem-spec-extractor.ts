/**
 * @file geometry-problem-spec-extractor.ts
 * @description المستخرج المزدوج لمواصفة المسألة الهندسية المهيكلة (`GeometryProblemSpec` — المرحلة 3.1):
 * يستخرج الكائنات (`objects`)، العلاقات (`relations`)، المعطيات (`givens`)، والمطلوب (`asked`)
 * في مخطط JSON ثابت، ويدعم الاستخراج المزدوج المتوازي من نص المسألة ووسم `[رسم هندسي: ...]`
 * مع التحقق من توافقهما التام (Zero-DSL).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 240 سطراً).
 */

import type {
  GeometryProblemSpec,
  ProblemSpecGivenNode,
  ProblemSpecObjectNode,
  ProblemSpecRelationNode,
} from "../../ssot/geometry-archetype-ssot";
import { parseGeoFactString } from "../fact-compositor/geo-fact-parser";
import { splitDescriptionIntoFactStrings } from "../fact-compositor/geo-fact-splitter";
import type { GeoFact } from "../fact-compositor/geo-fact-types";
import { pairKey } from "../fact-compositor/geo-label-utils";
import { extractGeometryAskedSpecFromPrompt } from "../verification/geometry-asked-question-mark-resolver";
import { extractLinearEntityKinds } from "./linear-entity-kind-extractor";
import { combineProblemAndTagGeometryContext } from "./problem-geometry-context-extractor";

export const MODULE_ID_GEOMETRY_PROBLEM_SPEC_EXTRACTOR =
  "geometry_problem_spec_extractor" as const;

export interface DualProblemSpecExtractionResult {
  readonly spec: GeometryProblemSpec;
  readonly facts: readonly GeoFact[];
  readonly unparsedClauses: readonly string[];
  readonly dualSourcesAgree: boolean;
  readonly conflictReasons: readonly string[];
}

function buildProblemSpecFromFacts(
  facts: readonly GeoFact[],
  rawPrompt: string
): GeometryProblemSpec {
  const objects: ProblemSpecObjectNode[] = [];
  const relations: ProblemSpecRelationNode[] = [];
  const givens: ProblemSpecGivenNode[] = [];
  const seenObjects = new Set<string>();
  const seenPoints = new Set<string>();

  const ensurePoint = (pt: string) => {
    if (!pt || seenPoints.has(pt)) return;
    seenPoints.add(pt);
    objects.push({ kind: "point", id: pt });
  };

  const ensureSegment = (
    a: string,
    b: string,
    kind: "segment" | "ray" | "line" = "segment"
  ) => {
    ensurePoint(a);
    ensurePoint(b);
    const id = `${a}${b}`;
    const rev = `${b}${a}`;
    const existingIdx = objects.findIndex((o) => o.id === id || o.id === rev);
    if (existingIdx >= 0) {
      const prev = objects[existingIdx];
      if (
        (kind === "line" && prev.kind !== "line") ||
        (kind === "ray" && prev.kind === "segment")
      ) {
        objects[existingIdx] = { kind, id, vertices: [a, b] };
      }
      return;
    }
    seenObjects.add(id);
    objects.push({ kind, id, vertices: [a, b] });
  };

  for (const f of facts) {
    if (f.k === "triangle") {
      f.labels.forEach(ensurePoint);
      const id = f.labels.join("");
      if (!seenObjects.has(id)) {
        seenObjects.add(id);
        objects.push({
          kind: "triangle",
          id,
          vertices: f.labels,
          subtype: f.equilateral
            ? "equilateral"
            : f.isoApex
              ? "isosceles"
              : f.right
                ? "right"
                : "general",
        });
      }
      if (f.right) {
        const others = f.labels.filter((l) => l !== f.right);
        relations.push({
          kind: "right_angle",
          at: f.right,
          targets: [`${f.right}${others[0]}`, `${f.right}${others[1]}`],
        });
      }
      if (f.isoApex) {
        const legs = f.labels.filter((l) => l !== f.isoApex);
        if (legs.length === 2) {
          relations.push({
            kind: "equal_length",
            targets: [`${f.isoApex}${legs[0]}`, `${f.isoApex}${legs[1]}`],
          });
        }
      }
    } else if (f.k === "quad") {
      f.labels.forEach(ensurePoint);
      const id = f.labels.join("");
      if (!seenObjects.has(id)) {
        seenObjects.add(id);
        objects.push({
          kind: "quadrilateral",
          id,
          vertices: f.labels,
          subtype: f.kind,
        });
      }
    } else if (f.k === "polygon") {
      f.labels.forEach(ensurePoint);
      const id = f.labels.join("");
      if (!seenObjects.has(id)) {
        seenObjects.add(id);
        objects.push({
          kind: "polygon",
          id,
          vertices: f.labels,
          subtype: f.concave ? "concave" : f.regular ? "regular" : "general",
        });
      }
    } else if (f.k === "circle") {
      ensurePoint(f.center);
      const id = `circle_${f.center}`;
      if (!seenObjects.has(id)) {
        seenObjects.add(id);
        objects.push({ kind: "circle", id, center: f.center });
      }
      if (f.radius !== undefined) {
        givens.push({
          target: `r_${f.center}`,
          value: String(f.radius),
          numericValue: f.radius,
          unit: f.unit,
        });
      }
    } else if (f.k === "radius") {
      givens.push({
        target: "r",
        value: String(f.r),
        numericValue: f.r,
        unit: f.unit,
      });
    } else if (f.k === "onCircle") {
      f.labels.forEach(ensurePoint);
      relations.push({ kind: "on_circle", targets: f.labels });
    } else if (f.k === "chord" || f.k === "diameter") {
      ensureSegment(f.seg[0], f.seg[1]);
    } else if (f.k === "tangent") {
      ensureSegment(f.seg[0], f.seg[1], f.lineKind ?? "segment");
      relations.push({
        kind: "tangent",
        at: f.at,
        targets: [`${f.seg[0]}${f.seg[1]}`],
      });
    } else if (f.k === "draw") {
      ensureSegment(f.seg[0], f.seg[1], f.lineKind ?? "segment");
    } else if (f.k === "collinear") {
      f.labels.forEach(ensurePoint);
    } else if (f.k === "length") {
      ensureSegment(f.seg[0], f.seg[1]);
      givens.push({
        target: `${f.seg[0]}${f.seg[1]}`,
        value: f.text,
        // القيمة الرمزية لا تستخدم رقم المقياس الوهمي (5) في فحص التعارض الرقمي
        numericValue: f.symbolic ? undefined : f.numeric,
        unit: f.unit,
      });
    } else if (f.k === "equal") {
      ensureSegment(f.a[0], f.a[1]);
      ensureSegment(f.b[0], f.b[1]);
      relations.push({
        kind: "equal_length",
        targets: [`${f.a[0]}${f.a[1]}`, `${f.b[0]}${f.b[1]}`],
      });
    } else if (f.k === "angle") {
      ensurePoint(f.vertex);
      if (f.arms) f.arms.forEach(ensurePoint);
      const targetKey = f.arms ? f.arms.join("") : f.vertex;
      if (f.right) {
        relations.push({ kind: "right_angle", at: f.vertex, targets: [targetKey] });
      }
      if (f.deg !== undefined || f.text) {
        givens.push({
          target: `∠${targetKey}`,
          value: f.text ?? String(f.deg),
          numericValue: f.deg,
          unit: "درجة",
        });
      }
    } else if (f.k === "midpoint") {
      ensurePoint(f.p); ensureSegment(f.seg[0], f.seg[1]);
      relations.push({ kind: "midpoint", at: f.p, targets: [`${f.seg[0]}${f.seg[1]}`] });
    } else if (f.k === "pointOn") {
      ensurePoint(f.p); ensureSegment(f.seg[0], f.seg[1]);
      relations.push({ kind: "point_on", at: f.p, targets: [`${f.seg[0]}${f.seg[1]}`] });
    } else if (f.k === "parallel") {
      ensureSegment(f.a[0], f.a[1], f.lineKindA ?? "segment");
      ensureSegment(f.b[0], f.b[1], f.lineKindB ?? "segment");
      relations.push({ kind: "parallel", targets: [`${f.a[0]}${f.a[1]}`, `${f.b[0]}${f.b[1]}`] });
    } else if (f.k === "perp") {
      ensureSegment(f.a[0], f.a[1], f.lineKindA ?? "segment");
      ensureSegment(f.b[0], f.b[1], f.lineKindB ?? "segment");
      relations.push({ kind: "perpendicular", at: f.foot, targets: [`${f.a[0]}${f.a[1]}`, `${f.b[0]}${f.b[1]}`] });
    } else if (f.k === "bisector") {
      ensureSegment(f.seg[0], f.seg[1], f.lineKind ?? "ray");
      relations.push({ kind: "bisector", at: f.vertex, targets: [`${f.seg[0]}${f.seg[1]}`] });
    } else if (f.k === "median") {
      ensureSegment(f.seg[0], f.seg[1]);
      relations.push({ kind: "median", targets: [`${f.seg[0]}${f.seg[1]}`] });
    } else if (f.k === "intersect") {
      ensurePoint(f.p);
      ensureSegment(f.a[0], f.a[1], f.lineKindA ?? "segment");
      ensureSegment(f.b[0], f.b[1], f.lineKindB ?? "segment");
      relations.push({ kind: "intersect", at: f.p, targets: [`${f.a[0]}${f.a[1]}`, `${f.b[0]}${f.b[1]}`] });
    } else if (f.k === "similarity") {
      relations.push({ kind: "similarity", targets: [f.tri1.join(""), f.tri2.join("")] });
    } else if (f.k === "congruence") {
      relations.push({ kind: "congruence", targets: [f.tri1.join(""), f.tri2.join("")] });
    }
  }

  return {
    objects,
    relations,
    givens,
    asked: extractGeometryAskedSpecFromPrompt(rawPrompt),
  };
}

/**
 * يستخرج `GeometryProblemSpec` بالمسار المزدوج من نص المسألة ووسم الرسم ويتحقق من عدم تعارضهما.
 */
export function extractGeometryProblemSpecDual(
  rawProblemOrCombined: string,
  explicitGeometryTag?: string
): DualProblemSpecExtractionResult {
  const combined = combineProblemAndTagGeometryContext(explicitGeometryTag, rawProblemOrCombined);
  const directClauses = splitDescriptionIntoFactStrings(rawProblemOrCombined);
  const combinedClauses = splitDescriptionIntoFactStrings(combined);
  const allClauses = Array.from(new Set([...directClauses, ...combinedClauses]));
  const facts: GeoFact[] = [];
  const unparsedClauses: string[] = [];
  for (const c of allClauses) {
    const f = parseGeoFactString(c);
    if (f) facts.push(f);
    else unparsedClauses.push(c);
  }
  const linearKindMap = extractLinearEntityKinds(rawProblemOrCombined, explicitGeometryTag);
  const baseSpec = buildProblemSpecFromFacts(facts, rawProblemOrCombined);
  const upgradedObjects = baseSpec.objects.map((o) => {
    if (o.kind === "segment" && o.vertices && o.vertices.length === 2) {
      const k = linearKindMap.get(pairKey(o.vertices[0], o.vertices[1]));
      if (k && k.kind !== "segment") return { ...o, kind: k.kind, vertices: [k.from, k.to] };
    }
    return o;
  });
  for (const specEntry of linearKindMap.values()) {
    const pk = pairKey(specEntry.from, specEntry.to);
    if (!upgradedObjects.some((o) => o.vertices?.length === 2 && pairKey(o.vertices[0], o.vertices[1]) === pk)) {
      upgradedObjects.push({ kind: specEntry.kind, id: `${specEntry.from}${specEntry.to}`, vertices: [specEntry.from, specEntry.to] });
    }
  }
  const spec: GeometryProblemSpec = { ...baseSpec, objects: upgradedObjects };
  const conflictReasons: string[] = [];
  const numericByTarget = new Map<string, number>();
  for (const g of spec.givens) {
    if (g.numericValue === undefined) continue;
    const prev = numericByTarget.get(g.target);
    if (prev !== undefined && Math.abs(prev - g.numericValue) > 1e-6) {
      conflictReasons.push(`تعارض في قيمة المعطى (${g.target}): ورد بقيمتين مختلفتين (${prev}) و (${g.numericValue}).`);
    }
    numericByTarget.set(g.target, g.numericValue);
  }
  return { spec, facts, unparsedClauses, dualSourcesAgree: conflictReasons.length === 0, conflictReasons };
}
