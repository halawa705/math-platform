/**
 * @file linear-entity-kind-extractor.ts
 * @description مستخرج نوع الكيان الخطي (قطعة مستقيمة / شعاع / خط مستقيم) واتجاه الشعاع من النص الخام وLaTeX قبل التطبيع.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 140 سطراً).
 */

import { healFourRaysHallucination } from "@/core/ingestion/notebooklm-citation-latex-sanitizer";
import { pairKey, parseLabelList } from "../fact-compositor/geo-label-utils";

export const MODULE_ID_LINEAR_ENTITY_KIND_EXTRACTOR =
  "linear_entity_kind_extractor" as const;

export type LinearEntityKind = "segment" | "ray" | "line";

export interface LinearEntitySpec {
  readonly kind: LinearEntityKind;
  readonly from: string;
  readonly to: string;
}

export type LinearEntityKindMap = ReadonlyMap<string, LinearEntitySpec>;

const KIND_PRIORITY: Record<LinearEntityKind, number> = {
  segment: 1,
  ray: 2,
  line: 3,
};

const PAIR_TOKEN = "([A-Za-z]{2}|[أ-ي]ـ?\\s*[أ-ي]ـ?)";

function registerLinearPair(
  map: Map<string, LinearEntitySpec>,
  rawPair: string,
  kind: LinearEntityKind,
  reverseDirection = false
): void {
  const pts = parseLabelList(rawPair.replace(/[\u064B-\u0652\u0670]/g, "").trim());
  if (!pts || pts.length !== 2 || pts[0] === pts[1]) return;
  const from = reverseDirection ? pts[1] : pts[0];
  const to = reverseDirection ? pts[0] : pts[1];
  const key = pairKey(from, to);
  const prev = map.get(key);
  if (!prev || KIND_PRIORITY[kind] >= KIND_PRIORITY[prev.kind]) {
    map.set(key, { kind, from, to });
  }
}

/**
 * يستخرج خريطة نوع كل كيان خطي (شعاع / مستقيم / قطعة مستقيمة) واتجاهه من النص الخام قبل إزالة أغلفة LaTeX.
 */
export function extractLinearEntityKinds(
  ...rawTexts: readonly (string | undefined)[]
): LinearEntityKindMap {
  const map = new Map<string, LinearEntitySpec>();

  for (const raw of rawTexts) {
    if (!raw) continue;
    const text = healFourRaysHallucination(raw);

    // 1. أوامر LaTeX الصريحة قبل تجريدها
    for (const m of text.matchAll(/\\(?:overrightarrow|vec)\s*\{([^{}]+)\}/g)) {
      registerLinearPair(map, m[1], "ray", false);
    }
    for (const m of text.matchAll(/\\overleftarrow\s*\{([^{}]+)\}/g)) {
      registerLinearPair(map, m[1], "ray", true);
    }
    for (const m of text.matchAll(/\\overleftrightarrow\s*\{([^{}]+)\}/g)) {
      registerLinearPair(map, m[1], "line", false);
    }
    for (const m of text.matchAll(/\\overline\s*\{([^{}]+)\}/g)) {
      registerLinearPair(map, m[1], "segment", false);
    }

    // 2. الصيغ العربية المفردة والمثناة الصريحة
    const rayRx = new RegExp(`(?:ال)?شعاع(?:ان|ين)?\\s+${PAIR_TOKEN}(?:\\s*(?:و|،|مع)\\s*${PAIR_TOKEN})?`, "gu");
    for (const m of text.matchAll(rayRx)) {
      registerLinearPair(map, m[1], "ray", false);
      if (m[2]) registerLinearPair(map, m[2], "ray", false);
    }

    const lineRx = new RegExp(`(?:الخط\\s+)?(?:ال)?مستقيم(?:ان|ين)?\\s+${PAIR_TOKEN}(?:\\s*(?:و|،|مع)\\s*${PAIR_TOKEN})?`, "gu");
    for (const m of text.matchAll(lineRx)) {
      registerLinearPair(map, m[1], "line", false);
      if (m[2]) registerLinearPair(map, m[2], "line", false);
    }

    const segRx = new RegExp(`(?:ال)?قطعة\\s*(?:ال?مستقيمة\\s*)?${PAIR_TOKEN}(?:\\s*(?:و|،|مع)\\s*${PAIR_TOKEN})?`, "gu");
    for (const m of text.matchAll(segRx)) {
      registerLinearPair(map, m[1], "segment", false);
      if (m[2]) registerLinearPair(map, m[2], "segment", false);
    }
  }

  return map;
}

/**
 * يحسب خصائص السهم والنوع لعقدة `CanonicalSegmentNode` بناءً على خريطة الكيانات الخطية.
 */
export function resolveSegmentLineSemantics(
  fromKey: string,
  toKey: string,
  kindMap?: LinearEntityKindMap,
  explicitKind?: LinearEntityKind
): {
  readonly isRay?: boolean;
  readonly isLine?: boolean;
  readonly arrowAtEnd?: boolean;
  readonly arrowAtStart?: boolean;
} {
  const entry = kindMap?.get(pairKey(fromKey, toKey));
  const kind = explicitKind ?? entry?.kind;
  if (!kind || kind === "segment") return {};
  if (kind === "line") {
    return { isLine: true, arrowAtStart: true, arrowAtEnd: true };
  }
  // ray
  if (entry && entry.from === toKey && entry.to === fromKey) {
    return { isRay: true, arrowAtStart: true };
  }
  return { isRay: true, arrowAtEnd: true };
}
