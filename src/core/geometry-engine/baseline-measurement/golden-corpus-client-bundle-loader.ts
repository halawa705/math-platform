/**
 * @file golden-corpus-client-bundle-loader.ts
 * @description تحميل المجموعة الذهبية داخل المتصفح (بدون fs) عبر استيراد ديناميكي لملفات JSON ذاتها،
 * فلا يوجد نسخ مكرر للبيانات. يُستخدم في واجهة المراجعة البشرية فقط.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 60 سطراً).
 */

import type { GoldenCorpusCase } from "./golden-corpus-case-types-ssot";

export const MODULE_ID_GOLDEN_CORPUS_CLIENT_BUNDLE_LOADER = "golden_corpus_client_bundle_loader" as const;

type Mod = { default: unknown };

const LOADERS: readonly (() => Promise<Mod>)[] = [
  () => import("../../../../tests/golden-corpus/geometry/prep-1-corpus.json"),
  () => import("../../../../tests/golden-corpus/geometry/prep-2-corpus.json"),
  () => import("../../../../tests/golden-corpus/geometry/prep-3-corpus.json"),
  () => import("../../../../tests/golden-corpus/geometry/primary-3-corpus.json"),
  () => import("../../../../tests/golden-corpus/geometry/primary-4-corpus.json"),
  () => import("../../../../tests/golden-corpus/geometry/primary-5-corpus.json"),
  () => import("../../../../tests/golden-corpus/geometry/primary-6-statistics-corpus.json"),
  () => import("../../../../tests/golden-corpus/geometry/seed-from-existing-golden-tests.json"),
];

export async function loadGoldenCorpusInBrowser(): Promise<GoldenCorpusCase[]> {
  const mods = await Promise.all(LOADERS.map((l) => l()));
  const out: GoldenCorpusCase[] = [];
  const seen = new Set<string>();
  for (const m of mods) {
    if (!Array.isArray(m.default)) continue;
    for (const c of m.default as GoldenCorpusCase[]) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      out.push(c);
    }
  }
  return out;
}
