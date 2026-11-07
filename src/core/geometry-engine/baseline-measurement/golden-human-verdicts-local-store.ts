/**
 * @file golden-human-verdicts-local-store.ts
 * @description مخزن أحكام المراجعة البشرية للأشكال (المرحلة 0.4): يحفظ حكم المعلم (معتمد/خاطئ) وملاحظته لكل حالة ذهبية
 * في التخزين المحلي للمتصفح، ويدمجها فوق الحالات، ويصدّرها بصيغة JSON تُوضع في
 * tests/golden-corpus/human-verdicts/human-verdicts.json ليلتقطها مقياس خط الأساس تلقائياً.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 100 سطر).
 */

import type { GoldenCorpusCase, GoldenHumanVerdict } from "./golden-corpus-case-types-ssot";

export const MODULE_ID_GOLDEN_HUMAN_VERDICTS_LOCAL_STORE = "golden_human_verdicts_local_store" as const;

export const GOLDEN_HUMAN_VERDICTS_STORAGE_KEY = "golden_geometry_human_verdicts_v1";

export interface GoldenHumanVerdictEntry {
  readonly verdict: GoldenHumanVerdict;
  readonly note?: string;
  readonly reviewedAtIso: string;
}

export type GoldenHumanVerdictMap = Readonly<Record<string, GoldenHumanVerdictEntry>>;

export function loadGoldenHumanVerdicts(): GoldenHumanVerdictMap {
  try {
    const raw = globalThis.localStorage?.getItem(GOLDEN_HUMAN_VERDICTS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GoldenHumanVerdictMap) : {};
  } catch {
    return {};
  }
}

export function saveGoldenHumanVerdicts(map: GoldenHumanVerdictMap): void {
  try {
    globalThis.localStorage?.setItem(GOLDEN_HUMAN_VERDICTS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* التخزين ممتلئ أو معطل: لا نكسر الواجهة */
  }
}

export function withVerdict(
  map: GoldenHumanVerdictMap,
  caseId: string,
  verdict: GoldenHumanVerdict,
  note?: string
): GoldenHumanVerdictMap {
  if (verdict === "unreviewed") {
    const rest = { ...map };
    delete rest[caseId];
    return rest;
  }
  return { ...map, [caseId]: { verdict, note: note?.trim() || undefined, reviewedAtIso: new Date().toISOString() } };
}

/** يدمج الأحكام فوق الحالات (الحكم المحلي يتقدم على ما في الملف). */
export function applyVerdictsToCases(
  cases: readonly GoldenCorpusCase[],
  map: GoldenHumanVerdictMap
): GoldenCorpusCase[] {
  return cases.map((c) => {
    const e = map[c.id];
    return e ? { ...c, humanVerdict: e.verdict, humanNotes: e.note, reviewedAtIso: e.reviewedAtIso } : c;
  });
}

export function exportVerdictsAsJson(map: GoldenHumanVerdictMap): string {
  return JSON.stringify(map, null, 2);
}

export function parseImportedVerdictsJson(text: string): GoldenHumanVerdictMap | null {
  try {
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
    return parsed as GoldenHumanVerdictMap;
  } catch {
    return null;
  }
}
